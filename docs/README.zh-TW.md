# copy-env

[English](../README.md) | [中文](./README.zh-CN.md) | [日本語](./README.ja.md)

在 monorepo 專案中自動複製 `.env.example` 到 `.env`。

## 特性

- 🚀 **自動檢測**: 支援 pnpm 和 lerna monorepo 架構
- 📦 **多套件管理器**: 相容 pnpm-workspace.yaml 和 lerna.json
- ⚙️ **靈活配置**: 支援 JSON、JavaScript (ESM/CJS) 和函數式配置
- 🎯 **動態執行期配置**: 使用 JavaScript 實現基於環境的配置邏輯
- 🔄 **智慧合併**: 保留現有環境變數值
- 🌐 **零配置**: 開箱即用，具有合理的預設值
- 🛡️ **型別安全**: 使用 TypeScript 撰寫，提供完整型別定義
- ⚡ **非同步支援**: 函數式配置支援非同步操作

## 安裝

```bash
# 使用 pnpm
pnpm add -D copy-env

# 使用 yarn
yarn add -D copy-env

# 使用 npm
npm install -D copy-env
```

## 使用

### 自動模式（推薦）

在專案根目錄的 `package.json` 中新增 `postinstall` 腳本：

```json
{
  "scripts": {
    "postinstall": "copy-env"
  }
}
```

執行 `npm install` / `yarn install` / `pnpm install` 後，環境檔案將自動複製。

### 手動模式

手動執行 CLI 指令：

```bash
npx copy-env
```

或加入到腳本中：

```json
{
  "scripts": {
    "prepare-env": "copy-env"
  }
}
```

### CLI 選項

```bash
copy-env [options]

選項:
  -c, --config <path>    指定自訂配置檔案路徑
                         (預設: .copy-env.json)
  -r, --root <path>      指定工作區根目錄
                         (預設: 目前工作目錄)
  -h, --help             顯示說明訊息

範例:
  copy-env                                    # 使用預設 .copy-env.json
  copy-env --config custom-config.json        # 使用自訂配置檔案
  copy-env -c configs/dev.json                # 簡寫形式
  copy-env -r /path/to/workspace              # 指定工作區根目錄
  copy-env -c dev.json -r /path/to/workspace  # 組合使用選項
```

**使用 `-c` 選項的優勢:**
- 在多個專案間共用配置
- 減少配置檔案重複
- 方便使用不同配置進行 A/B 測試
- 保持專案目錄整潔

## 配置

copy-env 支援多種配置格式，提供最大的靈活性：

### 配置檔案格式

copy-env 自動檢測並按以下優先順序載入配置檔案：

1. **`.copy-env.js`** - ESM JavaScript（推薦用於動態配置）
2. **`.copy-env.mjs`** - ESM JavaScript
3. **`.copy-env.cjs`** - CommonJS JavaScript
4. **`.copy-env.json`** - JSON/JSON5

#### JSON 配置

在專案根目錄建立 `.copy-env.json` 檔案：

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "type": "auto",
  "packages": ["packages/*", "apps/*"]
}
```

#### JavaScript 配置

JavaScript 配置檔案提供更多靈活性和執行期邏輯：

**ESM 格式 (`.copy-env.js` 或 `.copy-env.mjs`):**

```javascript
// .copy-env.js
export default {
  workspaceRoot: process.cwd(),
  envExampleName: '.env.example',
  envName: '.env.local',
  type: 'auto',
  // 基於環境變數的動態配置
  packages: process.env.CUSTOM_PACKAGES?.split(','),
};
```

**函數式配置（支援非同步）:**

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

**CommonJS 格式 (`.copy-env.cjs`):**

```javascript
// .copy-env.cjs
module.exports = {
  workspaceRoot: process.cwd(),
  type: 'pnpm',
  packages: ['packages/web', 'packages/api'],
};
```

**JavaScript 配置的優勢:**
- 🎯 **動態配置**: 根據環境變數或執行期條件調整設定
- 🔧 **程式碼重用**: 匯入工具函數並在配置間共享邏輯
- 📝 **更好的註解**: 使用 JavaScript 註解提供更豐富的文件
- ⚡ **非同步支援**: 從遠端獲取配置或讀取資料庫
- 🛠️ **型別安全**: 透過 JSDoc 或 TypeScript 獲得 IntelliSense

查看 [examples/js-config-examples](../examples/js-config-examples) 獲取完整的工作範例。

### 配置選項

| 選項 | 型別 | 預設值 | 描述 |
|------|------|--------|------|
| `workspaceRoot` | `string` | `process.cwd()` | 工作區根目錄 |
| `envExampleName` | `string` | `.env.example` | 來源環境變數檔案名稱或路徑（支援相對路徑和絕對路徑） |
| `envName` | `string` | `.env.local` | 目標環境變數檔案名稱或路徑（支援相對路徑和絕對路徑） |
| `type` | `'pnpm' \| 'lerna' \| 'auto'` | `'auto'` | Monorepo 類型 |
| `packages` | `string[]` | `undefined` | 手動指定套件目錄（支援 glob 模式） |
| `skipIfExists` | `(string \| RegExp)[] \| RegExp \| string` | `undefined` | 如果目標環境檔案中已存在這些變數，則跳過複製。如果目標 .env 已有這些變數，將不會覆寫（無論值是否為空都保留現有值）。可以是字串（正規表示式模式）、RegExp 或兩者的陣列 |

### 路徑解析

#### 相對路徑
相對路徑從每個套件目錄解析：

```json
{
  "envExampleName": "../shared-config/env.template"
}
```

對於位於 `packages/app/` 的套件，這將解析為 `packages/shared-config/env.template`。

#### 絕對路徑
絕對路徑（以 `/` 開頭）從工作區根目錄解析：

```json
{
  "envExampleName": "/config/common.env"
}
```

對於所有套件，這將解析為 `<工作區根目錄>/config/common.env`。

### 類型

- **`pnpm`**: 使用 `pnpm-workspace.yaml` 檢測套件
- **`lerna`**: 使用 `lerna.json` 檢測套件
- **`auto`**: 自動檢測 monorepo 類型

## 範例

查看 [examples](../examples) 目錄獲取完整的可執行範例。

## 環境變數合併

複製環境檔案時，copy-env 會智慧地合併 `.env.example` 和現有 `.env` 中的值：

### 合併規則

#### 預設行為（未配置 `skipIfExists`）

1. **新變數**: 僅存在於 `.env.example` 中的變數將被新增到 `.env`
2. **現有變數**: 同時存在於兩個檔案中的變數：
   - 如果 `.env` 中的值**非空**，則**保留**現有值
   - 如果 `.env` 中的值**為空**，則使用 `.env.example` 中的值更新
3. **移除變數**: 僅存在於 `.env` 但不在 `.env.example` 中的變數將被**移除**

#### 配置 `skipIfExists` 時的行為

當配置了 `skipIfExists` 時，合併行為會發生變化：

1. **符合 `skipIfExists` 模式的變數**: 如果這些變數已存在於 `.env` 中，將**永遠不會被覆寫**，無論值是否為空
2. **不符合 `skipIfExists` 模式的變數**: 這些變數將**從 `.env.example` 更新**，即使它們在 `.env` 中已有值
3. **新變數**: `.env` 中不存在的變數將從 `.env.example` 新增

**配置選項：**
   - 使用字串（正規表示式模式）：`"skipIfExists": "^SECRET_KEY$"`
   - 使用正規表示式：`"skipIfExists": "/^(SECRET|API)_/"` (JSON 中) 或 `skipIfExists: /^(SECRET|API)_/` (JS 中)
   - 使用陣列：`"skipIfExists": ["^SECRET_KEY$", "^API_TOKEN$"]` 或混合 RegExp 和字串

### 範例

**處理前：**

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

**執行 copy-env 後：**

`.env`:
```env
API_URL=https://api.staging.com
API_KEY=my-secret-key
DATABASE_URL=postgres://localhost:5432/db
NEW_FEATURE_FLAG=true
```

**發生了什麼：**
- ✅ `API_URL`: 保留 `.env` 中的現有值
- ✅ `API_KEY`: 保留現有的非空值
- ✅ `DATABASE_URL`: 使用 `.env.example` 中的值更新（原為空）
- ✅ `NEW_FEATURE_FLAG`: 新增新變數
- ❌ `OLD_VARIABLE`: 移除（不在 `.env.example` 中）

### 使用 `skipIfExists` 參數

`skipIfExists` 參數允許選擇性地保留特定的環境變數。這對以下場景特別有用：
- 只應手動設定的密鑰
- 開發者單獨配置的 API 令牌
- 需要保留初始狀態的變數（即使為空）

**⚠️ 重要提示**：配置 `skipIfExists` 後，**只有符合模式的變數會被保留**。所有其他變數將從 `.env.example` 更新，即使它們在現有檔案中已有值。

**設定 `skipIfExists`：**

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "skipIfExists": ["^SECRET_KEY$", "^API_TOKEN$"]
}
```

或使用單個正規表示式模式（在 JavaScript 設定中）：

```javascript
// .copy-env.js
export default {
  envExampleName: '.env.example',
  envName: '.env.local',
  skipIfExists: /^(SECRET|API)_/  // 符合所有以 SECRET_ 或 API_ 開頭的變數
};
```

或使用單個字串模式：

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "skipIfExists": "^SECRET.*"
}
```

或在陣列中混合使用多種模式：

```javascript
// .copy-env.js
export default {
  envExampleName: '.env.example',
  envName: '.env.local',
  skipIfExists: [/^SECRET_/, "^API_TOKEN$", /CONFIG$/]  // 混合 RegExp 和字串
};
```

**範例行為：**

`.env.example`:
```env
API_URL=https://api.example.com
SECRET_KEY=default-key-do-not-use
API_TOKEN=your-token-here
DB_HOST=localhost
```

`.env` (處理前):
```env
API_URL=https://api.staging.com
SECRET_KEY=
API_TOKEN=my-personal-token
DB_HOST=production-db.example.com
```

**使用 `skipIfExists: ["^SECRET_KEY$", "^API_TOKEN$"]` 執行 copy-env 後：**

`.env` (處理後):
```env
API_URL=https://api.example.com
SECRET_KEY=
API_TOKEN=my-personal-token
DB_HOST=localhost
```

**發生了什麼：**
- ⚠️ `API_URL`: **從 .env.example 更新**（不在 `skipIfExists` 列表中，即使有值也會被覆寫）
- ✅ `SECRET_KEY`: **保留空值**（符合 `skipIfExists` 模式）
- ✅ `API_TOKEN`: **保留現有值**（符合 `skipIfExists` 模式）
- ⚠️ `DB_HOST`: **從 .env.example 更新**（不在 `skipIfExists` 列表中）

### 解析規則

- **註解**: 以 `#` 開頭的行被忽略
- **空行**: 跳過空白行
- **鍵值格式**: 變數必須遵循 `KEY=VALUE` 格式
- **空白字元**: 鍵和值中的前導和尾隨空白字元會被修剪

## 工作原理

copy-env 遵循智慧檢測和處理工作流程：

### 1. 配置載入
- 從 `.copy-env.json`（或指定的自訂配置檔案）讀取配置
- 為任何缺失的配置選項套用預設值
- 解析工作區根目錄

### 2. Monorepo 檢測
- **自動檢測**: 檢查 `pnpm-workspace.yaml` 或 `lerna.json`
- **手動配置**: 如果在配置中指定了 `packages` 陣列，則使用它
- **回退**: 如果未檢測到 monorepo，則視為單專案設定

### 3. 套件發現
- 對於 monorepos：
  - 解析 glob 模式（例如 `packages/*`、`apps/*`）
  - 解析所有符合的套件目錄
  - 獨立處理每個套件
- 對於單專案：
  - 直接處理工作區根目錄

### 4. 環境檔案處理
對於每個目標目錄（套件或根目錄）：
- 解析來源路徑（`envExampleName`）和目標路徑（`envName`）
  - 絕對路徑（以 `/` 開頭）從工作區根目錄解析
  - 相對路徑從目前套件目錄解析
- 讀取並解析 `.env.example` 檔案
- 讀取並解析現有的 `.env` 檔案（如果存在）
- 智慧合併值（參見[環境變數合併](#環境變數合併)）
- 將合併結果寫入 `.env`

### 5. 結果
- 為每個處理的目錄顯示成功訊息
- 顯示複製的環境變數總數
- 報告處理的套件總數（對於 monorepos）

## 授權

MIT © [HydratedPig](https://github.com/HydratedPig)

## 貢獻

歡迎貢獻！請隨時提交 Pull Request。

## 問題

如果遇到任何問題，請在以下位置提交 issue：
https://github.com/HydratedPig/copy-env/issues
