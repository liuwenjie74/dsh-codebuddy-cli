#!/usr/bin/env node
// locales/*.json 与 lib/client.js 内联词表区块的同步器。
//
// 背景：lib/client.js 是 window.__ModuleLoader__.load({ factory }) 的自包含单文件，运行时不能 import JSON；
// 测试也直接把它当源码字符串跑（vm.runInContext(readFile(...))）。
// 因此词表以 locales/*.json 为唯一手写来源，由本脚本生成内联区块，产物仍是单文件、零 import。
//
// 用法：
//   node scripts/build-client-locales.mjs --from-client  把 client.js 现有区块导出成 JSON（迁移用，通常只跑一次）
//   node scripts/build-client-locales.mjs                由 JSON 重建 client.js 的词表区块
//   node scripts/build-client-locales.mjs --check        只校验区块与 JSON 是否一致（CI 与发布脚本用）

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rel = (p) => path.join(root, p)
const CLIENT = 'lib/client.js'

// 区块常量名 -> 唯一的 JSON 真值文件
const BLOCKS = [
  ['localeZh', 'locales/cn.zh.json'],
  ['localeEn', 'locales/cn.en.json'],
  ['intlLocaleZh', 'locales/intl.zh.json'],
  ['intlLocaleEn', 'locales/intl.en.json'],
  ['feedbackZh', 'locales/feedback.zh.json'],
  ['feedbackEn', 'locales/feedback.en.json'],
  ['guidanceZh', 'locales/guidance.zh.json'],
  ['guidanceEn', 'locales/guidance.en.json'],
]

const banner = (file) => '      // 由 ' + file + ' 生成，请勿手改；改词表请改该 JSON 后运行 node scripts/build-client-locales.mjs'

const args = process.argv.slice(2)
const mode = args.includes('--from-client') ? 'from' : args.includes('--check') ? 'check' : 'write'
const errors = []

// 从对象字面量起点截到行尾，交给 new Function 求值。
// 只接受纯字面量（全部是字符串键值），求值失败即认为候选收尾行不对，继续向后找。
function valueOf(text) {
  return new Function('return (' + text.slice(text.indexOf('{')) + ')')()
}

function locate(lines, name) {
  const startText = '    const ' + name + ' = {'
  const start = lines.findIndex((line) => line.trimEnd() === startText)
  if (start < 0) return null
  for (let end = start + 1; end < lines.length; end += 1) {
    if (lines[end].trimEnd() !== '    }') continue
    try {
      const value = valueOf(lines.slice(start, end + 1).join('\n'))
      if (value && typeof value === 'object' && !Array.isArray(value)) return { start, end, value }
    } catch {
      // 该候选行不是对象结尾（例如字符串里出现的花括号），继续向后找
    }
  }
  return null
}

function render(name, value, file) {
  const body = JSON.stringify(value, null, 2).split('\n').slice(1, -1).map((line) => '    ' + line)
  return ['    const ' + name + ' = {', banner(file), ...body, '    }']
}

const clientText = await readFile(rel(CLIENT), 'utf8')
const lines = clientText.split('\n')

if (mode === 'from') {
  await mkdir(rel('locales'), { recursive: true })
  for (const [name, file] of BLOCKS) {
    const found = locate(lines, name)
    if (!found) {
      errors.push(CLIENT + ': 找不到 ' + name + ' 区块')
      continue
    }
    await writeFile(rel(file), JSON.stringify(found.value, null, 2) + '\n', 'utf8')
    console.log('[ok] ' + name + ' -> ' + file + '（' + Object.keys(found.value).length + ' 个键）')
  }
} else {
  const edits = []
  for (const [name, file] of BLOCKS) {
    const found = locate(lines, name)
    if (!found) {
      errors.push(CLIENT + ': 找不到 ' + name + ' 区块')
      continue
    }
    let value
    try {
      value = JSON.parse(await readFile(rel(file), 'utf8'))
    } catch (error) {
      errors.push(file + ': 读取或解析失败（' + error.message + '）')
      continue
    }
    const rendered = render(name, value, file)
    let roundTrip
    try {
      roundTrip = valueOf(rendered.join('\n'))
    } catch (error) {
      errors.push(name + ': 生成结果无法被解析（' + error.message + '）')
      continue
    }
    if (JSON.stringify(roundTrip) !== JSON.stringify(value)) errors.push(name + ': 生成结果与 ' + file + ' 不一致（键序或转义被改变）')
    edits.push({ name, start: found.start, end: found.end, rendered })
  }

  if (errors.length === 0) {
    if (mode === 'check') {
      for (const edit of edits) {
        const current = lines.slice(edit.start, edit.end + 1).join('\n')
        if (current !== edit.rendered.join('\n')) {
          errors.push(CLIENT + ': ' + edit.name + ' 区块与 locales JSON 不一致，请运行 node scripts/build-client-locales.mjs 后提交')
        }
      }
    } else {
      const out = [...lines]
      for (const edit of [...edits].sort((a, b) => b.start - a.start)) {
        out.splice(edit.start, edit.end - edit.start + 1, ...edit.rendered)
      }
      const next = out.join('\n')
      if (next === clientText) {
        console.log('[ok] ' + CLIENT + ' 的词表区块已是最新')
      } else {
        await writeFile(rel(CLIENT), next, 'utf8')
        console.log('[ok] ' + CLIENT + ' 的词表区块已按 locales/*.json 重建')
      }
    }
  }
}

if (errors.length > 0) {
  for (const error of errors) console.error('[fail] ' + error)
  process.exit(1)
}
console.log('[ok] 词表区块与 locales/*.json 一致')
