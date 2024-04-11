import { EventSource } from 'extended-eventsource';

import { FsFlagSet, FsSettings } from '../../config/types';
import { SyncManager } from './types';
import { EventManager, FsIntervalEvent } from '../events/types';

const logPrefix = 'stream-manager';

export const streamManager = (
  settings: FsSettings,
  eventManager: EventManager,
): SyncManager => {
  const { urls, log, context } = settings;

  let es: EventSource;

  function start() {
    /**
     * Create a new EventSource instance and listen for incoming flag updates.
     */
    es = new EventSource(`${urls.sdk}/sse/sdk-updates`, {
      withCredentials: true,
      disableLogger: true,
      headers: {
        'x-ridgeline-key': settings.sdkKey,
        'x-ridgeline-user-ctx': JSON.stringify(context),
      },
    });

    /**
     * For debug only
     */
    es.onopen = () => {
      log.debug(`${logPrefix}: connection established`);
    };

    /**
     * When a message is received, parse the JSON and emit an event
     * to the event manager. This is only a partial update, that is,
     * the flag that changed.
     * @param event
     */
    es.onmessage = (event: MessageEvent<any>) => {
      try {
        const flagSet = JSON.parse(event.data) as FsFlagSet;
        log.debug(`${logPrefix}: message received`);
        eventManager.internal.emit(FsIntervalEvent.UPDATE_RECEIVED, flagSet);
      } catch (error) {
        log.error(`${logPrefix}: malformed message event`, [error?.toString()]);
      }
    };

    es.onerror = (event: Event) => {
      switch (es.readyState) {
        case es.CONNECTING:
          log.debug(`${logPrefix}: reestablishing connection`);
          break;
        case es.OPEN:
          log.debug(`${logPrefix}: connection is open`);
          break;
        case es.CLOSED:
          log.debug(`${logPrefix}: ungraceful connection close`);
          break;
        default:
          log.debug(`${logPrefix} unknown error state "${es.readyState}"`, [
            event.toString(),
          ]);
      }
    };
  }

  function stop() {
    if (es) {
      log.debug(`${logPrefix}: gracefully closing event stream`);
      es.close();
    }
  }

  return {
    start,
    stop,
  };
};
