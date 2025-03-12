import { describe, expect, it } from 'vitest';

import type { FsConfig } from '~config/types';

import { FlagSyncFactory, FsEvent } from './index';

describe('FlagSyncFactory', () => {
  it('should handle initialization errors', async () => {
    const invalidConfig: FsConfig = {
      sdkKey: '0x123',
      core: {
        key: 'test-key',
      },
    };

    const factory = FlagSyncFactory(invalidConfig);
    const client = factory.client();

    const errorPromise = new Promise((resolve) => {
      client.on(FsEvent.ERROR, (error) => {
        resolve(error);
      });
    });

    try {
      await client.waitForReadyCanThrow();
    } catch (error) {
      expect(error).toBeDefined();
    }

    const emittedError = await errorPromise;
    expect(emittedError).toBeDefined();
  });
});
