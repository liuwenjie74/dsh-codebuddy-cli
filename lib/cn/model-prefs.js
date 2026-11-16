import { mkdir, readFile, writeFile, rename, unlink, lstat } from 'node:fs/promises'
import { homedir } from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { CodeBuddyCliError } from './cli-response.js'

const MAX_HIDDEN = 500
const MAX_ID_LENGTH = 256
const MAX_FILE_BYTES = 65536
const fail = (code, message) => new CodeBuddyCliError(code, message)

export function preferencesDirectory(region = 'cn') {
  const base = process.env.LOCALAPPDATA || path.join(homedir(), 'AppData', 'Local')
  return path.join(base, `dsh-codebuddy-cli-${region}`, 'preferences')
}

export function validModelId(value) {
  return typeof value === 'string' && value.length > 0 && value.length <= MAX_ID_LENGTH && !/[\x00-\x1f\x7f]/u.test(value)
}

// Hidden model ids are stored by their base id (before any account prefix) so that
// one model stays hidden for every account environment.
export function createModelPrefs({ directory = preferencesDirectory('cn') } = {}) {
  const root = path.resolve(directory)
  const file = path.join(root, 'index.json')
  let hidden = []
  let loaded = false
  let storageError = null
  let queue = Promise.resolve()

  async function noLinks(target) {
    try {
      const stat = await lstat(target)
      if (stat.isSymbolicLink() || !stat.isDirectory()) throw fail('MODEL_PREFS_UNSAFE', '模型偏好目录包含链接或异常文件，已忽略本机偏好。')
    } catch (error) { if (error.code !== 'ENOENT') throw error }
  }

  function parseState(text) {
    const value = JSON.parse(text)
    if (!value || typeof value !== 'object' || value.version !== 1 || !Array.isArray(value.hidden) || value.hidden.length > MAX_HIDDEN) throw Error('invalid-state')
    const seen = new Set()
    for (const id of value.hidden) {
      if (!validModelId(id) || seen.has(id)) throw Error('invalid-state')
      seen.add(id)
    }
    return [...seen]
  }

  async function load() {
    if (loaded) return
    loaded = true
    try {
      await noLinks(root)
      const stat = await lstat(file)
      if (!stat.isFile() || stat.isSymbolicLink() || stat.size > MAX_FILE_BYTES) throw fail('MODEL_PREFS_UNSAFE', '模型偏好文件异常，已忽略本机偏好。')
      hidden = parseState(await readFile(file, 'utf8'))
      storageError = null
    } catch (error) {
      // A broken preference file must never hide the whole model catalog, so it degrades to "nothing hidden".
      if (error.code === 'ENOENT') { hidden = []; storageError = null; return }
      hidden = []
      storageError = error instanceof CodeBuddyCliError ? error.code : 'MODEL_PREFS_INVALID'
    }
  }

  async function persist() {
    await mkdir(root, { recursive: true, mode: 0o700 })
    await noLinks(root)
    const temporary = path.join(root, `index-${randomUUID()}.tmp`)
    try {
      await writeFile(temporary, JSON.stringify({ version: 1, hidden }), { mode: 0o600, flag: 'wx' })
      await rename(temporary, file)
    } finally { await unlink(temporary).catch(() => {}) }
  }

  async function setHiddenMany(ids, enabled) {
    const unique = [...new Set(Array.isArray(ids) ? ids : [])]
    if (unique.length === 0 || unique.length > MAX_HIDDEN) throw fail('MODEL_PREFERENCE_INVALID', '模型标识无效，请刷新模型目录后重试。')
    if (typeof enabled !== 'boolean') throw fail('MODEL_PREFERENCE_INVALID', '启用状态无效，请刷新后重试。')
    for (const id of unique) if (!validModelId(id)) throw fail('MODEL_PREFERENCE_INVALID', '模型标识无效，请刷新模型目录后重试。')
    const task = queue.then(async () => {
      await load()
      const previous = hidden
      const before = new Set(hidden)
      const next = enabled ? hidden.filter((item) => !unique.includes(item)) : [...hidden, ...unique.filter((item) => !before.has(item))]
      if (next.length > MAX_HIDDEN) throw fail('MODEL_PREFERENCE_LIMIT', `最多保存 ${MAX_HIDDEN} 个未启用的模型。`)
      // A batch persists once: toggling eight models must not rewrite and
      // re-announce the catalog eight times.
      if (next.length === hidden.length && next.every((item, index) => item === hidden[index])) {
        return { changed: false, hidden: hidden.slice(), changedIds: [], storageError }
      }
      const changedIds = unique.filter((id) => before.has(id) !== (enabled === false))
      hidden = next
      try { await persist() } catch (error) {
        hidden = previous
        throw fail('MODEL_PREFERENCE_UNWRITABLE', '无法保存模型偏好，请检查本机目录权限后重试。')
      }
      storageError = null
      return { changed: true, hidden: hidden.slice(), changedIds, storageError }
    })
    queue = task.catch(() => {})
    return task
  }

  return {
    directory: root,
    async snapshot() {
      await load()
      return { hidden: hidden.slice(), storageError }
    },
    async hiddenSet() {
      await load()
      return new Set(hidden)
    },
    setHiddenMany,
    async setHidden(id, enabled) {
      const saved = await setHiddenMany([id], enabled)
      return { changed: saved.changed, hidden: saved.hidden, storageError: saved.storageError }
    }
  }
}
