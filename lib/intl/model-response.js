import { CodeBuddyCliError } from './cli-response.js'
import { createModelResponseModule } from '../shared/model-response.js'

export const { parseStructuredResponse, parseModelResponse } = createModelResponseModule({
  CodeBuddyCliError,
  nativeEnvelopeMessage: '原生结构结果必须恰好包含 text 与 toolCalls；不会回退解析普通文本。',
  invalidToolArgsMessage: '结构化工具参数必须是对象；不会解析或修复参数字符串。'
})
