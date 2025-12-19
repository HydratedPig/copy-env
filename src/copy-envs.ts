import process from 'node:process';
import { readConfig } from './config';
import { CopyEnvManager } from './manager';

/**
 * Main function to prepare envs (for backward compatibility)
 */
export async function copyEnvs(
  workspaceRoot: string = process.cwd(),
  configPath?: string,
): Promise<void> {
  // Read configuration (支持异步加载 JS 配置文件)
  const config = await readConfig(workspaceRoot, configPath);
  const manager = new CopyEnvManager(config);
  await manager.execute();
}
