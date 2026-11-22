// Per-region account maintenance orchestrator:
//   - Manual & scheduled daily check-in (CN daily-checkin / INTL daily bonus beacon)
//   - Manual & scheduled token keepalive (device grant + opt-in atomic CLI .info refresh)
//
// Guarantees:
//   - Single-flight per account key (no concurrent duplicate check-ins or refreshes)
//   - Serial multi-account execution with 1050ms gap to respect upstream rate limits
//   - UTC+8 natural-day idempotency
//   - Active-call avoidance before touching CLI .info files
//   - Clean timer & AbortSignal teardown via caller's signal
import { inspectCliCredential, refreshCliCredentialFile } from './cli-credentials.js'
import { refreshAccessToken } from './quota-client.js'
import { cstDateString, cstHour, runRegionCheckin } from './checkin-client.js'

const SCHEDULER_TICK_MS = 15 * 60 * 1000
const REPORT_GAP_MS = 1050
const EXPIRY_SKEW_MS = 60 * 1000
const CN_CHECKIN_HOURS = new Set([9, 21])
const INTL_CHECKIN_HOURS = new Set([8, 12, 16, 20])
const KEEPALIVE_HOUR = 22

function sleep(ms, signal) {
  return new Promise((resolve) => {
    if (signal?.aborted) return resolve(false)
    const timer = setTimeout(() => { cleanup(); resolve(true) }, ms)
    const onAbort = () => { clearTimeout(timer); cleanup(); resolve(false) }
    const cleanup = () => { signal?.removeEventListener('abort', onAbort) }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

export function createAccountMaintenance({
  region = 'cn',
  quotaStore,
  getAccounts,
  getConfig,
  getActiveCalls = () => 0,
  fetchImpl = fetch
} = {}) {
  const checkinByKey = new Map()
  const keepaliveByKey = new Map()
  const inFlightCheckin = new Map()
  const inFlightKeepalive = new Map()

  const keyOf = (config) => config?.accountId || 'legacy'

  async function resolveTokenForCheckin(config, signal) {
    const key = keyOf(config)
    const cli = await inspectCliCredential({
      home: config?.homeDir || '',
      region,
      localOnly: !config?.accountId
    })
    if (cli.present && !cli.code && cli.accessToken) {
      return {
        ok: true,
        source: 'cli',
        accessToken: cli.accessToken,
        account: { uid: cli.uid, nickname: cli.nickname, domain: cli.domain }
      }
    }
    const stored = await quotaStore.read(key)
    if (!stored || !stored.refreshToken) {
      return { ok: false, code: cli.code || 'CHECKIN_NO_TOKEN', message: '未找到可用的登录凭据。' }
    }
    const now = Date.now()
    if (stored.accessToken && stored.expiresAt > now + EXPIRY_SKEW_MS) {
      return {
        ok: true,
        source: 'device',
        accessToken: stored.accessToken,
        account: { uid: stored.uid || cli.uid || '', nickname: stored.nickname || cli.nickname || '', domain: stored.domain || cli.domain || '' }
      }
    }
    const minted = await refreshAccessToken({ region, refreshToken: stored.refreshToken, fetchImpl, signal })
    if (!minted.ok) return { ok: false, code: minted.code || 'CHECKIN_UNAUTHORIZED', message: minted.message || '令牌刷新失败。' }
    await quotaStore.write(key, {
      ...stored,
      accessToken: minted.accessToken,
      refreshToken: minted.refreshToken || stored.refreshToken,
      expiresAt: minted.expiresAt || stored.expiresAt || 0,
      savedAt: now
    })
    return {
      ok: true,
      source: 'device',
      accessToken: minted.accessToken,
      account: { uid: stored.uid || cli.uid || '', nickname: stored.nickname || cli.nickname || '', domain: stored.domain || cli.domain || '' }
    }
  }

  async function checkinAccount(config, { force = false, signal } = {}) {
    const key = keyOf(config)
    const today = cstDateString()
    const cached = checkinByKey.get(key)
    if (!force && cached && cached.date === today && cached.ok && !cached.notRecorded) {
      return { ok: true, checkin: cached }
    }
    const pending = inFlightCheckin.get(key)
    if (pending) return pending

    const work = (async () => {
      const resolved = await resolveTokenForCheckin(config, signal)
      if (!resolved.ok) {
        const record = { at: Date.now(), date: today, ok: false, already: false, notRecorded: false, credit: 0, energy: 0, streak: cached?.streak || 0, code: resolved.code, message: resolved.message }
        checkinByKey.set(key, record)
        return { ok: false, code: resolved.code, message: resolved.message, checkin: record }
      }
      const res = await runRegionCheckin({
        region,
        accessToken: resolved.accessToken,
        account: resolved.account,
        fetchImpl,
        signal
      })
      const record = res.ok
        ? {
            at: Date.now(),
            date: res.date || today,
            ok: true,
            already: res.already === true,
            notRecorded: res.notRecorded === true,
            credit: Number(res.credit) || 0,
            energy: Number(res.energy) || 0,
            streak: Number(res.streak) || (cached?.streak || 0),
            code: '',
            message: res.message || ''
          }
        : {
            at: Date.now(),
            date: today,
            ok: false,
            already: false,
            notRecorded: false,
            credit: 0,
            energy: 0,
            streak: cached?.streak || 0,
            code: res.code || 'CHECKIN_FAILED',
            message: res.message || '签到失败'
          }
      checkinByKey.set(key, record)
      return res.ok ? { ok: true, checkin: record } : { ok: false, code: record.code, message: record.message, checkin: record }
    })().finally(() => {
      if (inFlightCheckin.get(key) === work) inFlightCheckin.delete(key)
    })

    inFlightCheckin.set(key, work)
    return work
  }

  async function keepaliveAccount(config, { allowCliRefresh = false, signal } = {}) {
    const key = keyOf(config)
    const today = cstDateString()
    const pending = inFlightKeepalive.get(key)
    if (pending) return pending

    const work = (async () => {
      let didAny = false
      let lastResult = null

      // 1. Refresh plugin-owned device grant in quota-store if present
      const stored = await quotaStore.read(key)
      if (stored && stored.refreshToken) {
        didAny = true
        const minted = await refreshAccessToken({ region, refreshToken: stored.refreshToken, fetchImpl, signal })
        if (minted.ok) {
          await quotaStore.write(key, {
            ...stored,
            accessToken: minted.accessToken,
            refreshToken: minted.refreshToken || stored.refreshToken,
            expiresAt: minted.expiresAt || stored.expiresAt || 0,
            savedAt: Date.now()
          })
          lastResult = { at: Date.now(), date: today, ok: true, source: 'device', skipped: false, deferred: false, rotated: Boolean(minted.refreshToken && minted.refreshToken !== stored.refreshToken), expiresAt: minted.expiresAt || 0, code: '', message: '设备授权令牌已续期' }
        } else {
          lastResult = { at: Date.now(), date: today, ok: false, source: 'device', skipped: false, deferred: false, rotated: false, expiresAt: 0, code: minted.code || 'KEEPALIVE_FAILED', message: minted.message || '设备授权续期失败' }
        }
      }

      // 2. Opt-in atomic refresh of plaintext CLI .info credential
      if (allowCliRefresh) {
        if (Number(getActiveCalls()) > 0) {
          const deferred = { at: Date.now(), date: today, ok: true, source: 'cli', skipped: false, deferred: true, rotated: false, expiresAt: 0, code: '', message: '当前有活跃调用，已顺延 CLI 凭据续期' }
          keepaliveByKey.set(key, deferred)
          return { ok: true, keepalive: deferred }
        }
        didAny = true
        const cliRes = await refreshCliCredentialFile({
          home: config?.homeDir || '',
          region,
          localOnly: !config?.accountId,
          refreshFn: ({ region: r, refreshToken }) => refreshAccessToken({ region: r, refreshToken, fetchImpl, signal })
        })
        if (cliRes.ok) {
          lastResult = {
            at: Date.now(),
            date: today,
            ok: true,
            source: 'cli',
            skipped: cliRes.skipped === true,
            deferred: false,
            rotated: cliRes.rotated === true,
            expiresAt: cliRes.expiresAt || 0,
            code: '',
            message: cliRes.skipped ? 'CLI 已自行更新凭据，跳过写回' : 'CLI 明文凭据已续期并写回'
          }
        } else if (!lastResult || !lastResult.ok) {
          lastResult = {
            at: Date.now(),
            date: today,
            ok: false,
            source: 'cli',
            skipped: false,
            deferred: false,
            rotated: false,
            expiresAt: 0,
            code: cliRes.code || 'KEEPALIVE_FAILED',
            message: cliRes.message || 'CLI 凭据不可续期或已加密'
          }
        }
      }

      if (!didAny) {
        const none = { at: Date.now(), date: today, ok: false, source: 'none', skipped: true, deferred: false, rotated: false, expiresAt: 0, code: 'KEEPALIVE_NO_SOURCE', message: '未找到可续期的设备授权或已开启写回的明文 CLI 凭据' }
        keepaliveByKey.set(key, none)
        return { ok: false, code: none.code, message: none.message, keepalive: none }
      }

      keepaliveByKey.set(key, lastResult)
      return lastResult.ok ? { ok: true, keepalive: lastResult } : { ok: false, code: lastResult.code, message: lastResult.message, keepalive: lastResult }
    })().finally(() => {
      if (inFlightKeepalive.get(key) === work) inFlightKeepalive.delete(key)
    })

    inFlightKeepalive.set(key, work)
    return work
  }

  async function listTargetConfigs(baseConfig) {
    const accounts = getAccounts()
    const snap = await accounts.snapshot()
    const targets = []
    if (region !== 'intl' && snap?.defaultLogin?.present && snap.defaultLogin.code === '') {
      try { targets.push(await accounts.configForId(baseConfig, null)) } catch { /* ignore */ }
    }
    for (const row of (snap?.accounts ?? [])) {
      if (row.credentialsPresent === true) {
        try { targets.push(await accounts.configForId(baseConfig, row.id)) } catch { /* ignore */ }
      }
    }
    return targets
  }

  async function checkinAll(baseConfig, { force = false, signal } = {}) {
    const targets = await listTargetConfigs(baseConfig)
    const results = {}
    let first = true
    for (const cfg of targets) {
      if (signal?.aborted) break
      if (!first) await sleep(REPORT_GAP_MS, signal)
      first = false
      results[keyOf(cfg)] = await checkinAccount(cfg, { force, signal })
    }
    if (targets.length === 0) return { ok: false, code: 'CHECKIN_NO_TOKEN', message: '当前没有已登录的账号可执行签到', results }
    return { ok: Object.values(results).some((r) => r.ok), results }
  }

  async function keepaliveAll(baseConfig, { allowCliRefresh = false, signal } = {}) {
    const targets = await listTargetConfigs(baseConfig)
    const results = {}
    let first = true
    for (const cfg of targets) {
      if (signal?.aborted) break
      if (!first) await sleep(REPORT_GAP_MS, signal)
      first = false
      results[keyOf(cfg)] = await keepaliveAccount(cfg, { allowCliRefresh, signal })
    }
    if (targets.length === 0) return { ok: false, code: 'KEEPALIVE_NO_SOURCE', message: '当前没有已登录的账号可执行续期', results }
    return { ok: Object.values(results).some((r) => r.ok), results }
  }

  function startScheduler(signal) {
    const tick = async () => {
      if (signal?.aborted) return
      const cfg = getConfig()
      if (!cfg) return
      const now = Date.now()
      const hour = cstHour(now)
      const today = cstDateString(now)
      const checkinHours = region === 'intl' ? INTL_CHECKIN_HOURS : CN_CHECKIN_HOURS
      if (cfg.autoCheckin === true && checkinHours.has(hour)) {
        await checkinAll(cfg, { force: false, signal }).catch(() => {})
      }
      if (cfg.autoTokenKeepalive === true && hour === KEEPALIVE_HOUR) {
        const targets = await listTargetConfigs(cfg).catch(() => [])
        for (const tCfg of targets) {
          if (signal?.aborted) break
          const last = keepaliveByKey.get(keyOf(tCfg))
          if (last && last.date === today && last.ok && !last.deferred) continue
          await keepaliveAccount(tCfg, { allowCliRefresh: cfg.allowCliCredentialRefresh === true, signal }).catch(() => {})
          await sleep(REPORT_GAP_MS, signal)
        }
      }
    }
    const timer = setInterval(() => { tick().catch(() => {}) }, SCHEDULER_TICK_MS)
    if (typeof timer.unref === 'function') timer.unref()
    signal?.addEventListener('abort', () => clearInterval(timer), { once: true })
    return () => clearInterval(timer)
  }

  function snapshot() {
    return {
      checkin: Object.fromEntries(checkinByKey),
      keepalive: Object.fromEntries(keepaliveByKey)
    }
  }

  return { checkinAccount, checkinAll, keepaliveAccount, keepaliveAll, startScheduler, snapshot }
}
