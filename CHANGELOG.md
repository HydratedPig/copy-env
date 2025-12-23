# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.1] - 2025-12-23

### Fixed

#### Environment Variable Merging Behavior
- **Fixed `skipIfExists` default behavior**: Changed the default behavior when `skipIfExists` is not configured
  - **Previous behavior**: All existing values were preserved, preventing updates from `.env.example`
  - **New behavior**: When `skipIfExists` is not configured, values from `.env.example` are allowed to update existing `.env` values
  - **With `skipIfExists` configured**: Only preserve existing values that match the specified patterns
- This fix makes the default behavior more intuitive and aligns with the expected workflow where `.env.example` serves as the source of truth
- Custom environment variables (not in `.env.example`) are still preserved when `preserveCustomVars` is enabled (default: `true`)

### Changed
- Simplified the merge logic in `CopyEnvManager.copyEnv()` for better clarity (src/manager.ts:87-101)
- Improved code comments to better explain the merging behavior

## [1.0.0] - 2025-12-19

### Added

#### JavaScript Configuration Support
- **Multiple config formats**: Support for `.copy-env.js`, `.copy-env.mjs`, `.copy-env.cjs` in addition to `.copy-env.json`
- **Auto-detection with priority**: Automatically detect and load config files by priority (`.js` > `.mjs` > `.cjs` > `.json`)
- **ESM support**: Full ES Module support with `export default` syntax
- **CommonJS support**: Full CommonJS support with `module.exports` syntax
- **Function-based configs**: Support exporting a function that returns config (sync or async)
- **Dynamic configuration**: Enable runtime logic and environment-based configuration
- **Async configuration**: Support for async operations in function-based configs (e.g., fetching remote configs)

#### New APIs
- `readConfig()`: Async function to read and parse config files (supports all formats)
- `readConfigSync()`: Sync function for JSON-only config reading (backward compatibility)
- Export `COPY_ENV_CONFIG_FILENAMES` constant for supported config file names

#### Examples and Documentation
- New example directory: `examples/js-config-examples` with complete JavaScript config examples
  - ESM format example (`.copy-env.js`)
  - Function-based async config example (`.copy-env-function.mjs`)
  - CommonJS format example (`.copy-env-cjs.cjs`)
  - Test script to verify all config formats
  - Comprehensive README with usage guide
- Updated main README with JavaScript configuration documentation
- Added API documentation for `readConfig` function

### Changed
- `readConfig()` is now async to support dynamic JavaScript module loading
- `copyEnvs()` now supports optional `configPath` parameter (defaults to auto-detection)
- Config file auto-detection: when `configPath` is not specified, automatically searches for config files by priority
- Updated CLI to support async config loading
- Improved error messages for JavaScript config files

### Technical Details
- Use `pathToFileURL` for cross-platform dynamic module imports
- Support both `default export` and named exports in JavaScript configs
- Function-based configs can return `Promise<CopyEnvConfig>` or `CopyEnvConfig`
- Backward compatible: existing JSON configs continue to work without changes

## [1.0.0] - 2025-12-19

### Added

#### Core Features
- Initial release of copy-env CLI tool
- Support for pnpm workspace monorepo (via `pnpm-workspace.yaml`)
- Support for lerna monorepo (via `lerna.json`)
- Automatic monorepo type detection with fallback to single-project mode
- Configuration support via `.copy-env.json` with JSON5 parser
- TypeScript implementation with full type definitions

#### CLI Features
- Command-line tool `copy-env` with multiple options:
  - `-c, --config <path>`: Specify custom config file path (default: `.copy-env.json`)
  - `-r, --root <path>`: Specify workspace root directory (default: current working directory)
  - `-h, --help`: Display help message
- Automatic execution via postinstall hook
- Manual execution mode via `npx copy-env`

#### Configuration Options
- `workspaceRoot`: Workspace root directory (default: `process.cwd()`)
- `envExampleName`: Source env file name or path (default: `.env.example`)
- `envName`: Target env file name or path (default: `.env.local`)
- `type`: Monorepo type - `'pnpm' | 'lerna' | 'auto'` (default: `'auto'`)
- `packages`: Manually specify package directories with glob pattern support

#### Path Resolution
- **Relative path support**: Resolve paths relative to each package directory
- **Absolute path support**: Resolve paths (starting with `/`) from workspace root
- Flexible path configuration for shared environment templates

#### Smart Environment Variable Merging
- Intelligent merge of `.env.example` and existing `.env` values
- Preserve non-empty existing values in `.env`
- Update empty values with defaults from `.env.example`
- Add new variables from `.env.example`
- Remove variables not present in `.env.example`
- Comment line parsing (lines starting with `#`)
- Empty line handling
- Key-value format parsing with whitespace trimming

#### API
- Programmatic API: `copyEnvs(workspaceRoot?, configPath?): Promise<void>`
- Support for custom workspace root and config path

#### Examples
- Simple project (non-monorepo) example
- PNPM workspace monorepo example
- Lerna monorepo example
- Custom path configuration example with shared templates

#### Documentation
- Multi-language documentation:
  - English (README.md)
  - Simplified Chinese (docs/README.zh-CN.md)
  - Japanese (docs/README.ja.md)
  - Traditional Chinese (docs/README.zh-TW.md)
- Detailed CLI usage guide
- Configuration options reference
- Environment variable merging rules with examples
- Path resolution explanation
- Complete workflow documentation
- API usage examples

### Technical Details
- Built with Rolldown bundler
- Dependencies:
  - `cac`: CLI argument parser
  - `js-yaml`: YAML parser for pnpm-workspace.yaml
  - `json5`: JSON5 parser for flexible config parsing
- Node.js >= 16.0.0 required (published version)
- Node.js >= 20.0.0 required (development)

[1.0.1]: https://github.com/HydratedPig/copy-env/releases/tag/v1.0.1
[1.0.0]: https://github.com/HydratedPig/copy-env/releases/tag/v1.0.0
