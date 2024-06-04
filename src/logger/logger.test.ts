import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';

import { LogLevels, Logger } from './logger';

describe('Logger', () => {
  const consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => {});

  const date = new Date(2024, 1, 1);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(date);
  });

  afterEach(() => {
    vi.useRealTimers();
    consoleLogMock.mockClear();
  });

  afterAll(() => {
    consoleLogMock.mockRestore();
  });

  describe('base logger', () => {
    test('debug message', () => {
      const logger = new Logger({
        logLevel: LogLevels.DEBUG,
        customLogger: undefined,
      });
      logger.debug('This is a debug message', 'another one');

      expect(consoleLogMock).toBeCalledWith(
        'flagsync [02/01/2024, 12:00:00 AM] [DEBUG] => This is a debug message',
        'another one',
      );
    });

    test('info message', () => {
      const logger = new Logger({
        logLevel: LogLevels.INFO,
        customLogger: undefined,
      });
      logger.info('This is a debug message', 'another one');

      expect(consoleLogMock).toBeCalledWith(
        'flagsync [02/01/2024, 12:00:00 AM] [INFO]  => This is a debug message',
        'another one',
      );
    });

    test('warn message', () => {
      const logger = new Logger({
        logLevel: LogLevels.WARN,
        customLogger: undefined,
      });
      logger.warn('This is a debug message', 'another one');

      expect(consoleLogMock).toBeCalledWith(
        'flagsync [02/01/2024, 12:00:00 AM] [WARN]  => This is a debug message',
        'another one',
      );
    });

    test('error message', () => {
      const logger = new Logger({
        logLevel: LogLevels.ERROR,
        customLogger: undefined,
      });
      logger.error('This is a debug message', 'another one');

      expect(consoleLogMock).toBeCalledWith(
        'flagsync [02/01/2024, 12:00:00 AM] [ERROR] => This is a debug message',
        'another one',
      );
    });
  });

  describe('custom logger', () => {
    test('debug message', () => {
      const logger = new Logger({
        logLevel: LogLevels.DEBUG,
        customLogger: {
          debug(message: any, ...optionalParams) {
            console.log(message, ...optionalParams);
          },
        },
      });
      logger.debug('This is a debug message', 'another one');
      expect(consoleLogMock).toBeCalledWith(
        'This is a debug message',
        'another one',
      );
    });

    test('debug message', () => {
      const logger = new Logger({
        logLevel: LogLevels.DEBUG,
        customLogger: {
          debug(message: any, ...optionalParams) {
            console.log(message, ...optionalParams);
          },
        },
      });
      logger.debug('This is a debug message', 'another one');
      expect(consoleLogMock).toBeCalledWith(
        'This is a debug message',
        'another one',
      );
    });

    test('warn message', () => {
      const logger = new Logger({
        logLevel: LogLevels.INFO,
        customLogger: {
          info(message: any, ...optionalParams) {
            console.log(message, ...optionalParams);
          },
        },
      });
      logger.info('This is a debug message', 'another one');
      expect(consoleLogMock).toBeCalledWith(
        'This is a debug message',
        'another one',
      );
    });

    test('error message', () => {
      const logger = new Logger({
        logLevel: LogLevels.ERROR,
        customLogger: {
          error(message: any, ...optionalParams) {
            console.log(message, ...optionalParams);
          },
        },
      });
      logger.error('This is a debug message', 'another one');
      expect(consoleLogMock).toBeCalledWith(
        'This is a debug message',
        'another one',
      );
    });
  });
});
