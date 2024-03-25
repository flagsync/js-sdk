import { SdkImpression } from '../../api/data-contracts';

export type ImpressionsManager = {
  start: () => void;
  stop: () => void;
  enqueue: (event: SdkImpression) => void;
};
