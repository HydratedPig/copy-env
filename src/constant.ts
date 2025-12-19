export const PNPM_WORKSPACE_FILENAME = 'pnpm-workspace.yaml';
export const LERNA_MANIFEST_FILENAME = 'lerna.json';

// 支持多种配置文件格式，按优先级排序
export const COPY_ENV_CONFIG_FILENAMES = [
  '.copy-env.js',
  '.copy-env.mjs',
  '.copy-env.cjs',
  '.copy-env.json',
] as const;

export const ENV_EXAMPLE_FILENAME = '.env.example';
export const ENV_TARGET_FILENAME = '.env.local';
