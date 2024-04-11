import { ImpressionsManager } from './impressions/types';
import { EventsManager } from './events/types';

export type TrackManager = {
  eventsManager: EventsManager;
  impressionsManager: ImpressionsManager;
};
