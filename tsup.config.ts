import { defineConfig, Options } from 'tsup';

export function modernConfig(opts: Options): Options {
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
      'node16',
    ],
    outDir: 'dist/modern',
    dts: true,
    sourcemap: true,
    clean: true,
  };
}

export function legacyConfig(opts: Options): Options {
  return {
    entry: opts.entry,
    format: ['cjs', 'esm'],
    target: ['es2020', 'node16'],
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
