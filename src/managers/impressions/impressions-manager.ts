import { apiClientFactory } from '../../api/clients/api-client';
import { FsSettings } from '../../config/types';
import { ImpressionsManager } from './types';
import { ServiceErrorFactory } from '../../api/error/service-error-factory';
import { EventManager, FsEvent } from '../events/types';
import { ImpressionsCache } from '../storage/caches/impressions-cache';

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
        log.debug(`Batch sent ${sendQueue.length} impressions`);
      })
      .catch(async (e: unknown) => {
        const error = ServiceErrorFactory.create(e);
        log.error('Batch impression send failed', [
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
    log.debug('Flushing impressions queue');
    await batchSend();
  }

  function start() {
    log.debug('Impressions queue started');
    timeout = setTimeout(batchSend, interval);
  }

  function stop() {
    flushQueue().then(() => {
      if (timeout) {
        log.debug('Impression queue stopped');
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
