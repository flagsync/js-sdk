import { FsSettings } from '~config/types.internal';

import { apiClientFactory } from '~api/clients/api-client';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

import { FsEvent, FsIntervalEvent, IEventManager } from '~managers/event/types';
import { ISyncManager } from '~managers/sync/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const formatter = formatMsg.bind(null, 'poll-manager');

export function pollManager(
  settings: FsSettings,
  eventManager: IEventManager,
): ISyncManager {
  const { log, sync, context, sdkContext } = settings;

  const { sdk } = apiClientFactory(settings);

  let timeout: number | NodeJS.Timeout;
  const interval = sync.pollRate * 1000;

  async function poll() {
    try {
      const res = await sdk.sdkControllerGetFlags({
        context,
        sdkContext,
      });
      log.debug(formatter(MESSAGE.POLL_SUCCESS));
      eventManager.internal.emit(
        FsIntervalEvent.UPDATE_RECEIVED,
        res?.flags ?? {},
      );
    } catch (e) {
      const error = ServiceErrorFactory.create(e);
      log.error(
        formatter(MESSAGE.POLL_FAILED),
        error.path,
        error.errorCode,
        error.message,
      );

      eventManager.emit(FsEvent.ERROR, {
        type: 'api',
        error: error,
      });
    } finally {
      timeout = setTimeout(poll, interval);
    }
  }

  function start() {
    log.debug(formatter(MESSAGE.POLL_STARTED));
    timeout = setTimeout(poll, interval);
  }

  function kill() {
    if (timeout) {
      log.debug(formatter(MESSAGE.POLL_STOPPED));
      clearTimeout(timeout);
    }
  }

  return {
    start,
    kill,
  };
}
