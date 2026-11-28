import { CodeBuddyCliError } from './cli-response.js'
import { inspectCli } from './cli-runtime.js'
import { cliInvocation } from './cli-invocation.js'
import { createAccountsModule } from '../shared/accounts.js'

export const {
  ACCOUNT_CLI_MIN_VERSION, ACCOUNT_CLI_VERIFIED_VERSIONS, ACCOUNT_CLI_VERSION, ACCOUNT_CLI_VERSIONS,
  accountInvocationForm, assertAccountInvocation, accountDirectory, accountModelId, parseAccountModel, isolatedAccountEnv, createAccountStore
} = createAccountsModule({
  region: 'intl',
  prefix: 'dshcbi-account:',
  internetEnv: 'public',
  dirName: 'dsh-codebuddy-cli-intl',
  labelPrefix: '国际版',
  siteLabel: 'International Site',
  loginRequiredMessage: '此国际版独立账号尚无本地登录凭据，请在账号管理中生成官方登录命令，选择 International Site 并完成登录；不会沿用默认账号。',
  checkInvocationInAssertReady: true,
  CodeBuddyCliError,
  inspectCli,
  cliInvocation
})
