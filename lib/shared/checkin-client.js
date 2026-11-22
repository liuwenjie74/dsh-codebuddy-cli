// Daily check-in (CN) and daily active bonus beacon (INTL) against the official
// WorkBuddy / CodeBuddy endpoints. Server-side only, zero disk IO, zero external
// dependencies.
//
// Region contract:
//   - CN:   POST /v2/billing/meter/checkin-activity-status (pre-check)
//           POST /v2/billing/meter/daily-checkin           (claim)
//   - INTL: GET  /activity/growth/heatmap                  (UTC+8 idempotency)
//           POST /v2/report                                (single array event, no retry)
import { quotaEndpoints } from './quota-client.js'

const BILLING_UA = 'WorkBuddy/2.63.2'
const CHECKIN_STATUS_PATH = '/v2/billing/meter/checkin-activity-status'
const DAILY_CHECKIN_PATH_V2 = '/v2/billing/meter/daily-checkin'
const HEATMAP_PATH = '/activity/growth/heatmap'
const STREAK_PATH = '/activity/growth/streak'
const REPORT_PATH = '/v2/report'
const REQUEST_TIMEOUT_MS = 20000
const CST_OFFSET_MS = 8 * 3600 * 1000

const DEFAULT_REPORT_MODEL_ID = 'deepseek-v4-flash'
const DEFAULT_REPORT_MODEL_NAME = 'DeepSeek V4 Flash'

export function cstDateString(now = Date.now()) {
  const d = new Date(now + CST_OFFSET_MS)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, '0')
  const day = String(d.getUTCDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function cstHour(now = Date.now()) {
  return new Date(now + CST_OFFSET_MS).getUTCHours()
}

function timed(signal) {
  const timeout = typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
    ? AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    : undefined
  if (signal && timeout && typeof AbortSignal.any === 'function') return { signal: AbortSignal.any([signal, timeout]) }
  return signal ? { signal } : timeout ? { signal: timeout } : {}
}

function buildBillingHeaders(region, accessToken, account = {}) {
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
  const uid = String(account.uid ?? '').trim()
  if (uid) headers['X-User-Id'] = uid
  const enterpriseId = String(account.enterpriseId ?? '').trim()
  if (enterpriseId) {
    headers['X-Enterprise-Id'] = enterpriseId
    headers['X-Tenant-Id'] = enterpriseId
  } else {
    headers['X-No-Enterprise-Id'] = '1'
  }
  return headers
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

export function parseGrowthHeatmap(data) {
  if (!data || typeof data !== 'object') return { ok: false, litDates: [] }
  const litDates = []
  if (Array.isArray(data.cells) && data.cells.length > 0) {
    for (const cell of data.cells) {
      if (cell && typeof cell.date === 'string' && Number(cell.score) > 0) litDates.push(cell.date)
    }
    return { ok: true, litDates }
  }
  const entries = Object.entries(data).filter(([k, v]) => /^\d{4}-\d{2}-\d{2}$/u.test(k) && v && typeof v === 'object')
  if (entries.length > 0) {
    entries.sort(([a], [b]) => a.localeCompare(b))
    for (const [date, cell] of entries) {
      if (Number(cell.score) > 0) litDates.push(date)
    }
    return { ok: true, litDates }
  }
  return { ok: false, litDates: [] }
}

export async function runCnCheckin({ accessToken, account = {}, fetchImpl = fetch, signal, now = Date.now() } = {}) {
  if (!accessToken) return failure('CHECKIN_NO_TOKEN', 'no access token')
  const endpoints = quotaEndpoints('cn')
  const headers = buildBillingHeaders('cn', accessToken, account)
  const date = cstDateString(now)

  // Step 1: authoritative pre-check (transient failure does not block claim)
  try {
    const statusRes = await fetchImpl(endpoints.billingBase + CHECKIN_STATUS_PATH, {
      method: 'POST', headers, body: '{}', cache: 'no-store', ...timed(signal)
    })
    const parsed = await readJson(statusRes)
    if (parsed.status >= 200 && parsed.status < 300 && parsed.body?.code === 0 && parsed.body?.data) {
      const data = parsed.body.data
      if (data.active === false) {
        return { ok: true, date, already: false, notRecorded: true, credit: 0, energy: 0, streak: Number(data.streak_days) || 0, message: '签到活动未开启' }
      }
      if (data.today_checked_in === true) {
        return { ok: true, date, already: true, notRecorded: false, credit: 0, energy: 0, streak: Number(data.streak_days) || 0, message: '今日已签到' }
      }
    }
  } catch (error) {
    if (signal?.aborted) return failure('CHECKIN_ABORTED', 'aborted')
  }

  // Step 2: claim daily check-in
  let response
  try {
    response = await fetchImpl(endpoints.billingBase + DAILY_CHECKIN_PATH_V2, {
      method: 'POST', headers, body: '{}', cache: 'no-store', ...timed(signal)
    })
  } catch (error) {
    return failure('CHECKIN_NETWORK', error?.message ?? 'network error')
  }
  const parsed = await readJson(response)
  if (!parsed.body || typeof parsed.body !== 'object') {
    return failure('CHECKIN_FAILED', parsed.text.slice(0, 200) || `HTTP ${parsed.status}`, { status: parsed.status })
  }
  const code = Number(parsed.body.code)
  const msg = String(parsed.body.msg ?? '').trim()
  const data = parsed.body.data && typeof parsed.body.data === 'object' ? parsed.body.data : {}

  if (parsed.status >= 400 && code === 0) {
    return failure(parsed.status === 401 || parsed.status === 403 ? 'CHECKIN_UNAUTHORIZED' : 'CHECKIN_FAILED', msg || `HTTP ${parsed.status}`, { status: parsed.status })
  }
  if (code === 10001 || code === 1001) {
    if (msg.includes('失败')) return failure('CHECKIN_FAILED', msg, { status: parsed.status, bizCode: code })
    return { ok: true, date, already: true, notRecorded: false, credit: 0, energy: 0, streak: 0, message: msg || '今日已签到' }
  }
  if (code === 1002 || code === 1003) {
    return { ok: true, date, already: false, notRecorded: true, credit: 0, energy: 0, streak: 0, message: msg || '当前无领取资格' }
  }
  if (code !== 0) {
    return failure(parsed.status === 401 || parsed.status === 403 ? 'CHECKIN_UNAUTHORIZED' : 'CHECKIN_FAILED', msg || `code ${code}`, { status: parsed.status, bizCode: code })
  }
  if (msg.includes('失败')) {
    return failure('CHECKIN_FAILED', msg, { status: parsed.status, bizCode: 0 })
  }
  if (/处理中|请勿重复操作|系统繁忙|稍后再试/u.test(msg)) {
    return { ok: true, date, already: false, notRecorded: true, credit: 0, energy: 0, streak: 0, message: msg }
  }
  const credit = Number(data.credit) || 0
  const energy = Number(data.energy) || 0
  const streak = Number(data.streak ?? data.streak_days) || 0
  return {
    ok: true,
    date,
    already: false,
    notRecorded: false,
    credit,
    energy,
    streak,
    message: String(data.message ?? msg ?? '').trim() || '签到成功'
  }
}

async function readIntlStreak({ accessToken, account, fetchImpl, signal }) {
  try {
    const endpoints = quotaEndpoints('intl')
    const headers = buildBillingHeaders('intl', accessToken, account)
    const res = await fetchImpl(endpoints.chatBase + STREAK_PATH, {
      method: 'GET', headers, cache: 'no-store', ...timed(signal)
    })
    const parsed = await readJson(res)
    if (parsed.status >= 200 && parsed.status < 300 && parsed.body?.code === 0) {
      const days = Number(parsed.body?.data?.streak?.days) || 0
      return days > 0 ? days : 0
    }
  } catch { /* optional metadata */ }
  return 0
}

export async function runIntlDailyBonus({ accessToken, account = {}, fetchImpl = fetch, signal, now = Date.now() } = {}) {
  if (!accessToken) return failure('CHECKIN_NO_TOKEN', 'no access token')
  const uid = String(account.uid ?? '').trim()
  if (!uid) return failure('CHECKIN_UID_MISSING', 'account uid is required for daily bonus beacon')
  const endpoints = quotaEndpoints('intl')
  const headers = buildBillingHeaders('intl', accessToken, account)
  const date = cstDateString(now)

  // Step 1: check UTC+8 heatmap idempotency
  let heatmapRes
  try {
    heatmapRes = await fetchImpl(endpoints.chatBase + HEATMAP_PATH, {
      method: 'GET', headers, cache: 'no-store', ...timed(signal)
    })
  } catch (error) {
    return failure('CHECKIN_NETWORK', error?.message ?? 'heatmap network error')
  }
  const hmParsed = await readJson(heatmapRes)
  if (hmParsed.status >= 400 || hmParsed.body?.code !== 0) {
    const code = hmParsed.status === 401 || hmParsed.status === 403 ? 'CHECKIN_UNAUTHORIZED' : 'CHECKIN_HEATMAP_FAILED'
    return failure(code, hmParsed.body?.msg ?? hmParsed.text.slice(0, 200), { status: hmParsed.status })
  }
  const heatmap = parseGrowthHeatmap(hmParsed.body?.data)
  if (!heatmap.ok) return failure('CHECKIN_HEATMAP_FAILED', 'heatmap empty or unrecognised')

  if (heatmap.litDates.includes(date)) {
    const streak = await readIntlStreak({ accessToken, account, fetchImpl, signal })
    return { ok: true, date, already: true, notRecorded: false, credit: 0, energy: 0, streak, message: '今日已点亮' }
  }

  // Step 2: send single activity beacon (strictly array body, NO knowledgeId/knowledgeName, NO retry)
  const conversationId = `wb2api-${now}`
  const event = {
    eventCode: 'chat_request_send',
    timestamp: now,
    reportDelay: 0,
    mode: 'craft',
    conversationId,
    requestId: conversationId,
    inputLength: 12,
    requestModelId: DEFAULT_REPORT_MODEL_ID,
    requestModelName: DEFAULT_REPORT_MODEL_NAME,
    isPlan: false,
    isAutoExecuteTerminal: false,
    isAutoModify: false,
    codebaseEnable: false,
    maxToken: 0,
    maxSteps: 0,
    temperature: 0,
    maxRetries: 0,
    mentionContexts: [],
    codebaseId: '',
    mentionContextCount: 0,
    command: '',
    expertId: '',
    recommendId: '',
    skillId: '',
    skillCount: 0,
    totalCount: 0,
    fileUri: '',
    presentAt: now,
    traceId: conversationId,
    rootRequestId: conversationId,
    parentConversationId: conversationId,
    agentName: 'default',
    agentType: 'conversation',
    userId: uid
  }

  let reportRes
  try {
    reportRes = await fetchImpl(endpoints.billingBase + REPORT_PATH, {
      method: 'POST', headers, body: JSON.stringify([event]), cache: 'no-store', ...timed(signal)
    })
  } catch (error) {
    return failure('CHECKIN_NETWORK', error?.message ?? 'report network error')
  }
  const repParsed = await readJson(reportRes)
  if (repParsed.status >= 400) {
    const code = repParsed.status === 401 || repParsed.status === 403 ? 'CHECKIN_UNAUTHORIZED' : 'CHECKIN_REPORT_FAILED'
    return failure(code, repParsed.body?.msg ?? repParsed.text.slice(0, 200), { status: repParsed.status })
  }
  const streak = await readIntlStreak({ accessToken, account, fetchImpl, signal })
  return {
    ok: true,
    date,
    already: false,
    notRecorded: false,
    credit: 0,
    energy: 0,
    streak,
    message: streak > 0 ? `活跃信标已上报（连登 ${streak} 天），积分次日凌晨发放` : '活跃信标已上报，积分次日凌晨发放'
  }
}

export async function runRegionCheckin({ region = 'cn', accessToken, account = {}, fetchImpl = fetch, signal, now = Date.now() } = {}) {
  return region === 'intl'
    ? runIntlDailyBonus({ accessToken, account, fetchImpl, signal, now })
    : runCnCheckin({ accessToken, account, fetchImpl, signal, now })
}
