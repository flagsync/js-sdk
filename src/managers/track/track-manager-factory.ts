import { FsSettings } from '../../config/types';
import { EventManager } from '../events/types';

import { TrackManager } from './types';
import { impressionsManagerFactory } from './impressions/impressions-manager-factory';

export function trackManagerFactory(
  settings: FsSettings,
  eventManager: EventManager,
): TrackManager {
  const impressionsManager = impressionsManagerFactory(settings, eventManager);

  return {
    impressionsManager,
  };
}
