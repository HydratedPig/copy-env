import type { CopyEnvConfig } from './types';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { pathToFileURL } from 'node:url';
import JSON5 from 'json5';
import { COPY_ENV_CONFIG_FILENAMES } from './constant';

/**
 * 判断文件是否为 JavaScript 配置文件
 */
function isJavaScriptConfig(filePath: string): boolean {
  return /\.(?:js|mjs|cjs)$/.test(filePath);
}

/**
 * 查找配置文件（按优先级）
 * 优先级: .js > .mjs > .cjs > .json
 */
function findConfigFile(workspaceRoot: string): string | null {
  for (const filename of COPY_ENV_CONFIG_FILENAMES) {
    const configFile = path.resolve(workspaceRoot, filename);
    if (fs.existsSync(configFile)) {
      return configFile;
    }
  }
  return null;
}

/**
 * 读取 JSON/JSON5 配置文件
 */
function readJsonConfig(configFile: string): CopyEnvConfig {
  const content = fs.readFileSync(configFile, 'utf-8');
  return JSON5.parse(content) as CopyEnvConfig;
}

/**
 * 动态导入 JavaScript 配置文件 (支持 ESM/CJS)
 */
async function readJsConfig(configFile: string): Promise<CopyEnvConfig> {
  // 将文件路径转换为 file:// URL，确保在 Windows 和 Unix 系统上都能正常工作
  const fileUrl = pathToFileURL(configFile).href;

  // 动态导入配置模块
  const module = await import(fileUrl);

  // 支持 default export 和 named export
  const config = module.default || module;

  // 如果配置是一个函数，执行它获取配置对象
  if (typeof config === 'function') {
    return await config();
  }

  return config as CopyEnvConfig;
}

/**
 * Read user config from custom path or auto-detect config file
 * 支持格式: .js, .mjs, .cjs, .json
 */
export async function readConfig(
  workspaceRoot: string = process.cwd(),
  configPath?: string,
): Promise<CopyEnvConfig> {
  let configFile: string | null = null;

  if (configPath) {
    // 如果指定了配置文件路径，使用该路径
    configFile = path.isAbsolute(configPath)
      ? configPath
      : path.resolve(workspaceRoot, configPath);

    if (!fs.existsSync(configFile)) {
      return {};
    }
  }
  else {
    // 否则自动查找配置文件（按优先级）
    configFile = findConfigFile(workspaceRoot);

    if (!configFile) {
      return {};
    }
  }

  let config: CopyEnvConfig;

  // 根据文件类型选择不同的读取方式
  if (isJavaScriptConfig(configFile)) {
    config = await readJsConfig(configFile);
  }
  else {
    config = readJsonConfig(configFile);
  }

  // Set workspaceRoot if not specified in config
  if (!config.workspaceRoot) {
    config.workspaceRoot = workspaceRoot;
  }

  return config;
}
