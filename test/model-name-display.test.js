import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// The account an account-scoped model belongs to is carried by the model id, which
// routing parses back with parseAccountModel. The display name must stay the plain
// model name: prefixing it produced one "[account N] model" entry per account in the
// DSH picker. These assertions keep the two apart -- removing the id would break
// routing, so both halves are checked.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

for (const region of ['cn', 'intl']) {
  test(`${region}: account-scoped models keep the plain model name`, async () => {
    const source = await readFile(path.join(root, 'lib', region, 'index.js'), 'utf8')
    assert.equal(source.includes('accountLabel}]'), false, 'the display name must not carry the account label')
    assert.equal(source.includes('name: `['), false, 'no bracketed account prefix may be built into a model name')
    assert.equal(source.includes('accountModelId(config.accountId'), true, 'the account must still ride on the model id')
  })
}

test('the accounts panel states one status per row and always reaches a terminal balance', async () => {
  const source = await readFile(path.join(root, 'lib', 'client.js'), 'utf8')
  // A row whose record exists must not also claim there is no credential.
  assert.equal(source.includes("accountState?.defaultLogin?.present ? null : t('accountNoCredential')"), true)
  // An unreadable row gets its reason written straight away, so the credit panel can
  // never sit on "reading" with nothing to act on.
  assert.equal(source.includes('if (!row.ok) blocked[row.id || \'legacy\']'), true)
})

test('region readiness can be re-probed after the provider is switched on or off', async () => {
  const source = await readFile(path.join(root, 'lib', 'client.js'), 'utf8')
  assert.equal(source.includes("window.addEventListener('focus', lookAgain)"), true)
  assert.equal(source.includes("document.addEventListener('visibilitychange', onVisible)"), true)
  // Retries are bounded: a disabled region is not polled for ever.
  assert.equal(source.includes('REGION_RETRIES'), true)
})
