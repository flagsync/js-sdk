import { EventsManager } from './types';
import { FsSettings } from '../../../config/types';
import { EventManager, FsEvent } from '../../event/types';
import { eventsManager } from './events-manager';

export function eventsManagerFactory(
  settings: FsSettings,
  eventManager: EventManager,
): EventsManager {
  const manager = eventsManager(settings, eventManager);

  eventManager.on(FsEvent.SDK_READY, () => {
    manager.start();
  });

  return manager;
}
