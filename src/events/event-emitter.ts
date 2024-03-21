import EventEmitter from 'eventemitter3';

type EventListenerFunction = (...args: any[]) => void;

/**
 * A custom event emitter that defers emitting events until a listener is added
 */
export class DeferredEventEmitter extends EventEmitter {
  private eventQueue: Map<string | symbol, any[][]> = new Map();

  constructor() {
    super();
  }

  emit(event: string | symbol, ...args: any[]): boolean {
    /**
     * Check if there are listeners for the event
     */
    if (this.listenerCount(event) === 0) {
      /**
       * No listeners, queue the event
       */
      if (!this.eventQueue.has(event)) {
        this.eventQueue.set(event, []);
      }

      this.eventQueue.get(event)?.push(args);

      return false;
    }

    /**
     * Listeners exist, emit the event as normal
     */
    return super.emit(event, ...args);
  }

  on(event: string | symbol, fn: EventListenerFunction, context?: any): this {
    super.on(event, fn, context);
    this.flushEventQueue(event);
    return this;
  }

  once(event: string | symbol, fn: EventListenerFunction, context?: any): this {
    super.once(event, fn, context);
    this.flushEventQueue(event);
    return this;
  }

  private flushEventQueue(event: string | symbol): void {
    if (this.eventQueue.has(event)) {
      const queue = this.eventQueue.get(event);
      if (queue) {
        for (const args of queue) {
          super.emit(event, ...args);
        }
      }
    }
  }
}
