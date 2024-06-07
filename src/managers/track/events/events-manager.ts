import { FsSettings } from '~config/types.internal';

import { apiClientFactory } from '~api/clients/api-client';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

import { FsEvent, IEventManager } from '~managers/event/types';
import { EventsCache } from '~managers/track/events/events-cache';
import { IEventsManager } from '~managers/track/events/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const START_DELAY_MS = 3000;

const formatter = formatMsg.bind(null, 'events-manager');

export function eventsManager(
  settings: FsSettings,
  eventManager: IEventManager,
): IEventsManager {
  const {
    log,
    context,
    tracking: {
      events: { pushRate },
    },
  } = settings;

  const cache = new EventsCache(settings, flushQueue);

  const { track } = apiClientFactory(settings);

  let timeout: number | NodeJS.Timeout;
  const interval = pushRate * 1000;

  async function batchSend() {
    if (cache.isEmpty()) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(batchSend, interval);
      return;
    }

    const sendQueue = cache.pop();

    track
      .sdkTrackControllerPostBatchEvents({
        context,
        events: sendQueue,
      })
      .then(() => {
        log.debug(
          `${formatter(MESSAGE.TRACK_BATCH_SENT)} (${sendQueue.length} events)`,
        );
      })
      .catch(async (e: unknown) => {
        const error = ServiceErrorFactory.create(e);
        log.error(
          formatter(MESSAGE.TRACK_SEND_FAIL),
          error.path,
          error.errorCode,
          error.message,
        );
        eventManager.emit(FsEvent.ERROR, {
          type: 'api',
          error: error,
        });
      })
      .finally(() => {
        timeout = setTimeout(batchSend, interval);
      });
  }

  async function flushQueue() {
    log.debug(formatter(MESSAGE.TRACK_FLUSHING));
    await batchSend();
  }

  function start() {
    log.debug(`${formatter(MESSAGE.TRACK_STARTING)} (${START_DELAY_MS}ms)`);
    timeout = setTimeout(batchSend, START_DELAY_MS);
  }

  function flushQueueAndStop() {
    flushQueue().finally(() => {
      stopSubmitter();
    });
  }

  function stopSubmitter() {
    if (timeout) {
      log.debug(formatter(MESSAGE.TRACK_STOPPING));
      clearTimeout(timeout);
    }
  }

  return {
    start,
    stopSubmitter,
    flushQueueAndStop,
    pop: () => cache.pop(),
    isEmpty: () => cache.isEmpty(),
    track: cache.track.bind(cache),
  };
}
