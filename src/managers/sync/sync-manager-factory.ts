import { SyncType } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { FsEvent, IEventManager } from '~managers/event/types';
import { pollManager } from '~managers/sync/poll-manager';
import { streamManager } from '~managers/sync/stream-manager';
import { ISyncManager } from '~managers/sync/types';

const noop = () => {};

export function syncManagerFactory(
  settings: FsSettings,
  eventManager: IEventManager,
): ISyncManager {
  const { sync } = settings;

  let manager: ISyncManager;

  switch (sync.type) {
    case SyncType.Poll:
      manager = pollManager(settings, eventManager);
      break;
    case SyncType.Stream:
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
