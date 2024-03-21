import { FlagSyncConfig, FsSettings } from './types';
import { deepMerge } from '../utils/helpers';
import { loggerFactory } from '../logger/logger-factory';
import { DEFAULT_CONFIG } from './constants';

export function buildSettingsFromConfig(config: FlagSyncConfig): FsSettings {
  const settings = deepMerge<FsSettings>(DEFAULT_CONFIG, config);
  settings.log = loggerFactory(settings);
  return settings;
}
