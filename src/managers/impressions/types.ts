import { ImpressionsCache } from '../storage/caches/impressions-cache';

export type ImpressionsManager = {
  start: () => void;
  stop: () => void;
  cache: ImpressionsCache;
};
