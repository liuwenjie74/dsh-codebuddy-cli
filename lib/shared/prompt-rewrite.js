// DSH and the wrapped CLI both name themselves inside the system prompt, so an
// upstream reached through a reverse proxy sees mixed identities. Only the
// system scope is rewritten: envelope.system plus messages whose role is exactly
// `system`. User, assistant and tool content is returned by reference and never
// modified, so a user message that merely mentions the product name is intact.

export const REWRITE_TARGET_NAME = 'WorkBuddy'

// Ordered longest first: once the full two-word identity has been normalized no
// shorter fragment of it survives, so a single ordered pass is enough.
const PATTERNS = [
  { match: /You are Claude Code, Anthropic's official CLI for Claude/giu, replace: 'You are WorkBuddy, a coding agent', pathGuard: false },
  { match: /Anthropic's official CLI for Claude/giu, replace: REWRITE_TARGET_NAME, pathGuard: false },
  { match: /Claude Code/giu, replace: REWRITE_TARGET_NAME, pathGuard: false },
  // Guarded: the same words appear inside runtime-context paths such as
  // "D:\\DeepSeek Harness\\resources\\app.asar\\dsh", which must stay valid.
  { match: /DeepSeek Harness/giu, replace: REWRITE_TARGET_NAME, pathGuard: true }
]

const PATH_SEPARATORS = new Set(['/', '\\'])

function looksLikePath(text, index) {
  let cursor = index - 1
  while (cursor >= 0 && (text[cursor] === ' ' || text[cursor] === '\t')) cursor -= 1
  return cursor >= 0 && PATH_SEPARATORS.has(text[cursor])
}

function applyPattern(text, pattern) {
  pattern.match.lastIndex = 0
  let output = ''
  let consumed = 0
  let hits = 0
  for (const found of text.matchAll(pattern.match)) {
    const at = found.index ?? 0
    if (pattern.pathGuard && looksLikePath(text, at)) continue
    output += text.slice(consumed, at) + pattern.replace
    consumed = at + found[0].length
    hits += 1
  }
  return hits === 0 ? { text, hits: 0 } : { text: output + text.slice(consumed), hits }
}

// Reports identity names still present in a text, split into two buckets.
//
// `guarded` counts matches immediately preceded by a path separator: those are
// legitimate runtime paths (see the pathGuard note above) and are intentionally
// left alone. `uncovered` counts everything else, i.e. text that would still
// reach upstream carrying the old identity. Reuses the same PATTERNS table and
// the same looksLikePath() helper so no second, drifting regex ever exists.
export function scanIdentities(text) {
  if (typeof text !== 'string' || text.length === 0) return { total: 0, guarded: 0, uncovered: 0, names: [] }
  let total = 0
  let guarded = 0
  const names = new Set()
  for (const pattern of PATTERNS) {
    pattern.match.lastIndex = 0
    for (const found of text.matchAll(pattern.match)) {
      total += 1
      if (pattern.pathGuard && looksLikePath(text, found.index ?? 0)) {
        guarded += 1
        continue
      }
      names.add(found[0])
    }
  }
  return { total, guarded, uncovered: total - guarded, names: [...names].slice(0, 8) }
}

export function rewriteClientNames(text) {
  if (typeof text !== 'string' || text.length === 0) return { text, hits: 0 }
  let current = text
  let hits = 0
  for (const pattern of PATTERNS) {
    const applied = applyPattern(current, pattern)
    current = applied.text
    hits += applied.hits
  }
  return { text: current, hits }
}

function rewriteTextBlock(block) {
  if (!block || typeof block !== 'object' || block.type !== 'text' || typeof block.text !== 'string') return { block, hits: 0 }
  const applied = rewriteClientNames(block.text)
  return applied.hits === 0 ? { block, hits: 0 } : { block: { ...block, text: applied.text }, hits: applied.hits }
}

function rewriteContent(content) {
  if (typeof content === 'string') {
    const applied = rewriteClientNames(content)
    return applied.hits === 0 ? { content, hits: 0 } : { content: applied.text, hits: applied.hits }
  }
  if (!Array.isArray(content)) return { content, hits: 0 }
  let hits = 0
  const blocks = content.map((block) => {
    const applied = rewriteTextBlock(block)
    hits += applied.hits
    return applied.block
  })
  return hits === 0 ? { content, hits: 0 } : { content: blocks, hits }
}

// Returns the rewritten system scope plus a hit count. `hits: 0` means every
// returned reference is the exact input object, which callers can assert on.
export function rewriteSystemScope(envelope, options = {}) {
  const system = envelope?.system
  const messages = Array.isArray(envelope?.messages) ? envelope.messages : []
  if (options.enabled === false) return { system, messages, hits: 0 }
  let hits = 0
  let nextSystem = system
  if (Array.isArray(system)) {
    const blocks = system.map((block) => {
      const applied = rewriteTextBlock(block)
      hits += applied.hits
      return applied.block
    })
    if (hits > 0) nextSystem = blocks
  } else {
    const applied = rewriteClientNames(system)
    hits += applied.hits
    if (applied.hits > 0) nextSystem = applied.text
  }
  let changedMessages = false
  const nextMessages = messages.map((message) => {
    if (!message || message.role !== 'system') return message
    const applied = rewriteContent(message.content)
    if (applied.hits === 0) return message
    changedMessages = true
    hits += applied.hits
    return { ...message, content: applied.content }
  })
  return { system: nextSystem, messages: changedMessages ? nextMessages : messages, hits }
}
