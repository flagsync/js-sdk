import { defineConfig } from 'tsup';

import { esbuildPluginFilePathExtensions } from 'esbuild-plugin-file-path-extensions'

export function modernConfig(opts: any) {
  return {
    entry: opts.entry,
    format: ['cjs', 'esm'],
    target: ['chrome91', 'firefox90', 'edge91', 'safari15', 'ios15', 'opera77'],
    outDir: 'dist/modern',
    dts: true,
    sourcemap: true,
    clean: true,
    esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],
  }
}

export function legacyConfig(opts: any) {
  return {
    entry: opts.entry,
    format: ['cjs', 'esm'],
    target: ['es2020', 'node16'],
    outDir: 'dist/legacy',
    dts: true,
    sourcemap: true,
    clean: true,
    esbuildPlugins: [esbuildPluginFilePathExtensions({ esmExtension: 'js' })],
  }
}

export default defineConfig([
  modernConfig({ entry: ['src/*.ts', 'src/*.tsx'] }),
  legacyConfig({ entry: ['src/*.ts', 'src/*.tsx'] }),
])

// export default defineConfig({
//   entry: ['src/index.ts'],
//   splitting: false,
//   sourcemap: true,
//   clean: true,
//   dts: true,
//   external: ['eventsource', 'eventemitter3'],
// });
