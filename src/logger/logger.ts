import { FsLogger, LogLevel } from './types';

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

export class Logger implements FsLogger {
  private logLevel: number;

  constructor({ logLevel }: { logLevel: LogLevel }) {
    this.logLevel = LogLevelIndices[logLevel];
  }

  setLogLevel(level: LogLevel) {
    this.logLevel = LogLevelIndices[level];
  }

  debug(msg: string | number, args?: any[] | undefined): void {
    if (this.canLog(LogLevelIndices.DEBUG)) {
      this.log(LogLevels.DEBUG, msg, args);
    }
  }
  info(msg: string | number, args?: any[] | undefined): void {
    if (this.canLog(LogLevelIndices.INFO)) {
      this.log(LogLevels.INFO, msg, args);
    }
  }
  warn(msg: string | number, args?: any[] | undefined): void {
    if (this.canLog(LogLevelIndices.WARN)) {
      this.log(LogLevels.WARN, msg, args);
    }
  }
  error(msg: string | number, args?: any[] | undefined): void {
    if (this.canLog(LogLevelIndices.ERROR)) {
      this.log(LogLevels.ERROR, msg, args);
    }
  }

  private canLog(level: number): boolean {
    return level >= this.logLevel;
  }

  private log(level: LogLevel, msg: string | number, args?: any[] | undefined) {
    const message = this.buildMessage(level, msg, args);
    console.log(message);
  }

  private buildMessage(
    level: LogLevel,
    msg: string | number,
    args?: any[] | undefined,
  ) {
    const padding =
      level === LogLevels.INFO || level === LogLevels.WARN ? ' ' : '';
    const filteredArgs = args?.filter((arg) => !!arg);
    const argsString = filteredArgs ? `: ${filteredArgs.join(' ')}` : '';
    return `[${level}]${padding} flagsync => ${msg}${argsString}`;
  }
}
