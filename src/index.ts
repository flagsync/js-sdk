import { FlagSyncConfig, FsFlagSet, FsSettings } from '~config/types';
import { buildSettingsFromConfig } from '~config/utils';

import { apiClientFactory } from '~api/clients/api-client';
import { FsServiceError } from '~api/error/service-error';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

import { eventManagerFactory } from '~managers/event/event-manager-factory';
import { FsEvent } from '~managers/event/types';
import { storageManagerFactory } from '~managers/storage/storage-manger-factory';
import { syncManagerFactory } from '~managers/sync/sync-manager-factory';
import { trackManagerFactory } from '~managers/track/track-manager-factory';

export { FsServiceError };
export { ServiceErrorFactory };
export * from '~config/types';
export type { LogLevel } from '~logger/types';

export type FsErrorSource = 'api' | 'sdk';
export type FsErrorEvent = {
  type: FsErrorSource;
  error: Error | FsServiceError;
};

const logPrefix = 'client';

function clientInstanceFactory(settings: FsSettings): () => FsClient {
  const instance = clientFactory(settings);

  return function client() {
    return instance;
  };
}

export type FsClient = ReturnType<typeof clientFactory>;

function clientFactory(settings: FsSettings) {
  const { core, log, context } = settings;

  const { sdk } = apiClientFactory(settings);

  const eventEmitter = eventManagerFactory();
  const syncManager = syncManagerFactory(settings, eventEmitter);
  const storageManager = storageManagerFactory(settings, eventEmitter);
  const trackManager = trackManagerFactory(settings, eventEmitter);

  const initWithWithThrow = sdk
    .sdkControllerInitContext({
      context,
    })
    .then(() =>
      sdk.sdkControllerGetFlags({
        context,
      }),
    )
    .then((res) => {
      storageManager.set(res?.flags ?? {});
      log.debug(`${logPrefix}: SDK ready`);
      eventEmitter.emit(FsEvent.SDK_READY);
    })
    .catch((e: unknown) => {
      throw ServiceErrorFactory.create(e);
    });

  const initWithCatch = initWithWithThrow.catch((e: FsServiceError) => {
    log.error(`${logPrefix}: SDK init failed`, [
      e.path,
      e.errorCode,
      e.message,
    ]);
    eventEmitter.emit(FsEvent.ERROR, {
      type: 'api',
      error: e,
    });
  });

  function flag<T>(flagKey: string, defaultValue?: T): T {
    if (!flagKey || typeof flagKey !== 'string') {
      return 'control' as T;
    }

    const flags = storageManager.get();
    const flagValue = flags[flagKey] ?? defaultValue ?? 'control';

    trackManager.impressionsManager.track({
      flagKey,
      flagValue,
    });

    return flagValue as T;
  }

  function flags(defaultValues: FsFlagSet = {}): FsFlagSet {
    const flags: FsFlagSet = {};
    const cached = storageManager.get();
    for (const flagKey in flags) {
      const flagValue = cached[flagKey] ?? defaultValues[flagKey] ?? 'control';
      flags[flagKey] = flagValue;
      trackManager.impressionsManager.track({
        flagKey,
        flagValue,
      });
    }
    return flags;
  }

  let isKilling = false;
  function kill() {
    if (!isKilling) {
      isKilling = true;
      log.info(`${logPrefix}: SDK shutting down`);
      for (const eventKey in FsEvent) {
        eventEmitter.off(FsEvent[eventKey as keyof typeof FsEvent]);
      }
      syncManager.stop();
      trackManager.stop();
      eventEmitter.stop();
    } else {
      log.info(`${logPrefix}: already handling kill, skipping...`);
    }
  }

  if (typeof window === 'undefined') {
    process.on('exit', kill); // Process termination event
    process.on('SIGINT', kill); // Signal handling (SIGINT)
    process.on('SIGTERM', kill); // Signal handling (SIGTERM)
  }

  return {
    core,
    flag,
    flags,
    kill,
    on: eventEmitter.on,
    once: eventEmitter.once,
    off: eventEmitter.off,
    track: trackManager.eventsManager.track,
    waitForReady: () => initWithCatch,
    waitForReadyCanThrow: () => initWithWithThrow,
    Event: FsEvent,
  };
}

export function FlagSyncFactory(config: FlagSyncConfig): {
  client: () => FsClient;
} {
  const settings = buildSettingsFromConfig(config);

  const client = clientInstanceFactory(settings);

  return {
    client,
  };
}
