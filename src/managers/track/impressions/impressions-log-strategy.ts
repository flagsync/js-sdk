import type { SdkClientTrackImpression } from '~api/data-contracts';

import type { ITrackCacheLogStrategy } from '~managers/track/caches/types';

export class ImpressionLogStrategy
  implements ITrackCacheLogStrategy<SdkClientTrackImpression>
{
  getLogItem(item: SdkClientTrackImpression): [string, string] {
    return [item.flagKey, JSON.stringify(item.flagValue)];
  }
}
