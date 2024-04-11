import { FsSettings } from '~config/types';

import { LogLevels, Logger } from '~logger/logger';
import { ILogger } from '~logger/types';

const defaultLevel = LogLevels.NONE;

export function loggerFactory(settings: FsSettings): ILogger {
  const { logLevel } = settings;

  const derivedLevel = logLevel || defaultLevel;

  return new Logger({ logLevel: derivedLevel });
}
