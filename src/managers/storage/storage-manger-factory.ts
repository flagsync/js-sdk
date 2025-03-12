import { FsFlagSet, StorageType } from '~config/types';
import type { FsSettings } from '~config/types.internal';

import { FsEvent, FsIntervalEvent, IEventManager } from '~managers/event/types';
import { isLocalStorageAvailable } from '~managers/storage/is-local-storage-available';
import { localStorageManager } from '~managers/storage/localstorage-manager';
import { memoryManager } from '~managers/storage/memory-manager';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

import type { IStoreManager } from './types';

const formatter = formatMsg.bind(null, 'storage-manager-factory');

export function storageManagerFactory(
  params: FsSettings,
  eventManager: IEventManager,
): IStoreManager {
  console.log('Initializing storageManagerFactory');

  const { storage, log } = params;

  let manager: IStoreManager;

  if (storage.type === StorageType.LocalStorage) {
    if (isLocalStorageAvailable()) {
      manager = localStorageManager(params);
      log.info(formatter(MESSAGE.STORAGE_READY));
      eventManager.emit(FsEvent.SDK_READY_FROM_STORE);
    } else {
      log.warn(formatter(MESSAGE.STORAGE_FALLBACK));
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
