import { FsSettings } from '~config/types.internal';

import {
  SdkTrackEventRequest,
  SdkTrackImpressionsRequest,
} from '~api/data-contracts';

import { IBeaconManager } from '~managers/track/beacon/types';
import { IEventsManager } from '~managers/track/events/types';
import { IImpressionsManager } from '~managers/track/impressions/types';
import { canListenToDocument, canListenToWindow } from '~managers/track/utils';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const formatter = formatMsg.bind(null, 'beacon-manager');

const EVENT = {
  PAGE_HIDE: 'pagehide',
  VISIBILITY_CHANGE: 'visibilitychange',
};

export function beaconManager(
  settings: FsSettings,
  eventsManager: IEventsManager,
  impressionsManager: IImpressionsManager,
): IBeaconManager {
  const { log } = settings;

  /**
   * Add event listeners to the document and window objects.
   * Flush the queues when the page is hidden or the window is closed.
   *
   * It's possible both of these events will fire at the same time, in these
   * cases, the first event will flush the queues and the second event will
   * not have any data to send.
   */
  function start() {
    if (canListenToDocument()) {
      document.addEventListener(EVENT.VISIBILITY_CHANGE, flushQueuesIfHidden);
    }
    if (canListenToWindow()) {
      window.addEventListener(EVENT.PAGE_HIDE, flushQueues);
    }
  }

  /**
   * Remove the event listeners from the document and window objects.
   */
  function stopEventListeners() {
    if (canListenToDocument()) {
      document.removeEventListener(
        EVENT.VISIBILITY_CHANGE,
        flushQueuesIfHidden,
      );
    }
    if (canListenToWindow()) {
      window.removeEventListener(EVENT.PAGE_HIDE, flushQueues);
    }
  }

  /**
   * When the BeaconManager is killed, flush the queues with the pseudo-Beacon
   * requests, then remove the event listeners, and stop the submitters.
   */
  function kill() {
    flushQueues();
    stopEventListeners();
    impressionsManager.stopSubmitter();
    eventsManager.stopSubmitter();
  }

  function flushQueuesIfHidden() {
    if (document.visibilityState === 'hidden') {
      log.debug(formatter(MESSAGE.BEACON_FLUSHING_HIDDEN));
      flushQueues();
    }
  }

  /**
   * Flush the queues with the pseudo-Beacon requests.
   */
  function flushQueues() {
    const { urls, context } = settings;
    log.debug(formatter(MESSAGE.BEACON_FLUSHING));

    if (!impressionsManager.isEmpty()) {
      const impressions = impressionsManager.pop();
      _sendBeacon(`${urls.sdk}/track/impressions`, {
        context,
        impressions,
      });
    }

    if (!eventsManager.isEmpty()) {
      const events = eventsManager.pop();
      _sendBeacon(`${urls.sdk}/track/events`, {
        context,
        events,
      });
    }
  }

  /**
   * This is not a true Beacon request, but rather /POST with "keepalive"
   * is non-blocking and Chrome will allow it, and we can also send
   * headers in this request, which Beacon does not support.
   *
   * https://developer.mozilla.org/en-US/docs/Web/API/Beacon_API
   * @param url
   * @param payload
   * @private
   */
  function _sendBeacon(
    url: string,
    payload: SdkTrackEventRequest | SdkTrackImpressionsRequest,
  ) {
    try {
      fetch(url, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          'x-ridgeline-key': settings.sdkKey,
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      log.error(`${formatter(MESSAGE.BEACON_FAILED)} ${url}`);
      console.log(e);
    }
  }

  return {
    start,
    kill,
  };
}
