import { FsLogger, LogLevel } from '../logger/types';
import { SdkUserContext } from '../api/data-contracts';

type FsFlagValue = any;
export type FsFlagSet = Record<string, FsFlagValue>;

type CustomAttributeValue = any;
type CustomAttributes = Record<string, CustomAttributeValue>;

type StorageType = 'memory' | 'localstorage';
type SyncType = 'stream' | 'poll' | 'off';
type Platform = 'node' | 'browser';

export interface FlagSyncConfig {
  readonly sdkKey: string;
  readonly core: {
    key: string;
    attributes?: CustomAttributes;
  };
  readonly bootstrap?: FsFlagSet;
  readonly storage?: {
    type?: StorageType;
    prefix?: string;
  };
  readonly sync?: {
    type?: SyncType;
    pollRate?: number;
  };
  readonly events?: {
    impressions?: {
      maxQueueSize: number;
      pushRate: number;
    };
  };
  readonly urls?: {
    sdk?: string;
  };
  readonly remoteEval?: boolean;
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
    type: StorageType;
    prefix: string;
  };
  readonly sync: {
    type: SyncType;
    pollRate: number;
  };
  readonly events: {
    impressions: {
      maxQueueSize: number;
      pushRate: number;
    };
  };
  readonly urls: {
    sdk: string;
  };
  readonly remoteEval: boolean;
  readonly logLevel?: LogLevel;
  log: FsLogger;
  context: SdkUserContext;
  platform: Platform;
}
