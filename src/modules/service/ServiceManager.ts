import { FsEvent, IEventManager } from '~sdk/modules/event/types';
import { IStoreManager } from '~sdk/modules/storage/types';

import { FsSettings } from '~config/types.internal';

import { ServiceErrorFactory } from '~api/error/service-error-factory';
import { Sdk } from '~api/sdk';

const MESSAGE = {
  READY: 'SDK ready',
  FAILED: 'SDK init failed',
} as const;

export class ServiceManager {
  private readonly prefix = 'service-manager';

  private readonly settings: FsSettings;
  private readonly sdk: Sdk<any>;
  private readonly storageManager: IStoreManager;
  private readonly eventEmitter: IEventManager;

  constructor(
    settings: FsSettings,
    sdk: Sdk<any>,
    storageManager: IStoreManager,
    eventEmitter: IEventManager,
  ) {
    this.settings = settings;
    this.sdk = sdk;
    this.storageManager = storageManager;
    this.eventEmitter = eventEmitter;
  }

  public async initWithThrow(): Promise<void> {
    const { log, context } = this.settings;

    try {
      await this.sdk.sdkControllerInitContext({ context });
      const res = await this.sdk.sdkControllerGetFlags({ context });
      this.storageManager.set(res?.flags ?? {});
      log.debug(this.buildMessage(MESSAGE.READY));
      this.eventEmitter.emit(FsEvent.SDK_READY);
    } catch (e) {
      throw ServiceErrorFactory.create(e);
    }
  }

  public async initWithCatch(): Promise<void> {
    try {
      return await this.initWithThrow();
    } catch (e) {
      const error = ServiceErrorFactory.create(e);

      const { log } = this.settings;
      log.error(
        this.buildMessage(MESSAGE.FAILED),
        error.path,
        error.errorCode,
        error.message,
      );
      this.eventEmitter.emit(FsEvent.ERROR, { type: 'api', error });
    }
  }

  private buildMessage(message: (typeof MESSAGE)[keyof typeof MESSAGE]) {
    return `${this.prefix}: ${message}`;
  }
}
