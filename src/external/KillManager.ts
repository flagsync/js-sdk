import { FsEvent, IEventManager } from '~sdk/modules/event/types';
import { ISyncManager } from '~sdk/modules/sync/types';
import { ITrackManager } from '~sdk/modules/track/types';

import { FsSettings } from '~config/types.internal';

import { ILogger } from '~logger/types';

const MESSAGE = {
  KILLING: 'SDK shutting down',
  ALREADY_HANDLING: 'already handling kill, skipping...',
} as const;

export class KillManager {
  private killing = false;
  private readonly prefix = 'kill-manager';

  private log: ILogger;

  constructor(
    private settings: FsSettings,
    private readonly syncManager: ISyncManager,
    private readonly trackManager: ITrackManager,
    private readonly eventManager: IEventManager,
  ) {
    this.log = settings.log;

    const boundKill = this.kill.bind(this);

    if (typeof window === 'undefined') {
      process.on('exit', boundKill); // Process termination event
      process.on('SIGINT', boundKill); // Signal handling (SIGINT)
      process.on('SIGTERM', boundKill); // Signal handling (SIGTERM)
    }
  }

  public kill() {
    if (!this.killing) {
      this.killing = true;
      this.log.info(this.buildMessage(MESSAGE.KILLING));
      for (const eventKey in FsEvent) {
        this.eventManager.off(FsEvent[eventKey as keyof typeof FsEvent]);
      }
      this.syncManager.kill();
      this.trackManager.kill();
      this.eventManager.kill();
    } else {
      this.log.info(this.buildMessage(MESSAGE.ALREADY_HANDLING));
    }
  }

  private buildMessage(message: (typeof MESSAGE)[keyof typeof MESSAGE]) {
    return `${this.prefix}: ${message}`;
  }
}
