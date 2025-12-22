export interface CopyEnvConfig {
  /**
   * Workspace root directory
   * @default process.cwd()
   */
  workspaceRoot?: string;

  /**
   * Target .env.example file name or path
   * @default '.env.example'
   */
  envExampleName?: string;

  /**
   * Target .env file name or path
   * @default '.env'
   */
  envName?: string;

  /**
   * Manually specify packages directories
   * If not specified, will auto-detect from lerna.json or pnpm-workspace.yaml
   */
  packages?: string[];

  /**
   * Monorepo type
   * - 'pnpm': Use pnpm-workspace.yaml
   * - 'lerna': Use lerna.json
   * - 'auto': Auto-detect
   * @default 'auto'
   */
  type?: 'pnpm' | 'lerna' | 'auto';

  /**
   * Environment variables that should be skipped if they already exist in target .env
   * If the target .env already has these variables, they will not be overwritten
   * Can be:
   * - string: Exact variable name (treated as regex pattern)
   * - RegExp: Regular expression to match variable names
   * - Array<string | RegExp>: Multiple patterns
   * @default undefined
   */
  skipIfExists?: (string | RegExp)[] | RegExp | string;
}
