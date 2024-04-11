import { FsLogger } from '../../../logger/types';
import {
  ITrackCache,
  ITrackCacheConfig,
  ITrackCacheLogStrategy,
} from './types';

export class TrackCache<T> implements ITrackCache<T> {
  private queue: T[] = [];

  private onFullQueue?: () => void;
  private readonly log: FsLogger;
  private readonly maxQueueSize: number;
  private readonly logPrefix: string;
  private readonly logStrategy: ITrackCacheLogStrategy<T>;

  constructor({
    settings,
    onFullQueue,
    maxQueueSize,
    logPrefix,
    logStrategy,
  }: ITrackCacheConfig<T>) {
    this.log = settings.log;
    this.maxQueueSize = maxQueueSize;
    this.onFullQueue = onFullQueue;
    this.logPrefix = logPrefix;
    this.logStrategy = logStrategy;
  }

  setOnFullQueueCb(cb: () => void): void {
    this.onFullQueue = cb;
  }

  track(event: T): void {
    this.queue.push(event);

    const vals = this.logStrategy.logItem(event);
    this.log.debug(`${this.logPrefix}: item enqueued`, vals);

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
