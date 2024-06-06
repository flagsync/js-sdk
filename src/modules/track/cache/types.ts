import { ILogger } from '~logger/types';

export interface ITrackCacheLogStrategy<T> {
  getLogItem(item: T): [string, string];
}

export interface ITrackCacheConfig<T> {
  log: ILogger;
  logPrefix: string;
  onFullQueue?: () => void;
  logStrategy: ITrackCacheLogStrategy<T>;
  maxQueueSize: number;
}

export interface ITrackCache<T> {
  clear(): void;
  push(item: T): void;
  pop: () => T[];
  isEmpty: () => boolean;
  setOnFullQueueCb(cb: () => void): void;
}
