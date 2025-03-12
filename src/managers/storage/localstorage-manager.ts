import type { FsFlagSet } from '~config/types';
import type { FsSettings } from '~config/types.internal';

import type { IStoreManager } from '~managers/storage/types';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

const formatter = formatMsg.bind(null, 'localstorage-manager');

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
    log.debug(formatter(MESSAGE.STORAGE_SET_FLAGS));
    localStorage.setItem(buildKey(), JSON.stringify(flagSet));
  }

  function get(): FsFlagSet {
    log.debug(formatter(MESSAGE.STORAGE_GET_FLAGS));
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
        log.error(formatter(MESSAGE.STORAGE_PARSE_FAIL), e.message, e.stack);
      }
      log.error(formatter(MESSAGE.STORAGE_PARSE_FAIL), args);
      return flagSet;
    }
  }

  return {
    set,
    get,
  };
}
