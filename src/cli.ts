import process from 'node:process';
import { cac } from 'cac';
import { readConfig } from './config';
import { CopyEnvManager } from './manager';

const cli = cac('copy-env');

cli
  .version('1.0.0')
  .option('-c, --config <path>', 'Specify custom config file path', {
    default: '.copy-env.json',
  })
  .option('-r, --root <path>', 'Specify workspace root directory', {
    default: process.cwd(),
  })
  .help();

cli.command('[...args]', 'Copy .env.example to .env in monorepo projects').action(async (_args, options) => {
  try {
    const workspaceRoot = options.root || process.cwd();
    const configPath = options.config;

    // Read configuration (支持异步加载 JS 配置文件)
    const config = await readConfig(workspaceRoot, configPath);

    // Execute copy operation
    const manager = new CopyEnvManager(config);
    await manager.execute();
  }
  catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
});

cli.parse();
