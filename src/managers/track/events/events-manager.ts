import { FsSettings } from '../../../config/types';
import { EventManager, FsEvent } from '../../event/types';
import { EventsManager } from './types';
import { apiClientFactory } from '../../../api/clients/api-client';
import { ServiceErrorFactory } from '../../../api/error/service-error-factory';
import { TrackCache } from '../caches/track-cache';
import { SdkTrackEvent } from '../../../api/data-contracts';
import { EventLogStrategy } from './events-log-strategy';

const logPrefix = 'events-manager';

const START_DELAY_MS = 3000;

export function eventsManager(
  settings: FsSettings,
  eventManager: EventManager,
): EventsManager {
  const {
    log,
    context,
    tracking: { impressions },
  } = settings;

  const cache = new TrackCache<SdkTrackEvent>({
    settings: settings,
    maxQueueSize: settings.tracking.events.maxQueueSize,
    logPrefix: 'events-cache',
    logStrategy: new EventLogStrategy(),
    onFullQueue: flushQueue,
  });

  const { track } = apiClientFactory(settings);

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
        log.error(`${logPrefix}: batch events send failed`, [
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
    log.debug(`${logPrefix}: flushing events queue`);
    await batchSend();
  }

  function start() {
    log.debug(`${logPrefix}: events submitter starting in ${START_DELAY_MS}ms`);
    timeout = setTimeout(batchSend, START_DELAY_MS);
  }

  function stop() {
    flushQueue().then(() => {
      if (timeout) {
        log.debug(`${logPrefix}: gracefully stopping events submitter`);
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
