import { FsSettings } from '~config/types.internal';

import { FsEvent, IEventManager } from '~managers/event/types';
import { beaconManager } from '~managers/track/beacon/beacon-manager';
import { IEventsManager } from '~managers/track/events/types';
import { IImpressionsManager } from '~managers/track/impressions/types';

export const beaconManagerFactory = (
  settings: FsSettings,
  eventManager: IEventManager,
  eventsManager: IEventsManager,
  impressionsManager: IImpressionsManager,
) => {
  const manager = beaconManager(settings, eventsManager, impressionsManager);

  eventManager.on(FsEvent.SDK_READY, () => {
    manager.start();
  });

  return manager;
};
