import { CodeBuddyCliError } from './cli-response.js'
import { createModelResponseModule } from '../shared/model-response.js'

export const { parseStructuredResponse, parseModelResponse } = createModelResponseModule({
  CodeBuddyCliError,
  nativeEnvelopeMessage: '官方结构化结果必须恰好包含 text 与 toolCalls；未回退解析普通文字。',
  invalidToolArgsMessage: '结构化工具参数必须是对象；未解析或修复参数字符串。'
})
