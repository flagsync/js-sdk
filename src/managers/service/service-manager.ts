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

  return {
    initWithCatch,
    initWithWithThrow,
  };
}
