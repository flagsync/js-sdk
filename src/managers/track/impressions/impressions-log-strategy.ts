import { ITrackCacheLogStrategy } from '../caches/types';
import { SdkTrackImpression } from '../../../api/data-contracts';

export class ImpressionLogStrategy
  implements ITrackCacheLogStrategy<SdkTrackImpression>
{
  logItem(item: SdkTrackImpression): [string, string] {
    return [item.flagKey, JSON.stringify(item.flagValue)];
  }
}
