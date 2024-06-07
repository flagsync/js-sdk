import { SdkTrackImpression } from '~api/data-contracts';

export type PartialTrackImpression = Pick<
  SdkTrackImpression,
  'flagKey' | 'flagValue'
>;

export interface IImpressionsManager {
  start: () => void;
  flushQueueAndStop: () => void;
  stopSubmitter: () => void;
  isEmpty: () => boolean;
  pop: () => SdkTrackImpression[];
  track: (impression: PartialTrackImpression) => void;
}
