import {
  FsEvent,
  FsIntervalEvent,
  IEventManager,
} from '~sdk/modules/event/types';
import { ISyncManager } from '~sdk/modules/sync/types';

import { FsSettings } from '~config/types.internal';

import { ServiceErrorFactory } from '~api/error/service-error-factory';
import { Sdk } from '~api/sdk';

import { ILogger } from '~logger/types';

const MESSAGE = {
  STARTED: 'polling started',
  SUCCESS: 'polling success',
  FAILED: 'polling failed',
  STOPPED: 'gracefully stopping poller',
} as const;

export class PollManager implements ISyncManager {
  private readonly prefix = 'poll-manager';

  private readonly settings: FsSettings;
  private readonly eventManager: IEventManager;
  private readonly sdk: Sdk<any>;
  private readonly interval: number;
  private readonly log: ILogger;

  private timeout: number | NodeJS.Timeout | undefined;

  constructor(
    settings: FsSettings,
    eventManager: IEventManager,
    sdk: Sdk<any>,
  ) {
    this.sdk = sdk;
    this.log = settings.log;
    this.settings = settings;
    this.eventManager = eventManager;
    this.interval = settings.sync.pollRate * 1000;
  }

  public start(): void {
    this.log.debug(this.buildMessage(MESSAGE.STARTED));
    this.timeout = setTimeout(this.poll.bind(this), this.interval);
  }

  public kill(): void {
    if (this.timeout) {
      this.log.debug(this.buildMessage(MESSAGE.STOPPED));
      clearTimeout(this.timeout);
    }
  }

  private poll(): void {
    const { context } = this.settings;

    this.sdk
      .sdkControllerGetFlags({
        context,
      })
      .then((res) => {
        this.log.debug(this.buildMessage(MESSAGE.SUCCESS));
        this.eventManager.internal.emit(
          FsIntervalEvent.UPDATE_RECEIVED,
          res?.flags ?? {},
        );
      })
      .catch(async (e: unknown) => {
        const error = ServiceErrorFactory.create(e);
        this.log.error(this.buildMessage(MESSAGE.FAILED), [
          error.path,
          error.errorCode,
          error.message,
        ]);

        this.eventManager.emit(FsEvent.ERROR, {
          type: 'api',
          error: error,
        });
      })
      .finally(() => {
        this.timeout = setTimeout(this.poll.bind(this), this.interval);
      });
  }

  private buildMessage(message: (typeof MESSAGE)[keyof typeof MESSAGE]) {
    return `${this.prefix}: ${message}`;
  }
}
