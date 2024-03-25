import { SdkImpression, SdkUserContext } from '../../api/data-contracts';
import { apiClientFactory } from '../../api/clients/api-client';
import { FsSettings } from '../../config/types';
import { ImpressionsManager } from './types';
import { EventManager, FsEvent } from '../../events/types';
import { ServiceErrorFactory } from '../../api/error/service-error-factory';

export function impressionsManager(
  settings: FsSettings,
  eventManager: EventManager,
): ImpressionsManager {
  const {
    log,
    core,
    events: { impressions },
  } = settings;

  const queue: SdkImpression[] = [];

  const { events } = apiClientFactory(settings);

  const context: SdkUserContext = {
    key: core.key,
    email: core.attributes?.email,
    custom: core.attributes ?? {},
  };

  let timeout: number;
  const interval = impressions.pushRate * 1000;

  async function batchSend() {
    const sendQueue = queue.splice(0, queue.length);
    if (sendQueue.length === 0) {
      log.debug('Impressions queue empty');
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(batchSend, interval);
      return;
    }

    log.debug('Flushing impressions queue');

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
    enqueue: (event: SdkImpression) => {
      queue.push(event);
      log.debug('Event enqueued:', [event.flagKey, event.flagValue]);
      if (queue.length >= impressions.maxQueueSize) {
        flushQueue();
      }
    },
  };
}
