import type { ILogger, LogLevel } from '~logger/types';

export type FsFlagValue = any;
export type FsFlagSet = Record<string, FsFlagValue>;

export type CustomAttributeValue = any;
export type CustomAttributes = Record<string, CustomAttributeValue>;

export type FsCore = {
  key: string;
  attributes?: CustomAttributes;
};

export const StorageType = {
  Memory: 'memory',
  LocalStorage: 'localstorage',
} as const;

export const SyncType = {
  Sse: 'sse',
  Ws: 'ws',
  Poll: 'poll',
  Off: 'off',
} as const;

export const Platform = {
  Node: 'node',
  Browser: 'browser',
} as const;

type PollingSync = {
  type: typeof SyncType.Poll;
  pollRateInSec: number;
};

type NonPollingSync = {
  type?: Exclude<
    (typeof SyncType)[keyof typeof SyncType],
    typeof SyncType.Poll
  >;
  pollRateInSec?: never;
};

export interface FsConfig {
  readonly sdkKey: string;
  readonly core: FsCore;
  readonly bootstrap?: FsFlagSet;
  readonly storage?: {
    type?: (typeof StorageType)[keyof typeof StorageType];
    prefix?: string;
  };
  readonly sync?: PollingSync | NonPollingSync;
  readonly tracking?: {
    impressions?: {
      maxQueueSize: number;
      pushRateInSec: number;
    };
    events?: {
      maxQueueSize: number;
      pushRateInSec: number;
    };
  };
  readonly urls?: {
    ws?: string;
    sse?: string;
    flags?: string;
    events?: string;
  };
  logger?: Partial<ILogger>;
  readonly logLevel?: LogLevel;
  readonly metadata?: Record<string, any>;
}
