import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// The settings page used to print every rule and background explanation as body
// text, which buried the controls. Explanations now collapse behind a small
// inline info glyph, and the glyph must always ride on a row that already
// carries something else -- a glyph floating alone on its own line is exactly
// the regression the user rejected. These assertions pin both halves of that
// contract so a later edit cannot quietly re-flood the page, hide a warning, or
// leave a lone icon behind.
const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const cn = await readFile(new URL('../lib/cn/index.js', import.meta.url), 'utf8')
const intl = await readFile(new URL('../lib/intl/index.js', import.meta.url), 'utf8')

const COLLAPSED = [
  'intro', 'setupNote', 'cliCheckNote', 'accountNote', 'accountValidation', 'accountPrivacy',
  'accountGuideSteps', 'accountGuideErrors', 'modelNote', 'timeoutHelp',
  'rewriteClientNamesNote', 'captureRequestSamplesNote', 'catalogNote', 'imagesHelp',
  'usageNote', 'balanceNote', 'logsNote', 'regionNote', 'pageEntryHint',
  'feedbackIntro', 'feedbackRequired', 'feedbackScreenshotNote', 'feedbackPrivacy',
  'feedbackAttachmentNote', 'feedbackDetailNote', 'feedbackLogToolsNote', 'feedbackLocalNote'
]

// Explanations the user asked to keep in plain sight: they carry the capability
// and billing caveats, which must be readable without opening anything.
const ALWAYS_VISIBLE = ['saveFirst', 'feedbackReadOnly', 'accountUnsupported', 'toolNote', 'creditsNote']

const lines = client.split('\n')
const rowsWith = (key) => lines.filter((line) => line.includes(`t('${key}')`))
// A plain-text summary slot renders the intro without any glyph, so it is not a
// collapsed explanation and must not be judged as one.
const isSummarySlot = (row) => /return t\('intro'\)/u.test(row)

test('long explanations are collapsed behind the inline glyph', () => {
  assert.match(client, /function Hint\(/u)
  assert.ok(client.includes("'aria-expanded'"), 'Hint must expose aria-expanded for assistive technology')
  for (const key of COLLAPSED) {
    const rows = rowsWith(key)
    assert.ok(rows.length > 0, `${key} must still be rendered`)
    assert.ok(rows.some((row) => row.includes('h(Hint') || isSummarySlot(row)), `${key} must be collapsed behind the glyph`)
  }
})

test('no explanation glyph is left alone on its own line', () => {
  for (const key of COLLAPSED) {
    for (const row of rowsWith(key).filter((line) => !isSummarySlot(line))) {
      const calls = (row.match(/h\(/gu) || []).length
      const glyphs = (row.match(/h\(Hint/gu) || []).length
      assert.ok(calls - glyphs >= 1, `${key} must share its row with other content: ${row.trim().slice(0, 90)}`)
    }
  }
  // Section-level notes are handed to the heading row itself.
  // Section-level notes ride on the heading row; the heading also owns an
  // `actions` slot so row controls (e.g. refresh) live on that same line instead
  // of a separate toolbar row.
  assert.ok(client.includes('function SectionHeading({ kind, children, hint, actions })'))
  assert.ok(client.includes("style: { marginLeft: 'auto'"), 'heading actions must be right-aligned on the row')
})

test('explanations with billing and capability caveats stay visible', () => {
  for (const key of ALWAYS_VISIBLE) {
    const rows = rowsWith(key)
    assert.ok(rows.length > 0, `${key} must still be rendered`)
    for (const row of rows) {
      assert.equal(row.includes('h(Hint'), false, `${key} must stay visible, not collapsed`)
    }
  }
})

test('the hint body stays mounted so nothing is lost without hover', () => {
  // display-only toggling keeps the text in the render tree: screen readers,
  // touch devices without hover, and source assertions all still see it.
  assert.ok(client.includes("display: open ? 'block' : 'none'"))
})

test('the enabled/total counter is derived, never hard-coded', () => {
  assert.ok(client.includes('const enabledCount = models.filter((item) => !hiddenModels.has(item.id)).length'))
  assert.ok(client.includes('`${enabledCount} / ${models.length}`'))
  assert.equal(lines.some((line) => line.includes('statModels') && /['"]\d+\s*\/\s*\d+['"]/u.test(line)), false)
})

test('both regions fall back from an unusable model instead of failing the request', () => {
  for (const [name, source] of [['cn', cn], ['intl', intl]]) {
    assert.ok(source.includes('runtimeStatus.modelFallback ='), `${name} must record the fallback`)
    assert.ok(source.includes('enabledModel(config.model)'), `${name} must prefer the configured default model`)
    assert.ok(source.includes('!hiddenModels.has(id)'), `${name} must respect the disabled-model set`)
  }
})

test('the hint popover is out of flow so hovering cannot flicker the glyph', () => {
  // Regression: an in-flow column body grew the wrapper on hover, re-centring the
  // 16px glyph in its row and sliding it out from under the cursor (mouseleave ->
  // close -> slide back -> mouseenter -> open, forever). The wrapper must keep a
  // constant box and the body must be an absolute popover.
  assert.ok(client.includes("position: 'relative', verticalAlign: 'middle'"), 'Hint wrapper must be a constant-size relative box')
  assert.ok(client.includes("display: open ? 'block' : 'none', position: 'fixed'"), 'Hint body must be an out-of-flow fixed popover so ancestor overflow cannot clip it')
  assert.ok(client.includes("background: 'Canvas', color: 'CanvasText'"), 'popover must use the matched Canvas/CanvasText pair, never a background-only token')
  const hint = client.slice(client.indexOf('function Hint('), client.indexOf('const PANEL_ID'))
  const beforeButton = hint.slice(0, hint.indexOf("h('button'"))
  assert.ok(beforeButton.includes('onMouseEnter'), 'hover must be handled on the wrapper, so moving into the popover keeps it open')
})
