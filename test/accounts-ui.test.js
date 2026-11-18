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

test('a card offers one primary action and every row its own two extra actions', () => {
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
  const headerRow = rows.split('\n').find((line) => line.includes("t('accountUse')"))
  assert.ok(headerRow, 'each row keeps one visible primary action')
  assert.ok(rows.includes("t('quotaRefresh')"), 'the row can refresh its own credits')
  assert.ok(rows.includes("t('accountRemove')"), 'the row can remove itself')
  assert.ok(rows.indexOf("t('quotaRefresh')") < rows.indexOf('identityLine(account.identity'), 'both actions sit on the row header, above the details')
  assert.ok(!headerRow.includes("t('accountPrepare')"), 'the sign-in command must not be a row button')
  assert.equal(client.includes("t('accountMore')"), false, 'the row menu is gone')
  assert.equal(rows.includes("'aria-expanded'"), false, 'no account row expands a menu any more')
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
  const rows = client.slice(at('const otherRows = []'), at('const quotaAsked = React.useRef(null)'))
  const branch = rows.slice(rows.indexOf('const signedIn = account.credentialsPresent === true'))
  const onSigned = branch.slice(branch.indexOf("? h('div'"), branch.indexOf(": h('div'"))
  assert.ok(onSigned.includes('identityLine('), 'a signed-in row shows who is signed in')
  assert.ok(onSigned.includes('usageLine('), 'a signed-in row shows what it has used')
  assert.ok(onSigned.includes("creditPackages(account.id, 'start')"), 'a signed-in row can open its package breakdown')
  assert.equal(onSigned.includes('accountPrepare'), false, 'the sign-in command is not offered to a signed-in account')
  assert.equal(onSigned.includes('copyLoginCommand'), false, 'nor is copying a sign-in command')
  const offSigned = branch.slice(branch.indexOf(": h('div'"))
  assert.ok(offSigned.includes("t('accountPrepare')"), 'an unsigned row offers the sign-in command')
  assert.equal(rows.includes('lastUsedLine('), false, 'rows no longer carry a last-used line')
  assert.ok(rows.includes("creditPackages('legacy', 'start')"), 'the everyday login row carries its breakdown too')
})

test('an added account is laid out exactly like the default sign-in row', () => {
  const rows = client.slice(at('const otherRows = []'), at('const quotaAsked = React.useRef(null)'))
  const legacy = rows.slice(0, rows.indexOf('for (const account of accountRows)'))
  const added = rows.slice(rows.indexOf('for (const account of accountRows)'))
  for (const [name, slice] of [['default', legacy], ['added', added]]) {
    assert.ok(slice.includes('...ACCT.row'), `the ${name} row must use the shared row spacing`)
    assert.ok(slice.includes("quotaNoteLine("), `the ${name} row must report its own refresh outcome`)
  }
  assert.ok(!added.includes("padding: '10px 14px'"), 'an added row must not carry its own padding')
  // Refresh is the repair path when nothing has been read yet, so it is never
  // disabled by the absence of a balance -- only by a call already in flight.
  assert.ok(!added.includes('balances[account.id]?.available !== true'), 'refresh must not wait for a balance to exist')
  assert.ok(added.includes("quotaBusyKey === account.id ? t('quotaRefreshing') : t('quotaRefresh')"), 'a refresh in flight must say so')
  assert.ok(zh.quotaRefreshing && zh.quotaRefreshedAt, 'the refresh outcome needs words in both languages')
})
