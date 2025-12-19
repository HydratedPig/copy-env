# Custom Path Configuration Example

This example demonstrates how to use custom paths for environment files with centralized configuration.

## Configuration

Instead of creating a `.copy-env.json` in each project, this example uses a shared configuration file with the `-C` parameter:

```bash
copy-env -C ../configs/custom-path.json
```

**Config file** (`examples/configs/custom-path.json`):
```json
{
  "envExampleName": "../../shared-config/env.template",
  "envName": ".env",
  "type": "pnpm"
}
```

## Benefits

✅ **Reduced Duplication**: One config file serves multiple projects
✅ **Easier Maintenance**: Update once, apply everywhere
✅ **Cleaner Projects**: No need for config files in each project
✅ **Flexible Testing**: Easy to test different configurations

## Structure

```
examples/
├── configs/
│   ├── custom-path.json      # Shared config file
│   └── README.md
├── custom-path-config/
│   ├── shared-config/
│   │   └── env.template      # Shared template
│   ├── packages/
│   │   ├── app/
│   │   │   ├── package.json
│   │   │   └── .env          # Generated
│   │   └── api/
│   │       ├── package.json
│   │       └── .env          # Generated
│   ├── package.json          # Uses: copy-env -C ../configs/custom-path.json
│   └── pnpm-workspace.yaml
```

## Usage

### Automatic (via postinstall)

The `package.json` includes the config path:

```json
{
  "scripts": {
    "postinstall": "copy-env -C ../configs/custom-path.json"
  }
}
```

### Manual

```bash
cd examples/custom-path-config
copy-env -C ../configs/custom-path.json
```

### Verify

```bash
ls -la packages/app/.env packages/api/.env
cat packages/app/.env
```

Expected: Both packages have `.env` copied from `shared-config/env.template`
