import { CodeBuddyCliError } from './cli-response.js'
import { terminateProcess, trackChild } from './cli-process.js'
import { cliEnv, resolveCli } from './cli-runtime.js'
import { cliInvocation } from './cli-invocation.js'
import { createModelCatalogModule } from '../shared/model-catalog.js'

export const { normalizeCatalog, queryModelCatalog, createModelCatalog, modelLabel, modelInfo } = createModelCatalogModule({
  regionLabel: '国际',
  clientVersion: '0.2.2',
  CodeBuddyCliError,
  terminateProcess,
  trackChild,
  cliEnv,
  resolveCli,
  cliInvocation
})
