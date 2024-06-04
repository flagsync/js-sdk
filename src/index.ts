import { UNREADY_FLAG_VALUE } from '~config/constants';
import { FsConfig, FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';
import { buildSettingsFromConfig } from '~config/utils';

import { apiClientFactory } from '~api/clients/api-client';
import { FsServiceError } from '~api/error/service-error';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

import { eventManagerFactory } from '~managers/event/event-manager-factory';
import { FsEvent } from '~managers/event/types';
import { serviceManager } from '~managers/service/service-manager';
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
  const { core, log } = settings;

  const { sdk } = apiClientFactory(settings);

  const eventEmitter = eventManagerFactory();
  const syncManager = syncManagerFactory(settings, eventEmitter);
  const storageManager = storageManagerFactory(settings, eventEmitter);
  const trackManager = trackManagerFactory(settings, eventEmitter);
  const service = serviceManager(settings, sdk, storageManager, eventEmitter);

  function flag<T>(flagKey: string, defaultValue?: T): T {
    if (!flagKey || typeof flagKey !== 'string') {
      return UNREADY_FLAG_VALUE as T;
    }

    const flags = storageManager.get();
    const flagValue = flags[flagKey] ?? defaultValue ?? UNREADY_FLAG_VALUE;

    trackManager.impressionsManager.track({
      flagKey,
      flagValue,
    });

    return flagValue as T;
  }

  function flags(defaultValues: FsFlagSet = {}): FsFlagSet {
    const flags: FsFlagSet = {};
    const cached = storageManager.get();

    for (const flagKey in cached) {
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
    flagAsync: service.flagAsync,
    waitForReady: () => service.initWithCatch,
    waitForReadyCanThrow: () => service.initWithWithThrow,
    Event: FsEvent,
  };
}

export function FlagSyncFactory(config: FsConfig): {
  client: () => FsClient;
} {
  const settings = buildSettingsFromConfig(config);

  const client = clientInstanceFactory(settings);

  return {
    client,
  };
}
