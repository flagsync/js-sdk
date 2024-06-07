import {
  ITrackCache,
  ITrackCacheConfig,
  ITrackCacheLogStrategy,
} from '~managers/track/caches/types';

import { MESSAGE } from '~logger/messages';
import { ILogger } from '~logger/types';
import { formatMsg } from '~logger/utils';

export class TrackCache<T> implements ITrackCache<T> {
  private queue: T[] = [];

  private onFullQueue?: () => void;
  protected readonly log: ILogger;
  private readonly maxQueueSize: number;
  private readonly logPrefix: string;
  private readonly logStrategy: ITrackCacheLogStrategy<T>;

  constructor({
    log,
    onFullQueue,
    maxQueueSize,
    logPrefix,
    logStrategy,
  }: ITrackCacheConfig<T>) {
    this.log = log;
    this.maxQueueSize = maxQueueSize;
    this.onFullQueue = onFullQueue;
    this.logPrefix = logPrefix;
    this.logStrategy = logStrategy;
  }

  setOnFullQueueCb(cb: () => void): void {
    this.onFullQueue = cb;
  }

  push(item: T): void {
    this.queue.push(item);

    const vals = this.logStrategy.getLogItem(item);
    this.log.debug(
      formatMsg(this.logPrefix, MESSAGE.CACHE_ITEM_ENQUEUED),
      ...vals,
    );

    if (this.queue.length >= this.maxQueueSize && this.onFullQueue) {
      this.onFullQueue();
    }
  }

  clear(): void {
    this.queue = [];
  }

  pop(): T[] {
    const queue = this.queue;
    this.clear();
    return queue;
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }
}
