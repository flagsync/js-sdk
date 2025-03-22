import deepmerge from 'deepmerge';

import { DEFAULT_CONFIG } from '~config/constants';
import type { FsConfig } from '~config/types';
import type { FsSettings } from '~config/types.internal';

import { loggerFactory } from '~logger/logger-factory';

import { ConfigValidator } from './validator';

export function buildSettingsFromConfig(config: FsConfig): FsSettings {
  ConfigValidator.validateConfig(config);

  const settings = deepmerge<FsSettings, FsConfig>(DEFAULT_CONFIG, config);
  settings.log = loggerFactory(settings, config.logger);

  const metadata = config.metadata ?? {};

  (settings as FsSettings).metadata = {
    sdkName: '__SDK_NAME__',
    sdkVersion: '__SDK_VERSION__',
    ...metadata,
  };

  settings.context = {
    key: settings.core.key,
    attributes: settings.core.attributes ?? {},
  };

  settings.sdkContext = {
    sdkName: settings.metadata.sdkName,
    sdkVersion: settings.metadata.sdkVersion,
  };

  settings.platform = typeof window !== 'undefined' ? 'browser' : 'node';

  ConfigValidator.validate(settings);

  return settings;
}
