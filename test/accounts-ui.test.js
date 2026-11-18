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

test('every account block shows its credits the same way and keeps its own actions', () => {
  const currentStart = at("id: 'cb-account-current'")
  const listStart = at("id: 'cb-account-list'")
  const currentCard = client.slice(currentStart, listStart)
  assert.ok(currentCard.includes('creditPanel(currentKey)'), 'the current card shows its credits inline')
  assert.ok(!currentCard.includes('primaryButtonStyle'), 'the card adds no second primary button of its own')

  const panelStart = at('const creditPanel = ')
  const panel = client.slice(panelStart, at('const usageLine = ', panelStart))
  assert.equal((panel.match(/primaryButtonStyle/gu) ?? []).length, 1, 'the credits panel keeps a single primary action')
  assert.ok(panel.includes("t('quotaRefresh')"), 'the remaining primary action is the credits refresh')
  assert.ok(panel.includes('creditPackages('), 'the package breakdown lives in the credits panel, so every block gets it')
  assert.ok(!panel.includes("t('quotaDisconnect')") || panel.indexOf("t('quotaDisconnect')") > panel.indexOf('details'), 'disconnecting stays inside the details fold')

  const rows = client.slice(at('const creditActions = '), at('const quotaAsked = React.useRef(null)'))
  // Rows share the card's shape through one helper: title and status on the left,
  // the very same credits panel and the row's own buttons on the right.
  assert.ok(rows.includes('const rowBlock = '), 'rows are built by one shared layout helper')
  assert.ok(rows.includes('creditActions(key, buttons)'), 'rows reuse the credits panel instead of a second figure')
  assert.equal((rows.match(/primaryButtonStyle/gu) ?? []).length, 0, 'refresh stays the only primary button, so row buttons are secondary')
  assert.ok(rows.includes("t('accountUse')"), 'a row can be selected')
  assert.ok(rows.includes("t('accountRemove')"), 'a row can remove itself')
  assert.ok(rows.includes("t('accountPrepare')"), 'an unsigned row can still ask for its sign-in command')
  assert.equal(client.includes("t('accountMore')"), false, 'the row menu is gone')
  assert.equal(rows.includes("'aria-expanded'"), false, 'no account row expands a menu any more')
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

test('adding an account is one click and never asks for a name', () => {
  const start = at("id: 'cb-account-add'")
  const card = client.slice(start, at("id: 'cb-account-rotation'", start))
  assert.equal(card.includes("t('accountLabel')"), false, 'the label input is gone from the add card')
  assert.equal(card.includes("t('accountLegacy')"), false, 'the dead default-login button is gone')
  assert.ok(card.includes('onClick: addAccount'), 'one button starts the whole flow')
  assert.ok(card.includes('addCommand'), 'the generated command appears in the card itself')
  assert.ok(card.includes("t('accountLoginDone')"), 'the card offers the signed-in confirmation')
  assert.ok(card.includes("t('accountLoginCancel')"), 'the card can be dismissed')

  const flow = client.slice(at('const addAccount = async () => {'), at('const confirmAccountLogin = async () => {'))
  assert.ok(flow.includes("translate(t, 'accountAutoLabel'"), 'the placeholder name is generated')
  assert.ok(flow.includes("postAccounts({ action: 'add', label })"), 'adding uses that placeholder')
  assert.ok(flow.includes("postAccounts({ action: 'prepareLogin'"), 'the sign-in command is generated in the same click')
})

test('the other-accounts card only exists when it has rows', () => {
  const list = at("otherRows.length ? h('div', { id: 'cb-account-list'")
  assert.ok(list > 0, 'the list card must be conditional')
  assert.equal(client.includes("t('accountOtherEmpty')"), false, 'an empty list no longer renders a placeholder')
  const rows = client.slice(at('const otherRows = []'), list)
  assert.ok(rows.includes('if (addStep && pendingAdd === account.id) continue'), 'the account being added is not listed twice')
})

test('a row is named by the official record, not by the stored placeholder', () => {
  assert.ok(client.includes('account.identity?.nickname || account.label'), 'rows prefer the CLI nickname')
  assert.ok(client.includes('currentAccount.identity?.nickname || currentAccount.label'), 'the current card prefers it too')
  const cancel = client.slice(at('const cancelAdd = async () => {'), at('// One figure of the credit panel'))
  assert.ok(cancel.includes('credentialsPresent'), 'cancelling keeps an account that already signed in')
  assert.ok(cancel.includes("action: 'remove'"), 'cancelling discards an unsigned placeholder')
})

test('a signed-in row keeps only its identity, its usage and its packages', () => {
  const rows = client.slice(at('const creditActions = '), at('const quotaAsked = React.useRef(null)'))
  assert.ok(rows.includes('identityLine(account.identity'), 'a signed-in row shows who is signed in')
  assert.ok(rows.includes('usageLine(account)'), 'a signed-in row shows what it has used')
  assert.ok(rows.includes("creditPanel(key)"), 'its package breakdown arrives with the shared credits panel')
  assert.ok(rows.includes('signedIn ? null :'), 'the sign-in command is offered only while the account has no credential')
  const unsigned = rows.slice(rows.indexOf('signedIn ? null :'))
  assert.ok(unsigned.includes("t('accountPrepare')"), 'an unsigned row offers the sign-in command')
  assert.ok(unsigned.includes('copyLoginCommand'), 'and can copy the command it just generated')
  assert.equal(rows.includes('lastUsedLine('), false, 'rows no longer carry a last-used line')
})

test('an added account is laid out exactly like the default sign-in row', () => {
  const rows = client.slice(at('const creditActions = '), at('const quotaAsked = React.useRef(null)'))
  // Both rows are produced by rowBlock, so they cannot drift apart again: the only
  // per-row style is the hairline between them.
  assert.ok(rows.includes("rowBlock('legacy'"), 'the everyday login row uses the shared block')
  assert.ok(rows.includes('rowBlock(account.id'), 'an added account uses the same shared block')
  assert.equal((rows.match(/gridTemplateColumns: 'minmax\(200px, 1fr\) auto'/gu) ?? []).length, 1, 'the two-column layout is defined once')
  for (const [name, slice] of [['default', rows.slice(0, rows.indexOf('for (const account of accountRows)'))], ['added', rows.slice(rows.indexOf('for (const account of accountRows)'))]]) {
    assert.ok(slice.includes('quotaNoteLine('), `the ${name} row reports its own refresh outcome`)
  }
  assert.equal(rows.includes('primaryButtonStyle'), false, 'no row adds a second primary button, so refresh keeps one colour everywhere')
  assert.ok(zh.quotaRefreshing && zh.quotaRefreshedAt, 'the refresh outcome needs words in both languages')
})

test('the status strip names an account the way its card does', () => {
  const strip = client.slice(at('const activeAccount = '), at('const activeAccountLabel = ') + 200)
  assert.ok(strip.includes('activeAccount.identity?.nickname'), 'the strip prefers the name the CLI recorded')
  assert.ok(strip.includes('|| activeAccount.label'), 'and falls back to the placeholder only when nothing is signed in')
})
