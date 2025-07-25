import { Container } from '~di/container';
import { ServiceKeys } from '~di/services';

import type { FsConfig, FsFlagSet } from '~config/types';
import { buildSettingsFromConfig } from '~config/utils';

import { apiClientFactory } from '~api/clients/api-client';

import { eventManagerFactory } from '~managers/event/event-manager-factory';
import type { EventCallback, FsEventType } from '~managers/event/types';
import { flagManager } from '~managers/flag/flag-manager';
import {
  FeatureFlags,
  FlagReturnType,
  IsFeatureFlagsEmpty,
  NoExplicitReturnType,
} from '~managers/flag/types';
import { killManager } from '~managers/kill/kill-manager';
import { serviceManager } from '~managers/service/service-manager';
import { storageManagerFactory } from '~managers/storage/storage-manger-factory';
import { syncManagerFactory } from '~managers/sync/sync-manager-factory';
import { trackManagerFactory } from '~managers/track/track-manager-factory';

export class FsClient {
  private readonly container: Container;
  private initialized = false;

  constructor(config: FsConfig) {
    const settings = buildSettingsFromConfig(config);
    this.container = Container.getInstance(settings);
    this.registerServices();
  }

  private registerServices(): void {
    if (this.initialized) return;

    this.container.register(ServiceKeys.ApiClient, () =>
      apiClientFactory(this.container.getSettings()),
    );

    this.container.register(ServiceKeys.EventManager, () => {
      return eventManagerFactory();
    });

    // Register storage manager
    this.container.register(ServiceKeys.StorageManager, (c) => {
      return storageManagerFactory(
        c.getSettings(),
        c.get(ServiceKeys.EventManager),
      );
    });

    // Register sync manager
    this.container.register(ServiceKeys.SyncManager, (c) => {
      return syncManagerFactory(
        c.getSettings(),
        c.get(ServiceKeys.EventManager),
      );
    });

    // Register track manager
    this.container.register(ServiceKeys.TrackManager, (c) => {
      return trackManagerFactory(
        c.getSettings(),
        c.get(ServiceKeys.EventManager),
      );
    });

    // Register service manager
    this.container.register(ServiceKeys.ServiceManager, (c) => {
      return serviceManager(
        c.getSettings(),
        c.get(ServiceKeys.ApiClient).sdk,
        c.get(ServiceKeys.StorageManager),
        c.get(ServiceKeys.EventManager),
      );
    });

    // Register kill manager
    this.container.register(ServiceKeys.KillManager, (c) => {
      return killManager(
        c.getSettings(),
        c.get(ServiceKeys.EventManager),
        c.get(ServiceKeys.SyncManager),
        c.get(ServiceKeys.TrackManager),
      );
    });

    // Register flag manager
    this.container.register(ServiceKeys.FlagManager, (c) => {
      return flagManager(
        c.get(ServiceKeys.StorageManager),
        c.get(ServiceKeys.TrackManager),
      );
    });

    this.initialized = true;
  }

  /**
   * Evaluates a feature flag for a given user context with full type-safety.
   *
   * This function is designed to work with or without `FlagSync CLI` generated
   * TypeScript types, providing robust type inference, validation, and autocompletion.
   *
   * @example With FlagSync CLI generated types (recommended for full type-safety and DX):
   * ```ts
   * declare module '@flagsync/js-sdk' {
   *   interface FeatureFlags {
   *     'price-discount': 0.1 | 0.2;
   *     'layout': 'v1' | 'v2' | 'v3';
   *     'killswitch': boolean;
   *   }
   * }
   *
   * const discount = client.flag('price-discount');         // Type: 0.1 | 0.2
   * const layout = client.flag('layout', 'v1');             // Type: 'v1' | 'v2' | 'v3' (defaultValue must be 'v1' | 'v2' | 'v3')
   * const isEnabled = client.flag('killswitch');            // Type: boolean
   * const value = client.flag('not-a-real-flag');           // ❌ TS Error: Argument is not a key of FeatureFlags
   * const badDefault = client.flag('price-discount', 0.5);  // ❌ TS Error: Default value type mismatch
   * ```
   *
   * When not using FlagSync CLI, you must manually type the flag value, or
   * it will be inferred as "unknown"
   *
   * @example Without FlagSync CLI generated types (manual type specification or inference as `unknown`):
   * ```ts
   * const ctx = { userId: 'user456' };
   *
   * const layout = client.flag<'v1' | 'v2'>('layout');             // Type: 'v1' | 'v2'
   * const discount = client.flag<number>('price-discount');        // Type: number
   * const enabled = client.flag<boolean>('enable-feature', false); // Type: boolean (defaultValue must be true or false)
   *
   * // Without an explicit generic (and no generated types), the return type is `unknown`:
   * const someDynamicKey = client.flag('some-dynamic-key');        // Type: unknown
   * ```
   */
  public flag<TReturn = NoExplicitReturnType, TKey extends string = string>(
    flagKey: IsFeatureFlagsEmpty<FeatureFlags> extends true
      ? TKey
      :
          | (TKey extends keyof FeatureFlags ? TKey : never)
          | (keyof FeatureFlags extends never ? never : keyof FeatureFlags),

    defaultValue?: FlagReturnType<TReturn, TKey, FeatureFlags>,
  ): FlagReturnType<TReturn, TKey, FeatureFlags> {
    return this.container
      .get(ServiceKeys.FlagManager)
      .flag(flagKey, defaultValue);
  }

  public flags(defaultValues?: FsFlagSet): FsFlagSet {
    return this.container.get(ServiceKeys.FlagManager).flags(defaultValues);
  }

  public kill(): void {
    return this.container.get(ServiceKeys.KillManager).kill();
  }

  public on<T extends FsEventType>(event: T, callback: EventCallback<T>): void {
    return this.container.get(ServiceKeys.EventManager).on(event, callback);
  }

  public once<T extends FsEventType>(
    event: T,
    callback: EventCallback<T>,
  ): void {
    return this.container.get(ServiceKeys.EventManager).once(event, callback);
  }

  public off<T extends FsEventType>(
    event: T,
    callback?: EventCallback<T>,
  ): void {
    return this.container.get(ServiceKeys.EventManager).off(event, callback);
  }

  public track(
    eventKey: string,
    value?: number | null | undefined,
    properties?: Record<string, any>,
  ): void {
    return this.container
      .get(ServiceKeys.TrackManager)
      .eventsManager.track(eventKey, value, properties);
  }

  public async waitForReady(): Promise<void> {
    return this.container.get(ServiceKeys.ServiceManager).initWithCatch;
  }

  public async waitForReadyCanThrow(): Promise<void> {
    return this.container.get(ServiceKeys.ServiceManager).initWithWithThrow;
  }
}
