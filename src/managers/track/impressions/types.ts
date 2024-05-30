import { SdkTrackImpression } from '~api/data-contracts';

export type PartialTrackImpression = Pick<
  SdkTrackImpression,
  'flagKey' | 'flagValue'
>;

export interface IImpressionsManager {
  start: () => void;
  stop: () => void;
  track: (impression: PartialTrackImpression) => void;
}
