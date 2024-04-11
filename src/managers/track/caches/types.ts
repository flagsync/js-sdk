import { FsSettings } from '../../../config/types';

export interface ITrackCacheLogStrategy<T> {
  logItem(item: T): [string, string];
}

export interface ITrackCacheConfig<T> {
  logPrefix: string;
  settings: FsSettings;
  onFullQueue?: () => void;
  logStrategy: ITrackCacheLogStrategy<T>;
  maxQueueSize: number;
}

export interface ITrackCache<T> {
  track(event: T): void;
  clear(): void;
  pop: () => T[];
  isEmpty: () => boolean;
  setOnFullQueueCb(cb: () => void): void;
}
