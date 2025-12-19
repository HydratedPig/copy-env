/**
 * .copy-env.js - ESM 格式配置示例
 *
 * 这是一个 JavaScript 配置文件，支持运行时逻辑和动态配置
 */

// 可以导入其他模块
import { resolve } from 'node:path';

// 导出配置对象
export default {
  workspaceRoot: process.cwd(),
  envExampleName: '.env.example',
  envName: '.env.local',
  type: 'auto',

  // 可以根据环境变量动态配置
  packages: process.env.CUSTOM_PACKAGES
    ? process.env.CUSTOM_PACKAGES.split(',')
    : undefined,
};
