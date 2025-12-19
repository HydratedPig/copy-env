import type { CopyEnvConfig } from './types';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { ENV_EXAMPLE_FILENAME, ENV_TARGET_FILENAME } from './constant';
import { getPackageDirs, getPackagePatterns } from './workspace';

/**
 * CopyEnv Manager Class
 * Manages environment file copying for both single projects and monorepos
 */
export class CopyEnvManager {
  private workspaceRoot: string;
  private config: CopyEnvConfig;
  private envExampleName: string;
  private envName: string;

  constructor(config: CopyEnvConfig = {}) {
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    this.config = config;
    this.envExampleName = config.envExampleName || ENV_EXAMPLE_FILENAME;
    this.envName = config.envName || ENV_TARGET_FILENAME;
  }

  /**
   * Execute the environment file copying process
   */
  public async execute(): Promise<void> {
    const patterns = getPackagePatterns(this.workspaceRoot, this.config);

    if (patterns.length === 0) {
      console.log('No monorepo detected, copying env in root directory...');
      this.copyEnv(this.workspaceRoot);
      return;
    }

    const packageDirs = getPackageDirs(patterns, this.workspaceRoot);

    if (packageDirs.length === 0) {
      console.log('No packages found, copying env in root directory...');
      this.copyEnv(this.workspaceRoot);
      return;
    }

    for (const pkgDir of packageDirs) {
      this.copyEnv(pkgDir);
    }

    console.log(`\n✓ Processed ${packageDirs.length} package(s)`);
  }

  /**
   * Copy .env.example to .env for a specific package
   */
  private copyEnv(pkgPath: string): void {
    const envExamplePath = this.resolveEnvPath(this.envExampleName, pkgPath);
    const targetEnvPath = this.resolveEnvPath(this.envName, pkgPath);

    if (!fs.existsSync(envExamplePath)) {
      return;
    }

    const exampleEnvMap = this.readByLine(envExamplePath);
    const targetEnvMap = this.readByLine(targetEnvPath);

    // Merge existing env values
    for (const [k, v] of targetEnvMap.entries()) {
      if (exampleEnvMap.has(k) && v) {
        exampleEnvMap.set(k, v);
      }
    }

    const envStr = Array.from(exampleEnvMap.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    fs.writeFileSync(targetEnvPath, envStr);
    console.log(
      `✓ Successfully copied \x1B[32m${exampleEnvMap.size}\x1B[0m envs: ${pkgPath}`,
    );
  }

  /**
   * Read env file and parse to Map
   */
  private readByLine(filePath: string): Map<string, string> {
    const envMap = new Map<string, string>();

    if (!fs.existsSync(filePath)) {
      return envMap;
    }

    const file = fs.readFileSync(filePath, 'utf-8');
    const envs = file.split('\n');

    for (const line of envs) {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('#') || !trimmedLine) {
        continue;
      }

      const equalIndex = line.indexOf('=');
      if (equalIndex === -1) {
        continue;
      }

      const key = line.substring(0, equalIndex).trim();
      const value = line.substring(equalIndex + 1).trim();
      envMap.set(key, value);
    }

    return envMap;
  }

  /**
   * Resolve env file path
   * - If absolute path (starts with /), resolve from workspace root
   * - If relative path, resolve from package directory
   */
  private resolveEnvPath(envFileName: string, pkgPath: string): string {
    if (path.isAbsolute(envFileName)) {
      return path.resolve(this.workspaceRoot, envFileName);
    }
    return path.resolve(pkgPath, envFileName);
  }
}
