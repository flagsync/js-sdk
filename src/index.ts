import { storageManagerFactory } from './managers/storage/storage-manger-factory';
import { syncManagerFactory } from './managers/sync/sync-manager-factory';

import { FlagSyncConfig, FsSettings } from './config/types';
import { buildSettingsFromConfig } from './config/utils';

import { FsServiceError } from './api/error/service-error';
import { ServiceErrorFactory } from './api/error/service-error-factory';
import { apiClientFactory } from './api/clients/api-client';

import { eventManagerFactory } from './managers/events/event-manager-factory';
import { trackManagerFactory } from './managers/track/track-manager-factory';
import { FsEvent } from './managers/events/types';

export { FsServiceError };
export { ServiceErrorFactory };

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

  const eventManager = eventManagerFactory();
  const syncManager = syncManagerFactory(settings, eventManager);
  const storageManager = storageManagerFactory(settings, eventManager);
  const { impressionsManager } = trackManagerFactory(settings, eventManager);

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
      eventManager.emit(FsEvent.SDK_READY);
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
    eventManager.emit(FsEvent.ERROR, {
      type: 'api',
      error: e,
    });
  });

  function flag<T>(flagKey: string, defaultValue?: T): T {
    const flags = storageManager.get();
    const flagValue = flags[flagKey] ?? defaultValue ?? 'control';

    impressionsManager.track({
      flagKey,
      flagValue,
      timestamp: new Date().toISOString(),
    });

    return flagValue as T;
  }

  /**
   * TODO: Instead of XHR, Send beacons on kill
   *       https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon
   */
  let isExiting = false;
  function kill() {
    if (!isExiting) {
      isExiting = true;
      log.info(`${logPrefix}: SDK shutting down`);
      for (const eventKey in FsEvent) {
        eventManager.off(FsEvent[eventKey as keyof typeof FsEvent]);
      }
      syncManager.stop();
      impressionsManager.stop();
    } else {
      log.info(`${logPrefix}: already handling kill, skipping...`);
    }
  }

  /**
   * TODO: don't use beforeunload. use visibilitychange/pagehide with sendBeacon
   *       for flushing queues
   */
  if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', kill);
  } else {
    process.on('exit', kill); // Process termination event
    process.on('SIGINT', kill); // Signal handling (SIGINT)
    process.on('SIGTERM', kill); // Signal handling (SIGTERM)
  }

  return {
    core,
    on: eventManager.on,
    once: eventManager.once,
    kill,
    flag,
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
