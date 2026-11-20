const HOST_SHAPE = /^(?:localhost|\[::1\]|127(?:\.\d{1,3}){3})(?::\d{1,5})?$/iu

export function isLoopbackHost(hostHeader) {
  if (typeof hostHeader !== 'string' || hostHeader.length > 260 || !HOST_SHAPE.test(hostHeader)) return false
  try {
    const hostname = new URL(`http://${hostHeader}`).hostname.toLowerCase().replace(/^\[|\]$/gu, '')
    return hostname === 'localhost' || hostname === '::1' || /^127(?:\.\d{1,3}){3}$/u.test(hostname)
  } catch { return false }
}

export function trustedLocalRequest(req, mutation = false) {
  if (!isLoopbackHost(req.headers?.host)) return false
  if (mutation && (req.headers['x-dsh-codebuddy-action'] !== '1'
    || req.headers['content-type']?.split(';')[0].trim() !== 'application/json')) return false
  const origin = req.headers?.origin
  if (origin === undefined) return true
  try {
    const parsed = new URL(origin)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && isLoopbackHost(parsed.host)
      && (!mutation || parsed.host.toLowerCase() === req.headers.host.toLowerCase())
  } catch { return false }
}

export async function readLocalJson(req, maxBytes = 262144) {
  const chunks = []
  let total = 0
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(String(chunk), 'utf8')
    total += buf.length
    if (total > maxBytes) throw new Error('request-too-large')
    chunks.push(buf)
  }
  const value = JSON.parse(Buffer.concat(chunks, total).toString('utf8'))
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid-json')
  return value
}

export async function readAction(req, allowed = ['setup', 'refreshModels']) {
  const action = (await readLocalJson(req, 2048)).action
  if (!allowed.includes(action)) throw new Error('unknown-action')
  return action
}
