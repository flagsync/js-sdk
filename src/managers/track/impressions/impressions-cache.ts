import { FsSettings } from '~config/types.internal';

import { SdkTrackImpression } from '~api/data-contracts';

import { TrackCache } from '~managers/track/caches/track-cache';
import { ITrackCache } from '~managers/track/caches/types';
import { ImpressionLogStrategy } from '~managers/track/impressions/impressions-log-strategy';

export interface IImpressionCache extends ITrackCache<SdkTrackImpression> {
  track(event: SdkTrackImpression): void;
}

export class ImpressionsCache
  extends TrackCache<SdkTrackImpression>
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

  track(impression: SdkTrackImpression): void {
    this.push(impression);
  }
}
