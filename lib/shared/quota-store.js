// Persistent storage for the quota refresh token.
//
// Exactly three fields ever reach disk -- refreshToken, uid and domain -- plus a
// timestamp. Access tokens are re-minted from the refresh token on demand and are
// never persisted, so a stolen file cannot be replayed as an access token.
//
// Storage lives beside the account isolation root and uses the same hardening:
// directory 0o700, file 0o600, atomic tmp-then-rename write.
import { mkdir, readFile, lstat, writeFile, rename, unlink } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

const KEY_SHAPE = /^[A-Za-z0-9._-]{1,80}$/u
const MAX_TOKEN = 8192
const MAX_FILE = 65536

export function quotaDirectory(region = 'cn') {
  const base = process.env.LOCALAPPDATA || path.join(homedir(), 'AppData', 'Local')
  return path.join(base, 'dsh-codebuddy-cli-' + (region === 'intl' ? 'intl' : 'cn'), 'quota')
}

function sanitize(value) {
  if (!value || typeof value !== 'object') return null
  const refreshToken = typeof value.refreshToken === 'string' ? value.refreshToken.trim() : ''
  if (!refreshToken || refreshToken.length > MAX_TOKEN) return null
  return {
    refreshToken,
    uid: typeof value.uid === 'string' ? value.uid.trim().slice(0, 128) : '',
    domain: typeof value.domain === 'string' ? value.domain.trim().slice(0, 120) : '',
    savedAt: Number.isSafeInteger(value.savedAt) ? value.savedAt : Date.now()
  }
}

async function rejectLinks(target) {
  try {
    const stat = await lstat(target)
    if (stat.isSymbolicLink()) throw new Error('symlink-not-allowed')
    return stat
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

export function createQuotaStore({ directory = quotaDirectory() } = {}) {
  const root = path.resolve(directory)
  const fileFor = key => path.join(root, (KEY_SHAPE.test(String(key)) ? String(key) : 'legacy') + '.json')

  async function read(key) {
    const file = fileFor(key)
    try {
      await rejectLinks(root)
      const stat = await rejectLinks(file)
      if (!stat || !stat.isFile() || stat.size > MAX_FILE) return null
      const parsed = JSON.parse(await readFile(file, 'utf8'))
      return sanitize(parsed)
    } catch { return null }
  }

  async function write(key, value) {
    const record = sanitize(value)
    if (!record) throw new Error('QUOTA_STORE_INVALID')
    await mkdir(root, { recursive: true, mode: 0o700 })
    await rejectLinks(root)
    const file = fileFor(key)
    const temporary = path.join(root, 'quota-' + randomUUID() + '.tmp')
    try {
      await writeFile(temporary, JSON.stringify(record), { mode: 0o600, flag: 'wx' })
      await rename(temporary, file)
    } finally { await unlink(temporary).catch(() => {}) }
    return true
  }

  async function clear(key) {
    await unlink(fileFor(key)).catch(() => {})
    return true
  }

  async function describe(key) {
    const record = await read(key)
    // The token itself never leaves this module: callers only learn that an
    // authorisation exists, for which account and when it was stored.
    return record ? { authorized: true, uid: record.uid, domain: record.domain, savedAt: record.savedAt } : { authorized: false }
  }

  return { directory: root, read, write, clear, describe }
}
