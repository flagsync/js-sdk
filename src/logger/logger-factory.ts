import { FsLogger } from './types';
import { Logger, LogLevels } from './logger';
import { FsSettings } from '../config/types';

const defaultLevel = LogLevels.NONE;

export function loggerFactory(settings: FsSettings): FsLogger {
  const { logLevel } = settings;

  const derivedLevel = logLevel || defaultLevel;

  return new Logger({ logLevel: derivedLevel });
}
