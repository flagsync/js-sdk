import { FsFlagSet } from '~config/types';

export interface IStoreManager {
  set: (flagSet: FsFlagSet) => void;
  get: () => FsFlagSet;
}
