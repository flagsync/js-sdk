import { IEventsManager } from './events/types';
import { IImpressionsManager } from './impressions/types';

export type ITrackManager = {
  kill: () => void;
  eventsManager: IEventsManager;
  impressionsManager: IImpressionsManager;
};
