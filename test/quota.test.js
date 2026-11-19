import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { normalizeQuota, fetchBilling, refreshAccessToken, exchangeLoginToken } from '../lib/shared/quota-client.js'
import { createQuotaStore } from '../lib/shared/quota-store.js'

// A minimal envelope shaped like the upstream billing response.
const envelope = accounts => ({ code: 0, data: { Response: { Data: { TotalCount: accounts.length, TotalDosage: 4936, Accounts: accounts } } } })

const pack = (name, size, remain, used, cycleEnd = '', extra = {}) => ({
  PackageName: name, CapacitySize: size, CapacityRemain: remain, CapacityUsed: used,
  CycleCapacitySize: size, CycleCapacityRemain: remain, CycleCapacityUsed: used,
  CycleEndTime: cycleEnd, ...extra
})

test('same-name sign-in packages are merged instead of stacking progress bars', () => {
  // A signed-in account can carry dozens of identical bonus packs; one bar each would
  // bury the single package that is actually being consumed.
  const quota = normalizeQuota(envelope([
    pack('裂变包', 100, 100, 0, '2026-11-21 09:09:43'),
    pack('裂变包', 100, 100, 0, '2026-11-22 09:11:56'),
    pack('裂变包', 300, 28, 272, '2026-11-20 17:26:08'),
    pack('体验版', 500, 500, 0, '2026-11-30 23:59:59')
  ]))
  assert.equal(quota.packages.length, 2)
  const merged = quota.packages.find(item => item.name === '裂变包')
  assert.equal(merged.count, 3)
  assert.equal(merged.total, 500)
  assert.equal(merged.remain, 228)
  assert.equal(merged.used, 272)
  // The earliest cycle end wins, so the package that expires first is listed first.
  assert.equal(quota.packages[0].name, '裂变包')
  assert.equal(quota.remain, 728)
  assert.equal(quota.total, 1000)
})

test('cycle fields win over capacity fields, which are only a fallback', () => {
  const quota = normalizeQuota(envelope([{
    PackageName: 'cycle', CapacitySize: 999, CapacityRemain: 999, CapacityUsed: 0,
    CycleCapacitySize: 100, CycleCapacityRemain: 40, CycleCapacityUsed: 60, CycleEndTime: ''
  }]))
  assert.equal(quota.total, 100)
  assert.equal(quota.remain, 40)
  assert.equal(quota.used, 60)
})

test('a used figure larger than the remainder is reconciled, never negative', () => {
  const quota = normalizeQuota(envelope([{
    PackageName: 'odd', CycleCapacitySize: 100, CycleCapacityRemain: 200, CycleCapacityUsed: 0
  }]))
  assert.equal(quota.remain, 100)
  assert.ok(quota.used >= 0)
})

test('an empty account list is reported as empty rather than as zero credits', () => {
  // Enterprise accounts answer HTTP 200 with an empty list; printing 0 / 0 would read
  // as an exhausted account, so the caller needs this flag to say something honest.
  const quota = normalizeQuota(envelope([]))
  assert.equal(quota.emptyAccounts, true)
  assert.equal(quota.packages.length, 0)
  assert.equal(quota.total, 0)
})

test('TotalDosage never becomes the total', () => {
  const quota = normalizeQuota(envelope([pack('a', 100, 100, 0)]))
  // The envelope carries TotalDosage: 4936, which is a different quantity entirely.
  assert.equal(quota.total, 100)
})

test('a billing read retries the plain path only on 404, and never on other statuses', async () => {
  const seen = []
  const fakeFetch = async url => {
    seen.push(url)
    return { status: 404, text: async () => '{"code":404}' }
  }
  const result = await fetchBilling({ region: 'intl', accessToken: 'token', account: {}, fetchImpl: fakeFetch })
  assert.equal(result.ok, false)
  assert.equal(seen.length, 2, 'global tries the plain path first, then /v2')

  const localSeen = []
  const rejected = await fetchBilling({
    region: 'cn', accessToken: 'token', account: {},
    fetchImpl: async url => { localSeen.push(url); return { status: 403, text: async () => '{"code":11140,"msg":"request illegal"}' } }
  })
  assert.equal(rejected.ok, false)
  assert.equal(rejected.code, 'QUOTA_BILLING_FAILED')
  assert.equal(localSeen.length, 1, 'a non-404 status must not trigger another path')
})

test('a rejected refresh is reported so the caller can erase the stored credential', async () => {
  const refreshed = await refreshAccessToken({
    region: 'cn', refreshToken: 'stale',
    fetchImpl: async () => ({ status: 401, text: async () => '{"code":401,"msg":"expired"}' })
  })
  assert.equal(refreshed.ok, false)
  assert.equal(refreshed.code, 'QUOTA_REFRESH_REJECTED')
})

test('a pending authorisation stays pending instead of failing', async () => {
  const pending = await exchangeLoginToken({
    region: 'cn', state: 's1',
    fetchImpl: async () => ({ status: 404, text: async () => '{"code":11217,"msg":"login ing"}' })
  })
  assert.equal(pending.ok, false)
  assert.equal(pending.pending, true)
})

test('the quota store persists only the refresh token and metadata', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'quota-store-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const store = createQuotaStore({ directory })

  assert.equal(await store.read('legacy'), null)
  await store.write('legacy', { refreshToken: 'refresh-abc', uid: 'uid-1', domain: 'www.workbuddy.cn', savedAt: 1 })
  const record = await store.read('legacy')
  assert.equal(record.refreshToken, 'refresh-abc')
  assert.equal(record.uid, 'uid-1')

  // describe() must not hand the token back to a caller.
  const described = await store.describe('legacy')
  assert.deepEqual(Object.keys(described).sort(), ['authorized', 'domain', 'nickname', 'savedAt', 'source', 'uid'])

  // A record either carries a device refresh token or declares itself a CLI-login
  // note with no token at all; anything else is refused rather than half-stored.
  await assert.rejects(store.write('mixed', { source: 'device', uid: 'uid-2', savedAt: 2 }), e => e.message === 'QUOTA_STORE_INVALID')

  const files = await readdir(directory)
  assert.deepEqual(files, ['legacy.json'])
  const raw = await readFile(path.join(directory, 'legacy.json'), 'utf8')
  assert.ok(raw.includes('refresh-abc'))

  // A device grant now also keeps the access token it was issued with, together with
  // that token's expiry: reusing it while valid is what stops the row from asking for
  // a new browser authorisation on every page open. The file stays owner-only, and
  // describe() still never hands either token back.
  const expiresAt = Date.now() + 24 * 3600 * 1000
  await store.write('legacy', { source: 'device', refreshToken: 'refresh-abc', accessToken: 'access-def', expiresAt, uid: 'uid-1', domain: 'www.workbuddy.cn', savedAt: 1 })
  const withToken = await store.read('legacy')
  assert.equal(withToken.accessToken, 'access-def')
  assert.equal(withToken.expiresAt, expiresAt)
  const described2 = await store.describe('legacy')
  assert.equal(Object.prototype.hasOwnProperty.call(described2, 'accessToken'), false, 'describe() never returns a token')

  // A CLI-login binding is metadata only: it must not grow a token field.
  await store.write('cli', { source: 'cli', uid: 'uid-3', nickname: 'N', domain: 'www.codebuddy.cn', savedAt: 3 })
  assert.equal((await store.read('cli')).refreshToken, '', 'a CLI binding must store no token')
  await assert.rejects(store.write('cli2', { source: 'cli', accessToken: 'nope', uid: 'uid-3', savedAt: 3 }), e => e.message === 'QUOTA_STORE_INVALID')
  assert.equal((await store.describe('cli')).source, 'cli')

  await store.clear('legacy')
  assert.equal(await store.read('legacy'), null)
})

test('an unusable store record is ignored rather than trusted', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'quota-store-bad-'))
  t.after(() => rm(directory, { recursive: true, force: true }))
  const store = createQuotaStore({ directory })
  await assert.rejects(() => store.write('legacy', { uid: 'no-token' }))
})
