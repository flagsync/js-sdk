import { FsErrorEvent } from '~sdk/index';

import { FsFlagSet } from '~config/types';

export type EventCallback<T extends FsEventType> = (
  payload: FsEventTypePayload[T],
) => void;

export type EventInternalCallback<T extends FsIntervalEventType> = (
  payload: FsInternalEventTypePayload[T],
) => void;

export interface IEventManager {
  on<T extends FsEventType>(event: T, callback: EventCallback<T>): void;
  once<T extends FsEventType>(event: T, callback: EventCallback<T>): void;
  emit<T extends FsEventType>(event: T, payload?: FsEventTypePayload[T]): void;
  off<T extends FsEventType>(event: T, callback?: EventCallback<T>): void;
  kill: () => void;
  internal: {
    on<T extends FsIntervalEventType>(
      event: T,
      callback: EventInternalCallback<T>,
    ): void;
    once<T extends FsIntervalEventType>(
      event: T,
      callback: EventInternalCallback<T>,
    ): void;
    emit<T extends FsIntervalEventType>(
      event: T,
      payload?: FsInternalEventTypePayload[T],
    ): void;
  };
}

export const FsEvent = {
  SDK_READY: 'init::ready',
  SDK_READY_FROM_STORE: 'init::ready-store',
  ERROR: 'sdk::error',
  SDK_UPDATE: 'state::update',
} as const;

export type FsEventType = (typeof FsEvent)[keyof typeof FsEvent];

export const FsIntervalEvent = {
  UPDATE_RECEIVED: 'state::update-received',
} as const;

export type FsIntervalEventType =
  (typeof FsIntervalEvent)[keyof typeof FsIntervalEvent];

type EventVoidPayload = void;
type EventErrorPayload = FsErrorEvent;
type EventFlagSetPayload = FsFlagSet;

export interface FsEventTypePayload {
  [FsEvent.SDK_READY]: EventVoidPayload;
  [FsEvent.ERROR]: EventErrorPayload;
  [FsEvent.SDK_UPDATE]: EventVoidPayload;
  [FsEvent.SDK_READY_FROM_STORE]: EventVoidPayload;
}

export interface FsInternalEventTypePayload {
  [FsIntervalEvent.UPDATE_RECEIVED]: EventFlagSetPayload;
}
