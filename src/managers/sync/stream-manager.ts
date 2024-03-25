import EventSource from 'eventsource';
import { EventManager, FsIntervalEvent } from '../../events/types';
import { FsFlagSet, FsSettings } from '../../config/types';
import { SyncManager } from './types';
import { SdkUserContext } from '../../api/data-contracts';

export const streamManager = (
  settings: FsSettings,
  eventManager: EventManager,
): SyncManager => {
  const { urls, log, core } = settings;

  let es: EventSource;

  const context: SdkUserContext = {
    key: core.key,
    email: core.attributes?.email,
    custom: core.attributes ?? {},
  };

  function start() {
    log.debug('Streaming started');

    /**
     * Create a new EventSource instance and listen for incoming flag updates.
     */
    es = new EventSource(`${urls.events}/sdk-updates`, {
      withCredentials: true,
      headers: {
        'x-ridgeline-key': settings.sdkKey,
        'x-ridgeline-user-ctx': JSON.stringify(context),
      },
    });

    /**
     * For debug only
     */
    es.onopen = () => {
      log.debug('EventSource connected');
    };

    /**
     * When a message is received, parse the JSON and emit an event
     * to the event manager. This is only a partial update, that is,
     * the flag that changed.
     * @param event
     */
    es.onmessage = (event: MessageEvent<any>) => {
      const flagSet = JSON.parse(event.data) as FsFlagSet;
      log.debug('Stream event received');
      eventManager.internal.emit(FsIntervalEvent.UPDATE_RECEIVED, flagSet);
    };

    es.onerror = (error: MessageEvent<Event>) => {
      console.error(error);
      log.error('EventSource error', [error.status]);
    };
  }

  function stop() {
    if (es) {
      log.debug('Streaming closed');
      es.close();
    }
  }

  return {
    start,
    stop,
  };
};
