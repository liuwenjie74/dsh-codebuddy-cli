import { CodeBuddyCliError } from './cli-response.js'
import { inspectCli } from './cli-runtime.js'
import { cliInvocation } from './cli-invocation.js'
import { createAccountsModule } from '../shared/accounts.js'

export const {
  ACCOUNT_CLI_MIN_VERSION, ACCOUNT_CLI_VERIFIED_VERSIONS, ACCOUNT_CLI_VERSION, ACCOUNT_CLI_VERSIONS,
  accountInvocationForm, assertAccountInvocation, accountDirectory, accountModelId, parseAccountModel, isolatedAccountEnv, createAccountStore
} = createAccountsModule({
  region: 'cn',
  prefix: 'dshcb-account:',
  internetEnv: 'internal',
  dirName: 'dsh-codebuddy-cli-cn',
  labelPrefix: '',
  siteLabel: 'Chinese Site',
  loginRequiredMessage: '此独立账号尚无本地登录凭据，请在账号管理中生成官方登录命令并完成登录；不会沿用默认账号。',
  checkInvocationInAssertReady: false,
  CodeBuddyCliError,
  inspectCli,
  cliInvocation
})
