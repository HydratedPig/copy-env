# copy-env

[English](../README.md) | [中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md)

monorepo プロジェクトで `.env.example` を `.env` に自動的にコピーします。

## 機能

- 🚀 **自動検出**: pnpm と lerna の monorepo アーキテクチャをサポート
- 📦 **複数のパッケージマネージャー**: pnpm-workspace.yaml と lerna.json に対応
- ⚙️ **柔軟な設定**: JSON、JavaScript (ESM/CJS)、関数ベースの設定をサポート
- 🎯 **動的ランタイム設定**: JavaScript を使用して環境ベースの設定ロジックを実現
- 🔄 **スマートマージ**: 既存の環境変数の値を保持
- 🌐 **ゼロコンフィグ**: 合理的なデフォルト値ですぐに使える
- 🛡️ **型安全**: TypeScript で書かれ、完全な型定義を提供
- ⚡ **非同期サポート**: 関数ベースの設定で非同期操作をサポート

## インストール

```bash
# pnpm を使用
pnpm add -D copy-env

# yarn を使用
yarn add -D copy-env

# npm を使用
npm install -D copy-env
```

## 使用方法

### 自動モード（推奨）

プロジェクトルートの `package.json` に `postinstall` スクリプトを追加：

```json
{
  "scripts": {
    "postinstall": "copy-env"
  }
}
```

`npm install` / `yarn install` / `pnpm install` を実行すると、環境ファイルが自動的にコピーされます。

### 手動モード

CLI コマンドを手動で実行：

```bash
npx copy-env
```

またはスクリプトに追加：

```json
{
  "scripts": {
    "prepare-env": "copy-env"
  }
}
```

### CLI オプション

```bash
copy-env [options]

オプション:
  -c, --config <path>    カスタム設定ファイルのパスを指定
                         (デフォルト: .copy-env.json)
  -r, --root <path>      ワークスペースルートディレクトリを指定
                         (デフォルト: 現在の作業ディレクトリ)
  -h, --help             ヘルプメッセージを表示

例:
  copy-env                                    # デフォルトの .copy-env.json を使用
  copy-env --config custom-config.json        # カスタム設定ファイルを使用
  copy-env -c configs/dev.json                # 短縮形
  copy-env -r /path/to/workspace              # ワークスペースルートを指定
  copy-env -c dev.json -r /path/to/workspace  # オプションを組み合わせる
```

**`-c` オプションを使用する利点:**
- 複数のプロジェクト間で設定を共有
- 設定ファイルの重複を削減
- 異なる設定で簡単に A/B テスト
- プロジェクトディレクトリを整理

## 設定

copy-env は最大限の柔軟性のために複数の設定形式をサポートしています：

### 設定ファイル形式

copy-env は以下の優先順位で設定ファイルを自動検出して読み込みます：

1. **`.copy-env.js`** - ESM JavaScript（動的設定に推奨）
2. **`.copy-env.mjs`** - ESM JavaScript
3. **`.copy-env.cjs`** - CommonJS JavaScript
4. **`.copy-env.json`** - JSON/JSON5

#### JSON 設定

プロジェクトのルートに `.copy-env.json` ファイルを作成：

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "type": "auto",
  "packages": ["packages/*", "apps/*"]
}
```

#### JavaScript 設定

JavaScript 設定ファイルは、ランタイムロジックでより柔軟性を提供します：

**ESM 形式 (`.copy-env.js` または `.copy-env.mjs`):**

```javascript
// .copy-env.js
export default {
  workspaceRoot: process.cwd(),
  envExampleName: '.env.example',
  envName: '.env.local',
  type: 'auto',
  // 環境変数に基づく動的設定
  packages: process.env.CUSTOM_PACKAGES?.split(','),
};
```

**関数ベースの設定（非同期サポート）:**

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

**CommonJS 形式 (`.copy-env.cjs`):**

```javascript
// .copy-env.cjs
module.exports = {
  workspaceRoot: process.cwd(),
  type: 'pnpm',
  packages: ['packages/web', 'packages/api'],
};
```

**JavaScript 設定の利点:**
- 🎯 **動的設定**: 環境変数やランタイム条件に基づいて設定を調整
- 🔧 **コードの再利用**: ユーティリティをインポートし、設定間でロジックを共有
- 📝 **より良いコメント**: JavaScript コメントでより充実したドキュメントを提供
- ⚡ **非同期サポート**: リモート設定の取得やデータベースからの読み取り
- 🛠️ **型安全**: JSDoc または TypeScript で IntelliSense を取得

完全な動作例については [examples/js-config-examples](../examples/js-config-examples) を参照してください。

### 設定オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|------|------------|------|
| `workspaceRoot` | `string` | `process.cwd()` | ワークスペースルートディレクトリ |
| `envExampleName` | `string` | `.env.example` | ソース env ファイル名またはパス（相対パスと絶対パスをサポート） |
| `envName` | `string` | `.env.local` | ターゲット env ファイル名またはパス（相対パスと絶対パスをサポート） |
| `type` | `'pnpm' \| 'lerna' \| 'auto'` | `'auto'` | Monorepo のタイプ |
| `packages` | `string[]` | `undefined` | パッケージディレクトリを手動で指定（glob パターンをサポート） |

### パス解決

#### 相対パス
相対パスは各パッケージディレクトリから解決されます：

```json
{
  "envExampleName": "../shared-config/env.template"
}
```

`packages/app/` にあるパッケージの場合、これは `packages/shared-config/env.template` に解決されます。

#### 絶対パス
絶対パス（`/` で始まる）はワークスペースルートから解決されます：

```json
{
  "envExampleName": "/config/common.env"
}
```

すべてのパッケージに対して、これは `<ワークスペースルート>/config/common.env` に解決されます。

### タイプ

- **`pnpm`**: `pnpm-workspace.yaml` を使用してパッケージを検出
- **`lerna`**: `lerna.json` を使用してパッケージを検出
- **`auto`**: monorepo タイプを自動検出

## 例

完全な動作例については [examples](../examples) ディレクトリを参照してください：

### 1. シンプルプロジェクト（非 Monorepo）
[examples/simple-project](../examples/simple-project)

monorepo 構造のない基本的な単一パッケージプロジェクト。

```bash
simple-project/
├── .env.example
└── package.json
```

### 2. PNPM Workspace
[examples/pnpm-monorepo](../examples/pnpm-monorepo)

複数のパッケージを持つ PNPM workspace。

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

### 3. Lerna Monorepo
[examples/lerna-monorepo](../examples/lerna-monorepo)

Yarn workspaces を使用した Lerna workspace。

```json
// lerna.json
{
  "packages": ["packages/*"],
  "version": "independent"
}
```

### 4. カスタムパス設定
[examples/custom-path-config](../examples/custom-path-config)

共有設定を使用したカスタム環境テンプレートパス。

```json
// .copy-env.json
{
  "envExampleName": "../shared-config/env.template",
  "envName": ".env.local"
}
```

この例のデモンストレーション：
- **相対パス解決**: 各パッケージは自身のディレクトリから `../shared-config/env.template` を解決
- **共有テンプレート**: すべてのパッケージが同じ環境テンプレートを使用
- **柔軟な設定**: 必要に応じて異なるパッケージが異なるテンプレートを使用可能

### 5. JavaScript 設定
[examples/js-config-examples](../examples/js-config-examples)

動的ランタイム設定のための JavaScript ファイルを使用した高度な設定。

**機能:**
- ✅ ESM 形式 (`.copy-env.js`, `.copy-env.mjs`)
- ✅ CommonJS 形式 (`.copy-env.cjs`)
- ✅ 関数ベースの非同期設定
- ✅ 環境ベースの動的設定
- ✅ ランタイムロジックと計算

**例：環境ベースの動的設定**
```javascript
// .copy-env.mjs
export default async function() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    envExampleName: isProduction
      ? '.env.production.example'
      : '.env.example',
    envName: isProduction
      ? '.env.production'
      : '.env.local',
  };
}
```

## 環境変数のマージ

環境ファイルをコピーする際、copy-env は `.env.example` と既存の `.env` の値をインテリジェントにマージします：

### マージルール

1. **新しい変数**: `.env.example` にのみ存在する変数は `.env` に追加されます
2. **既存の変数**: 両方のファイルに存在する変数：
   - `.env` の値が**空でない**場合、既存の値が**保持**されます
   - `.env` の値が**空**の場合、`.env.example` の値で更新されます
3. **削除された変数**: `.env` にのみ存在し `.env.example` にない変数は**削除**されます

### 例

**処理前：**

`.env.example`:
```env
API_URL=https://api.example.com
API_KEY=
DATABASE_URL=postgres://localhost:5432/db
NEW_FEATURE_FLAG=true
```

`.env`:
```env
API_URL=https://api.staging.com
API_KEY=my-secret-key
DATABASE_URL=
OLD_VARIABLE=some-value
```

**copy-env 実行後：**

`.env`:
```env
API_URL=https://api.staging.com
API_KEY=my-secret-key
DATABASE_URL=postgres://localhost:5432/db
NEW_FEATURE_FLAG=true
```

**何が起こったか：**
- ✅ `API_URL`: `.env` の既存の値を保持
- ✅ `API_KEY`: 既存の空でない値を保持
- ✅ `DATABASE_URL`: `.env.example` の値で更新（空だった）
- ✅ `NEW_FEATURE_FLAG`: 新しい変数を追加
- ❌ `OLD_VARIABLE`: 削除（`.env.example` にない）

### 解析ルール

- **コメント**: `#` で始まる行は無視されます
- **空行**: 空白行はスキップされます
- **キー値形式**: 変数は `KEY=VALUE` の形式に従う必要があります
- **空白文字**: キーと値の前後の空白文字は削除されます

## 動作原理

copy-env はスマートな検出と処理ワークフローに従います：

### 1. 設定の読み込み
- `.copy-env.json`（またはカスタム設定ファイル）から設定を読み取る
- 不足している設定オプションにデフォルト値を適用
- ワークスペースルートディレクトリを解決

### 2. Monorepo 検出
- **自動検出**: `pnpm-workspace.yaml` または `lerna.json` をチェック
- **手動設定**: 設定で `packages` 配列が指定されている場合はそれを使用
- **フォールバック**: monorepo が検出されない場合、単一プロジェクトとして扱う

### 3. パッケージ検索
- monorepos の場合：
  - glob パターンを解析（例：`packages/*`、`apps/*`）
  - 一致するすべてのパッケージディレクトリを解決
  - 各パッケージを独立して処理
- 単一プロジェクトの場合：
  - ワークスペースルートディレクトリを直接処理

### 4. 環境ファイル処理
各ターゲットディレクトリ（パッケージまたはルート）に対して：
- ソースパス（`envExampleName`）とターゲットパス（`envName`）を解決
  - 絶対パス（`/` で始まる）はワークスペースルートから解決
  - 相対パスは現在のパッケージディレクトリから解決
- `.env.example` ファイルを読み取り、解析
- 既存の `.env` ファイルを読み取り、解析（存在する場合）
- 値をインテリジェントにマージ（[環境変数のマージ](#環境変数のマージ)を参照）
- マージした結果を `.env` に書き込む

### 5. 結果
- 処理された各ディレクトリに対して成功メッセージを表示
- コピーされた環境変数の総数を表示
- 処理されたパッケージの総数を報告（monorepos の場合）

## API

### `copyEnvs(workspaceRoot?: string, configPath?: string): Promise<void>`

コードから copy-env をプログラムで実行します。

**パラメータ:**

- `workspaceRoot`（オプション）：ワークスペースルートディレクトリパス。デフォルトは `process.cwd()`
- `configPath`（オプション）：設定ファイルのパス。デフォルトは自動検出

**例:**

```typescript
import { copyEnvs } from 'copy-env';

// デフォルト設定を使用（現在のディレクトリ、自動検出設定）
await copyEnvs();

// ワークスペースルートを指定
await copyEnvs('/path/to/workspace');

// ワークスペースルートとカスタム設定の両方を指定
await copyEnvs('/path/to/workspace', 'custom-config.json');

// JavaScript 設定を使用
await copyEnvs('/path/to/workspace', '.copy-env.js');
```

### `readConfig(workspaceRoot?: string, configPath?: string): Promise<CopyEnvConfig>`

設定ファイルを読み取って解析します（JSON と JavaScript 形式をサポート）。

**パラメータ:**

- `workspaceRoot`（オプション）：ワークスペースルートディレクトリパス。デフォルトは `process.cwd()`
- `configPath`（オプション）：設定ファイルのパス。指定しない場合、優先順位に従って設定ファイルを自動検出

**戻り値:** `Promise<CopyEnvConfig>` - 解析された設定オブジェクト

**例:**

```typescript
import { readConfig } from 'copy-env';

// 設定ファイルを自動検出（優先順位: .js > .mjs > .cjs > .json）
const config = await readConfig();

// 設定ファイルを指定
const config = await readConfig(process.cwd(), '.copy-env.js');

// カスタムスクリプトで使用
const config = await readConfig();
console.log('ワークスペースルート:', config.workspaceRoot);
console.log('パッケージ:', config.packages);
```

**注意:** JavaScript 設定ファイルは非同期読み込みが必要��す。同期読み取りが必要な場合（JSON のみ）、パッケージから `readConfigSync` をインポート���きます。

## ライセンス

MIT © [HydratedPig](https://github.com/HydratedPig)

## 貢献

貢献を歓迎します！お気軽に Pull Request を送信してください。

## 問題

問題が発生した場合は、以下で issue を報告してください：
https://github.com/HydratedPig/copy-env/issues
