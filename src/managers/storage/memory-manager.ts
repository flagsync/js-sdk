import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { IStoreManager } from './types';

const logPrefix = 'memory-manager';

export function memoryManager(params: FsSettings): IStoreManager {
  const { log, bootstrap } = params;

  let flagSet: FsFlagSet = {
    ...bootstrap,
  };

  function set(incoming: FsFlagSet) {
    log.debug(`${logPrefix}: saving flags`);
    flagSet = {
      ...flagSet,
      ...incoming,
    };
  }

  function get(): FsFlagSet {
    log.debug(`${logPrefix}: getting flags`);
    return {
      ...flagSet,
    };
  }

  return {
    set,
    get,
  };
}
