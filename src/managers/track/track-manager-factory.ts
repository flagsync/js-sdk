import { FsSettings } from '../../config/types';
import { EventManager } from '../event/types';

import { TrackManager } from './types';
import { impressionsManagerFactory } from './impressions/impressions-manager-factory';
import { eventsManagerFactory } from './events/events-manager-factory';

export function trackManagerFactory(
  settings: FsSettings,
  eventManager: EventManager,
): TrackManager {
  const impressionsManager = impressionsManagerFactory(settings, eventManager);
  const eventsManager = eventsManagerFactory(settings, eventManager);

  return {
    eventsManager,
    impressionsManager,
  };
}
