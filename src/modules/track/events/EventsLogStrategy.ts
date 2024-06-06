import { ITrackCacheLogStrategy } from '~sdk/modules/track/cache/types';

import { SdkTrackEvent } from '~api/data-contracts';

export class EventLogStrategy implements ITrackCacheLogStrategy<SdkTrackEvent> {
  getLogItem(item: SdkTrackEvent): [string, string] {
    return [item.eventKey, JSON.stringify(item)];
  }
}
