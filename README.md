# @hydrated_pig/copy-env

[中文](./docs/README.zh-CN.md) | [日本語](./docs/README.ja.md) | [繁體中文](./docs/README.zh-TW.md)

Automatically copy `.env.example` to `.env.local` in monorepo projects.

## Features

- 🚀 **Automatic Detection**: Supports both pnpm and lerna monorepo architectures
- 📦 **Multiple Package Managers**: Works with pnpm-workspace.yaml and lerna.json
- ⚙️ **Flexible Configuration**: Supports JSON, JavaScript (ESM/CJS), and function-based configs
- 🎯 **Dynamic Runtime Config**: Use JavaScript for environment-based configuration logic
- 🔄 **Smart Merge**: Preserves existing environment variable values
- 🌐 **Zero Config**: Works out of the box with sensible defaults
- 🛡️ **Type Safe**: Written in TypeScript with full type definitions
- ⚡ **Async Support**: Function-based configs support async operations

## Installation

```bash
# Using pnpm
pnpm add -D @hydrated_pig/copy-env

# Using yarn
yarn add -D @hydrated_pig/copy-env

# Using npm
npm install -D @hydrated_pig/copy-env
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

copy-env supports multiple configuration formats for maximum flexibility:

### Configuration File Formats

copy-env automatically detects and loads configuration files in the following priority order:

1. **`.copy-env.js`** - ESM JavaScript (recommended for dynamic configs)
2. **`.copy-env.mjs`** - ESM JavaScript
3. **`.copy-env.cjs`** - CommonJS JavaScript
4. **`.copy-env.json`** - JSON/JSON5

#### JSON Configuration

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

#### JavaScript Configuration

JavaScript configuration files provide more flexibility with runtime logic:

**ESM Format (`.copy-env.js` or `.copy-env.mjs`):**

```javascript
// .copy-env.js
export default {
  workspaceRoot: process.cwd(),
  envExampleName: '.env.example',
  envName: '.env.local',
  type: 'auto',
  // Dynamic configuration based on environment
  packages: process.env.CUSTOM_PACKAGES?.split(','),
};
```

**Function-based Configuration (async supported):**

```javascript
// .copy-env.mjs
export default async function() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    envExampleName: isProduction ? '.env.production.example' : '.env.example',
    envName: isProduction ? '.env.production' : '.env.local',
    type: 'auto',
  };
}
```

**CommonJS Format (`.copy-env.cjs`):**

```javascript
// .copy-env.cjs
module.exports = {
  workspaceRoot: process.cwd(),
  type: 'pnpm',
  packages: ['packages/web', 'packages/api'],
};
```

**Benefits of JavaScript Configuration:**
- 🎯 **Dynamic Configuration**: Adjust settings based on environment variables or runtime conditions
- 🔧 **Code Reuse**: Import utilities and share logic across configurations
- 📝 **Better Comments**: Use JavaScript comments for richer documentation
- ⚡ **Async Support**: Fetch remote configs or read from databases
- 🛠️ **Type Safety**: Get IntelliSense with JSDoc or TypeScript

See [examples/js-config-examples](./examples/js-config-examples) for complete working examples.

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `workspaceRoot` | `string` | `process.cwd()` | Workspace root directory |
| `envExampleName` | `string` | `.env.example` | Source env file name or path (supports relative and absolute paths) |
| `envName` | `string` | `.env.local` | Target env file name or path (supports relative and absolute paths) |
| `type` | `'pnpm' \| 'lerna' \| 'auto'` | `'auto'` | Monorepo type |
| `packages` | `string[]` | `undefined` | Manually specify package directories (glob patterns supported) |
| `skipIfExists` | `(string \| RegExp)[] \| RegExp \| string` | `undefined` | Environment variables that should be skipped if they already exist in target .env. If target env already has these variables, they will not be overwritten (preserves existing values regardless of whether they're empty). Can be a string (regex pattern), RegExp, or array of both |
| `preserveCustomVars` | `boolean` | `true` | Whether to preserve custom environment variables that exist in target .env but not in .env.example. When set to `false`, custom variables will be removed |

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

Check out the [examples](./examples) directory for complete working examples.

## Environment Variable Merging

When copying environment files, copy-env intelligently merges values from both `.env.example` and existing `.env.local`:

### Basic Merge Rules

1. **New Variables**: Variables that only exist in `.env.example` will be added to `.env.local`
2. **Existing Variables**: Variables that exist in both files:
   - If the value in `.env.local` is **non-empty**, the existing value is **preserved**
   - If the value in `.env.local` is **empty**, it will be updated with the value from `.env.example`
3. **Custom Variables**: Variables that only exist in `.env.local` but not in `.env.example` will be **preserved by default** (controlled by `preserveCustomVars` option)

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
MY_CUSTOM_VAR=my-value
```

**After running copy-env:**

`.env.local`:
```env
API_URL=https://api.staging.com
API_KEY=my-secret-key
DATABASE_URL=postgres://localhost:5432/db
NEW_FEATURE_FLAG=true
MY_CUSTOM_VAR=my-value
```

**What happened:**
- ✅ `API_URL`: Kept existing value from `.env.local`
- ✅ `API_KEY`: Kept existing non-empty value
- ✅ `DATABASE_URL`: Updated with value from `.env.example` (was empty)
- ✅ `NEW_FEATURE_FLAG`: Added new variable
- ✅ `MY_CUSTOM_VAR`: **Preserved** (custom variable, controlled by `preserveCustomVars=true` by default)

### Controlling Custom Variables with `preserveCustomVars`

The `preserveCustomVars` option (default: `true`) controls whether custom environment variables should be preserved:

**Configuration:**
```json
{
  "preserveCustomVars": false
}
```

**With `preserveCustomVars: false`:**

Using the same example above, `MY_CUSTOM_VAR` would be **removed** from the output because it doesn't exist in `.env.example`.

This is useful when you want to ensure `.env.local` only contains variables defined in `.env.example`.

### Advanced: Using the `skipIfExists` Parameter

The `skipIfExists` parameter allows selective preservation of specific environment variables. This is particularly useful for:
- Secret keys that should only be set manually
- API tokens configured individually by developers
- Variables that need to preserve their initial state (even if empty)

**⚠️ Important**: When `skipIfExists` is configured, **only variables matching the patterns are preserved**. All other variables will be updated from `.env.example`, even if they have existing values.

**Behavior:**

1. **Variables matching `skipIfExists` patterns**: These variables will **never be overwritten** if they already exist in `.env.local`, regardless of whether their values are empty or not
2. **Variables NOT matching `skipIfExists` patterns**: These variables will be **updated from `.env.example`**, even if they have existing values in `.env.local`
3. **New Variables**: Variables that don't exist in `.env.local` will be added from `.env.example`
4. **Custom Variables**: Still controlled by `preserveCustomVars` option (independent from `skipIfExists`)

**Configuration options:**
   - Use `skipIfExists` with string (regex pattern): `"skipIfExists": "^SECRET_KEY$"`
   - Use `skipIfExists` with RegExp: `"skipIfExists": "/^(SECRET|API)_/"` (in JSON) or `skipIfExists: /^(SECRET|API)_/` (in JS)
   - Use `skipIfExists` with array: `"skipIfExists": ["^SECRET_KEY$", "^API_TOKEN$"]` or mix RegExp and string

**Configuration with `skipIfExists`:**

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "skipIfExists": ["^SECRET_KEY$", "^API_TOKEN$"]
}
```

Or using a single RegExp pattern (in JavaScript config):

```javascript
// .copy-env.js
export default {
  envExampleName: '.env.example',
  envName: '.env.local',
  skipIfExists: /^(SECRET|API)_/  // Matches all variables starting with SECRET_ or API_
};
```

Or using a single string pattern:

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "skipIfExists": "^SECRET.*"
}
```

Or mixing patterns in an array:

```javascript
// .copy-env.js
export default {
  envExampleName: '.env.example',
  envName: '.env.local',
  skipIfExists: [/^SECRET_/, "^API_TOKEN$", /CONFIG$/]  // Mix of RegExp and strings
};
```

**Example Behavior:**

`.env.example`:
```env
API_URL=https://api.example.com
SECRET_KEY=default-key-do-not-use
API_TOKEN=your-token-here
DB_HOST=localhost
```

`.env.local` (before):
```env
API_URL=https://api.staging.com
SECRET_KEY=
API_TOKEN=my-personal-token
DB_HOST=production-db.example.com
```

**After running copy-env with `skipIfExists: ["^SECRET_KEY$", "^API_TOKEN$"]`:**

`.env.local` (after):
```env
API_URL=https://api.example.com
SECRET_KEY=
API_TOKEN=my-personal-token
DB_HOST=localhost
```

**What happened:**
- ⚠️ `API_URL`: **Updated from .env.example** (not in `skipIfExists` list, so overwritten even though it had a value)
- ✅ `SECRET_KEY`: **Preserved empty value** (matches `skipIfExists` pattern)
- ✅ `API_TOKEN`: **Kept existing value** (matches `skipIfExists` pattern)
- ⚠️ `DB_HOST`: **Updated from .env.example** (not in `skipIfExists` list, so overwritten)

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

## License

MIT © [HydratedPig](https://github.com/HydratedPig)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any problems, please file an issue at:
https://github.com/HydratedPig/copy-env/issues
