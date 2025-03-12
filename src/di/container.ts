import { FsSettings } from '~config/types.internal';

export class Container {
  private static instance: Container | null = null;
  private readonly services: Map<string, any> = new Map();
  private readonly settings: FsSettings;

  private constructor(settings: FsSettings) {
    this.settings = settings;
  }

  static getInstance(settings?: FsSettings): Container {
    if (!Container.instance && !settings) {
      throw new Error('Container must be initialized with settings first');
    }
    if (!Container.instance && settings) {
      Container.instance = new Container(settings);
    }
    return Container.instance!;
  }

  static resetInstance(): void {
    Container.instance = null;
  }

  getSettings(): FsSettings {
    return this.settings;
  }

  register<T>(key: string, factory: (container: Container) => T): void {
    const instance = factory(this);
    this.services.set(key, instance);
  }

  get<T>(key: string): T {
    if (!this.services.has(key)) {
      throw new Error(`Service '${key}' not found`);
    }
    return this.services.get(key) as T;
  }

  hasService(key: string): boolean {
    return this.services.has(key);
  }

  clear(): void {
    this.services.clear();
  }
}
