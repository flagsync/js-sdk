import { SdkClientTrackEvent } from '~api/data-contracts';

import { ITrackCacheLogStrategy } from '~managers/track/caches/types';

export class EventLogStrategy
  implements ITrackCacheLogStrategy<SdkClientTrackEvent>
{
  getLogItem(item: SdkClientTrackEvent): [string, string] {
    return [item.eventKey, JSON.stringify(item)];
  }
}
