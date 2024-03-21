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
    pollInterval: 60,
  },
  urls: {
    sdk: 'http://localhost:3002',
    events: 'http://localhost:3002/events',
  },
  remoteEval: true,
  debug: false,
};
