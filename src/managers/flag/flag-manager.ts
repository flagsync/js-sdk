import { UNREADY_FLAG_VALUE } from '~config/constants';
import { FsFlagSet } from '~config/types';

import { IFlagManager } from '~managers/flag/types';
import { IStoreManager } from '~managers/storage/types';
import { ITrackManager } from '~managers/track/types';

export function flagManager(
  storageManager: IStoreManager,
  trackManager: ITrackManager,
): IFlagManager {
  function flag<T>(flagKey: string, defaultValue?: T): T {
    if (!flagKey || typeof flagKey !== 'string') {
      return UNREADY_FLAG_VALUE as T;
    }

    const flags = storageManager.get();
    const flagValue = flags[flagKey] ?? defaultValue ?? UNREADY_FLAG_VALUE;

    trackManager.impressionsManager.track({
      flagKey,
      flagValue,
    });

    return flagValue as T;
  }

  function flags(defaultValues: FsFlagSet = {}): FsFlagSet {
    const flags: FsFlagSet = {};
    const cached = storageManager.get();

    for (const flagKey in cached) {
      const flagValue =
        cached[flagKey] ?? defaultValues[flagKey] ?? UNREADY_FLAG_VALUE;
      flags[flagKey] = flagValue;
      trackManager.impressionsManager.track({
        flagKey,
        flagValue,
      });
    }

    return flags;
  }

  return {
    flag,
    flags,
  };
}
