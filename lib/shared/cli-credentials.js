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
import { readdir, readFile, lstat } from 'node:fs/promises'
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
export async function inspectCliCredential({ home = '', region = 'cn', now = Date.now(), platform = process.platform } = {}) {
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
  const readable = candidates.filter(item => !item.encrypted && item.accessToken)
  const chosen = readable.find(item => !item.domain || matcher.test(item.domain))
    ?? readable[0]
    ?? candidates.find(item => !item.domain || matcher.test(item.domain))
    ?? candidates[0]
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
