import { FsEvent, IEventManager } from '~sdk/modules/event/types';

import { FsSettings } from '~config/types.internal';

import { ApiClientFactory } from '~api/clients/api-client';
import { SdkTrackImpression } from '~api/data-contracts';
import { ServiceErrorFactory } from '~api/error/service-error-factory';
import { Track } from '~api/track';

import { ILogger } from '~logger/types';

import { ImpressionsCache } from './ImpressionsCache';
import { IImpressionsManager, PartialTrackImpression } from './types';

const START_DELAY_MS = 3000;

const MESSAGE = {
  SEND_FAIL: 'batch send failed',
  BATCH_SENT: 'batch sent',
  FLUSHING: 'flushing queue',
  STOPPING: 'gracefully stopping submitter',
  STARTING: 'starting submitter',
} as const;

export class ImpressionsManager implements IImpressionsManager {
  private readonly prefix = 'impressions-manager';

  private readonly settings: FsSettings;
  private readonly eventManager: IEventManager;
  private readonly cache: ImpressionsCache;
  private readonly track: Track<any>;
  private readonly interval: number;
  private readonly log: ILogger;

  private timeout: number | NodeJS.Timeout | null = null;

  constructor(
    settings: FsSettings,
    eventManager: IEventManager,
    api: ApiClientFactory,
  ) {
    this.settings = settings;
    this.eventManager = eventManager;
    this.cache = new ImpressionsCache(settings, this.flushQueue.bind(this));
    this.track = api.getTrack();
    this.interval = settings.tracking.impressions.pushRate * 1000;
    this.log = settings.log;
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
      await this.track.sdkTrackControllerPostBatchImpressions({
        context: this.settings.context,
        impressions: sendQueue,
      });
      this.log.debug(
        `${this.buildMessage(MESSAGE.BATCH_SENT)} (${sendQueue.length} impressions)`,
      );
    } catch (e: unknown) {
      const error = ServiceErrorFactory.create(e);
      this.log.error(
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
    this.log.debug(this.buildMessage(MESSAGE.FLUSHING));
    await this.batchSend();
  }

  public start(): void {
    this.log.debug(
      `${this.buildMessage(MESSAGE.STARTING)} (in ${START_DELAY_MS}ms)`,
    );
    this.timeout = setTimeout(() => this.batchSend(), START_DELAY_MS);
  }

  public kill(): void {
    if (this.timeout) {
      this.log.debug(this.buildMessage(MESSAGE.STOPPING));
      clearTimeout(this.timeout);
      this.timeout = null;
    }
  }

  public pop(): SdkTrackImpression[] {
    return this.cache.pop();
  }

  public isEmpty(): boolean {
    return this.cache.isEmpty();
  }

  public trackImpression(impression: PartialTrackImpression): void {
    this.cache.track({
      ...impression,
      timestamp: new Date().toISOString(),
    });
  }

  private buildMessage(message: (typeof MESSAGE)[keyof typeof MESSAGE]) {
    return `${this.prefix}: ${message}`;
  }
}
