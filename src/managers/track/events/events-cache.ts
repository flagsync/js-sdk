import { FsSettings } from '~config/types';

import { SdkTrackEvent } from '~api/data-contracts';

import { TrackCache } from '~managers/track/caches/track-cache';
import { ITrackCache } from '~managers/track/caches/types';
import { EventLogStrategy } from '~managers/track/events/events-log-strategy';

export interface IEventsCache extends ITrackCache<SdkTrackEvent> {
  track(
    eventKey: string,
    value?: number,
    properties?: Record<string, any>,
  ): void;
}

export class EventsCache
  extends TrackCache<SdkTrackEvent>
  implements IEventsCache
{
  constructor(settings: FsSettings, onFullQueue: () => void) {
    super({
      log: settings.log,
      maxQueueSize: settings.tracking.events.maxQueueSize,
      logPrefix: 'events-cache',
      logStrategy: new EventLogStrategy(),
      onFullQueue: onFullQueue,
    });
  }

  track(
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ): void {
    const event: SdkTrackEvent = {
      eventKey,
      value,
      properties,
      timestamp: new Date().toISOString(),
    };
    this.push(event);
  }
}
