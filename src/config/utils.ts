import deepmerge from 'deepmerge';

import { DEFAULT_CONFIG } from '~config/constants';
import { FlagSyncConfig, FsSettings } from '~config/types';

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
  if (settings.tracking.events.pushRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'track.events.pushRate must be greater than 30',
    });
  }
  if (settings.sync.pollRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'sync.pollRate must be greater than 30',
    });
  }
}

export function buildSettingsFromConfig(config: FlagSyncConfig): FsSettings {
  const settings = deepmerge<FsSettings, FlagSyncConfig>(
    DEFAULT_CONFIG,
    config,
  );
  settings.log = loggerFactory(settings);

  validateSettings(settings);

  settings.context = {
    key: settings.core.key,
    attributes: settings.core.attributes ?? {},
  };

  settings.platform = typeof window !== 'undefined' ? 'browser' : 'node';

  return settings;
}
