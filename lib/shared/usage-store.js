// Local persistent usage history store (per region, metadata-only, zero prompt/response text).
// Appends one compact JSON line per completed/failed CLI call to usage-history.jsonl,
// rolls off entries older than RETENTION_DAYS (90 days) or beyond MAX_RECORDS (50000),
// and serves multi-dimensional queries (today / 24h / 7d / 30d / custom + model filter).
import { appendFile, mkdir, readFile, rename, stat, unlink, writeFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import path from 'node:path'

const RETENTION_DAYS = 90
const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000
const MAX_RECORDS = 50000
const MAX_FILE_BYTES = 16 * 1024 * 1024
const COMPACT_AFTER_APPENDS = 500
const RECENT_LIMIT = 50

const VALID_RANGES = new Set(['today', '24h', '7d', '30d', 'custom', 'all'])

export function usageDirectory(region = 'cn') {
  const folder = region === 'intl' ? 'dsh-codebuddy-cli-intl' : 'dsh-codebuddy-cli'
  const base = process.platform === 'win32'
    ? (process.env.LOCALAPPDATA || path.join(homedir(), 'AppData', 'Local'))
    : process.platform === 'darwin'
      ? path.join(homedir(), 'Library', 'Application Support')
      : (process.env.XDG_STATE_HOME || path.join(homedir(), '.local', 'state'))
  return path.join(base, folder, 'usage')
}

function nonNegInt(v) {
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0
}

function cleanStr(v, max = 128) {
  return typeof v === 'string' ? v.trim().slice(0, max) : ''
}

function sanitizeRecord(raw) {
  if (!raw || typeof raw !== 'object') return null
  const at = Number(raw.at)
  if (!Number.isFinite(at) || at <= 0) return null
  const state = raw.state === 'error' ? 'error' : 'ok'
  const uncached = nonNegInt(raw.uncachedInputTokens)
  const cacheRead = nonNegInt(raw.cacheReadTokens)
  const cacheWrite = nonNegInt(raw.cacheWriteTokens)
  const inputTokens = nonNegInt(raw.inputTokens) || (uncached + cacheRead + cacheWrite)
  return {
    id: cleanStr(raw.id, 64),
    at: Math.round(at),
    model: cleanStr(raw.model, 128),
    accountId: cleanStr(raw.accountId, 64),
    state,
    ...(raw.errorCode ? { errorCode: cleanStr(raw.errorCode, 64) } : {}),
    ...(raw.controlClass ? { controlClass: cleanStr(raw.controlClass, 32) } : {}),
    durationMs: nonNegInt(raw.durationMs),
    inputTokens,
    uncachedInputTokens: uncached,
    cacheReadTokens: cacheRead,
    cacheWriteTokens: cacheWrite,
    outputTokens: nonNegInt(raw.outputTokens),
    toolCalls: nonNegInt(raw.toolCalls)
  }
}

function startOfLocalDay(ts) {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function pad2(n) {
  return String(n).padStart(2, '0')
}

function formatDayKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function formatHourKey(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:00`
}

function parseBoundary(value, { endOfDay = false } = {}) {
  if (value === undefined || value === null || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.round(value)
  const s = String(value).trim()
  if (!s) return null
  if (/^\d{10,15}$/u.test(s)) {
    const n = Number(s)
    return n < 1e12 ? n * 1000 : n
  }
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/u.exec(s)
  if (dateOnly) {
    const d = new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]), endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0)
    return Number.isNaN(d.getTime()) ? null : d.getTime()
  }
  const parsed = Date.parse(s)
  return Number.isNaN(parsed) ? null : parsed
}

function resolveWindow({ range = 'today', from, to, now = Date.now() }) {
  const r = VALID_RANGES.has(range) ? range : 'today'
  const todayStart = startOfLocalDay(now)
  if (r === 'today') return { range: 'today', from: todayStart, to: now, bucketUnit: 'hour' }
  if (r === '24h') return { range: '24h', from: now - 24 * 60 * 60 * 1000, to: now, bucketUnit: 'hour' }
  if (r === '7d') return { range: '7d', from: todayStart - 6 * 24 * 60 * 60 * 1000, to: now, bucketUnit: 'day' }
  if (r === '30d') return { range: '30d', from: todayStart - 29 * 24 * 60 * 60 * 1000, to: now, bucketUnit: 'day' }
  if (r === 'all') return { range: 'all', from: 0, to: now, bucketUnit: 'day' }
  // custom
  let start = parseBoundary(from, { endOfDay: false })
  let end = parseBoundary(to, { endOfDay: true })
  if (start === null && end === null) {
    start = todayStart - 6 * 24 * 60 * 60 * 1000
    end = now
  } else if (start === null) {
    start = Math.max(0, end - 7 * 24 * 60 * 60 * 1000)
  } else if (end === null) {
    end = now
  }
  if (start > end) { const tmp = start; start = end; end = tmp }
  const spanMs = end - start
  return { range: 'custom', from: start, to: end, bucketUnit: spanMs <= 48 * 60 * 60 * 1000 ? 'hour' : 'day' }
}

function buildEmptyBuckets(from, to, unit) {
  const buckets = new Map()
  if (from <= 0 || to < from) return buckets
  const maxSlots = unit === 'hour' ? 72 : 120
  if (unit === 'hour') {
    const cursor = new Date(from)
    cursor.setMinutes(0, 0, 0)
    let count = 0
    while (cursor.getTime() <= to && count < maxSlots) {
      const ts = cursor.getTime()
      const key = formatHourKey(ts)
      const label = `${pad2(cursor.getHours())}:00`
      buckets.set(key, { key, label, start: ts, calls: 0, errorCalls: 0, inputTokens: 0, outputTokens: 0, totalDurationMs: 0, avgDurationMs: 0 })
      cursor.setHours(cursor.getHours() + 1)
      count += 1
    }
  } else {
    const cursor = new Date(startOfLocalDay(from))
    let count = 0
    while (cursor.getTime() <= to && count < maxSlots) {
      const ts = cursor.getTime()
      const key = formatDayKey(ts)
      const label = `${pad2(cursor.getMonth() + 1)}-${pad2(cursor.getDate())}`
      buckets.set(key, { key, label, start: ts, calls: 0, errorCalls: 0, inputTokens: 0, outputTokens: 0, totalDurationMs: 0, avgDurationMs: 0 })
      cursor.setDate(cursor.getDate() + 1)
      count += 1
    }
  }
  return buckets
}

export function createUsageStore({ region = 'cn', directory = usageDirectory(region), retentionMs = RETENTION_MS, maxRecords = MAX_RECORDS } = {}) {
  const file = path.join(directory, 'usage-history.jsonl')
  let records = []
  let appendsSinceCompact = 0
  let queue = Promise.resolve()
  let storageError = null
  let dirReady = false

  const pruneInMemory = (now = Date.now()) => {
    const cutoff = now - retentionMs
    if (records.length > 0 && records[0].at < cutoff) {
      records = records.filter((r) => r.at >= cutoff)
    }
    if (records.length > maxRecords) {
      records = records.slice(-maxRecords)
    }
  }

  const ready = (async () => {
    try {
      const st = await stat(file)
      if (st.size > MAX_FILE_BYTES) {
        storageError = 'USAGE_FILE_TOO_LARGE'
        return
      }
      const text = await readFile(file, 'utf8')
      const loaded = []
      for (const line of text.split(/\r?\n/u)) {
        const trimmed = line.trim()
        if (!trimmed) continue
        try {
          const parsed = sanitizeRecord(JSON.parse(trimmed))
          if (parsed) loaded.push(parsed)
        } catch { /* skip corrupt line */ }
      }
      loaded.sort((a, b) => a.at - b.at)
      records = loaded
      pruneInMemory()
    } catch (err) {
      if (err?.code !== 'ENOENT') storageError = 'USAGE_READ_FAILED'
    }
  })()

  const ensureDir = async () => {
    if (dirReady) return
    await mkdir(directory, { recursive: true, mode: 0o700 })
    dirReady = true
  }

  const compactDisk = async () => {
    pruneInMemory()
    await ensureDir()
    const tmp = `${file}.${randomUUID()}.tmp`
    const payload = records.length ? records.map((r) => JSON.stringify(r)).join('\n') + '\n' : ''
    try {
      await writeFile(tmp, payload, { encoding: 'utf8', mode: 0o600 })
      await rename(tmp, file)
      appendsSinceCompact = 0
    } catch (err) {
      try { await unlink(tmp) } catch { /* ignore */ }
      throw err
    }
  }

  function record(raw) {
    const clean = sanitizeRecord(raw)
    if (!clean) return
    records.push(clean)
    pruneInMemory(clean.at)
    appendsSinceCompact += 1
    const needCompact = appendsSinceCompact >= COMPACT_AFTER_APPENDS
    queue = queue.then(() => ready).then(async () => {
      if (needCompact) {
        await compactDisk()
        return
      }
      await ensureDir()
      try {
        await appendFile(file, JSON.stringify(clean) + '\n', { encoding: 'utf8', mode: 0o600 })
      } catch (err) {
        if (err?.code === 'ENOENT') {
          dirReady = false
          await ensureDir()
          await appendFile(file, JSON.stringify(clean) + '\n', { encoding: 'utf8', mode: 0o600 })
        } else {
          throw err
        }
      }
    }).catch(() => {
      storageError = 'USAGE_WRITE_FAILED'
    })
  }

  function query({ range = 'today', from, to, model = '', now = Date.now() } = {}) {
    pruneInMemory(now)
    const win = resolveWindow({ range, from, to, now })
    const modelFilter = cleanStr(model, 128)

    // Collect available models across all stored records (and prioritize those in the active time window)
    const modelCounts = new Map()
    const inTime = []
    for (const r of records) {
      if (r.model && !modelCounts.has(r.model)) modelCounts.set(r.model, 0)
      if (r.at >= win.from && r.at <= win.to) {
        inTime.push(r)
        if (r.model) modelCounts.set(r.model, (modelCounts.get(r.model) || 0) + 1)
      }
    }
    const availableModels = [...modelCounts.entries()]
      .sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]))
      .map(([m]) => m)

    const matched = modelFilter ? inTime.filter((r) => r.model === modelFilter) : inTime

    const totals = {
      calls: 0,
      okCalls: 0,
      errorCalls: 0,
      cancelledCalls: 0,
      inputTokens: 0,
      uncachedInputTokens: 0,
      cacheReadTokens: 0,
      cacheWriteTokens: 0,
      outputTokens: 0,
      toolCalls: 0
    }
    const perModelMap = new Map()
    const failureMap = new Map()
    const bucketMap = win.range === 'all' ? new Map() : buildEmptyBuckets(win.from, win.to, win.bucketUnit)

    for (const r of matched) {
      totals.calls += 1
      if (r.controlClass === 'cancelled') totals.cancelledCalls += 1
      else if (r.state === 'error') totals.errorCalls += 1
      else totals.okCalls += 1
      totals.inputTokens += r.inputTokens
      totals.uncachedInputTokens += r.uncachedInputTokens
      totals.cacheReadTokens += r.cacheReadTokens
      totals.cacheWriteTokens += r.cacheWriteTokens
      totals.outputTokens += r.outputTokens
      totals.toolCalls += r.toolCalls

      if (r.model) {
        const entry = perModelMap.get(r.model) || { model: r.model, calls: 0, inputTokens: 0, uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0 }
        entry.calls += 1
        entry.inputTokens += r.inputTokens
        entry.uncachedInputTokens += r.uncachedInputTokens
        entry.cacheReadTokens += r.cacheReadTokens
        entry.cacheWriteTokens += r.cacheWriteTokens
        entry.outputTokens += r.outputTokens
        perModelMap.set(r.model, entry)
      }

      if (r.state === 'error') {
        const code = r.errorCode || 'CLI_ERROR'
        failureMap.set(code, (failureMap.get(code) || 0) + 1)
      }

      const bKey = win.bucketUnit === 'hour' ? formatHourKey(r.at) : formatDayKey(r.at)
      let bucket = bucketMap.get(bKey)
      if (!bucket) {
        const d = new Date(r.at)
        const label = win.bucketUnit === 'hour' ? `${pad2(d.getHours())}:00` : `${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
        bucket = { key: bKey, label, start: r.at, calls: 0, errorCalls: 0, inputTokens: 0, outputTokens: 0, totalDurationMs: 0, avgDurationMs: 0 }
        bucketMap.set(bKey, bucket)
      }
      bucket.calls += 1
      if (r.state === 'error') bucket.errorCalls += 1
      bucket.inputTokens += r.inputTokens
      bucket.outputTokens += r.outputTokens
      bucket.totalDurationMs += r.durationMs
    }

    const buckets = [...bucketMap.values()]
      .sort((a, b) => a.start - b.start)
      .map((b) => ({
        ...b,
        avgDurationMs: b.calls > 0 ? Math.round(b.totalDurationMs / b.calls) : 0
      }))

    const perModel = [...perModelMap.values()]
      .sort((a, b) => ((b.inputTokens + b.outputTokens) - (a.inputTokens + a.outputTokens)) || (b.calls - a.calls))

    const failures = [...failureMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([errorCode, count]) => ({ errorCode, count }))

    const recentCalls = matched.slice(-RECENT_LIMIT).reverse()

    return {
      range: win.range,
      from: win.from,
      to: win.to,
      model: modelFilter,
      bucketUnit: win.bucketUnit,
      retentionDays: RETENTION_DAYS,
      storageError,
      availableModels,
      totals,
      perModel,
      buckets,
      failures,
      recentCalls
    }
  }

  async function flush() {
    await ready
    await queue
  }

  return {
    ready,
    record,
    query,
    flush,
    get storageError() { return storageError },
    get size() { return records.length }
  }
}
