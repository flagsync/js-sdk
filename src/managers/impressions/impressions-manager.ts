import { apiClientFactory } from '../../api/clients/api-client';
import { FsSettings } from '../../config/types';
import { ImpressionsManager } from './types';
import { ServiceErrorFactory } from '../../api/error/service-error-factory';
import { EventManager, FsEvent } from '../events/types';
import { ImpressionsCache } from '../storage/caches/impressions-cache';

const logPrefix = 'impressions-manager';

export function impressionsManager(
  settings: FsSettings,
  eventManager: EventManager,
): ImpressionsManager {
  const {
    log,
    context,
    events: { impressions },
  } = settings;

  const cache = new ImpressionsCache(settings, flushQueue);
  cache.setOnFullQueueCb(flushQueue);

  const { events } = apiClientFactory(settings);

  let timeout: number | NodeJS.Timeout;
  const interval = impressions.pushRate * 1000;

  async function batchSend() {
    if (cache.isEmpty()) {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(batchSend, interval);
      return;
    }

    const sendQueue = cache.pop();

    events
      .sdkEventControllerPostBatchImpressions({
        context,
        impressions: sendQueue,
      })
      .then(() => {
        log.debug(`${logPrefix}: batch sent ${sendQueue.length} impressions`);
      })
      .catch(async (e: unknown) => {
        const error = ServiceErrorFactory.create(e);
        log.error(`${logPrefix}: batch impression send failed`, [
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
    log.debug(`${logPrefix}: flushing impressions queue`);
    await batchSend();
  }

  function start() {
    log.debug(`${logPrefix}: impressions submitter started`);
    timeout = setTimeout(batchSend, interval);
  }

  function stop() {
    flushQueue().then(() => {
      if (timeout) {
        log.debug(`${logPrefix}: gracefully stopping impressions submitter`);
        clearTimeout(timeout);
      }
    });
  }

  return {
    start,
    stop,
    cache,
  };
}
