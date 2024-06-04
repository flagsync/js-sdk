import { ILogger, LogLevel } from './types';
import { formatISODateToCustom } from './utils';

const logPrefix = 'flagsync';

export const LogLevels = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  NONE: 'NONE',
} as const;

const LogLevelIndices = {
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  NONE: 5,
};

export class Logger implements ILogger {
  private logLevel: number;
  private readonly customLogger: Partial<ILogger> | undefined;

  constructor({
    logLevel,
    customLogger,
  }: {
    logLevel: LogLevel;
    customLogger: Partial<ILogger> | undefined;
  }) {
    this.logLevel = LogLevelIndices[logLevel];
    this.customLogger = customLogger;
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = LogLevelIndices[level];
  }

  debug(message: any, ...optionalParams: [...any, string?, string?]): void {
    if (this.canLog(LogLevelIndices.DEBUG)) {
      this._log(LogLevels.DEBUG, message, ...optionalParams);
    }
  }
  log(message: any, ...optionalParams: [...any, string?, string?]): void {
    if (this.canLog(LogLevelIndices.INFO)) {
      this._log(LogLevels.INFO, message, ...optionalParams);
    }
  }
  info(message: any, ...optionalParams: [...any, string?, string?]): void {
    if (this.canLog(LogLevelIndices.INFO)) {
      this._log(LogLevels.INFO, message, ...optionalParams);
    }
  }
  warn(message: any, ...optionalParams: [...any, string?, string?]): void {
    if (this.canLog(LogLevelIndices.WARN)) {
      this._log(LogLevels.WARN, message, ...optionalParams);
    }
  }
  error(message: any, ...optionalParams: [...any, string?, string?]): void {
    if (this.canLog(LogLevelIndices.ERROR)) {
      this._log(LogLevels.ERROR, message, ...optionalParams);
    }
  }

  private canLog(level: number): boolean {
    return level >= this.logLevel;
  }

  private _log(
    level: LogLevel,
    message: any,
    ...optionalParams: [...any, string?, string?]
  ) {
    if (this.customLogger) {
      const method = this.getCustomLoggerMethod(level);
      method(message, ...optionalParams);
      return;
    }

    const msg = this.buildMessage(level, message);
    console.log(msg, ...optionalParams);
  }

  private buildMessage(level: LogLevel, message: any) {
    const padding =
      level === LogLevels.INFO || level === LogLevels.WARN ? ' ' : '';

    return `${logPrefix} [${formatISODateToCustom(new Date())}] [${level}]${padding} => ${message}`;
  }

  private getCustomLoggerMethod(level: LogLevel) {
    if (!this.customLogger) {
      return console.log;
    }

    let method;
    switch (level) {
      case LogLevels.DEBUG:
        method = this.customLogger.debug;
        break;
      case LogLevels.INFO:
        method = this.customLogger.log ?? this.customLogger.info;
        break;
      case LogLevels.WARN:
        method = this.customLogger.warn;
        break;
      case LogLevels.ERROR:
        method = this.customLogger.error;
        break;
    }

    if (method) {
      return method;
    }

    console.error(
      `Custom logger does not have a method for ${level}. Falling back to console.log`,
    );
    return console.log;
  }
}
