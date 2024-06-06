import { IStoreManager } from '~sdk/modules/storage/types';

import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { ILogger } from '~logger/types';

const MESSAGE = {
  SET: 'storing flags',
  GET: 'getting flags',
} as const;

export class MemoryManager implements IStoreManager {
  private readonly prefix = 'memory-manager';
  private readonly log: ILogger;

  private flagSet: FsFlagSet;

  constructor(settings: FsSettings) {
    this.log = settings.log;
    this.flagSet = { ...settings.bootstrap };
  }

  public set(incoming: FsFlagSet): void {
    this.log.debug(this.buildMessage(MESSAGE.SET));
    this.flagSet = { ...this.flagSet, ...incoming };
  }

  public get(): FsFlagSet {
    this.log.debug(this.buildMessage(MESSAGE.GET));
    return { ...this.flagSet };
  }

  private buildMessage(message: (typeof MESSAGE)[keyof typeof MESSAGE]) {
    return `${this.prefix}: ${message}`;
  }
}
