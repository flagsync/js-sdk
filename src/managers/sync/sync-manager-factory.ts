import { EventManager, FsEvent } from '../../events/types';
import { FsSettings } from '../../config/types';
import { streamManager } from './stream-manager';
import { pollManager } from './poll-manager';
import { SyncManager } from './types';
import { Sdk } from '../../api/Sdk';

const noop = () => {};

export function syncManagerFactory(
  settings: FsSettings,
  eventManager: EventManager,
  apiClient: Sdk<null>,
): SyncManager {
  let manager: SyncManager;

  switch (settings.sync.type) {
    case 'poll':
      manager = pollManager(settings, eventManager, apiClient);
      break;
    case 'stream':
      manager = streamManager(settings, eventManager);
      break;
    default:
      manager = {
        start: noop,
        stop: noop,
      };
      break;
  }

  eventManager.on(FsEvent.SDK_READY, () => {
    manager.start();
  });

  return manager;
}
