#!/usr/bin/env node
// 版本号单一来源同步器。
//
// 权威源只有一个：package.json 的 version 字段。
// 本脚本负责把它同步到两处运行时/客户端常量，以及 README 与两份迁移文档；
// 并在 --check 模式下做「全仓不得残留与当前版本不同的三段式版本字面量」硬校验。
//
// 用法：
//   node scripts/sync-version.mjs          写入
//   node scripts/sync-version.mjs --check  只校验，不一致 exit 1（CI 与发布脚本调用）
//
// 说明：CHANGELOG.md 的历史小节按约定保留旧版本号，故排除在扫描之外。

import { readFile, writeFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')
const errors = []

const rel = (p) => path.join(root, p)
const read = (p) => readFile(rel(p), 'utf8')
const write = (p, t) => writeFile(rel(p), t, 'utf8')

const pkg = JSON.parse(await read('package.json'))
const version = pkg.version
if (!/^\d+\.\d+\.\d+$/u.test(version)) {
  console.error(`package.json 的 version 非法：${version}`)
  process.exit(1)
}

// ---- 1. 版本常量：服务端（shared）与客户端 bundle 各一份 ----
const constTargets = [
  ['lib/shared/version.js', /(export const PLUGIN_VERSION = ')([^']+)(')/u],
  ['lib/client.js', /(\bconst PLUGIN_VERSION = ')([^']+)(')/u],
]

for (const [file, pattern] of constTargets) {
  let text
  try {
    text = await read(file)
  } catch {
    errors.push(`${file}: 文件不存在`)
    continue
  }
  const found = text.match(pattern)
  if (!found) {
    errors.push(`${file}: 找不到版本常量声明`)
    continue
  }
  if (found[2] === version) continue
  if (checkOnly) {
    errors.push(`${file}: 常量 ${found[2]} 与 package.json 的 ${version} 不一致`)
    continue
  }
  await write(file, text.replace(pattern, `$1${version}$3`))
  console.log(`[sync] ${file}: ${found[2]} -> ${version}`)
}

// ---- 2. 文档里的版本与下载链接 ----
const docTargets = ['README.md', 'README.en.md', 'docs/安装与迁移.md', 'docs/MIGRATION.en.md']
// 版本号不能只认 1.x：升到 2.0.0 之后，写死主版本会让 README 与两份迁移文档停在
// 旧主版本，而残留扫描用同一条正则也同样看不见，属静默错误。这里改成通用三段式
// 匹配，再排除两类非插件版本：
//   - 官方 CLI 版本（lib/cn/accounts.js 的 ACCOUNT_CLI_VERSIONS，也被账号说明文案引用）；
//   - 依赖/引擎版本区间（匹配位置前面紧跟 ^ ~ > < = 的那些，如 ^4.0.5、>=22.19.0）。
// 22.19.0 另有天然保护：候选起点前是数字，lookbehind 不成立。
const UNRELATED_VERSIONS = new Set([
  '2.174.0', '2.177.0', // ACCOUNT_CLI_VERSIONS：多账号隔离核查过的官方 CLI 版本
  '0.2.0', '0.2.2' // model-catalog.js 的 ACP clientInfo 版本，不是插件版本
])
const anyVersion = () => /(?<![A-Za-z0-9_.-])v?[0-9]+[.][0-9]+[.][0-9]+(?![A-Za-z0-9_.-])/gu
const isPluginVersion = (token) => !UNRELATED_VERSIONS.has(token.replace(/^v/u, ''))
// 依赖/引擎区间（^4.0.5、>=22.19.0 之类）不是插件版本，判据是紧邻的运算符。
const precededByComparator = (prefix) => /[~^><=]$/u.test(prefix.trimEnd())

for (const file of docTargets) {
  let text
  try {
    text = await read(file)
  } catch {
    continue
  }
  // 只替换插件版本；CLI 版本、ACP 版本与依赖区间原样保留。
  let replaced = ''
  let cursor = 0
  for (const found of text.matchAll(anyVersion())) {
    const token = found[0]
    if (!isPluginVersion(token)) continue
    if (precededByComparator(text.slice(0, found.index))) continue
    const next = token.startsWith('v') ? `v${version}` : version
    if (next === token) continue
    replaced += text.slice(cursor, found.index) + next
    cursor = found.index + token.length
  }
  replaced += text.slice(cursor)
  if (replaced === text) continue
  if (checkOnly) {
    errors.push(`${file}: 仍包含非当前版本号（应为 ${version}）`)
    continue
  }
  await write(file, replaced)
  console.log(`[sync] ${file}: 版本号已对齐 ${version}`)
}

// ---- 3. 残留旧版本字面量扫描 ----
// 逐字扫描只覆盖真正承载插件版本的位置。
// test/ 不在其列：测试里合法地存在与插件版本无关的夹具版本（伪 CLI 版本号、
// 版本解析用例里的伪造版本号等），逐字扫必然误报。测试侧的等价约束见下面 3b 的定向检查。
// 本脚本自身也不参与扫描（它含说明性文字与正则片段，见下方 self 判断），
// 否则会用自己的注释把自己判成残留。
const scanDirs = ['lib', 'scripts']
const scanFiles = ['README.md', 'README.en.md', 'package.json', 'cordis.patch.yml']
const skipNames = new Set(['CHANGELOG.md', 'package-lock.json'])
const textFile = /\.(?:m?js|cjs|json|md|ya?ml)$/u

async function walk(dir, out) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return out
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'releases') continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(p, out)
    else if (textFile.test(entry.name)) out.push(p)
  }
  return out
}

const candidates = []
for (const dir of scanDirs) await walk(rel(dir), candidates)
for (const file of scanFiles) candidates.push(rel(file))

const residual = []
const selfPath = path.resolve(fileURLToPath(import.meta.url))
for (const file of candidates) {
  if (skipNames.has(path.basename(file))) continue
  if (path.resolve(file) === selfPath) continue
  let text
  try {
    text = await readFile(file, 'utf8')
  } catch {
    continue
  }
  const lines = text.split('\n')
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    for (const found of line.matchAll(anyVersion())) {
      const token = found[0]
      const plain = token.replace(/^v/u, '')
      if (plain === version) continue
      if (UNRELATED_VERSIONS.has(plain)) continue
      // 依赖/引擎版本（^4.0.5、>=22.19.0 之类）不是插件版本。
      if (precededByComparator(line.slice(0, found.index))) continue
      residual.push(`${path.relative(root, file)}:${i + 1}: ${token}`)
    }
  }
}

if (residual.length > 0) {
  for (const line of residual) errors.push(`残留旧版本字面量 ${line}`)
}

// ---- 3b. 测试侧定向检查 ----
// 测试里可以出现与插件版本无关的夹具版本，但不允许把插件版本写死：
// 一切断言/夹具中的 pluginVersion 都必须引用 PLUGIN_VERSION 常量。
const literalPluginVersion = /pluginVersion\s*[:,]\s*(['"])(\d+\.\d+\.\d+)\1/gu
for (const file of await walk(rel('test'), [])) {
  if (!/\.(?:m?js)$/u.test(file)) continue
  const text = await readFile(file, 'utf8')
  for (const hit of text.matchAll(literalPluginVersion)) {
    const line = text.slice(0, hit.index).split('\n').length
    errors.push(`${path.relative(root, file)}:${line}: pluginVersion 写死为 '${hit[2]}'，请改用 PLUGIN_VERSION 常量`)
  }
}

if (errors.length > 0) {
  for (const e of errors) console.error(`[fail] ${e}`)
  process.exit(1)
}

console.log(checkOnly ? `[ok] 版本一致：${version}` : `[ok] 已同步到 ${version}`)
