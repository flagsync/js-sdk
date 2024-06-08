import replaceInFile from 'replace-in-file';
import { Options, defineConfig } from 'tsup';

import packageJson from './package.json';

async function injectSdkDetails(dist: string) {
  try {
    await replaceInFile({
      files: `${dist}/**/*`,
      from: /__SDK_NAME__/g,
      to: packageJson.name,
    });
    await replaceInFile({
      files: `${dist}/**/*`,
      from: /__SDK_VERSION__/g,
      to: packageJson.version,
    });
  } catch (error) {
    console.error('[injectSdkDetails]:', error);
  }
}

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
    async onSuccess() {
      await injectSdkDetails('dist/modern');
    },
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
    async onSuccess() {
      await injectSdkDetails('dist/legacy');
    },
  };
}

export default defineConfig([
  modernConfig({ entry: ['src/index.ts'] }),
  legacyConfig({ entry: ['src/index.ts'] }),
]);
