import { FsSettings } from '../../config/types';
import { EventManager, FsEvent, FsIntervalEvent } from '../../events/types';
import { SyncManager } from './types';
import { SdkUserContext } from '../../api/data-contracts';
import { Sdk } from '../../api/Sdk';
import { ServiceErrorFactory } from '../../api/error/service-error-factory';

export function pollManager(
  settings: FsSettings,
  eventManager: EventManager,
  apiClient: Sdk<null>,
): SyncManager {
  const { log, sync, core } = settings;

  const context: SdkUserContext = {
    key: core.key,
    email: core.attributes?.email,
    custom: core.attributes ?? {},
  };

  let timeout: number;

  function poll() {
    apiClient
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
        setTimeout(poll, sync.pollInterval);
      });
  }

  function start() {
    log.debug('Polling started');
    timeout = setTimeout(poll, sync.pollInterval);
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
