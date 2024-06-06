import { IEventsManager } from './events/types';
import { IImpressionsManager } from './impressions/types';

export type ITrackManager = {
  kill: () => void;
  getEventsManager: () => IEventsManager;
  getImpressionsManager: () => IImpressionsManager;
};
