import { readFileSync } from 'fs';

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescriptEngine from 'typescript';

const packageJson = JSON.parse(readFileSync('./package.json'));

const sharedPlugins = [
  peerDepsExternal(),
  resolve(),
  commonjs(),
  typescript({
    tsconfig: './tsconfig.json',
    typescript: typescriptEngine,
    sourceMap: false,
    exclude: [
      'coverage',
      '.storybook',
      'storybook-static',
      'config',
      'dist',
      'node_modules/**',
      '*.cjs',
      '*.mjs',
      '**/__snapshots__/*',
      '**/__tests__',
      '**/*.test.js+(|x)',
      '**/*.test.ts+(|x)',
      '**/*.mdx',
      '**/*.story.ts+(|x)',
      '**/*.story.js+(|x)',
      '**/*.stories.ts+(|x)',
      '**/*.stories.js+(|x)',
      'setupTests.ts',
      'vitest.config.ts',
    ],
  }),
];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true,
      },
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [...sharedPlugins, terser()],
    external: ['react', 'react-dom', 'tslib'],
  },
  {
    input: 'src/index.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dts()],
    external: [/\.css$/],
  },
];
