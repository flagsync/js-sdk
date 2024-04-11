export interface IEventsManager {
  start: () => void;
  stop: () => void;
  track: (
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ) => void;
}
