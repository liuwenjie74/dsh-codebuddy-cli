#!/usr/bin/env node
// 链接可达性检查。
//
//   1) Markdown 里的仓库内相对链接，目标文件必须存在（硬失败）；
//   2) 代码里指向本仓库的 GitHub blob/tree 链接，其路径必须存在于仓库（硬失败）；
//   3) 外部 http(s) 链接只记录不判失败——离线或网络抖动不该让 CI 变红。
//
// 动机：清理他人痕迹那一版发现 8 条死键（guideFull/guideFullUrl）与 2 份孤儿文档，
// 且国际侧会把 /docs/cn/ 改写成不存在的 /docs/intl/ 而无人察觉。这类问题会再长出来。
// 注：本文件说明文字刻意不携带版本号字面量——它自身在 scripts/ 扫描范围内，
// 写了就会被 scripts/sync-version.mjs 的残留扫描判成「旧版本字面量」（已经咬过一次）。

import { readFile, readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rel = (p) => path.join(root, p)
const errors = []
const external = new Set()

async function exists(target) {
  try {
    await stat(target)
    return true
  } catch {
    return false
  }
}

async function walk(dir, acc = []) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return acc
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'releases') continue
    const target = path.join(dir, entry.name)
    if (entry.isDirectory()) await walk(target, acc)
    else if (entry.name.endsWith('.md')) acc.push(target)
  }
  return acc
}

const markdown = [rel('README.md'), rel('README.en.md'), rel('CHANGELOG.md'), ...(await walk(rel('docs')))]

for (const file of markdown) {
  let text
  try {
    text = await readFile(file, 'utf8')
  } catch {
    errors.push(path.relative(root, file) + ': 文件不存在')
    continue
  }
  for (const match of text.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/gu)) {
    const target = match[1]
    if (/^(?:https?:|mailto:|tel:|#)/u.test(target)) {
      if (/^https?:/u.test(target)) external.add(target)
      continue
    }
    let clean
    try {
      clean = decodeURIComponent(target.split('#')[0].split('?')[0])
    } catch {
      errors.push(path.relative(root, file) + ': 链接无法解码 -> ' + target)
      continue
    }
    if (!clean) continue
    if (!(await exists(path.resolve(path.dirname(file), clean)))) {
      errors.push(path.relative(root, file) + ': 相对链接目标不存在 -> ' + target)
    }
  }
}

// 代码内指向本仓库的文档链接（toolCoverageUrl / accountGuideUrl 等）
const client = await readFile(rel('lib/client.js'), 'utf8')
const marker = 'https://github.com/liuwenjie74/dsh-DKN-codebuddy-cli/'
const stopChars = new Set(["'", '"', '`', ')', ' ', '\n', '\t', '>', ']'])
let index = client.indexOf(marker)
while (index >= 0) {
  let end = index + marker.length
  while (end < client.length && !stopChars.has(client[end])) end += 1
  const tail = client.slice(index + marker.length, end)
  const parsed = /^(?:blob|tree)\/[^/]+\/(.+)$/u.exec(tail)
  if (parsed) {
    let clean
    try {
      clean = decodeURIComponent(parsed[1])
    } catch {
      errors.push('lib/client.js: 仓库内链接无法解码 -> ' + tail)
      clean = null
    }
    if (clean && !(await exists(rel(clean)))) errors.push('lib/client.js: 仓库内链接目标不存在 -> ' + tail)
  }
  index = client.indexOf(marker, end)
}

if (errors.length > 0) {
  for (const error of errors) console.error('[fail] ' + error)
  process.exit(1)
}
console.log('[ok] ' + markdown.length + ' 个 Markdown 文件的内部链接全部可达；代码内仓库链接全部可达；外链 ' + external.size + ' 条仅记录')
