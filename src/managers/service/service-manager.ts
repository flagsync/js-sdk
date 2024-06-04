import { UNREADY_FLAG_VALUE } from '~config/constants';
import { FsFlagSet } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { FsServiceError } from '~api/error/service-error';
import { ServiceErrorFactory } from '~api/error/service-error-factory';
import { Sdk } from '~api/sdk';

import { FsEvent, IEventManager } from '~managers/event/types';
import { IStoreManager } from '~managers/storage/types';

const logPrefix = 'service-manager';

export function serviceManager(
  settings: FsSettings,
  sdk: Sdk<any>,
  storageManager: IStoreManager,
  eventEmitter: IEventManager,
) {
  const { log, context } = settings;

  const initWithWithThrow = sdk
    .sdkControllerInitContext({
      context,
    })
    .then(() =>
      sdk.sdkControllerGetFlags({
        context,
      }),
    )
    .then((res) => {
      storageManager.set(res?.flags ?? {});
      log.debug(`${logPrefix}: SDK ready`);
      eventEmitter.emit(FsEvent.SDK_READY);
    })
    .catch((e: unknown) => {
      throw ServiceErrorFactory.create(e);
    });

  const initWithCatch = initWithWithThrow.catch((e: FsServiceError) => {
    log.error(`${logPrefix}: SDK init failed`, [
      e.path,
      e.errorCode,
      e.message,
    ]);
    eventEmitter.emit(FsEvent.ERROR, {
      type: 'api',
      error: e,
    });
  });

  async function flagAsync<T>(flagKey: string, defaultValue?: T): Promise<T> {
    if (!flagKey || typeof flagKey !== 'string') {
      return Promise.resolve(UNREADY_FLAG_VALUE as T);
    }
    try {
      await sdk.sdkControllerInitContext({
        context,
      });
      const res = await sdk.sdkControllerGetFlag(flagKey, {
        context,
      });
      const flags = (res?.flag ?? {}) as FsFlagSet;
      return flags[flagKey] ?? defaultValue ?? UNREADY_FLAG_VALUE;
    } catch (e) {
      throw ServiceErrorFactory.create(e);
    }
  }

  return {
    flagAsync,
    initWithCatch,
    initWithWithThrow,
  };
}
