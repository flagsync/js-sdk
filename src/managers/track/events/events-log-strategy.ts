import { SdkTrackEvent } from '~api/data-contracts';

import { ITrackCacheLogStrategy } from '~managers/track/caches/types';

export class EventLogStrategy implements ITrackCacheLogStrategy<SdkTrackEvent> {
  getLogItem(item: SdkTrackEvent): [string, string] {
    return [item.eventKey, JSON.stringify(item)];
  }
}
