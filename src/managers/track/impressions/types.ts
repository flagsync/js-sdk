import { SdkTrackImpression } from '~api/data-contracts';

export interface IImpressionsManager {
  start: () => void;
  stop: () => void;
  track: (impression: Partial<SdkTrackImpression>) => void;
}
