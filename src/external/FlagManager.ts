import { IFlagManager } from '~sdk/external/types';
import { IStoreManager } from '~sdk/modules/storage/types';
import { IImpressionsManager } from '~sdk/modules/track/impressions/types';

import { UNREADY_FLAG_VALUE } from '~config/constants';
import { FsFlagSet } from '~config/types';

export class FlagManager implements IFlagManager {
  constructor(
    private readonly manager: IStoreManager,
    private readonly impressionsManager: IImpressionsManager,
  ) {}

  public flag<T>(flagKey: string, defaultValue?: T): T {
    if (!flagKey || typeof flagKey !== 'string') {
      return UNREADY_FLAG_VALUE as T;
    }

    const flags = this.manager.get();
    const flagValue = flags[flagKey] ?? defaultValue ?? UNREADY_FLAG_VALUE;

    this.impressionsManager.trackImpression({
      flagKey,
      flagValue,
    });

    return flagValue as T;
  }

  public flags(defaultValues: FsFlagSet = {}): FsFlagSet {
    const flags: FsFlagSet = {};
    const cached = this.manager.get();

    for (const flagKey in cached) {
      const flagValue = cached[flagKey] ?? defaultValues[flagKey] ?? 'control';
      flags[flagKey] = flagValue;
      this.impressionsManager.trackImpression({
        flagKey,
        flagValue,
      });
    }

    return flags;
  }
}
