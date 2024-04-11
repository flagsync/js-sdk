import { FsFlagSet, FsSettings } from '~config/types';

import { IStoreManager } from '~managers/storage/types';

const logPrefix = 'localstorage-manager';

export function localStorageManager(settings: FsSettings): IStoreManager {
  const { log, bootstrap, storage } = settings;

  let flagSet: FsFlagSet = {
    ...bootstrap,
  };

  function buildKey() {
    return `${storage.prefix}:flags`;
  }

  function set(incoming: FsFlagSet) {
    flagSet = {
      ...flagSet,
      ...incoming,
    };
    log.debug(`${logPrefix}: persisting flags`);
    localStorage.setItem(buildKey(), JSON.stringify(flagSet));
  }

  function get(): FsFlagSet {
    log.debug(`${logPrefix}: getting flags`);
    const cached = localStorage.getItem(buildKey());

    if (!cached) {
      return flagSet;
    }

    try {
      const parsed = JSON.parse(cached);
      flagSet = {
        ...flagSet,
        ...parsed,
      };
      return flagSet;
    } catch (e: unknown) {
      const args = e instanceof Error ? [e.message, e.stack] : undefined;
      if (e instanceof Error) {
        log.error(`${logPrefix}: failed to parse flags from storage`, [
          e.message,
          e.stack,
        ]);
      }
      log.error(`${logPrefix}: Failed to parse flags from storage`, args);
      return flagSet;
    }
  }

  return {
    set,
    get,
  };
}
