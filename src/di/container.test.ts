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
      }).toThrowError("No factory registered for service 'nonexistent'");
    });

    it('should create service only once', () => {
      const factory = vi.fn().mockReturnValue({});
      container.register('test', factory);

      container.get('test');
      container.get('test');
      container.get('test');

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
      container.register('serviceB', (c) => ({
        name: 'B',
        a: c.get('serviceA'),
      }));

      const b = container.get('serviceB');
      expect(b).toEqual({ name: 'B', a: serviceA });
    });

    it('should handle circular dependencies', () => {
      container.register('serviceA', (c) => ({
        name: 'A',
        getB: () => c.get('serviceB'),
      }));

      container.register('serviceB', (c) => ({
        name: 'B',
        getA: () => c.get('serviceA'),
      }));

      const a = container.get('serviceA');
      const b = container.get('serviceB');

      expect(a.getB()).toBe(b);
      expect(b.getA()).toBe(a);
    });
  });

  describe('lifecycle', () => {
    it('should clear all services and factories', () => {
      const container = Container.getInstance(mockSettings);
      container.register('test', () => ({}));
      container.get('test');

      container.clear();

      expect(container.hasService('test')).toBe(false);
      expect(container.isRegistered('test')).toBe(false);
    });

    it('should reset singleton instance', () => {
      const container1 = Container.getInstance(mockSettings);
      Container.resetInstance();
      const container2 = Container.getInstance(mockSettings);

      expect(container1).not.toBe(container2);
    });
  });

  describe('error handling', () => {
    it('should handle factory errors gracefully', () => {
      const container = Container.getInstance(mockSettings);
      container.register('errorService', () => {
        throw new Error('Factory error');
      });

      expect(() => container.get('errorService')).toThrowError('Factory error');
    });

    it('should maintain container state when factory errors', () => {
      const container = Container.getInstance(mockSettings);
      const validService = { valid: true };

      container.register('validService', () => validService);
      container.register('errorService', () => {
        throw new Error('Factory error');
      });

      container.get('validService');
      expect(() => container.get('errorService')).toThrowError();
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
