import { FsSettings } from '~config/types.internal';

import { FsEvent, IEventManager } from '~managers/event/types';
import { impressionsManager } from '~managers/track/impressions/impressions-manager';
import { IImpressionsManager } from '~managers/track/impressions/types';

export function impressionsManagerFactory(
  settings: FsSettings,
  eventManager: IEventManager,
): IImpressionsManager {
  const manager = impressionsManager(settings, eventManager);

  eventManager.on(FsEvent.SDK_READY, () => {
    manager.start();
  });

  return manager;
}
