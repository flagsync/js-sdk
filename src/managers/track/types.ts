import type { IEventsManager } from './events/types';
import type { IImpressionsManager } from './impressions/types';

export type ITrackManager = {
  kill: () => void;
  eventsManager: IEventsManager;
  impressionsManager: IImpressionsManager;
};
