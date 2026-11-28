import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { collectStructuredResult as collectIntl } from '../lib/intl/cli-response.js'
import { collectStructuredResult as collectCn } from '../lib/cn/cli-response.js'
import { probeRegionConnectivity } from '../lib/shared/net.js'
import { createUsageStore } from '../lib/shared/usage-store.js'

test('CLI 2.185.0 result frame with 502 Socket is closed in errors/errors_info maps to CLI_NETWORK_ERROR in both regions', () => {
  const frame = JSON.stringify({
    type: 'result',
    subtype: 'error_during_execution',
    is_error: true,
    errors: ['502 Socket is closed (target: https://www.codebuddy.ai) (req/sess)'],
    errors_info: [{ status: 502, code: 502, category: 'network', details: '502 Socket is closed (target: https://www.codebuddy.ai)' }]
  })
  assert.throws(() => collectIntl(frame), (err) => err.code === 'CLI_NETWORK_ERROR' && err.responseDiagnostics?.noticeClass === 'network')
  assert.throws(() => collectCn(frame), (err) => err.code === 'CLI_NETWORK_ERROR' && err.responseDiagnostics?.noticeClass === 'network')
})

test('probeRegionConnectivity reports ok, timeout, and network failure cleanly', async () => {
  const ok = await probeRegionConnectivity({
    region: 'intl',
    fetchImpl: async (url, init) => {
      assert.equal(url, 'https://www.codebuddy.ai')
      assert.equal(init.method, 'HEAD')
      return { status: 200 }
    }
  })
  assert.equal(ok.ok, true)
  assert.equal(ok.status, 200)
  assert.equal(ok.target, 'https://www.codebuddy.ai')

  const failed = await probeRegionConnectivity({
    region: 'cn',
    fetchImpl: async () => {
      const err = new Error('fetch failed')
      err.cause = { code: 'ECONNREFUSED' }
      throw err
    }
  })
  assert.equal(failed.ok, false)
  assert.equal(failed.code, 'PROBE_FAILED')
  assert.equal(failed.target, 'https://www.codebuddy.cn')
  assert.match(failed.message, /ECONNREFUSED/u)

  const timedOut = await probeRegionConnectivity({
    region: 'intl',
    timeoutMs: 1000,
    fetchImpl: async (_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => {
        const err = new Error('aborted')
        err.name = 'AbortError'
        reject(err)
      }, { once: true })
    })
  })
  assert.equal(timedOut.ok, false)
  assert.equal(timedOut.code, 'PROBE_TIMEOUT')
})

test('usage-store excludes cancelled calls from failures breakdown and bucket errorCalls', async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), 'dsh-usage-v2202-'))
  t.after(async () => { await rm(dir, { recursive: true, force: true }) })
  const store = createUsageStore({ region: 'intl', directory: dir })
  await store.ready
  const now = Date.now()
  store.record({ id: 'c1', at: now, model: 'deepseek-v4.1-flash', state: 'error', errorCode: 'ABORTED', controlClass: 'cancelled', durationMs: 3500 })
  store.record({ id: 'e1', at: now + 10, model: 'deepseek-v4.1-flash', state: 'error', errorCode: 'CLI_NETWORK_ERROR', durationMs: 5000 })
  const q = store.query({ range: 'today', now: now + 100 })
  assert.equal(q.totals.calls, 2)
  assert.equal(q.totals.cancelledCalls, 1)
  assert.equal(q.totals.errorCalls, 1)
  assert.deepEqual(q.failures, [{ errorCode: 'CLI_NETWORK_ERROR', count: 1 }])
  const totalBucketErrors = q.buckets.reduce((sum, b) => sum + b.errorCalls, 0)
  assert.equal(totalBucketErrors, 1)
})

test('both regions expose probeNetwork, intl resolveModel omits blocking assertReady, and client consumes accountError', async () => {
  const cnSrc = await readFile('lib/cn/index.js', 'utf8')
  const intlSrc = await readFile('lib/intl/index.js', 'utf8')
  const clientSrc = await readFile('lib/client.js', 'utf8')
  assert.match(cnSrc, /'probeNetwork'/u)
  assert.match(intlSrc, /'probeNetwork'/u)
  const resolveMatch = intlSrc.match(/async resolveModel\([\s\S]*?\n  \}/u)
  assert.ok(resolveMatch, 'resolveModel should exist in lib/intl/index.js')
  assert.equal(resolveMatch[0].includes('assertReady'), false)
  assert.match(clientSrc, /probeNetwork/u)
  assert.match(clientSrc, /status\?\.accountError/u)
})
