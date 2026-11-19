// Quota client: device authorisation plus one billing read against the official
// WorkBuddy / CodeBuddy endpoints. Server-side only -- the client bundle must stay
// a self-contained single file, so nothing here may be imported by lib/client.js.
//
// Two rules are hard requirements, not preferences:
//   1. The access token lives in memory for the length of one call chain. It is
//      never logged, never returned to the browser and never written to disk.
//   2. Every failure is a typed, degradable result. The caller hides the quota
//      card rather than rendering zeros that look like an exhausted account.

const REGIONS = {
  cn: { chatBase: 'https://www.workbuddy.cn', billingBase: 'https://www.codebuddy.cn', productCode: 'codebuddy', platform: 'CLI' },
  intl: { chatBase: 'https://www.workbuddy.ai', billingBase: 'https://www.workbuddy.ai', productCode: 'workbuddy', platform: 'CLI' }
}

// The device-authorisation chain is the one place a client identity is required;
// it matches the official CLI login flow observed in the reference plugin.
const LOGIN_UA = 'CLI/2.63.2 CodeBuddy/2.63.2'
const BILLING_UA = 'WorkBuddy/2.63.2'
const BILLING_PATH_V2 = '/v2/billing/meter/get-user-resource'
const BILLING_PATH_PLAIN = '/billing/meter/get-user-resource'
// 11217 is the upstream "login still pending" business code; 404 is its other shape.
const PENDING_CODE = '11217'
const PENDING_TEXT = /login ing|pending|not authorized|waiting|authorizing/iu
const PRODUCT_CODE_PERSONAL = 'p_tcaca'
const REQUEST_TIMEOUT_MS = 20000

export function quotaEndpoints(region) {
  return REGIONS[region] ?? REGIONS.cn
}

function loginHeaders() {
  return {
    'X-Requested-With': 'XMLHttpRequest',
    'X-CodeBuddy-Request': '1',
    Accept: 'application/json, text/plain, */*',
    'Content-Type': 'application/json',
    'User-Agent': LOGIN_UA
  }
}

async function readJson(response) {
  let text = ''
  try { text = await response.text() } catch { text = '' }
  let body = null
  try { body = JSON.parse(text) } catch { body = null }
  return { status: Number(response?.status) || 0, body, text }
}

function failure(code, message, extra = {}) {
  return { ok: false, code, message: String(message ?? '').slice(0, 300), ...extra }
}


// The upstream token payload is not uniform: some deployments stamp the expiry as
// epoch milliseconds, some as epoch seconds, some only give a lifetime in seconds.
// A stamp that is not confidently in the future is reported as 0 ("unknown"), so the
// caller treats the token as short-lived instead of trusting a bad stamp.
function expiryOf(data, { now = Date.now() } = {}) {
  const raw = Number(data?.expiresAt ?? data?.expires_at)
  if (Number.isFinite(raw) && raw > 0) {
    const stamp = Math.round(raw < 1e12 ? raw * 1000 : raw)
    if (stamp > now) return stamp
  }
  const seconds = Number(data?.expiresIn ?? data?.expires_in)
  if (Number.isFinite(seconds) && seconds > 0 && seconds < 60 * 60 * 24 * 400) return now + Math.round(seconds * 1000)
  return 0
}

function timed(signal) {
  const hasTimeout = typeof AbortSignal?.timeout === 'function'
  if (signal && hasTimeout && typeof AbortSignal?.any === 'function') {
    return { signal: AbortSignal.any([signal, AbortSignal.timeout(REQUEST_TIMEOUT_MS)]) }
  }
  if (signal) return { signal }
  return hasTimeout ? { signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS) } : {}
}

// Step 1: ask for a pending authorisation state and the URL the user must open.
export async function requestLoginState({ region = 'cn', fetchImpl = fetch, signal } = {}) {
  const endpoints = quotaEndpoints(region)
  let response
  try {
    response = await fetchImpl(endpoints.chatBase + '/v2/plugin/auth/state?platform=' + endpoints.platform, {
      method: 'POST', headers: loginHeaders(), body: '{}', cache: 'no-store', ...timed(signal)
    })
  } catch (error) { return failure('QUOTA_NETWORK', error?.message ?? 'network error') }
  const { status, body, text } = await readJson(response)
  const data = body?.data ?? {}
  const state = typeof data.state === 'string' ? data.state.trim() : ''
  const url = String(data.url ?? data.authUrl ?? data.loginUrl ?? '').trim()
  if (status >= 400 || body?.code !== 0 || !state || !/^https:\/\//iu.test(url)) {
    return failure('QUOTA_AUTH_UNAVAILABLE', body?.msg ?? text.slice(0, 200) ?? 'login state unavailable', { status })
  }
  return { ok: true, state, url }
}

// Step 2: poll for the token. "Still waiting" is a normal outcome, not an error.
export async function exchangeLoginToken({ region = 'cn', state, fetchImpl = fetch, signal } = {}) {
  if (!state) return failure('QUOTA_STATE_MISSING', 'no pending authorisation')
  const endpoints = quotaEndpoints(region)
  let response
  try {
    response = await fetchImpl(endpoints.chatBase + '/v2/plugin/auth/token?state=' + encodeURIComponent(state), {
      method: 'GET', headers: loginHeaders(), cache: 'no-store', ...timed(signal)
    })
  } catch (error) { return failure('QUOTA_NETWORK', error?.message ?? 'network error') }
  const { status, body, text } = await readJson(response)
  const data = body?.data ?? {}
  const accessToken = typeof data.accessToken === 'string' ? data.accessToken.trim() : ''
  if (status < 400 && accessToken) {
    return { ok: true, accessToken, refreshToken: typeof data.refreshToken === 'string' ? data.refreshToken.trim() : '', expiresAt: expiryOf(data) }
  }
  const message = String(body?.msg ?? text ?? '')
  const pending = status === 404 || String(body?.code) === PENDING_CODE || PENDING_TEXT.test(message)
  return pending
    ? { ok: false, pending: true, code: 'QUOTA_PENDING', message: message.slice(0, 200) }
    : failure('QUOTA_TOKEN_FAILED', message || 'token exchange failed', { status })
}

// Re-mint an access token from a stored refresh token. A rejected refresh means the
// authorisation is gone (revoked, expired or signed out), so the caller deletes the
// stored record instead of retrying on every page open.
export async function refreshAccessToken({ region = 'cn', refreshToken, fetchImpl = fetch, signal } = {}) {
  if (!refreshToken) return failure('QUOTA_NOT_AUTHORIZED', 'no refresh token stored')
  const endpoints = quotaEndpoints(region)
  let response
  try {
    response = await fetchImpl(endpoints.chatBase + '/v2/plugin/auth/token/refresh', {
      method: 'POST',
      headers: { ...loginHeaders(), 'X-Refresh-Token': refreshToken, 'X-Auth-Refresh-Source': 'plugin' },
      cache: 'no-store', ...timed(signal)
    })
  } catch (error) { return failure('QUOTA_NETWORK', error?.message ?? 'network error') }
  const { status, body, text } = await readJson(response)
  const data = body?.data ?? {}
  // Some deployments answer with a flat payload instead of the { code, data } envelope.
  const accessToken = String(data.accessToken ?? body?.accessToken ?? '').trim()
  const rotated = String(data.refreshToken ?? body?.refreshToken ?? '').trim()
  if (status < 400 && accessToken) return { ok: true, accessToken, refreshToken: rotated, expiresAt: expiryOf(data) }
  const rejected = status === 401 || status === 403
  return failure(rejected ? 'QUOTA_REFRESH_REJECTED' : 'QUOTA_REFRESH_FAILED',
    String(body?.msg ?? text ?? 'refresh failed').slice(0, 200), { status })
}

// Step 3: read the identity behind the fresh token.
export async function fetchLoginAccount({ region = 'cn', state, accessToken, fetchImpl = fetch, signal } = {}) {
  if (!state || !accessToken) return failure('QUOTA_STATE_MISSING', 'authorisation incomplete')
  const endpoints = quotaEndpoints(region)
  let response
  try {
    response = await fetchImpl(endpoints.chatBase + '/v2/plugin/login/account?state=' + encodeURIComponent(state), {
      method: 'GET', headers: { ...loginHeaders(), Authorization: 'Bearer ' + accessToken }, cache: 'no-store', ...timed(signal)
    })
  } catch (error) { return failure('QUOTA_NETWORK', error?.message ?? 'network error') }
  const { status, body, text } = await readJson(response)
  if (status >= 400 || body?.code !== 0) return failure('QUOTA_ACCOUNT_FAILED', body?.msg ?? text.slice(0, 200), { status })
  const data = body?.data ?? {}
  return {
    ok: true,
    uid: typeof data.uid === 'string' ? data.uid.trim() : '',
    nickname: typeof data.nickname === 'string' ? data.nickname.trim().slice(0, 80) : '',
    domain: typeof data.domain === 'string' ? data.domain.trim() : '',
    enterpriseId: typeof data.enterpriseId === 'string' ? data.enterpriseId.trim() : ''
  }
}

// Step 4: one billing read. Pagination and ProductCode are mandatory: without
// them the upstream answers 200 with an empty account list (which is exactly the
// bug that made an earlier implementation report a permanent 0 / 0).
function billingBody(now = new Date()) {
  const pad = n => String(n).padStart(2, '0')
  const stamp = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
    + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds())
  return {
    PageNumber: 1,
    PageSize: 100,
    ProductCode: PRODUCT_CODE_PERSONAL,
    Status: [0, 3],
    PackageEndTimeRangeBegin: stamp(now),
    PackageEndTimeRangeEnd: stamp(new Date(now.getTime() + 365 * 101 * 24 * 3600 * 1000))
  }
}

export async function fetchBilling({ region = 'cn', accessToken, account = {}, fetchImpl = fetch, signal } = {}) {
  if (!accessToken) return failure('QUOTA_STATE_MISSING', 'no access token')
  const endpoints = quotaEndpoints(region)
  const headers = {
    Authorization: 'Bearer ' + accessToken,
    'Content-Type': 'application/json',
    Accept: 'application/json, text/plain, */*',
    'X-Requested-With': 'XMLHttpRequest',
    'X-CodeBuddy-Request': '1',
    'X-Domain': String(account.domain ?? '').trim() || endpoints.chatBase.replace(/^https:\/\//u, ''),
    'X-Product': 'SaaS',
    'X-Product-Code': endpoints.productCode,
    'User-Agent': BILLING_UA
  }
  const enterpriseId = String(account.enterpriseId ?? '').trim()
  // A missing "no enterprise" flag is itself treated as an error by some billing
  // endpoints, so personal accounts must state it explicitly.
  if (enterpriseId) { headers['X-Enterprise-Id'] = enterpriseId; headers['X-Tenant-Id'] = enterpriseId }
  else headers['X-No-Enterprise-Id'] = '1'

  const paths = region === 'intl' ? [BILLING_PATH_PLAIN, BILLING_PATH_V2] : [BILLING_PATH_V2]
  const body = JSON.stringify(billingBody())
  let last = failure('QUOTA_BILLING_UNAVAILABLE', 'billing endpoint unavailable')
  for (const path of paths) {
    let response
    try {
      response = await fetchImpl(endpoints.billingBase + path, { method: 'POST', headers, body, cache: 'no-store', ...timed(signal) })
    } catch (error) {
      last = failure('QUOTA_NETWORK', error?.message ?? 'network error')
      if (signal?.aborted) return last
      continue
    }
    const parsed = await readJson(response)
    if (parsed.status >= 200 && parsed.status < 300 && parsed.body?.code === 0) return { ok: true, body: parsed.body }
    last = failure('QUOTA_BILLING_FAILED', parsed.body?.msg ?? parsed.text.slice(0, 200), { status: parsed.status })
    // Only a 404 is worth another path; any other status means retrying cannot help.
    if (parsed.status !== 404) return last
  }
  return last
}

function accountsOf(body) {
  const candidates = [
    body?.data?.Response?.Data?.Accounts,
    body?.data?.Accounts,
    body?.Response?.Data?.Accounts
  ]
  for (const candidate of candidates) if (Array.isArray(candidate)) return candidate
  return []
}

function safeInt(value) {
  const n = Number(value)
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : 0
}

// Cycle fields win when the package is cycle-based; capacity fields are the
// fallback. This mirrors the upstream's own single source of truth.
function packageFacts(raw) {
  const cycleSize = safeInt(raw?.CycleCapacitySize)
  const remain = cycleSize > 0 ? safeInt(raw?.CycleCapacityRemain) : safeInt(raw?.CapacityRemain)
  const size = cycleSize > 0 ? cycleSize : safeInt(raw?.CapacitySize)
  let used = cycleSize > 0 ? safeInt(raw?.CycleCapacityUsed) : safeInt(raw?.CapacityUsed)
  const clampedRemain = size > 0 ? Math.max(0, Math.min(size, remain)) : Math.max(0, remain)
  if (size > 0 && used < size - clampedRemain) used = size - clampedRemain
  return { remain: clampedRemain, size, used }
}

function packageExpiry(raw) {
  const candidate = String(raw?.CycleEndTime ?? '').trim() || String(raw?.ExpiredTime ?? '').trim()
  if (!candidate) return ''
  const parsed = new Date(candidate.replace(' ', 'T'))
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString() : ''
}

// Same-name packages are merged on purpose: a signed-in account can carry dozens
// of identically named sign-in bonus packs, and one progress bar per pack would
// bury the single package that is actually being consumed.
export function normalizeQuota(body) {
  const raw = accountsOf(body)
  const merged = new Map()
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const name = String(item.PackageName ?? '').trim().slice(0, 120) || 'unnamed'
    const facts = packageFacts(item)
    const expiry = packageExpiry(item)
    const entry = merged.get(name) || { name, remain: 0, total: 0, used: 0, expireAt: '', count: 0 }
    entry.remain += facts.remain
    entry.total += facts.size
    entry.used += facts.used
    entry.count += 1
    if (expiry && (!entry.expireAt || expiry < entry.expireAt)) entry.expireAt = expiry
    merged.set(name, entry)
  }
  const packages = [...merged.values()].sort((a, b) => {
    if (a.expireAt && b.expireAt) return a.expireAt < b.expireAt ? -1 : a.expireAt > b.expireAt ? 1 : 0
    if (a.expireAt) return -1
    if (b.expireAt) return 1
    return b.total - a.total
  })
  const totals = packages.reduce((sum, item) => ({ remain: sum.remain + item.remain, total: sum.total + item.total, used: sum.used + item.used }), { remain: 0, total: 0, used: 0 })
  return {
    packages,
    remain: totals.remain,
    total: totals.total,
    used: totals.used,
    // Deliberately ignored: the upstream TotalDosage is a different quantity from
    // the sum of package sizes, so using it as "total" would print a wrong number.
    emptyAccounts: raw.length === 0,
    fetchedAt: Date.now()
  }
}

// One full read for a stored refresh token: mint an access token, read identity,
// read billing, normalise. Nothing here touches disk.
export async function readQuota({ region = 'cn', accessToken, account = {}, fetchImpl = fetch, signal } = {}) {
  const billing = await fetchBilling({ region, accessToken, account, fetchImpl, signal })
  if (!billing.ok) return billing
  return { ok: true, ...normalizeQuota(billing.body) }
}
