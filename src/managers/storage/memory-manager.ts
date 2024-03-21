import { FsSettings, FsFlagSet } from '../../config/types';
import { StoreManager } from './types';

export function memoryManager(params: FsSettings): StoreManager {
  const { log, bootstrap } = params;

  let flagSet: FsFlagSet = {
    ...bootstrap,
  };

  function set(incoming: FsFlagSet) {
    log.debug('Saving flags to memory');
    flagSet = {
      ...flagSet,
      ...incoming,
    };
  }

  function get(): FsFlagSet {
    log.debug('Loading flags from memory');
    return {
      ...flagSet,
    };
  }

  return {
    set,
    get,
  };
}
