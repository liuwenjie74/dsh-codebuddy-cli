import test from 'node:test'
import assert from 'node:assert/strict'
import { EXHAUSTED_TTL_MS, isQuotaError, orderCandidates, pickCandidate } from '../lib/shared/rotation.js'

// Rotation stays sticky and only steps aside when an account has actually run out of
// quota, because the host pins an account into the model id: a per-request round robin
// would also destroy the prompt cache. These helpers are the whole decision surface.

test('only a quota failure is worth failing over', () => {
  assert.equal(isQuotaError({ code: 'CLI_INSUFFICIENT_BALANCE' }), true)
  assert.equal(isQuotaError({ status: 402 }), true)
  // Anything else would simply repeat on the next account and hide the real cause.
  for (const error of [{ status: 401 }, { status: 429 }, { code: 'CLI_TIMEOUT' }, {}, null, undefined, 'boom']) {
    assert.equal(isQuotaError(error), false, `${JSON.stringify(error)} must not fail over`)
  }
})

test('the serving account keeps its place in the order', () => {
  assert.deepEqual(orderCandidates(['a', 'b', 'c'], 'b'), ['b', 'a', 'c'])
  // An account that is no longer listed cannot jump the queue.
  assert.deepEqual(orderCandidates(['a', 'b'], 'gone'), ['a', 'b'])
  assert.deepEqual(orderCandidates(['a', 'b'], null), ['a', 'b'])
  // Duplicates and junk collapse, so a corrupt store cannot multiply candidates.
  assert.deepEqual(orderCandidates(['a', 'a', 'b', '', null, 3, 'b'], 'a'), ['a', 'b'])
  assert.deepEqual(orderCandidates(null, 'a'), [])
  assert.deepEqual(orderCandidates(undefined), [])
})

test('an exhausted account is skipped until something is left', () => {
  assert.equal(pickCandidate(['a', 'b', 'c'], 'a', new Set()), 'a', 'a healthy current account is kept')
  assert.equal(pickCandidate(['a', 'b', 'c'], 'a', new Set(['a'])), 'b', 'the next candidate takes over')
  assert.equal(pickCandidate(['a', 'b', 'c'], 'b', new Set(['b', 'c'])), 'a')
  assert.equal(pickCandidate(['a', 'b'], 'a', new Set(['a', 'b'])), null, 'no candidate means no silent fallback')
  assert.equal(pickCandidate([], 'a', new Set()), null)
})

test('the exhaustion window is short enough to recover on its own', () => {
  // Long enough to stop hammering a drained account, short enough that a top-up is
  // picked up without a restart.
  assert.ok(EXHAUSTED_TTL_MS >= 60 * 1000)
  assert.ok(EXHAUSTED_TTL_MS <= 60 * 60 * 1000)
})
