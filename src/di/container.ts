import { ServiceKey } from '~di/services';
import { ServiceTypes } from '~di/types';

import { FsConfig } from '~config/types';
import { FsSettings } from '~config/types.internal';

export class Container {
  private static instance: Container | null = null;
  private readonly services: Map<ServiceKey, any> = new Map();
  private readonly settings: FsSettings;
  private readonly config: FsConfig;

  private constructor(settings: FsSettings, config: FsConfig) {
    this.settings = settings;
    this.config = config;
  }

  static getInstance(settings: FsSettings, config: FsConfig): Container {
    if (!Container.instance && !settings) {
      throw new Error('Container must be initialized with settings first');
    }
    if (!Container.instance && settings) {
      Container.instance = new Container(settings, config);
    }
    return Container.instance!;
  }

  static getInstanceUnsafe(): Container | null {
    return Container.instance;
  }

  static resetInstance(): void {
    Container.instance = null;
  }

  getConfig(): FsConfig {
    return this.config;
  }

  getSettings(): FsSettings {
    return this.settings;
  }

  register<K extends ServiceKey>(
    key: K,
    factory: (container: Container) => ServiceTypes[K],
  ): void {
    const instance = factory(this);
    this.services.set(key, instance);
  }

  get<K extends ServiceKey>(key: K): ServiceTypes[K] {
    if (!this.services.has(key)) {
      throw new Error(`Service '${key}' not found`);
    }
    return this.services.get(key) as ServiceTypes[K];
  }

  hasService(key: ServiceKey): boolean {
    return this.services.has(key);
  }

  clear(): void {
    this.services.clear();
  }
}
