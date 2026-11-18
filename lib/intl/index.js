import z from '@deepseek-ai/schemastery'
import { LlmAdapter } from '@deepseek-ai/dsh-llm'
import { CodeBuddyCliError, collectStructuredResult } from './cli-response.js'
import { runProcess } from './cli-process.js'
import { cliEnv, inspectCli, resolveCli, ensureCli, loginCommand } from './cli-runtime.js'
import { createModelCatalog, queryModelCatalog, modelInfo } from './model-catalog.js'
import { trustedLocalRequest, readAction, readLocalJson } from './local-http.js'
import { cliInvocation } from './cli-invocation.js'
import { normalizeCliUsage } from './usage.js'
import { makeImageStreamInput, makeRequest, MODEL_SYSTEM_PROMPT, inlineImageDataUriStats, assertInlineImageDataUriBudget } from './request.js'
import { hasImageBlocks, hasRetainedImageBlocks, imageTarget, prepareImages } from './images.js'
import { runImageProcess } from './cli-image-process.js'
import { parseStructuredResponse } from './model-response.js'
import { createDiagnosticsStore, sanitizeRequestDiagnostics } from './diagnostics.js'
import { performance } from 'node:perf_hooks'
import { randomUUID } from 'node:crypto'
import { access, stat } from 'node:fs/promises'
import { constants } from 'node:fs'
import { createAccountStore, accountModelId } from './accounts.js'
import { createModelPrefs, validModelId } from './model-prefs.js'
import { PLUGIN_VERSION } from '../shared/version.js'

export const name = 'llm-codebuddy-cli-intl'
export const inject = ['llm', 'attachments']

const PROVIDER = 'codebuddy-cli-intl'
const STATUS_PATH = '/plugins/dsh-codebuddy-cli-intl/status'
const ACTION_PATH = '/plugins/dsh-codebuddy-cli-intl/actions'
const DIAGNOSTICS_PATH = '/plugins/dsh-codebuddy-cli-intl/diagnostics'
const ACCOUNTS_PATH = '/plugins/dsh-codebuddy-cli-intl/accounts'
const DEFAULT_MODEL = ''
const DEFAULT_EFFORT = ''
const OFFICIAL_HOME = 'https://www.codebuddy.ai'

export const Config = z.object({
  cliPath: z.string().description('CodeBuddy CLI 可执行文件路径；留空时自动检测当前电脑的安装位置。').default('').volatile(),
  configDir: z.string().description('可选：默认单账号登录配置目录。多账号请使用账号管理分别隔离 CLI 配置与 Windows 用户目录。').default('').volatile(),
  model: z.string().description('默认模型 ID（可选）；模型目录自动检测，实际使用 DSH 会话中选择的模型。').default(DEFAULT_MODEL).volatile(),
  effort: z.string().description('默认推理强度（可选）；留空时跟随模型默认值，可选项从 CLI 自动检测。').default(DEFAULT_EFFORT).volatile(),
  timeoutMs: z.number().description('单次 CLI 调用超时（毫秒）。').default(180000).volatile(),
  rewriteClientNames: z.boolean().description('覆盖标识：把系统提示中的客户端自称替换为 WorkBuddy（大小写不敏感，仅系统提示范围）。').default(true).volatile(),
  captureRequestSamples: z.boolean().description('采集脱敏请求样本：把每次请求的系统提示范围（已脱敏、已截断）另存到诊断目录，默认关闭。').default(false).volatile()
})

const runtimeStatus = {
  activeCalls: 0,
  cliCheck: { state: 'not-checked' },
  setup: { state: 'idle' },
  totals: { calls: 0, inputTokens: 0, uncachedInputTokens: 0, cacheReadTokens: 0, cacheWriteTokens: 0, outputTokens: 0, toolCalls: 0,
    cancelledRequests: 0, imageOffloadRequests: 0, offloadImagesRequested: 0, historyOffloadedImages: 0 },
  // 2.1.0 usage aggregation (in-memory only: no new storage format, no network).
  today: { date: '', calls: 0, inputTokens: 0, outputTokens: 0 },
  perModel: new Map(),
  recentCalls: [],
  lastCall: undefined,
  recentFailures: [],
  modelFallback: null
}
const accountUsage = new Map()
const accountLastUsed = new Map()

function emptyAccountUsage() {
  return { calls: 0, inputTokens: 0, outputTokens: 0, cancelledRequests: 0,
    imageOffloadRequests: 0, offloadImagesRequested: 0, historyOffloadedImages: 0 }
}

function accountUsageFor(key) {
  const usage = accountUsage.get(key) || emptyAccountUsage()
  for (const [name, value] of Object.entries(emptyAccountUsage())) {
    if (!Number.isSafeInteger(usage[name]) || usage[name] < 0) usage[name] = value
  }
  return usage
}

function outcomeFacts(errorCode, offloadImagesRequested = 0, diagnostics) {
  const facts = {}
  if (errorCode === 'ABORTED') facts.cancelled = true
  if (errorCode === 'IMAGE_OFFLOAD_REQUIRED' && Number.isSafeInteger(offloadImagesRequested)
    && offloadImagesRequested > 0 && offloadImagesRequested <= 1_000_000) facts.offloadImagesRequested = offloadImagesRequested
  if (Number.isSafeInteger(diagnostics?.offloadedImageCount) && diagnostics.offloadedImageCount > 0
    && diagnostics.offloadedImageCount <= 1_000_000) facts.historyOffloadedImages = diagnostics.offloadedImageCount
  return facts
}

function applyOutcomeCounters(target, facts) {
  if (facts.cancelled) target.cancelledRequests += 1
  if (facts.offloadImagesRequested) {
    target.imageOffloadRequests += 1
    target.offloadImagesRequested += facts.offloadImagesRequested
  }
  target.historyOffloadedImages += facts.historyOffloadedImages || 0
}

function currentValue(value, fallback) {
  if (value !== null && typeof value === 'object' && typeof value.get === 'function') {
    return currentValue(value.get(), fallback)
  }
  return value === undefined || value === null ? fallback : value
}

function configOf(config) {
  return {
    cliPath: String(currentValue(config?.cliPath, '')).trim(),
    configDir: String(currentValue(config?.configDir, '')).trim(),
    model: String(currentValue(config?.model, DEFAULT_MODEL)).trim() || DEFAULT_MODEL,
    effort: String(currentValue(config?.effort, DEFAULT_EFFORT)).trim() || DEFAULT_EFFORT,
    timeoutMs: clampNumber(currentValue(config?.timeoutMs, 180000), 15000, 600000, 180000),
    rewriteClientNames: currentValue(config?.rewriteClientNames, true) !== false,
    captureRequestSamples: currentValue(config?.captureRequestSamples, false) === true
  }
}

function clampNumber(value, min, max, fallback) {
  const n = Number(value)
  return Number.isSafeInteger(n) ? Math.max(min, Math.min(max, n)) : fallback
}

async function checkCli(config, signal) {
  runtimeStatus.cliCheck = { state: 'checking' }
  try {
    runtimeStatus.cliCheck = { state: 'available', ...await inspectCli(config, { signal }) }
  } catch (error) {
    runtimeStatus.cliCheck = { state: 'unavailable', code: safeErrorCode(error), checkedAt: Date.now() }
  }
  return runtimeStatus.cliCheck
}

function safeErrorCode(error) {
  return error instanceof CodeBuddyCliError ? error.code : 'CLI_ERROR'
}

function safeMessage(error) {
  if (error instanceof CodeBuddyCliError) return error.message
  return 'CodeBuddy CLI 调用失败；请检查登录状态与 CLI 配置。'
}

function requestTools(options) {
  const source = options.tools ?? options.toolHistory?.tools ?? []
  return source.filter((tool) => tool && typeof tool.name === 'string' && tool.name.length > 0)
    .map((tool) => ({
      name: tool.name,
      description: typeof tool.description === 'string' ? tool.description : '',
      parameters: tool.parameters && typeof tool.parameters === 'object' && !Array.isArray(tool.parameters)
        ? tool.parameters
        : { type: 'object', properties: {} }
    }))
}

function outputSchema(tools) {
  const names = [...new Set(tools.map((tool) => tool.name))]
  const toolNameSchema = names.length > 0
    ? { type: 'string', enum: names }
    : { type: 'string' }
  return {
    type: 'object',
    additionalProperties: false,
    properties: {
      text: { type: 'string' },
      toolCalls: {
        type: 'array',
        ...(names.length === 0 ? { maxItems: 0 } : {}),
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: toolNameSchema,
            arguments: { type: 'object' }
          },
          required: ['name', 'arguments']
        }
      }
    },
    required: ['text', 'toolCalls']
  }
}

function rememberFailure(call) {
  runtimeStatus.recentFailures.unshift({
    id: call.id, at: call.at, model: call.model, errorCode: call.errorCode, errorMessage: call.errorMessage,
    durationMs: call.durationMs, diagnostics: call.diagnostics,
    processDiagnostics: call.processDiagnostics, responseDiagnostics: call.responseDiagnostics
  })
  runtimeStatus.recentFailures.length = Math.min(runtimeStatus.recentFailures.length, 5)
}

function recordPreflightFailure({ id, config, error, durationMs }) {
  runtimeStatus.totals.calls += 1
  const key = config.accountId || 'legacy'
  const total = accountUsageFor(key)
  total.calls += 1
  const facts = outcomeFacts(safeErrorCode(error))
  applyOutcomeCounters(runtimeStatus.totals, facts)
  applyOutcomeCounters(total, facts)
  accountUsage.set(key, total)
  runtimeStatus.lastCall = {
    id, state: 'error', ...(config.accountId ? { accountId: config.accountId } : {}),
    model: config.model || 'CLI default', at: Date.now(), errorCode: safeErrorCode(error),
    errorMessage: safeMessage(error), durationMs, ...facts
  }
  rememberFailure(runtimeStatus.lastCall)
}

// ---- 2.1.0 usage aggregation -------------------------------------------------
// Same three derived views as the CN side: a per-day counter, a per-model token
// tally and a bounded call ring, all derived from calls recordCall already sees.
function dayKey(at = Date.now()) {
  const date = new Date(at)
  const pad = (value) => String(value).padStart(2, '0')
  return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
}

function addToday(at, inputTokens, outputTokens) {
  const key = dayKey(at)
  if (runtimeStatus.today.date !== key) runtimeStatus.today = { date: key, calls: 0, inputTokens: 0, outputTokens: 0 }
  runtimeStatus.today.calls += 1
  runtimeStatus.today.inputTokens += inputTokens
  runtimeStatus.today.outputTokens += outputTokens
}

function addPerModel(model, inputTokens, outputTokens) {
  if (!model) return
  const entry = runtimeStatus.perModel.get(model) || { calls: 0, inputTokens: 0, outputTokens: 0 }
  entry.calls += 1
  entry.inputTokens += inputTokens
  entry.outputTokens += outputTokens
  runtimeStatus.perModel.set(model, entry)
}

function rememberRecentCall(call) {
  if (!call) return
  runtimeStatus.recentCalls.unshift({
    id: call.id, at: call.at, model: call.model, state: call.state, durationMs: call.durationMs,
    inputTokens: call.inputTokens, outputTokens: call.outputTokens, toolCalls: call.toolCalls,
    ...(call.errorCode ? { errorCode: call.errorCode } : {})
  })
  runtimeStatus.recentCalls.length = Math.min(runtimeStatus.recentCalls.length, 20)
}

function recordCall({ id, state, config, usage, modelUsage, diagnostics, durationMs, toolCalls = 0, errorCode, errorMessage, processDiagnostics, responseDiagnostics, imageRequest = false, offloadImagesRequested = 0 }) {
  const normalized = normalizeCliUsage(usage, modelUsage)
  const facts = outcomeFacts(errorCode, offloadImagesRequested, diagnostics)
  runtimeStatus.totals.calls += 1
  runtimeStatus.totals.inputTokens += normalized.inputTokens + normalized.cacheReadTokens + normalized.cacheWriteTokens
  runtimeStatus.totals.uncachedInputTokens += normalized.inputTokens
  runtimeStatus.totals.cacheReadTokens += normalized.cacheReadTokens
  runtimeStatus.totals.cacheWriteTokens += normalized.cacheWriteTokens
  runtimeStatus.totals.outputTokens += normalized.outputTokens
  runtimeStatus.totals.toolCalls += toolCalls
  applyOutcomeCounters(runtimeStatus.totals, facts)
  const usageKey = config.accountId || 'legacy'
  const perAccount = accountUsageFor(usageKey)
  perAccount.calls += 1
  perAccount.inputTokens += normalized.inputTokens + normalized.cacheReadTokens + normalized.cacheWriteTokens
  perAccount.outputTokens += normalized.outputTokens
  applyOutcomeCounters(perAccount, facts)
  accountUsage.set(usageKey, perAccount)
  runtimeStatus.lastCall = {
    id,
    state,
    ...(config.accountId ? { accountId: config.accountId } : {}),
    model: config.model,
    at: Date.now(),
    inputTokens: normalized.inputTokens + normalized.cacheReadTokens + normalized.cacheWriteTokens,
    outputTokens: normalized.outputTokens,
    uncachedInputTokens: normalized.inputTokens,
    cacheReadTokens: normalized.cacheReadTokens,
    cacheWriteTokens: normalized.cacheWriteTokens,
    durationMs,
    diagnostics,
    ...(imageRequest ? { imageRequest: true } : {}),
    ...facts,
    ...(responseDiagnostics ? { responseDiagnostics } : {}),
    usageSource: modelUsage ? 'cli-model-usage' : 'cli-aggregate',
    toolCalls,
    ...(errorCode ? { errorCode, errorMessage, processDiagnostics } : {})
  }
  addToday(runtimeStatus.lastCall.at, runtimeStatus.lastCall.inputTokens || 0, normalized.outputTokens)
  addPerModel(config.model, runtimeStatus.lastCall.inputTokens || 0, normalized.outputTokens)
  rememberRecentCall(runtimeStatus.lastCall)
  if (config.accountId) accountLastUsed.set(config.accountId, runtimeStatus.lastCall.at)
  if (errorCode) rememberFailure(runtimeStatus.lastCall)
  return normalized
}

async function publicStatus(config, catalog, logs, accounts, prefs) {
  const accountState = await accounts.snapshot()
  for (const account of accountState.accounts) {
    account.usage = accountUsageFor(account.id)
    // Process-scoped: the account index on disk is deliberately left untouched.
    account.lastUsedAt = accountLastUsed.get(account.id) ?? null
  }
  return {
    provider: PROVIDER,
    model: config.model,
    effort: config.effort,
    pluginVersion: PLUGIN_VERSION,
    accounts: accountState,
    modelPreferences: await prefs.snapshot(),
    responseMode: 'native-json-schema',
    timeoutMs: config.timeoutMs,
    activeCalls: runtimeStatus.activeCalls,
    cliCheck: runtimeStatus.cliCheck,
    setup: runtimeStatus.setup,
    logs: logs.status(),
    catalog: catalog.snapshot(config),
    loginCommand: accountState.storageError ? '' : config.accountId
      ? accountState.accounts.find(item => item.id === config.accountId)?.loginCommand || ''
      : loginCommand(config, runtimeStatus.cliCheck.path),
    installationGuide: 'https://www.codebuddy.ai/docs/cli/quickstart',
    usage: {
      ...runtimeStatus.totals,
      today: { ...runtimeStatus.today },
      perModel: [...runtimeStatus.perModel]
        .map(([model, stats]) => ({ model, ...stats }))
        .sort((a, b) => (b.inputTokens + b.outputTokens) - (a.inputTokens + a.outputTokens)),
      recentCalls: runtimeStatus.recentCalls,
      lastCall: runtimeStatus.lastCall ?? null,
      modelFallback: runtimeStatus.modelFallback ?? null,
      recentFailures: runtimeStatus.recentFailures
    },
    balance: {
      available: false,
      officialHome: OFFICIAL_HOME
    }
  }
}

function jsonResponse(res, status, value) {
  const body = JSON.stringify(value)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Content-Length': Buffer.byteLength(body)
  })
  res.end(body)
}

function registerStatusRoute(ctx, getConfig, catalog, signal, logs, accounts, prefs) {
  let setupPromise
  const selected = () => accounts.selected(configOf(getConfig()))
  const status = async () => {
    let config
    try { config = await selected() } catch { config = configOf(getConfig()) }
    return publicStatus(config, catalog, logs, accounts, prefs)
  }
  const releaseStatus = ctx.webServer.register({
    kind: 'exact', path: STATUS_PATH,
    handler: async (req, res) => {
      if (req.method !== 'GET') return jsonResponse(res, 405, { error: 'method-not-allowed' })
      if (!trustedLocalRequest(req)) return jsonResponse(res, 403, { error: 'request-not-trusted' })
      try {
        let config
        try { config = await selected() } catch { config = configOf(getConfig()) }
        const url = new URL(req.url ?? STATUS_PATH, 'http://localhost')
        if (url.searchParams.get('checkCli') === '1'
          && (runtimeStatus.cliCheck.checkedAt === undefined || Date.now() - runtimeStatus.cliCheck.checkedAt > 5000)) {
          if (config.accountId) await accounts.assertReady(config, inspectCli, { signal })
          await checkCli(config, signal)
        }
        await logs.ready
        jsonResponse(res, 200, await publicStatus(config, catalog, logs, accounts, prefs))
      } catch { jsonResponse(res, 500, { error: 'status-unavailable' }) }
    }
  })
  const releaseAction = ctx.webServer.register({
    kind: 'exact', path: ACTION_PATH,
    handler: async (req, res) => {
      if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'method-not-allowed' })
      if (!trustedLocalRequest(req, true)) return jsonResponse(res, 403, { error: 'request-not-trusted' })
      let body
      try { body = await readLocalJson(req) } catch { return jsonResponse(res, 400, { error: 'invalid-action' }) }
      const action = body.action
      if (!['setup', 'refreshModels', 'setModelVisibility', 'preflight'].includes(action)) return jsonResponse(res, 400, { error: 'invalid-action' })
      let config
      try { config = await selected() } catch (error) { return jsonResponse(res, 409, { error: safeErrorCode(error), message: safeMessage(error) }) }
      if (action === 'refreshModels') {
        await catalog.get(config, { force: true })
      } else if (action === 'setModelVisibility') {
        const ids = Array.isArray(body.ids) ? body.ids : [body.id]
        if (ids.length === 0 || ids.length > 500 || ids.some((id) => !validModelId(id)) || typeof body.enabled !== 'boolean') {
          return jsonResponse(res, 400, { error: 'invalid-model-visibility' })
        }
        const hidden = await prefs.hiddenSet()
        const models = Array.isArray(catalog.snapshot(config).models) ? catalog.snapshot(config).models : []
        const target = new Set(ids)
        // Judged on the whole batch: disabling a batch that would leave no visible model is
        // rejected atomically. Enabling is never blocked, otherwise a catalog whose models are
        // all hidden could not be recovered.
        const remaining = models.filter((model) => !hidden.has(model.id) && !target.has(model.id))
        if (body.enabled === false && models.length > 0 && remaining.length === 0) {
          return jsonResponse(res, 409, { error: 'MODEL_VISIBILITY_LAST', message: '至少保留一个可用模型；请先启用其他模型，再停用这一个。' })
        }
        try {
          const saved = await prefs.setHiddenMany(ids, body.enabled)
          if (saved.changed) {
            ctx.emit('llm/models-updated', PROVIDER)
            ctx.emit('llm/adapters-updated')
          }
        } catch (error) { return jsonResponse(res, 409, { error: safeErrorCode(error), message: safeMessage(error) }) }
      } else if (action === 'preflight') {
        // Validate the draft about to be saved, not the stored config: configOf()
        // silently clamps timeoutMs on read, so an out-of-range value would
        // otherwise be committed and only corrected at request time.
        const candidate = {
          ...config,
          cliPath: body.cliPath !== undefined ? String(body.cliPath).trim() : config.cliPath,
          configDir: body.configDir !== undefined ? String(body.configDir).trim() : config.configDir,
          timeoutMs: body.timeoutMs !== undefined ? body.timeoutMs : config.timeoutMs
        }
        const checks = []
        const timeout = Number(candidate.timeoutMs)
        checks.push(Number.isSafeInteger(timeout) && timeout >= 15000 && timeout <= 600000
          ? { key: 'timeoutMs', ok: true }
          : { key: 'timeoutMs', ok: false, code: 'PREFLIGHT_TIMEOUT_RANGE' })
        if (candidate.cliPath) {
          try { await resolveCli(candidate); checks.push({ key: 'cliPath', ok: true }) }
          catch (error) { checks.push({ key: 'cliPath', ok: false, code: safeErrorCode(error) }) }
        } else checks.push({ key: 'cliPath', ok: true, skipped: true })
        if (candidate.configDir) {
          try {
            const info = await stat(candidate.configDir)
            if (!info.isDirectory()) throw new CodeBuddyCliError('PREFLIGHT_CONFIG_DIR', 'The config directory must be an existing folder.')
            await access(candidate.configDir, constants.W_OK)
            checks.push({ key: 'configDir', ok: true })
          } catch (error) {
            checks.push({ key: 'configDir', ok: false, code: error instanceof CodeBuddyCliError ? error.code : 'PREFLIGHT_CONFIG_DIR' })
          }
        } else checks.push({ key: 'configDir', ok: true, skipped: true })
        return jsonResponse(res, 200, { ok: checks.every((check) => check.ok), checks })
      } else if (action === 'setup') {
        if (!setupPromise) {
          setupPromise = ensureCli(config, {
            signal,
            onStage: (state) => { runtimeStatus.setup = { state } }
          }).then((result) => {
            runtimeStatus.cliCheck = { state: 'available', path: result.path, version: result.version, checkedAt: result.checkedAt }
            runtimeStatus.setup = { state: 'ready', ...result }
          }).catch((error) => {
            runtimeStatus.setup = { state: 'error', code: safeErrorCode(error), message: safeMessage(error) }
          }).finally(() => { setupPromise = undefined })
        }
        return jsonResponse(res, 202, await status())
      }
      jsonResponse(res, 200, await status())
    }
  })
  const releaseLogs = ctx.webServer.register({
    kind: 'exact', path: DIAGNOSTICS_PATH,
    handler: async (req, res) => {
      if (!['GET', 'POST'].includes(req.method)) return jsonResponse(res, 405, { error: 'method-not-allowed' })
      if (!trustedLocalRequest(req, req.method === 'POST')) return jsonResponse(res, 403, { error: 'request-not-trusted' })
      if (req.method === 'GET') return jsonResponse(res, 200, await logs.export())
      let action
      try { action = await readAction(req, ['armCapture', 'cancelCapture', 'clearLogs', 'exportLogs', 'exportDetailedLogs']) }
      catch { return jsonResponse(res, 400, { error: 'invalid-action' }) }
      if (action === 'exportLogs' || action === 'exportDetailedLogs') return jsonResponse(res, 200, await logs.export(action === 'exportDetailedLogs'))
      if (action === 'armCapture') logs.arm()
      if (action === 'cancelCapture') logs.disarm()
      if (action === 'clearLogs') await logs.clear()
      return jsonResponse(res, 200, await status())
    }
  })
  const releaseAccounts = ctx.webServer.register({
    kind: 'exact', path: ACCOUNTS_PATH,
    handler: async (req, res) => {
      if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'method-not-allowed' })
      if (!trustedLocalRequest(req, true)) return jsonResponse(res, 403, { error: 'request-not-trusted' })
      let body
      try { body = await readLocalJson(req) } catch { return jsonResponse(res, 400, { error: 'invalid-account-action' }) }
      if (!['add', 'select', 'remove', 'prepareLogin'].includes(body.action)) return jsonResponse(res, 400, { error: 'invalid-account-action' })
      try {
        if (body.action === 'add') await accounts.add(body.label)
        if (body.action === 'select') await accounts.select(body.id)
        if (body.action === 'remove') await accounts.remove(body.id)
        if (body.action === 'prepareLogin') await accounts.prepareLogin(configOf(getConfig()), body.id)
        ctx.emit('llm/adapters-updated')
        return jsonResponse(res, 200, await status())
      } catch (error) { return jsonResponse(res, 409, { error: safeErrorCode(error), message: safeMessage(error) }) }
    }
  })
  ctx.effect(() => () => { releaseAccounts(); releaseLogs(); releaseAction(); releaseStatus() }, 'dsh-codebuddy-cli-intl: local routes')
}

class CodeBuddyCliAdapter extends LlmAdapter {
  constructor(getConfig, catalog, logs, attachments, accounts, prefs) {
    super()
    this.getConfig = getConfig
    this.catalog = catalog
    this.logs = logs
    this.attachments = attachments
    this.accounts = accounts
    this.prefs = prefs
  }

  providerInfo(provider) {
    return { id: provider, name: 'CodeBuddy CLI（国际版）' }
  }

  async listModels(provider) {
    const config = await this.accounts.selected(configOf(this.getConfig()))
    const catalog = await this.catalog.get(config)
    const hidden = await this.prefs.hiddenSet()
    const visible = catalog.models.filter((model) => !hidden.has(model.id))
    // Hiding every model would remove this provider from the picker, so a fully hidden catalog falls back to the full list.
    const source = visible.length ? visible : catalog.models
    const models = source.map((model) => ({
      provider,
      id: model.id,
      name: modelInfo(provider, model).name,
      inputModalities: model.supportsImages === true ? ['text', 'image'] : ['text']
    }))
    if (config.model && !hidden.has(config.model) && !models.some((model) => model.id === config.model)) {
      models.push({ provider, id: config.model, name: config.model, inputModalities: ['text'] })
    }
    return config.accountId ? models.map(model => ({ ...model, id: accountModelId(config.accountId, model.id), name: `[${config.accountLabel}] ${model.name}` })) : models
  }

  async resolveModel(provider, model) {
    const routed = await this.accounts.route(configOf(this.getConfig()), model, { required: true })
    const config = routed.config
    await this.accounts.assertReady(config, inspectCli)
    const catalog = await this.catalog.get(config)
    const found = catalog.models.find((item) => item.id === routed.model)
    const info = found ? modelInfo(provider, found, config.effort) : { provider, id: routed.model, name: routed.model, inputModalities: ['text'] }
    return config.accountId ? { ...info, id: accountModelId(config.accountId, routed.model), name: `[${config.accountLabel}] ${info.name}` } : info
  }

  imageRequestTarget(_provider, _model, image) {
    return imageTarget(image)
  }

  async *stream(options) {
    const callId = randomUUID()
    const requestStartedAt = performance.now()
    const routed = await this.accounts.route(configOf(this.getConfig()), options.model, { required: true })
    const config = routed.config
    if (options.signal?.aborted) {
      const error = new CodeBuddyCliError('ABORTED', '请求已取消。')
      recordPreflightFailure({ id: callId, config: { ...config, model: routed.model || config.model || 'CLI default' }, error,
        durationMs: Math.round(performance.now() - requestStartedAt) })
      await this.logs.record(runtimeStatus.lastCall)
      throw error
    }
    const releaseAccount = this.accounts.begin(config)
    const tools = requestTools(options)
    let selectedModel = routed.model || config.model
    const imageHistory = hasImageBlocks(options)
    let catalog
    let model
    let effort = options.reasoningEffort || config.effort
    let callConfig = { ...config, model: selectedModel || 'CLI default' }
    let schema
    let args
    let accountCli
    try {
      accountCli = await this.accounts.assertReady(config, inspectCli, { signal: options.signal })
      catalog = imageHistory && hasRetainedImageBlocks(options)
        ? await this.catalog.get(config)
        : this.catalog.snapshot(config)
      if (!imageHistory) void this.catalog.get(config).catch(() => {})
      // Model fallback chain: requested -> configured default -> first enabled id
      // in the catalog -> CLI default. It cannot rescue a session the host has
      // already refused with session/model-unavailable (that request never
      // reaches this adapter), but it does cover a hidden, stale or
      // account-renamed id that still arrives here. Recomputed only after the
      // catalog is available, so `--model` further down always carries a usable id.
      const hiddenModels = await this.prefs.hiddenSet()
      const requestedModel = routed.model || ''
      // The chain only rejects *disabled* ids, never merely unlisted ones: a
      // manually configured default model may be accepted by the CLI without ever
      // appearing in the catalog (the settings page keeps such values on purpose),
      // and silently swapping it would break exactly that use case.
      const enabledModel = (id) => Boolean(id) && !hiddenModels.has(id)
      const firstEnabled = catalog.models.find((item) => !hiddenModels.has(item.id))?.id || ''
      // An empty request with no usable default stays on the CLI default (no
      // `--model` flag at all) instead of inventing a choice the user never made;
      // only a *requested* model that turned out to be disabled triggers the
      // swap-to-anything-usable step.
      selectedModel = enabledModel(requestedModel) ? requestedModel
        : enabledModel(config.model) ? config.model
          : (requestedModel ? firstEnabled : '')
      runtimeStatus.modelFallback = requestedModel && selectedModel && requestedModel !== selectedModel
        ? { requested: requestedModel, used: selectedModel, at: Date.now() } : null
      model = catalog.models.find((item) => item.id === (selectedModel || catalog.currentModelId))
      if (model && (!model.supportsReasoning || (model.efforts.length && !model.efforts.some((option) => option.id === effort)))) effort = ''
      callConfig = { ...config, model: selectedModel || catalog.currentModelId || 'CLI default' }
      schema = outputSchema(tools)
      args = [
      '--print',
      '--output-format', 'json',
      '--json-schema', JSON.stringify(schema),
      '--tools', 'StructuredOutput',
      '--setting-sources', 'user',
      '--strict-mcp-config',
      '--mcp-config', '{"mcpServers":{}}',
      ...(selectedModel ? ['--model', selectedModel] : []),
      ...(effort ? ['--effort', effort] : []),
      '--max-turns', '4',
      '--no-session-persistence',
      '--system-prompt', MODEL_SYSTEM_PROMPT
      ]
    } catch (error) {
      recordPreflightFailure({ id: callId, config: { ...config, model: routed.model || config.model || 'CLI default' }, error,
        durationMs: Math.round(performance.now() - requestStartedAt) })
      await this.logs.record({ ...runtimeStatus.lastCall, cliVersion: runtimeStatus.cliCheck.version })
      releaseAccount()
      throw error
    }
    runtimeStatus.activeCalls += 1
    let active = true
    const releaseActive = () => {
      if (!active) return
      active = false
      runtimeStatus.activeCalls = Math.max(0, runtimeStatus.activeCalls - 1)
    }
    let raw
    let callProcessDiagnostics
    let diagnostics = {}
    let normalized = normalizeCliUsage({})
    const startedAt = performance.now()
    let recorded = false
    let toolCount = 0
    let imageRequest = false
    try {
      const imagePreparation = imageHistory
        ? await prepareImages(options, { attachments: this.attachments, supportsImages: model?.supportsImages === true })
        : { options, nativeImages: [], imageRequest: false, diagnostics: {} }
      imageRequest = imagePreparation.imageRequest
      diagnostics = { ...imagePreparation.diagnostics }
      const dataUriStats = inlineImageDataUriStats(options.messages)
      assertInlineImageDataUriBudget(dataUriStats)
      const request = makeRequest({ ...imagePreparation.options, rewriteClientNames: config.rewriteClientNames !== false, captureRequestSamples: config.captureRequestSamples === true }, tools, schema, dataUriStats)
      diagnostics = { ...request.diagnostics, ...diagnostics, ...(request.rewrite ? { rewrite: request.rewrite } : {}) }
      // The sample is system-scope only and already redacted; it goes to its own
      // bounded files, never into the per-call diagnostics entry.
      if (request.requestSample) void this.logs.recordRequestSample(request.requestSample)
      const streamInput = imageRequest ? makeImageStreamInput(request.prompt, imagePreparation.nativeImages) : undefined
      if (streamInput) {
        diagnostics.streamInputBytes = streamInput.bytes
        diagnostics.cliInputBytes = streamInput.bytes
      } else {
        diagnostics.cliInputBytes = Buffer.byteLength(request.prompt)
      }
      const command = await cliInvocation(accountCli?.path || await resolveCli(config))
      let processResult
      if (imageRequest) {
        const imageArgs = [
          '--print',
          '--input-format', 'stream-json',
          '--output-format', 'stream-json',
          '--json-schema', JSON.stringify(schema),
          '--tools', 'StructuredOutput',
          '--allowedTools', 'StructuredOutput',
          '--setting-sources', 'user',
          '--strict-mcp-config',
          '--mcp-config', '{"mcpServers":{}}',
          ...(selectedModel ? ['--model', selectedModel] : []),
          ...(effort ? ['--effort', effort] : []),
          '--max-turns', '4',
          '--no-session-persistence',
          '--system-prompt', MODEL_SYSTEM_PROMPT,
          '--verbose'
        ]
        processResult = await runImageProcess(command.command, [...command.args, ...imageArgs], {
          env: { ...cliEnv(config), CODEBUDDY_DISABLE_AUTO_MEMORY: '1', CODEBUDDY_CODE_DISABLE_BACKGROUND_TASKS: '1' },
          input: streamInput.input,
          timeoutMs: config.timeoutMs,
          signal: options.signal
        })
      } else {
        processResult = await runProcess(command.command, [...command.args, ...args], {
          env: { ...cliEnv(config), CODEBUDDY_DISABLE_AUTO_MEMORY: '1', CODEBUDDY_CODE_DISABLE_BACKGROUND_TASKS: '1' },
          input: request.prompt,
          timeoutMs: config.timeoutMs,
          signal: options.signal
        })
      }
      callProcessDiagnostics = processResult.processDiagnostics
      raw = collectStructuredResult(processResult.stdout, processResult)
      normalized = normalizeCliUsage(raw.usage, raw.modelUsage)
      const response = parseStructuredResponse(raw.result, tools)
      response.responseDiagnostics = {
        ...(raw.responseDiagnostics ?? {}),
        ...response.responseDiagnostics,
        finalResultCount: raw.finalResultCount
      }
      toolCount = response.calls.length
      recordCall({ id: callId, state: 'success', config: callConfig, usage: raw.usage, modelUsage: raw.modelUsage, diagnostics, durationMs: Math.round(performance.now() - startedAt), toolCalls: toolCount, responseDiagnostics: response.responseDiagnostics, imageRequest: imageHistory })
      recorded = true
      await this.logs.record({ ...runtimeStatus.lastCall, effort, timeoutMs: config.timeoutMs, cliVersion: runtimeStatus.cliCheck.version, processDiagnostics: processResult.processDiagnostics })
      // The CLI request is complete even if the consumer pauses or stops
      // pulling delivery blocks without closing the async iterator.
      releaseActive()

      // JSON mode delivers complete blocks. Synthetic deltas would make DSH
      // measure delivery time as model decode time and report impossible speeds.
      let index = 0
      if (response.text.length > 0) {
        yield { type: 'block-start', index, blockType: 'text' }
        yield { type: 'block-end', index, block: { type: 'text', text: response.text } }
        index += 1
      }
      for (const call of response.calls) {
        yield { type: 'block-start', index, blockType: 'tool-call' }
        yield {
          type: 'block-end',
          index,
          block: { type: 'tool-call', id: call.id, name: call.name, arguments: call.arguments }
        }
        index += 1
      }
      yield { type: 'usage', usage: normalized }
      yield { type: 'finish', reason: toolCount > 0 ? { kind: 'tool-calls' } : { kind: 'stop' } }
    } catch (error) {
      const errorCode = safeErrorCode(error)
      diagnostics = { ...diagnostics, ...sanitizeRequestDiagnostics(error?.requestDiagnostics) }
      const failedUsage = raw?.usage ?? error?.usage
      const errorMessage = safeMessage(error)
      const processDiagnostics = error instanceof CodeBuddyCliError ? error.processDiagnostics ?? callProcessDiagnostics : callProcessDiagnostics
      if (error?.responseDiagnostics && raw?.responseDiagnostics) {
        error.responseDiagnostics = { ...raw.responseDiagnostics, ...error.responseDiagnostics }
      }
      const responseDiagnostics = error instanceof CodeBuddyCliError
        ? { outputMode: 'native-json-schema', ...error.responseDiagnostics }
        : { outputMode: 'native-json-schema' }
      if (!recorded && (failedUsage || raw?.modelUsage || error?.modelUsage)) recordCall({ id: callId, state: 'error', config: callConfig, usage: failedUsage, modelUsage: raw?.modelUsage ?? error?.modelUsage, diagnostics, durationMs: Math.round(performance.now() - startedAt), toolCalls: toolCount, errorCode, errorMessage, processDiagnostics, responseDiagnostics, imageRequest: imageHistory, offloadImagesRequested: error?.failure?.offloadImages })
      else if (!recorded) {
        runtimeStatus.totals.calls += 1
        const facts = outcomeFacts(errorCode, error?.failure?.offloadImages, diagnostics)
        applyOutcomeCounters(runtimeStatus.totals, facts)
        runtimeStatus.lastCall = { id: callId, state: 'error', model: callConfig.model, ...(config.accountId ? { accountId: config.accountId } : {}), at: Date.now(), errorCode, errorMessage, processDiagnostics, responseDiagnostics, diagnostics, durationMs: Math.round(performance.now() - startedAt), ...(imageHistory ? { imageRequest: true } : {}), ...facts }
        const key = config.accountId || 'legacy'
        const total = accountUsageFor(key)
        total.calls += 1
        applyOutcomeCounters(total, facts)
        accountUsage.set(key, total)
        rememberFailure(runtimeStatus.lastCall)
      }
      if (!recorded) await this.logs.record({ ...runtimeStatus.lastCall, effort, timeoutMs: config.timeoutMs, cliVersion: runtimeStatus.cliCheck.version }, imageHistory ? undefined : raw?.result ?? error?.rawResult)
      const wrapped = new CodeBuddyCliError(errorCode, safeMessage(error), { requestId: callId, offloadImages: error?.failure?.offloadImages })
      if (Object.keys(sanitizeRequestDiagnostics(error?.requestDiagnostics)).length) {
        wrapped.requestDiagnostics = sanitizeRequestDiagnostics(error.requestDiagnostics)
      }
      if (error?.processDiagnostics) wrapped.processDiagnostics = error.processDiagnostics
      if (error?.responseDiagnostics) wrapped.responseDiagnostics = error.responseDiagnostics
      throw wrapped
    } finally {
      releaseAccount()
      releaseActive()
    }
  }
}

export function apply(ctx, config) {
  const getConfig = () => config
  const controller = new AbortController()
  const logs = createDiagnosticsStore({ pluginVersion: PLUGIN_VERSION })
  const accounts = createAccountStore()
  const prefs = createModelPrefs()
  const catalog = createModelCatalog(async (current) => {
    await accounts.assertReady(current, inspectCli, { signal: controller.signal })
    const cli = await checkCli(current, controller.signal)
    if (cli.state !== 'available') throw new CodeBuddyCliError(cli.code, '请先完成 CLI 配置，再刷新模型。')
    return queryModelCatalog({ ...current, cliPath: cli.path }, { signal: controller.signal })
  }, {
    onRefresh: () => { if (!controller.signal.aborted) ctx.emit('llm/adapters-updated') }
  })
  const adapter = new CodeBuddyCliAdapter(getConfig, catalog, logs, ctx.attachments, accounts, prefs)
  const releaseAdapter = ctx.llm.registerAdapter([PROVIDER], adapter)
  ctx.effect(() => () => releaseAdapter(), 'dsh-codebuddy-cli-intl: model adapter')
  ctx.on('settings/document-updated', () => ctx.emit('llm/adapters-updated'))
  ctx.inject(['webServer'], (webCtx) => registerStatusRoute(webCtx, getConfig, catalog, controller.signal, logs, accounts, prefs))
  const refresh = async (force = false) => {
    try { await catalog.get(await accounts.selected(configOf(getConfig())), { force }) } catch {}
  }
  void refresh()
  const timer = setInterval(() => { void refresh(true) }, 15 * 60000)
  timer.unref?.()
  ctx.effect(() => () => { clearInterval(timer); controller.abort() }, 'dsh-codebuddy-cli-intl: catalog refresh')
}

