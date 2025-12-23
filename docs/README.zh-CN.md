# @hydrated_pig/copy-env

[English](../README.md) | [日本語](./README.ja.md) | [繁體中文](./README.zh-TW.md)

在 monorepo 项目中自动复制 `.env.example` 到 `.env`。

## 特性

- 🚀 **自动检测**: 支持 pnpm 和 lerna monorepo 架构
- 📦 **多包管理器**: 兼容 pnpm-workspace.yaml 和 lerna.json
- ⚙️ **灵活配置**: 支持 JSON、JavaScript (ESM/CJS) 和函数式配置
- 🎯 **动态运行时配置**: 使用 JavaScript 实现基于环境的配置逻辑
- 🔄 **智能合并**: 保留现有环境变量值
- 🌐 **零配置**: 开箱即用，具有合理的默认值
- 🛡️ **类型安全**: 使用 TypeScript 编写，提供完整类型定义
- ⚡ **异步支持**: 函数式配置支持异步操作

## 安装

```bash
# 使用 pnpm
pnpm add -D @hydrated_pig/copy-env

# 使用 yarn
yarn add -D @hydrated_pig/copy-env

# 使用 npm
npm install -D @hydrated_pig/copy-env
```

## 使用

### 自动模式（推荐）

在项目根目录的 `package.json` 中添加 `postinstall` 脚本：

```json
{
  "scripts": {
    "postinstall": "copy-env"
  }
}
```

运行 `npm install` / `yarn install` / `pnpm install` 后，环境文件将自动复制。

### 手动模式

手动运行 CLI 命令：

```bash
npx copy-env
```

或添加到脚本中：

```json
{
  "scripts": {
    "prepare-env": "copy-env"
  }
}
```

### CLI 选项

```bash
copy-env [options]

选项:
  -c, --config <path>    指定自定义配置文件路径
                         (默认: .copy-env.json)
  -r, --root <path>      指定工作区根目录
                         (默认: 当前工作目录)
  -h, --help             显示帮助信息

示例:
  copy-env                                    # 使用默认 .copy-env.json
  copy-env --config custom-config.json        # 使用自定义配置文件
  copy-env -c configs/dev.json                # 简写形式
  copy-env -r /path/to/workspace              # 指定工作区根目录
  copy-env -c dev.json -r /path/to/workspace  # 组合使用选项
```

**使用 `-c` 选项的优势:**
- 在多个项目间共享配置
- 减少配置文件重复
- 方便使用不同配置进行 A/B 测试
- 保持项目目录整洁

## 配置

copy-env 支持多种配置格式，提供最大的灵活性：

### 配置文件格式

copy-env 自动检测并按以下优先级顺序加载配置文件：

1. **`.copy-env.js`** - ESM JavaScript（推荐用于动态配置）
2. **`.copy-env.mjs`** - ESM JavaScript
3. **`.copy-env.cjs`** - CommonJS JavaScript
4. **`.copy-env.json`** - JSON/JSON5

#### JSON 配置

在项目根目录创建 `.copy-env.json` 文件：

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "type": "auto",
  "packages": ["packages/*", "apps/*"]
}
```

#### JavaScript 配置

JavaScript 配置文件提供更多灵活性和运行时逻辑：

**ESM 格式 (`.copy-env.js` 或 `.copy-env.mjs`):**

```javascript
// .copy-env.js
export default {
  workspaceRoot: process.cwd(),
  envExampleName: '.env.example',
  envName: '.env.local',
  type: 'auto',
  // 基于环境变量的动态配置
  packages: process.env.CUSTOM_PACKAGES?.split(','),
};
```

**函数式配置（支持异步）:**

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

**JavaScript 配置的优势:**
- 🎯 **动态配置**: 根据环境变量或运行时条件调整设置
- 🔧 **代码重用**: 导入工具函数并在配置间共享逻辑
- 📝 **更好的注释**: 使用 JavaScript 注释提供更丰富的文档
- ⚡ **异步支持**: 从远程获取配置或读取数据库
- 🛠️ **类型安全**: 通过 JSDoc 或 TypeScript 获得 IntelliSense

查看 [examples/js-config-examples](../examples/js-config-examples) 获取完整的工作示例。

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `workspaceRoot` | `string` | `process.cwd()` | 工作区根目录 |
| `envExampleName` | `string` | `.env.example` | 源环境变量文件名或路径（支持相对路径和绝对路径） |
| `envName` | `string` | `.env.local` | 目标环境变量文件名或路径（支持相对路径和绝对路径） |
| `type` | `'pnpm' \| 'lerna' \| 'auto'` | `'auto'` | Monorepo 类型 |
| `packages` | `string[]` | `undefined` | 手动指定包目录（支持 glob 模式） |
| `skipIfExists` | `(string \| RegExp)[] \| RegExp \| string` | `undefined` | 如果目标环境文件中已存在这些变量，则跳过复制。如果目标 .env 已有这些变量，将不会覆盖（无论值是否为空都保留现有值）。可以是字符串（正则模式）、RegExp 或两者的数组 |
| `preserveCustomVars` | `boolean` | `true` | 是否保留仅存在于目标 .env 但不在 .env.example 中的自定义环境变量。设置为 `false` 时，自定义变量将被删除 |

### 路径解析

#### 相对路径
相对路径从每个包目录解析：

```json
{
  "envExampleName": "../shared-config/env.template"
}
```

对于位于 `packages/app/` 的包，这将解析为 `packages/shared-config/env.template`。

#### 绝对路径
绝对路径（以 `/` 开头）从工作区根目录解析：

```json
{
  "envExampleName": "/config/common.env"
}
```

对于所有包，这将解析为 `<工作区根目录>/config/common.env`。

### 类型

- **`pnpm`**: 使用 `pnpm-workspace.yaml` 检测包
- **`lerna`**: 使用 `lerna.json` 检测包
- **`auto`**: 自动检测 monorepo 类型

## 示例

查看 [examples](../examples) 目录获取完整的可运行示例。

## 环境变量合并

复制环境文件时，copy-env 会智能地合并 `.env.example` 和现有 `.env` 中的值：

### 基本合并规则

1. **新变量**: 仅存在于 `.env.example` 中的变量将被添加到 `.env`
2. **现有变量**: 同时存在于两个文件中的变量：
   - 如果 `.env` 中的值**非空**，则**保留**现有值
   - 如果 `.env` 中的值**为空**，则使用 `.env.example` 中的值更新
3. **自定义变量**: 仅存在于 `.env` 但不在 `.env.example` 中的变量将**默认保留**（由 `preserveCustomVars` 选项控制）

### 示例

**处理前：**

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
MY_CUSTOM_VAR=my-value
```

**运行 copy-env 后：**

`.env`:
```env
API_URL=https://api.staging.com
API_KEY=my-secret-key
DATABASE_URL=postgres://localhost:5432/db
NEW_FEATURE_FLAG=true
MY_CUSTOM_VAR=my-value
```

**发生了什么：**
- ✅ `API_URL`: 保留 `.env` 中的现有值
- ✅ `API_KEY`: 保留现有的非空值
- ✅ `DATABASE_URL`: 使用 `.env.example` 中的值更新（原为空）
- ✅ `NEW_FEATURE_FLAG`: 添加新变量
- ✅ `MY_CUSTOM_VAR`: **保留**（自定义变量，由 `preserveCustomVars=true` 默认控制）

### 使用 `preserveCustomVars` 控制自定义变量

`preserveCustomVars` 选项（默认值：`true`）控制是否保留自定义环境变量：

**配置：**
```json
{
  "preserveCustomVars": false
}
```

**使用 `preserveCustomVars: false` 时：**

使用上面相同的示例，`MY_CUSTOM_VAR` 将被**删除**，因为它不存在于 `.env.example` 中。

这在您想确保 `.env` 只包含 `.env.example` 中定义的变量时很有用。

### 高级：使用 `skipIfExists` 参数

`skipIfExists` 参数允许选择性地保留特定的环境变量。这对以下场景特别有用：
- 只应手动设置的密钥
- 开发者单独配置的 API 令牌
- 需要保留初始状态的变量（即使为空）

**⚠️ 重要提示**：配置 `skipIfExists` 后，**只有匹配模式的变量会被保留**。所有其他变量将从 `.env.example` 更新，即使它们在现有文件中已有值。

**行为：**

1. **匹配 `skipIfExists` 模式的变量**: 如果这些变量已存在于 `.env` 中，将**永远不会被覆盖**，无论值是否为空
2. **不匹配 `skipIfExists` 模式的变量**: 这些变量将**从 `.env.example` 更新**，即使它们在 `.env` 中已有值
3. **新变量**: `.env` 中不存在的变量将从 `.env.example` 添加
4. **自定义变量**: 仍由 `preserveCustomVars` 选项控制（独立于 `skipIfExists`）

**配置选项：**
   - 使用字符串（正则模式）：`"skipIfExists": "^SECRET_KEY$"`
   - 使用正则表达式：`"skipIfExists": "/^(SECRET|API)_/"` (JSON 中) 或 `skipIfExists: /^(SECRET|API)_/` (JS 中)
   - 使用数组：`"skipIfExists": ["^SECRET_KEY$", "^API_TOKEN$"]` 或混合 RegExp 和字符串

**配置 `skipIfExists`：**

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "skipIfExists": ["^SECRET_KEY$", "^API_TOKEN$"]
}
```

或使用单个正则表达式模式（在 JavaScript 配置中）：

```javascript
// .copy-env.js
export default {
  envExampleName: '.env.example',
  envName: '.env.local',
  skipIfExists: /^(SECRET|API)_/  // 匹配所有以 SECRET_ 或 API_ 开头的变量
};
```

或使用单个字符串模式：

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "skipIfExists": "^SECRET.*"
}
```

或在数组中混合使用多种模式：

```javascript
// .copy-env.js
export default {
  envExampleName: '.env.example',
  envName: '.env.local',
  skipIfExists: [/^SECRET_/, "^API_TOKEN$", /CONFIG$/]  // 混合 RegExp 和字符串
};
```

**示例行为：**

`.env.example`:
```env
API_URL=https://api.example.com
SECRET_KEY=default-key-do-not-use
API_TOKEN=your-token-here
DB_HOST=localhost
```

`.env` (处理前):
```env
API_URL=https://api.staging.com
SECRET_KEY=
API_TOKEN=my-personal-token
DB_HOST=production-db.example.com
```

**使用 `skipIfExists: ["^SECRET_KEY$", "^API_TOKEN$"]` 运行 copy-env 后：**

`.env` (处理后):
```env
API_URL=https://api.example.com
SECRET_KEY=
API_TOKEN=my-personal-token
DB_HOST=localhost
```

**发生了什么：**
- ⚠️ `API_URL`: **从 .env.example 更新**（不在 `skipIfExists` 列表中，即使有值也会被覆盖）
- ✅ `SECRET_KEY`: **保留空值**（匹配 `skipIfExists` 模式）
- ✅ `API_TOKEN`: **保留现有值**（匹配 `skipIfExists` 模式）
- ⚠️ `DB_HOST`: **从 .env.example 更新**（不在 `skipIfExists` 列表中）

### 解析规则

- **注释**: 以 `#` 开头的行被忽略
- **空行**: 跳过空白行
- **键值格式**: 变量必须遵循 `KEY=VALUE` 格式
- **空白字符**: 键和值中的前导和尾随空白字符会被修剪

## 工作原理

copy-env 遵循智能检测和处理工作流：

### 1. 配置加载
- 从 `.copy-env.json`（或指定的自定义配置文件）读取配置
- 为任何缺失的配置选项应用默认值
- 解析工作区根目录

### 2. Monorepo 检测
- **自动检测**: 检查 `pnpm-workspace.yaml` 或 `lerna.json`
- **手动配置**: 如果在配置中指定了 `packages` 数组，则使用它
- **回退**: 如果未检测到 monorepo，则视为单项目设置

### 3. 包发现
- 对于 monorepos：
  - 解析 glob 模式（例如 `packages/*`、`apps/*`）
  - 解析所有匹配的包目录
  - 独立处理每个包
- 对于单项目：
  - 直接处理工作区根目录

### 4. 环境文件处理
对于每个目标目录（包或根目录）：
- 解析源路径（`envExampleName`）和目标路径（`envName`）
  - 绝对路径（以 `/` 开头）从工作区根目录解析
  - 相对路径从当前包目录解析
- 读取并解析 `.env.example` 文件
- 读取并解析现有的 `.env` 文件（如果存在）
- 智能合并值（参见[环境变量合并](#环境变量合并)）
- 将合并结果写入 `.env`

### 5. 结果
- 为每个处理的目录显示成功消息
- 显示复制的环境变量总数
- 报告处理的包总数（对于 monorepos）

## 许可证

MIT © [HydratedPig](https://github.com/HydratedPig)

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 问题

如果遇到任何问题，请在以下位置提交 issue：
https://github.com/HydratedPig/copy-env/issues
