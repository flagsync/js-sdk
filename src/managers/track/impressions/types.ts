import { SdkTrackImpression } from '../../../api/data-contracts';

export type ImpressionsManager = {
  start: () => void;
  stop: () => void;
  track: (impression: SdkTrackImpression) => void;
};
