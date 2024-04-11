import { ITrackCacheLogStrategy } from '../caches/types';
import { SdkTrackEvent } from '../../../api/data-contracts';

export class EventLogStrategy implements ITrackCacheLogStrategy<SdkTrackEvent> {
  logItem(item: SdkTrackEvent): [string, string] {
    return [item.eventKey, JSON.stringify(item)];
  }
}
