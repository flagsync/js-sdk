import deepmerge from 'deepmerge';

import { DEFAULT_CONFIG } from '~config/constants';
import { FsConfig } from '~config/types';
import { FsSettings } from '~config/types.internal';

import { FsServiceError, ServiceErrorCode } from '~api/error/service-error';

import { loggerFactory } from '~logger/logger-factory';

function validateSettings(settings: FsSettings): void {
  if (!settings.sdkKey) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'sdkKey is required',
    });
  }
  if (!settings.core.key) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'core.key is required',
    });
  }
  if (settings.tracking.impressions.pushRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'track.impressions.pushRate must be greater than 30',
    });
  }
  if (settings.tracking.impressions.maxQueueSize < 50) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'track.impressions.maxQueueSize must be greater than 50',
    });
  }
  if (settings.tracking.events.pushRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'track.events.pushRate must be greater than 30',
    });
  }
  if (settings.tracking.events.maxQueueSize < 50) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'track.events.maxQueueSize must be greater than 50',
    });
  }
  if (settings.sync.pollRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'sync.pollRate must be greater than 30',
    });
  }
}

export function buildSettingsFromConfig(config: FsConfig): FsSettings {
  const settings = deepmerge<FsSettings, FsConfig>(DEFAULT_CONFIG, config);
  settings.log = loggerFactory(settings, config.logger);

  validateSettings(settings);

  (settings as FsSettings).metadata = config.metadata ?? {
    sdkName: '__SDK_NAME__',
    sdkVersion: '__SDK_VERSION__',
  };

  settings.context = {
    key: settings.core.key,
    attributes: settings.core.attributes ?? {},
  };

  settings.platform = typeof window !== 'undefined' ? 'browser' : 'node';

  return settings;
}
