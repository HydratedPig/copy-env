import process from 'node:process';
import { readConfig } from './config';
import { COPY_ENV_CONFIG_FILENAME } from './constant';
import { CopyEnvManager } from './manager';

/**
 * Main function to prepare envs (for backward compatibility)
 */
export async function copyEnvs(
  workspaceRoot: string = process.cwd(),
  configPath: string = COPY_ENV_CONFIG_FILENAME,
): Promise<void> {
  // Read configuration
  const config = readConfig(workspaceRoot, configPath);
  const manager = new CopyEnvManager(config);
  await manager.execute();
}
