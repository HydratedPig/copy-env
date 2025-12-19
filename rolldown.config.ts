import { defineConfig } from 'rolldown';

// Node.js built-in modules that should be treated as external
const nodeBuiltins = [
  'fs',
  'path',
  'url',
  'events',
  'util',
  'stream',
  'os',
  'crypto',
  'buffer',
];

export default defineConfig([
  // ESM build for library
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'esm',
      sourcemap: true,
    },
    external: [...nodeBuiltins, 'js-yaml', 'json5', /^node:/],
  },
  // CJS build for library
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: [...nodeBuiltins, 'js-yaml', 'json5', /^node:/],
  },
  // CLI build
  {
    input: 'src/cli.ts',
    output: {
      file: 'dist/cli.mjs',
      format: 'esm',
      sourcemap: true,
      banner: '#!/usr/bin/env node',
    },
    external: [...nodeBuiltins, 'js-yaml', 'json5', 'cac', /^node:/],
  },
]);

