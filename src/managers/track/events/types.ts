import { SdkClientTrackEvent } from '~api/data-contracts';

export interface IEventsManager {
  start: () => void;
  pop: () => SdkClientTrackEvent[];
  isEmpty: () => boolean;
  flushQueueAndStop: () => void;
  stopSubmitter: () => void;
  track: (
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ) => void;
}
