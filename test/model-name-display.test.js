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
  // A row whose record exists must not also claim there is no credential. The row reads
  // the record through a local alias now, so this follows the same three-state expression
  // instead of the identifier it happened to be written with.
  assert.equal(source.includes("accountState?.defaultAccountId ? (defId?.present ? null : t('accountNoCredential')) : t('accountDefaultEmpty')"), true)
  // An unreadable CLI record must no longer gate the read: the default login is one
  // machine-wide file that either region can own, so its readability says nothing about
  // whether credits can be read. Every row is asked and the server answers with a typed
  // reason, which is what stops the row sitting on "authorise credits" for ever.
  assert.equal(source.includes('blocked[row.id ||'), false, 'an unreadable record must not block the quota read')
  assert.equal(source.includes('const pending = rows.filter((row) => !row.pathError'), true)
  // A stored ticket that dies before its own stamp is exchanged once before the
  // rejection is counted, so one early 401 does not park the row in "failed".
  for (const region of ['cn', 'intl']) {
    const adapter = await readFile(path.join(root, 'lib', region, 'index.js'), 'utf8')
    assert.equal(adapter.includes('quotaRejected(quota) && stored.refreshToken'), true, `${region}: a rejected stored ticket is exchanged once`)
  }
})

test('region readiness can be re-probed after the provider is switched on or off', async () => {
  const source = await readFile(path.join(root, 'lib', 'client.js'), 'utf8')
  assert.equal(source.includes("window.addEventListener('focus', lookAgain)"), true)
  assert.equal(source.includes("document.addEventListener('visibilitychange', onVisible)"), true)
  // Retries are bounded: a disabled region is not polled for ever.
  assert.equal(source.includes('REGION_RETRIES'), true)
})
