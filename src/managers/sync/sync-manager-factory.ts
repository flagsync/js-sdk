import { EventManager, FsEvent } from '../../events/types';
import { FsSettings } from '../../config/types';
import { streamManager } from './stream-manager';
import { pollManager } from './poll-manager';
import { SyncManager } from './types';

const noop = () => {};

export function syncManagerFactory(
  settings: FsSettings,
  eventManager: EventManager,
): SyncManager {
  let manager: SyncManager;

  switch (settings.sync.type) {
    case 'poll':
      manager = pollManager(settings, eventManager);
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
