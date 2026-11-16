#!/usr/bin/env node
// 一条命令发版。CI 侧由 .github/workflows/release.yml 承担同等校验。
//
// 用法：
//   node scripts/release.mjs <X.Y.Z>             正式发布
//   node scripts/release.mjs <X.Y.Z> --dry-run   只演练：不写文件、不打包、不提交、不推送
//   node scripts/release.mjs <X.Y.Z> --yes       保留开关（本脚本不交互，默认即执行）
//
// 设计约束（每条都对应此前发布时真实踩过的坑）：
//   1. 版本只认 package.json；其余位置由 scripts/sync-version.mjs 派生并校验，
//      之所以需要它，是因为版本号曾散落在十几个文件里、漏改一处测试就红。
//   2. tag 一律用「显式 lease 值」推送，绝不 -f，也绝不先 fetch --tags --force
//      （先 fetch 会刷新本地追踪值，导致 --force-with-lease 报 stale info 而失败）。
//   3. 发布是否成功只以服务端资产的 size + digest 判定。releases/download/... 直连
//      成功与否只记录不阻塞，并明确标注「本机链路不可达 != 资产缺失」。
//   4. 凭据只在内存里用：从 git credential fill 临时读取，不落文件、不打印。

import { readFile, writeFile, readdir, rename, mkdir, stat } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { changelogSection } from './changelog-section.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const rel = (p) => path.join(root, p)
const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const target = argv.find((a) => !/^-/u.test(a))

const log = (m) => console.log(m)
const warn = (m) => console.log(`[warn] ${m}`)
let index = 0
const step = (title) => { index += 1; log(`\n=== step ${index}: ${title}`) }
const fail = (m) => { console.error(`\n[fail] ${m}`); process.exit(1) }

function run(cmd, args, opts = {}) {
  const { shell = false, input = undefined, allowFail = false } = opts
  const res = spawnSync(cmd, args, { cwd: root, encoding: 'utf8', input, shell, maxBuffer: 64 * 1024 * 1024 })
  const out = `${res.stdout ?? ''}${res.stderr ?? ''}`.trim()
  if (res.status !== 0 && !allowFail) {
    if (out) console.error(out)
    fail(`${cmd} ${args.join(' ')} 失败（exit=${res.status}）\n复现：cd "${root}" && ${cmd} ${args.join(' ')}`)
  }
  return { status: res.status, out }
}

const git = (args, opts) => run('git', args, opts)
const node = (args, opts) => run(process.execPath, args, opts)

function readToken() {
  const res = spawnSync('git', ['credential', 'fill'], {
    cwd: root,
    encoding: 'utf8',
    input: 'protocol=https\nhost=github.com\n\n',
  })
  const line = (res.stdout ?? '').split(/\r?\n/u).find((l) => l.startsWith('password='))
  const token = line ? line.slice('password='.length).trim() : ''
  if (!token) fail('未能从 git credential 取到 GitHub 凭据；请先确认本机已登录 GitHub（不打印凭据）')
  return token
}

async function walkFiles(dir, acc = []) {
  let entries
  try { entries = await readdir(dir, { withFileTypes: true }) } catch { return acc }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'releases') continue
    const p = path.join(dir, entry.name)
    if (entry.isDirectory()) await walkFiles(p, acc)
    else acc.push(p)
  }
  return acc
}

if (!target || !/^\d+\.\d+\.\d+$/u.test(target)) {
  fail('用法：node scripts/release.mjs <X.Y.Z> [--dry-run] [--yes]')
}

const pkgPath = rel('package.json')
const pkgText = await readFile(pkgPath, 'utf8')
const pkg = JSON.parse(pkgText)
const previous = pkg.version
theVersion: log(`当前版本 ${previous} -> 目标版本 ${target}${dryRun ? '（dry-run：不产生任何副作用）' : ''}`)
if (previous === target) warn(`package.json 已经是 ${target}，本次不发 bump，只重跑打包与发布`)

if (!dryRun) {
  const status = git(['status', '--porcelain']).out
  if (status) fail(`工作区不干净，先提交或清理后再发布：\n${status}`)
  const branch = git(['rev-parse', '--abbrev-ref', 'HEAD']).out.trim()
  if (branch !== 'main') fail(`当前分支是 ${branch}，请切到 main 再发布`)
}

// ---- 1. bump ----
step('bump package.json')
if (previous === target) log('[skip] 版本未变化')
else if (dryRun) log(`[dry-run] 会把 package.json 的 version 改为 ${target}`)
else {
  await writeFile(pkgPath, pkgText.replace(/("version"\s*:\s*")[^"]+(")/u, `$1${target}$2`), 'utf8')
  log(`[ok] package.json -> ${target}`)
}

// ---- 2. 版本同步与校验 ----
step('同步派生版本号并校验')
if (dryRun) {
  if (previous === target) node(['scripts/sync-version.mjs', '--check'])
  else warn('[dry-run] 跳过版本校验：package.json 尚未 bump，派生常量仍是旧值')
  log('[dry-run] 实际发布时会执行 sync-version + sync-version --check')
} else {
  node(['scripts/sync-version.mjs'])
  node(['scripts/sync-version.mjs', '--check'])
  log('[ok] 版本号一致')
}

// ---- 3. 语法检查 ----
step('node --check 语法检查')
const codeFiles = [
  ...(await walkFiles(rel('lib'))),
  ...(await walkFiles(rel('scripts'))),
  ...(await walkFiles(rel('test'))),
].filter((f) => /\.(?:m?js)$/u.test(f))
for (const file of codeFiles) node(['--check', file])
log(`[ok] ${codeFiles.length} 个文件语法通过`)

// ---- 4. 三批回归 ----
step('三批回归（cn / intl / root）')
const testFiles = (await walkFiles(rel('test'))).filter((f) => f.endsWith('.test.js'))
if (testFiles.length === 0) fail('test/ 下没有找到任何 *.test.js')
node(['--test', '--test-force-exit', '--test-timeout=60000', ...testFiles])
log(`[ok] ${testFiles.length} 个测试文件通过`)

// ---- 4b. 词表与链接检查 ----
// 词表以 locales/*.json 为唯一手写来源，生成块必须一致；t() 的键必须中英都存在；
// 仓库内链接必须可达。这三条不通过就不该出包——护栏不进发布链路等于没有。
step('词表与链接检查（生成块、t() 键、仓库内链接）')
node(['scripts/build-client-locales.mjs', '--check'])
node(['scripts/check-locales.mjs'])
node(['scripts/check-links.mjs'])
log('[ok] 词表与链接检查通过')

// ---- 5. 打包 ----
const tgzName = `${pkg.name}-${target}.tgz`
const tgzPath = rel(`releases/${tgzName}`)
step('npm pack')
if (dryRun) log(`[dry-run] 会产出 releases/${tgzName}`)
else {
  await mkdir(rel('releases'), { recursive: true })
  run('npm', ['pack'], { shell: true })
  await rename(rel(tgzName), tgzPath)
  log(`[ok] releases/${tgzName}`)
}

// ---- 6. 校验值与清单 ----
step('计算 SHA-256 并更新 releases/SHA256SUMS.txt')
let localSha = ''
if (dryRun) {
  try {
    const bytes = await readFile(tgzPath)
    log(`[dry-run] 现有包 ${bytes.length} bytes sha256=${createHash('sha256').update(bytes).digest('hex')}`)
  } catch {
    log('[dry-run] 现有包不存在，跳过校验值计算')
  }
} else {
  const bytes = await readFile(tgzPath)
  const info = await stat(tgzPath)
  localSha = createHash('sha256').update(bytes).digest('hex')
  const sumsPath = rel('releases/SHA256SUMS.txt')
  let sums = ''
  try { sums = await readFile(sumsPath, 'utf8') } catch { sums = '' }
  const kept = sums.split(/\r?\n/u).filter((line) => line.trim() && !line.includes(tgzName))
  kept.push(`${localSha}  ${tgzName}`)
  await writeFile(sumsPath, `${kept.join('\n')}\n`, 'utf8')
  log(`[ok] ${tgzName} ${info.size} bytes sha256=${localSha}`)
}

// ---- 7. 提交与推送 ----
step('提交并推送 main')
if (dryRun) log(`[dry-run] 会做单次提交「release: ${target}」并推送 origin/main`)
else {
  git(['add', '-A'])
  const pending = git(['status', '--porcelain']).out
  if (pending) git(['commit', '-m', `release: ${target}`, '-m', '由 scripts/release.mjs 生成：版本同步、打包、校验值与 Release 资产一致。'])
  else warn('没有需要提交的改动（工作区已被前面步骤覆盖）')
  git(['push', 'origin', 'main'])
  log('[ok] main 已推送')
}

// ---- 8. tag（显式 lease） ----
const tag = `v${target}`
step(`打 tag ${tag} 并推送（显式 lease，不使用 -f）`)
if (dryRun) log(`[dry-run] 会把 ${tag} 指向 HEAD 并推送`)
else {
  const head = git(['rev-parse', 'HEAD']).out.trim()
  const ls = git(['ls-remote', '--tags', 'origin', `refs/tags/${tag}`], { allowFail: true })
  const remoteSha = (ls.out.split(/\r?\n/u).map((l) => l.trim()).filter(Boolean).map((l) => l.split(/\s+/u)[0])[0]) || ''
  git(['tag', '-f', tag, '-m', `release ${target}`])
  if (!remoteSha) {
    git(['push', 'origin', `refs/tags/${tag}`])
  } else if (remoteSha === head) {
    log(`[ok] 远端 ${tag} 已指向 HEAD，无需推送`)
  } else {
    git(['push', `--force-with-lease=refs/tags/${tag}:${remoteSha}`, 'origin', `refs/tags/${tag}`])
  }
  const after = (git(['ls-remote', '--tags', 'origin', `refs/tags/${tag}`], { allowFail: true }).out.split(/\r?\n/u)[0] ?? '').trim()
  log(`[info] 远端 ${tag}: ${after || '(空)'} / 本地 HEAD: ${head}`)
  if (after && !after.startsWith(head)) fail(`tag 推送后仍不同步：远端 ${after}，期望 ${head}`)
  log(`[ok] ${tag} -> ${head}`)
}

// ---- 9. Release 与资产 ----
const repoMatch = /github\.com[/:]([^/]+)\/([^/.]+)/u.exec(pkg.repository?.url ?? '')
if (!repoMatch) fail('package.json 的 repository.url 解析不出 owner/repo')
const [, owner, repo] = repoMatch

async function api(url, init = {}, token = '') {
  const res = await fetch(url, {
    ...init,
    headers: {
      accept: 'application/vnd.github+json',
      authorization: `Bearer ${token}`,
      'user-agent': 'dsh-release-script',
      'x-github-api-version': '2022-11-28',
      ...(init.headers ?? {}),
    },
  })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { json = null }
  return { status: res.status, json, text }
}

step('创建 GitHub Release 并上传资产')
if (dryRun) log(`[dry-run] 会以 CHANGELOG 的 ${target} 小节为正文创建 Release 并上传资产`)
else {
  const token = readToken()
  const body = await changelogSection(target)
  if (!body) fail(`CHANGELOG.md 中没有 ${target} 的小节，Release 正文无法生成`)
  const existing = await api(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {}, token)
  let release = existing.status === 200 ? existing.json : null
  if (!release) {
    const created = await api(`https://api.github.com/repos/${owner}/${repo}/releases`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tag_name: tag, name: tag, body, draft: false, prerelease: false }),
    }, token)
    if (created.status !== 201) fail(`创建 Release 失败：${created.status} ${created.text.slice(0, 400)}`)
    release = created.json
    log(`[ok] Release ${release.id} 已创建（正文 ${body.length} 字节）`)
  } else {
    log(`[ok] 复用已有 Release ${release.id}`)
  }

  for (const asset of release.assets ?? []) {
    if (asset.name !== tgzName) continue
    await api(`https://api.github.com/repos/${owner}/${repo}/releases/assets/${asset.id}`, { method: 'DELETE' }, token)
    log(`[ok] 删除同名旧资产 ${asset.id}`)
  }

  const bytes = await readFile(tgzPath)
  const upload = await fetch(`https://uploads.github.com/repos/${owner}/${repo}/releases/${release.id}/assets?name=${encodeURIComponent(tgzName)}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/octet-stream', 'user-agent': 'dsh-release-script' },
    body: bytes,
  })
  const uploadText = await upload.text()
  if (upload.status !== 201) fail(`上传资产失败：${upload.status} ${uploadText.slice(0, 400)}`)
  log(`[ok] 资产已上传（${bytes.length} bytes）`)
}

// ---- 10. 自校验 ----
step('自校验：以服务端 size + digest 为判定依据')
if (dryRun) {
  log('[dry-run] 跳过远端校验')
} else {
  const token = readToken()
  const detail = await api(`https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`, {}, token)
  if (detail.status !== 200) fail(`读取 Release 失败：${detail.status}`)
  const asset = (detail.json.assets ?? []).find((a) => a.name === tgzName)
  if (!asset) fail('Release 中找不到刚上传的资产')
  const bytes = await readFile(tgzPath)
  const sha = createHash('sha256').update(bytes).digest('hex')
  log(`服务端 asset: size=${asset.size} digest=${asset.digest ?? '(none)'}`)
  log(`本地包:      size=${bytes.length} sha256=${sha}`)
  if (asset.size !== bytes.length) fail('服务端资产大小与本地不一致')
  if (typeof asset.digest === 'string') {
    if (asset.digest !== `sha256:${sha}`) fail('服务端 digest 与本地 SHA-256 不一致')
    log('[ok] digest 与本地 SHA-256 完全一致')
  } else {
    warn('服务端未返回 digest，仅按大小判定（请用浏览器打开 Release 页再确认一次）')
  }

  const url = `https://github.com/${owner}/${repo}/releases/download/${tag}/${tgzName}`
  const probe = await fetch(url, { redirect: 'follow', signal: AbortSignal.timeout(20000) })
    .then((r) => ({ ok: r.ok, status: r.status }))
    .catch((e) => ({ ok: false, status: 0, error: e.message }))
  if (probe.ok) log(`[ok] 下载链接 200：${url}`)
  else {
    warn(`下载链接在本机不可达（status=${probe.status}${probe.error ? `, ${probe.error}` : ''}）：${url}`)
    warn('这只说明本机到 github.com 下载域的链路问题，不等于资产缺失；资产正确性已由上面的 digest 判定。')
  }
}

log(`\n=== done: ${tag}${dryRun ? '（dry-run，未做真实发布）' : ' 已发布'}`)
log(`安装：dsh plugin --profile desktop add "https://github.com/${owner}/${repo}/releases/download/${tag}/${tgzName}"`)
