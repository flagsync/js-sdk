import { SdkTrackEvent } from '~api/data-contracts';

export interface IEventsManager {
  pop: () => SdkTrackEvent[];
  start: () => void;
  kill: () => void;
  isEmpty: () => boolean;
  submitEvent: (
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ) => void;
}
