import { IServiceManager } from '~sdk/managers/service/types';

import { ApiClientFactory } from '~api/api-client-factory';

import { IEventManager } from '~managers/event/types';
import { IFlagManager } from '~managers/flag/types';
import { IKillManager } from '~managers/kill/types';
import { IStoreManager } from '~managers/storage/types';
import { ISyncManager } from '~managers/sync/types';
import { ITrackManager } from '~managers/track/types';

import { ServiceKeys } from './services';

export type ServiceTypes = {
  [ServiceKeys.ApiClient]: ApiClientFactory;
  [ServiceKeys.EventManager]: IEventManager;
  [ServiceKeys.SyncManager]: ISyncManager;
  [ServiceKeys.StorageManager]: IStoreManager;
  [ServiceKeys.TrackManager]: ITrackManager;
  [ServiceKeys.FlagManager]: IFlagManager;
  [ServiceKeys.ServiceManager]: IServiceManager;
  [ServiceKeys.KillManager]: IKillManager;
};
