import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { runProcess } from '../../lib/intl/cli-process.js'
import { createDiagnosticsStore } from '../../lib/intl/diagnostics.js'
import { cliVersionVerdict } from '../../lib/shared/cli-version.js'

test('intl runProcess attaches processDiagnostics and upstream noticeClass on ABORTED', async () => {
  const controller = new AbortController()
  const script = [
    "process.stderr.write('Error: 401 authentication required\\n');",
    'setTimeout(() => {}, 5000);'
  ].join(' ')
  setTimeout(() => controller.abort(), 120)

  await assert.rejects(
    runProcess(process.execPath, ['-e', script], { signal: controller.signal, timeoutMs: 5000 }),
    (error) => {
      assert.equal(error.code, 'ABORTED')
      assert.equal(error.processDiagnostics?.channel, 'text-json')
      assert.equal(error.processDiagnostics?.terminationInitiator, 'caller')
      assert.ok(error.processDiagnostics?.elapsedMs >= 50)
      assert.ok(error.processDiagnostics?.stderrBytes > 0)
      assert.equal(error.responseDiagnostics?.reason, 'cancelled')
      assert.equal(error.responseDiagnostics?.noticeClass, 'authentication')
      assert.equal(error.responseDiagnostics?.noticeSource, 'stderr')
      return true
    }
  )
})

test('intl runProcess attaches processDiagnostics when signal is already aborted', async () => {
  const controller = new AbortController()
  controller.abort()
  await assert.rejects(
    runProcess(process.execPath, ['-e', ''], { signal: controller.signal, timeoutMs: 5000 }),
    (error) => {
      assert.equal(error.code, 'ABORTED')
      assert.equal(error.processDiagnostics?.terminationInitiator, 'caller')
      assert.equal(error.processDiagnostics?.elapsedMs, 0)
      return true
    }
  )
})

test('intl diagnostics preserves 32-bit Windows exitCode, caller initiator, and separates ABORTED from failures', async (t) => {
  const directory = await mkdtemp(path.join(tmpdir(), 'dsh-intl-diag-aborted-'))
  t.after(async () => {
    await rm(directory, { recursive: true, force: true })
  })
  const store = createDiagnosticsStore({ directory })
  await store.ready
  await store.record({
    state: 'error',
    at: Date.now(),
    model: 'deepseek-v4.1-flash',
    durationMs: 20005,
    errorCode: 'ABORTED',
    cancelled: true,
    processDiagnostics: {
      channel: 'text-json',
      timeoutMs: 300000,
      elapsedMs: 20005,
      stdoutBytes: 0,
      stderrBytes: 42,
      terminationInitiator: 'caller',
      exitCode: 3221225477,
      exitSignal: 'SIGKILL'
    }
  })

  const status = store.status()
  assert.equal(status.entries, 1)
  assert.equal(status.failures, 0)
  assert.equal(status.cancellations, 1)

  const exported = await store.export()
  const entry = exported.entries[0]
  assert.equal(entry.controlClass, 'cancelled')
  assert.equal(entry.processDiagnostics?.channel, 'text-json')
  assert.equal(entry.processDiagnostics?.terminationInitiator, 'caller')
  assert.equal(entry.processDiagnostics?.exitCode, 3221225477)
  assert.equal(entry.processDiagnostics?.exitSignal, 'SIGKILL')
})

test('cliVersionVerdict recognizes 2.185.0 as verified', () => {
  assert.equal(cliVersionVerdict('2.185.0'), 'verified')
})
