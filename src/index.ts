import { FsConfig } from '~config/types';
import { FsSettings } from '~config/types.internal';
import { buildSettingsFromConfig } from '~config/utils';

import { apiClientFactory } from '~api/clients/api-client';
import { FsServiceError } from '~api/error/service-error';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

import { eventManagerFactory } from '~managers/event/event-manager-factory';
import { FsEvent } from '~managers/event/types';
import { flagManager } from '~managers/flag/flag-manager';
import { killManager } from '~managers/kill/kill-manager';
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

function clientInstanceFactory(settings: FsSettings): () => FsClient {
  const instance = clientFactory(settings);

  return function client() {
    return instance;
  };
}

export type FsClient = ReturnType<typeof clientFactory>;

function clientFactory(settings: FsSettings) {
  const { core } = settings;

  const { sdk } = apiClientFactory(settings);

  const eventManager = eventManagerFactory();
  const syncManager = syncManagerFactory(settings, eventManager);
  const storageManager = storageManagerFactory(settings, eventManager);
  const trackManager = trackManagerFactory(settings, eventManager);

  const service = serviceManager(settings, sdk, storageManager, eventManager);
  const killer = killManager(settings, eventManager, syncManager, trackManager);
  const flags = flagManager(storageManager, trackManager);

  const staticApi = {
    core,
    Event: FsEvent,
  };

  const externalApi = {
    flag: flags.flag,
    flags: flags.flags,
    kill: killer.kill,
    on: eventManager.on,
    once: eventManager.once,
    off: eventManager.off,
    track: trackManager.eventsManager.track,
    waitForReady: () => service.initWithCatch,
    waitForReadyCanThrow: () => service.initWithWithThrow,
  };

  return {
    ...staticApi,
    ...externalApi,
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
