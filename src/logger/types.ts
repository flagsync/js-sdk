export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'NONE';

export interface ILogger {
  setLogLevel(logLevel: LogLevel): void;
  debug(message: any, ...optionalParams: [...any, string?, string?]): void;
  info(message: any, ...optionalParams: [...any, string?, string?]): void;
  log(message: any, ...optionalParams: [...any, string?, string?]): void;
  warn(message: any, ...optionalParams: [...any, string?, string?]): void;
  error(message: any, ...optionalParams: [...any, string?, string?]): void;
}
