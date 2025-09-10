import type {
  FsCore,
  FsFlagSet,
  Platform,
  StorageType,
  SyncType,
} from '~config/types';

import type { SdkSdkContext, SdkUserContext } from '~api/data-contracts';

import type { ILogger, LogLevel } from '~logger/types';

export interface FsSettings {
  readonly sdkKey: string;
  core: FsCore;
  readonly bootstrap?: FsFlagSet;
  readonly storage: {
    type: (typeof StorageType)[keyof typeof StorageType];
    prefix: string;
  };
  readonly sync: {
    type: (typeof SyncType)[keyof typeof SyncType];
    pollRateInSec: number;
  };
  readonly tracking: {
    impressions: {
      maxQueueSize: number;
      pushRateInSec: number;
    };
    events: {
      maxQueueSize: number;
      pushRateInSec: number;
    };
  };
  readonly urls: {
    ws: string;
    sse: string;
    flags: string;
    events: string;
  };
  readonly logLevel?: LogLevel;
  log: ILogger;
  customLogger: Partial<ILogger>;
  context: SdkUserContext;
  platform: (typeof Platform)[keyof typeof Platform];
  metadata: Record<string, any>;
  sdkContext: SdkSdkContext;
}
