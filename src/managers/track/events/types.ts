import { SdkTrackEvent } from '~api/data-contracts';

export interface IEventsManager {
  start: () => void;
  stop: () => void;
  track: (event: SdkTrackEvent) => void;
}
