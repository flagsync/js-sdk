const KILL_MANAGER_MESSAGE = {
  KILL_KILLING: 'SDK shutting down',
  KILL_ALREADY_KILLING: 'already handling kill, skipping...',
} as const;

const STORAGE_MANAGER_FACTORY_MESSAGE = {
  STORAGE_FALLBACK: 'LocalStorage not available, falling back to memory store',
  STORAGE_READY: 'SDK ready from store',
};

const STORAGE_MANAGER_MESSAGE = {
  STORAGE_SET_FLAGS: 'storing flags',
  STORAGE_GET_FLAGS: 'getting flags',
  STORAGE_PARSE_FAIL: 'failed to parse flags from storage',
} as const;

const SERVICE_MANAGER_MESSAGE = {
  SDK_READY: 'SDK ready',
  SDK_FAILED: 'SDK init failed',
};

const STREAM_MANAGER_MESSAGE = {
  STREAM_CONNECTED: 'connection established',
  STREAM_MESSAGE_RECEIVED: 'message received',
  STREAM_CONN_OPEN: 'connection is open',
  STREAM_CONN_CLOSE: 'ungraceful connection close',
  STREAM_CONN_CLOSING: 'gracefully closing event stream',
  STREAM_RECONNECT: 'reestablishing connection',
  STREAM_MALFORMED_EVENT: 'malformed message event',
  STREAM_UNKNOWN_EVENT_STATE: 'unknown error state',
} as const;

const POLL_MANAGER_MESSAGE = {
  POLL_STARTED: 'polling started',
  POLL_SUCCESS: 'polling success',
  POLL_FAILED: 'polling failed',
  POLL_STOPPED: 'gracefully stopping poller',
} as const;

const BEACON_MANAGER_MESSAGE = {
  BEACON_FLUSHING: 'flushing with beacon',
  BEACON_FLUSHING_HIDDEN: 'flushing with beacon (hidden)',
  BEACON_FAILED: 'failed to send with beacon to',
} as const;

const TRACK_CACHE_MESSAGE = {
  CACHE_ITEM_ENQUEUED: 'item enqueued',
};

const EVENTS_CACHE_MESSAGE = {
  INVALID_NUMBER: 'Value must be a finite number, null, or undefined',
  INVALID_PROPERTIES: 'Properties must be a plain object, null, or undefined',
};

const TRACK_MANAGER_MESSAGE = {
  TRACK_SEND_FAIL: 'batch send failed',
  TRACK_BATCH_SENT: 'batch sent',
  TRACK_FLUSHING: 'flushing queue',
  TRACK_STOPPING: 'gracefully stopping submitter',
  TRACK_STARTING: 'starting submitter',
} as const;

export const MESSAGE = {
  ...SERVICE_MANAGER_MESSAGE,
  ...KILL_MANAGER_MESSAGE,
  ...STORAGE_MANAGER_MESSAGE,
  ...STORAGE_MANAGER_FACTORY_MESSAGE,
  ...STREAM_MANAGER_MESSAGE,
  ...POLL_MANAGER_MESSAGE,
  ...BEACON_MANAGER_MESSAGE,
  ...EVENTS_CACHE_MESSAGE,
  ...TRACK_MANAGER_MESSAGE,
  ...TRACK_CACHE_MESSAGE,
} as const;
