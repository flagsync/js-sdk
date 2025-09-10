import { EventSource } from 'extended-eventsource';

import type { FsFlagSet } from '~config/types';
import type { FsSettings } from '~config/types.internal';

import { FsIntervalEvent, IEventManager } from '~managers/event/types';
import type { ISyncManager } from '~managers/sync/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const formatter = formatMsg.bind(null, 'stream-manager');

export const streamManager = (
  settings: FsSettings,
  eventManager: IEventManager,
): ISyncManager => {
  const { urls, log, context } = settings;

  let es: EventSource;

  function start() {
    /**
     * Create a new EventSource instance and listen for incoming flag updates.
     */
    es = new EventSource(
      `${urls.sse}/sse/sdk-updates/client?timestamp=${new Date().getTime()}`,
      {
        withCredentials: true,
        disableLogger: true,
        headers: {
          'x-ridgeline-key': settings.sdkKey,
          'x-ridgeline-user-ctx': JSON.stringify(context),
        },
      },
    );

    /**
     * For debug only
     */
    es.onopen = () => {
      log.debug(formatter(MESSAGE.STREAM_CONNECTED));
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
        log.debug(formatter(MESSAGE.STREAM_MESSAGE_RECEIVED));
        eventManager.internal.emit(FsIntervalEvent.UPDATE_RECEIVED, flagSet);
      } catch (error) {
        log.error(formatter(MESSAGE.STREAM_MALFORMED_EVENT), error?.toString());
      }
    };

    es.onerror = (event: Event) => {
      switch (es.readyState) {
        case es.CONNECTING:
          log.debug(formatter(MESSAGE.STREAM_RECONNECT));
          break;
        case es.OPEN:
          log.debug(formatter(MESSAGE.STREAM_CONN_OPEN));
          break;
        case es.CLOSED:
          log.debug(formatter(MESSAGE.STREAM_CONN_CLOSE));
          break;
        default:
          log.debug(
            `${formatter(MESSAGE.STREAM_UNKNOWN_EVENT_STATE)}: "${es.readyState}"`,
            event.toString(),
          );
      }
    };
  }

  function kill() {
    if (es) {
      log.debug(formatter(MESSAGE.STREAM_CONN_CLOSING));
      es.close();
    }
  }

  return {
    start,
    kill,
  };
};
