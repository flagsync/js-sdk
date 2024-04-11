import { FsSettings } from '~config/types';

import { apiClientFactory } from '~api/clients/api-client';
import { SdkTrackImpression } from '~api/data-contracts';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

import { FsEvent, IEventManager } from '~managers/event/types';
import { TrackCache } from '~managers/track/caches/track-cache';
import { ImpressionLogStrategy } from '~managers/track/impressions/impressions-log-strategy';
import { IImpressionsManager } from '~managers/track/impressions/types';

const logPrefix = 'impressions-manager';

const START_DELAY_MS = 3000;

export function impressionsManager(
  settings: FsSettings,
  eventManager: IEventManager,
): IImpressionsManager {
  const {
    log,
    context,
    tracking: {
      impressions: { maxQueueSize, pushRate },
    },
  } = settings;

  const cache = new TrackCache<SdkTrackImpression>({
    log,
    maxQueueSize,
    logPrefix: 'impressions-cache',
    logStrategy: new ImpressionLogStrategy(),
    onFullQueue: flushQueue,
  });

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
      .sdkTrackControllerPostBatchImpressions({
        context,
        impressions: sendQueue,
      })
      .then(() => {
        log.debug(`${logPrefix}: batch sent ${sendQueue.length} impressions`);
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
