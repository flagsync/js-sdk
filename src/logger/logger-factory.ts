import { FsSettings } from '../config/types.internal';
import { LogLevels, Logger } from './logger';
import { ILogger } from './types';

const defaultLevel = LogLevels.NONE;

export function loggerFactory(
  settings: Partial<FsSettings>,
  customLogger: Partial<ILogger> | undefined,
): ILogger {
  const { logLevel } = settings;

  const derivedLevel = logLevel || defaultLevel;

  if (customLogger) {
    if (
      !customLogger.debug &&
      !customLogger.info &&
      !customLogger.warn &&
      !customLogger.error &&
      !customLogger.log
    ) {
      throw new Error('Custom logger must have at least one log method');
    }
  }

  return new Logger({ logLevel: derivedLevel, customLogger });
}
