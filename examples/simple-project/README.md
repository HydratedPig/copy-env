# Simple Project Example

This is a simple non-monorepo project example.

## Automatic Mode (Recommended)

Add `copy-env` to your `postinstall` script in `package.json`:

```json
{
  "scripts": {
    "postinstall": "copy-env"
  }
}
```

Then run:

```bash
npm install
# or
yarn install
# or
pnpm install
```

After installation, `.env.example` will be automatically copied to `.env`.

## Manual Mode

You can also run `copy-env` manually:

```bash
npx copy-env
```
