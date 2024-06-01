import { FsSettings } from '~config/types';

import { IEventManager } from '~managers/event/types';
import { eventsManagerFactory } from '~managers/track/events/events-manager-factory';
import { impressionsManagerFactory } from '~managers/track/impressions/impressions-manager-factory';
import { TrackManager } from '~managers/track/types';

const logPrefix = 'track-manager';

const PAGE_HIDE_EVENT = 'pagehide';
const VISIBILITY_CHANGE_EVENT = 'visibilitychange';

function canSendBeacon() {
  return typeof navigator !== 'undefined' && navigator.sendBeacon;
}

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

  function flushWithBeacon() {
    log.debug(`${logPrefix}: flushing with beacon`);

    const impressions = impressionsManager.pop();
    const events = eventsManager.pop();

    if (impressions.length > 0) {
      try {
        const payload = JSON.stringify(impressions);
        navigator.sendBeacon(`${urls.sdk}/track/impressions`, payload);
      } catch (e) {
        log.error(`${logPrefix}: failed to send impressions with beacon`);
        console.log(e);
      }
    }

    if (events.length > 0) {
      try {
        const payload = JSON.stringify(events);
        navigator.sendBeacon(`${urls.sdk}/track/events`, payload);
      } catch (e) {
        log.error(`${logPrefix}: failed to send events with beacon`);
        console.log(e);
      }
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

  /**
   * Stops the track manager. If the browser supports sendBeacon, it will flush
   * the queues with it, and also clear any pending timeouts. Otherwise, it will
   * stop the impressions and events managers via the XHR transport.
   */
  function stop() {
    if (canSendBeacon()) {
      flushWithBeacon();
      impressionsManager.softStop();
      eventsManager.softStop();
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
