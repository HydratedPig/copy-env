import type { CopyEnvConfig } from '../src/types';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CopyEnvManager } from '../src/manager';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures', 'manager');
const envFilesDir = path.join(__dirname, 'fixtures', 'env-files');

describe('manager.ts', () => {
  let tempDir: string;

  beforeEach(() => {
    // Create a temporary directory for each test
    tempDir = path.join(fixturesDir, `temp-${Date.now()}`);
    fs.mkdirSync(tempDir, { recursive: true });
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
    vi.restoreAllMocks();
  });

  describe('basic env file copying', () => {
    it('should copy .env.example to .env', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.example'),
        path.join(tempDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toContain('API_KEY=example-api-key');
      expect(envContent).toContain('DB_URL=localhost:5432');
    });

    it('should not copy when .env.example does not exist', async () => {
      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      expect(fs.existsSync(path.join(tempDir, '.env'))).toBe(false);
    });

    it('should use custom env example name', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.example'),
        path.join(tempDir, '.env.template'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envExampleName: '.env.template',
        envName: '.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toContain('API_KEY=example-api-key');
    });

    it('should use custom env target name', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.example'),
        path.join(tempDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env.local',
      });
      await manager.execute();

      const envContent = fs.readFileSync(
        path.join(tempDir, '.env.local'),
        'utf-8',
      );
      expect(envContent).toContain('API_KEY=example-api-key');
    });
  });

  describe('preserving existing values', () => {
    it('should update with new values from .env.example by default', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.example'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.existing'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Values should be updated from .env.example (not preserved)
      expect(envContent).toContain('API_KEY=example-api-key');
      expect(envContent).toContain('DB_URL=localhost:5432');
      expect(envContent).toContain('SECRET_TOKEN=example-token');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
    });

    it('should skip lines with comments', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.with-comments'),
        path.join(tempDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).not.toContain('# API Configuration');
      expect(envContent).toContain('API_KEY=example-key');
      expect(envContent).toContain('DB_URL=localhost');
    });

    it('should preserve custom env variables not in .env.example (default mode)', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Custom env variables should be preserved
      expect(envContent).toContain('CUSTOM_ENV=custom-value');
      expect(envContent).toContain('API_CUSTOM_KEY=custom-api-key');
      // Values in .env.example should be updated (not preserved from .env)
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('SECRET_TOKEN=new-token');
      expect(envContent).toContain('SECRET_KEY=new-secret');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
    });

    it('should preserve custom env variables not in .env.example (with skipIfExists)', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        skipIfExists: /^SECRET_/,
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Custom env variables should be preserved
      expect(envContent).toContain('CUSTOM_ENV=custom-value');
      expect(envContent).toContain('API_CUSTOM_KEY=custom-api-key');
      // Keys matching /^SECRET_/ should be preserved from existing .env
      expect(envContent).toContain('SECRET_TOKEN=prod-token');
      expect(envContent).toContain('SECRET_KEY=prod-secret');
      // Other values should be updated from .env.example
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
    });

    it('should not preserve custom env variables when preserveCustomVars is false', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        preserveCustomVars: false,
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Custom env variables should NOT be preserved
      expect(envContent).not.toContain('CUSTOM_ENV');
      expect(envContent).not.toContain('API_CUSTOM_KEY');
      // Values in .env.example should be updated (not preserved from .env)
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('SECRET_TOKEN=new-token');
      expect(envContent).toContain('SECRET_KEY=new-secret');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
    });

    it('should not preserve custom env variables with skipIfExists and preserveCustomVars false', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        skipIfExists: /^SECRET_/,
        preserveCustomVars: false,
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Custom env variables should NOT be preserved
      expect(envContent).not.toContain('CUSTOM_ENV');
      expect(envContent).not.toContain('API_CUSTOM_KEY');
      // Keys matching /^SECRET_/ should be preserved from existing .env
      expect(envContent).toContain('SECRET_TOKEN=prod-token');
      expect(envContent).toContain('SECRET_KEY=prod-secret');
      // Other values should be updated from .env.example
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
    });
  });

  describe('default behavior (no skipIfExists)', () => {
    it('should update all values from .env.example when skipIfExists is not configured', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        // No skipIfExists configured - should use new values
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // All values should be updated from .env.example
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('SECRET_TOKEN=new-token');
      expect(envContent).toContain('SECRET_KEY=new-secret');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
      // Custom env variables should still be preserved (preserveCustomVars defaults to true)
      expect(envContent).toContain('CUSTOM_ENV=custom-value');
      expect(envContent).toContain('API_CUSTOM_KEY=custom-api-key');
    });

    it('should allow .env.example updates to propagate to .env on subsequent runs', async () => {
      // First run: Create initial .env from .env.example
      fs.writeFileSync(
        path.join(tempDir, '.env.example'),
        'API_KEY=version1\nDB_URL=localhost',
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      let envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toContain('API_KEY=version1');
      expect(envContent).toContain('DB_URL=localhost');

      // Second run: Update .env.example and verify .env gets updated
      fs.writeFileSync(
        path.join(tempDir, '.env.example'),
        'API_KEY=version2\nDB_URL=production',
      );

      await manager.execute();

      envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Values should be updated to version2
      expect(envContent).toContain('API_KEY=version2');
      expect(envContent).toContain('DB_URL=production');
    });

    it('should update values but preserve custom vars when preserveCustomVars is true', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        preserveCustomVars: true,
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // All values from .env.example should use new values
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('SECRET_TOKEN=new-token');
      expect(envContent).toContain('SECRET_KEY=new-secret');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
      // Custom env variables should be preserved
      expect(envContent).toContain('CUSTOM_ENV=custom-value');
      expect(envContent).toContain('API_CUSTOM_KEY=custom-api-key');
    });

    it('should update all values and not preserve custom vars when preserveCustomVars is false', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        preserveCustomVars: false,
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // All values from .env.example should use new values
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('SECRET_TOKEN=new-token');
      expect(envContent).toContain('SECRET_KEY=new-secret');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
      // Custom env variables should NOT be preserved
      expect(envContent).not.toContain('CUSTOM_ENV');
      expect(envContent).not.toContain('API_CUSTOM_KEY');
    });
  });

  describe('skipIfExists functionality', () => {
    it('should skip single string pattern when value exists', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        skipIfExists: 'API_KEY',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // API_KEY should be preserved from existing .env
      expect(envContent).toContain('API_KEY=prod-key');
      expect(envContent).toContain('API_CUSTOM_KEY=custom-api-key');
      expect(envContent).toContain('CUSTOM_ENV=custom-value');
      // All other values should be updated from .env.example
      expect(envContent).toContain('SECRET_TOKEN=new-token');
      expect(envContent).toContain('SECRET_KEY=new-secret');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
    });

    it('should skip RegExp pattern when value exists', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        skipIfExists: /^SECRET_/,
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Keys matching /^SECRET_/ should be preserved
      expect(envContent).toContain('SECRET_TOKEN=prod-token');
      expect(envContent).toContain('SECRET_KEY=prod-secret');
      // Other values should be updated from .env.example
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('PORT=3000');
      expect(envContent).toContain('DEBUG=false');
    });

    it('should skip array of string patterns', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        skipIfExists: ['API_KEY', 'PORT'],
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // API_KEY and PORT should be preserved
      expect(envContent).toContain('API_KEY=prod-key');
      expect(envContent).toContain('PORT=3001');
      // Other values should be updated from .env.example
      expect(envContent).toContain('SECRET_TOKEN=new-token');
      expect(envContent).toContain('SECRET_KEY=new-secret');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('DEBUG=false');
    });

    it('should skip array of RegExp patterns', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        skipIfExists: [/^SECRET_/, /^PORT$/],
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Keys matching patterns should be preserved
      expect(envContent).toContain('SECRET_TOKEN=prod-token');
      expect(envContent).toContain('SECRET_KEY=prod-secret');
      expect(envContent).toContain('PORT=3001');
      // Other values should be updated from .env.example
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('DEBUG=false');
    });

    it('should skip mixed string and RegExp patterns', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-pattern'),
        path.join(tempDir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.skip-results'),
        path.join(tempDir, '.env'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
        skipIfExists: ['PORT', /^SECRET_/],
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Keys matching patterns should be preserved
      expect(envContent).toContain('PORT=3001');
      expect(envContent).toContain('SECRET_TOKEN=prod-token');
      expect(envContent).toContain('SECRET_KEY=prod-secret');
      // Other values should be updated from .env.example
      expect(envContent).toContain('API_KEY=new-key');
      expect(envContent).toContain('DB_PASSWORD=new-password');
      expect(envContent).toContain('DEBUG=false');
    });
  });

  describe('path resolution', () => {
    it('should resolve relative paths from package directory', async () => {
      const configDir = path.join(tempDir, 'config');
      fs.mkdirSync(configDir, { recursive: true });
      fs.copyFileSync(
        path.join(envFilesDir, '.env.simple'),
        path.join(configDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envExampleName: 'config/.env.example',
        envName: 'config/.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(
        path.join(configDir, '.env'),
        'utf-8',
      );
      expect(envContent).toBe('KEY=value');
    });

    it('should create target directory if it does not exist', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.simple'),
        path.join(tempDir, '.env.example'),
      );

      const targetDir = path.join(tempDir, 'output', 'nested');
      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: 'output/nested/.env',
      });
      await manager.execute();

      expect(fs.existsSync(targetDir)).toBe(true);
      const envContent = fs.readFileSync(
        path.join(targetDir, '.env'),
        'utf-8',
      );
      expect(envContent).toBe('KEY=value');
    });
  });

  describe('environment variable parsing', () => {
    it('should handle values with special characters, equals signs, and quotes', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.special-chars'),
        path.join(tempDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      // Special characters
      expect(envContent).toContain('DB_URL=postgres://user:pass@localhost:5432/db');
      // Equals signs in values
      expect(envContent).toContain('JWT_SECRET=base64encodedstring==');
      // Quoted values
      expect(envContent).toContain('MESSAGE="Hello World"');
      expect(envContent).toContain('PATH=\'/usr/local/bin\'');
    });

    it('should handle multiline values', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.multiline'),
        path.join(tempDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      // Note: The current implementation doesn't support true multiline values
      // It will treat each line as a separate key-value pair
      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toContain('SINGLE=value');
      expect(envContent).toContain('MULTI=line1');
    });
  });

  describe('monorepo scenarios', () => {
    it('should copy env files to multiple packages', async () => {
      // Create a monorepo structure
      const pkg1Dir = path.join(tempDir, 'packages', 'pkg1');
      const pkg2Dir = path.join(tempDir, 'packages', 'pkg2');
      fs.mkdirSync(pkg1Dir, { recursive: true });
      fs.mkdirSync(pkg2Dir, { recursive: true });

      fs.copyFileSync(
        path.join(envFilesDir, '.env.pkg1'),
        path.join(pkg1Dir, '.env.example'),
      );
      fs.copyFileSync(
        path.join(envFilesDir, '.env.pkg2'),
        path.join(pkg2Dir, '.env.example'),
      );

      // Mock workspace detection
      const config: CopyEnvConfig = {
        workspaceRoot: tempDir,
        envName: '.env',
        packages: ['packages/pkg1', 'packages/pkg2'],
      };

      const manager = new CopyEnvManager(config);
      await manager.execute();

      const env1Content = fs.readFileSync(path.join(pkg1Dir, '.env'), 'utf-8');
      const env2Content = fs.readFileSync(path.join(pkg2Dir, '.env'), 'utf-8');

      expect(env1Content).toBe('PKG1_KEY=value1');
      expect(env2Content).toBe('PKG2_KEY=value2');
    });

    it('should handle packages without .env.example', async () => {
      const pkg1Dir = path.join(tempDir, 'packages', 'pkg1');
      const pkg2Dir = path.join(tempDir, 'packages', 'pkg2');
      fs.mkdirSync(pkg1Dir, { recursive: true });
      fs.mkdirSync(pkg2Dir, { recursive: true });

      // Only pkg1 has .env.example
      fs.copyFileSync(
        path.join(envFilesDir, '.env.simple'),
        path.join(pkg1Dir, '.env.example'),
      );

      const config: CopyEnvConfig = {
        workspaceRoot: tempDir,
        envName: '.env',
        packages: ['packages/pkg1', 'packages/pkg2'],
      };

      const manager = new CopyEnvManager(config);
      await manager.execute();

      expect(fs.existsSync(path.join(pkg1Dir, '.env'))).toBe(true);
      expect(fs.existsSync(path.join(pkg2Dir, '.env'))).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle env file with only comments', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.only-comments'),
        path.join(tempDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      // File should be created but empty since there are no valid key-value pairs
      expect(fs.existsSync(path.join(tempDir, '.env'))).toBe(true);
      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toBe('');
    });

    it('should handle keys without values', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.keys-without-values'),
        path.join(tempDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toContain('KEY_WITH_VALUE=value');
      expect(envContent).toContain('KEY_WITHOUT_VALUE=');
    });

    it('should trim whitespace from keys and values', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.whitespace'),
        path.join(tempDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toBe('KEY_WITH_SPACES=value with spaces');
    });

    it('should handle empty .env.example', async () => {
      fs.copyFileSync(
        path.join(envFilesDir, '.env.empty'),
        path.join(tempDir, '.env.example'),
      );

      const manager = new CopyEnvManager({
        workspaceRoot: tempDir,
        envName: '.env',
      });
      await manager.execute();

      const envContent = fs.readFileSync(path.join(tempDir, '.env'), 'utf-8');
      expect(envContent).toBe('');
    });
  });
});
