import {
  FsEvent,
  FsIntervalEvent,
  IEventManager,
} from '~sdk/modules/event/types';
import { LocalStorageManager } from '~sdk/modules/storage/LocalStorageManager';
import { MemoryManager } from '~sdk/modules/storage/MemoryManager';
import { IStoreManager } from '~sdk/modules/storage/types';
import { isLocalStorageAvailable } from '~sdk/modules/storage/utils';

import { FsFlagSet, StorageType } from '~config/types';
import { FsSettings } from '~config/types.internal';

const MESSAGE = {
  FALLBACK: 'LocalStorage not available, falling back to memory store',
  READY: 'SDK ready from store',
} as const;

export class StorageManagerFactory {
  private readonly prefix = 'storage-manager-factory';

  constructor(
    private readonly settings: FsSettings,
    private readonly eventManager: IEventManager,
  ) {}

  public createManager(): IStoreManager {
    const { storage, log } = this.settings;
    let manager: IStoreManager;

    if (storage.type === StorageType.LocalStorage) {
      if (isLocalStorageAvailable()) {
        manager = new LocalStorageManager(this.settings);
        log.info(this.buildMessage(MESSAGE.FALLBACK));
        this.eventManager.emit(FsEvent.SDK_READY_FROM_STORE);
      } else {
        log.warn(this.buildMessage(MESSAGE.READY));
        manager = new MemoryManager(this.settings);
      }
    } else {
      manager = new MemoryManager(this.settings);
    }

    this.eventManager.internal.on(
      FsIntervalEvent.UPDATE_RECEIVED,
      (flagSet: FsFlagSet) => {
        manager.set(flagSet);
        this.eventManager.emit(FsEvent.SDK_UPDATE);
      },
    );

    return manager;
  }

  private buildMessage(message: (typeof MESSAGE)[keyof typeof MESSAGE]) {
    return `${this.prefix}: ${message}`;
  }
}
