import { FsSettings } from '~config/types';

import { apiClientFactory } from '~api/clients/api-client';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

import { FsEvent, IEventManager } from '~managers/event/types';
import { EventsCache } from '~managers/track/events/events-cache';
import { IEventsManager } from '~managers/track/events/types';

const logPrefix = 'events-manager';

const START_DELAY_MS = 3000;

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
        log.debug(`${logPrefix}: batch sent ${sendQueue.length} events`);
      })
      .catch(async (e: unknown) => {
        const error = ServiceErrorFactory.create(e);
        log.error(`${logPrefix}: batch send failed`, [
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
        timeout = setTimeout(batchSend, interval);
      });
  }

  async function flushQueue() {
    log.debug(`${logPrefix}: flushing queue`);
    await batchSend();
  }

  function start() {
    log.debug(`${logPrefix}: submitter starting in ${START_DELAY_MS}ms`);
    timeout = setTimeout(batchSend, START_DELAY_MS);
  }

  function stop() {
    flushQueue().then(() => {
      if (timeout) {
        log.debug(`${logPrefix}: gracefully stopping submitter`);
        clearTimeout(timeout);
      }
    });
  }

  return {
    start,
    stop,
    track: cache.track.bind(cache),
  };
}
