import type { FsSettings } from '~config/types.internal';

import type {
  SdkClientTrackEventRequest,
  SdkClientTrackImpressionsRequest,
} from '~api/data-contracts';

import type { IBeaconManager } from '~managers/track/beacon/types';
import type { IEventsManager } from '~managers/track/events/types';
import type { IImpressionsManager } from '~managers/track/impressions/types';
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
    const { urls, context, sdkContext } = settings;

    if (!impressionsManager.isEmpty()) {
      const impressions = impressionsManager.pop();
      log.debug(
        `${formatter(MESSAGE.BEACON_FLUSHING)} (${impressions.length} impressions)`,
      );
      _sendBeacon(`${urls.events}/track/impressions/client`, {
        context,
        impressions,
        sdkContext,
      });
    }

    if (!eventsManager.isEmpty()) {
      const events = eventsManager.pop();
      log.debug(
        `${formatter(MESSAGE.BEACON_FLUSHING)} (${events.length} events)`,
      );
      _sendBeacon(`${urls.events}/track/events/client`, {
        context,
        events,
        sdkContext,
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
    payload: SdkClientTrackEventRequest | SdkClientTrackImpressionsRequest,
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
