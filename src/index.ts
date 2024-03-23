import { storageManagerFactory } from './managers/storage/storage-manger-factory';
import { syncManagerFactory } from './managers/sync/sync-manager-factory';
import { eventManagerFactory } from './events/event-manager-factory';
import { FsEvent } from './events/types';
import { FlagSyncConfig, FsSettings } from './config/types';
import { buildSettingsFromConfig } from './config/utils';
import { apiClientFactory } from './api/api-client';
import { FsServiceError } from './api/error/service-error';
import { processApiError } from './api/error/process-api-error';
import { SdkUserContext } from './api/data-contracts';

export { FsServiceError };

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
  const apiClient = apiClientFactory(settings);

  const context: SdkUserContext = {
    key: core.key,
    email: core.attributes?.email,
    custom: core.attributes ?? {},
  };

  const syncManager = syncManagerFactory(settings, eventManager, apiClient);
  const storageManager = storageManagerFactory(settings, eventManager);

  const initWithWithThrow = apiClient
    .sdkControllerInitContext({
      context,
    })
    .then(() =>
      apiClient.sdkControllerGetFlags({
        context,
      }),
    )
    .then((res) => {
      storageManager.set(res?.flags ?? {});
      log.debug('SDK ready');
      eventManager.emit(FsEvent.SDK_READY);
    })
    .catch(async (e: unknown) => {
      throw await processApiError(e);
    });

  const initWithCatch = initWithWithThrow.catch(async (e: unknown) => {
    const error = await processApiError(e);
    log.error('SDK init failed', [error.path, error.errorCode, error.message]);
    eventManager.emit(FsEvent.ERROR, {
      type: 'api',
      error,
    });
  });

  function flag<T>(flagKey: string, defaultValue?: T): T {
    const flags = storageManager.get();
    return flags[flagKey] ?? defaultValue ?? 'control';
  }

  function kill() {
    log.info('Destroying client instance');
    for (const eventKey in FsEvent) {
      eventManager.off(FsEvent[eventKey as keyof typeof FsEvent]);
    }
    syncManager.stop();
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
