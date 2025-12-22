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
  private skipPatterns: RegExp[];

  constructor(config: CopyEnvConfig = {}) {
    this.workspaceRoot = config.workspaceRoot || process.cwd();
    this.config = config;
    this.envExampleName = config.envExampleName || ENV_EXAMPLE_FILENAME;
    this.envName = config.envName || ENV_TARGET_FILENAME;
    this.skipPatterns = this.normalizeSkipPatterns(config.skipIfExists);
  }

  /**
   * Normalize skipIfExists config to RegExp array
   */
  private normalizeSkipPatterns(
    skipIfExists?: (string | RegExp)[] | RegExp | string,
  ): RegExp[] {
    if (!skipIfExists) {
      return [];
    }

    // Convert to array
    const patterns = Array.isArray(skipIfExists) ? skipIfExists : [skipIfExists];

    // Convert all strings to RegExp
    return patterns.map(pattern =>
      typeof pattern === 'string' ? new RegExp(pattern) : pattern,
    );
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

    // Handle 'skipIfExists' configuration
    // If a key matches skipIfExists pattern and exists in target env, don't copy it
    if (this.skipPatterns.length > 0) {
      for (const k of exampleEnvMap.keys()) {
        if (this.shouldSkipIfExists(k) && targetEnvMap.has(k)) {
          // Skip copying this key, keep the target value
          exampleEnvMap.set(k, targetEnvMap.get(k)!);
        }
      }
    }

    const envStr = Array.from(exampleEnvMap.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    // Ensure the target directory exists before writing
    const targetDir = path.dirname(targetEnvPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(targetEnvPath, envStr);
    console.log(
      `✓ Successfully copied \x1B[32m${exampleEnvMap.size}\x1B[0m envs: ${pkgPath}`,
    );
  }

  /**
   * Check if a key should be skipped based on 'skipIfExists' configuration
   */
  private shouldSkipIfExists(key: string): boolean {
    return this.skipPatterns.some(pattern => pattern.test(key));
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
    return this.resolveFilePath(envFileName, pkgPath, this.workspaceRoot);
  }

  /**
   * Resolve file path with support for absolute and relative paths
   * This is a generic path resolution utility that can be reused for any file path resolution
   *
   * @param filePath - The file path to resolve (can be absolute or relative)
   * @param basePath - The base directory for resolving relative paths (typically the package directory)
   * @param workspaceRoot - The workspace root directory for resolving absolute paths
   * @returns The resolved absolute file path
   *
   * Path resolution rules:
   * - If the path is an absolute path, it's resolved from workspaceRoot
   *   Example: '/config/env' -> '{workspaceRoot}/config/env'
   * - Otherwise, it's treated as relative to basePath
   *   Example: '../shared/env' -> '{basePath}/../shared/env'
   */
  private resolveFilePath(
    filePath: string,
    basePath: string,
    workspaceRoot: string,
  ): string {
    if (path.isAbsolute(filePath)) {
      return path.resolve(workspaceRoot, filePath);
    }

    // For relative paths, resolve from basePath (package directory)
    return path.resolve(basePath, filePath);
  }
}
