import http from 'node:http'
import https from 'node:https'
import tls from 'node:tls'

// Network capability facts: what proxy and custom CA the running process actually
// has, so "why does the outbound request fail" becomes diagnosable instead of a
// guess. This module performs NO network I/O and stores nothing.
//
// Why read the environment instead of adding config switches: Node's built-in
// fetch does not consult HTTPS_PROXY on its own, and a custom CA needs
// NODE_EXTRA_CA_CERTS at process start. Both are process-level facts, so a plugin
// switch could only lie about them. Reporting the real values is the honest
// version of the feature -- and it is what the user needs when a corporate proxy
// or a TLS-inspecting gateway blocks the call.
const PROXY_KEYS = ['HTTPS_PROXY', 'https_proxy', 'HTTP_PROXY', 'http_proxy', 'ALL_PROXY', 'all_proxy']

// Proxy URLs routinely embed credentials; only the endpoint ever leaves this file.
function endpointOf(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  try {
    const parsed = new URL(/^[a-z][a-z0-9+.-]*:\/\//iu.test(raw) ? raw : 'http://' + raw)
    return parsed.protocol + '//' + parsed.host
  } catch {
    return '(unparsable)'
  }
}

export function networkFacts(env = process.env) {
  const key = PROXY_KEYS.find(name => typeof env?.[name] === 'string' && env[name].trim())
  const caFile = typeof env?.NODE_EXTRA_CA_CERTS === 'string' ? env.NODE_EXTRA_CA_CERTS.trim() : ''
  return {
    // Empty string means "no proxy configured", never "unknown".
    proxy: key ? endpointOf(env[key]) : '',
    proxyFrom: key || '',
    caFile,
    // Node >= 24 needs this flag before built-in fetch honours the proxy vars.
    envProxyEnabled: String(env?.NODE_USE_ENV_PROXY ?? '') === '1',
    nodeMajor: Number(String(process.versions.node ?? '').split('.')[0]) || 0
  }
}

// A short honest verdict: configured, configured-but-inert, or absent.
export function networkVerdict(facts) {
  if (!facts || typeof facts !== 'object') return 'unknown'
  if (facts.proxy) return facts.nodeMajor >= 24 && facts.envProxyEnabled ? 'proxy-active' : 'proxy-inert'
  return facts.caFile ? 'ca-only' : 'direct'
}

const PROBE_TARGETS = {
  cn: 'https://www.codebuddy.cn',
  intl: 'https://www.codebuddy.ai'
}

// Lightweight connectivity probe (HEAD, zero credentials, bounded timeout).
// Distinguishes a dead/blackholed proxy node from an ordinary CLI stall in seconds.
export function validProxyUrl(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return true
  if (raw.length > 512 || /[\x00-\x1f\x7f\s]/u.test(raw)) return false
  try {
    const parsed = new URL(raw)
    return ['http:', 'https:', 'socks5:', 'socks5h:'].includes(parsed.protocol) && Boolean(parsed.hostname)
  } catch {
    return false
  }
}

function probeViaHttpProxy(targetUrl, proxyUrl, timeoutMs) {
  return new Promise((resolve, reject) => {
    const target = new URL(targetUrl)
    const proxy = new URL(proxyUrl)
    const host = target.hostname
    const port = Number(target.port) || 443
    const client = proxy.protocol === 'https:' ? https : http
    const auth = (proxy.username || proxy.password)
      ? 'Basic ' + Buffer.from(`${decodeURIComponent(proxy.username)}:${decodeURIComponent(proxy.password)}`).toString('base64')
      : ''
    let settled = false
    const finish = (err, val) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (err) reject(err)
      else resolve(val)
    }
    const req = client.request({
      host: proxy.hostname,
      port: Number(proxy.port) || (proxy.protocol === 'https:' ? 443 : 80),
      method: 'CONNECT',
      path: `${host}:${port}`,
      headers: { Host: `${host}:${port}`, ...(auth ? { 'Proxy-Authorization': auth } : {}) }
    })
    let tlsSocket = null
    const timer = setTimeout(() => {
      try { req.destroy() } catch {}
      try { tlsSocket?.destroy() } catch {}
      const err = new Error('proxy probe timeout')
      err.name = 'TimeoutError'
      finish(err)
    }, timeoutMs)
    req.once('error', (err) => finish(err))
    req.once('connect', (res, socket) => {
      if (res.statusCode !== 200) {
        try { socket.destroy() } catch {}
        return finish(new Error(`proxy CONNECT HTTP ${res.statusCode}`))
      }
      tlsSocket = tls.connect({ socket, servername: host }, () => {
        tlsSocket.write(`HEAD / HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\n\r\n`)
      })
      let buf = ''
      tlsSocket.setEncoding('utf8')
      tlsSocket.on('data', (chunk) => {
        buf += chunk
        const m = /^HTTP\/\d\.\d\s+(\d{3})/u.exec(buf)
        if (m) {
          try { tlsSocket.destroy() } catch {}
          finish(null, { status: Number(m[1]) })
        }
      })
      tlsSocket.once('error', (err) => finish(err))
      tlsSocket.once('end', () => {
        const m = /^HTTP\/\d\.\d\s+(\d{3})/u.exec(buf)
        if (m) finish(null, { status: Number(m[1]) })
        else finish(new Error('empty response from target via proxy'))
      })
    })
    req.end()
  })
}

export async function probeRegionConnectivity({ region = 'intl', timeoutMs = 5000, fetchImpl = fetch, env = process.env, proxyUrl = '' } = {}) {
  const key = region === 'intl' ? 'intl' : 'cn'
  const target = PROBE_TARGETS[key]
  const cleanProxy = String(proxyUrl ?? '').trim()
  const effectiveEnv = cleanProxy ? { ...env, HTTPS_PROXY: cleanProxy } : env
  const facts = networkFacts(effectiveEnv)
  const network = { ...facts, verdict: networkVerdict(facts) }
  const startedAt = Date.now()
  const boundedTimeout = Math.max(1000, Math.min(15000, Number(timeoutMs) || 5000))
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), boundedTimeout)
  try {
    let response
    if (cleanProxy && fetchImpl === fetch && /^https?:/iu.test(cleanProxy)) {
      response = await probeViaHttpProxy(target, cleanProxy, boundedTimeout)
    } else {
      response = await fetchImpl(target, {
        method: 'HEAD',
        cache: 'no-store',
        redirect: 'manual',
        signal: controller.signal
      })
    }
    const elapsedMs = Math.max(0, Date.now() - startedAt)
    return { ok: true, region: key, target, status: Number(response?.status) || 0, elapsedMs, code: '', message: '', network, viaProxy: cleanProxy ? endpointOf(cleanProxy) : '' }
  } catch (error) {
    const elapsedMs = Math.max(0, Date.now() - startedAt)
    const timedOut = controller.signal.aborted || error?.name === 'AbortError' || error?.name === 'TimeoutError'
    const rawReason = String(error?.cause?.code || error?.code || error?.message || '').replace(/[^a-zA-Z0-9_.:/ -]/gu, ' ').trim().slice(0, 120)
    return {
      ok: false,
      region: key,
      target,
      status: 0,
      elapsedMs,
      code: timedOut ? 'PROBE_TIMEOUT' : 'PROBE_FAILED',
      message: timedOut
        ? (key === 'intl' ? '连接国际站超时，请切换代理节点、开启 TUN 模式或检查代理地址。' : '连接国内官方服务超时，请检查本地网络或代理配置。')
        : (rawReason || '网络连接失败，请检查网络或代理设置。'),
      network,
      viaProxy: cleanProxy ? endpointOf(cleanProxy) : ''
    }
  } finally {
    clearTimeout(timer)
  }
}
