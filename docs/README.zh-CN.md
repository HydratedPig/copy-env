# copy-env

[English](../README.md) | [日本語](./README.ja.md) | [繁體中文](./README.zh-TW.md)

在 monorepo 项目中自动复制 `.env.example` 到 `.env`。

## 特性

- 🚀 **自动检测**: 支持 pnpm 和 lerna monorepo 架构
- 📦 **多包管理器**: 兼容 pnpm-workspace.yaml 和 lerna.json
- ⚙️ **可配置**: 通过 `.copy-env.json` 自定义配置
- 🔄 **智能合并**: 保留现有环境变量值
- 🎯 **零配置**: 开箱即用，具有合理的默认值
- 🛡️ **类型安全**: 使用 TypeScript 编写，提供完整类型定义

## 安装

```bash
# 使用 pnpm
pnpm add -D copy-env

# 使用 yarn
yarn add -D copy-env

# 使用 npm
npm install -D copy-env
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

在项目根目录创建 `.copy-env.json` 文件：

```json
{
  "envExampleName": ".env.example",
  "envName": ".env.local",
  "type": "auto",
  "packages": ["packages/*", "apps/*"]
}
```

### 配置选项

| 选项 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `workspaceRoot` | `string` | `process.cwd()` | 工作区根目录 |
| `envExampleName` | `string` | `.env.example` | 源环境变量文件名或路径（支持相对路径和绝对路径） |
| `envName` | `string` | `.env.local` | 目标环境变量文件名或路径（支持相对路径和绝对路径） |
| `type` | `'pnpm' \| 'lerna' \| 'auto'` | `'auto'` | Monorepo 类型 |
| `packages` | `string[]` | `undefined` | 手动指定包目录（支持 glob 模式） |

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

查看 [examples](../examples) 目录获取完整的可运行示例：

### 1. 简单项目（非 Monorepo）
[examples/simple-project](../examples/simple-project)

基本的单包项目，无 monorepo 结构。

```bash
simple-project/
├── .env.example
└── package.json
```

### 2. PNPM Workspace
[examples/pnpm-monorepo](../examples/pnpm-monorepo)

包含多个包的 PNPM workspace。

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
```

### 3. Lerna Monorepo
[examples/lerna-monorepo](../examples/lerna-monorepo)

使用 Yarn workspaces 的 Lerna workspace。

```json
// lerna.json
{
  "packages": ["packages/*"],
  "version": "independent"
}
```

### 4. 自定义路径配置
[examples/custom-path-config](../examples/custom-path-config)

使用共享配置的自定义环境模板路径。

```json
// .copy-env.json
{
  "envExampleName": "../shared-config/env.template",
  "envName": ".env.local"
}
```

此示例演示：
- **相对路径解析**: 每个包相对于其自己的目录解析 `../shared-config/env.template`
- **共享模板**: 所有包使用相同的环境模板
- **灵活配置**: 不同的包可以使用不同的模板

## 环境变量合并

复制环境文件时，copy-env 会智能地合并 `.env.example` 和现有 `.env` 中的值：

### 合并规则

1. **新变量**: 仅存在于 `.env.example` 中的变量将被添加到 `.env`
2. **现有变量**: 同时存在于两个文件中的变量：
   - 如果 `.env` 中的值**非空**，则**保留**现有值
   - 如果 `.env` 中的值**为空**，则使用 `.env.example` 中的值更新
3. **移除变量**: 仅存在于 `.env` 但不在 `.env.example` 中的变量将被**移除**

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
OLD_VARIABLE=some-value
```

**运行 copy-env 后：**

`.env`:
```env
API_URL=https://api.staging.com
API_KEY=my-secret-key
DATABASE_URL=postgres://localhost:5432/db
NEW_FEATURE_FLAG=true
```

**发生了什么：**
- ✅ `API_URL`: 保留 `.env` 中的现有值
- ✅ `API_KEY`: 保留现有的非空值
- ✅ `DATABASE_URL`: 使用 `.env.example` 中的值更新（原为空）
- ✅ `NEW_FEATURE_FLAG`: 添加新变量
- ❌ `OLD_VARIABLE`: 移除（不在 `.env.example` 中）

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

## API

### `copyEnvs(workspaceRoot?: string, configPath?: string): Promise<void>`

以编程方式从代码运行 copy-env。

**参数:**

- `workspaceRoot`（可选）：工作区根目录路径。默认为 `process.cwd()`
- `configPath`（可选）：配置文件路径。默认为 `.copy-env.json`

**示例:**

```typescript
import { copyEnvs } from 'copy-env';

// 使用默认设置（当前目录、.copy-env.json）
await copyEnvs();

// 指定工作区根目录
await copyEnvs('/path/to/workspace');

// 同时指定工作区根目录和自定义配置
await copyEnvs('/path/to/workspace', 'custom-config.json');
```

## 许可证

MIT © [HydratedPig](https://github.com/HydratedPig)

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 问题

如果遇到任何问题，请在以下位置提交 issue：
https://github.com/HydratedPig/copy-env/issues
