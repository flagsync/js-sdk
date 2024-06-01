import { IEventsManager } from './events/types';
import { IImpressionsManager } from './impressions/types';

export type TrackManager = {
  start: () => void;
  stop: () => void;
  eventsManager: IEventsManager;
  impressionsManager: IImpressionsManager;
};
