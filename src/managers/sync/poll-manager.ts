import { FsSettings } from '../../config/types';

import { SyncManager } from './types';
import { SdkUserContext } from '../../api/data-contracts';
import { ServiceErrorFactory } from '../../api/error/service-error-factory';
import { apiClientFactory } from '../../api/clients/api-client';
import { EventManager, FsEvent, FsIntervalEvent } from '../events/types';

export function pollManager(
  settings: FsSettings,
  eventManager: EventManager,
): SyncManager {
  const { log, sync, core } = settings;

  const { sdk } = apiClientFactory(settings);

  const context: SdkUserContext = {
    key: core.key,
    email: core.attributes?.email,
    custom: core.attributes ?? {},
  };

  let timeout: number | NodeJS.Timeout;
  const interval = sync.pollRate * 1000;

  function poll() {
    sdk
      .sdkControllerGetFlags({
        context,
      })
      .then((res) => {
        log.debug('Polling event complete');
        eventManager.internal.emit(
          FsIntervalEvent.UPDATE_RECEIVED,
          res?.flags ?? {},
        );
      })
      .catch(async (e: unknown) => {
        const error = ServiceErrorFactory.create(e);
        log.error('Polling failed', [
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
    log.debug('Polling started');
    timeout = setTimeout(poll, interval);
  }

  function stop() {
    if (timeout) {
      log.debug('Polling stopped');
      clearTimeout(timeout);
    }
  }

  return {
    start,
    stop,
  };
}
