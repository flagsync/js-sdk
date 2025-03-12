import { FsClient } from '~sdk/client/fs-client';

import type { FsConfig } from '~config/types';

import { FsServiceError } from '~api/error/service-error';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

export { FsServiceError };
export { ServiceErrorFactory };
export * from '~config/types';
export type { LogLevel } from '~logger/types';
export type {
  FsEventTypePayload,
  EventCallback,
  FsEventType,
} from '~managers/event/types';

export { FsEvent } from '~managers/event/types';

export type FsErrorSource = 'api' | 'sdk';
export type FsErrorEvent = {
  type: FsErrorSource;
  error: Error | FsServiceError;
};

export type { FsClient };

export function FlagSyncFactory(config: FsConfig) {
  const client = new FsClient(config);
  return {
    client: () => client,
  };
}
