import { defineConfig } from 'tsup';

export function modernConfig(opts: any) {
  return {
    entry: opts.entry,
    format: ['cjs', 'esm'],
    target: [
      'chrome91',
      'firefox90',
      'edge91',
      'safari15',
      'ios15',
      'opera77',
      'node14',
    ],
    outDir: 'dist/modern',
    dts: true,
    sourcemap: true,
    clean: true,
  };
}

export function legacyConfig(opts: any) {
  return {
    entry: opts.entry,
    format: ['cjs', 'esm'],
    target: ['es2020', 'node14'],
    outDir: 'dist/legacy',
    dts: true,
    sourcemap: true,
    clean: true,
  };
}

export default defineConfig([
  modernConfig({ entry: ['src/index.ts'] }),
  legacyConfig({ entry: ['src/index.ts'] }),
]);
