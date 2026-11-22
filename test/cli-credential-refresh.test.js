import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { cliAuthDirectory, refreshCliCredentialFile } from '../lib/shared/cli-credentials.js'

async function makeAuthDir(t) {
  const home = await mkdtemp(path.join(tmpdir(), 'cb-cred-refresh-'))
  t.after(() => rm(home, { recursive: true, force: true }))
  const authDir = cliAuthDirectory({ home, platform: 'win32' })
  await mkdir(authDir, { recursive: true })
  return { home, authDir }
}

test('refreshCliCredentialFile updates plaintext .info atomically and preserves extra fields and ms unit', async (t) => {
  const { home, authDir } = await makeAuthDir(t)
  const file = path.join(authDir, 'cn.info')
  await writeFile(file, JSON.stringify({
    customField: 'keep-me',
    account: { uid: 'u1', nickname: 'Alice' },
    auth: { accessToken: 'old-acc', refreshToken: 'old-ref', expiresAt: 1790000000000, domain: 'www.codebuddy.cn' }
  }), 'utf8')

  const res = await refreshCliCredentialFile({
    home, region: 'cn', platform: 'win32',
    refreshFn: async ({ refreshToken }) => {
      assert.equal(refreshToken, 'old-ref')
      return { ok: true, accessToken: 'new-acc', refreshToken: 'new-ref', expiresAt: 1799000000000 }
    }
  })
  assert.equal(res.ok, true)
  assert.equal(res.skipped, false)
  assert.equal(res.rotated, true)

  const saved = JSON.parse(await readFile(file, 'utf8'))
  assert.equal(saved.customField, 'keep-me')
  assert.equal(saved.auth.accessToken, 'new-acc')
  assert.equal(saved.auth.refreshToken, 'new-ref')
  assert.equal(saved.auth.expiresAt, 1799000000000)
})

test('refreshCliCredentialFile preserves epoch-seconds unit when original expiresAt is in seconds', async (t) => {
  const { home, authDir } = await makeAuthDir(t)
  const file = path.join(authDir, 'cn.info')
  await writeFile(file, JSON.stringify({
    auth: { accessToken: 'old-acc', refreshToken: 'old-ref', expiresAt: 1790000000, domain: 'www.codebuddy.cn' }
  }), 'utf8')

  const res = await refreshCliCredentialFile({
    home, region: 'cn', platform: 'win32',
    refreshFn: async () => ({ ok: true, accessToken: 'new-acc', refreshToken: 'new-ref', expiresAt: 1799000000000 })
  })
  assert.equal(res.ok, true)
  const saved = JSON.parse(await readFile(file, 'utf8'))
  assert.equal(saved.auth.expiresAt, 1799000000)
})

test('refreshCliCredentialFile skips write if CLI concurrently updated file mid-flight', async (t) => {
  const { home, authDir } = await makeAuthDir(t)
  const file = path.join(authDir, 'cn.info')
  await writeFile(file, JSON.stringify({
    auth: { accessToken: 'old-acc', refreshToken: 'old-ref', expiresAt: 1790000000000, domain: 'www.codebuddy.cn' }
  }), 'utf8')

  const res = await refreshCliCredentialFile({
    home, region: 'cn', platform: 'win32',
    refreshFn: async () => {
      // Simulate official CLI refreshing the file while our HTTP call is in flight
      await writeFile(file, JSON.stringify({
        auth: { accessToken: 'cli-newer-acc', refreshToken: 'cli-newer-ref', expiresAt: 1800000000000, domain: 'www.codebuddy.cn' }
      }), 'utf8')
      return { ok: true, accessToken: 'stale-acc', refreshToken: 'stale-ref', expiresAt: 1795000000000 }
    }
  })
  assert.equal(res.ok, true)
  assert.equal(res.skipped, true)
  const saved = JSON.parse(await readFile(file, 'utf8'))
  assert.equal(saved.auth.accessToken, 'cli-newer-acc')
})

test('refreshCliCredentialFile refuses encrypted desktop records and foreign region records', async (t) => {
  const { home, authDir } = await makeAuthDir(t)
  await writeFile(path.join(authDir, 'enc.info'), JSON.stringify({
    auth: { accessToken: { $wbEncrypted: true, data: 'abc' }, refreshToken: { $wbEncrypted: true }, domain: 'www.codebuddy.cn' }
  }), 'utf8')
  await writeFile(path.join(authDir, 'intl.info'), JSON.stringify({
    auth: { accessToken: 'intl-acc', refreshToken: 'intl-ref', domain: 'www.workbuddy.ai' }
  }), 'utf8')

  const res = await refreshCliCredentialFile({
    home, region: 'cn', platform: 'win32',
    refreshFn: async () => { throw new Error('must not be called') }
  })
  assert.equal(res.ok, false)
  assert.equal(res.code, 'CLI_CREDENTIAL_NOT_REFRESHABLE')
})
