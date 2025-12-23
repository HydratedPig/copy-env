# @hydrated_pig/copy-env

[English](../README.md) | [中文](./README.zh-CN.md) | [繁體中文](./README.zh-TW.md)

monorepo プロジェクトで `.env.example` を `.env.local` に自動的にコピーします。

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
pnpm add -D @hydrated_pig/copy-env

# yarn を使用
yarn add -D @hydrated_pig/copy-env

# npm を使用
npm install -D @hydrated_pig/copy-env
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

| オプシ��ン | 型 | デフォルト | 説明 |
|-----------|------|------------|------|
| `workspaceRoot` | `string` | `process.cwd()` | ワークスペースルートディレクトリ |
| `envExampleName` | `string` | `.env.example` | ソース env ファイル名またはパス���相対パスと絶対パスをサポート） |
| `envName` | `string` | `.env.local` | ターゲット env ファイル名またはパス（相対パスと絶対パスをサポート） |
| `type` | `'pnpm' \| 'lerna' \| 'auto'` | `'auto'` | Monorepo のタイプ |
| `packages` | `string[]` | `undefined` | パッケージディレクトリを手動で指定（glob パターンをサポート） |
| `skipIfExists` | `(string \| RegExp)[] \| RegExp \| string` | `undefined` | ターゲット .env に既に存在する場合はスキップする環境変数。ターゲット env に既に存在する場合、上書きされません（値が空かどうかに関わらず既存の値を保持）。文字列（正規表現パターン）、RegExp、または両方の配列を指定可能 |

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

完全な動作例については [examples](../examples) ディレクトリを参照してください。

## 環境変数のマージ

環境ファイルをコピーする際、copy-env は `.env.example` と既存の `.env.local` の値をインテリジェントにマージします：

### 基本的なマージルール

1. **新しい変数**: `.env.example` にのみ存在する変数は `.env.local` に追加されます
2. **既存の変数（デフォルト動作）**: 両方のファイルに存在する変数は **`.env.example` の値で更新されます**
   - これにより、`.env.local` が `.env.example` の更新と同期されます
   - 特定の変数を保持するには `skipIfExists` オプションを使用します（[高度な使い方：`skipIfExists` パラメータの使用](#高度な使い方skipifexists-パラメータの使用) を参照）
3. **カスタム変数**: `.env.local` にのみ存在し `.env.example` にない変数は**デフォルトで保持**されます（`preserveCustomVars` オプションで制御）

### 例

**処理前：**

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

**copy-env 実行後（デフォルト動作）：**

`.env.local`:
```env
API_URL=https://api.example.com
API_KEY=
DATABASE_URL=postgres://localhost:5432/db
NEW_FEATURE_FLAG=true
MY_CUSTOM_VAR=my-value
```

**何が起こったか：**
- ✅ `API_URL`: **更新されました**（デフォルト動作：常に最新の値を使用）
- ✅ `API_KEY`: **更新されました**（空の値に。シークレットを保持するには `skipIfExists` を使用 - 下記参照）
- ✅ `DATABASE_URL`: `.env.example` の値で更新
- ✅ `NEW_FEATURE_FLAG`: 新しい変数を追加
- ✅ `MY_CUSTOM_VAR`: **保持**（カスタム変数、`preserveCustomVars=true` がデフォルトで制御）

### `preserveCustomVars` でカスタム変数を制御

`preserveCustomVars` オプション（デフォルト：`true`）は、カスタム環境変数を保持するかどうかを制御します：

**設定：**
```json
{
  "preserveCustomVars": false
}
```

**`preserveCustomVars: false` の場合：**

上記と同じ例を使用すると、`MY_CUSTOM_VAR` は `.env.example` に存在しないため**削除**されます。

これは、`.env.local` が `.env.example` で定義された変数のみを含むようにしたい場合に便利です。

### 高度な使い方：`skipIfExists` パラメータの使用

デフォルトでは、copy-env は既存の変数をすべて `.env.example` の値で更新します。`skipIfExists` パラメータを使用すると、特定の環境変数を選択的に保持できます。これは以下のような場合に特に便利です：
- 手動でのみ設定すべきシークレットキー
- 開発者が個別に設定する API トークン
- 既存の状態を保持する必要がある変数（空の場合でも）

**動作：**

1. **`skipIfExists` なし（デフォルト）**: `.env.example` のすべての変数が最新の値で更新され、環境がテンプレートの変更と同期されます
2. **`skipIfExists` あり**: 指定されたパターンに一致する変数は `.env.local` から保持され、他のすべての変数は `.env.example` から更新されます
3. **新しい変数**: `.env.local` に存在しない変数は常に `.env.example` から追加されます
4. **カスタム変数**: `preserveCustomVars` オプションで制御されます（`skipIfExists` とは独立）

**設定オプション：**
   - 文字列（正規表現パターン）を使用：`"skipIfExists": "^SECRET_KEY$"`
   - 正規表現を使用：`"skipIfExists": "/^(SECRET|API)_/"` (JSON) または `skipIfExists: /^(SECRET|API)_/` (JS)
   - 配列を使用：`"skipIfExists": ["^SECRET_KEY$", "^API_TOKEN$"]` または RegExp と文字列の混合

**`skipIfExists` の設定：**

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "skipIfExists": ["^SECRET_KEY$", "^API_TOKEN$"]
}
```

または正規表現パターンを使用（JavaScript 設定）：

```javascript
// .copy-env.js
export default {
  envExampleName: '.env.example',
  envName: '.env.local',
  skipIfExists: /^(SECRET|API)_/  // SECRET_ または API_ で始まるすべての変数に一致
};
```

または単一の文字列パターンを使用：

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "skipIfExists": "^SECRET.*"
}
```

または配列で複数のパターンを混在：

```javascript
// .copy-env.js
export default {
  envExampleName: '.env.example',
  envName: '.env.local',
  skipIfExists: [/^SECRET_/, "^API_TOKEN$", /CONFIG$/]  // RegExp と文字列の混合
};
```

**動作例：**

`.env.example`:
```env
API_URL=https://api.example.com
SECRET_KEY=default-key-do-not-use
API_TOKEN=your-token-here
DB_HOST=localhost
```

`.env.local` (処理前):
```env
API_URL=https://api.staging.com
SECRET_KEY=
API_TOKEN=my-personal-token
DB_HOST=production-db.example.com
```

**`skipIfExists: ["^SECRET_KEY$", "^API_TOKEN$"]` で copy-env を実行後：**

`.env.local` (処理後):
```env
API_URL=https://api.example.com
SECRET_KEY=
API_TOKEN=my-personal-token
DB_HOST=localhost
```

**何が起こったか：**
- ⚠️ `API_URL`: **.env.example から更新**（`skipIfExists` リストにない、値があっても上書き）
- ✅ `SECRET_KEY`: **空の値を保持**（`skipIfExists` パターンに一致）
- ✅ `API_TOKEN`: **既存の値を保持**（`skipIfExists` パターンに一致）
- ⚠️ `DB_HOST`: **.env.example から更新**（`skipIfExists` リストにない）

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
- 既存の `.env.local` ファイルを読み取り、解析（存在する場合）
- 値をインテリジェントにマージ（[環境変数のマージ](#環境変数のマージ)を参照）
- マージした結果を `.env.local` に書き込む

### 5. 結果
- 処理された各ディレクトリに対して成功メッセージを表示
- コピーされた環境変数の総数を表示
- 処理されたパッケージの総数を報告（monorepos の場合）

## ライセンス

MIT © [HydratedPig](https://github.com/HydratedPig)

## 貢献

貢献を歓迎します！お気軽に Pull Request を送信してください。

## 問題

問題が発生した場合は、以下で issue を報告してください：
https://github.com/HydratedPig/copy-env/issues
