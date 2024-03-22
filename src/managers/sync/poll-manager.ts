import { FsSettings } from '../../config/types';
import { EventManager, FsEvent, FsIntervalEvent } from '../../events/types';
import { SyncManager } from './types';
import { processApiError } from '../../api/process-api-error';
import { FlagSyncAPI, SdkUserContext } from '../../api/api-swagger';

export function pollManager(
  settings: FsSettings,
  eventManager: EventManager,
  apiClient: FlagSyncAPI<any>,
): SyncManager {
  const { log, sync, core } = settings;

  const context: SdkUserContext = {
    key: core.key,
    email: core.attributes.email,
    custom: core.attributes,
  };

  let timeout: number;

  function poll() {
    apiClient.sdk
      .sdkControllerGetFlags({
        context,
      })
      .then((res) => {
        log.debug('Polling event complete');
        eventManager.internal.emit(
          FsIntervalEvent.UPDATE_RECEIVED,
          res?.data?.flags ?? {},
        );
      })
      .catch(async (e: unknown) => {
        const error = await processApiError(e);
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
