import type { FsSettings } from '~config/types.internal';

import { SdkClientTrackImpression } from '~api/data-contracts';

import { TrackCache } from '~managers/track/caches/track-cache';
import type { ITrackCache } from '~managers/track/caches/types';
import { ImpressionLogStrategy } from '~managers/track/impressions/impressions-log-strategy';

export interface IImpressionCache
  extends ITrackCache<SdkClientTrackImpression> {
  track(event: SdkClientTrackImpression): void;
}

export class ImpressionsCache
  extends TrackCache<SdkClientTrackImpression>
  implements IImpressionCache
{
  constructor(settings: FsSettings, onFullQueue: () => void) {
    super({
      log: settings.log,
      maxQueueSize: settings.tracking.impressions.maxQueueSize,
      logPrefix: 'impressions-cache',
      logStrategy: new ImpressionLogStrategy(),
      onFullQueue: onFullQueue,
    });
  }

  track(impression: SdkClientTrackImpression): void {
    this.push(impression);
  }
}
