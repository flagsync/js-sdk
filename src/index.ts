import { SdkUserContext } from './api/api';

import { storageManagerFactory } from './managers/storage/storage-manger-factory';
import { syncManagerFactory } from './managers/sync/sync-manager-factory';
import { apiClientFactory } from './api/client';

import { eventManagerFactory } from './events/event-manager-factory';
import { FsEvent } from './events/types';

import { FlagSyncConfig, FsSettings } from './config/types';
import { buildSettingsFromConfig } from './config/utils';

export type ErrorSource = 'api' | 'sdk';
export type ErrorEvent = {
  type: ErrorSource;
  error: Error;
};

// remoteEvaluation: true / false --> run eval on server

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
    email: core.attributes.email,
    custom: core.attributes,
  };

  const syncManager = syncManagerFactory(settings, eventManager, apiClient);
  const storageManager = storageManagerFactory(settings, eventManager);

  apiClient.sdk
    .sdkControllerInitContext({
      context,
    })
    .then(() =>
      apiClient.sdk.sdkControllerGetFlags({
        context,
      }),
    )
    .then((res) => {
      storageManager.set(res?.data?.flags ?? {});
      log.info('SDK ready');
      eventManager.emit(FsEvent.SDK_READY);
    })
    .catch((e: unknown) => {
      if (e instanceof Response) {
        log.error('SDK init failed', [e.url, e.status, e.statusText]);
        eventManager.emit(FsEvent.ERROR, {
          type: 'sdk',
          error: new Error(`SDK init failed: ${e.status} ${e.statusText}`),
        });
        return;
      }

      const error = e as Error;

      log.error('SDK init failed', [error.message, error.stack]);
      eventManager.emit(FsEvent.ERROR, {
        type: 'sdk',
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

  syncManager.start();

  return {
    core,
    on: eventManager.on,
    once: eventManager.once,
    kill,
    flag,
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
