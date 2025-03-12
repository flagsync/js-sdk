import type { SdkClientTrackImpression } from '~api/data-contracts';

export type PartialTrackImpression = Pick<
  SdkClientTrackImpression,
  'flagKey' | 'flagValue'
>;

export interface IImpressionsManager {
  start: () => void;
  flushQueueAndStop: () => void;
  stopSubmitter: () => void;
  isEmpty: () => boolean;
  pop: () => SdkClientTrackImpression[];
  track: (impression: PartialTrackImpression) => void;
}
