import { DeferredEventEmitter } from './event-emitter';

import {
  EventCallback,
  EventInternalCallback,
  EventManager,
  FsEventType,
  FsEventTypePayload,
  FsInternalEventTypePayload,
  FsIntervalEventType,
} from './types';

export function eventManagerFactory(): EventManager {
  const emitter = new DeferredEventEmitter();

  function on<T extends FsEventType>(event: T, callback: EventCallback<T>) {
    emitter.on(event, callback);
  }

  function once<T extends FsEventType>(event: T, callback: EventCallback<T>) {
    emitter.once(event, callback);
  }

  function emit<T extends FsEventType>(
    event: T,
    payload?: FsEventTypePayload[T],
  ) {
    emitter.emit(event, payload);
  }

  function off<T extends FsEventType>(event: T, callback?: EventCallback<T>) {
    emitter.off(event, callback);
  }

  const internal = {
    on: <T extends FsIntervalEventType>(
      event: T,
      callback: EventInternalCallback<T>,
    ) => {
      emitter.on(event, callback);
    },
    once: <T extends FsIntervalEventType>(
      event: T,
      callback: EventInternalCallback<T>,
    ) => {
      emitter.on(event, callback);
    },
    emit: <T extends FsIntervalEventType>(
      event: T,
      payload?: FsInternalEventTypePayload[T],
    ) => {
      emitter.emit(event, payload);
    },
  };

  return {
    on,
    once,
    emit,
    off,
    internal,
  };
}
