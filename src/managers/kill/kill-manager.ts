import { FsSettings } from '~config/types.internal';

import { FsEvent, IEventManager } from '~managers/event/types';
import { IKillManager } from '~managers/kill/types';
import { ISyncManager } from '~managers/sync/types';
import { ITrackManager } from '~managers/track/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const format = formatMsg.bind(null, 'kill-manager');

export function killManager(
  settings: FsSettings,
  eventManager: IEventManager,
  syncManager: ISyncManager,
  trackManager: ITrackManager,
): IKillManager {
  const { log } = settings;

  let killing = false;

  function kill() {
    if (!killing) {
      killing = true;
      log.info(format(MESSAGE.KILL_KILLING));
      for (const eventKey in FsEvent) {
        eventManager.off(FsEvent[eventKey as keyof typeof FsEvent]);
      }
      syncManager.kill();
      trackManager.kill();
      eventManager.kill();
    } else {
      log.info(format(MESSAGE.KILL_ALREADY_KILLING));
    }
  }

  if (typeof window === 'undefined') {
    process.on('exit', kill); // Process termination event
    process.on('SIGINT', kill); // Signal handling (SIGINT)
    process.on('SIGTERM', kill); // Signal handling (SIGTERM)
  }

  return {
    kill,
  };
}
