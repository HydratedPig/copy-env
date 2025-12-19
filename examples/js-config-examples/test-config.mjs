#!/usr/bin/env node

/**
 * 测试脚本：验证不同格式的配置文件都能���常加载
 */

import { readConfig } from '../../dist/index.mjs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testConfig(configFile, description) {
  console.log(`\n测试: ${description}`);
  console.log(`配置文件: ${configFile}`);
  console.log('---');

  try {
    const examplesDir = join(__dirname, '../js-config-examples');
    const fullConfigPath = join(examplesDir, configFile);
    console.log(`完整路径: ${fullConfigPath}`);

    const config = await readConfig(examplesDir, fullConfigPath);

    console.log('✓ 配置加载成功:');
    console.log(JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('✗ 配置加载失败:', error.message);
    console.error(error.stack);
  }
}

async function runTests() {
  console.log('========================================');
  console.log('  JavaScript 配置文件加载测试');
  console.log('========================================');

  // 测试 ESM 格式
  await testConfig('.copy-env.js', 'ESM 格式配置');

  // 测试 MJS 函数式配置
  await testConfig('.copy-env-function.mjs', '函数式异步配置 (MJS)');

  // 测试 CJS 格式
  await testConfig('.copy-env-cjs.cjs', 'CommonJS 格式配置');

  // 测试自动检测（应该找到 .copy-env.js，因为优先级最高）
  console.log('\n测试: 自动检测配置文件（按优先级）');
  console.log('---');
  try {
    const examplesDir = join(__dirname, '../js-config-examples');
    console.log(`工作目录: ${examplesDir}`);
    const config = await readConfig(examplesDir);
    console.log('✓ 自动检测成功，加载了配置:');
    console.log(JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('✗ 自动检测失败:', error.message);
    console.error(error.stack);
  }

  console.log('\n========================================');
  console.log('  测试完成！');
  console.log('========================================\n');
}

runTests().catch(console.error);
