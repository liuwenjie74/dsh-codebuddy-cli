import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// 三个检查脚本本身就是本批的契约：
//   --check      每个词表区块必须与 locales/*.json 完全一致（防手改生成块）
//   check-locales  t('x') 的键必须在中英双方存在，且三对词表键集合一致
//   check-links    仓库内链接必须可达
const root = fileURLToPath(new URL('..', import.meta.url))
const run = (args) => spawnSync(process.execPath, args, { cwd: root, encoding: 'utf8' })

const cases = [
  ['locale blocks are generated from locales JSON, never hand-edited', ['scripts/build-client-locales.mjs', '--check']],
  ['every t() key exists in both languages and locale pairs have identical key sets', ['scripts/check-locales.mjs']],
  ['internal document links and in-repo code links resolve', ['scripts/check-links.mjs']],
]

for (const [name, args] of cases) {
  test(name, () => {
    const result = run(args)
    assert.equal(result.status, 0, (result.stderr || '') + (result.stdout || ''))
  })
}
