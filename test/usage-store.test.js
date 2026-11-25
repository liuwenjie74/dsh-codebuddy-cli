import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createUsageStore } from '../lib/shared/usage-store.js'

test('usage-store persists records across reloads and queries today / 24h / 7d / 30d / custom / model', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-usage-store-'))
  try {
    const now = new Date(2026, 10, 24, 15, 30, 0).getTime() // 2026-11-24 15:30 local
    const hour = 3600 * 1000
    const day = 24 * hour

    const store1 = createUsageStore({ directory: dir })
    await store1.ready

    // Today (2 calls: 1 ok, 1 error)
    store1.record({
      id: 'c1', at: now - 2 * hour, model: 'deepseek-v4.1-flash', accountId: 'a1',
      state: 'ok', durationMs: 1200, uncachedInputTokens: 500, cacheReadTokens: 1500, cacheWriteTokens: 0, outputTokens: 300, toolCalls: 1
    })
    store1.record({
      id: 'c2', at: now - 1 * hour, model: 'claude-sonnet-4', accountId: 'a1',
      state: 'error', errorCode: 'CLI_TIMEOUT', durationMs: 300000, uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0
    })
    // 20 hours ago (yesterday evening, within 24h but NOT today)
    store1.record({
      id: 'c3', at: now - 20 * hour, model: 'deepseek-v4.1-flash', accountId: 'a1',
      state: 'ok', durationMs: 800, uncachedInputTokens: 200, cacheReadTokens: 800, cacheWriteTokens: 0, outputTokens: 100
    })
    // 5 days ago (within 7d)
    store1.record({
      id: 'c4', at: now - 5 * day, model: 'gpt-5', accountId: 'a2',
      state: 'ok', durationMs: 2500, uncachedInputTokens: 1000, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 500
    })
    // 20 days ago (within 30d, outside 7d)
    store1.record({
      id: 'c5', at: now - 20 * day, model: 'deepseek-v4.1-flash', accountId: 'a1',
      state: 'ok', durationMs: 900, uncachedInputTokens: 300, cacheReadTokens: 700, cacheWriteTokens: 0, outputTokens: 150
    })
    await store1.flush()

    // Reload into a fresh store instance (simulates DSH restart)
    const store2 = createUsageStore({ directory: dir })
    await store2.ready
    assert.equal(store2.size, 5)

    // 1. today
    const qToday = store2.query({ range: 'today', now })
    assert.equal(qToday.bucketUnit, 'hour')
    assert.equal(qToday.totals.calls, 2)
    assert.equal(qToday.totals.okCalls, 1)
    assert.equal(qToday.totals.errorCalls, 1)
    assert.equal(qToday.totals.inputTokens, 2000)
    assert.equal(qToday.totals.cacheReadTokens, 1500)
    assert.equal(qToday.totals.outputTokens, 300)
    assert.equal(qToday.failures.length, 1)
    assert.equal(qToday.failures[0].errorCode, 'CLI_TIMEOUT')

    // 2. 24h (includes c1, c2, c3)
    const q24h = store2.query({ range: '24h', now })
    assert.equal(q24h.bucketUnit, 'hour')
    assert.equal(q24h.totals.calls, 3)

    // 3. 7d (includes c1, c2, c3, c4)
    const q7d = store2.query({ range: '7d', now })
    assert.equal(q7d.bucketUnit, 'day')
    assert.equal(q7d.totals.calls, 4)

    // 4. 30d (includes all 5)
    const q30d = store2.query({ range: '30d', now })
    assert.equal(q30d.bucketUnit, 'day')
    assert.equal(q30d.totals.calls, 5)
    assert.deepEqual(q30d.availableModels.slice().sort(), ['claude-sonnet-4', 'deepseek-v4.1-flash', 'gpt-5'])

    // 5. custom date range (only 2026-11-18 ~ 2026-11-20 -> c4)
    const qCustom = store2.query({ range: 'custom', from: '2026-11-18', to: '2026-11-20', now })
    assert.equal(qCustom.totals.calls, 1)
    assert.equal(qCustom.perModel[0].model, 'gpt-5')

    // 6. model filter on 30d
    const qModel = store2.query({ range: '30d', model: 'deepseek-v4.1-flash', now })
    assert.equal(qModel.totals.calls, 3)
    assert.equal(qModel.perModel.length, 1)
    assert.equal(qModel.perModel[0].model, 'deepseek-v4.1-flash')
    assert.equal(qModel.totals.inputTokens, 2000 + 1000 + 1000)
    assert.equal(qModel.totals.outputTokens, 300 + 100 + 150)
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('usage-store prunes expired records beyond retentionMs', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-usage-prune-'))
  try {
    const now = Date.now()
    const store = createUsageStore({ directory: dir, retentionMs: 10 * 24 * 3600 * 1000 })
    await store.ready
    store.record({ id: 'old', at: now - 20 * 24 * 3600 * 1000, model: 'm1', state: 'ok', inputTokens: 10, outputTokens: 5 })
    store.record({ id: 'fresh', at: now - 1000, model: 'm1', state: 'ok', inputTokens: 20, outputTokens: 10 })
    await store.flush()
    const q = store.query({ range: 'all', now })
    assert.equal(q.totals.calls, 1)
    assert.equal(q.recentCalls[0].id, 'fresh')
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('intl image stream accepts duplicate system/init before result and both regions wire /usage route', () => {
  const intlImg = readFileSync(new URL('../lib/intl/cli-image-process.js', import.meta.url), 'utf8')
  assert.ok(!intlImg.includes("invalidFrame('duplicate-init')"), 'intl image stream must not reject duplicate system/init before result')
  assert.ok(intlImg.includes("invalidFrame('post-result-sequence')"), 'intl image stream must still reject init after result')

  for (const region of ['cn', 'intl']) {
    const idx = readFileSync(new URL(`../lib/${region}/index.js`, import.meta.url), 'utf8')
    assert.ok(idx.includes(`const USAGE_PATH = '/plugins/dsh-codebuddy-cli-${region}/usage'`), `${region} must define USAGE_PATH`)
    assert.ok(idx.includes('currentUsageStore?.record(runtimeStatus.lastCall)'), `${region} must record calls to usageStore`)
  }

  const client = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.ok(client.includes("value: 'custom'"), 'client UI must expose custom date range option')
  assert.ok(client.includes("type: 'date'"), 'client UI must render date inputs for custom range')
  assert.ok(client.includes("usageModel"), 'client UI must expose model filter state')
})
