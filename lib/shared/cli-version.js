// Which official CLI builds the isolated-account mode is willing to drive.
//
// The gate is a shape check plus a minimum version, not an exact allow-list: an
// allow-list blocked a plain CLI upgrade and made the whole account page look broken.
// A build newer than the verified range is allowed with a warning, while anything
// below the minimum -- or not a version at all -- stays blocked.
export const ACCOUNT_CLI_MIN_VERSION = '2.174.0'
export const ACCOUNT_CLI_VERIFIED_VERSIONS = Object.freeze(['2.174.0', '2.177.0', '2.185.0'])
export const ACCOUNT_CLI_VERSION = ACCOUNT_CLI_VERIFIED_VERSIONS.join(' / ')

const SHAPE = /^(\d{1,4})\.(\d{1,4})\.(\d{1,4})$/u

export function parseCliVersion(value) {
  const match = SHAPE.exec(String(value ?? '').trim())
  return match ? [Number(match[1]), Number(match[2]), Number(match[3])] : null
}

export function compareCliVersions(left, right) {
  const a = parseCliVersion(left)
  const b = parseCliVersion(right)
  if (!a || !b) return null
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] < b[index] ? -1 : 1
  }
  return 0
}

// 'verified' | 'unverified' | 'unsupported'
export function cliVersionVerdict(version) {
  const parsed = parseCliVersion(version)
  if (!parsed) return 'unsupported'
  if (compareCliVersions(version, ACCOUNT_CLI_MIN_VERSION) < 0) return 'unsupported'
  return ACCOUNT_CLI_VERIFIED_VERSIONS.includes(String(version).trim()) ? 'verified' : 'unverified'
}
