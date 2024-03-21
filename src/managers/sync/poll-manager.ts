import { FsSettings } from '../../config/types';
import { EventManager, FsEvent, FsIntervalEvent } from '../../events/types';
import { SyncManager } from './types';
import { FlagSyncAPI, SdkUserContext } from '../../api/api';

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
      .catch((e: unknown) => {
        if (e instanceof Response) {
          log.error('Polling failed', [e.url, e.status, e.statusText]);
          eventManager.emit(FsEvent.ERROR, {
            type: 'api',
            error: new Error(`Polling failed: ${e.status} ${e.statusText}`),
          });
          return;
        }

        const error = e as Error;

        log.error('Polling failed', [error.message, error.stack]);
        eventManager.emit(FsEvent.ERROR, {
          type: 'api',
          error,
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
