import { SdkTrackImpression } from '~api/data-contracts';

export type PartialTrackImpression = Pick<
  SdkTrackImpression,
  'flagKey' | 'flagValue'
>;

export interface IImpressionsManager {
  start: () => void;
  stop: () => void;
  softStop: () => void;
  isEmpty: () => boolean;
  pop: () => SdkTrackImpression[];
  track: (impression: PartialTrackImpression) => void;
}
