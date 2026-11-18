import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import { mkdtemp, mkdir, readFile, writeFile, chmod, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer } from 'node:http'
import { once } from 'node:events'

import { SCHEMA_STUB_SOURCE as schemaStub } from '../helpers/schemastery-stub.mjs'
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === '@deepseek-ai/schemastery') return { url: `data:text/javascript,${encodeURIComponent(schemaStub)}`, shortCircuit: true }
    if (specifier === '@deepseek-ai/dsh-llm') return { url: 'data:text/javascript,export class LlmAdapter {}', shortCircuit: true }
    return next(specifier, context)
  }
})

const temp = async (t, prefix) => {
  const directory = await mkdtemp(path.join(tmpdir(), prefix))
  t.after(() => rm(directory, { recursive: true, force: true }).catch(() => {}))
  return directory
}

test('model preferences persist hidden ids, validate input and degrade safely', async (t) => {
  const { createModelPrefs, preferencesDirectory, validModelId } = await import('../../lib/intl/model-prefs.js')
  assert.equal(validModelId('future-alpha'), true)
  assert.equal(validModelId(''), false)
  assert.equal(validModelId('a'.repeat(257)), false)
  assert.equal(validModelId('bad\u0000id'), false)
  assert.match(preferencesDirectory('intl'), /dsh-codebuddy-cli-intl[\\/]preferences$/u)

  const directory = await temp(t, 'dsh-model-prefs-')
  const store = createModelPrefs({ directory })
  assert.deepEqual(await store.snapshot(), { hidden: [], storageError: null })
  assert.equal((await store.hiddenSet()).size, 0)

  const first = await store.setHidden('future-alpha', false)
  assert.equal(first.changed, true)
  assert.deepEqual(first.hidden, ['future-alpha'])
  const repeat = await store.setHidden('future-alpha', false)
  assert.equal(repeat.changed, false)
  assert.deepEqual(repeat.hidden, ['future-alpha'])
  await store.setHidden('new-free-model', false)
  assert.deepEqual((await store.snapshot()).hidden, ['future-alpha', 'new-free-model'])
  assert.equal((await store.hiddenSet()).has('new-free-model'), true)

  // A new instance must read the persisted file, not the previous in-memory state.
  const reloaded = createModelPrefs({ directory })
  assert.deepEqual((await reloaded.snapshot()).hidden, ['future-alpha', 'new-free-model'])
  assert.equal((await reloaded.setHidden('future-alpha', true)).changed, true)
  assert.deepEqual((await reloaded.snapshot()).hidden, ['new-free-model'])

  await assert.rejects(() => reloaded.setHidden('', false), /模型标识无效/u)
  await assert.rejects(() => reloaded.setHidden('x'.repeat(257), false), /模型标识无效/u)
  await assert.rejects(() => reloaded.setHidden('future-alpha', 'yes'), /启用状态无效/u)

  const brokenDirectory = await temp(t, 'dsh-model-prefs-broken-')
  await mkdir(brokenDirectory, { recursive: true })
  await writeFile(path.join(brokenDirectory, 'index.json'), '{ not json')
  const broken = createModelPrefs({ directory: brokenDirectory })
  // A broken preference file must never hide the whole catalog.
  assert.deepEqual(await broken.snapshot(), { hidden: [], storageError: 'MODEL_PREFS_INVALID' })

  const versionedDirectory = await temp(t, 'dsh-model-prefs-version-')
  await mkdir(versionedDirectory, { recursive: true })
  await writeFile(path.join(versionedDirectory, 'index.json'), JSON.stringify({ version: 2, hidden: ['future-alpha'] }))
  assert.equal((await createModelPrefs({ directory: versionedDirectory }).snapshot()).storageError, 'MODEL_PREFS_INVALID')

  const hugeDirectory = await temp(t, 'dsh-model-prefs-huge-')
  await mkdir(hugeDirectory, { recursive: true })
  await writeFile(path.join(hugeDirectory, 'index.json'), 'x'.repeat(70000))
  assert.equal((await createModelPrefs({ directory: hugeDirectory }).snapshot()).storageError, 'MODEL_PREFS_UNSAFE')

  const fullDirectory = await temp(t, 'dsh-model-prefs-full-')
  await mkdir(fullDirectory, { recursive: true })
  await writeFile(path.join(fullDirectory, 'index.json'), JSON.stringify({ version: 1, hidden: Array.from({ length: 500 }, (_, i) => `model-${i}`) }))
  const full = createModelPrefs({ directory: fullDirectory })
  await assert.rejects(() => full.setHidden('one-more', false), /最多保存 500/u)
  assert.equal((await full.setHidden('model-0', true)).changed, true)
  await assert.rejects(() => full.setHiddenMany([], false), /模型标识无效/u)
  await assert.rejects(() => full.setHiddenMany(['ok-id', ''], false), /模型标识无效/u)
  await assert.rejects(() => full.setHiddenMany(['extra-1', 'extra-2'], false), /最多保存 500/u)

  // A batch persists once and reports exactly which ids changed.
  const batchDirectory = await temp(t, 'dsh-model-prefs-batch-')
  const batchStore = createModelPrefs({ directory: batchDirectory })
  const applied = await batchStore.setHiddenMany(['alpha', 'beta'], false)
  assert.equal(applied.changed, true)
  assert.deepEqual(applied.changedIds, ['alpha', 'beta'])
  assert.deepEqual(JSON.parse(await readFile(path.join(batchDirectory, 'index.json'), 'utf8')), { version: 1, hidden: ['alpha', 'beta'] })
  const enabling = await batchStore.setHiddenMany(['alpha', 'beta'], true)
  assert.equal(enabling.changed, true)
  assert.deepEqual(enabling.hidden, [])
  assert.equal((await batchStore.setHiddenMany(['alpha'], true)).changed, false)
})

test('hiding a model filters listModels, keeps one visible model and updates the status', async (t) => {
  const { apply } = await import('../../lib/intl/index.js')
  const directory = await temp(t, 'dsh-model-visibility-')
  const stateKey = process.platform === 'win32' ? 'LOCALAPPDATA' : process.platform === 'darwin' ? 'HOME' : 'XDG_STATE_HOME'
  const oldStateRoot = process.env[stateKey]
  process.env[stateKey] = directory
  t.after(() => { if (oldStateRoot === undefined) delete process.env[stateKey]; else process.env[stateKey] = oldStateRoot })
  const binDirectory = process.platform === 'win32'
    ? path.join(directory, 'node_modules', '@tencent-ai', 'codebuddy-code', 'bin') : directory
  await mkdir(binDirectory, { recursive: true })
  const entry = path.join(binDirectory, 'codebuddy')
  await writeFile(entry, await readFile(new URL('./fixtures/fake-codebuddy.cjs', import.meta.url)))
  await chmod(entry, 0o755)
  const executable = process.platform === 'win32' ? path.join(directory, 'codebuddy.cmd') : entry
  if (process.platform === 'win32') await writeFile(executable, '@echo off\r\n')
  // Seed the preference file before the plugin loads it, so the filter is exercised on first read.
  const prefsDirectory = path.join(directory, 'dsh-codebuddy-cli-intl', 'preferences')
  await mkdir(prefsDirectory, { recursive: true })
  await writeFile(path.join(prefsDirectory, 'index.json'), JSON.stringify({ version: 1, hidden: ['future-alpha'] }))

  const config = { cliPath: executable, configDir: '', model: 'future-alpha', effort: '', timeoutMs: 15000 }
  const cleanups = []
  const routes = new Map()
  const emitted = []
  let adapter
  const ctx = {
    llm: { registerAdapter(providers, value) { adapter = value; return () => {} } },
    effect(callback) { const dispose = callback(); if (typeof dispose === 'function') cleanups.push(dispose) },
    on() {}, emit(name, payload) { emitted.push([name, payload]) }, inject(deps, callback) { callback(ctx) },
    webServer: { register(route) { routes.set(route.path, route.handler); return () => routes.delete(route.path) } }
  }
  let server
  t.after(async () => {
    for (const cleanup of cleanups.reverse()) cleanup()
    if (server) await new Promise((resolve) => server.close(resolve))
  })
  apply(ctx, config)

  // The hidden model is filtered, and the configured default must not resurrect it.
  const models = await adapter.listModels('codebuddy-cli-intl')
  assert.deepEqual(models.map((model) => model.id), ['new-free-model'])

  server = createServer((req, res) => {
    const route = routes.get(new URL(req.url, 'http://localhost').pathname)
    if (!route) { res.writeHead(404); res.end(); return }
    Promise.resolve(route(req, res)).catch(() => { res.writeHead(500); res.end() })
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const origin = `http://127.0.0.1:${server.address().port}`
  const post = async (body) => {
    const response = await fetch(`${origin}/plugins/dsh-codebuddy-cli-intl/actions`, {
      method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' }, body: JSON.stringify(body)
    })
    return { status: response.status, body: await response.json() }
  }

  const status = await (await fetch(`${origin}/plugins/dsh-codebuddy-cli-intl/status`)).json()
  assert.deepEqual(status.modelPreferences, { hidden: ['future-alpha'], storageError: null })
  // 2.1.0 usage aggregation is exposed on the same status payload.
  assert.equal(typeof status.usage.today.calls, 'number')
  assert.equal(status.usage.today.date, '')
  assert.deepEqual(status.usage.perModel, [])
  assert.deepEqual(status.usage.recentCalls, [])

  // The last visible model cannot be hidden.
  const last = await post({ action: 'setModelVisibility', id: 'new-free-model', enabled: false })
  assert.equal(last.status, 409)
  assert.equal(last.body.error, 'MODEL_VISIBILITY_LAST')

  const invalid = await post({ action: 'setModelVisibility', id: '', enabled: false })
  assert.equal(invalid.status, 400)
  assert.equal(invalid.body.error, 'invalid-model-visibility')

  const unknown = await post({ action: 'deleteEverything' })
  assert.equal(unknown.status, 400)
  assert.equal(unknown.body.error, 'invalid-action')

  const before = emitted.length
  const enabled = await post({ action: 'setModelVisibility', id: 'future-alpha', enabled: true })
  assert.equal(enabled.status, 200)
  assert.deepEqual(enabled.body.modelPreferences, { hidden: [], storageError: null })
  assert.ok(emitted.slice(before).some(([name, payload]) => name === 'llm/models-updated' && payload === 'codebuddy-cli-intl'))
  assert.deepEqual((await adapter.listModels('codebuddy-cli-intl')).map((model) => model.id), ['future-alpha', 'new-free-model'])
  assert.deepEqual(JSON.parse(await readFile(path.join(prefsDirectory, 'index.json'), 'utf8')), { version: 1, hidden: [] })

  const hidden = await post({ action: 'setModelVisibility', id: 'future-alpha', enabled: false })
  assert.equal(hidden.status, 200)
  assert.deepEqual(hidden.body.modelPreferences.hidden, ['future-alpha'])
  assert.deepEqual((await adapter.listModels('codebuddy-cli-intl')).map((model) => model.id), ['new-free-model'])

  // A batch is judged as a whole: hiding both models at once leaves none visible.
  const batchLast = await post({ action: 'setModelVisibility', ids: ['future-alpha', 'new-free-model'], enabled: false })
  assert.equal(batchLast.status, 409)
  assert.equal(batchLast.body.error, 'MODEL_VISIBILITY_LAST')
  assert.deepEqual((await adapter.listModels('codebuddy-cli-intl')).map((model) => model.id), ['new-free-model'])

  // Enabling is never blocked by the guard, and a batch announces the catalog once.
  const beforeBatchEnable = emitted.length
  const batchEnable = await post({ action: 'setModelVisibility', ids: ['future-alpha', 'new-free-model'], enabled: true })
  assert.equal(batchEnable.status, 200)
  assert.deepEqual(batchEnable.body.modelPreferences, { hidden: [], storageError: null })
  assert.equal(emitted.slice(beforeBatchEnable).filter(([name]) => name === 'llm/models-updated').length, 1)
  assert.deepEqual((await adapter.listModels('codebuddy-cli-intl')).map((model) => model.id), ['future-alpha', 'new-free-model'])

  // ⑪ Preflight validates the raw draft about to be saved, not the stored config
  // (configOf clamps timeoutMs on read, so an out-of-range draft must be caught here).
  const findCheck = (report, key) => report.checks.find((check) => check.key === key)
  const badTimeout = await post({ action: 'preflight', cliPath: executable, configDir: '', timeoutMs: 5 })
  assert.equal(badTimeout.status, 200)
  assert.equal(badTimeout.body.ok, false)
  assert.equal(findCheck(badTimeout.body, 'timeoutMs').code, 'PREFLIGHT_TIMEOUT_RANGE')
  assert.equal(findCheck(badTimeout.body, 'cliPath').ok, true)

  const missingCli = await post({ action: 'preflight', cliPath: path.join(directory, 'does-not-exist.cmd'), configDir: '', timeoutMs: 180000 })
  assert.equal(missingCli.body.ok, false)
  assert.equal(findCheck(missingCli.body, 'cliPath').code, 'CLI_NOT_FOUND')

  const notADirectory = path.join(directory, 'plain-file.txt')
  await writeFile(notADirectory, 'x')
  const badDir = await post({ action: 'preflight', cliPath: executable, configDir: notADirectory, timeoutMs: 180000 })
  assert.equal(badDir.body.ok, false)
  assert.equal(findCheck(badDir.body, 'configDir').code, 'PREFLIGHT_CONFIG_DIR')

  const good = await post({ action: 'preflight', cliPath: executable, configDir: directory, timeoutMs: 180000 })
  assert.equal(good.status, 200)
  assert.equal(good.body.ok, true)
  assert.deepEqual(good.body.checks.map((check) => check.ok), [true, true, true])

  // Empty cliPath/configDir are skipped, not failed.
  const skipped = await post({ action: 'preflight', cliPath: '', configDir: '', timeoutMs: 180000 })
  assert.equal(skipped.body.ok, true)
  assert.equal(findCheck(skipped.body, 'cliPath').skipped, true)
  assert.equal(findCheck(skipped.body, 'configDir').skipped, true)
})
