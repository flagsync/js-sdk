import { IEventsManager } from './events/types';
import { IImpressionsManager } from './impressions/types';

export type TrackManager = {
  eventsManager: IEventsManager;
  impressionsManager: IImpressionsManager;
};
