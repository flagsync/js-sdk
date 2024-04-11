import { FsSettings } from '~config/types';

import { IEventManager } from '~managers/event/types';
import { eventsManagerFactory } from '~managers/track/events/events-manager-factory';
import { impressionsManagerFactory } from '~managers/track/impressions/impressions-manager-factory';
import { TrackManager } from '~managers/track/types';

export function trackManagerFactory(
  settings: FsSettings,
  eventManager: IEventManager,
): TrackManager {
  const impressionsManager = impressionsManagerFactory(settings, eventManager);
  const eventsManager = eventsManagerFactory(settings, eventManager);

  return {
    eventsManager,
    impressionsManager,
  };
}
