import type { FsFlagSet } from '~config/types';
import type { FsSettings } from '~config/types.internal';

import { MESSAGE } from '~logger/messages';
import { formatMsg } from '~logger/utils';

import type { IStoreManager } from './types';

const formatter = formatMsg.bind(null, 'memory-manager');

export function memoryManager(params: FsSettings): IStoreManager {
  const { log, bootstrap } = params;

  let flagSet: FsFlagSet = {
    ...bootstrap,
  };

  function set(incoming: FsFlagSet) {
    log.debug(formatter(MESSAGE.STORAGE_SET_FLAGS));
    flagSet = {
      ...flagSet,
      ...incoming,
    };
  }

  function get(): FsFlagSet {
    log.debug(formatter(MESSAGE.STORAGE_GET_FLAGS));
    return {
      ...flagSet,
    };
  }

  return {
    set,
    get,
  };
}
