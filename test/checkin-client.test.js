import test from 'node:test'
import assert from 'node:assert/strict'
import { cstDateString, parseGrowthHeatmap, runCnCheckin, runIntlDailyBonus } from '../lib/shared/checkin-client.js'

const jsonRes = (status, body) => ({ status, text: async () => JSON.stringify(body) })

test('cstDateString computes UTC+8 date regardless of host timezone', () => {
  // 2026-11-20T16:30:00Z is 2026-11-21 00:30:00 CST (UTC+8)
  const ts = Date.UTC(2026, 10, 20, 16, 30, 0)
  assert.equal(cstDateString(ts), '2026-11-21')
})

test('parseGrowthHeatmap handles both cells array and date-keyed map', () => {
  const r1 = parseGrowthHeatmap({ cells: [{ date: '2026-11-20', score: 0 }, { date: '2026-11-21', score: 2 }] })
  assert.deepEqual(r1, { ok: true, litDates: ['2026-11-21'] })

  const r2 = parseGrowthHeatmap({ '2026-11-20': { score: 1 }, '2026-11-21': { score: 0 } })
  assert.deepEqual(r2, { ok: true, litDates: ['2026-11-20'] })

  const r3 = parseGrowthHeatmap({})
  assert.equal(r3.ok, false)
})

test('runCnCheckin short-circuits when authoritative status says already checked in', async () => {
  const calls = []
  const fetchImpl = async (url) => {
    calls.push(url)
    return jsonRes(200, { code: 0, data: { active: true, today_checked_in: true, streak_days: 7 } })
  }
  const res = await runCnCheckin({ accessToken: 'tok', account: { uid: 'u1' }, fetchImpl })
  assert.equal(res.ok, true)
  assert.equal(res.already, true)
  assert.equal(res.streak, 7)
  assert.equal(calls.length, 1)
})

test('runCnCheckin claims when not checked in and classifies failure message on code 0', async () => {
  let step = 0
  const fetchImpl = async () => {
    step++
    if (step === 1) return jsonRes(200, { code: 0, data: { active: true, today_checked_in: false } })
    return jsonRes(200, { code: 0, msg: '签到成功', data: { credit: 30, energy: 10, streak: 3 } })
  }
  const ok = await runCnCheckin({ accessToken: 'tok', account: { uid: 'u1' }, fetchImpl })
  assert.equal(ok.ok, true)
  assert.equal(ok.already, false)
  assert.equal(ok.credit, 30)
  assert.equal(ok.streak, 3)

  // code 0 with "签到失败" must be treated as error
  const failFetch = async (url) => url.includes('status')
    ? jsonRes(200, { code: 0, data: { active: true, today_checked_in: false } })
    : jsonRes(200, { code: 0, msg: '签到失败，请稍后重试', data: {} })
  const bad = await runCnCheckin({ accessToken: 'tok', account: { uid: 'u1' }, fetchImpl: failFetch })
  assert.equal(bad.ok, false)
  assert.equal(bad.code, 'CHECKIN_FAILED')
})

test('runIntlDailyBonus checks UTC+8 heatmap and sends array beacon without knowledge fields', async () => {
  const now = Date.UTC(2026, 10, 20, 17, 0, 0) // 2026-11-21 01:00 CST
  let reportBody = null
  const fetchImpl = async (url, init) => {
    if (url.includes('/heatmap')) {
      return jsonRes(200, { code: 0, data: { cells: [{ date: '2026-11-20', score: 1 }, { date: '2026-11-21', score: 0 }] } })
    }
    if (url.includes('/v2/report')) {
      reportBody = JSON.parse(init.body)
      return jsonRes(200, { code: 0 })
    }
    if (url.includes('/streak')) {
      return jsonRes(200, { code: 0, data: { streak: { days: 5 } } })
    }
    throw new Error('unexpected url ' + url)
  }
  const res = await runIntlDailyBonus({ accessToken: 'tok', account: { uid: 'uid-123' }, fetchImpl, now })
  assert.equal(res.ok, true)
  assert.equal(res.already, false)
  assert.equal(res.streak, 5)
  assert.ok(Array.isArray(reportBody) && reportBody.length === 1)
  assert.equal(reportBody[0].userId, 'uid-123')
  assert.equal('knowledgeId' in reportBody[0], false)
  assert.equal('knowledgeName' in reportBody[0], false)
})

test('runIntlDailyBonus short-circuits when today is already lit', async () => {
  const now = Date.UTC(2026, 10, 20, 17, 0, 0) // 2026-11-21 CST
  let reportCalled = false
  const fetchImpl = async (url) => {
    if (url.includes('/heatmap')) return jsonRes(200, { code: 0, data: { cells: [{ date: '2026-11-21', score: 1 }] } })
    if (url.includes('/v2/report')) { reportCalled = true; return jsonRes(200, { code: 0 }) }
    return jsonRes(200, { code: 0, data: { streak: { days: 4 } } })
  }
  const res = await runIntlDailyBonus({ accessToken: 'tok', account: { uid: 'uid-123' }, fetchImpl, now })
  assert.equal(res.ok, true)
  assert.equal(res.already, true)
  assert.equal(reportCalled, false)
})

test('both CN and INTL /actions route whitelists accept checkin and keepalive', async () => {
  const { readFile } = await import('node:fs/promises')
  for (const region of ['cn', 'intl']) {
    const src = await readFile(new URL(`../lib/${region}/index.js`, import.meta.url), 'utf8')
    assert.ok(src.includes("'preflight', 'checkin', 'keepalive', ...QUOTA_ACTIONS"), `${region} /actions whitelist must include checkin and keepalive`)
  }
})

test('account-maintenance reads config.accountHome for isolated multi-accounts (CN & INTL)', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs')
  const { tmpdir } = await import('node:os')
  const { join } = await import('node:path')
  const { createAccountMaintenance } = await import('../lib/shared/account-maintenance.js')

  const root = mkdtempSync(join(tmpdir(), 'dsh-maint-home-'))
  try {
    const sub = process.platform === 'win32'
      ? join('AppData', 'Local', 'CodeBuddyExtension', 'Data', 'Public', 'auth')
      : join('.local', 'share', 'CodeBuddyExtension', 'Data', 'Public', 'auth')
    const homeA = join(root, 'acct-a')
    const homeB = join(root, 'acct-b')
    mkdirSync(join(homeA, sub), { recursive: true })
    mkdirSync(join(homeB, sub), { recursive: true })
    writeFileSync(join(homeA, sub, 'intl.info'), JSON.stringify({
      account: { uid: 'uid-a', nickname: 'alice@example.com' },
      auth: { accessToken: 'tok-a', refreshToken: 'ref-a', domain: 'www.codebuddy.ai', expiresAt: Date.now() + 3600_000 }
    }))
    writeFileSync(join(homeB, sub, 'intl.info'), JSON.stringify({
      account: { uid: 'uid-b', nickname: 'bob@example.com' },
      auth: { accessToken: 'tok-b', refreshToken: 'ref-b', domain: 'www.codebuddy.ai', expiresAt: Date.now() + 3600_000 }
    }))

    const seenAuth = []
    const fetchMock = async (url, init) => {
      seenAuth.push(init?.headers?.Authorization || init?.headers?.authorization || '')
      if (String(url).includes('/heatmap')) {
        const now = new Date(Date.now() + 8 * 3600_000)
        const d = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')}`
        return jsonRes(200, { code: 0, data: { cells: [{ date: d, score: 1 }] } })
      }
      return jsonRes(200, { code: 0, data: { streak: { days: 2 } } })
    }

    const maint = createAccountMaintenance({
      region: 'intl',
      quotaStore: { read: async () => null, write: async () => {} },
      getAccounts: () => ({
        snapshot: async () => ({
          defaultLogin: { present: false, code: 'CLI_CREDENTIAL_MISSING' },
          accounts: [
            { id: 'id-a', label: 'Alice', credentialsPresent: true },
            { id: 'id-b', label: 'Bob', credentialsPresent: true }
          ]
        }),
        configForId: async (base, id) => ({
          ...base,
          accountId: id,
          accountHome: id === 'id-a' ? homeA : homeB
        })
      }),
      getConfig: () => ({}),
      fetchImpl: fetchMock
    })

    const resA = await maint.checkinAccount({ accountId: 'id-a', accountHome: homeA }, { force: true })
    const resB = await maint.checkinAccount({ accountId: 'id-b', accountHome: homeB }, { force: true })
    assert.equal(resA.ok, true)
    assert.equal(resB.ok, true)
    assert.ok(seenAuth.includes('Bearer tok-a'), 'account A should use its own accountHome token')
    assert.ok(seenAuth.includes('Bearer tok-b'), 'account B should use its own accountHome token')
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('client UI keeps only bottom-right toast pop-up and formats named per-account results', async () => {
  const { readFileSync } = await import('node:fs')
  const clientSrc = readFileSync(new URL('../lib/client.js', import.meta.url), 'utf8')
  assert.ok(!clientSrc.includes("notice ? h('div', { role: 'status', 'aria-live': 'polite', style: { padding: '0 4px'"), 'duplicate top inline notice banner must be removed')
  assert.ok(clientSrc.includes("const accountDisplayName = (key) =>"), 'runMaintenance should resolve per-account display names')
  assert.ok(clientSrc.includes("setToastDismissed('')"), 'runMaintenance should reset toastDismissed so repeated clicks always pop up')
})
