import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ACCOUNT_CLI_VERIFIED_VERSIONS,
  cliVersionVerdict,
  compareCliVersions,
  parseCliVersion
} from '../lib/shared/cli-version.js'

// The gate used to be an exact allow-list, so a plain CLI upgrade (2.178.1) made the
// whole account page refuse to work. These assertions pin the replacement rule: shape
// plus a floor, where anything above the verified range is usable but reported as
// unverified, and anything below the floor stays blocked.

test('every verified build is reported as verified', () => {
  for (const version of ACCOUNT_CLI_VERIFIED_VERSIONS) assert.equal(cliVersionVerdict(version), 'verified')
})

test('a build newer than the verified range is allowed but flagged', () => {
  for (const version of ['2.178.0', '2.178.1', '2.175.0', '3.0.0', '10.0.0']) {
    assert.equal(cliVersionVerdict(version), 'unverified', `${version} must be usable`)
  }
})

test('an unparsable or too old build stays unsupported', () => {
  for (const version of ['2.173.9', '2.100.0', '1.999.0', '2.177.0-beta.1', '2.174', 'v2.174.0', '', '   ', 'abc', null, undefined]) {
    assert.equal(cliVersionVerdict(version), 'unsupported', `${String(version)} must be refused`)
  }
})

test('versions compare numerically, not as strings', () => {
  assert.deepEqual(parseCliVersion('2.178.1'), [2, 178, 1])
  assert.equal(parseCliVersion('2.178.1-beta'), null)
  assert.equal(compareCliVersions('2.9.0', '2.10.0'), -1)
  assert.equal(compareCliVersions('2.174.0', '2.174.0'), 0)
  assert.equal(compareCliVersions('3.0.0', '2.999.999'), 1)
  assert.equal(compareCliVersions('nope', '2.174.0'), null, 'a bad input yields no verdict rather than a guess')
  assert.equal(compareCliVersions('2.174.0', undefined), null)
})
