import { UNREADY_FLAG_VALUE } from '~config/constants';
import type { FsFlagSet } from '~config/types';

import type { IFlagManager } from '~managers/flag/types';
import type { IStoreManager } from '~managers/storage/types';
import type { ITrackManager } from '~managers/track/types';

export function flagManager(
  storageManager: IStoreManager,
  trackManager: ITrackManager,
): IFlagManager {
  function flag<T = any>(flagKey: string, defaultValue?: T): T {
    if (!flagKey || typeof flagKey !== 'string') {
      return (defaultValue ?? UNREADY_FLAG_VALUE) as T;
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
