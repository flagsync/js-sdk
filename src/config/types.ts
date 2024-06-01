import { SdkUserContext } from '~api/data-contracts';

import { ILogger, LogLevel } from '~logger/types';

export type FsFlagValue = any;
export type FsFlagSet = Record<string, FsFlagValue>;

export type CustomAttributeValue = any;
export type CustomAttributes = Record<string, CustomAttributeValue>;

export const StorageType = {
  Memory: 'memory',
  LocalStorage: 'localstorage',
} as const;

export const SyncType = {
  Stream: 'stream',
  Poll: 'poll',
  Off: 'off',
} as const;

export const Platform = {
  Node: 'node',
  Browser: 'browser',
} as const;

export interface FlagSyncConfig {
  readonly sdkKey: string;
  readonly core: {
    key: string;
    attributes?: CustomAttributes;
  };
  readonly bootstrap?: FsFlagSet;
  readonly storage?: {
    type?: (typeof StorageType)[keyof typeof StorageType];
    prefix?: string;
  };
  readonly sync?: {
    type?: (typeof SyncType)[keyof typeof SyncType];
    pollRate?: number;
  };
  readonly tracking?: {
    impressions?: {
      maxQueueSize: number;
      pushRate: number;
    };
    events?: {
      maxQueueSize: number;
      pushRate: number;
    };
  };
  readonly urls?: {
    sdk?: string;
  };
  readonly logLevel?: LogLevel;
}

export interface FsSettings {
  readonly sdkKey: string;
  readonly core: {
    key: string;
    attributes: CustomAttributes;
  };
  readonly bootstrap?: FsFlagSet;
  readonly storage: {
    type: (typeof StorageType)[keyof typeof StorageType];
    prefix: string;
  };
  readonly sync: {
    type: (typeof SyncType)[keyof typeof SyncType];
    pollRate: number;
  };
  readonly tracking: {
    impressions: {
      maxQueueSize: number;
      pushRate: number;
    };
    events: {
      maxQueueSize: number;
      pushRate: number;
    };
  };
  readonly urls: {
    sdk: string;
  };
  readonly logLevel?: LogLevel;
  log: ILogger;
  context: SdkUserContext;
  platform: (typeof Platform)[keyof typeof Platform];
}
