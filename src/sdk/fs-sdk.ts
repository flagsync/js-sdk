import { Container } from '~di/container';

import { FsConfig, FsFlagSet } from '~config/types';
import { buildSettingsFromConfig } from '~config/utils';

import { apiClientFactory } from '~api/clients/api-client';

import { eventManagerFactory } from '~managers/event/event-manager-factory';
import {
  EventCallback,
  FsEvent,
  FsEventType,
  IEventManager,
} from '~managers/event/types';
import { flagManager } from '~managers/flag/flag-manager';
import { IFlagManager } from '~managers/flag/types';
import { killManager } from '~managers/kill/kill-manager';
import { IKillManager } from '~managers/kill/types';
import { serviceManager } from '~managers/service/service-manager';
import { IServiceManager } from '~managers/service/types';
import { storageManagerFactory } from '~managers/storage/storage-manger-factory';
import { IStoreManager } from '~managers/storage/types';
import { syncManagerFactory } from '~managers/sync/sync-manager-factory';
import { ISyncManager } from '~managers/sync/types';
import { trackManagerFactory } from '~managers/track/track-manager-factory';
import { ITrackManager } from '~managers/track/types';

export class FsSdk {
  private readonly container: Container;
  private initialized = false;

  constructor(config: FsConfig) {
    const settings = buildSettingsFromConfig(config);
    this.container = Container.getInstance(settings);
    this.registerServices();
  }

  private registerServices(): void {
    if (this.initialized) return;

    // Register event manager first as many services depend on it
    this.container.register('eventManager', () => {
      return eventManagerFactory();
    });

    // Register storage manager
    this.container.register('storageManager', (container) => {
      const settings = container.getSettings();
      const eventManager = container.get<IEventManager>('eventManager');
      return storageManagerFactory(settings, eventManager);
    });

    // Register sync manager
    this.container.register('syncManager', (container) => {
      const settings = container.getSettings();
      const eventManager = container.get<IEventManager>('eventManager');
      return syncManagerFactory(settings, eventManager);
    });

    // Register track manager
    this.container.register('trackManager', (container) => {
      const settings = container.getSettings();
      const eventManager = container.get<IEventManager>('eventManager');
      return trackManagerFactory(settings, eventManager);
    });

    // Register service manager
    this.container.register('serviceManager', (container) => {
      const settings = container.getSettings();
      const { sdk } = apiClientFactory(settings);
      const eventManager = container.get<IEventManager>('eventManager');
      const storageManager = container.get<IStoreManager>('storageManager');
      return serviceManager(settings, sdk, storageManager, eventManager);
    });

    // Register kill manager
    this.container.register('killManager', (container) => {
      const settings = container.getSettings();
      const eventManager = container.get<IEventManager>('eventManager');
      const syncManager = container.get<ISyncManager>('syncManager');
      const trackManager = container.get<ITrackManager>('trackManager');
      return killManager(settings, eventManager, syncManager, trackManager);
    });

    // Register flag manager
    this.container.register('flagManager', (container) => {
      const storageManager = container.get<IStoreManager>('storageManager');
      const trackManager = container.get<ITrackManager>('trackManager');
      return flagManager(storageManager, trackManager);
    });

    this.initialized = true;
  }

  // Public API methods
  public flag<T>(flagKey: string, defaultValue?: T): T {
    return this.container
      .get<IFlagManager>('flagManager')
      .flag(flagKey, defaultValue);
  }

  public flags(defaultValues?: FsFlagSet): FsFlagSet {
    return this.container.get<IFlagManager>('flagManager').flags(defaultValues);
  }

  public kill(): void {
    return this.container.get<IKillManager>('killManager').kill();
  }

  public on<T extends FsEventType>(event: T, callback: EventCallback<T>): void {
    return this.container
      .get<IEventManager>('eventManager')
      .on(event, callback);
  }

  public once<T extends FsEventType>(
    event: T,
    callback: EventCallback<T>,
  ): void {
    return this.container
      .get<IEventManager>('eventManager')
      .once(event, callback);
  }

  public off<T extends FsEventType>(
    event: T,
    callback?: EventCallback<T>,
  ): void {
    return this.container
      .get<IEventManager>('eventManager')
      .off(event, callback);
  }

  public track(
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ): void {
    return this.container
      .get<ITrackManager>('trackManager')
      .eventsManager.track(eventKey, value, properties);
  }

  public async waitForReady(): Promise<void> {
    return this.container.get<IServiceManager>('serviceManager').initWithCatch;
  }

  public async waitForReadyCanThrow(): Promise<void> {
    return this.container.get<IServiceManager>('serviceManager')
      .initWithWithThrow;
  }

  public static Event = FsEvent;
}
