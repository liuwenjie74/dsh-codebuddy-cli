#!/usr/bin/env node
// 词表一致性检查。
//
//   1) client.js 里每一个 t('key') 的 key，必须在中英两份词表里都存在（硬失败）；
//   2) 中英成对的词表键集合必须完全一致，不得出现单侧死键（硬失败）；
//   3) 词表里定义了但没有任何 t() 字面量引用的键，只报告不失败。
//
// 第 3 条之所以只提示：动态键（如 t(region.id)）无法静态解析；第 1 批的教训是护栏写得太宽会误报。
// 这条检查的直接动机：删掉 modelVisibilityNote 词条后，t('feedbackGroup') 的渲染还留着，
// 会在「运行配置未就绪」状态露出空串——词表与渲染之间缺一致性约束。

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rel = (p) => path.join(root, p)

const PAIRS = [
  ['国内版', 'locales/cn.zh.json', 'locales/cn.en.json'],
  ['国际版', 'locales/intl.zh.json', 'locales/intl.en.json'],
  ['反馈面板', 'locales/feedback.zh.json', 'locales/feedback.en.json'],
]

// apply() 里运行时合并出来的键，不来自 locales JSON
const DERIVED = ['sidebarEntry', 'pageEntryHint', 'channelUnavailable', 'regionPicker', 'cn', 'intl', 'regionNote']

const errors = []
const readKeys = async (file) => new Set(Object.keys(JSON.parse(await readFile(rel(file), 'utf8'))))

const zh = new Set(DERIVED)
const en = new Set(DERIVED)

for (const [label, zhFile, enFile] of PAIRS) {
  const zhKeys = await readKeys(zhFile)
  const enKeys = await readKeys(enFile)
  for (const key of zhKeys) zh.add(key)
  for (const key of enKeys) en.add(key)
  const onlyZh = [...zhKeys].filter((key) => !enKeys.has(key))
  const onlyEn = [...enKeys].filter((key) => !zhKeys.has(key))
  if (onlyZh.length > 0) errors.push(label + '：' + zhFile + ' 有 ' + enFile + ' 缺少的键 -> ' + onlyZh.join(', '))
  if (onlyEn.length > 0) errors.push(label + '：' + enFile + ' 有 ' + zhFile + ' 缺少的键 -> ' + onlyEn.join(', '))
}

const client = await readFile(rel('lib/client.js'), 'utf8')
const used = new Set()
for (const match of client.matchAll(/\bt\(\s*(['"])([A-Za-z0-9_]+)\1\s*\)/gu)) used.add(match[2])

for (const key of used) {
  if (!zh.has(key)) errors.push("t('" + key + "') 在中文词表里不存在")
  if (!en.has(key)) errors.push("t('" + key + "') 在英文词表里不存在")
}

const unused = [...zh].filter((key) => !used.has(key) && !DERIVED.includes(key))
if (unused.length > 0) {
  console.log('[info] 未被 t() 字面量引用的键 ' + unused.length + ' 个（可能含动态键，仅提示）：' + unused.join(', '))
}

if (errors.length > 0) {
  for (const error of errors) console.error('[fail] ' + error)
  process.exit(1)
}
console.log('[ok] ' + used.size + ' 个 t() 键在中英词表中都存在；三对词表键集合一致')
