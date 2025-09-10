import type { FsSettings } from '~config/types.internal';

import { Track } from '~api/clients/track-client';

import { FsEvent, IEventManager } from '~managers/event/types';
import { eventsManager } from '~managers/track/events/events-manager';
import type { IEventsManager } from '~managers/track/events/types';

export function eventsManagerFactory(
  settings: FsSettings,
  track: Track,
  eventManager: IEventManager,
): IEventsManager {
  const manager = eventsManager(settings, track, eventManager);

  eventManager.on(FsEvent.SDK_READY, () => {
    manager.start();
  });

  return manager;
}
