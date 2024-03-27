import { FsSettings, FsFlagSet } from '../../config/types';
import { StoreManager } from './types';

const logPrefix = 'memory-manager';

export function memoryManager(params: FsSettings): StoreManager {
  const { log, bootstrap } = params;

  let flagSet: FsFlagSet = {
    ...bootstrap,
  };

  function set(incoming: FsFlagSet) {
    log.debug(`${logPrefix}: saving flags to memory`);
    flagSet = {
      ...flagSet,
      ...incoming,
    };
  }

  function get(): FsFlagSet {
    log.debug(`${logPrefix}: getting flags from memory`);
    return {
      ...flagSet,
    };
  }

  return {
    set,
    get,
  };
}
