import { ITrackCacheLogStrategy } from '~sdk/modules/track/cache/types';

import { SdkTrackImpression } from '~api/data-contracts';

export class ImpressionLogStrategy
  implements ITrackCacheLogStrategy<SdkTrackImpression>
{
  getLogItem(item: SdkTrackImpression): [string, string] {
    return [item.flagKey, JSON.stringify(item.flagValue)];
  }
}
