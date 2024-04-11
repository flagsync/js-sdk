import { SdkTrackImpression } from '~api/data-contracts';

import { ITrackCacheLogStrategy } from '~managers/track/caches/types';

export class ImpressionLogStrategy
  implements ITrackCacheLogStrategy<SdkTrackImpression>
{
  getLogItem(item: SdkTrackImpression): [string, string] {
    return [item.flagKey, JSON.stringify(item.flagValue)];
  }
}
