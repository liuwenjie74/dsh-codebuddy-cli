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
export async function probeRegionConnectivity({ region = 'intl', timeoutMs = 5000, fetchImpl = fetch, env = process.env } = {}) {
  const key = region === 'intl' ? 'intl' : 'cn'
  const target = PROBE_TARGETS[key]
  const facts = networkFacts(env)
  const network = { ...facts, verdict: networkVerdict(facts) }
  const startedAt = Date.now()
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), Math.max(1000, Math.min(15000, Number(timeoutMs) || 5000)))
  try {
    const response = await fetchImpl(target, {
      method: 'HEAD',
      cache: 'no-store',
      redirect: 'manual',
      signal: controller.signal
    })
    const elapsedMs = Math.max(0, Date.now() - startedAt)
    return { ok: true, region: key, target, status: Number(response?.status) || 0, elapsedMs, code: '', message: '', network }
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
        ? (key === 'intl' ? '连接国际站超时，请切换代理节点、开启 TUN 模式或检查网络。' : '连接国内官方服务超时，请检查本地网络或代理配置。')
        : (rawReason || '网络连接失败，请检查网络或代理设置。'),
      network
    }
  } finally {
    clearTimeout(timer)
  }
}
