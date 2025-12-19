/**
 * .copy-env-function.mjs - 函数式配置示例
 *
 * 配置可以是一个函数，支持异步操作
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// 导出配置函数（支持异步）
export default async function() {
  // 可以执行异步操作，比如读取其他配置文件
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    workspaceRoot: process.cwd(),
    envExampleName: isProduction ? '.env.production.example' : '.env.example',
    envName: isProduction ? '.env.production' : '.env.local',
    type: 'auto',

    // 根据环境动态返回配置
    packages: isProduction
      ? ['packages/app', 'packages/api']
      : undefined, // 开发环境自动检测
  };
}
