# JavaScript 配置文件示例

这个目录展示了如何使用 JavaScript 配置文件来实现更灵活的配置。

## 支持的格式

### 1. ESM 格式 (`.copy-env.js` / `.copy-env.mjs`)

```javascript
// .copy-env.js
export default {
  workspaceRoot: process.cwd(),
  envExampleName: '.env.example',
  envName: '.env.local',
  type: 'auto',
};
```

### 2. CommonJS 格式 (`.copy-env.cjs`)

```javascript
// .copy-env.cjs
module.exports = {
  workspaceRoot: process.cwd(),
  envExampleName: '.env.example',
  envName: '.env.local',
  type: 'auto',
};
```

### 3. 函数式配置（支持异步）

```javascript
// .copy-env.mjs
export default async function() {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    workspaceRoot: process.cwd(),
    envExampleName: isProduction ? '.env.production.example' : '.env.example',
    envName: isProduction ? '.env.production' : '.env.local',
    type: 'auto',
  };
}
```

## 配置文件优先级

当存在多个配置文件时，按以下优先级加载：

1. `.copy-env.js`
2. `.copy-env.mjs`
3. `.copy-env.cjs`
4. `.copy-env.json`

## JavaScript 配置的优势

1. **动态配置**：根据环境变量或运行时条件动态生成配置
2. **代码重用**：可以导入和使用其他模块
3. **类型安全**：可以使用 TypeScript 进行类型检查（配合 JSDoc）
4. **异步支持**：函数式配置支持异步操作
5. **更好的注释**：支持代码注释和文档

## 使用方法

### 使用默认配置文件

```bash
# 自动查找配置文件（按优先级）
copy-env
```

### 指定配置文件

```bash
# 使用指定的配置文件
copy-env -c .copy-env.mjs
copy-env -c .copy-env.cjs
```

## 示例文件说明

- `.copy-env.js` - 基础 ESM 格式示例
- `.copy-env-function.mjs` - 函数式异步配置示例
- `.copy-env-cjs.cjs` - CommonJS 格式示例

## 注意事项

1. JavaScript 配置文件必须使用异步 API（`readConfig`），同步 API（`readConfigSync`）不支持
2. 确保你的 `package.json` 中设置了正确的 `"type"` 字段
3. 函数式配置必须返回配置对象或 Promise<配置对象>
