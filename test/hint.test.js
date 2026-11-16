import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// The settings page used to lay every rule and background explanation out in the
// open, which buried the controls. Long explanations now live behind a `?`
// affordance while state, result and error lines stay visible. These assertions
// pin that split so a later edit cannot quietly either re-flood the page or hide
// a warning that a wrong click depends on.
const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const cn = await readFile(new URL('../lib/cn/index.js', import.meta.url), 'utf8')
const intl = await readFile(new URL('../lib/intl/index.js', import.meta.url), 'utf8')

const COLLAPSED = [
  'intro', 'setupNote', 'cliCheckNote', 'accountNote', 'accountValidation', 'accountPrivacy',
  'accountGuideSteps', 'accountGuideErrors', 'modelNote', 'timeoutHelp',
  'rewriteClientNamesNote', 'captureRequestSamplesNote', 'catalogNote', 'imagesHelp',
  'creditsNote', 'usageNote', 'balanceNote', 'logsNote', 'toolNote', 'regionNote', 'pageEntryHint',
  'feedbackIntro', 'feedbackRequired', 'feedbackScreenshotNote', 'feedbackPrivacy',
  'feedbackAttachmentNote', 'feedbackDetailNote', 'feedbackLogToolsNote', 'feedbackLocalNote'
]

// Warnings whose whole purpose is to stop a destructive click: these must never
// be hidden behind the affordance.
const ALWAYS_VISIBLE = ['saveFirst', 'feedbackReadOnly', 'accountUnsupported']

const hint = (key) => `h(Hint, { label: t('hintShow') }, t('${key}'))`

test('long explanations render behind the ? affordance', () => {
  assert.match(client, /function Hint\(/u)
  assert.ok(client.includes("'aria-expanded'"), 'Hint must expose aria-expanded for assistive technology')
  for (const key of COLLAPSED) {
    assert.ok(client.includes(hint(key)), `${key} should be collapsed into a Hint`)
  }
})

test('warnings and result lines stay in plain sight', () => {
  for (const key of ALWAYS_VISIBLE) {
    assert.ok(client.includes(`t('${key}')`), `${key} must still be rendered`)
    assert.equal(client.includes(hint(key)), false, `${key} must stay visible, not collapsed`)
  }
})

test('the hint body stays mounted so nothing is lost without hover', () => {
  // display-only toggling keeps the text in the render tree: screen readers,
  // touch devices without hover, and source assertions all still see it.
  assert.ok(client.includes("display: open ? 'block' : 'none'"))
})

test('both regions fall back from an unusable model instead of failing the request', () => {
  for (const [name, source] of [['cn', cn], ['intl', intl]]) {
    assert.ok(source.includes('runtimeStatus.modelFallback ='), `${name} must record the fallback`)
    assert.ok(source.includes('enabledModel(config.model)'), `${name} must prefer the configured default model`)
    assert.ok(source.includes('!hiddenModels.has(id)'), `${name} must respect the disabled-model set`)
  }
})
