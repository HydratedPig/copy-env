import antfu from '@antfu/eslint-config';

export default antfu(
  {
    typescript: true,
    node: true,
    ignores: [
      '**/dist',
      '**/node_modules',
      '**/*.d.ts',
      '**/examples',
      '**/scripts',
      '**/docs',
    ],
    stylistic: {
      indent: 2,
      quotes: 'single',
      semi: true,
    },
  },
  {
    rules: {
      // CLI 工具需要 console
      'no-console': 'off',
      // 允许使用下划线开头的未使用变量
      'unused-imports/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
    },
  },
);
