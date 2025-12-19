# copy-env

[中文](./docs/README.zh-CN.md) | [日本語](./docs/README.ja.md) | [繁體中文](./docs/README.zh-TW.md)

Automatically copy `.env.example` to `.env.local` in monorepo projects.

## Features

- 🚀 **Automatic Detection**: Supports both pnpm and lerna monorepo architectures
- 📦 **Multiple Package Managers**: Works with pnpm-workspace.yaml and lerna.json
- ⚙️ **Configurable**: Customize via `.copy-env.json`
- 🔄 **Smart Merge**: Preserves existing environment variable values
- 🎯 **Zero Config**: Works out of the box with sensible defaults
- 🛡️ **Type Safe**: Written in TypeScript with full type definitions

## Installation

```bash
# Using pnpm
pnpm add -D copy-env

# Using yarn
yarn add -D copy-env

# Using npm
npm install -D copy-env
```

## Usage

### Automatic (Recommended)

Add `copy-env` to your `postinstall` script in `package.json`:

```json
{
  "scripts": {
    "postinstall": "copy-env"
  }
}
```

After running `npm install` / `yarn install` / `pnpm install`, the environment files will be automatically copied.

### Manual

Run the CLI command manually:

```bash
npx copy-env
```

Or add it to your scripts:

```json
{
  "scripts": {
    "prepare-env": "copy-env"
  }
}
```

### CLI Options

```bash
copy-env [options]

Options:
  -c, --config <path>    Specify custom config file path
                         (default: .copy-env.json)
  -r, --root <path>      Specify workspace root directory
                         (default: current working directory)
  -h, --help             Show help message

Examples:
  copy-env                                    # Use default .copy-env.json
  copy-env --config custom-config.json        # Use custom config file
  copy-env -c configs/dev.json                # Short form
  copy-env -r /path/to/workspace              # Specify workspace root
  copy-env -c dev.json -r /path/to/workspace  # Combine options
```

**Benefits of using `-c` option:**
- Share configurations across multiple projects
- Reduce config file duplication
- Easy A/B testing with different configs
- Keep project directory clean

## Configuration

Create a `.copy-env.json` file in your project root:

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "mode": "auto",
  "type": "auto",
  "packages": ["packages/*", "apps/*"]
}
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `workspaceRoot` | `string` | `process.cwd()` | Workspace root directory |
| `envExampleName` | `string` | `.env.example` | Source env file name or path (supports relative and absolute paths) |
| `envName` | `string` | `.env.local` | Target env file name or path (supports relative and absolute paths) |
| `type` | `'pnpm' \| 'lerna' \| 'auto'` | `'auto'` | Monorepo type |
| `packages` | `string[]` | `undefined` | Manually specify package directories (glob patterns supported) |

### Path Resolution

#### Relative Paths
Relative paths are resolved from each package directory:

```json
{
  "envExampleName": "../shared-config/env.template"
}
```

For package at `packages/app/`, this resolves to `packages/shared-config/env.template`.

#### Absolute Paths
Absolute paths (starting with `/`) are resolved from the workspace root:

```json
{
  "envExampleName": "/config/common.env"
}
```

This resolves to `<workspace-root>/config/common.env` for all packages.

### Type

- **`pnpm`**: Uses `pnpm-workspace.yaml` to detect packages
- **`lerna`**: Uses `lerna.json` to detect packages
- **`auto`**: Automatically detects monorepo type

## Examples

Check out the [examples](./examples) directory for complete working examples:

### 1. Simple Project (Non-Monorepo)
[examples/simple-project](./examples/simple-project)

A basic single-package project without monorepo structure.

```bash
simple-project/
├── .env.example
└── package.json
```

### 2. PNPM Workspace
[examples/pnpm-monorepo](./examples/pnpm-monorepo)

PNPM workspace with multiple packages.

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

### 3. Lerna Monorepo
[examples/lerna-monorepo](./examples/lerna-monorepo)

Lerna workspace using Yarn workspaces.

```json
// lerna.json
{
  "packages": ["packages/*"],
  "version": "independent"
}
```

### 4. Custom Path Configuration
[examples/custom-path-config](./examples/custom-path-config)

Using custom paths for environment templates with shared configuration.

```json
// .copy-env.json
{
  "envExampleName": "../shared-config/env.template",
  "envName": ".env.local"
}
```

This example demonstrates:
- **Relative path resolution**: Each package resolves `../shared-config/env.template` relative to its own directory
- **Shared templates**: All packages use the same environment template
- **Flexible configuration**: Different packages can use different templates if needed

## Environment Variable Merging

When copying environment files, copy-env intelligently merges values from both `.env.example` and existing `.env.local`:

### Merge Rules

1. **New Variables**: Variables that only exist in `.env.example` will be added to `.env.local`
2. **Existing Variables**: Variables that exist in both files:
   - If the value in `.env.local` is **non-empty**, the existing value is **preserved**
   - If the value in `.env.local` is **empty**, it will be updated with the value from `.env.example`
3. **Removed Variables**: Variables that only exist in `.env.local` but not in `.env.example` will be **removed**

### Example

**Before:**

`.env.example`:
```env
API_URL=https://api.example.com
API_KEY=
DATABASE_URL=postgres://localhost:5432/db
NEW_FEATURE_FLAG=true
```

`.env.local`:
```env
API_URL=https://api.staging.com
API_KEY=my-secret-key
DATABASE_URL=
OLD_VARIABLE=some-value
```

**After running copy-env:**

`.env.local`:
```env
API_URL=https://api.staging.com
API_KEY=my-secret-key
DATABASE_URL=postgres://localhost:5432/db
NEW_FEATURE_FLAG=true
```

**What happened:**
- ✅ `API_URL`: Kept existing value from `.env.local`
- ✅ `API_KEY`: Kept existing non-empty value
- ✅ `DATABASE_URL`: Updated with value from `.env.example` (was empty)
- ✅ `NEW_FEATURE_FLAG`: Added new variable
- ❌ `OLD_VARIABLE`: Removed (not in `.env.example`)

### Parsing Rules

- **Comments**: Lines starting with `#` are ignored
- **Empty Lines**: Blank lines are skipped
- **Key-Value Format**: Variables must follow the format `KEY=VALUE`
- **Whitespace**: Leading and trailing whitespace in keys and values are trimmed

## How It Works

copy-env follows a smart detection and processing workflow:

### 1. Configuration Loading
- Reads configuration from `.copy-env.json` (or custom config file if specified)
- Applies default values for any missing configuration options
- Resolves workspace root directory

### 2. Monorepo Detection
- **Auto-detection**: Checks for `pnpm-workspace.yaml` or `lerna.json`
- **Manual configuration**: Uses `packages` array if specified in config
- **Fallback**: If no monorepo is detected, treats as a single-project setup

### 3. Package Discovery
- For monorepos:
  - Parses glob patterns (e.g., `packages/*`, `apps/*`)
  - Resolves all matching package directories
  - Processes each package independently
- For single projects:
  - Processes the workspace root directory directly

### 4. Environment File Processing
For each target directory (package or root):
- Resolves the source path (`envExampleName`) and target path (`envName`)
  - Absolute paths (starting with `/`) are resolved from workspace root
  - Relative paths are resolved from the current package directory
- Reads and parses `.env.example` file
- Reads and parses existing `.env.local` file (if exists)
- Merges values intelligently (see [Environment Variable Merging](#environment-variable-merging))
- Writes the merged result to `.env.local`

### 5. Results
- Displays success message for each processed directory
- Shows total count of environment variables copied
- Reports total number of packages processed (for monorepos)

## API

### `copyEnvs(workspaceRoot?: string, configPath?: string): Promise<void>`

Programmatically run copy-env from your code.

**Parameters:**

- `workspaceRoot` (optional): The workspace root directory path. Defaults to `process.cwd()`
- `configPath` (optional): Path to the configuration file. Defaults to `.copy-env.json`

**Example:**

```typescript
import { copyEnvs } from 'copy-env';

// Use default settings (current directory, .copy-env.json)
await copyEnvs();

// Specify workspace root
await copyEnvs('/path/to/workspace');

// Specify both workspace root and custom config
await copyEnvs('/path/to/workspace', 'custom-config.json');
```

## License

MIT © [HydratedPig](https://github.com/HydratedPig)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any problems, please file an issue at:
https://github.com/HydratedPig/copy-env/issues
