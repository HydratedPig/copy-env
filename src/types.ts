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
}
