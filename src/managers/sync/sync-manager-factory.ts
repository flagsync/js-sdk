import { EventManager } from '../../events/types';
import { FsSettings } from '../../config/types';
import { streamManager } from './stream-manager';
import { FlagSyncAPI } from '../../api/api';
import { pollManager } from './poll-manager';
import { SyncManager } from './types';

const noop = () => {};

export function syncManagerFactory(
  settings: FsSettings,
  eventManager: EventManager,
  apiClient: FlagSyncAPI<any>,
): SyncManager {
  if (settings.sync.type === 'off') {
    return {
      start: noop,
      stop: noop,
    };
  }
  if (settings.sync.type === 'stream') {
    return streamManager(settings, eventManager);
  }
  return pollManager(settings, eventManager, apiClient);
}
