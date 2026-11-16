#!/usr/bin/env node
// 从 CHANGELOG.md 抽取指定版本的小节正文，作为 Release 说明。
//
// 为什么单独抽一个模块：本地 `scripts/release.mjs` 与 CI 的 release workflow
// 必须用同一份抽取逻辑，否则「本地建好的 Release 正文」和「tag 自动建的正文」
// 会出现两套口径。
//
// 用法：
//   node scripts/changelog-section.mjs <version>    # 可带前导 v
// 输出：该小节正文（不含标题行），找不到则以非零退出码失败。

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/gu, '\\$&')

export async function changelogSection(version, file = path.join(root, 'CHANGELOG.md')) {
  const clean = String(version).replace(/^v/u, '').trim()
  if (!clean) return ''
  const text = await readFile(file, 'utf8')
  const lines = text.split(/\r?\n/u)
  const heading = new RegExp(`^##\\s+v?${escape(clean)}(?![\\d.\\w-])`, 'u')
  const start = lines.findIndex((line) => heading.test(line))
  if (start < 0) return ''
  let end = lines.length
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith('## ')) { end = i; break }
  }
  return lines.slice(start + 1, end).join('\n').trim()
}

const invokedDirectly = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (invokedDirectly) {
  const version = process.argv[2]
  if (!version) {
    console.error('usage: node scripts/changelog-section.mjs <version>')
    process.exit(1)
  }
  const body = await changelogSection(version)
  if (!body) {
    console.error(`CHANGELOG.md 中没有 ${version.replace(/^v/u, '')} 的小节`)
    process.exit(1)
  }
  process.stdout.write(`${body}\n`)
}
