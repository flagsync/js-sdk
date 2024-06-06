import { SdkTrackImpression } from '~api/data-contracts';

export type PartialTrackImpression = Pick<
  SdkTrackImpression,
  'flagKey' | 'flagValue'
>;

export interface IImpressionsManager {
  pop: () => SdkTrackImpression[];
  start: () => void;
  kill: () => void;
  isEmpty: () => boolean;
  trackImpression: (impression: PartialTrackImpression) => void;
}
