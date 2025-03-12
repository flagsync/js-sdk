import path from 'path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    alias: {
      '~sdk': path.resolve(__dirname, './src'),
      '~api': path.resolve(__dirname, './src/api'),
      '~di': path.resolve(__dirname, './src/di'),
      '~config': path.resolve(__dirname, './src/config'),
      '~logger': path.resolve(__dirname, './src/logger'),
      '~managers': path.resolve(__dirname, './src/managers'),
    },
  },
});
