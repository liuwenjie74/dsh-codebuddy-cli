// Bounded, redacted request samples taken from the system scope only.
//
// Why this exists: the identity rewrite table in prompt-rewrite.js was derived
// statically -- the plugin source never contained the original strings -- so
// until a real makeRequest() output is captured there is no evidence of what
// upstream actually receives. Capture is opt-in (default off), contains the
// system scope only, and never includes user / assistant / tool messages.
//
// Boundary: the wrapped CLI writes its own identity block inside its OAuth
// branch, which never passes through this plugin. No sample can capture that
// text. All this module can audit is the plugin-visible system scope, so callers
// must not describe the two as equivalent.

import { scanIdentities } from './prompt-rewrite.js'

const MAX_SAMPLE_BYTES = 64 * 1024
const MAX_TEXT_CHARS = 32 * 1024

// Ordered most specific first: a data URI is masked before the generic base64
// rule can split it, and keys are masked before the long-blob rule can eat them.
const REDACTIONS = [
  [/\b(?:sk|pk|rk)-[A-Za-z0-9_-]{8,}/gu, '[REDACTED_KEY]'],
  [/\bBearer\s+[A-Za-z0-9._-]{8,}/giu, 'Bearer [REDACTED]'],
  [/data:[a-z]+\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+/giu, '[REDACTED_DATA_URI]'],
  [/\b[A-Za-z0-9+/]{64,}={0,2}\b/gu, '[REDACTED_BLOB]'],
  [/[\w.+-]+@[\w-]+\.[\w.-]+/gu, '[REDACTED_EMAIL]'],
  [/(?:\+?\d[\s-]?){8,}\d/gu, '[REDACTED_NUMBER]'],
  [/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/giu, '[REDACTED_ID]']
]

// Masks the patterns above and truncates, in that order, so a truncated tail can
// never leak the part that the size cap cut off mid-secret.
export function redactText(text) {
  if (typeof text !== 'string' || text.length === 0) return ''
  let output = text
  for (const [pattern, replacement] of REDACTIONS) {
    pattern.lastIndex = 0
    output = output.replace(pattern, replacement)
  }
  if (output.length > MAX_TEXT_CHARS) {
    const dropped = output.length - MAX_TEXT_CHARS
    output = output.slice(0, MAX_TEXT_CHARS) + `\n…[truncated ${dropped} chars]`
  }
  return output
}

function collectTexts(content, texts) {
  if (typeof content === 'string') {
    texts.push(content)
    return
  }
  if (!Array.isArray(content)) return
  for (const block of content) {
    if (block && block.type === 'text' && typeof block.text === 'string') texts.push(block.text)
  }
}

// System scope only: envelope.system plus messages whose role is exactly
// `system`. Everything else stays out of the sample by construction.
export function systemScopeTexts(system, messages) {
  const texts = []
  if (Array.isArray(system)) collectTexts(system, texts)
  else if (typeof system === 'string') texts.push(system)
  for (const message of Array.isArray(messages) ? messages : []) {
    if (message && message.role === 'system') collectTexts(message.content, texts)
  }
  return texts
}

// Produces the on-disk sample. `rewrite` is whatever request.js measured for
// this very request, so the sample records both the residual audit and the
// rewrite counters that produced it.
export function buildRequestSample({ system, messages, rewrite } = {}) {
  const texts = systemScopeTexts(system, messages)
  const combined = texts.join('\n\n---\n\n')
  let body = redactText(combined)
  let bytes = Buffer.byteLength(body)
  if (bytes > MAX_SAMPLE_BYTES) {
    const suffix = `\n…[truncated at ${MAX_SAMPLE_BYTES} bytes]`
    const budget = Math.max(0, MAX_SAMPLE_BYTES - Buffer.byteLength(suffix))
    // Byte cap on multi-byte text: shrink by characters until it fits with suffix.
    while (body.length > 0 && bytes > budget) {
      body = body.slice(0, Math.floor(body.length * 0.9))
      bytes = Buffer.byteLength(body)
    }
    body = `${body}${suffix}`
    bytes = Buffer.byteLength(body)
  }
  const identities = scanIdentities(combined)
  return {
    schemaVersion: 1,
    scope: 'system',
    includesUserContent: false,
    systemSegments: texts.length,
    rewrite: {
      enabled: rewrite?.enabled === true,
      hits: Number(rewrite?.hits) || 0,
      residual: Number(rewrite?.residual) || 0
    },
    identities,
    bytes,
    text: body
  }
}
