import type { CopyEnvConfig } from './types';
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import JSON5 from 'json5';
import {
  LERNA_MANIFEST_FILENAME,
  PNPM_WORKSPACE_FILENAME,
} from './constant';

/**
 * Monorepo type detection result
 */
export type MonorepoType = 'pnpm' | 'lerna' | 'none';

/**
 * Auto-detect monorepo type
 */
export function detectMonorepoType(workspaceRoot: string): MonorepoType {
  if (fs.existsSync(path.resolve(workspaceRoot, PNPM_WORKSPACE_FILENAME))) {
    return 'pnpm';
  }
  if (fs.existsSync(path.resolve(workspaceRoot, LERNA_MANIFEST_FILENAME))) {
    return 'lerna';
  }
  return 'none';
}

/**
 * Read packages from pnpm-workspace.yaml
 */
export function readPnpmWorkspace(workspaceRoot: string): string[] {
  const workspaceFile = path.resolve(workspaceRoot, PNPM_WORKSPACE_FILENAME);

  if (!fs.existsSync(workspaceFile)) {
    return [];
  }

  try {
    const content = fs.readFileSync(workspaceFile, 'utf-8');
    const workspace = yaml.load(content) as { packages?: string[] };
    return workspace.packages || [];
  }
  catch (error) {
    console.error('Failed to read pnpm-workspace.yaml:', error);
    return [];
  }
}

/**
 * Read packages from lerna.json
 */
export function readLernaConfig(workspaceRoot: string): string[] {
  const lernaFile = path.resolve(workspaceRoot, LERNA_MANIFEST_FILENAME);

  if (!fs.existsSync(lernaFile)) {
    return [];
  }

  const content = fs.readFileSync(lernaFile, 'utf-8');
  const lerna = JSON5.parse(content) as { packages?: string[] };
  return lerna.packages || [];
}

/**
 * Get package patterns based on config
 */
export function getPackagePatterns(
  workspaceRoot: string,
  config: CopyEnvConfig,
): string[] {
  // Use manual config if specified
  if (config.packages && config.packages.length > 0) {
    return config.packages;
  }

  // Auto-detect based on type
  const type = config.type || 'auto';
  let patterns: string[] = [];

  if (type === 'auto') {
    const detectedType = detectMonorepoType(workspaceRoot);
    if (detectedType === 'pnpm') {
      patterns = readPnpmWorkspace(workspaceRoot);
    }
    else if (detectedType === 'lerna') {
      patterns = readLernaConfig(workspaceRoot);
    }
  }
  else if (type === 'pnpm') {
    patterns = readPnpmWorkspace(workspaceRoot);
  }
  else if (type === 'lerna') {
    patterns = readLernaConfig(workspaceRoot);
  }

  return patterns;
}

/**
 * Convert glob pattern to RegExp
 */
function globToRegExp(pattern: string): RegExp {
  const regexPattern = pattern
    .replace(/\./g, '\\.')
    .replace(/\*/g, '[^/]*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regexPattern}$`);
}

/**
 * Get all folders in a directory
 */
function getFolders(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const dirList = fs.readdirSync(dirPath, { withFileTypes: true });
  return dirList
    .filter(f => f.isDirectory())
    .map(i => i.name);
}

/**
 * Resolve glob pattern to actual directories
 */
function resolveGlobPattern(pattern: string, workspaceRoot: string): string[] {
  const parts = pattern.split('/');
  const baseDirs = parts.filter(p => !p.includes('*'));
  const baseDir = path.resolve(workspaceRoot, ...baseDirs);

  if (!fs.existsSync(baseDir)) {
    return [];
  }

  const regex = globToRegExp(pattern);
  const folders = getFolders(baseDir);
  const candidates = folders.map(f => path.join(...baseDirs, f));

  return candidates
    .filter(c => regex.test(c))
    .map(c => path.resolve(workspaceRoot, c));
}

/**
 * Get all package directories based on patterns
 */
export function getPackageDirs(
  patterns: string[],
  workspaceRoot: string,
): string[] {
  const packageDirs: string[] = [];

  for (const pattern of patterns) {
    if (pattern.includes('*')) {
      packageDirs.push(...resolveGlobPattern(pattern, workspaceRoot));
    }
    else {
      const dir = path.resolve(workspaceRoot, pattern);
      if (fs.existsSync(dir)) {
        packageDirs.push(dir);
      }
    }
  }

  return packageDirs;
}
