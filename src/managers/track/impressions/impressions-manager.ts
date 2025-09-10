import type { FsSettings } from '~config/types.internal';

import { Track } from '~api/clients/track-client';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

import { FsEvent, IEventManager } from '~managers/event/types';
import { ImpressionsCache } from '~managers/track/impressions/impressions-cache';
import type {
  IImpressionsManager,
  PartialTrackImpression,
} from '~managers/track/impressions/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const START_DELAY_MS = 3000;

const formatter = formatMsg.bind(null, 'impressions-manager');

export function impressionsManager(
  settings: FsSettings,
  track: Track,
  eventManager: IEventManager,
): IImpressionsManager {
  const {
    log,
    context,
    sdkContext,
    tracking: {
      impressions: { pushRateInSec },
    },
  } = settings;

  const cache = new ImpressionsCache(settings, flushQueue);

  let timeout: number | NodeJS.Timeout;
  const interval = pushRateInSec * 1000;

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
      .sdkTrackControllerPostClientBatchImpressions({
        context,
        impressions: sendQueue,
        sdkContext,
      })
      .then(() => {
        log.debug(
          `${formatter(MESSAGE.TRACK_BATCH_SENT)} (${sendQueue.length} impressions)`,
        );
      })
      .catch(async (e: unknown) => {
        const error = await ServiceErrorFactory.create(e);
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

  function publicTrack(impression: PartialTrackImpression) {
    cache.track({
      ...impression,
      timestamp: new Date().toISOString(),
    });
  }

  return {
    start,
    flushQueueAndStop,
    stopSubmitter,
    pop: () => cache.pop(),
    isEmpty: () => cache.isEmpty(),
    track: publicTrack,
  };
}
