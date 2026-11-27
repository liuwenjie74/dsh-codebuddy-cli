// Read-only reader for the official CLI's on-disk login record.
//
// The CLI keeps one plaintext JSON record per signed-in product under
// <home>/AppData/Local/CodeBuddyExtension/Data/Public/auth/*.info. This module only
// reads it: the access token is reused for a billing read while it is still valid,
// and the refresh token is never returned at all -- rotating it here could sign the
// user out of the CLI itself, so an expired access token means "sign in again".
//
// A file that carries an encrypted envelope ($wbEncrypted, written by the desktop
// app rather than the npm CLI) is reported as encrypted so the caller can fall back
// to the device authorisation instead of guessing.
import { readdir, readFile, lstat, writeFile, rename, unlink } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { homedir } from 'node:os'
import path from 'node:path'

const MAX_FILE = 262144
const MAX_TOKEN = 8192
const EXPIRY_SKEW_MS = 60 * 1000
const REGION_DOMAIN = {
  cn: /(?:^|\.)(?:codebuddy\.cn|workbuddy\.cn)$/u,
  intl: /(?:^|\.)(?:workbuddy\.ai|codebuddy\.ai)$/u
}

export function cliAuthDirectory({ home = '', platform = process.platform } = {}) {
  if (home) {
    const base = platform === 'win32' ? path.join(home, 'AppData', 'Local') : path.join(home, '.local', 'share')
    return path.join(base, 'CodeBuddyExtension', 'Data', 'Public', 'auth')
  }
  const base = process.env.LOCALAPPDATA || path.join(homedir(), 'AppData', 'Local')
  return path.join(base, 'CodeBuddyExtension', 'Data', 'Public', 'auth')
}

function text(value, limit) {
  return typeof value === 'string' ? value.trim().slice(0, limit) : ''
}

async function readCandidate(directory, name) {
  const file = path.join(directory, name)
  // The CLI drops a <file>.logged-out marker when the user signs out; the record
  // itself stays on disk, so the marker is the only reliable signal.
  try {
    await lstat(`${file}.logged-out`)
    return null
  } catch (error) { if (error.code !== 'ENOENT') return null }
  let stat
  try { stat = await lstat(file) } catch { return null }
  if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_FILE) return null
  let parsed
  try { parsed = JSON.parse(await readFile(file, 'utf8')) } catch { return null }
  const account = parsed && typeof parsed.account === 'object' && parsed.account ? parsed.account : {}
  const auth = parsed && typeof parsed.auth === 'object' && parsed.auth ? parsed.auth : {}
  const rawToken = auth.accessToken
  const encrypted = !!rawToken && typeof rawToken === 'object'
  const accessToken = typeof rawToken === 'string' ? rawToken.trim() : ''
  if (!encrypted && (!accessToken || accessToken.length > MAX_TOKEN)) return null
  return {
    file: name,
    uid: text(account.uid, 128),
    nickname: text(account.nickname, 64),
    domain: text(auth.domain, 120).toLowerCase(),
    expiresAt: Number.isSafeInteger(auth.expiresAt) ? auth.expiresAt : 0,
    accessToken: encrypted ? '' : accessToken,
    encrypted
  }
}

// Returns the shape the UI needs. `present` means "a login record exists", which is
// independent of whether its token can still be used.
export async function inspectCliCredential({ home = '', region = 'cn', now = Date.now(), platform = process.platform, localOnly = false } = {}) {
  const directory = cliAuthDirectory({ home, platform })
  let entries
  try { entries = await readdir(directory, { withFileTypes: true }) }
  catch (error) {
    if (error.code === 'ENOENT') return { present: false, code: 'CLI_CREDENTIAL_MISSING' }
    return { present: false, code: 'CLI_CREDENTIAL_UNREADABLE' }
  }
  const candidates = []
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.info')) continue
    const item = await readCandidate(directory, entry.name)
    if (item) candidates.push(item)
  }
  if (candidates.length === 0) return { present: false, code: 'CLI_CREDENTIAL_MISSING' }
  // Usability first, then region. An unreadable record (an encrypted envelope written
  // by the desktop app) must never hide a readable one just because it sits in the
  // region being asked for -- that made the page claim "no sign-in record" while a
  // plaintext record sat next to it. A readable record belonging to the *other*
  // region is reported by name and its token withheld: one region's credit read must
  // never answer for the other account. A record without a domain is accepted for
  // either region because the international build has been seen to omit it.
  const matcher = REGION_DOMAIN[region] ?? REGION_DOMAIN.cn
  // The machine-wide default CLI login is a single record and either region can own
  // it, so a caller that speaks for exactly one region passes localOnly: a record
  // from the other region is then not even considered. Cross-region reporting used to
  // print the international account's nickname and domain inside the China panel,
  // which is the one thing localOnly exists to prevent.
  const pool = localOnly ? candidates.filter(item => !item.domain || matcher.test(item.domain)) : candidates
  if (pool.length === 0) return { present: false, code: 'CLI_CREDENTIAL_MISSING' }
  const isUnexpired = item => !(item.expiresAt > 0 && now >= item.expiresAt - EXPIRY_SKEW_MS)
  const readable = pool.filter(item => !item.encrypted && item.accessToken)
  // Freshness outranks region: an expired record in this region must not hide a
  // readable, still-valid record belonging to the other one. Region only decides
  // between records that are equally fresh, so a foreign token is still never used
  // for this region's credits -- it is merely reported as foreign.
  const freshReadable = readable.filter(isUnexpired)
  const chosen = freshReadable.find(item => !item.domain || matcher.test(item.domain))
    ?? freshReadable[0]
    ?? readable.find(item => !item.domain || matcher.test(item.domain))
    ?? readable[0]
    ?? pool.find(item => !item.domain || matcher.test(item.domain))
    ?? pool[0]
  const foreign = !!chosen.domain && !matcher.test(chosen.domain)
  if (chosen.encrypted) {
    return { present: true, uid: chosen.uid, nickname: chosen.nickname, domain: chosen.domain, expiresAt: chosen.expiresAt, encrypted: true, file: chosen.file, foreignRegion: foreign, accessToken: '', code: 'CLI_CREDENTIAL_ENCRYPTED' }
  }
  const base = {
    present: true,
    uid: chosen.uid,
    nickname: chosen.nickname,
    domain: chosen.domain,
    expiresAt: chosen.expiresAt,
    encrypted: false,
    file: chosen.file,
    foreignRegion: foreign,
    // The access token is what a billing read needs; the refresh token is never part
    // of this shape, and a record from the other region yields no token at all.
    accessToken: foreign ? '' : chosen.accessToken
  }
  if (foreign) return { ...base, code: 'CLI_CREDENTIAL_FOREIGN_REGION' }
  if (!chosen.accessToken) return { ...base, code: 'CLI_CREDENTIAL_MISSING' }
  if (chosen.expiresAt > 0 && now >= chosen.expiresAt - EXPIRY_SKEW_MS) return { ...base, code: 'CLI_CREDENTIAL_EXPIRED' }
  return { ...base, code: '' }
}

export const CLI_CREDENTIAL_CODES = Object.freeze(['CLI_CREDENTIAL_MISSING', 'CLI_CREDENTIAL_UNREADABLE', 'CLI_CREDENTIAL_ENCRYPTED', 'CLI_CREDENTIAL_FOREIGN_REGION', 'CLI_CREDENTIAL_EXPIRED'])

// Opt-in atomic refresh for plaintext CLI .info files.
// Never touches encrypted ($wbEncrypted) desktop records, symlinks, logged-out files,
// or records belonging to the other region. Uses two-phase snapshot comparison so a
// concurrent refresh by the official CLI is never overwritten by a stale response,
// and preserves the original expiresAt unit (epoch ms vs epoch s).
export async function refreshCliCredentialFile({
  home = '',
  region = 'cn',
  platform = process.platform,
  localOnly = false,
  refreshFn,
  now = Date.now()
} = {}) {
  if (typeof refreshFn !== 'function') return { ok: false, code: 'CLI_REFRESH_INVALID', message: 'refreshFn is required' }
  const directory = cliAuthDirectory({ home, platform })
  let entries
  try { entries = await readdir(directory, { withFileTypes: true }) }
  catch (error) {
    return { ok: false, code: error?.code === 'ENOENT' ? 'CLI_CREDENTIAL_MISSING' : 'CLI_CREDENTIAL_UNREADABLE' }
  }
  const matcher = REGION_DOMAIN[region] ?? REGION_DOMAIN.cn
  let target = null
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.info')) continue
    const file = path.join(directory, entry.name)
    try { await lstat(`${file}.logged-out`); continue } catch (e) { if (e.code !== 'ENOENT') continue }
    let stat
    try { stat = await lstat(file) } catch { continue }
    if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_FILE) continue
    let parsed
    try { parsed = JSON.parse(await readFile(file, 'utf8')) } catch { continue }
    const auth = parsed && typeof parsed.auth === 'object' && parsed.auth ? parsed.auth : null
    if (!auth) continue
    const rawAccess = auth.accessToken
    const rawRefresh = auth.refreshToken
    if (typeof rawAccess !== 'string' || typeof rawRefresh !== 'string') continue
    const accessToken = rawAccess.trim()
    const refreshToken = rawRefresh.trim()
    if (!accessToken || !refreshToken || accessToken.length > MAX_TOKEN || refreshToken.length > MAX_TOKEN) continue
    const domain = text(auth.domain, 120).toLowerCase()
    if (domain && !matcher.test(domain)) continue
    target = { file, name: entry.name, stat, parsed, accessToken, refreshToken, expiresAt: Number(auth.expiresAt) || 0 }
    break
  }
  if (!target) return { ok: false, code: 'CLI_CREDENTIAL_NOT_REFRESHABLE', message: 'no plaintext refreshable CLI credential found for region' }

  const refreshed = await refreshFn({ region, refreshToken: target.refreshToken })
  if (!refreshed || !refreshed.ok || !refreshed.accessToken) {
    return { ok: false, code: refreshed?.code || 'CLI_REFRESH_FAILED', message: refreshed?.message || 'refresh failed', status: refreshed?.status }
  }

  // Two-phase check: re-read disk file before writing; abort if CLI concurrently updated it.
  let latestRaw
  try {
    const latestStat = await lstat(target.file)
    if (!latestStat.isFile() || latestStat.isSymbolicLink() || latestStat.size > MAX_FILE) {
      return { ok: false, code: 'CLI_CREDENTIAL_UNSAFE', message: 'credential file changed unsafely' }
    }
    latestRaw = JSON.parse(await readFile(target.file, 'utf8'))
  } catch {
    return { ok: false, code: 'CLI_CREDENTIAL_UNREADABLE', message: 'failed to re-read credential file' }
  }
  const latestAuth = latestRaw && typeof latestRaw.auth === 'object' && latestRaw.auth ? latestRaw.auth : null
  if (!latestAuth || String(latestAuth.accessToken ?? '').trim() !== target.accessToken || String(latestAuth.refreshToken ?? '').trim() !== target.refreshToken) {
    return { ok: true, skipped: true, reason: 'concurrently_updated', file: target.name }
  }

  // Preserve original expiresAt unit (ms >= 1e12 vs s < 1e12)
  const origExp = Number(latestAuth.expiresAt) || 0
  let nextExpiresAt = origExp
  if (Number.isFinite(refreshed.expiresAt) && refreshed.expiresAt > 0) {
    const asMs = refreshed.expiresAt < 1e12 ? Math.round(refreshed.expiresAt * 1000) : Math.round(refreshed.expiresAt)
    nextExpiresAt = origExp > 0 && origExp < 1e12 ? Math.round(asMs / 1000) : asMs
  }
  const merged = {
    ...latestRaw,
    auth: {
      ...latestAuth,
      accessToken: refreshed.accessToken,
      ...(refreshed.refreshToken ? { refreshToken: refreshed.refreshToken } : {}),
      ...(nextExpiresAt > 0 ? { expiresAt: nextExpiresAt } : {})
    }
  }
  const tmpFile = `${target.file}.${randomUUID()}.tmp`
  try {
    await writeFile(tmpFile, JSON.stringify(merged, null, 2), { encoding: 'utf8', mode: 0o600 })
    let lastErr
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await rename(tmpFile, target.file)
        lastErr = null
        break
      } catch (err) {
        lastErr = err
        if (attempt < 2) await new Promise((r) => setTimeout(r, 40 * (attempt + 1)))
      }
    }
    if (lastErr) throw lastErr
  } catch (err) {
    try { await unlink(tmpFile) } catch { /* ignore */ }
    return { ok: false, code: 'CLI_CREDENTIAL_WRITE_FAILED', message: err?.message || 'write failed' }
  }
  return { ok: true, skipped: false, file: target.name, expiresAt: nextExpiresAt, rotated: Boolean(refreshed.refreshToken && refreshed.refreshToken !== target.refreshToken), at: now }
}
