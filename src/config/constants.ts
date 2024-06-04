import { FsSettings } from '~config/types.internal';

export const UNREADY_FLAG_VALUE = 'control';

export const DEFAULT_CONFIG = {
  sdkKey: undefined,
  core: {
    key: undefined,
    attributes: undefined,
  },
  bootstrap: {},
  storage: {
    type: 'memory',
    prefix: 'flagsync',
  },
  sync: {
    type: 'stream',
    pollRate: 60,
  },
  tracking: {
    impressions: {
      maxQueueSize: 50,
      pushRate: 60,
    },
    events: {
      maxQueueSize: 50,
      pushRate: 60,
    },
  },
  urls: {
    sdk: 'https://sdk.flagsync.com',
  },
  debug: false,
} as unknown as FsSettings;
