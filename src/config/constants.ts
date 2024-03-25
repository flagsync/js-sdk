import { FsSettings } from './types';

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
  events: {
    impressions: {
      maxQueueSize: 50,
      pushRate: 60,
    },
  },
  urls: {
    sdk: 'https://sdk.flagsync.com',
    events: 'https://sdk.flagsync.com/events',
  },
  remoteEval: true,
  debug: false,
} as unknown as FsSettings;
