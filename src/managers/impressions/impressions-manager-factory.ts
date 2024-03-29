import { FsSettings } from '../../config/types';
import { ImpressionsManager } from './types';
import { impressionsManager } from './impressions-manager';
import { EventManager, FsEvent } from '../events/types';

export function impressionsManagerFactory(
  settings: FsSettings,
  eventManager: EventManager,
): ImpressionsManager {
  const { log } = settings;
  const manager = impressionsManager(settings, eventManager);

  eventManager.on(FsEvent.SDK_READY, () => {
    setTimeout(() => {
      log.debug('Delaying impressions submitter for 5000ms');
      manager.start();
    }, 5000);
  });

  return manager;
}
