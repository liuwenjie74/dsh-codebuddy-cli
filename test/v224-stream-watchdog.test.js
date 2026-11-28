import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('both regions wire textStreamMode and firstByteTimeoutMs across index, cli-process, cli-image-process, and client UI', async () => {
  for (const reg of ['cn', 'intl']) {
    const idx = await readFile(`lib/${reg}/index.js`, 'utf8')
    const proc = await readFile(`lib/${reg}/cli-process.js`, 'utf8')
    const imgProc = await readFile(`lib/${reg}/cli-image-process.js`, 'utf8')
    assert.match(idx, /firstByteTimeoutMs:/u)
    assert.match(idx, /textStreamMode:/u)
    assert.match(idx, /'PREFLIGHT_FIRST_BYTE_TIMEOUT'/u)
    assert.match(idx, /firstByteTimeoutMs:\s*config\.firstByteTimeoutMs/u)
    assert.match(proc, /firstByteTimeoutMs\s*=\s*0/u)
    assert.match(proc, /firstByteTimer/u)
    assert.match(imgProc, /firstByteTimeoutMs\s*=\s*0/u)
    assert.match(imgProc, /frame\.type !== 'system' && firstByteTimer/u)
  }
  const client = await readFile('lib/client.js', 'utf8')
  assert.match(client, /savePref\('textStreamMode'/u)
  assert.match(client, /draft\.firstByteTimeoutMs/u)
  assert.match(client, /fix_PREFLIGHT_FIRST_BYTE_TIMEOUT/u)
})
