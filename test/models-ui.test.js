import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// The model page follows the reference table the user approved: a heading row
// with counters and refresh, a state tab row plus search, a table, and one
// footer line. The catalog also no longer refreshes itself in the background.
// These assertions pin both halves so neither can drift back.
const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const cn = await readFile(new URL('../lib/cn/index.js', import.meta.url), 'utf8')
const intl = await readFile(new URL('../lib/intl/index.js', import.meta.url), 'utf8')
const zh = JSON.parse(await readFile(new URL('../locales/cn.zh.json', import.meta.url), 'utf8'))
const en = JSON.parse(await readFile(new URL('../locales/cn.en.json', import.meta.url), 'utf8'))

const at = (needle, from = 0) => {
  const index = client.indexOf(needle, from)
  assert.ok(index >= 0, `missing ${needle}`)
  return index
}

test('the heading carries the counters, the timestamp and the refresh', () => {
  const heading = at("h(SectionHeading, { kind: 'models'")
  const block = client.slice(heading, client.indexOf("t('models')", heading))
  assert.ok(block.includes("modelsEnabledChip"), 'the heading shows the enabled counter')
  assert.ok(block.includes("modelsUpdatedAt"), 'the heading shows when the snapshot was taken')
  assert.ok(block.includes('refreshModels'), 'the refresh stays on the heading row')
})

test('the state tabs are gone and enabled rows float to the top', () => {
  assert.equal(client.includes('const modelTabs = ['), false, 'the state tabs are gone')
  assert.equal(client.includes('modelFilter'), false, 'no state filter remains on the page')
  const shown = at('const shown = filtered.slice().sort(')
  const block = client.slice(shown, shown + 700)
  assert.ok(block.includes('Number(hiddenModels.has(a.id)) - Number(hiddenModels.has(b.id))'), 'enabled rows sort first')
  assert.ok(block.includes('if (!sortKey) return 0'), 'a clicked column only orders inside those two groups')
  assert.ok(client.slice(at('const memoModels = React.useMemo'), at('const memoModels = React.useMemo') + 900).includes('toLowerCase().includes(q)'), 'the search box still filters')
})

test('the batch actions hold one place and arm themselves on selection', () => {
  const row = at("translate(t, 'modelsTabAll', { count: models.length })")
  const block = client.slice(row, row + 1600)
  for (const key of ['disableSelected', 'enableSelected', 'clearSelection']) {
    assert.ok(block.includes(`t('${key}')`), `the toolbar keeps ${key} in place`)
  }
  assert.ok(block.includes('disabled: !selectedModels.length'), 'the actions arm once a row is selected')
  assert.equal(client.includes("selectedModels.length ? h('div'"), false, 'the batch bar is no longer conditional')
  assert.equal(client.includes('disableSelectedCount'), false, 'the counts left the button labels')
})

test('the footer states the totals and the billing caveat in one line', () => {
  const footer = at("h('div', { style: { ...rowStyle, justifyContent: 'space-between'")
  const block = client.slice(footer, footer + 700)
  assert.ok(block.includes("modelsSelectionStatus"), 'the footer states totals and selection')
  assert.ok(block.includes("t('creditsNote')"), 'the footer carries the billing caveat')
  assert.equal(client.includes("h(Notice, null, t('creditsNote'))"), false, 'the caveat is no longer its own notice block')
  assert.equal(block.includes('更新于'), false, 'the timestamp lives in the heading, not the footer')
})

test('the catalog no longer refreshes itself in the background', () => {
  for (const [name, source] of [['cn', cn], ['intl', intl]]) {
    assert.equal(source.includes('autoSyncCatalog'), false, `${name} must drop the switch field`)
    assert.equal(source.includes('15 * 60000'), false, `${name} must drop the 15 minute timer`)
    assert.equal(/setInterval\(/u.test(source), false, `${name} must not poll the catalog`)
  }
  assert.equal(client.includes('autoSyncCatalog'), false, 'the UI switch is gone')
  assert.equal(client.includes("t('catalogNote')"), false, 'the auto-sync explanation is gone from the page')
})

test('the removed wording is gone from both word tables', () => {
  for (const table of [zh, en]) {
    assert.equal('catalogNote' in table, false, 'the auto-sync note must not linger in a word table')
    assert.equal('autoSyncCatalog' in table, false, 'the switch label must not linger in a word table')
  }
  assert.equal(zh.models, '模型目录')
  assert.equal(en.models, 'Model catalog')
  assert.equal(zh.modelsSelectionStatus.includes('更新于'), false, 'the footer wording drops the timestamp')
})
