import { FsEvent, IEventManager } from '~sdk/modules/event/types';
import { BeaconManager } from '~sdk/modules/track/beacon/BeaconManager';
import { EventsManager } from '~sdk/modules/track/events/EventsManager';
import { IEventsManager } from '~sdk/modules/track/events/types';
import { ImpressionsManager } from '~sdk/modules/track/impressions/ImpressionsManager';
import { IImpressionsManager } from '~sdk/modules/track/impressions/types';
import { ITrackManager } from '~sdk/modules/track/types';

import { FsSettings } from '~config/types.internal';

import { ApiClientFactory } from '~api/clients/api-client';

export class TrackManager implements ITrackManager {
  private readonly settings: FsSettings;
  private readonly api: ApiClientFactory;
  private readonly eventManager: IEventManager;

  private readonly eventsManager: IEventsManager;
  private readonly impressionsManager: IImpressionsManager;
  private readonly beaconManager: BeaconManager;

  constructor(
    settings: FsSettings,
    eventManager: IEventManager,
    api: ApiClientFactory,
  ) {
    this.settings = settings;
    this.eventManager = eventManager;
    this.api = api;
    this.eventsManager = new EventsManager(settings, eventManager, api);

    this.impressionsManager = new ImpressionsManager(
      this.settings,
      this.eventManager,
      this.api,
    );

    this.beaconManager = new BeaconManager(
      settings,
      this.impressionsManager,
      this.eventsManager,
    );

    this.eventManager.once(FsEvent.SDK_READY, () => {
      this.eventsManager.start();
      this.impressionsManager.start();
      this.beaconManager.start();
    });
  }

  public getEventsManager() {
    return this.eventsManager;
  }

  public getImpressionsManager() {
    return this.impressionsManager;
  }

  public kill() {
    this.beaconManager.kill();
  }
}
