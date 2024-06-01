import { FsFlagSet, FsSettings, StorageType } from '~config/types';

import { FsEvent, FsIntervalEvent, IEventManager } from '~managers/event/types';
import { isLocalStorageAvailable } from '~managers/storage/is-local-storage-available';
import { localStorageManager } from '~managers/storage/localstorage-manager';
import { memoryManager } from '~managers/storage/memory-manager';
import { IStoreManager } from '~managers/storage/types';

const logPrefix = 'storage-manager-factory';

export function storageManagerFactory(
  params: FsSettings,
  eventManager: IEventManager,
): IStoreManager {
  const { storage, log } = params;

  let manager: IStoreManager;

  if (storage.type === StorageType.LocalStorage) {
    if (isLocalStorageAvailable()) {
      manager = localStorageManager(params);
      log.info(`${logPrefix}: SDK ready from store'`);
      eventManager.emit(FsEvent.SDK_READY_FROM_STORE);
    } else {
      log.warn(
        `${logPrefix}: LocalStorage not available, falling back to memory store`,
      );
      manager = memoryManager(params);
    }
  } else {
    manager = memoryManager(params);
  }

  /**
   * The sync managers emit an internal event when an update is received, either
   * by stream or poll. Streaming updates only include the changed flags, while
   * poll updates include the entire flag set. The storage manager spreads
   * the update, partial or full.
   */
  eventManager.internal.on(
    FsIntervalEvent.UPDATE_RECEIVED,
    (flagSet: FsFlagSet) => {
      manager.set(flagSet);
      eventManager.emit(FsEvent.SDK_UPDATE);
    },
  );

  return manager;
}
