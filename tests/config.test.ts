import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { readConfig } from '../src/config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fixturesDir = path.join(__dirname, 'fixtures', 'config');
const configFilesDir = path.join(__dirname, 'fixtures', 'config-files');

describe('config.ts', () => {
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
  });

  describe('config file auto-detection', () => {
    it('should find .copy-env.js with highest priority', async () => {
      // Copy multiple config files to test priority
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.js'),
        path.join(tempDir, '.copy-env.js'),
      );
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.mjs'),
        path.join(tempDir, '.copy-env.mjs'),
      );
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.json'),
        path.join(tempDir, '.copy-env.json'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.js.example');
    });

    it('should find .copy-env.mjs when .js does not exist', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.mjs'),
        path.join(tempDir, '.copy-env.mjs'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.mjs.example');
    });

    it('should find .copy-env.cjs when .js and .mjs do not exist', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.cjs'),
        path.join(tempDir, '.copy-env.cjs'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.cjs.example');
    });

    it('should find .copy-env.json with lowest priority', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.json'),
        path.join(tempDir, '.copy-env.json'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.json.example');
    });

    it('should return empty config when no config file exists', async () => {
      const config = await readConfig(tempDir);
      expect(config).toEqual({});
    });
  });

  describe('javaScript config file support', () => {
    it('should read .js config file (ESM default export)', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env-basic.js'),
        path.join(tempDir, '.copy-env.js'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.example');
      expect(config.envName).toBe('.env');
    });

    it('should read .mjs config file', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.mjs'),
        path.join(tempDir, '.copy-env.mjs'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.mjs.example');
    });

    it('should read .cjs config file', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.cjs'),
        path.join(tempDir, '.copy-env.cjs'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.cjs.example');
    });

    it('should support function config (sync)', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env-function.js'),
        path.join(tempDir, '.copy-env.js'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('function.example');
    });

    it('should support async function config', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env-async.js'),
        path.join(tempDir, '.copy-env.js'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('async.example');
    });
  });

  describe('jSON config file support', () => {
    it('should read .json config file', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.json'),
        path.join(tempDir, '.copy-env.json'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.json.example');
    });

    it('should support JSON5 syntax (comments)', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env-json5-comments.json'),
        path.join(tempDir, '.copy-env.json'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.example');
      expect(config.envName).toBe('.env');
    });

    it('should support JSON5 syntax (trailing commas)', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env-json5-trailing.json'),
        path.join(tempDir, '.copy-env.json'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('.env.example');
    });
  });

  describe('custom config path', () => {
    it('should read config from absolute custom path', async () => {
      const customDir = path.join(tempDir, 'config');
      fs.mkdirSync(customDir, { recursive: true });
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.json'),
        path.join(customDir, 'custom.json'),
      );

      const customPath = path.join(customDir, 'custom.json');
      const config = await readConfig(tempDir, customPath);
      expect(config.envExampleName).toBe('.env.json.example');
    });

    it('should read config from relative custom path', async () => {
      const customDir = path.join(tempDir, 'config');
      fs.mkdirSync(customDir, { recursive: true });
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.json'),
        path.join(customDir, 'custom.json'),
      );

      const config = await readConfig(tempDir, 'config/custom.json');
      expect(config.envExampleName).toBe('.env.json.example');
    });

    it('should return empty config when custom path does not exist', async () => {
      const config = await readConfig(tempDir, 'non-existent.json');
      expect(config).toEqual({});
    });
  });

  describe('config workspaceRoot handling', () => {
    it('should set workspaceRoot from parameter when not in config', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.json'),
        path.join(tempDir, '.copy-env.json'),
      );

      const config = await readConfig(tempDir);
      expect(config.workspaceRoot).toBe(tempDir);
    });

    it('should preserve workspaceRoot from config if specified', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env-custom-root.json'),
        path.join(tempDir, '.copy-env.json'),
      );

      const config = await readConfig(tempDir);
      expect(config.workspaceRoot).toBe('/custom/workspace');
    });

    it('should use process.cwd() when workspaceRoot parameter not provided', async () => {
      const cwd = process.cwd();
      const testDir = path.join(cwd, '.copy-env-test-temp');
      fs.mkdirSync(testDir, { recursive: true });
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env.json'),
        path.join(testDir, '.copy-env.json'),
      );

      try {
        const config = await readConfig(testDir);
        expect(config.workspaceRoot).toBe(testDir);
      }
      finally {
        fs.rmSync(testDir, { recursive: true, force: true });
      }
    });
  });

  describe('complex config scenarios', () => {
    it('should handle config with multiple properties', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env-complex.json'),
        path.join(tempDir, '.copy-env.json'),
      );

      const config = await readConfig(tempDir);
      expect(config.envExampleName).toBe('custom.env.example');
      expect(config.envName).toBe('custom.env');
      expect(config.skipIfExists).toEqual(['API_KEY', 'SECRET']);
      expect(config.packages).toEqual(['packages/*']);
    });

    it('should handle config with skipIfExists as regex pattern', async () => {
      fs.copyFileSync(
        path.join(configFilesDir, '.copy-env-regex.json'),
        path.join(tempDir, '.copy-env.json'),
      );

      const config = await readConfig(tempDir);
      expect(config.skipIfExists).toBe('^(API_KEY|SECRET_)');
    });
  });
});
