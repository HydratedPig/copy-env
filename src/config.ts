import type { CopyEnvConfig } from './types';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import JSON5 from 'json5';
import { COPY_ENV_CONFIG_FILENAME } from './constant';

/**
 * Read user config from custom path or default .copy-env.json
 */
export function readConfig(
  workspaceRoot: string = process.cwd(),
  configPath: string = COPY_ENV_CONFIG_FILENAME,
): CopyEnvConfig {
  const configFile = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(workspaceRoot, configPath);

  if (!fs.existsSync(configFile)) {
    return {};
  }

  const content = fs.readFileSync(configFile, 'utf-8');
  const config = JSON5.parse(content) as CopyEnvConfig;

  // Set workspaceRoot if not specified in config
  if (!config.workspaceRoot) {
    config.workspaceRoot = workspaceRoot;
  }

  return config;
}
