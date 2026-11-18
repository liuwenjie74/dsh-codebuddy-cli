import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// The accounts page follows a fixed reference layout: a summary strip, then the
// current account, then the other accounts, then the add card, then the switch.
// These assertions pin the parts of that layout the user checked by hand -- one
// primary action per card, one status line per row, and the switch saving on its
// own -- so a later edit cannot quietly reintroduce a second toolbar.
const client = await readFile(new URL('../lib/client.js', import.meta.url), 'utf8')
const zh = JSON.parse(await readFile(new URL('../locales/cn.zh.json', import.meta.url), 'utf8'))

const at = (needle, from = 0) => {
  const index = client.indexOf(needle, from)
  assert.ok(index >= 0, `missing ${needle}`)
  return index
}

test('the accounts page keeps the reference card order', () => {
  const summary = at('const summaryCells = [')
  const current = at("id: 'cb-account-current'")
  const list = at("id: 'cb-account-list'")
  const add = at("t('accountAddTitle')")
  const rotation = at("id: 'cb-account-rotation'")
  assert.ok(summary < current, 'the summary strip must come before the current account card')
  assert.ok(current < list, 'the current account must come before the other accounts')
  assert.ok(list < add, 'the add card must sit at the end of the list')
  assert.ok(add < rotation, 'the switch must be its own card after the add card')
})

test('the summary strip carries exactly the four agreed facts', () => {
  const start = at('const summaryCells = [')
  const end = client.indexOf(']', client.indexOf("'accountSummaryRotation'", start))
  const block = client.slice(start, end)
  for (const label of ['accountSummaryCurrent', 'accountSummarySigned', 'quotaRemain', 'accountSummaryRotation']) {
    assert.ok(block.includes(label), `summary must show ${label}`)
  }
  const targets = block.match(/'cb-account-[a-z]+'/gu) ?? []
  assert.ok(targets.length >= 3, 'each summary cell must jump to the card it summarises')
})

test('a card offers one primary action and hides the rest behind the menu', () => {
  const currentStart = at("id: 'cb-account-current'")
  const listStart = at("id: 'cb-account-list'")
  const currentCard = client.slice(currentStart, listStart)
  assert.ok(currentCard.includes('creditPanel(currentKey)'), 'the current card shows its credits inline')
  assert.ok(!currentCard.includes('primaryButtonStyle'), 'the card adds no second primary button of its own')

  const panelStart = at('const creditPanel = ')
  const panel = client.slice(panelStart, at('const creditLine = ', panelStart))
  assert.equal((panel.match(/primaryButtonStyle/gu) ?? []).length, 1, 'the credits panel keeps a single primary action')
  assert.ok(panel.includes("t('quotaRefresh')"), 'the remaining primary action is the credits refresh')
  assert.ok(!panel.includes("t('quotaDisconnect')") || panel.indexOf("t('quotaDisconnect')") > panel.indexOf('details'), 'disconnecting stays inside the details fold')

  const rows = client.slice(at('const otherRows = []'), listStart)
  assert.ok(rows.includes("t('accountMore')"), 'secondary row actions collapse into the menu')
  assert.ok(rows.includes("'aria-expanded'"), 'the menu button must announce its state')
  const collapsedRow = rows.split('\n').find((line) => line.includes("t('accountUse')"))
  assert.ok(collapsedRow, 'each row keeps one visible primary action')
  assert.ok(!collapsedRow.includes("t('accountPrepare')"), 'the sign-in command must not be a row button')
})

test('a row states its status once and shows its own credits', () => {
  const start = at('const rowStatus = (account) =>')
  const end = client.indexOf('const otherRows = []', start)
  const block = client.slice(start, end)
  for (const key of ['accountPathError', 'accountStatusSignedIn', 'accountNoCredential']) {
    assert.ok(block.includes(key), `a row must be able to say ${key}`)
  }
  const rowStart = at('const otherRows = []')
  const rowEnd = at("id: 'cb-account-list'", rowStart)
  const rows = client.slice(rowStart, rowEnd)
  assert.ok(rows.includes('creditLine('), 'each row shows its own credits on the row')
  assert.equal((rows.match(/rowStatus\(/gu) ?? []).length, 1, 'a row states its status exactly once')
})

test('the switch saves the moment it moves', () => {
  const start = at("id: 'cb-account-rotation'")
  const card = client.slice(start, start + 1400)
  assert.ok(card.includes('Switch'), 'the switch card owns the control')
  assert.ok(card.includes("accountAction('rotation'"), 'flipping it saves without a separate button')
})

test('the credits wording follows the renamed section', () => {
  assert.equal(zh.navusage, 'Token 用量')
  assert.equal(zh.quotaUnit, '分')
  assert.ok(!('balance' in zh), 'the standalone credits block is gone')
})
