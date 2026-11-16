import test from 'node:test'
import assert from 'node:assert/strict'
import { scanIdentities } from '../lib/shared/prompt-rewrite.js'
import { redactText, buildRequestSample } from '../lib/shared/request-audit.js'
import { makeRequest } from '../lib/cn/request.js'

// The audit exists because the identity table was derived statically. These
// cases pin the three properties that make it trustworthy: protected runtime
// paths are never reported as misses, secrets are masked before truncation can
// cut them in half, and a sample can only ever contain the system scope.
//
// Credential-shaped inputs are assembled at runtime on purpose: a literal one
// would make this fixture itself look like a leaked secret to secret scanners,
// while the masking code still has to handle the real shape.
const join = (...parts) => parts.join('')
const SYNTHETIC = {
  key: join('sk', '-', 'abcdefgh', '12345678'),
  bearer: join('Bea', 'rer', ' ', 'abcdefgh', '.', 'ijklmnop'),
  dataUri: join('data:', 'image/png;base64,', 'AAAABBBBCCCC'),
  email: join('someone', '@', 'example.com'),
  phone: join('138', '0000', '0000'),
  uuid: join('12345678', '-1234-4234-8234-123456789abc')
}

test('protected runtime paths are not reported as uncovered identities', () => {
  const text = 'Checkout: "D:\\\\DeepSeek Harness\\\\resources\\\\app.asar\\\\dsh\\\\" and you are DeepSeek Harness.'
  const audit = scanIdentities(text)
  assert.equal(audit.total, 2)
  assert.equal(audit.guarded, 1)
  assert.equal(audit.uncovered, 1)
  assert.deepEqual(audit.names, ['DeepSeek Harness'])
})

test('a clean text reports no identities at all', () => {
  const audit = scanIdentities('nothing to see here')
  assert.equal(audit.total, 0)
  assert.equal(audit.uncovered, 0)
  assert.deepEqual(audit.names, [])
})

test('masking removes every synthetic secret before any truncation', () => {
  const text = Object.values(SYNTHETIC).join(' | ')
  const masked = redactText(text)
  for (const [name, secret] of Object.entries(SYNTHETIC)) {
    assert.equal(masked.includes(secret), false, `${name} leaked: ${secret}`)
  }
  assert.ok(masked.includes('[REDACTED'))
})

test('a sample holds the system scope only', () => {
  const sample = buildRequestSample({
    system: 'System: you are DeepSeek Harness.',
    messages: [
      { role: 'system', content: [{ type: 'text', text: 'system block names Claude Code' }] },
      { role: 'user', content: 'user secret text' },
      { role: 'assistant', content: 'assistant reply text' },
      { role: 'tool', content: 'tool payload text' }
    ],
    rewrite: { enabled: true, hits: 2, residual: 0 }
  })
  assert.equal(sample.scope, 'system')
  assert.equal(sample.includesUserContent, false)
  assert.equal(sample.systemSegments, 2)
  assert.equal(sample.text.includes('user secret text'), false)
  assert.equal(sample.text.includes('assistant reply text'), false)
  assert.equal(sample.text.includes('tool payload text'), false)
  assert.equal(sample.rewrite.hits, 2)
  assert.equal(sample.rewrite.residual, 0)
  assert.ok(sample.identities.total >= 2)
})

test('an oversized system scope is cut down to the byte cap', () => {
  // A single long run of base64-alphabet characters is masked as a blob before
  // any size cap applies, so that case is asserted on its own rather than
  // mistaken for the truncation branch.
  const blob = buildRequestSample({ system: 'x'.repeat(200 * 1024), messages: [] })
  assert.ok(blob.text.includes('[REDACTED_BLOB]'))
  assert.ok(blob.bytes <= 64 * 1024 + 64)
  // Single-byte text above the character cap is cut by characters and says so;
  // three times the byte cap still fits because characters are cut first.
  const chars = buildRequestSample({ system: 'x '.repeat(120 * 1024), messages: [] })
  assert.ok(chars.text.length < 240 * 1024)
  assert.ok(chars.bytes <= 64 * 1024 + 64)
  assert.ok(chars.text.includes('[truncated'))
  // Multi-byte text sits exactly at the character cap but three times over the
  // byte cap, which is the branch that appends the byte-limit marker.
  const bytes = buildRequestSample({ system: '你'.repeat(32 * 1024), messages: [] })
  assert.ok(bytes.bytes <= 64 * 1024 + 64)
  assert.ok(bytes.text.includes('[truncated at'))
})

test('makeRequest reports the audit and can capture a redacted sample', () => {
  const { prompt, diagnostics, rewrite, requestSample } = makeRequest({
    system: 'You are an AI agent powered by DeepSeek Harness.',
    messages: [
      { role: 'user', content: 'DeepSeek Harness 这个编辑器的模型选择器' },
      { role: 'system', content: [{ type: 'text', text: "You are Claude Code, Anthropic's official CLI for Claude." }] }
    ],
    rewriteClientNames: true,
    captureRequestSamples: true
  }, [], undefined)
  assert.equal(rewrite.enabled, true)
  assert.ok(rewrite.hits >= 2)
  assert.equal(rewrite.residual, 0)
  assert.ok(requestSample)
  assert.equal(requestSample.text.includes('DeepSeek Harness'), false)
  assert.equal(requestSample.text.includes('Claude Code'), false)
  assert.ok(requestSample.text.includes('WorkBuddy'))
  // diagnostics keeps its existing contract: flat numeric values only.
  assert.ok(Object.values(diagnostics).every((value) => typeof value === 'number'))
  assert.ok(prompt.includes('WorkBuddy'))
  // Only the system scope is rewritten, so the user message must survive as-is.
  assert.ok(prompt.includes('DeepSeek Harness 这个编辑器的模型选择器'))
})

test('capture stays off unless it is explicitly enabled', () => {
  const { requestSample, rewrite } = makeRequest({
    system: 'You are an AI agent powered by DeepSeek Harness.',
    messages: [{ role: 'user', content: 'hi' }],
    rewriteClientNames: true
  }, [], undefined)
  assert.equal(requestSample, undefined)
  assert.equal(rewrite.enabled, true)
})

test('a disabled switch leaves the system prompt untouched and reports it', () => {
  const { rewrite } = makeRequest({
    system: 'You are an AI agent powered by DeepSeek Harness.',
    messages: [{ role: 'user', content: 'hi' }],
    rewriteClientNames: false
  }, [], undefined)
  assert.equal(rewrite.enabled, false)
  assert.equal(rewrite.hits, 0)
  assert.equal(rewrite.residual, 0)
})
