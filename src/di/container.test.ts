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
      pollRate: 60,
    },
    tracking: {
      impressions: {
        maxQueueSize: 50,
        pushRate: 60,
      },
      events: {
        maxQueueSize: 50,
        pushRate: 60,
      },
    },
    log: new Logger({
      logLevel: 'DEBUG',
      customLogger: console,
    }),
    urls: {
      sdk: 'https://sdk.flagsync.com',
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
      container.register('test', () => mockService);
      expect(container.get('test')).toBe(mockService);
    });

    it('should allow service re-registration', () => {
      const mockService1 = { test: 'service1' };
      const mockService2 = { test: 'service2' };

      container.register('test', () => mockService1);
      expect(container.get('test')).toBe(mockService1);

      container.register('test', () => mockService2);
      expect(container.get('test')).toBe(mockService2);
    });

    it('should throw when getting non-existent service', () => {
      expect(() => {
        container.get('nonexistent');
      }).toThrowError("Service 'nonexistent' not found");
    });

    it('should create service immediately on registration', () => {
      const factory = vi.fn().mockReturnValue({});
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
      container.register('serviceA', () => serviceA);

      type ServiceB = { name: string; a: typeof serviceA };
      container.register<ServiceB>('serviceB', (c) => ({
        name: 'B',
        a: c.get('serviceA'),
      }));

      const b = container.get<ServiceB>('serviceB');
      expect(b).toEqual({ name: 'B', a: serviceA });
    });
  });

  describe('lifecycle', () => {
    it('should clear all services', () => {
      const container = Container.getInstance(mockSettings);
      container.register('test', () => ({}));

      container.clear();
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
        container.register('errorService', () => {
          throw new Error('Factory error');
        });
      }).toThrowError('Factory error');
    });

    it('should maintain container state when registration errors', () => {
      const container = Container.getInstance(mockSettings);
      const validService = { valid: true };

      container.register('validService', () => validService);

      expect(() => {
        container.register('errorService', () => {
          throw new Error('Factory error');
        });
      }).toThrowError();

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

      container.register<TestService>('typedService', () => testService);
      const retrieved = container.get<TestService>('typedService');

      expect(retrieved.name).toBe('test');
      expect(retrieved.value).toBe(42);
    });
  });
});
