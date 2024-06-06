import { FsEvent, IEventManager } from '~sdk/modules/event/types';
import { PollManager } from '~sdk/modules/sync/PollManager';
import { StreamManager } from '~sdk/modules/sync/StreamManager';

import { Platform, SyncType } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { Sdk } from '~api/sdk';

import { ISyncManager } from './types';

export class SyncManagerFactory {
  private readonly settings: FsSettings;
  private readonly eventManager: IEventManager;
  private readonly sdk: Sdk<any>;

  constructor(
    settings: FsSettings,
    eventManager: IEventManager,
    sdk: Sdk<any>,
  ) {
    this.settings = settings;
    this.eventManager = eventManager;
    this.sdk = sdk;
  }

  public createManager(): ISyncManager {
    const { sync, platform } = this.settings;
    let manager: ISyncManager;

    if (platform === Platform.Browser) {
      switch (sync.type) {
        case SyncType.Poll:
          manager = new PollManager(this.settings, this.eventManager, this.sdk);
          break;
        case SyncType.Stream:
          manager = new StreamManager(this.settings, this.eventManager);
          break;
        default:
          manager = this.createNoopSyncManager();
          break;
      }
    } else {
      manager = this.createNoopSyncManager();
    }

    this.eventManager.once(FsEvent.SDK_READY, () => {
      manager.start();
    });

    return manager;
  }

  private createNoopSyncManager(): ISyncManager {
    const noop = () => {};
    return {
      start: noop,
      kill: noop,
    };
  }
}
