#!/usr/bin/env tsx

/**
 * 在所有 examples 中执行安装命令
 * 会根据 packageManager 字段使用相应的包管理器
 */

import { execa } from 'execa'
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { resolve, join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const examplesDir = resolve(__dirname, '../examples')

interface PackageJson {
  packageManager?: string
  scripts?: Record<string, string>
  workspaces?: string[]
}

/**
 * 获取项目的包管理器
 */
function getPackageManager(projectPath: string): string | null {
  const packageJsonPath = join(projectPath, 'package.json')

  if (!existsSync(packageJsonPath)) {
    console.log('  ⚠️  没有 package.json，跳过')
    return null
  }

  const packageJson: PackageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'))

  // 从 packageManager 字段获取
  if (packageJson.packageManager) {
    const pm = packageJson.packageManager.split('@')[0]
    console.log(`  📦 使用包管理器: ${pm}`)
    return pm
  }

  // 默认使用 pnpm
  console.log('  📦 使用默认包管理器: pnpm')
  return 'pnpm'
}

/**
 * 在项目中执行安装命令
 */
async function installProject(projectPath: string, projectName: string): Promise<void> {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`📂 安装项目: ${projectName}`)
  console.log(`${'='.repeat(60)}`)

  const packageManager = getPackageManager(projectPath)

  if (!packageManager) {
    return
  }

  try {
    const installCmd = packageManager === 'yarn' ? 'install' : 'install'

    console.log(`  🔨 执行命令: ${packageManager} ${installCmd}`)
    console.log('')

    await execa(packageManager, [installCmd], {
      cwd: projectPath,
      stdio: 'inherit',
      env: {
        ...process.env,
        // 确保使用正确的包管理器
        npm_config_user_agent: `${packageManager}/1.0.0`,
      },
    })

    console.log('')
    console.log(`  ✅ ${projectName} 安装完成`)
  }
  catch (error) {
    console.error(`  ❌ ${projectName} 安装失败:`, (error as Error).message)
    process.exit(1)
  }
}

/**
 * 主函数
 */
async function main(): Promise<void> {
  console.log('\n🚀 开始安装所有 examples...\n')

  if (!existsSync(examplesDir)) {
    console.error('❌ examples 目录不存在')
    process.exit(1)
  }

  const entries = readdirSync(examplesDir)

  // 过滤出目录
  const projects = entries.filter((entry) => {
    const fullPath = join(examplesDir, entry)
    return statSync(fullPath).isDirectory()
  })

  console.log(`找到 ${projects.length} 个示例项目:`)
  projects.forEach(project => console.log(`  - ${project}`))

  // 依次安装每个项目
  for (const project of projects) {
    const projectPath = join(examplesDir, project)
    await installProject(projectPath, project)
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ 所有 examples 安装完成!')
  console.log('='.repeat(60) + '\n')
}

main().catch((err) => {
  console.error('安装过程中发生错误:', err)
  process.exit(1)
})
