import { FlagSyncConfig, FsSettings } from './types';
import { loggerFactory } from '../logger/logger-factory';
import { DEFAULT_CONFIG } from './constants';
import { FsServiceError, ServiceErrorCode } from '../api/error/service-error';
import deepmerge from 'deepmerge';

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
  if (settings.events.impressions.pushRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'impressions.sendInterval must be greater than 30',
    });
  }
  if (settings.sync.pollRate < 30) {
    throw new FsServiceError({
      errorCode: ServiceErrorCode.InvalidConfiguration,
      message: 'sync.pollInterval must be greater than 30',
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
    email: settings.core.attributes?.email,
    custom: settings.core.attributes ?? {},
  };

  settings.platform = typeof window !== 'undefined' ? 'browser' : 'node';

  return settings;
}
