# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- `envName`: Target env file name or path (default: `.env`)
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

[1.0.0]: https://github.com/HydratedPig/copy-env/releases/tag/v1.0.0
