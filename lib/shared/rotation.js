// Account failover for the isolated accounts.
//
// The host pins an account into the model id it asks for, so rotation cannot be a
// per-request round robin: switching on every call would also destroy the prompt
// cache and the CLI's own session warmth. What it can do is stay sticky and step
// aside only when an account has actually run out of quota, which is what these
// pure helpers decide.
export const EXHAUSTED_TTL_MS = 10 * 60 * 1000

// A quota failure is the only error worth failing over: auth, context and tool
// errors would simply repeat on the next account and hide the real cause.
export function isQuotaError(error) {
  if (!error) return false
  if (error.code === 'CLI_INSUFFICIENT_BALANCE') return true
  return error.status === 402
}

// Sticky order: the account already serving stays first, so an ordinary request
// keeps its cache prefix until it genuinely runs out.
export function orderCandidates(ids, currentId) {
  const list = [...new Set((ids || []).filter(id => typeof id === 'string' && id))]
  if (!currentId || !list.includes(currentId)) return list
  return [currentId, ...list.filter(id => id !== currentId)]
}

export function pickCandidate(ids, currentId, exhausted = new Set()) {
  return orderCandidates(ids, currentId).find(id => !exhausted.has(id)) ?? null
}
