import { FsSettings } from '~config/types.internal';

import {
  SdkTrackEventRequest,
  SdkTrackImpressionsRequest,
} from '~api/data-contracts';

import { FsEvent, IEventManager } from '~managers/event/types';
import { eventsManagerFactory } from '~managers/track/events/events-manager-factory';
import { impressionsManagerFactory } from '~managers/track/impressions/impressions-manager-factory';
import { TrackManager } from '~managers/track/types';

const logPrefix = 'track-manager';

const PAGE_HIDE_EVENT = 'pagehide';
const VISIBILITY_CHANGE_EVENT = 'visibilitychange';

function canListenToDocument() {
  return typeof document !== 'undefined' && document.addEventListener;
}

function canListenToWindow() {
  return typeof window !== 'undefined' && window.addEventListener;
}

export function trackManagerFactory(
  settings: FsSettings,
  eventManager: IEventManager,
): TrackManager {
  const { log, urls } = settings;

  const impressionsManager = impressionsManagerFactory(settings, eventManager);
  const eventsManager = eventsManagerFactory(settings, eventManager);

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
      log.error(`${logPrefix}: failed to send with beacon to ${url}`);
      console.log(e);
    }
  }

  function flushWithBeacon() {
    log.debug(`${logPrefix}: flushing with beacon`);

    if (!impressionsManager.isEmpty()) {
      const impressions = impressionsManager.pop();
      _sendBeacon(`${urls.sdk}/track/impressions`, {
        context: settings.context,
        impressions,
      });
    }

    if (!eventsManager.isEmpty) {
      const events = eventsManager.pop();
      _sendBeacon(`${urls.sdk}/track/events`, {
        context: settings.context,
        events,
      });
    }
  }

  function flushIfHiddenWithBeacon() {
    if (document.visibilityState === 'hidden') {
      log.debug(`${logPrefix}: flushing (hidden) with beacon`);
      flushWithBeacon();
    }
  }

  function start() {
    if (canListenToDocument()) {
      document.addEventListener(
        VISIBILITY_CHANGE_EVENT,
        flushIfHiddenWithBeacon,
      );
    }
    if (canListenToWindow()) {
      window.addEventListener(PAGE_HIDE_EVENT, flushWithBeacon);
    }
  }

  eventManager.on(FsEvent.SDK_READY, () => {
    start();
  });

  /**
   * Stops the track manager. If on browser, it will flush the queues with it,
   * and also clear any pending timeouts. Otherwise, it will stop the impressions
   * and events managers via the XHR transport (axios)
   */
  function stop() {
    if (settings.platform === 'browser') {
      impressionsManager.softStop();
      eventsManager.softStop();
      flushWithBeacon();
    } else {
      impressionsManager.stop();
      eventsManager.stop();
    }
  }

  return {
    start,
    stop,
    eventsManager,
    impressionsManager,
  };
}
