import { SdkImpression } from '../../../api/data-contracts';
import { ImpressionsBaseCache } from './types';
import { FsSettings } from '../../../config/types';
import { FsLogger } from '../../../logger/types';

export class ImpressionsCache implements ImpressionsBaseCache {
  private queue: SdkImpression[] = [];

  private onFullQueue?: () => void;
  private readonly maxQueue: number;
  private readonly log: FsLogger;

  constructor(settings: FsSettings, onFullQueue?: () => void) {
    this.maxQueue = settings.events.impressions.maxQueueSize;
    this.log = settings.log;
    this.onFullQueue = onFullQueue;
  }

  setOnFullQueueCb(cb: () => void): void {
    this.onFullQueue = cb;
  }

  track(impression: SdkImpression): void {
    this.queue.push(impression);
    this.log.debug('Event enqueued:', [
      impression.flagKey,
      impression.flagValue,
    ]);
    if (this.queue.length >= this.maxQueue && this.onFullQueue) {
      this.onFullQueue();
    }
  }

  clear(): void {
    this.queue = [];
  }

  pop(): SdkImpression[] {
    const queue = this.queue;
    this.clear();
    return queue;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
