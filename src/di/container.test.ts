import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Logger } from '~sdk/logger/logger';

import { FsSettings } from '~config/types.internal';

import { Container } from './container';

describe('Container', () => {
  const mockSettings: FsSettings = {
    sdkKey: 'test-key',
    core: {
      key: 'test-key',
    },
    storage: {
      type: 'memory',
      prefix: 'flagsync',
    },
    sync: {
      type: 'poll',
      pollRateInSec: 60,
    },
    tracking: {
      impressions: {
        maxQueueSize: 50,
        pushRateInSec: 60,
      },
      events: {
        maxQueueSize: 50,
        pushRateInSec: 60,
      },
    },
    log: new Logger({
      logLevel: 'DEBUG',
      customLogger: console,
    }),
    urls: {
      flags: 'https://sdk.flagsync.com/worker',
      ws: 'https://sdk.flagsync.com/worker',
      events: 'https://sdk.flagsync.com',
      sse: 'https://sdk.flagsync.com',
    },
    metadata: {
      sdkName: 'test-sdk',
      sdkVersion: '1.0.0',
    },
    platform: 'browser',
    customLogger: {},
    context: {
      key: 'test-key',
      attributes: {},
    },
    sdkContext: {
      sdkName: 'test-sdk',
      sdkVersion: '1.0.0',
    },
  };

  beforeEach(() => {
    Container.resetInstance();
  });

  describe('getInstance', () => {
    it('should create a new instance with settings', () => {
      const container = Container.getInstance(mockSettings);
      expect(container).toBeDefined();
      expect(container.getSettings()).toBe(mockSettings);
    });

    it('should throw error when getting instance without initialization', () => {
      expect(() => Container.getInstance()).toThrowError(
        'Container must be initialized with settings first',
      );
    });

    it('should return the same instance when called multiple times', () => {
      const container1 = Container.getInstance(mockSettings);
      const container2 = Container.getInstance();
      expect(container1).toBe(container2);
    });
  });

  describe('register and get', () => {
    let container: Container;

    beforeEach(() => {
      container = Container.getInstance(mockSettings);
    });

    it('should register and retrieve a service', () => {
      const mockService = { test: 'service' };
      // @ts-expect-error not a valid service key
      container.register('test', () => mockService);
      // @ts-expect-error not a valid service key
      expect(container.get('test')).toBe(mockService);
    });

    it('should allow service re-registration', () => {
      const mockService1 = { test: 'service1' };
      const mockService2 = { test: 'service2' };

      // @ts-expect-error not a valid service key
      container.register('test', () => mockService1);
      // @ts-expect-error not a valid service key
      expect(container.get('test')).toBe(mockService1);

      // @ts-expect-error not a valid service key
      container.register('test', () => mockService2);
      // @ts-expect-error not a valid service key
      expect(container.get('test')).toBe(mockService2);
    });

    it('should throw when getting non-existent service', () => {
      expect(() => {
        // @ts-expect-error not a valid service key
        container.get('nonexistent');
      }).toThrowError("Service 'nonexistent' not found");
    });

    it('should create service immediately on registration', () => {
      const factory = vi.fn().mockReturnValue({});
      // @ts-expect-error not a valid service key
      container.register('test', factory);
      expect(factory).toHaveBeenCalledTimes(1);
    });
  });

  describe('dependency resolution', () => {
    let container: Container;

    beforeEach(() => {
      container = Container.getInstance(mockSettings);
    });

    it('should resolve nested dependencies', () => {
      const serviceA = { name: 'A' };
      // @ts-expect-error not a valid service key
      container.register('serviceA', () => serviceA);

      type ServiceB = { name: string; a: typeof serviceA };
      // @ts-expect-error not a valid service key
      container.register<ServiceB>('serviceB', (c) => ({
        name: 'B',
        // @ts-expect-error not a valid service key
        a: c.get('serviceA'),
      }));

      // @ts-expect-error not a valid service key
      const b = container.get<ServiceB>('serviceB');
      expect(b).toEqual({ name: 'B', a: serviceA });
    });
  });

  describe('lifecycle', () => {
    it('should clear all services', () => {
      const container = Container.getInstance(mockSettings);
      // @ts-expect-error not a valid service key
      container.register('test', () => ({}));

      container.clear();
      // @ts-expect-error not a valid service key
      expect(container.hasService('test')).toBe(false);
    });

    it('should reset singleton instance', () => {
      const container1 = Container.getInstance(mockSettings);
      Container.resetInstance();
      const container2 = Container.getInstance(mockSettings);

      expect(container1).not.toBe(container2);
    });
  });

  describe('error handling', () => {
    it('should throw factory errors during registration', () => {
      const container = Container.getInstance(mockSettings);

      expect(() => {
        // @ts-expect-error not a valid service key
        container.register('errorService', () => {
          throw new Error('Factory error');
        });
      }).toThrowError('Factory error');
    });

    it('should maintain container state when registration errors', () => {
      const container = Container.getInstance(mockSettings);
      const validService = { valid: true };

      // @ts-expect-error not a valid service key
      container.register('validService', () => validService);

      expect(() => {
        // @ts-expect-error not a valid service key
        container.register('errorService', () => {
          throw new Error('Factory error');
        });
      }).toThrowError();

      // @ts-expect-error not a valid service key
      expect(container.get('validService')).toBe(validService);
    });
  });

  describe('type safety', () => {
    interface TestService {
      name: string;
      value: number;
    }

    it('should maintain type safety when getting services', () => {
      const container = Container.getInstance(mockSettings);
      const testService: TestService = {
        name: 'test',
        value: 42,
      };

      // @ts-expect-error not a valid service key
      container.register<TestService>('typedService', () => testService);
      // @ts-expect-error not a valid service key
      const retrieved = container.get<TestService>('typedService');

      // @ts-expect-error not a valid service key
      expect(retrieved.name).toBe('test');
      // @ts-expect-error not a valid service key
      expect(retrieved.value).toBe(42);
    });
  });
});
