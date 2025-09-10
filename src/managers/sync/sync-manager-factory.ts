import { Platform, SyncType } from '~config/types';
import type { FsSettings } from '~config/types.internal';

import { FsEvent, IEventManager } from '~managers/event/types';
import { pollManager } from '~managers/sync/poll-manager';
import { streamManager } from '~managers/sync/stream-manager';
import type { ISyncManager } from '~managers/sync/types';
import { wsManager } from '~managers/sync/ws-manager';

const noop = () => {};

export function syncManagerFactory(
  settings: FsSettings,
  eventManager: IEventManager,
): ISyncManager {
  const { sync, platform } = settings;

  let manager: ISyncManager;

  if (platform === Platform.Browser) {
    switch (sync.type) {
      case SyncType.Poll:
        manager = pollManager(settings, eventManager);
        break;
      case SyncType.Sse:
        manager = streamManager(settings, eventManager);
        break;
      case SyncType.Ws:
        manager = wsManager(settings, eventManager);
        break;
      default:
        manager = {
          start: noop,
          kill: noop,
        };
        break;
    }
  } else {
    manager = {
      start: noop,
      kill: noop,
    };
  }

  eventManager.on(FsEvent.SDK_READY, () => {
    manager.start();
  });

  return manager;
}
