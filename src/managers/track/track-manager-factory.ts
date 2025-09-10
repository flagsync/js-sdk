import type { FsSettings } from '~config/types.internal';

import { Track } from '~api/clients/track-client';

import type { IEventManager } from '~managers/event/types';
import { beaconManagerFactory } from '~managers/track/beacon/beacon-manager-factory';
import { eventsManagerFactory } from '~managers/track/events/events-manager-factory';
import { impressionsManagerFactory } from '~managers/track/impressions/impressions-manager-factory';
import type { ITrackManager } from '~managers/track/types';

export function trackManagerFactory(
  settings: FsSettings,
  track: Track,
  eventManager: IEventManager,
): ITrackManager {
  const impressionsManager = impressionsManagerFactory(
    settings,
    track,
    eventManager,
  );
  const eventsManager = eventsManagerFactory(settings, track, eventManager);
  const beaconManager = beaconManagerFactory(
    settings,
    eventManager,
    eventsManager,
    impressionsManager,
  );

  function kill() {
    beaconManager.kill();
  }

  return {
    kill,
    eventsManager,
    impressionsManager,
  };
}
