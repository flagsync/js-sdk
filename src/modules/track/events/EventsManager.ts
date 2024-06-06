import { FsEvent, IEventManager } from '~sdk/modules/event/types';
import { EventsCache } from '~sdk/modules/track/events/EventsCache';
import { IEventsManager } from '~sdk/modules/track/events/types';

import { FsSettings } from '~config/types.internal';

import { ApiClientFactory } from '~api/clients/api-client';
import { ServiceErrorFactory } from '~api/error/service-error-factory';
import { Track } from '~api/track';

const START_DELAY_MS = 3000;

const MESSAGE = {
  SEND_FAIL: 'batch send failed',
  BATCH_SENT: 'batch sent',
  FLUSHING: 'flushing queue',
  STOPPING: 'gracefully stopping submitter',
  STARTING: 'starting submitter',
} as const;

export class EventsManager implements IEventsManager {
  private readonly prefix = 'events-manager';

  private readonly settings: FsSettings;
  private readonly eventManager: IEventManager;
  private readonly cache: EventsCache;
  private readonly track: Track<any>;
  private readonly interval: number;

  private timeout: number | NodeJS.Timeout | null = null;

  constructor(
    settings: FsSettings,
    eventManager: IEventManager,
    api: ApiClientFactory,
  ) {
    this.settings = settings;
    this.eventManager = eventManager;
    this.cache = new EventsCache(settings, this.flushQueue.bind(this));
    this.track = api.getTrack();
    this.interval = settings.tracking.events.pushRate * 1000;
  }

  private async batchSend(): Promise<void> {
    if (this.cache.isEmpty()) {
      if (this.timeout) {
        clearTimeout(this.timeout);
      }
      this.timeout = setTimeout(() => this.batchSend(), this.interval);
      return;
    }

    const sendQueue = this.cache.pop();

    try {
      await this.track.sdkTrackControllerPostBatchEvents({
        context: this.settings.context,
        events: sendQueue,
      });
      this.settings.log.debug(
        `${this.buildMessage(MESSAGE.BATCH_SENT)} (${sendQueue.length} events)`,
      );
    } catch (e: unknown) {
      const error = ServiceErrorFactory.create(e);
      this.settings.log.error(
        this.buildMessage(MESSAGE.SEND_FAIL),
        error.path,
        error.errorCode,
        error.message,
      );
      this.eventManager.emit(FsEvent.ERROR, {
        type: 'api',
        error: error,
      });
    } finally {
      this.timeout = setTimeout(() => this.batchSend(), this.interval);
    }
  }

  private async flushQueue(): Promise<void> {
    this.settings.log.debug(this.buildMessage(MESSAGE.FLUSHING));
    await this.batchSend();
  }

  public start(): void {
    this.settings.log.debug(
      `${this.buildMessage(MESSAGE.STARTING)} (${START_DELAY_MS}ms)`,
    );
    this.timeout = setTimeout(() => this.batchSend(), START_DELAY_MS);
  }

  public kill(): void {
    this.flushQueue().finally(() => {
      this.stopSubmitter();
    });
  }

  public stopSubmitter(): void {
    if (this.timeout) {
      this.settings.log.debug(this.buildMessage(MESSAGE.STOPPING));
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  public pop(): any[] {
    return this.cache.pop();
  }

  public isEmpty(): boolean {
    return this.cache.isEmpty();
  }

  public submitEvent(event: any): void {
    this.cache.track(event);
  }

  private buildMessage(message: string): string {
    return `${this.prefix}: ${message}`;
  }
}
