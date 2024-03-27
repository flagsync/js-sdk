import { localStorageManager } from './localstorage-manager';
import { memoryManager } from './memory-manager';
import { isLocalStorageAvailable } from './is-local-storage-available';
import { StoreManager } from './types';
import { FsFlagSet, FsSettings } from '../../config/types';
import { EventManager, FsEvent, FsIntervalEvent } from '../events/types';

const logPrefix = 'storage-manager-factory';

export function storageManagerFactory(
  params: FsSettings,
  eventManager: EventManager,
): StoreManager {
  const { storage, log } = params;

  let manager: StoreManager;

  if (storage.type === 'localstorage') {
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
