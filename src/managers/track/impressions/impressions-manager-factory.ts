import { ImpressionsManager } from './types';
import { impressionsManager } from './impressions-manager';
import { FsSettings } from '../../../config/types';
import { EventManager, FsEvent } from '../../events/types';

export function impressionsManagerFactory(
  settings: FsSettings,
  eventManager: EventManager,
): ImpressionsManager {
  const manager = impressionsManager(settings, eventManager);

  eventManager.on(FsEvent.SDK_READY, () => {
    manager.start();
  });

  return manager;
}
