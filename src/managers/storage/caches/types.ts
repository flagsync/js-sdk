import { SdkImpression } from '../../../api/data-contracts';

export interface ImpressionsBaseCache {
  track(impression: SdkImpression): void;
  clear(): void;
  pop: () => SdkImpression[];
  isEmpty: () => boolean;
}
