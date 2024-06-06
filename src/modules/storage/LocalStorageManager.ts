import { IStoreManager } from '~sdk/modules/storage/types';

import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

const MESSAGE = {
  SET: 'storing flags',
  GET: 'getting flags',
  PARSE_FAIL: 'failed to parse flags from storage',
} as const;

export class LocalStorageManager implements IStoreManager {
  private readonly prefix = 'local-storage-manager';

  private settings: FsSettings;
  private flagSet: FsFlagSet;

  constructor(settings: FsSettings) {
    this.settings = settings;
    this.flagSet = { ...settings.bootstrap };
  }

  public set(incoming: FsFlagSet): void {
    this.flagSet = { ...this.flagSet, ...incoming };
    this.settings.log.debug(this.buildMessage(MESSAGE.SET));
    localStorage.setItem(this.buildKey(), JSON.stringify(this.flagSet));
  }

  public get(): FsFlagSet {
    this.settings.log.debug(this.buildMessage(MESSAGE.GET));
    const cached = localStorage.getItem(this.buildKey());

    if (!cached) {
      return this.flagSet;
    }

    try {
      const parsed = JSON.parse(cached);
      this.flagSet = { ...this.flagSet, ...parsed };
      return this.flagSet;
    } catch (e: unknown) {
      const args = e instanceof Error ? [e.message, e.stack] : undefined;
      if (e instanceof Error) {
        this.settings.log.error(
          this.buildMessage(MESSAGE.PARSE_FAIL),
          e.message,
          e.stack,
        );
      }
      this.settings.log.error(this.buildMessage(MESSAGE.PARSE_FAIL), args);
      return this.flagSet;
    }
  }

  private buildKey(): string {
    return `${this.settings.storage.prefix}:flags`;
  }

  private buildMessage(message: (typeof MESSAGE)[keyof typeof MESSAGE]) {
    return `${this.prefix}: ${message}`;
  }
}
