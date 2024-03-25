import { storageManagerFactory } from './managers/storage/storage-manger-factory';
import { syncManagerFactory } from './managers/sync/sync-manager-factory';
import { eventManagerFactory } from './events/event-manager-factory';
import { FsEvent } from './events/types';
import { FlagSyncConfig, FsSettings } from './config/types';
import { buildSettingsFromConfig } from './config/utils';

import { FsServiceError } from './api/error/service-error';
import { SdkUserContext } from './api/data-contracts';
import { ServiceErrorFactory } from './api/error/service-error-factory';
import { apiClientFactory } from './api/clients/api-client';
import { impressionsManagerFactory } from './managers/impressions/impressions-manager-factory';

export { FsServiceError };
export { ServiceErrorFactory };

export type ErrorSource = 'api' | 'sdk';
export type ErrorEvent = {
  type: ErrorSource;
  error: Error | FsServiceError;
};

function clientInstanceFactory(settings: FsSettings): () => FsClient {
  const instance = clientFactory(settings);

  return function client() {
    return instance;
  };
}

export type FsClient = ReturnType<typeof clientFactory>;

function clientFactory(settings: FsSettings) {
  const { core, log } = settings;

  const eventManager = eventManagerFactory();
  const { sdk } = apiClientFactory(settings);

  const context: SdkUserContext = {
    key: core.key,
    email: core.attributes?.email,
    custom: core.attributes ?? {},
  };

  const syncManager = syncManagerFactory(settings, eventManager);
  const storageManager = storageManagerFactory(settings, eventManager);
  const impressionsManager = impressionsManagerFactory(settings, eventManager);

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
      log.debug('SDK ready');
      eventManager.emit(FsEvent.SDK_READY);
    })
    .catch((e: unknown) => {
      throw ServiceErrorFactory.create(e);
    });

  const initWithCatch = initWithWithThrow.catch((e: FsServiceError) => {
    log.error('SDK init failed', [e.path, e.errorCode, e.message]);
    eventManager.emit(FsEvent.ERROR, {
      type: 'api',
      error: e,
    });
  });

  function flag<T>(flagKey: string, defaultValue?: T): T {
    const flags = storageManager.get();
    const flagValue = flags[flagKey] ?? defaultValue ?? 'control';
    impressionsManager.enqueue({ flagKey, flagValue });
    return flagValue as T;
  }

  function kill() {
    log.info('Destroying client instance');
    for (const eventKey in FsEvent) {
      eventManager.off(FsEvent[eventKey as keyof typeof FsEvent]);
    }
    syncManager.stop();
    impressionsManager.stop();
  }

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
