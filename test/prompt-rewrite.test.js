import assert from 'node:assert/strict'
import test from 'node:test'
import { REWRITE_TARGET_NAME, rewriteClientNames, rewriteSystemScope } from '../lib/shared/prompt-rewrite.js'

test('rewrites the DSH identity inside a system prompt', () => {
  const result = rewriteClientNames('You are an AI agent powered by DeepSeek Harness.')
  assert.equal(result.text, 'You are an AI agent powered by WorkBuddy.')
  assert.equal(result.hits, 1)
})

test('rewrites case-insensitively', () => {
  assert.equal(rewriteClientNames('DEEPSEEK HARNESS').text, REWRITE_TARGET_NAME)
  assert.equal(rewriteClientNames('deepseek harness').text, REWRITE_TARGET_NAME)
  assert.equal(rewriteClientNames('DeepSeek harness').text, REWRITE_TARGET_NAME)
})

test('rewrites the Claude CLI identity longest match first', () => {
  const full = rewriteClientNames("You are Claude Code, Anthropic's official CLI for Claude.")
  assert.equal(full.text, 'You are WorkBuddy, a coding agent.')
  assert.equal(full.hits, 1)
  assert.equal(rewriteClientNames("Anthropic's official CLI for Claude").text, REWRITE_TARGET_NAME)
  assert.equal(rewriteClientNames('claude code').text, REWRITE_TARGET_NAME)
})

test('leaves runtime-context paths intact', () => {
  const text = 'Current checkout: "D:\\DeepSeek Harness\\resources\\app.asar\\dsh\\".'
  const result = rewriteClientNames(text)
  assert.equal(result.text, text)
  assert.equal(result.hits, 0)
})

test('is idempotent', () => {
  const once = rewriteClientNames('You are an AI agent powered by DeepSeek Harness.')
  const twice = rewriteClientNames(once.text)
  assert.equal(twice.text, once.text)
  assert.equal(twice.hits, 0)
})

test('only the system scope is rewritten', () => {
  const user = { role: 'user', content: 'DeepSeek Harness 这个编辑器的模型选择器' }
  const assistant = { role: 'assistant', content: 'DeepSeek Harness 的配置' }
  const systemMessage = { role: 'system', content: [{ type: 'text', text: 'You are an AI agent powered by DeepSeek Harness.' }] }
  const envelope = { system: 'You are an AI agent powered by DeepSeek Harness.', messages: [systemMessage, user, assistant] }
  const result = rewriteSystemScope(envelope)
  assert.equal(result.system, 'You are an AI agent powered by WorkBuddy.')
  assert.equal(result.hits, 2)
  assert.equal(result.messages[0].content[0].text, 'You are an AI agent powered by WorkBuddy.')
  assert.equal(result.messages[1], user)
  assert.equal(result.messages[2], assistant)
  assert.equal(result.messages[1].content, 'DeepSeek Harness 这个编辑器的模型选择器')
})

test('returns the same references when nothing matches', () => {
  const messages = [{ role: 'user', content: 'hello' }]
  const result = rewriteSystemScope({ system: 'plain', messages })
  assert.equal(result.hits, 0)
  assert.equal(result.messages, messages)
  assert.equal(result.system, 'plain')
})

test('can be disabled', () => {
  const messages = [{ role: 'system', content: 'You are DeepSeek Harness' }]
  const result = rewriteSystemScope({ system: 'deepseek harness', messages }, { enabled: false })
  assert.equal(result.hits, 0)
  assert.equal(result.system, 'deepseek harness')
  assert.equal(result.messages, messages)
})

test('keeps non-text blocks untouched', () => {
  const image = { type: 'image', source: { type: 'base64', data: 'abc' } }
  const result = rewriteSystemScope({ system: [image, { type: 'text', text: 'DeepSeek Harness' }], messages: [] })
  assert.equal(result.system[0], image)
  assert.equal(result.system[1].text, REWRITE_TARGET_NAME)
})
