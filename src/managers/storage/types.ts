import { FsFlagSet } from '../../config/types';

export interface StoreManager {
  set: (flagSet: FsFlagSet) => void;
  get: () => FsFlagSet;
}
