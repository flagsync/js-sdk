import { FlagManager } from '~sdk/external/FlagManager';
import { KillManager } from '~sdk/external/KillManager';
import { IFlagManager } from '~sdk/external/types';
import { EventManager } from '~sdk/modules/event/event-manager-factory';
import {
  EventCallback,
  FsEvent,
  FsEventType,
  IEventManager,
} from '~sdk/modules/event/types';
import { ServiceManager } from '~sdk/modules/service/ServiceManager';
import { StorageManagerFactory } from '~sdk/modules/storage/StorageManagerFactory';
import { SyncManagerFactory } from '~sdk/modules/sync/SyncManagerFactory';
import { TrackManager } from '~sdk/modules/track/TrackManager';
import { IEventsManager } from '~sdk/modules/track/events/types';
import { IImpressionsManager } from '~sdk/modules/track/impressions/types';
import { ITrackManager } from '~sdk/modules/track/types';

import { FsConfig, FsCore, FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';
import { buildSettingsFromConfig } from '~config/utils';

import { ApiClientFactory } from '~api/clients/api-client';
import { FsServiceError } from '~api/error/service-error';
import { ServiceErrorFactory } from '~api/error/service-error-factory';

export { FsServiceError };
export { ServiceErrorFactory };
export * from '~config/types';
export type { LogLevel } from '~logger/types';

export type FsErrorSource = 'api' | 'sdk';
export type FsErrorEvent = {
  type: FsErrorSource;
  error: Error | FsServiceError;
};

function clientInstanceFactory(settings: FsSettings): () => FsClient {
  const instance = new FlagSyncClient(settings);

  return function client() {
    return instance;
  };
}

interface IFsClient {
  waitForReady: () => Promise<void>;
  waitForReadyCanThrow: () => Promise<void>;
  kill: () => void;
  flag: <T>(flagKey: string, defaultValue?: T) => T;
  flags: (defaultValues?: FsFlagSet) => FsFlagSet;
  on: <T extends FsEventType>(event: T, callback: EventCallback<T>) => void;
  once: <T extends FsEventType>(event: T, callback: EventCallback<T>) => void;
  off: <T extends FsEventType>(event: T, callback?: EventCallback<T>) => void;
  track: (
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ) => void;
}

export type FsClient = IFsClient & {
  core: FsCore;
  Event: typeof FsEvent;
};

class FlagSyncClient implements IFsClient {
  private readonly api: ApiClientFactory;
  private readonly sdk: any;
  private readonly eventManager: IEventManager;
  private readonly syncFactory: SyncManagerFactory;
  private readonly syncManager: any;
  private readonly trackManager: ITrackManager;
  private readonly impressionsManager: IImpressionsManager;
  private readonly eventsManager: IEventsManager;
  private readonly storageFactory: StorageManagerFactory;
  private readonly storageManager: any;
  private readonly service: ServiceManager;
  private readonly flagManager: IFlagManager;
  private readonly killManager: KillManager;

  public core: FsCore;
  public Event: typeof FsEvent;

  constructor(private settings: FsSettings) {
    this.core = settings.core;
    this.Event = FsEvent;

    this.api = new ApiClientFactory(settings);
    this.sdk = this.api.getSdk();

    this.eventManager = new EventManager();

    this.syncFactory = new SyncManagerFactory(
      settings,
      this.eventManager,
      this.sdk,
    );
    this.syncManager = this.syncFactory.createManager();

    this.trackManager = new TrackManager(settings, this.eventManager, this.api);
    this.impressionsManager = this.trackManager.getImpressionsManager();
    this.eventsManager = this.trackManager.getEventsManager();

    this.storageFactory = new StorageManagerFactory(
      settings,
      this.eventManager,
    );
    this.storageManager = this.storageFactory.createManager();

    this.service = new ServiceManager(
      settings,
      this.sdk,
      this.storageManager,
      this.eventManager,
    );

    this.flagManager = new FlagManager(
      this.storageManager,
      this.impressionsManager,
    );

    this.killManager = new KillManager(
      settings,
      this.syncManager,
      this.trackManager,
      this.eventManager,
    );
  }

  public waitForReady() {
    return this.service.initWithCatch();
  }

  waitForReadyCanThrow() {
    return this.service.initWithThrow();
  }

  public flag<T>(flagKey: string, defaultValue?: T): T {
    return this.flagManager.flag(flagKey, defaultValue);
  }

  public flags(defaultValues: FsFlagSet = {}): FsFlagSet {
    return this.flagManager.flags(defaultValues);
  }

  public kill() {
    this.killManager.kill();
  }

  public on<T extends FsEventType>(event: T, callback: EventCallback<T>): void {
    this.eventManager.on(event, callback);
  }

  public once<T extends FsEventType>(
    event: T,
    callback: EventCallback<T>,
  ): void {
    this.eventManager.once(event, callback);
  }

  public off<T extends FsEventType>(
    event: T,
    callback?: EventCallback<T>,
  ): void {
    this.eventManager.off(event, callback);
  }

  public track(
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ) {
    this.eventsManager.submitEvent(eventKey, value, properties);
  }
}

export function FlagSyncFactory(config: FsConfig): {
  client: () => FsClient;
} {
  const settings = buildSettingsFromConfig(config);

  const client = clientInstanceFactory(settings);

  return {
    client,
  };
}
