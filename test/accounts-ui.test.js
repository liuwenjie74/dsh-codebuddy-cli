import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

// The accounts page follows a fixed reference layout: a summary strip, then the
// current account, then the other accounts, then the add card. These assertions
// pin the parts of that layout the user checked by hand -- one page-level refresh,
// one status line per row, and the rotation switch saving on its own, from the
// connection page where it now lives.
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
  assert.ok(summary < current, 'the summary strip must come before the current account card')
  assert.ok(current < list, 'the current account must come before the other accounts')
  assert.ok(list < add, 'the add card must sit at the end of the list')
  assert.equal(client.includes("id: 'cb-account-rotation'"), false, 'the switch is no longer a card on this page')
})

test('the summary strip carries exactly the four agreed facts', () => {
  const start = at('const summaryCells = [')
  const end = client.indexOf(']', client.indexOf("'accountSummaryRotation'", start))
  const block = client.slice(start, end)
  for (const label of ['accountSummaryCurrent', 'accountSummarySigned', 'quotaRemain', 'accountSummaryRotation']) {
    assert.ok(block.includes(label), `summary must show ${label}`)
  }
  const targets = block.match(/'cb-(?:account|rewrite)[a-z-]*'/gu) ?? []
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
  assert.equal((panel.match(/primaryButtonStyle/gu) ?? []).length, 0, 'the credits panel holds no action of its own any more')
  assert.equal(panel.includes("t('quotaRefresh')"), false, 'refreshing moved to the page toolbar')
  assert.ok(panel.includes('creditPackages('), 'the package breakdown lives in the credits panel, so every block gets it')
  assert.ok(!panel.includes("t('quotaDisconnect')") || panel.indexOf("t('quotaDisconnect')") > panel.indexOf('details'), 'disconnecting stays inside the details fold')

  const rows = client.slice(at('const creditActions = '), at('const quotaAsked = React.useRef(null)'))
  // Rows share the card's shape through one helper: title and status on the left,
  // the very same credits panel and the row's own buttons on the right.
  assert.ok(rows.includes('const rowBlock = '), 'rows are built by one shared layout helper')
  assert.ok(rows.includes('creditActions(key, buttons)'), 'rows reuse the credits panel instead of a second figure')
  assert.equal((rows.match(/primaryButtonStyle/gu) ?? []).length, 0, 'refresh stays the only primary button, so row buttons are secondary')
  assert.equal(rows.includes("t('quotaRefresh')"), false, 'no row refreshes its own credits')
  assert.ok(rows.includes("t('accountUse')"), 'a row can be selected')
  assert.ok(rows.includes("t('accountRemove')"), 'a row can remove itself')
  assert.ok(rows.includes("t('accountPrepare')"), 'an unsigned row can still ask for its sign-in command')
  assert.equal(client.includes("t('accountMore')"), false, 'the row menu is gone')
  assert.equal(rows.includes("'aria-expanded'"), false, 'no account row expands a menu any more')
})

test('one refresh button covers every account, beside the program picker', () => {
  const start = at("t('accountPickProgram')")
  const row = client.slice(start - 900, start + 900)
  assert.ok(row.includes("t('quotaRefresh')"), 'the refresh sits on the same row as the program picker')
  assert.ok(row.includes('primaryButtonStyle'), 'and is the one primary action of the page')
  const helper = client.slice(at('const refreshAll = '), at('const creditActions = '))
  assert.ok(helper.includes('for (const account of accountRows)'), 'it covers every added account')
  assert.ok(helper.includes('targets.push(null)'), 'and the default sign-in row as well')
  assert.ok(helper.includes('credentialsPresent === true'), 'while skipping accounts that have nothing to read')
})

test('the rotation switch saves the moment it moves, from the connection page', () => {
  const sectionStart = at("id: 'cb-rewrite'")
  const switchAt = at("t('accountRotation')", sectionStart)
  const section = client.slice(switchAt - 500, switchAt + 700)
  assert.ok(section.includes("t('accountRotation')"), 'the feature switches own the rotation switch')
  assert.ok(section.includes('Switch'), 'and it is a switch, not a form field')
  assert.ok(section.includes("accountAction('rotation'"), 'flipping it saves without a separate button')
})

test('the credits wording follows the renamed section', () => {
  assert.equal(zh.navusage, 'Token 用量')
  assert.equal(zh.quotaUnit, '分')
  assert.ok(!('balance' in zh), 'the standalone credits block is gone')
})

test('adding an account is one click and never asks for a name', () => {
  const start = at("id: 'cb-account-add'")
  const card = client.slice(start, at("h('details', null, h('summary'", start))
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

test('a signed-in row keeps only its identity and its packages', () => {
  const rows = client.slice(at('const creditActions = '), at('const quotaAsked = React.useRef(null)'))
  assert.ok(rows.includes('identityLine(account.identity'), 'a signed-in row shows who is signed in')
  assert.equal(rows.includes('usageLine(account)'), false, 'rows no longer repeat the process usage line')
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
