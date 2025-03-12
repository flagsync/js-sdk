import { FsSettings } from '~config/types.internal';

export class Container {
  private static instance: Container;
  private services: Map<string, any> = new Map();
  private settings: FsSettings;

  private constructor(settings: FsSettings) {
    this.settings = settings;
  }

  static getInstance(settings?: FsSettings): Container {
    if (!Container.instance && settings) {
      Container.instance = new Container(settings);
    }
    return Container.instance;
  }

  getSettings(): FsSettings {
    return this.settings;
  }

  register<T>(key: string, factory: (container: Container) => T): void {
    // Lazy initialization - only create the service when it's first requested
    Object.defineProperty(this, key, {
      get: () => {
        if (!this.services.has(key)) {
          this.services.set(key, factory(this));
        }
        return this.services.get(key);
      },
    });
  }

  get<T>(key: string): T {
    if (!this.hasService(key)) {
      throw new Error(`Service ${key} not found in container`);
    }
    return this[key as keyof Container] as T;
  }

  private hasService(key: string): boolean {
    return Object.prototype.hasOwnProperty.call(this, key);
  }
}
