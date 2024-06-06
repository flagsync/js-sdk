import { IBeaconManager } from '~sdk/modules/track/beacon/types';
import { IEventsManager } from '~sdk/modules/track/events/types';
import { IImpressionsManager } from '~sdk/modules/track/impressions/types';
import {
  canListenToDocument,
  canListenToWindow,
} from '~sdk/modules/track/utils';

import { FsSettings } from '~config/types.internal';

import {
  SdkTrackEventRequest,
  SdkTrackImpressionsRequest,
} from '~api/data-contracts';

import { ILogger } from '~logger/types';

const EVENT = {
  PAGE_HIDE: 'pagehide',
  VISIBILITY_CHANGE: 'visibilitychange',
};

const MESSAGE = {
  FLUSHING_BEACON: 'flushing with beacon',
  FLUSHING_HIDDEN: 'flushing with beacon (hidden)',
  FAILED_TO_SEND: 'failed to send with beacon to',
} as const;

export class BeaconManager implements IBeaconManager {
  private readonly prefix = 'beacon-manager';

  private readonly settings: FsSettings;
  private readonly impressionsManager: IImpressionsManager;
  private readonly eventsManager: IEventsManager;
  private readonly log: ILogger;

  constructor(
    settings: FsSettings,
    impressionsManager: IImpressionsManager,
    eventsManager: IEventsManager,
  ) {
    this.settings = settings;
    this.impressionsManager = impressionsManager;
    this.eventsManager = eventsManager;
    this.log = settings.log;
  }

  /**
   * Add event listeners to the document and window objects.
   * Flush the queues when the page is hidden or the window is closed.
   *
   * It's possible both of these events will fire at the same time, in these
   * cases, the first event will flush the queues and the second event will
   * not have any data to send.
   */
  public start(): void {
    if (canListenToDocument()) {
      document.addEventListener(
        EVENT.VISIBILITY_CHANGE,
        this.flushIfHiddenWithBeacon.bind(this),
      );
    }
    if (canListenToWindow()) {
      window.addEventListener(EVENT.PAGE_HIDE, this.flushWithBeacon.bind(this));
    }
  }

  /**
   * When the BeaconManager is killed, flush the queues with the pseudo-Beacon
   * requests, then remove the event listeners, and stop the submitters.
   */
  public kill(): void {
    const { impressionsManager, eventsManager } = this;
    impressionsManager.kill();
    eventsManager.kill();
    this.flushWithBeacon();
  }

  private stopEventListeners(): void {
    if (canListenToDocument()) {
      document.removeEventListener(
        EVENT.VISIBILITY_CHANGE,
        this.flushIfHiddenWithBeacon.bind(this),
      );
    }
    if (canListenToWindow()) {
      window.removeEventListener(
        EVENT.PAGE_HIDE,
        this.flushWithBeacon.bind(this),
      );
    }
  }

  private flushWithBeacon(): void {
    const { urls, context } = this.settings;
    this.log.debug(this.buildMessage(MESSAGE.FLUSHING_BEACON));

    if (!this.impressionsManager.isEmpty()) {
      const impressions = this.impressionsManager.pop();
      this._sendBeacon(`${urls.sdk}/track/impressions`, {
        context,
        impressions,
      });
    }

    if (!this.eventsManager.isEmpty()) {
      const events = this.eventsManager.pop();
      this._sendBeacon(`${urls.sdk}/track/events`, {
        context,
        events,
      });
    }
  }

  private flushIfHiddenWithBeacon(): void {
    const { log } = this.settings;
    if (document.visibilityState === 'hidden') {
      log.debug(this.buildMessage(MESSAGE.FLUSHING_HIDDEN));
      this.flushWithBeacon();
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
  private _sendBeacon(
    url: string,
    payload: SdkTrackEventRequest | SdkTrackImpressionsRequest,
  ): void {
    const { log } = this.settings;
    try {
      fetch(url, {
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
          'x-ridgeline-key': this.settings.sdkKey,
        },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      log.error(`${this.buildMessage(MESSAGE.FAILED_TO_SEND)} ${url}`);
      console.error(e);
    }
  }

  private buildMessage(message: string) {
    return `${this.prefix}: ${message}`;
  }
}
