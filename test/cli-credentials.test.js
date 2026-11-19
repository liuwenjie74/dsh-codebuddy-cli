import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { CLI_CREDENTIAL_CODES, cliAuthDirectory, inspectCliCredential } from '../lib/shared/cli-credentials.js'

// The CLI already holds a usable login, so a second browser authorisation is not
// needed to read an account's quota. This reader is read-only and must never hand the
// refresh token back: rotating it here could sign the user out of the CLI itself.

const AUTH = ['AppData', 'Local', 'CodeBuddyExtension', 'Data', 'Public', 'auth']

async function fixture(t) {
  const home = await mkdtemp(path.join(tmpdir(), 'cli-cred-'))
  t.after(() => rm(home, { recursive: true, force: true }))
  const directory = cliAuthDirectory({ home, platform: 'win32' })
  await mkdir(directory, { recursive: true })
  const write = (name, body) => writeFile(path.join(directory, name), typeof body === 'string' ? body : JSON.stringify(body))
  return { home, directory, write }
}

const record = (overrides = {}) => ({
  account: { uid: 'uid-1', nickname: 'Nick', phoneNumber: '13800000000' },
  auth: { accessToken: 'access-secret', refreshToken: 'refresh-secret', domain: 'www.codebuddy.cn', expiresAt: Date.now() + 3600 * 1000, ...overrides }
})

test('the CLI auth directory follows the account home', () => {
  assert.equal(cliAuthDirectory({ home: 'C:\\home', platform: 'win32' }), path.join('C:\\home', ...AUTH))
  assert.equal(cliAuthDirectory({ home: '/home/u', platform: 'linux' }), path.join('/home/u', '.local', 'share', 'CodeBuddyExtension', 'Data', 'Public', 'auth'))
})

test('a missing directory is reported as missing, not as an error', async t => {
  const home = await mkdtemp(path.join(tmpdir(), 'cli-cred-none-'))
  t.after(() => rm(home, { recursive: true, force: true }))
  const result = await inspectCliCredential({ home, platform: 'win32' })
  assert.equal(result.present, false)
  assert.equal(result.code, 'CLI_CREDENTIAL_MISSING')
})

test('a usable login is read without ever exposing the refresh token', async t => {
  const { home, write } = await fixture(t)
  await write('Tencent-Cloud.coding-copilot.info', record())
  const result = await inspectCliCredential({ home, platform: 'win32' })
  assert.equal(result.present, true)
  assert.equal(result.code, '')
  assert.equal(result.uid, 'uid-1')
  assert.equal(result.nickname, 'Nick')
  assert.equal(result.domain, 'www.codebuddy.cn')
  assert.equal(result.accessToken, 'access-secret')
  assert.equal(result.encrypted, false)
  // Nothing downstream may learn the refresh token, not even a phone number.
  const serialized = JSON.stringify(result)
  assert.equal(serialized.includes('refresh-secret'), false)
  assert.equal(serialized.includes('13800000000'), false)
})

test('a sign-out marker makes the record unusable', async t => {
  const { home, write, directory } = await fixture(t)
  await write('Tencent-Cloud.coding-copilot.info', record())
  await writeFile(path.join(directory, 'Tencent-Cloud.coding-copilot.info.logged-out'), '')
  const result = await inspectCliCredential({ home, platform: 'win32' })
  assert.equal(result.present, false)
  assert.equal(result.code, 'CLI_CREDENTIAL_MISSING')
})

test('an encrypted desktop envelope is reported as encrypted instead of guessed', async t => {
  const { home, write } = await fixture(t)
  await write('workbuddy-desktop.info', record({ accessToken: { $wbEncrypted: 'cipher' }, refreshToken: { $wbEncrypted: 'cipher' } }))
  const result = await inspectCliCredential({ home, platform: 'win32' })
  assert.equal(result.present, true)
  assert.equal(result.code, 'CLI_CREDENTIAL_ENCRYPTED')
  assert.equal(result.encrypted, true)
  assert.equal(result.accessToken, '')
})

test('an expired access token asks for a new sign-in rather than a refresh', async t => {
  const { home, write } = await fixture(t)
  const now = Date.now()
  await write('Tencent-Cloud.coding-copilot.info', record({ expiresAt: now - 1000 }))
  assert.equal((await inspectCliCredential({ home, platform: 'win32', now })).code, 'CLI_CREDENTIAL_EXPIRED')
  // The skew stops a token from expiring mid-request.
  await write('Tencent-Cloud.coding-copilot.info', record({ expiresAt: now + 30 * 1000 }))
  assert.equal((await inspectCliCredential({ home, platform: 'win32', now })).code, 'CLI_CREDENTIAL_EXPIRED')
  // A record with no expiry stamp is used as-is instead of being called expired.
  await write('Tencent-Cloud.coding-copilot.info', record({ expiresAt: 0 }))
  assert.equal((await inspectCliCredential({ home, platform: 'win32', now })).code, '')
})

test('each region prefers its own domain and never borrows the other', async t => {
  const { home, write } = await fixture(t)
  await write('cn.info', record({ domain: 'www.codebuddy.cn' }))
  await write('intl.info', record({ domain: 'www.workbuddy.ai', accessToken: 'intl-token' }))
  const cn = await inspectCliCredential({ home, platform: 'win32', region: 'cn' })
  assert.equal(cn.domain, 'www.codebuddy.cn')
  assert.equal(cn.accessToken, 'access-secret')
  const intl = await inspectCliCredential({ home, platform: 'win32', region: 'intl' })
  assert.equal(intl.domain, 'www.workbuddy.ai')
  assert.equal(intl.accessToken, 'intl-token')
})

test('junk in the auth directory is ignored instead of failing the read', async t => {
  const { home, write, directory } = await fixture(t)
  await write('broken.info', 'not json')
  await write('notes.txt', 'ignored')
  await mkdir(path.join(directory, 'nested.info'), { recursive: true })
  const result = await inspectCliCredential({ home, platform: 'win32' })
  assert.equal(result.present, false)
  assert.equal(result.code, 'CLI_CREDENTIAL_MISSING')
  // A record with no token at all is not a login either.
  await write('empty.info', { account: { uid: 'uid-9' }, auth: { domain: 'www.codebuddy.cn' } })
  assert.equal((await inspectCliCredential({ home, platform: 'win32' })).code, 'CLI_CREDENTIAL_MISSING')
})

test('a readable record from the other region is reported instead of "encrypted"', async t => {
  const { home, write } = await fixture(t)
  // The desktop app overwrote the local record with an encrypted envelope while the
  // only readable record on disk belongs to the international account. Reading it as
  // "encrypted" made the page claim there was no sign-in at all.
  await write('workbuddy-desktop.info', record({ accessToken: { $wbEncrypted: 'cipher' }, refreshToken: { $wbEncrypted: 'cipher' } }))
  await write('Tencent-Cloud.coding-copilot.info', record({ domain: 'www.codebuddy.ai', accessToken: 'intl-token' }))
  const cn = await inspectCliCredential({ home, platform: 'win32', region: 'cn' })
  assert.equal(cn.present, true)
  assert.equal(cn.code, 'CLI_CREDENTIAL_FOREIGN_REGION')
  assert.equal(cn.foreignRegion, true)
  assert.equal(cn.domain, 'www.codebuddy.ai')
  // The other region's token is never handed out for this region's credit read.
  assert.equal(cn.accessToken, '')
  // The same directory read for the matching region still yields a usable token.
  const intl = await inspectCliCredential({ home, platform: 'win32', region: 'intl' })
  assert.equal(intl.code, '')
  assert.equal(intl.accessToken, 'intl-token')
})

test('every reported code has a UI explanation', () => {
  assert.deepEqual([...CLI_CREDENTIAL_CODES].sort(), [
    'CLI_CREDENTIAL_ENCRYPTED', 'CLI_CREDENTIAL_EXPIRED', 'CLI_CREDENTIAL_FOREIGN_REGION', 'CLI_CREDENTIAL_MISSING', 'CLI_CREDENTIAL_UNREADABLE'
  ])
})
