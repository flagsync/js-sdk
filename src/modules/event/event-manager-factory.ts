import { DeferredEventEmitter } from '~sdk/modules/event/deferred-event-emitter';
import {
  EventCallback,
  EventInternalCallback,
  FsEventType,
  FsEventTypePayload,
  FsInternalEventTypePayload,
  FsIntervalEventType,
  IEventManager,
} from '~sdk/modules/event/types';

export class EventManager implements IEventManager {
  private emitter: DeferredEventEmitter;

  constructor() {
    this.emitter = new DeferredEventEmitter();
  }

  public on<T extends FsEventType>(event: T, callback: EventCallback<T>): void {
    this.emitter.on(event, callback);
  }

  public once<T extends FsEventType>(
    event: T,
    callback: EventCallback<T>,
  ): void {
    this.emitter.once(event, callback);
  }

  public emit<T extends FsEventType>(
    event: T,
    payload?: FsEventTypePayload[T],
  ): void {
    this.emitter.emit(event, payload);
  }

  public off<T extends FsEventType>(
    event: T,
    callback?: EventCallback<T>,
  ): void {
    this.emitter.off(event, callback);
  }

  public kill(): void {
    this.emitter.removeAllListeners();
  }

  public internal = {
    on: <T extends FsIntervalEventType>(
      event: T,
      callback: EventInternalCallback<T>,
    ): void => {
      this.emitter.on(event, callback);
    },
    once: <T extends FsIntervalEventType>(
      event: T,
      callback: EventInternalCallback<T>,
    ): void => {
      this.emitter.once(event, callback);
    },
    emit: <T extends FsIntervalEventType>(
      event: T,
      payload?: FsInternalEventTypePayload[T],
    ): void => {
      this.emitter.emit(event, payload);
    },
  };
}
