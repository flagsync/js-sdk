import { EventSource } from 'extended-eventsource';

import { FsIntervalEvent, IEventManager } from '~sdk/modules/event/types';

import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { ILogger } from '~logger/types';

import { ISyncManager } from './types';

const MESSAGE = {
  CONNECTED: 'connection established',
  MESSAGE: 'message received',
  OPEN: 'connection is open',
  CLOSED: 'ungraceful connection close',
  CLOSING: 'gracefully closing event stream',
  RECONNECT: 'reestablishing connection',
  MALFORMED: 'malformed message event',
} as const;

export class StreamManager implements ISyncManager {
  private readonly prefix = 'stream-manager';

  private readonly settings: FsSettings;
  private readonly eventManager: IEventManager;
  private readonly log: ILogger;

  private es: EventSource | undefined;

  constructor(settings: FsSettings, eventManager: IEventManager) {
    this.settings = settings;
    this.eventManager = eventManager;
    this.log = settings.log;
  }

  public start(): void {
    const { urls, context } = this.settings;

    /**
     * Create a new EventSource instance and listen for incoming flag updates.
     */
    this.es = new EventSource(`${urls.sdk}/sse/sdk-updates`, {
      withCredentials: true,
      disableLogger: true,
      headers: {
        'x-ridgeline-key': this.settings.sdkKey,
        'x-ridgeline-user-ctx': JSON.stringify(context),
      },
    });

    /**
     * For debug only
     */
    this.es.onopen = () => {
      this.log.debug(this.buildMessage(MESSAGE.CONNECTED));
    };

    /**
     * When a message is received, parse the JSON and emit an event
     * to the event manager. This is only a partial update, that is,
     * the flag that changed.
     * @param event
     */
    this.es.onmessage = (event: MessageEvent<any>) => {
      try {
        const flagSet = JSON.parse(event.data) as FsFlagSet;
        this.log.debug(this.buildMessage(MESSAGE.MESSAGE));
        this.eventManager.internal.emit(
          FsIntervalEvent.UPDATE_RECEIVED,
          flagSet,
        );
      } catch (error) {
        this.log.error(this.buildMessage(MESSAGE.MALFORMED), error?.toString());
      }
    };

    this.es.onerror = (event: Event) => {
      switch (this.es!.readyState) {
        case this.es!.CONNECTING:
          this.log.debug(this.buildMessage(MESSAGE.RECONNECT));
          break;
        case this.es!.OPEN:
          this.log.debug(this.buildMessage(MESSAGE.OPEN));
          break;
        case this.es!.CLOSED:
          this.log.debug(this.buildMessage(MESSAGE.CLOSED));
          break;
        default:
          this.log.debug(
            `${this.prefix} unknown error state "${this.es!.readyState}"`,
            event.toString(),
          );
      }
    };
  }

  public kill(): void {
    if (this.es) {
      this.log.debug(this.buildMessage(MESSAGE.CLOSING));
      this.es.close();
    }
  }

  private buildMessage(message: (typeof MESSAGE)[keyof typeof MESSAGE]) {
    return `${this.prefix}: ${message}`;
  }
}
