import { FsFlagSet } from '~config/types';

export interface IFlagManager {
  flag: <T>(flagKey: string, defaultValue?: T) => T;
  flags: (defaultValues?: FsFlagSet) => FsFlagSet;
}
