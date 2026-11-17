import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// ⑫ Every error code carries a one-line actionable fix in a shared cn/intl table.
// check-locales.mjs already fails the build when a thrown code lacks a fix; these
// assertions pin the client wiring (the table reaches both regions and is shown
// on failures) and the key shape, so a later edit cannot silently drop the help.
const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const zh = JSON.parse(await readFile(new URL('../locales/guidance.zh.json', import.meta.url), 'utf8'))
const en = JSON.parse(await readFile(new URL('../locales/guidance.en.json', import.meta.url), 'utf8'))

test('error-code guidance is registered for both regions and rendered on failures', () => {
  assert.ok(client.includes('...guidanceZh'), 'the cn dictionary must merge the guidance table')
  assert.ok(client.includes('...guidanceEn'), 'the intl dictionary must merge the guidance table')
  assert.ok(client.includes('const guidance = (code) =>'), 'a guidance lookup helper must exist')
  assert.ok(client.includes("guidance(lastCall.errorCode ?? 'CLI_ERROR')"), 'the last failed call must show its fix')
  assert.ok(client.includes('guidance(failure.errorCode)'), 'recent failures must show their fix')
  assert.ok(client.includes('guidance(failed.code)'), 'a blocked save must show the fix for the failing check')
})

test('every guidance key is a fix_ code present and non-empty in both languages', () => {
  const zhKeys = Object.keys(zh).sort()
  const enKeys = Object.keys(en).sort()
  assert.deepEqual(zhKeys, enKeys)
  assert.ok(zhKeys.length > 0, 'the guidance table must not be empty')
  for (const key of zhKeys) {
    assert.match(key, /^fix_[A-Z][A-Z0-9_]+$/u, `${key} must be a fix_<CODE> key`)
    assert.ok(typeof zh[key] === 'string' && zh[key].trim().length > 0, `${key} zh must be non-empty`)
    assert.ok(typeof en[key] === 'string' && en[key].trim().length > 0, `${key} en must be non-empty`)
  }
})
