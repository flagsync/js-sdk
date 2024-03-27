import { FsSettings } from '../../config/types';

import { SyncManager } from './types';
import { ServiceErrorFactory } from '../../api/error/service-error-factory';
import { apiClientFactory } from '../../api/clients/api-client';
import { EventManager, FsEvent, FsIntervalEvent } from '../events/types';

const logPrefix = 'poll-manager';

export function pollManager(
  settings: FsSettings,
  eventManager: EventManager,
): SyncManager {
  const { log, sync, context } = settings;

  const { sdk } = apiClientFactory(settings);

  let timeout: number | NodeJS.Timeout;
  const interval = sync.pollRate * 1000;

  function poll() {
    sdk
      .sdkControllerGetFlags({
        context,
      })
      .then((res) => {
        log.debug(`${logPrefix}: polling success`);
        eventManager.internal.emit(
          FsIntervalEvent.UPDATE_RECEIVED,
          res?.flags ?? {},
        );
      })
      .catch(async (e: unknown) => {
        const error = ServiceErrorFactory.create(e);
        log.error(`${logPrefix}: polling failed`, [
          error.path,
          error.errorCode,
          error.message,
        ]);

        eventManager.emit(FsEvent.ERROR, {
          type: 'api',
          error: error,
        });
      })
      .finally(() => {
        timeout = setTimeout(poll, interval);
      });
  }

  function start() {
    log.debug(`${logPrefix}: polling started`);
    timeout = setTimeout(poll, interval);
  }

  function stop() {
    if (timeout) {
      log.debug(`${logPrefix}: gracefully stopping poller`);
      clearTimeout(timeout);
    }
  }

  return {
    start,
    stop,
  };
}
