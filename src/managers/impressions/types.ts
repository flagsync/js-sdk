import { SdkImpression } from '../../api/data-contracts';

export type ImpressionsManager = {
  start: () => void;
  stop: () => void;
  track: (impression: SdkImpression) => void;
};
