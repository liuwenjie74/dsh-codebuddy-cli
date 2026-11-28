import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { validProxyUrl, probeRegionConnectivity } from '../lib/shared/net.js'

test('validProxyUrl accepts empty, http, https, socks5, socks5h and rejects malformed values', () => {
  assert.equal(validProxyUrl(''), true)
  assert.equal(validProxyUrl('http://127.0.0.1:7897'), true)
  assert.equal(validProxyUrl('https://user:pass@proxy.example.com:8443'), true)
  assert.equal(validProxyUrl('socks5://127.0.0.1:7890'), true)
  assert.equal(validProxyUrl('socks5h://127.0.0.1:7890'), true)
  assert.equal(validProxyUrl('ftp://127.0.0.1:21'), false)
  assert.equal(validProxyUrl('not-a-url'), false)
  assert.equal(validProxyUrl('http://127.0.0.1:7897 bad'), false)
})

test('probeRegionConnectivity records sanitized viaProxy endpoint when proxyUrl is provided', async () => {
  const res = await probeRegionConnectivity({
    region: 'intl',
    proxyUrl: 'http://secret:token@127.0.0.1:7897',
    fetchImpl: async () => ({ status: 200 })
  })
  assert.equal(res.ok, true)
  assert.equal(res.viaProxy, 'http://127.0.0.1:7897')
  assert.equal(JSON.stringify(res).includes('secret'), false)
  assert.equal(JSON.stringify(res).includes('token'), false)
})

test('both regions support proxyUrl, rename action, Plan A bare model ids, and client wires AbortController & hide-cancelled toggle', async () => {
  for (const reg of ['cn', 'intl']) {
    const idx = await readFile(`lib/${reg}/index.js`, 'utf8')
    const rt = await readFile(`lib/${reg}/cli-runtime.js`, 'utf8')
    const acc = await readFile(`lib/${reg}/accounts.js`, 'utf8')
    assert.match(idx, /proxyUrl:/u)
    assert.match(idx, /'PREFLIGHT_PROXY_URL'/u)
    assert.match(idx, /'rename'/u)
    assert.equal(idx.includes('accountModelId(config.accountId'), false)
    assert.match(rt, /config\.proxyUrl/u)
    assert.match(acc, /config\.proxyUrl/u)
    assert.match(acc, /async rename\(id, label\)/u)
  }
  const client = await readFile('lib/client.js', 'utf8')
  assert.match(client, /logHideCancelled/u)
  assert.match(client, /renamingId/u)
  assert.match(client, /draft\.proxyUrl/u)
  assert.match(client, /fetch\(`\$\{usageUrl\}\?\$\{qs\.toString\(\)\}`, \{ signal: controller\.signal/u)
  assert.match(client, /fetch\(props\.diagnosticsUrl \?\? DIAGNOSTICS_PATH, \{ signal: controller\.signal/u)
})
