import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import * as cnHttp from '../lib/cn/local-http.js'
import * as intlHttp from '../lib/intl/local-http.js'
import * as cnPrefs from '../lib/cn/model-prefs.js'
import * as intlPrefs from '../lib/intl/model-prefs.js'
import * as cnResp from '../lib/cn/model-response.js'
import * as intlResp from '../lib/intl/model-response.js'

test('2.3.0 package rename and shared-module thin wrappers preserve regional boundaries', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'))
  assert.equal(pkg.name, 'dsh-codebuddy-cli')
  assert.equal(pkg.version, '2.3.0')

  const patchYml = await readFile('cordis.patch.yml', 'utf8')
  assert.equal(patchYml.includes('dsh-dkn-' + 'codebuddy-cli'), false)
  assert.match(patchYml, /name:\s*dsh-codebuddy-cli\b/u)
  assert.match(patchYml, /name:\s*dsh-codebuddy-cli\/intl\b/u)

  assert.equal(cnHttp.isLoopbackHost('localhost:3000'), true)
  assert.equal(intlHttp.isLoopbackHost('127.0.0.1:8080'), true)
  assert.notEqual(cnPrefs.preferencesDirectory(), intlPrefs.preferencesDirectory())
  assert.throws(() => cnResp.parseStructuredResponse({ text: 'only' }), /官方结构化结果/u)
  assert.throws(() => intlResp.parseStructuredResponse({ text: 'only' }), /原生结构结果/u)
})

test('2.3.0 wires watchdog, stream mode, probeNetwork proxy guard, and all 6 frontend UX improvements', async () => {
  for (const reg of ['cn', 'intl']) {
    const idx = await readFile(`lib/${reg}/index.js`, 'utf8')
    const proc = await readFile(`lib/${reg}/cli-process.js`, 'utf8')
    const imgProc = await readFile(`lib/${reg}/cli-image-process.js`, 'utf8')
    assert.match(idx, /firstByteTimeoutMs:/u)
    assert.match(idx, /textStreamMode:/u)
    assert.match(idx, /'PREFLIGHT_FIRST_BYTE_TIMEOUT'/u)
    assert.match(idx, /if \(!validProxyUrl\(overrideProxy\)\)/u)
    assert.match(proc, /firstByteTimeoutMs\s*=\s*0/u)
    assert.match(imgProc, /frame\.type !== 'system' && firstByteTimer/u)
  }
  const client = await readFile('lib/client.js', 'utf8')
  assert.equal(client.includes('dsh-dkn-' + 'codebuddy-cli'), false)
  assert.match(client, /const Chip = React\.memo\(/u)
  assert.match(client, /const memoModels = React\.useMemo\(/u)
  assert.match(client, /const memoLogs = React\.useMemo\(/u)
  assert.match(client, /setTimeout\(\(\) => setToastDismissed\(notice\), 4500\)/u)
  assert.match(client, /entry\.controlClass \? '#94a3b8' : entry\.state === 'error' \? '#ef4444' : '#10b981'/u)
  assert.match(client, /复制此条/u)
  assert.match(client, /savePref\('textStreamMode'/u)
  assert.match(client, /draft\.firstByteTimeoutMs/u)
})
