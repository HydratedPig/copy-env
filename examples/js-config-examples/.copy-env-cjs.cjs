/**
 * .copy-env-cjs.cjs - CommonJS 格式配置示例
 *
 * 使用传统的 CommonJS 模块语法
 */

const path = require('node:path');

module.exports = {
  workspaceRoot: process.cwd(),
  envExampleName: '.env.example',
  envName: '.env.local',
  type: 'pnpm',

  // 可以使用 Node.js API
  packages: [
    path.join('packages', 'web'),
    path.join('packages', 'api'),
  ],
};
