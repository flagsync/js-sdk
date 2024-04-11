import { FsSettings } from '../../config/types';
import { pollManager } from './poll-manager';
import { SyncManager } from './types';
import { EventManager, FsEvent } from '../event/types';
import { streamManager } from './stream-manager';

const noop = () => {};

export function syncManagerFactory(
  settings: FsSettings,
  eventManager: EventManager,
): SyncManager {
  const { sync } = settings;

  let manager: SyncManager;

  switch (sync.type) {
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
