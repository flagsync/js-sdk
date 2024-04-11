import { SdkTrackEvent } from '../../../api/data-contracts';

export type EventsManager = {
  start: () => void;
  stop: () => void;
  track: (event: SdkTrackEvent) => void;
};
