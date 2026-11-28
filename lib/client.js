window.__ModuleLoader__.load({
  id: 'dsh-dkn-codebuddy-cli',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports
    const React = require('react')
    const h = React.createElement
    const NS = 'llm-codebuddy-cli-cn'
    // 与 package.json 的 version 保持一致，由 scripts/sync-version.mjs 改写，请勿手改。
    const PLUGIN_VERSION = '2.2.4'
    const STATUS_PATH = '/plugins/dsh-codebuddy-cli-cn/status'
    const ACTION_PATH = '/plugins/dsh-codebuddy-cli-cn/actions'
    const DIAGNOSTICS_PATH = '/plugins/dsh-codebuddy-cli-cn/diagnostics'
    const ACCOUNTS_PATH = '/plugins/dsh-codebuddy-cli-cn/accounts'
    // ---- 1. locale tables (generated from locales/*.json; never hand-edited) ----
    const localeZh = {
      // 由 locales/cn.zh.json 生成，请勿手改；改词表请改该 JSON 后运行 node scripts/build-client-locales.mjs
      "accountAdd": "新增账号",
      "accountAdded": "独立环境已创建。生成登录命令，在新的 PowerShell 窗口运行；选择 Chinese Site 并核对账号，登录后退出 CLI，再刷新模型。",
      "accountAddTitle": "新增账号",
      "accountAutoLabel": "账号 {count}",
      "accountCancel": "取消移出",
      "accountConfirmRemove": "确认移出（保留本地登录数据）",
      "accountCreditsLeft": "剩余 {credits} 分",
      "accountCreditsUnknown": "额度未读取",
      "accountDefaultAccount": "本区默认账号",
      "accountDefaultEmpty": "本区尚未设置默认账号：新增一个账号、完成一次登录，再点「使用此账号」。插件不会改用其他区域或共享目录里的登录记录。",
      "accountDefaultLogin": "默认 CLI 登录（只读）",
      "accountExhausted": "额度不足，暂停至 {time}",
      "accountGuide": "查看多账号使用指南",
      "accountGuideErrors": "ACCOUNT_LOGIN_REQUIRED：完成该环境的官方登录；ACCOUNT_MODEL_REQUIRED：重新选择该账号的模型；ACCOUNT_CLI_UNVERIFIED：CLI 版本未核查；ACCOUNT_IN_USE：先切换并等待结束。401 请在对应独立环境内 /login。环境备注不代表已核验身份。",
      "accountGuideSteps": "1. 新增独立环境；2. 生成并在新的 PowerShell 窗口运行登录命令；3. 选择 Chinese Site，核对目标身份，登录后退出；4. 选择条目并刷新模型；5. 在会话中选择该账号的模型（模型名不带账号备注）。首次逐个授权，不要复制凭据或把令牌发到反馈中。",
      "accountHasCredential": "本地凭据存在（身份、有效性及额度未核验）",
      "accountIdentity": "已登录：{nickname} · {uid} · 凭据有效至 {time}",
      "accountIdentityENCRYPTED": "登录记录是加密格式（由桌面应用写入），这里读不到；请用 npm 版 CLI 登录该账号。",
      "accountIdentityEXPIRED": "登录凭据已过期，请重新登录后再读取额度。",
      "accountIdentityFOREIGN_REGION": "本机可读的登录记录属于另一个区域（{domain} 的 {nickname}），不会用于读取本区额度；请在本环境登录本区账号，或点「设备授权」。",
      "accountIdentityMISSING": "该账号还没有登录记录，请先运行登录命令。",
      "accountIdentityUNREADABLE": "登录记录读取失败，无法确认账号身份。",
      "copyAuthLink": "复制授权链接",
      "accountLabel": "账号备注",
      "accountLegacy": "使用默认 CLI 登录",
      "accountLoginCancel": "取消",
      "accountLoginDone": "我已登录，刷新",
      "accountLoginGenerating": "正在生成官方登录命令…",
      "accountLoginNotYet": "还没检测到登录记录，完成官方登录后再点一次。",
      "accountLoginStart": "官方登录命令已生成。在 PowerShell 里运行它完成登录，回来点「我已登录，刷新」。",
      "accountNativeNotice": "当前使用的是原生 codebuddy.exe。多账号隔离依赖它读取隔离目录；若该账号登录后仍显示没有本地登录凭据，请改用 npm 版 codebuddy.cmd。",
      "accountNoCredential": "尚无本地登录凭据",
      "accountNote": "每个账号单独登录；选中账号后，DSH 模型选择器里显示的就是该账号的模型（模型名不带账号备注）。",
      "accountOff": "关",
      "accountOn": "开",
      "accountOtherTitle": "其他账号",
      "accountOverviewTitle": "账号概览",
      "quotaAuthForeignRegion": "注意：上游返回的是另一区域的登录页，请核对域名后再授权。",
      "accountPathError": "隔离目录异常，已阻止调用",
      "accountPickProgram": "重新选择程序",
      "accountPrepare": "生成官方登录命令",
      "accountPrivacy": "插件不导入或复制日常登录凭据。新增、选择账号不会自动发送模型问题；登录命令需要手动运行。",
      "accountReadOnly": "只读",
      "accountRemove": "移出列表",
      "accountRemoved": "已移出列表。本地官方登录数据保留，已有会话将明确失败，不会改用其他账号。",
      "accountRotation": "额度耗尽时自动换号",
      "accountRotationNote": "账号属于模型 id、不进入显示名，逐次轮流调用会重写会话前缀、增加开销，因此这里不做轮流。开启后仅当所选账号返回额度不足，下一次请求才换到有登录凭据的其他账号，并记录一次切换；关闭时任何失败都原样报错。",
      "accountRotationToggle": "只在额度不足时让位",
      "accountSelected": "已选中",
      "accountStatusSignedIn": "已登录",
      "accountsTitle": "多账号管理",
      "accountStoreError": "账号列表读取失败，已阻止模型调用；请保留本地数据并查看指南。",
      "accountSummaryCurrent": "当前账号",
      "accountSummaryRotation": "自动换号",
      "accountSummarySigned": "已登录账号",
      "accountUnsupported": "当前系统未验证多账号隔离，请继续使用默认 CLI 登录。",
      "accountUsage": "本进程记录：请求 {calls} 次 · 输入 {input} / 输出 {output} Token；不代表官方扣费或余额。",
      "accountUse": "使用此账号",
      "accountValidation": "多账号要求 Windows / 官方 CLI 2.174.0 及以上（npm 版 codebuddy.cmd 或官方安装包里的 codebuddy.exe；已实测 2.174.0 / 2.177.0，更高版本带警告放行）。路径隔离和自动测试已验证；真实双账号登录、刷新与扣费归属尚待验收。",
      "actionFailed": "操作未完成，请检查网络后重试。",
      "active": "当前正在处理 {count} 个请求",
      "armCapture": "采集下一次失败回复",
      "batchSaved": "已保存 {count} 个模型的启用状态。",
      "budgetDetail": "本地大小检查：{stage} · {actual} / {limit} 字节；本次在模型调用前拒绝。",
      "budgetEnvelope": "文字请求封装",
      "budgetInput": "CLI 编码输入",
      "cancelCapture": "取消详细采集",
      "cancelClear": "取消",
      "captureArmed": "已开启：等待下一次非主动取消的失败，随后自动关闭。重启也会关闭；成功调用和主动停止任务不消耗采集机会。无法补录开启前的失败。",
      "captureConsent": "我了解详细样本可能包含私人内容，会在分享前检查并删除敏感信息。",
      "captureNotice": "为定位格式错误，可手动采集下一次失败的原始模型回复（不采集请求、CLI 标准错误或登录文件）。回复可能包含聊天、代码、文件内容和工具参数，并可能复述敏感信息。最多采集 256 KiB，超出时保留首尾并标明截断。",
      "captureRequestSamples": "采集脱敏请求样本",
      "captureRequestSamplesNote": "开启后，每次请求把「系统提示范围」另存为一份脱敏样本，写入诊断目录下的 requests 子目录：只含系统提示与 system 消息，不含用户、助手与工具消息。密钥、Bearer、data URI、长串、邮箱、长数字与 UUID 会先行遮盖，单份上限 64 KiB，只保留最近 20 份。CLI 自己在 OAuth 分支写入的身份段不经过插件，任何样本都抓不到。切换即时生效，保存在 DSH 配置里。",
      "captureRequestSamplesToggle": "启用：把每次请求的系统提示范围（已脱敏、已截断）另存到诊断目录，默认关闭",
      "catalogEmpty": "尚未获取模型目录，请完成 CLI 配置和登录后刷新。",
      "catalogReady": "检测到 {count} 个模型 · 更新于 {time}",
      "catalogStale": "刷新未成功，暂时显示上次目录。{message}",
      "clearLogs": "清空日志",
      "clearSelection": "清空",
      "cliAvailable": "CLI 程序可启动：{version}",
      "cliCheckNote": "此检查仅运行版本命令，不验证账号登录、网络连通性或模型响应。模型目录可刷新也不等于模型调用成功。",
      "cliExecutable": "可执行文件",
      "cliPath": "CLI 路径（留空自动检测）",
      "cliUnavailable": "CLI 程序检查失败（{code}），请点击“一键配置 CLI”或检查路径。",
      "cliVersionLabel": "版本",
      "colCalls": "调用",
      "configDir": "登录配置目录（可选）",
      "confirmClear": "确认清空全部日志和详细样本",
      "context": "上下文",
      "controlSummary": "控制事件另计：取消 {cancelled} 次 · 图片卸载 {offloads} 次。",
      "copied": "已复制登录命令",
      "copyLogin": "复制登录命令",
      "creditsNote": "倍率来自官方目录，实际扣费以官方为准。",
      "detecting": "正在查找并检查 CLI…",
      "diagnosticId": "诊断 ID：{id}（可在导出日志中查找）",
      "disableSelected": "停用选中",
      "effort": "默认推理强度",
      "efforts": "推理强度",
      "enabled": "启用",
      "enableSelected": "启用选中",
      "exportCsv": "导出 CSV",
      "exportDetailed": "导出详细日志（含原始回复）",
      "exportLogs": "导出普通日志",
      "filterModels": "筛选",
      "followDefault": "跟随模型默认值",
      "guideAccess": "版本检查只说明程序能启动。CLI_NETWORK_ERROR 表示已识别的连接重置或 TLS 建连失败，请检查到官方服务的网络或代理；不能仅凭任务内容认定 GitHub 等目标网站故障。插件不会自动重试。401 请走官方登录；文件或 ACL 错误先确认 DSH 工作区与路径。",
      "guideAccessTitle": "CLI、网络、登录或文件权限",
      "guideCliError": "CLI_REQUEST_FAILED 表示 CLI 返回错误，但错误文本不足以安全归入已知类别。保留诊断 ID 和普通日志，记录 CLI/插件版本、模型及是否带图片；可用短文本请求判断是否只在图片请求中出现。不要把未知错误直接当作余额或网络问题，也不要重复已执行的 DSH 工具。",
      "guideCliErrorTitle": "CLI 请求失败但原因未识别",
      "guideIncomplete": "原生结果仍可能缺失、截断或不符合字段要求。插件不补全结构、不解析字符串工具参数，也不偷偷回退文字协议。缩短单次回复或拆分任务，保留完整错误和诊断 ID。官方结构化处理可能包含内部多轮，均受总超时限制。",
      "guideIncompleteTitle": "返回结构错误或回复过长",
      "guideIntro": "当前使用官方原生 JSON Schema，只开放 StructuredOutput 输出工具，业务工具仍由 DSH 执行。先确认已执行的操作，再处理失败；不要盲目重复写入或运行命令。",
      "guideLiteral": "正常结束也可能存在模型文字保真问题。要求只重写有差异的一小段代码块，并核对原始字符。插件不会对合法回复统一二次反转义，以免改坏正常代码或工具参数。",
      "guideLiteralTitle": "路径、代码或反斜杠显示不符",
      "guideLocalSize": "REQUEST_TOO_LARGE 表示本次请求在启动模型调用前被本地大小检查拒绝：文字请求封装上限 12 MiB，最终 CLI 输入上限 20 MiB，均按 UTF-8 字节计算，不是 Token 数。图片卸载只移除图片内容，不压缩文字历史；JSONL 转义还会增加最终输入大小。配置页和普通日志可查看检查阶段与尺寸分解；旧日志缺失的尺寸无法补算。请保留原对话，在新对话中提供必要摘要或减少本轮需要的工具范围；插件不自动删历史、丢图、截断工具定义或重试。",
      "guideLocalSizeTitle": "本地请求大小上限",
      "guideLogs": "导出普通日志并记录诊断 ID、时间和复现步骤。需要原文时先开启下一次失败采集，分享前检查内容。成功调用与主动停止任务不消耗采集机会；取消采集、清空日志或重启会关闭开关。",
      "guideLogsTitle": "如何保留有效反馈",
      "guideMultiple": "CLI_STRUCTURED_OUTPUT_MISSING 表示 CLI 没有返回原生结果，普通文字不会作为替代。检查 CLI 版本、模型支持和错误日志。native-final-results 表示最终记录不唯一，插件不会选择最后一份。旧版 ambiguous-json 的文字候选提取已退出当前调用路径。",
      "guideMultipleTitle": "原生结果缺失或多个最终结果",
      "guideProgress": "最终回复失败不代表之前的工具没有执行。先核对工具记录、文件内容和退出码，再决定是否重试；只让模型汇总已有结果时，明确说明不要重复已完成操作。",
      "guideProgressTitle": "工具做完了，最后仍提示失败",
      "guideSize": "CLI_CONTEXT_TOO_LARGE（400）表示官方服务明确拒绝了超上下文请求；插件不会截断或删除 DSH 历史。累计超过 32,768 个字符的标准内联图片 data URI 会在提交模型请求前被 IMAGE_DATA_URI_TOO_LARGE 拦截；请改用 DSH 图片附件，或新建对话并附必要摘要。字符阈值不是 Token 估算。CLI_INSUFFICIENT_BALANCE（402）仅表示 CLI 明确返回余额不足提示，请在官方套餐与用量页核对。",
      "guideSizeTitle": "长历史、图片文本过大或额度不足",
      "guideTitle": "故障处理与使用指南",
      "hideLogs": "收起日志",
      "hintShow": "显示说明",
      "imageBase64": "图片自动转 Base64",
      "imageBase64Note": "开启后图片附件会内联进请求（Base64）。关闭后不再内联，带图请求会以「图片需走离线通道」提示，避免把图片塞进过大的请求体。切换即时生效，保存在 DSH 配置里。",
      "imageBase64Toggle": "关闭后带图请求改走离线通道提示",
      "images": "图片输入",
      "imagesHelp": "支持用户图片和 DSH 工具返回的标准图片附件，包括桌面、窗口、区域、浏览器截图。两类图片共用 5 张请求预算，每张转换后 ≤2 MiB、最长边 ≤1920；历史超预算由 DSH 记录卸载。工具只返回路径、网址或原始 Base64 时不会自动读图。累计超过 32,768 个字符的标准内联图片 data URI 会在提交模型请求前拦截，建议改用 DSH 图片附件。模型原生图片生成未适配。含图片请求不采集失败原文；图片、Base64 不进入反馈日志。",
      "imagesNo": "未声明",
      "imagesShort": "支持文本与标准图片附件（单次最多 5 张，单张 ≤ 2 MiB）",
      "imagesYes": "图片",
      "inspect": "检查 CLI 程序",
      "inspectBusy": "检查中…",
      "installationGuide": "官方安装指南",
      "installing": "正在安装官方 CLI，请稍候…",
      "intro": "使用官方 CodeBuddy CLI，把账号额度用于 DSH 中选择的模型。模型目录和积分倍率自动同步，工具由 DSH 执行。",
      "lastCall": "最近一次：{model} · {time} · 单次输入（含缓存）{input} / 输出 {output} Token",
      "lastFailed": "最近一次请求失败：{code}",
      "lastUsed": "最近使用 {time}",
      "logConsoleEmpty": "本进程还没有可显示的日志。",
      "logConsoleTitle": "日志控制台",
      "loginHelp": "在 PowerShell（macOS/Linux 使用终端）中粘贴运行，按官方流程登录国内账号，然后点击“刷新模型与倍率”。若提示 401，请在 CLI 中执行 /login 重新登录。",
      "loginMissing": "先完成 CLI 自动配置，再获取登录命令。",
      "loginTitle": "首次登录或切换账号",
      "logLevel": "日志级别",
      "logLevelDebug": "调试",
      "logLevelError": "仅失败",
      "logLevelInfo": "全部调用",
      "logLevelNote": "日志级别只影响诊断日志的写入量：仅失败只记失败请求，全部调用记录每次调用，调试目前与全部调用相同（保留给更细的诊断）。它不改变请求内容，也不影响模型输出。",
      "logsExported": "已生成日志下载，请确认文件已保存；分享前先检查内容。",
      "logsFailed": "日志操作失败，请重试。",
      "logsHelp": "反馈时附上日志 JSON、报错截图和复现步骤。普通日志不够定位时，再开启一次详细采集并复现。清空会删除本机记录并关闭详细采集，已下载的文件需要自行删除。",
      "logsNote": "普通日志自动保存在本机，最多保留 100 次调用、总计 2 MiB，重启后仍可查看。包含版本、模型、耗时、用量和结构统计；不含请求正文、回复正文、登录凭据或配置路径。不会自动上传。",
      "logsStatus": "已保存 {entries} 条 · 失败 {failures} 条 · 详细样本 {samples} 份",
      "logsStorageError": "本机日志读写失败（{code}）；当前可见记录仍可导出，但重启后可能丢失。",
      "logsTitle": "诊断日志与问题反馈",
      "maxConcurrency": "最大并发调用",
      "maxConcurrencyNote": "限流只作用于本插件发起 CLI 调用的那一层：达到上限后新请求排队等待，而不是同时压向官方服务，用来避免 429 雪崩。0 为不限制，保持原有行为。该值保存在 DSH 配置里。",
      "maxConcurrencyToggle": "0 表示不限制；达到上限后新请求排队等待",
      "metricEntries": "已保存",
      "metricFailures": "失败",
      "metricmodels": "目录模型数",
      "metricSamples": "详细样本",
      "metricSamplesRedacted": "脱敏样本",
      "metricusage": "本进程调用次数",
      "model": "默认模型 ID（可选）",
      "modelDisabled": "已停用",
      "modelEnable": "启用",
      "modelEnabled": "已启用",
      "modelFallbackNotice": "本次请求的模型不可用，已自动改用默认模型：请求 {requested} → 实际 {used}。停用某模型后，正停在该模型上的既有会话仍需重新选择模型。",
      "modelName": "模型 / ID",
      "modelNote": "实际使用 DSH 会话中选择的模型；这里仅作为未指定模型时的默认值，也可填写未列出的模型 ID。",
      "modelPlaceholder": "留空跟随 CLI 默认，可从下拉候选中选择",
      "models": "模型目录",
      "modelsEnabledChip": "{total} 个 · 已启用 {enabled}",
      "modelsSelectionStatus": "共 {total} 个模型 · 已选 {selected} 个 · 已停用 {hidden} 个",
      "modelsTabAll": "全部 {count}",
      "modelState": "状态",
      "modelsUpdatedAt": "更新于 {time}",
      "modelVisibilityFailed": "启用状态保存失败，请重试。",
      "modelVisibilityLast": "至少保留一个可用模型；请先启用其他模型。",
      "multiplier": "积分倍率",
      "nativeDetail": "原生结果事实：structured_output 存在 {present} · 类型 {type} · 终态 type=result {valid} · subtype 类别 {subtype}。",
      "navaccounts": "账号管理",
      "navconnection": "连接配置",
      "navdiagnostics": "诊断日志",
      "navlogs": "日志查看",
      "navmodels": "模型目录",
      "navusage": "Token 用量",
      "networkFacts": "网络：代理 {proxy} · 自定义 CA {ca} · Node {node}",
      "networkHint": "这里只显示当前进程实际生效的值，插件不保存也不修改它们。代理来自 HTTPS_PROXY（或 https_proxy / HTTP_PROXY / ALL_PROXY）；Node 24 起内置 fetch 还需 NODE_USE_ENV_PROXY=1 才会走代理，否则该值存在但请求仍直连。自定义 CA 来自 NODE_EXTRA_CA_CERTS，必须指向 PEM 文件且在启动 DSH 之前设置。显示「未知」表示没有配置，出站请求将直连——这是企业网或抓包环境下请求失败的常见原因。",
      "noEffort": "模型默认",
      "noMatches": "没有匹配的模型。",
      "noNormalization": "无需处理",
      "notChecked": "正在等待 CLI 程序检查",
      "noticeDetail": "固定错误类别 {kind} · 命中来源 {source}；未知类别不能确定根因。",
      "noUsage": "尚未通过 DSH 发起模型请求。插件不会自动发送测试问题。",
      "openHome": "打开 CodeBuddy 官网查看用量",
      "openPage": "打开 CodeBuddy 配置",
      "pageEntryHint": "配置已移至左侧栏的 CodeBuddy 独立页面。",
      "pageSections": "配置板块",
      "parseAmbiguous": "多个结果，无法确定",
      "parseArguments": "工具参数不合法",
      "parseCalls": "toolCalls 不是数组",
      "parseEmpty": "模型结果为空",
      "parseEnvelope": "根结构不符合协议",
      "parseIncomplete": "JSON 未闭合，可能截断",
      "parsePlainText": "纯文本答复（未执行工具）",
      "parseSyntax": "JSON 语法不合法",
      "parseText": "text 字段缺失或类型错误",
      "parseUnknownTool": "工具未声明",
      "parseValid": "结构有效",
      "perModelEmpty": "本进程还没有调用记录。",
      "perModelTitle": "按模型消耗统计",
      "preflightFailed": "保存前检查未通过：{item}（{code}）。请修正后再保存。",
      "previewDetailed": "预览详细日志",
      "quickSetup": "CLI 自动配置",
      "quotaAuthorize": "授权读取额度",
      "quotaAuthorizeHint": "已生成授权链接，请复制到浏览器打开并确认授权；完成后回来点「我已完成授权」。",
      "quotaCompleteAuth": "我已完成授权",
      "quotaDisconnect": "断开授权",
      "quotaDisconnected": "已断开授权，本地保存的凭据已删除。",
      "quotaEmpty": "账号下没有可用的资源包。",
      "quotaExpire": "到期 {time}",
      "quotaFailed": "额度读取失败，请重试或去官网查看。",
      "quotaLoading": "正在读取额度…",
      "quotaNotAuthorized": "尚未授权读取额度。额度由官方账号决定，可授权后直接读取，或去官网查看。",
      "quotaPackages": "资源包明细（同名已合并，共 {count} 类）",
      "quotaRefresh": "刷新额度",
      "quotaRefreshAllNote": "刷新所有账号的额度：默认登录行与每个已登录账号各读一次。",
      "quotaRefreshedAt": "已于 {time} 刷新。",
      "quotaRefreshing": "刷新中…",
      "quotaRemain": "剩余积分",
      "quotaSourceCli": "来自该账号的 CLI 登录",
      "quotaSourceDevice": "来自浏览器授权",
      "quotaTotal": "总额度",
      "quotaUnavailable": "额度暂时读取不到，请稍后重试或去官网查看。",
      "quotaUnit": "分",
      "quotaUsed": "已用积分",
      "recentCallsTitle": "最近调用",
      "recentFailures": "最近失败记录（最多 5 条，重启后清空）",
      "refreshing": "正在检测模型…",
      "refreshModels": "刷新模型与倍率",
      "requestSize": "最近请求：{messages} 条历史消息 · {tools} 个工具；封装文本 {total} 字节（系统 {system} / 历史 {history} / 工具 {schemas}）。字节数不是 Token 数，不含 CLI 内部开销。",
      "requestSizeExtra": "其余尺寸：响应 Schema {schema} / 封装开销 {overhead} / CLI 编码输入 {input} 字节。图片 JSONL 的再次转义及图片块计入 CLI 编码输入，不计入封装文本。",
      "requestTime": "最近调用总耗时 {seconds} 秒。当前为完整 JSON 返回，不提供模型生成速度。",
      "responseDetail": "结果诊断：{reason} · 返回类型 {type} · {bytes} 字节 · 兼容处理 {normalized}。基础诊断不含正文。",
      "rewriteAudit": "标识覆盖：本次改写 {hits} 处；插件可见范围内仍有 {residual} 处身份文本未被覆盖（合法运行时路径不计）。",
      "rewriteClientNames": "覆盖标识",
      "rewriteClientNamesNote": "开启后，请求体系统提示里的客户端自称统一替换为 WorkBuddy，大小写不敏感，只作用于系统提示范围；用户消息即使提到这些名字也不会被改动。CLI 自己写入身份段（OAuth 分支）不在覆盖范围内。切换即时生效，保存在 DSH 配置里，重启后仍然有效。",
      "rewriteClientNamesToggle": "启用：把系统提示里的客户端自称统一改为 WorkBuddy",
      "rewriteTitle": "功能开关",
      "runtimeVersion": "插件运行版本：{version} · 当前调用超时：{seconds} 秒",
      "save": "保存设置",
      "saved": "设置已保存",
      "saveFailed": "保存失败，请重试",
      "saveFirst": "有未保存的设置，请先保存后再执行检测或配置。",
      "saving": "保存中…",
      "searchModels": "搜索模型名称或 ID",
      "selectAll": "全选",
      "selectColumn": "选择",
      "settings": "高级连接与默认值（可选）",
      "setup": "一键配置 CLI",
      "setupBusy": "配置中…",
      "setupNote": "先查找本机安装；未安装时下载并运行官方安装器。支持 Windows x64、macOS 和 Linux，无需手填用户名或安装路径。",
      "setupReady": "CLI 已配置，版本 {version}。",
      "sidebarEntry": "CodeBuddy",
      "sizeUnknown": "未记录",
      "sortHint": "点击排序：升序 → 降序 → 目录原序",
      "statAccount": "当前账号",
      "statCalls": "本进程调用",
      "statCli": "CLI 状态",
      "statFailures": "失败",
      "statModels": "已启用 / 总数",
      "streamDetail": "图片流结构诊断：原因 {reason} · 阶段 {phase} · 帧 {index}/{total}（{bytes} 字节）· init {init} / result {final} · 最后帧 {last} · 终止发起方 {origin} · 已观察 close {closed} · 截止 {deadline}。",
      "subtitle": "用官方 CodeBuddy 账号额度驱动 DSH 模型，目录与倍率自动同步。",
      "timeoutChip": "超时 {seconds}s",
      "timeoutDetail": "CLI 进程诊断：耗时 {seconds} 秒 · 标准输出 {stdout} 字节 · 诊断输出 {stderr} 字节；这些大小不代表模型生成进度。",
      "timeoutHelp": "这是启动 CLI 到整次调用结束的总时限，包含模型处理和 CLI 退出。复杂任务可设为 300000–600000（5–10 分钟）；超时后不会自动重试。",
      "timeoutMs": "单次调用超时（毫秒）",
      "title": "CodeBuddy CLI（国内版）",
      "todayCalls": "今日调用",
      "toolCoverage": "查看工具与返回内容适配范围",
      "toolCoverageUrl": "https://github.com/liuwenjie74/dsh-codebuddy-cli/blob/main/docs/cn/工具适配范围.md",
      "toolNote": "模型目录以当前国内 CLI 返回结果为准，账号权限由官方判断。插件传递文本和标准图片附件，工具由 DSH 执行。",
      "undoBatch": "撤销上次批量",
      "unknown": "官方未提供",
      "usage": "本次运行的累计 Token 用量",
      "usageBreakdown": "输入明细：未缓存 {uncached} · 缓存命中 {read} · 缓存写入 {write} Token",
      "usageCache": "缓存命中",
      "usageInput": "输入 tokens",
      "usageNote": "累计输入包含未缓存、缓存命中和缓存写入，每项只计一次；不是单条提问的字数，也不代表积分扣费。重启后清零。",
      "usageOutput": "输出 tokens",
      "usageTotals": "累计请求 {calls} 次 · 累计输入（含缓存）{input} · 缓存命中 {read} · 累计输出 {output} Token",
      "viewLogs": "查看普通日志",
      "autoCheckin": "每日自动签到",
      "autoCheckinToggle": "开启后按东八区窗口自动签到（国内版每日签到 / 国际版活跃信标）",
      "autoCheckinNote": "默认关闭。国内版在东八区 9:00 / 21:00 检查并领取每日签到；国际版在 8:00 / 12:00 / 16:00 / 20:00 检查热力图并在未点亮时上报单次活跃信标（次日凌晨自动发放奖励积分）。当日已完成会自动跳过。",
      "autoTokenKeepalive": "Token 定时续期",
      "autoTokenKeepaliveToggle": "每日东八区 22:00 自动续期已保存的设备授权令牌",
      "autoTokenKeepaliveNote": "默认关闭。默认仅续期插件自身保存的设备授权令牌，不会改动官方 CLI 的磁盘登录文件；若需同时续期官方 CLI 明文凭据，请显式开启下方开关。",
      "allowCliCredentialRefresh": "允许续期并写回明文 CLI 凭据",
      "allowCliCredentialRefreshToggle": "续期时同步刷新并原子写回明文 CLI .info 登录文件",
      "allowCliCredentialRefreshNote": "默认关闭。开启后仅作用于明文 .info 文件，自动跳过桌面端加密凭据（$wbEncrypted）与跨区文件，且在无活跃 CLI 调用时采用两段式快照校验原子写回，避免与官方 CLI 冲突。",
      "checkinAll": "一键签到",
      "checkinBusy": "签到中…",
      "checkinDone": "签到完成：{msg}",
      "keepaliveAll": "续期令牌",
      "keepaliveBusy": "续期中…",
      "keepaliveDone": "续期完成：{msg}"
    }
    const localeEn = {
      // 由 locales/cn.en.json 生成，请勿手改；改词表请改该 JSON 后运行 node scripts/build-client-locales.mjs
      "accountAdd": "Add account",
      "accountAdded": "Isolated environment created. Prepare its sign-in command and run it in a new PowerShell window. Choose Chinese Site, verify the account, exit the CLI after sign-in, then refresh models.",
      "accountAddTitle": "Add an account",
      "accountAutoLabel": "Account {count}",
      "accountCancel": "Cancel removal",
      "accountConfirmRemove": "Confirm removal (keep local sign-in data)",
      "accountCreditsLeft": "{credits} credits left",
      "accountCreditsUnknown": "Credits not read",
      "accountDefaultAccount": "Default account (this region)",
      "accountDefaultEmpty": "No default account in this region yet: add an account, sign in once, then press \"Use this account\". The plugin will not borrow another region's record or the shared sign-in file.",
      "accountDefaultLogin": "Default CLI sign-in (read-only)",
      "accountExhausted": "Out of credits until {time}",
      "accountGuide": "Multiple-account guide",
      "accountGuideErrors": "ACCOUNT_LOGIN_REQUIRED: sign in in that environment. ACCOUNT_MODEL_REQUIRED: choose that account's model. ACCOUNT_CLI_UNVERIFIED: unverified CLI version. ACCOUNT_IN_USE: switch and wait. For 401, use official /login in the corresponding environment. Labels do not establish verified identities.",
      "accountGuideSteps": "1. Add an environment. 2. Prepare and run its command in a new PowerShell window. 3. Choose Chinese Site, verify the identity, then exit after sign-in. 4. Select the entry and refresh models. 5. Select that account's model in the conversation (model names carry no account label). Authorize accounts separately; never copy credentials or send tokens with feedback.",
      "accountHasCredential": "Local credential present (identity, validity and credits unverified)",
      "accountIdentity": "Signed in: {nickname} · {uid} · valid until {time}",
      "accountIdentityENCRYPTED": "The sign-in record is encrypted (written by the desktop app) and cannot be read here; sign this account in with the npm CLI.",
      "accountIdentityEXPIRED": "The sign-in credential expired. Sign in again, then read the credits.",
      "accountIdentityFOREIGN_REGION": "The readable sign-in record belongs to another region ({nickname} at {domain}) and is never used for this region's credits; sign in to this region's account here, or use the device authorisation.",
      "accountIdentityMISSING": "This account has no sign-in record yet. Run its login command first.",
      "accountIdentityUNREADABLE": "The sign-in record could not be read, so the identity is unconfirmed.",
      "copyAuthLink": "Copy authorisation link",
      "accountLabel": "Account label",
      "accountLegacy": "Use default CLI sign-in",
      "accountLoginCancel": "Cancel",
      "accountLoginDone": "I have signed in, refresh",
      "accountLoginGenerating": "Generating the official sign-in command…",
      "accountLoginNotYet": "No login record yet. Finish the official sign-in, then press again.",
      "accountLoginStart": "The official sign-in command is ready. Run it in PowerShell, then come back and press the button below.",
      "accountNativeNotice": "This is the native codebuddy.exe. Account isolation relies on it honouring the isolated directories; if an account still shows no local sign-in after logging in, switch to the npm codebuddy.cmd.",
      "accountNoCredential": "No local sign-in credential",
      "accountNote": "Sign in to each account separately; once one is selected, the DSH model picker shows that account's models under their plain model names.",
      "accountOff": "Off",
      "accountOn": "On",
      "accountOtherTitle": "Other accounts",
      "accountOverviewTitle": "Account overview",
      "quotaAuthForeignRegion": "Note: the upstream sign-in page belongs to the other region; check the domain before authorising.",
      "accountPathError": "Invalid isolation directory; requests blocked",
      "accountPickProgram": "Choose another program",
      "accountPrepare": "Prepare official sign-in command",
      "accountPrivacy": "The plugin does not import or copy your everyday credentials. Adding or selecting an account does not send model prompts; run sign-in commands manually.",
      "accountReadOnly": "Read-only",
      "accountRemove": "Remove from list",
      "accountRemoved": "Removed from the list. Official local sign-in data is retained. Existing conversations fail explicitly instead of switching accounts.",
      "accountRotation": "Switch accounts when credits run out",
      "accountRotationNote": "The account is part of the model id, so rotating on every request would rewrite the conversation prefix and cost more than it saves. When enabled, only an insufficient-credits answer moves the next request to another account that has a sign-in, and one switch is recorded; when disabled, every failure is reported as-is.",
      "accountRotationToggle": "Yields only when credits run out",
      "accountSelected": "Selected",
      "accountStatusSignedIn": "Signed in",
      "accountsTitle": "Multiple accounts",
      "accountStoreError": "Account list could not be read. Requests are blocked; preserve local data and see the guide.",
      "accountSummaryCurrent": "Current account",
      "accountSummaryRotation": "Auto switch",
      "accountSummarySigned": "Signed in",
      "accountUnsupported": "Multiple-account isolation is unverified on this platform. Continue using the default CLI sign-in.",
      "accountUsage": "This process: {calls} requests · input {input} / output {output} tokens; not official billing or remaining credits.",
      "accountUse": "Use this account",
      "accountValidation": "Multiple accounts require Windows and the official CLI 2.174.0 or newer (the npm codebuddy.cmd or the official codebuddy.exe; verified on 2.174.0 / 2.177.0, newer versions pass with a warning). Directory isolation and automated checks passed; real two-account sign-in, refresh and billing attribution still need acceptance testing.",
      "actionFailed": "The action failed. Check your network and retry.",
      "active": "{count} request(s) active",
      "armCapture": "Capture next failed reply",
      "batchSaved": "Saved the enabled state for {count} models.",
      "budgetDetail": "Local size check: {stage} · {actual} / {limit} bytes; refused before this model invocation.",
      "budgetEnvelope": "Text envelope",
      "budgetInput": "Encoded CLI input",
      "cancelCapture": "Cancel detailed capture",
      "cancelClear": "Cancel",
      "captureArmed": "Waiting for the next non-user-aborted failure, then capture turns off. Restart also turns it off. Successes and user-aborted tasks preserve capture. Earlier failures cannot be recovered.",
      "captureConsent": "I understand detailed samples may contain private content and will review and remove sensitive information before sharing.",
      "captureNotice": "For format failures, optionally capture the next failed raw model reply, excluding requests, CLI stderr and login files. Replies can contain chats, code, file contents, tool arguments and repeated sensitive information. Samples are limited to 256 KiB; larger replies retain both ends with a truncation marker.",
      "captureRequestSamples": "Capture redacted request samples",
      "captureRequestSamplesNote": "When on, each request saves one redacted sample of its system-prompt scope under the requests subfolder of the diagnostics directory: system prompt and system messages only, never user, assistant or tool messages. Keys, Bearer tokens, data URIs, long blobs, emails, long numbers and UUIDs are masked first; each sample is capped at 64 KiB and only the newest 20 are kept. The identity block the CLI writes itself in its OAuth branch never passes through this plugin, so no sample can capture it. The switch takes effect immediately and is stored in the DSH configuration.",
      "captureRequestSamplesToggle": "Apply: save the system-prompt scope of each request (redacted and size-capped) to the diagnostics folder; off by default",
      "catalogEmpty": "No model catalog yet. Set up and sign in to the CLI, then refresh.",
      "catalogReady": "{count} models · Updated {time}",
      "catalogStale": "Refresh failed; showing the previous catalog. {message}",
      "clearLogs": "Clear logs",
      "clearSelection": "Clear",
      "cliAvailable": "CLI executable starts: {version}",
      "cliCheckNote": "This runs the version command only. It does not verify sign-in, network connectivity or model responses. Catalog discovery is not a model-call test.",
      "cliExecutable": "Executable",
      "cliPath": "CLI path (blank: auto-detect)",
      "cliUnavailable": "CLI executable check failed ({code}). Run setup or check its path.",
      "cliVersionLabel": "Version",
      "colCalls": "Calls",
      "configDir": "Login configuration directory (optional)",
      "confirmClear": "Confirm clearing all logs and samples",
      "context": "Context",
      "controlSummary": "Separate control events: cancellations {cancelled} · image offloads {offloads}.",
      "copied": "Sign-in command copied",
      "copyLogin": "Copy sign-in command",
      "creditsNote": "Rates come from the official catalog; official billing is authoritative.",
      "detecting": "Finding and checking CLI…",
      "diagnosticId": "Diagnostic ID: {id} (search for this in exported logs)",
      "disableSelected": "Disable selected",
      "effort": "Default reasoning effort",
      "efforts": "Reasoning efforts",
      "enabled": "Enabled",
      "enableSelected": "Enable selected",
      "exportCsv": "Export CSV",
      "exportDetailed": "Export detailed logs (raw replies)",
      "exportLogs": "Export basic logs",
      "filterModels": "Filter",
      "followDefault": "Use model default",
      "guideAccess": "A version check only proves the executable starts. CLI_NETWORK_ERROR identifies a known connection reset or TLS connection failure: check connectivity or proxy access to the official service. The task mentioning GitHub or another site does not establish that site failed. The adapter never retries automatically. Use official sign-in for 401; verify the DSH workspace/path for file or ACL errors.",
      "guideAccessTitle": "CLI, network, sign-in or file permissions",
      "guideCliError": "CLI_REQUEST_FAILED means the CLI returned an error that cannot safely be mapped to a known category. Keep the diagnostic ID and basic logs, and record CLI/plugin versions, model and whether images were attached. A short text request can help determine whether the issue is limited to image requests. Do not assume an unknown error means a balance or network problem, and do not repeat DSH tools that already ran.",
      "guideCliErrorTitle": "CLI request failed with no recognized cause",
      "guideIncomplete": "Native output can still be missing, truncated or invalid. The adapter never invents structure, decodes string tool arguments or silently falls back to the text protocol. Split tasks and retain the error and diagnostic ID. Official structured processing may involve internal turns within the total deadline.",
      "guideIncompleteTitle": "Invalid structure or oversized replies",
      "guideIntro": "Official native JSON Schema is active. Only the StructuredOutput output tool is enabled; DSH still executes business tools. Check completed operations before retrying.",
      "guideLiteral": "A successful turn may still contain model fidelity errors. Ask for only the affected short code block and compare literal characters. The adapter never unescapes all valid replies twice, which could corrupt code or arguments.",
      "guideLiteralTitle": "Paths, code or backslashes differ",
      "guideLocalSize": "REQUEST_TOO_LARGE refuses this request before the model invocation: the text envelope is limited to 12 MiB and final CLI input to 20 MiB, measured in UTF-8 bytes rather than tokens. Image offloading removes image content without compressing text history. JSONL escaping also increases final input size. Settings and basic logs show the check stage and size breakdown; missing sizes in old logs cannot be reconstructed. Keep the original conversation and provide a necessary summary in a new one, or reduce the tools needed for the task. The adapter never automatically deletes history, drops images, truncates tool definitions or retries.",
      "guideLocalSizeTitle": "Local request size limits",
      "guideLogs": "Export basic logs with the diagnostic ID, time and reproduction steps. Arm failure capture beforehand only when raw replies are needed, and review before sharing. Successes and user-aborted tasks preserve capture; cancelling capture, clearing logs or restarting disables it.",
      "guideLogsTitle": "Useful issue reports",
      "guideMultiple": "CLI_STRUCTURED_OUTPUT_MISSING means no native result was returned; prose is never substituted. Check CLI version, model support and logs. native-final-results means final records are not unique; the adapter never selects the last one. Legacy ambiguous-json text extraction is no longer used by current calls.",
      "guideMultipleTitle": "Missing native output or multiple final records",
      "guideProgress": "A failed final reply does not undo earlier tools. Check tool records, file contents and exit codes before retrying. When requesting only a summary of completed work, explicitly ask not to repeat completed operations.",
      "guideProgressTitle": "Tools completed but the final reply failed",
      "guideSize": "CLI_CONTEXT_TOO_LARGE (400) means the official service explicitly rejected an over-context request; the adapter never truncates or deletes DSH history. A standard inline image data URI exceeding 32,768 characters in total is blocked before the model request with IMAGE_DATA_URI_TOO_LARGE. Reattach through DSH or start a new conversation with a concise summary. This character threshold is not a token estimate. CLI_INSUFFICIENT_BALANCE (402) is used only when the CLI explicitly reports insufficient balance; check the official plan and usage page.",
      "guideSizeTitle": "Long history, oversized image text or insufficient credits",
      "guideTitle": "Troubleshooting and usage guide",
      "hideLogs": "Hide logs",
      "hintShow": "Show explanation",
      "imageBase64": "Inline images as Base64",
      "imageBase64Note": "When on, image attachments are inlined into the request as Base64. When off, nothing is inlined and a request that carries images reports an offload requirement instead, so an oversized body is never built silently. The switch takes effect immediately and is stored in the DSH configuration.",
      "imageBase64Toggle": "When off, requests with images fall back to the offload hint",
      "images": "Image input",
      "imagesHelp": "User images and standard DSH tool image attachments are supported, including desktop, window, region and browser captures. Both share a 5-image request budget, each converted to ≤2 MiB and longest edge ≤1920; DSH records historical offloading. A path, URL or raw Base64 returned as text is not loaded automatically. Standard inline image data URIs exceeding 32,768 characters in total are blocked before the model request; reattach through DSH. Native model image generation is not adapted. Raw failure samples are disabled for image requests; images and Base64 are excluded from feedback logs.",
      "imagesNo": "Not declared",
      "imagesShort": "Text and standard image attachments (up to 5 per request, 2 MiB each)",
      "imagesYes": "Images",
      "inspect": "Check CLI executable",
      "inspectBusy": "Checking…",
      "installationGuide": "Official installation guide",
      "installing": "Installing the official CLI…",
      "intro": "Use your official CLI credits for models selected in DSH. Models and credit multipliers refresh automatically; DSH executes tools.",
      "lastCall": "Last: {model} · {time} · {input} input (including cache) / {output} output tokens for this call",
      "lastFailed": "Last request failed: {code}",
      "lastUsed": "Last used {time}",
      "logConsoleEmpty": "No logs recorded in this process yet.",
      "logConsoleTitle": "Log console",
      "loginHelp": "Paste into PowerShell (Terminal on macOS/Linux), complete official China-region sign-in, then refresh models. For a 401 error, run /login inside the CLI to sign in again.",
      "loginMissing": "Set up the CLI first to obtain its sign-in command.",
      "loginTitle": "Sign in or switch account",
      "logLevel": "Log level",
      "logLevelDebug": "Debug",
      "logLevelError": "Failures only",
      "logLevelInfo": "All calls",
      "logLevelNote": "The level only changes how much diagnostics get written: failures records failed calls only, all calls records every call, and debug currently matches all calls (reserved for finer diagnostics). It never changes the request payload or the model output.",
      "logsExported": "Log download prepared. Check that the file was saved and review it before sharing.",
      "logsFailed": "Log operation failed. Try again.",
      "logsHelp": "Report issues with the JSON log, error screenshot and reproduction steps. If basic logs are insufficient, enable one-time detailed capture and reproduce. Clearing removes local records and disables capture; downloaded files must be deleted separately.",
      "logsNote": "Basic logs stay on this computer across restarts, bounded to 100 calls and 2 MiB. They include versions, models, timing, usage and structural summaries, without request/reply bodies, login credentials or configuration paths. Nothing is uploaded automatically.",
      "logsStatus": "{entries} records · {failures} failures · {samples} detailed samples",
      "logsStorageError": "Local log storage failed ({code}). Available in-memory records can still be exported but may be lost after restart.",
      "logsTitle": "Diagnostic logs and feedback",
      "maxConcurrency": "Max concurrent calls",
      "maxConcurrencyNote": "Throttling applies only to the layer that starts CLI calls for this plugin: once the limit is reached, new requests wait instead of hitting the official service all at once, which avoids 429 storms. 0 keeps the previous unbounded behaviour. The value is stored in the DSH configuration.",
      "maxConcurrencyToggle": "0 means unlimited; new requests queue once the limit is reached",
      "metricEntries": "Records",
      "metricFailures": "Failures",
      "metricmodels": "Models in catalog",
      "metricSamples": "Detailed samples",
      "metricSamplesRedacted": "Redacted samples",
      "metricusage": "Calls this process",
      "model": "Default model ID (optional)",
      "modelDisabled": "Disabled",
      "modelEnable": "Enabled",
      "modelEnabled": "Enabled",
      "modelFallbackNotice": "The requested model was unavailable, so the default model was used: requested {requested} → used {used}. A session already sitting on a disabled model still has to pick another model.",
      "modelName": "Model / ID",
      "modelNote": "The DSH conversation model takes priority. This is a fallback; unlisted model IDs can also be entered.",
      "modelPlaceholder": "Follow CLI default, or choose a discovered model",
      "models": "Model catalog",
      "modelsEnabledChip": "{total} models · {enabled} enabled",
      "modelsSelectionStatus": "{total} models · {selected} selected · {hidden} disabled",
      "modelsTabAll": "All {count}",
      "modelState": "Status",
      "modelsUpdatedAt": "updated {time}",
      "modelVisibilityFailed": "Failed to save the enabled state. Try again.",
      "modelVisibilityLast": "Keep at least one model enabled; enable another model first.",
      "multiplier": "Credit multiplier",
      "nativeDetail": "Native result facts: structured_output present {present} · type {type} · terminal type=result {valid} · subtype class {subtype}.",
      "navaccounts": "Accounts",
      "navconnection": "Connection",
      "navdiagnostics": "Diagnostics",
      "navlogs": "Logs",
      "navmodels": "Models",
      "navusage": "Token usage",
      "networkFacts": "Network: proxy {proxy} · custom CA {ca} · Node {node}",
      "networkHint": "These are the values the running process actually has; the plugin neither stores nor changes them. The proxy comes from HTTPS_PROXY (or https_proxy / HTTP_PROXY / ALL_PROXY); from Node 24 on, built-in fetch also needs NODE_USE_ENV_PROXY=1 to use it, otherwise the value is present but requests still go direct. The custom CA comes from NODE_EXTRA_CA_CERTS and must point at a PEM file set before DSH starts. \"unknown\" means nothing is configured and requests go direct -- a common reason calls fail behind a corporate proxy or a TLS-inspecting gateway.",
      "noEffort": "Model default",
      "noMatches": "No matching models.",
      "noNormalization": "None",
      "notChecked": "Waiting for CLI executable check",
      "noticeDetail": "Fixed notice class {kind} · source {source}; unknown does not establish a root cause.",
      "noUsage": "No DSH model request yet. The plugin does not send test prompts automatically.",
      "openHome": "Open CodeBuddy usage page",
      "openPage": "Open CodeBuddy settings",
      "pageEntryHint": "Settings now have a dedicated CodeBuddy page in the left sidebar.",
      "pageSections": "Settings sections",
      "parseAmbiguous": "Multiple ambiguous results",
      "parseArguments": "Invalid tool arguments",
      "parseCalls": "toolCalls is not an array",
      "parseEmpty": "Empty result",
      "parseEnvelope": "Invalid root structure",
      "parseIncomplete": "Unclosed JSON, possibly truncated",
      "parsePlainText": "Plain-text reply (no tools executed)",
      "parseSyntax": "Invalid JSON syntax",
      "parseText": "Missing or invalid text",
      "parseUnknownTool": "Undeclared tool",
      "parseValid": "Valid protocol",
      "perModelEmpty": "No calls recorded in this process yet.",
      "perModelTitle": "Per-model usage",
      "preflightFailed": "Pre-save check failed: {item} ({code}). Fix it and save again.",
      "previewDetailed": "Preview detailed logs",
      "quickSetup": "Automatic CLI setup",
      "quotaAuthorize": "Authorise quota access",
      "quotaAuthorizeHint": "Open the generated link in your browser and confirm; then come back and press \"I have authorised\".",
      "quotaCompleteAuth": "I have authorised",
      "quotaDisconnect": "Disconnect",
      "quotaDisconnected": "Authorisation removed and the stored credential deleted.",
      "quotaEmpty": "This account has no usable packages.",
      "quotaExpire": "Expires {time}",
      "quotaFailed": "Reading quota failed. Retry or check the official site.",
      "quotaLoading": "Reading credits…",
      "quotaNotAuthorized": "Quota access is not authorised. Credits belong to the official account: authorise to read them here, or check the official site.",
      "quotaPackages": "Package breakdown ({count} merged groups)",
      "quotaRefresh": "Refresh quota",
      "quotaRefreshAllNote": "Refreshes every account: the default sign-in row and each signed-in account is read once.",
      "quotaRefreshedAt": "Refreshed at {time}.",
      "quotaRefreshing": "Refreshing…",
      "quotaRemain": "Credits remaining",
      "quotaSourceCli": "From this account's CLI sign-in",
      "quotaSourceDevice": "From browser authorisation",
      "quotaTotal": "Total credits",
      "quotaUnavailable": "Quota is temporarily unavailable. Retry later or check the official site.",
      "quotaUnit": "credits",
      "quotaUsed": "Credits used",
      "recentCallsTitle": "Recent calls",
      "recentFailures": "Recent failures (up to 5, cleared on restart)",
      "refreshing": "Discovering models…",
      "refreshModels": "Refresh models and rates",
      "requestSize": "Last request: {messages} messages · {tools} tools; envelope text {total} bytes (system {system} / history {history} / tools {schemas}). Bytes are not tokens; CLI internal overhead is excluded.",
      "requestSizeExtra": "Other sizes: response schema {schema} / envelope overhead {overhead} / encoded CLI input {input} bytes. JSONL escaping and native image blocks count toward CLI input, not envelope text.",
      "requestTime": "Last call took {seconds} seconds. Complete JSON responses do not expose model decoding speed.",
      "responseDetail": "Result: {reason} · type {type} · {bytes} bytes · normalization {normalized}. Basic diagnostics contain no reply content.",
      "rewriteAudit": "Identity coverage: {hits} rewritten in this request; {residual} identity text(s) still uncovered within the plugin-visible scope (legitimate runtime paths are not counted).",
      "rewriteClientNames": "Cover identity",
      "rewriteClientNamesNote": "When on, client self-names in the request system prompt are replaced with WorkBuddy, case-insensitively, in the system prompt only; a user message that mentions these names is left untouched. The identity the CLI writes itself (OAuth branch) is out of scope. The switch takes effect immediately and is stored in the DSH configuration.",
      "rewriteClientNamesToggle": "Apply: rewrite client self-names in the system prompt to WorkBuddy",
      "rewriteTitle": "Feature switches",
      "runtimeVersion": "Running plugin: {version} · Call timeout: {seconds} seconds",
      "save": "Save settings",
      "saved": "Settings saved",
      "saveFailed": "Could not save settings. Try again.",
      "saveFirst": "Save your pending changes before checking or configuring the CLI.",
      "saving": "Saving…",
      "searchModels": "Search model name or ID",
      "selectAll": "Select all",
      "selectColumn": "Select",
      "settings": "Connection and defaults",
      "setup": "Set up CLI",
      "setupBusy": "Setting up…",
      "setupNote": "Find an existing installation, or download and run the official installer. Supports Windows x64, macOS and Linux without entering a user-specific path.",
      "setupReady": "CLI configured, version {version}.",
      "sidebarEntry": "CodeBuddy",
      "sizeUnknown": "Not recorded",
      "sortHint": "Click to sort: ascending → descending → catalog order",
      "statAccount": "Account",
      "statCalls": "Calls",
      "statCli": "CLI",
      "statFailures": "Failures",
      "statModels": "Enabled / total",
      "streamDetail": "Image stream facts: reason {reason} · phase {phase} · frame {index}/{total} ({bytes} bytes) · init {init} / result {final} · last {last} · termination {origin} · close observed {closed} · deadline {deadline}.",
      "subtitle": "Drive DSH models with your official CodeBuddy account quota; catalog and rates sync automatically.",
      "timeoutChip": "Timeout {seconds}s",
      "timeoutDetail": "CLI process diagnostics: {seconds}s · stdout {stdout} bytes · stderr {stderr} bytes. Byte counts do not measure model generation progress.",
      "timeoutHelp": "Total deadline from CLI startup to process exit, including model processing. Complex tasks may need 300000–600000 ms (5–10 minutes). Timeouts are not retried automatically.",
      "timeoutMs": "Request timeout (ms)",
      "title": "CodeBuddy CLI (China)",
      "todayCalls": "Calls today",
      "toolCoverage": "Tool and result compatibility",
      "toolCoverageUrl": "https://github.com/liuwenjie74/dsh-codebuddy-cli/blob/main/docs/cn/TOOL_COMPATIBILITY.en.md",
      "toolNote": "Models come from the current China CLI; account permissions are enforced by the official service. This plugin sends text and standard image attachments; DSH executes tools.",
      "undoBatch": "Undo last batch",
      "unknown": "Not provided",
      "usage": "Cumulative token usage this run",
      "usageBreakdown": "Input breakdown: {uncached} uncached · {read} cache read · {write} cache write tokens",
      "usageCache": "Cache hits",
      "usageInput": "Input tokens",
      "usageNote": "Input includes uncached, cache-read and cache-write tokens, counted once. This is not the latest question length or billed credits. Resets on restart.",
      "usageOutput": "Output tokens",
      "usageTotals": "{calls} cumulative requests · {input} total input (including cache) · {read} cache hits · {output} total output tokens",
      "viewLogs": "View basic logs",
      "autoCheckin": "Daily auto check-in",
      "autoCheckinToggle": "Run daily check-in (China) or active bonus beacon (International) on UTC+8 schedule",
      "autoCheckinNote": "Off by default. China checks in at 09:00 / 21:00 UTC+8; International checks the UTC+8 heatmap at 08:00 / 12:00 / 16:00 / 20:00 and sends a single activity beacon when unlit (bonus pack granted next morning). Already-completed accounts are skipped.",
      "autoTokenKeepalive": "Scheduled token keepalive",
      "autoTokenKeepaliveToggle": "Refresh stored device-authorisation tokens daily at 22:00 UTC+8",
      "autoTokenKeepaliveNote": "Off by default. Refreshes only plugin-stored device grants without touching official CLI login files unless the plaintext CLI refresh switch below is explicitly enabled.",
      "allowCliCredentialRefresh": "Allow plaintext CLI credential refresh",
      "allowCliCredentialRefreshToggle": "Refresh and atomically write back plaintext CLI .info login files",
      "allowCliCredentialRefreshNote": "Off by default. Only touches plaintext .info files for the current region (skips encrypted desktop records), avoids active CLI calls, and uses two-phase snapshot verification before atomic write-back.",
      "checkinAll": "Check in",
      "checkinBusy": "Checking in…",
      "checkinDone": "Check-in finished: {msg}",
      "keepaliveAll": "Refresh token",
      "keepaliveBusy": "Refreshing…",
      "keepaliveDone": "Keepalive finished: {msg}"
    }

    const intlLocaleZh = {
      // 由 locales/intl.zh.json 生成，请勿手改；改词表请改该 JSON 后运行 node scripts/build-client-locales.mjs
      "title": "CodeBuddy CLI（国际版）",
      "intro": "通过官方 CodeBuddy CLI 原生 JSON Schema 输出接入国际版模型。模型目录和积分倍率自动同步；DSH 继续管理对话与工具执行。",
      "quickSetup": "CLI 自动配置",
      "setup": "一键配置 CLI",
      "setupBusy": "配置中…",
      "setupNote": "先查找本机安装；未安装时下载并运行官方安装器。支持 Windows x64、macOS 和 Linux，无需手填用户名或安装路径。",
      "detecting": "正在查找并检查 CLI…",
      "installing": "正在安装官方 CLI，请稍候…",
      "setupReady": "CLI 已配置，版本 {version}。",
      "actionFailed": "操作未完成，请检查网络后重试。",
      "installationGuide": "官方安装指南",
      "loginTitle": "首次登录或切换账号",
      "copyLogin": "复制登录命令",
      "copied": "已复制登录命令",
      "loginHelp": "在 PowerShell（macOS/Linux 使用终端）中粘贴运行，输入 /login，选择 International Site 并完成登录，然后点击“刷新模型与倍率”。若提示 401，请重新执行官方登录流程。",
      "loginMissing": "先完成 CLI 自动配置，再获取登录命令。",
      "accountsTitle": "多账号管理",
      "accountOverviewTitle": "账号概览",
      "quotaAuthForeignRegion": "注意：上游返回的是另一区域的登录页，请核对域名后再授权。",
      "accountNote": "每个账号单独登录；选中账号后，DSH 模型选择器里显示的就是该账号的模型（模型名不带账号备注）。",
      "accountValidation": "多账号要求 Windows / 官方 CLI 2.174.0 及以上（npm 版 codebuddy.cmd 或官方安装包里的 codebuddy.exe；已实测 2.174.0 / 2.177.0，更高版本带警告放行）。路径隔离和自动测试已验证；真实双账号登录、刷新与扣费归属尚待验收。",
      "accountLabel": "账号备注",
      "accountAdd": "新增账号",
      "accountUse": "使用此账号",
      "accountLegacy": "使用默认 CLI 登录",
      "accountPrepare": "生成官方登录命令",
      "accountRemove": "移出列表",
      "accountSelected": "已选中",
      "accountHasCredential": "本地凭据存在（身份、有效性及额度未核验）",
      "accountNoCredential": "尚无本地登录凭据",
      "accountPathError": "隔离目录异常，已阻止调用",
      "accountUnsupported": "当前系统未验证多账号隔离，请继续使用默认 CLI 登录。",
      "accountStoreError": "账号列表读取失败，已阻止模型调用；请保留本地数据并查看指南。",
      "accountAdded": "独立环境已创建。生成登录命令，在新的 PowerShell 窗口运行；选择 Chinese Site 并核对账号，登录后退出 CLI，再刷新模型。",
      "accountPrepared": "已生成该隔离环境的官方登录命令。请在新的 PowerShell 窗口运行，并选择 International Site。",
      "accountRemoved": "已移出列表。本地官方登录数据保留，已有会话将明确失败，不会改用其他账号。",
      "accountUsage": "本进程记录：请求 {calls} 次 · 输入 {input} / 输出 {output} Token；不代表官方扣费或余额。",
      "accountPrivacy": "插件不导入或复制日常登录凭据。新增、选择账号不会自动发送模型问题；登录命令需要手动运行。",
      "accountGuide": "查看多账号使用指南",
      "accountGuideSteps": "1. 新增独立环境；2. 生成并在新的 PowerShell 窗口运行登录命令；3. 选择 Chinese Site，核对目标身份，登录后退出；4. 选择条目并刷新模型；5. 在会话中选择该账号的模型（模型名不带账号备注）。首次逐个授权，不要复制凭据或把令牌发到反馈中。",
      "accountGuideErrors": "ACCOUNT_LOGIN_REQUIRED：完成该环境的官方登录；ACCOUNT_MODEL_REQUIRED：重新选择该账号的模型；ACCOUNT_CLI_UNVERIFIED：CLI 版本未核查；ACCOUNT_IN_USE：先切换并等待结束。401 请在对应独立环境内 /login。环境备注不代表已核验身份。",
      "accountGuideLink": "打开完整的多账号指南",
      "accountGuideUrl": "https://github.com/liuwenjie74/dsh-codebuddy-cli/blob/main/docs/intl/多账号使用指南.md",
      "accountConfirmRemove": "确认移出（保留本地登录数据）",
      "accountCancel": "取消移出",
      "accountStoreScope": "备注仅用于本机区分环境，不代表已核验的官方账号身份。",
      "settings": "高级连接与默认值（可选）",
      "cliPath": "CLI 路径（留空自动检测）",
      "configDir": "配置目录（留空使用 ~/.dsh-codebuddy-cli-intl）",
      "model": "默认模型 ID（可选）",
      "modelPlaceholder": "留空跟随 CLI 默认，可从下拉候选中选择",
      "modelNote": "实际使用 DSH 会话中选择的模型；这里仅作为未指定模型时的默认值，也可填写未列出的模型 ID。",
      "effort": "默认推理强度",
      "followDefault": "跟随模型默认值",
      "timeoutMs": "单次调用超时（毫秒）",
      "save": "保存设置",
      "saving": "保存中…",
      "saved": "设置已保存",
      "saveFailed": "保存失败，请重试",
      "saveFirst": "有未保存的设置，请先保存后再执行检测或配置。",
      "inspect": "检查 CLI 程序",
      "inspectBusy": "检查中…",
      "notChecked": "正在等待 CLI 程序检查",
      "cliAvailable": "CLI 程序可启动：{version}",
      "cliUnavailable": "CLI 程序检查失败（{code}），请点击“一键配置 CLI”或检查路径。",
      "cliCheckNote": "此检查仅运行版本命令，不验证账号登录、网络连通性或模型响应。模型目录可刷新也不等于模型调用成功。",
      "timeoutHelp": "这是启动 CLI 到整次调用结束的总时限，包含模型处理和 CLI 退出。复杂任务可设为 300000–600000（5–10 分钟）；超时后不会自动重试。",
      "runtimeVersion": "插件运行版本：{version} · 当前调用超时：{seconds} 秒",
      "timeoutDetail": "CLI 进程诊断：耗时 {seconds} 秒 · 标准输出 {stdout} 字节 · 诊断输出 {stderr} 字节；这些大小不代表模型生成进度。",
      "streamDetail": "流诊断：{reason} · 阶段 {phase} · 解析 {stage} · 帧 {index}/{count}（{bytes} 字节）· init/result {inits}/{results} · 最近帧 {frame} · 终止 {terminator} · close 已观察 {closed} · 到达时限 {deadline}。",
      "responseDetail": "结果诊断：{mode} · {reason} · 最终记录 {finals} 条 · 返回类型 {type} · 兼容处理 {normalized}。{facts} {notice}基础诊断不含正文。",
      "nativeOutput": "原生 JSON Schema",
      "parseValid": "结构有效",
      "parsePlainText": "纯文本答复（未执行工具）",
      "parseEmpty": "模型结果为空",
      "parseIncomplete": "JSON 未闭合，可能被截断",
      "parseSyntax": "CLI 输出不是有效 JSON",
      "parseAmbiguous": "多个协议片段存在歧义",
      "parseFinalCount": "最终结果记录不是唯一一条",
      "parseEnvelope": "根结构不符合协议",
      "parseText": "text 字段缺失或类型错误",
      "parseCalls": "toolCalls 结构错误",
      "parseUnknownTool": "工具未声明",
      "parseArguments": "工具参数必须是对象",
      "parseOutputMissing": "缺少 structured_output",
      "noNormalization": "无需处理",
      "parseNativeResult": "收到原生最终结果",
      "parseNotice": "CLI 错误提示",
      "parseOutputInvalid": "CLI 输出无有效结果",
      "parseDeadline": "调用到达总时限",
      "parseStreamError": "CLI 返回错误帧",
      "parsePermissionFrame": "CLI 请求交互权限",
      "parseResultBeforeInit": "最终结果早于初始化帧",
      "parsePostResult": "最终结果后出现额外帧",
      "structuredFacts": "structured_output：{present}（{type}）；result 类型{resultType}；终态 subtype：{subtype}。",
      "noticeDetail": "提示分类：{classification} · 来源：{source}。",
      "streamReasonNone": "无流错误",
      "streamReasonJson": "JSON 解析失败",
      "streamReasonShape": "帧结构无效",
      "streamReasonDuplicateInit": "重复初始化帧",
      "streamReasonPostResult": "最终结果后序列冲突",
      "streamReasonResultBeforeInit": "结果早于初始化",
      "streamReasonMultiple": "出现多个最终结果",
      "streamReasonError": "收到错误帧",
      "streamReasonPermission": "收到权限控制帧",
      "streamReasonMissingInit": "关闭前缺少初始化帧",
      "streamReasonMissingResult": "关闭前缺少最终结果",
      "streamReasonExit": "CLI 非零退出",
      "streamReasonDeadline": "达到总时限",
      "streamReasonCancelled": "请求被取消",
      "streamReasonTooLarge": "输出超出上限",
      "streamReasonSpawn": "CLI 启动失败",
      "streamPhaseAwait": "等待初始化",
      "streamPhaseInit": "已初始化",
      "streamPhaseResult": "已收到最终结果",
      "streamPhaseDrain": "终态排空",
      "streamPhaseClosed": "进程已关闭",
      "parseStageLine": "换行帧",
      "parseStageTail": "无换行尾帧",
      "parseStageNone": "无",
      "frameNone": "无",
      "frameInit": "初始化",
      "frameSystem": "系统帧",
      "frameAssistant": "assistant 帧",
      "frameResult": "result 帧",
      "frameError": "error 帧",
      "frameControl": "权限控制帧",
      "frameOther": "其他帧",
      "frameMalformed": "无法解析帧",
      "terminatorNone": "尚未终止",
      "terminatorAdapter": "解析器主动停止",
      "terminatorDrain": "终态排空停止",
      "terminatorDeadline": "总时限停止",
      "terminatorCancel": "外部取消",
      "terminatorChildError": "子进程错误",
      "terminatorClose": "自然关闭",
      "terminatorSpawn": "启动失败",
      "noticeNone": "无匹配提示",
      "noticeUnknown": "未分类提示",
      "noticeContext": "上下文限制",
      "noticeBalance": "余额不足",
      "noticeAuth": "鉴权",
      "noticeAccess": "服务拒绝访问",
      "noticeRate": "频率限制",
      "noticeLocalPermission": "本地权限",
      "noticeNetwork": "网络连接",
      "noticeSourceStderr": "标准错误",
      "noticeSourceStdout": "标准输出",
      "noticeSourceAssistant": "assistant 文本帧",
      "noticeSourceError": "error 帧",
      "noticeSourceResult": "result 帧",
      "noticeSourceMixed": "多个输出通道",
      "factReported": "已返回",
      "factMissing": "缺失",
      "factObject": "对象",
      "factArray": "数组",
      "factString": "字符串",
      "factNumber": "数字",
      "factBoolean": "布尔值",
      "factNull": "null",
      "factUndefined": "undefined",
      "factYes": "有效",
      "factNo": "无效",
      "subtypeSuccess": "成功",
      "subtypeError": "错误",
      "subtypeOther": "其他",
      "subtypeMissing": "未提供",
      "recentFailures": "最近失败记录（最多 5 条，重启后清空）",
      "diagnosticId": "诊断 ID：{id}（可在导出日志中查找）",
      "guideTitle": "故障处理与使用指南",
      "guideIntro": "格式错误不一定能自动恢复。先确认已执行的操作，再按对应情况处理；不要盲目重复写入或运行命令。",
      "guideMultipleTitle": "最终结果记录不唯一",
      "guideMultiple": "原生输出模式要求 CLI 只返回一条最终结果记录；缺少或出现多条记录（即使内容看起来相同）都会失败。插件不会挑选最后一条、合并结果或执行部分工具。先查看 DSH 已完成的工具和文件状态，再发起简短的新请求。",
      "guideIncompleteTitle": "CLI 没有返回有效结构结果",
      "guideIncomplete": "插件只接受官方 structured_output 中的 JSON 对象，不会从普通文本提取协议字段、补齐缺失内容或自动请求模型修复。缩小任务并重试前，先核对已完成的工具操作。",
      "guideProgressTitle": "工具做完了，最后仍提示失败",
      "guideProgress": "最终回复失败不代表之前的工具没有执行。先核对工具记录、文件内容和退出码，再决定是否重试；只让模型汇总已有结果时，明确说明不要重复已完成操作。",
      "guideLiteralTitle": "路径、代码或反斜杠显示不符",
      "guideLiteral": "插件按原样传递结构结果中的 text，不会再解析或反转义其中的内容。若文字本身有差异，只要求重写相关的小片段并逐字符核对。",
      "guideAccessTitle": "CLI、登录、超时或文件权限",
      "guideAccess": "版本检查只说明程序能启动。401 请走官方登录；模型权限或额度由官方判断。超时可拆分任务并按需增加时限。文件或 ACL 错误先确认 DSH 工作区与路径，不要为修复格式错误更改权限。",
      "guideRequestSizeTitle": "本机请求尺寸上限",
      "guideRequestSize": "REQUEST_TOO_LARGE 表示本机大小检查拒绝了本轮请求：国际版文字请求封装上限为 12 MiB，图片模式最终 stream-json CLI 输入上限为 24 MiB，均按 UTF-8 字节计算，不是 Token 数。图片卸载不会压缩文字历史，JSONL 编码和图片块会计入最终图片输入。配置页和普通日志会显示已测得的阶段、实际字节、上限及尺寸分解；旧日志没有保存的尺寸无法补算。插件不会自动删除历史、丢弃图片、截断 Schema、切换模型或重试。",
      "guideLimitsTitle": "上下文上限或余额错误（400 / 402）",
      "guideLimits": "400 表示服务明确报告输入超过上下文上限，缩短历史或新建会话后再试；402 表示官方服务报告余额不足，请查看官方用量页面。插件不会自动换模型、换账号或重试。",
      "guideNetworkTitle": "CLI_NETWORK_ERROR：连接中断或 TLS 错误",
      "guideNetwork": "该分类表示官方 CLI 报告连接被重置或 TLS 握手未完成。请检查当前网络到官方国际服务的连通性及代理设置。插件只识别错误文本，不能修复网络或确认具体原因，也不会自动重试；核对已完成的 DSH 操作后，再自行决定是否重试。",
      "guideLogsTitle": "如何保留有效反馈",
      "guideLogs": "导出普通日志并记录诊断 ID、时间和复现步骤。需要原文时先开启下一次失败采集，分享前检查内容。成功调用与主动停止任务不消耗采集机会；取消采集、清空日志或重启会关闭开关。",
      "logsTitle": "诊断日志与问题反馈",
      "logsNote": "普通日志自动保存在本机，最多保留 100 次调用、总计 2 MiB，重启后仍可查看。包含版本、模型、耗时、用量和结构统计；不含请求正文、回复正文、登录凭据或配置路径。不会自动上传。",
      "logsStatus": "已保存 {entries} 条 · 失败 {failures} 条 · 详细样本 {samples} 份",
      "viewLogs": "查看普通日志",
      "hideLogs": "收起日志",
      "exportLogs": "导出普通日志",
      "captureNotice": "为定位格式错误，可手动采集下一次失败的原始模型回复（不采集请求、CLI 标准错误或登录文件）。回复可能包含聊天、代码、文件内容和工具参数，并可能复述敏感信息。最多采集 256 KiB，超出时保留首尾并标明截断。",
      "captureConsent": "我了解详细样本可能包含私人内容，会在分享前检查并删除敏感信息。",
      "armCapture": "采集下一次失败回复",
      "cancelCapture": "取消详细采集",
      "captureArmed": "已开启：等待下一次非主动取消的失败，随后自动关闭。重启也会关闭；成功调用和主动停止任务不消耗采集机会。无法补录开启前的失败。",
      "previewDetailed": "预览详细日志",
      "exportDetailed": "导出详细日志（含原始回复）",
      "clearLogs": "清空日志",
      "confirmClear": "确认清空全部日志和详细样本",
      "cancelClear": "取消",
      "logsExported": "已生成日志下载，请确认文件已保存；分享前先检查内容。",
      "logsFailed": "日志操作失败，请重试。",
      "logsStorageError": "本机日志读写失败（{code}）；当前可见记录仍可导出，但重启后可能丢失。",
      "logsHelp": "反馈时附上日志 JSON、报错截图和复现步骤。普通日志不够定位时，再开启一次详细采集并复现。清空会删除本机记录并关闭详细采集，已下载的文件需要自行删除。",
      "models": "模型目录",
      "refreshModels": "刷新模型与倍率",
      "refreshing": "正在检测模型…",
      "catalogReady": "检测到 {count} 个模型 · 更新于 {time}",
      "catalogEmpty": "尚未获取模型目录，请完成 CLI 配置和登录后刷新。",
      "catalogStale": "刷新未成功，暂时显示上次目录。{message}",
      "imageInput": "图片输入",
      "imagesSupported": "官方目录声明支持",
      "imagesUnknown": "目录未声明",
      "imageNote": "仅对官方动态模型目录明确标记 supportsImages 的模型开放图片。插件通过 DSH 附件服务读取图片，并以官方 CLI 的原生 stream-json 图片块发送；模型未声明支持时会明确报错，不会静默丢图。每次请求历史最多 5 张、单张最大 2 MiB、总图片 Base64 最大 8 MiB，最长边按需缩至 1920 像素。历史中的内联图片 data URI 总长超过 32,768 字符时会在发起模型请求前拒绝；图片内容不会写入诊断日志。",
      "creditsNote": "倍率来自官方目录，实际扣费以官方为准。",
      "searchModels": "搜索模型名称或 ID",
      "modelName": "模型 / ID",
      "multiplier": "积分倍率",
      "efforts": "推理强度",
      "context": "上下文",
      "unknown": "官方未提供",
      "noEffort": "模型默认",
      "noMatches": "没有匹配的模型。",
      "usage": "本次运行的累计 Token 用量",
      "usageNote": "累计输入包含未缓存、缓存命中和缓存写入，每项只计一次；不是单条提问的字数，也不代表积分扣费。适配器每次启动一个 CLI 进程，但 CLI 内部结构化处理可能包含多轮，实际用量以官方明细为准。重启后清零。",
      "usageTotals": "累计请求 {calls} 次 · 累计输入（含缓存）{input} · 累计输出 {output} Token",
      "outcomeTotals": "本地事件统计（重启后清零）：取消 {cancelled} 次 · DSH 图片卸载请求 {offloads} 次（建议卸载 {images} 张） · 请求历史中已卸载图片 {history} 张。卸载请求不代表 DSH 已执行。",
      "usageBreakdown": "输入明细：未缓存 {uncached} · 缓存命中 {read} · 缓存写入 {write} Token",
      "requestSize": "最近请求封装：{messages} 条历史消息 · {tools} 个工具；提示封装 {total} UTF-8 字节（系统 {system} / 历史 {history} / 工具 {schemas}）。这表示本机组装的请求大小，不等于 Token 数或已发送内容。",
      "sizeUnknown": "未记录",
      "budgetEnvelope": "文字封装",
      "budgetInput": "CLI 编码输入",
      "budgetDetail": "本机大小检查：{stage} · {actual} / {limit} 字节；请求在启动 CLI 模型调用前被拒绝，未提交给模型。",
      "requestSizeExtra": "其他尺寸：响应 Schema {schema} / 封装固定指令与结构 {overhead} / 计算后的 CLI 输入 {input} 字节。图片模式包含最终 JSONL 编码和原生图片块；本机拒绝时该值不是已发送证明。",
      "requestTime": "最近调用总耗时 {seconds} 秒。当前为完整 JSON 返回，不提供模型生成速度。",
      "noUsage": "尚未通过 DSH 发起模型请求。插件不会自动发送测试问题。",
      "lastCall": "最近一次：{model} · {time} · 单次输入（含缓存）{input} / 输出 {output} Token",
      "lastFailed": "最近一次请求失败：{code}",
      "active": "当前正在处理 {count} 个请求",
      "openHome": "打开 CodeBuddy 官网查看用量",
      "toolNote": "模型目录和图片能力以当前国际 CLI 返回结果为准，账号权限由官方判断。图片请求经 CLI 原生图片输入；CLI 业务工具仍关闭，DSH 负责执行工具。",
      "accountAddTitle": "新增账号",
      "accountAutoLabel": "账号 {count}",
      "accountCreditsLeft": "剩余 {credits} 分",
      "accountCreditsUnknown": "额度未读取",
      "accountDefaultAccount": "本区默认账号",
      "accountDefaultEmpty": "国际版不显示默认账号：请新增一个账号，在新的 PowerShell 窗口中完成一次登录后再使用；国际版不会借用另一区域的登录记录。",
      "accountDefaultLogin": "默认 CLI 登录（只读）",
      "accountExhausted": "额度不足，暂停至 {time}",
      "accountIdentity": "已登录：{nickname} · {uid} · 凭据有效至 {time}",
      "accountIdentityENCRYPTED": "登录记录是加密格式（由桌面应用写入），这里读不到；请用 npm 版 CLI 登录该账号。",
      "accountIdentityEXPIRED": "登录凭据已过期，请重新登录后再读取额度。",
      "accountIdentityFOREIGN_REGION": "本机可读的登录记录属于另一个区域（{domain} 的 {nickname}），不会用于读取本区额度；请在本环境登录本区账号，或点「设备授权」。",
      "accountIdentityMISSING": "该账号还没有登录记录，请先运行登录命令。",
      "accountIdentityUNREADABLE": "登录记录读取失败，无法确认账号身份。",
      "copyAuthLink": "复制授权链接",
      "accountLoginCancel": "取消",
      "accountLoginDone": "我已登录，刷新",
      "accountLoginGenerating": "正在生成官方登录命令…",
      "accountLoginNotYet": "还没检测到登录记录，完成官方登录后再点一次。",
      "accountLoginStart": "官方登录命令已生成。在 PowerShell 里运行它完成登录，回来点「我已登录，刷新」。",
      "accountNativeNotice": "当前使用的是原生 codebuddy.exe。多账号隔离依赖它读取隔离目录；若该账号登录后仍显示没有本地登录凭据，请改用 npm 版 codebuddy.cmd。",
      "accountOff": "关",
      "accountOn": "开",
      "accountOtherTitle": "其他账号",
      "accountPickProgram": "重新选择程序",
      "accountReadOnly": "只读",
      "accountRotation": "额度耗尽时自动换号",
      "accountRotationNote": "账号属于模型 id、不进入显示名，逐次轮流调用会重写会话前缀、增加开销，因此这里不做轮流。开启后仅当所选账号返回额度不足，下一次请求才换到有登录凭据的其他账号，并记录一次切换；关闭时任何失败都原样报错。",
      "accountRotationToggle": "只在额度不足时让位",
      "accountStatusSignedIn": "已登录",
      "accountSummaryCurrent": "当前账号",
      "accountSummaryRotation": "自动换号",
      "accountSummarySigned": "已登录账号",
      "batchSaved": "已保存 {count} 个模型的启用状态。",
      "captureRequestSamples": "采集脱敏请求样本",
      "captureRequestSamplesNote": "开启后，每次请求把「系统提示范围」另存为一份脱敏样本，写入诊断目录下的 requests 子目录：只含系统提示与 system 消息，不含用户、助手与工具消息。密钥、Bearer、data URI、长串、邮箱、长数字与 UUID 会先行遮盖，单份上限 64 KiB，只保留最近 20 份。CLI 自己在 OAuth 分支写入的身份段不经过插件，任何样本都抓不到。切换即时生效，保存在 DSH 配置里。",
      "captureRequestSamplesToggle": "启用：把每次请求的系统提示范围（已脱敏、已截断）另存到诊断目录，默认关闭",
      "clearSelection": "清空",
      "cliExecutable": "可执行文件",
      "cliVersionLabel": "版本",
      "colCalls": "调用",
      "controlSummary": "控制事件另计：取消 {cancelled} 次 · 图片卸载 {offloads} 次。",
      "disableSelected": "停用选中",
      "enabled": "启用",
      "enableSelected": "启用选中",
      "exportCsv": "导出 CSV",
      "filterModels": "筛选",
      "guideCliError": "CLI_REQUEST_FAILED 表示 CLI 返回错误，但错误文本不足以安全归入已知类别。保留诊断 ID 和普通日志，记录 CLI/插件版本、模型及是否带图片；可用短文本请求判断是否只在图片请求中出现。不要把未知错误直接当作余额或网络问题，也不要重复已执行的 DSH 工具。",
      "guideCliErrorTitle": "CLI 请求失败但原因未识别",
      "guideLocalSize": "REQUEST_TOO_LARGE 表示本次请求在启动模型调用前被本地大小检查拒绝：文字请求封装上限 12 MiB，最终 CLI 输入上限 20 MiB，均按 UTF-8 字节计算，不是 Token 数。图片卸载只移除图片内容，不压缩文字历史；JSONL 转义还会增加最终输入大小。配置页和普通日志可查看检查阶段与尺寸分解；旧日志缺失的尺寸无法补算。请保留原对话，在新对话中提供必要摘要或减少本轮需要的工具范围；插件不自动删历史、丢图、截断工具定义或重试。",
      "guideLocalSizeTitle": "本地请求大小上限",
      "guideSize": "CLI_CONTEXT_TOO_LARGE（400）表示官方服务明确拒绝了超上下文请求；插件不会截断或删除 DSH 历史。累计超过 32,768 个字符的标准内联图片 data URI 会在提交模型请求前被 IMAGE_DATA_URI_TOO_LARGE 拦截；请改用 DSH 图片附件，或新建对话并附必要摘要。字符阈值不是 Token 估算。CLI_INSUFFICIENT_BALANCE（402）仅表示 CLI 明确返回余额不足提示，请在官方套餐与用量页核对。",
      "guideSizeTitle": "长历史、图片文本过大或额度不足",
      "hintShow": "显示说明",
      "imageBase64": "图片自动转 Base64",
      "imageBase64Note": "开启后图片附件会内联进请求（Base64）。关闭后不再内联，带图请求会以「图片需走离线通道」提示，避免把图片塞进过大的请求体。切换即时生效，保存在 DSH 配置里。",
      "imageBase64Toggle": "关闭后带图请求改走离线通道提示",
      "images": "图片输入",
      "imagesHelp": "支持用户图片和 DSH 工具返回的标准图片附件，包括桌面、窗口、区域、浏览器截图。两类图片共用 5 张请求预算，每张转换后 ≤2 MiB、最长边 ≤1920；历史超预算由 DSH 记录卸载。工具只返回路径、网址或原始 Base64 时不会自动读图。累计超过 32,768 个字符的标准内联图片 data URI 会在提交模型请求前拦截，建议改用 DSH 图片附件。模型原生图片生成未适配。含图片请求不采集失败原文；图片、Base64 不进入反馈日志。",
      "imagesNo": "未声明",
      "imagesShort": "支持文本与标准图片附件（单次最多 5 张，单张 ≤ 2 MiB）",
      "imagesYes": "图片",
      "lastUsed": "最近使用 {time}",
      "logConsoleEmpty": "本进程还没有可显示的日志。",
      "logConsoleTitle": "日志控制台",
      "logLevel": "日志级别",
      "logLevelDebug": "调试",
      "logLevelError": "仅失败",
      "logLevelInfo": "全部调用",
      "logLevelNote": "日志级别只影响诊断日志的写入量：仅失败只记失败请求，全部调用记录每次调用，调试目前与全部调用相同（保留给更细的诊断）。它不改变请求内容，也不影响模型输出。",
      "maxConcurrency": "最大并发调用",
      "maxConcurrencyNote": "限流只作用于本插件发起 CLI 调用的那一层：达到上限后新请求排队等待，而不是同时压向官方服务，用来避免 429 雪崩。0 为不限制，保持原有行为。该值保存在 DSH 配置里。",
      "maxConcurrencyToggle": "0 表示不限制；达到上限后新请求排队等待",
      "metricEntries": "已保存",
      "metricFailures": "失败",
      "metricmodels": "目录模型数",
      "metricSamples": "详细样本",
      "metricSamplesRedacted": "脱敏样本",
      "metricusage": "本进程调用次数",
      "modelDisabled": "已停用",
      "modelEnable": "启用",
      "modelEnabled": "已启用",
      "modelFallbackNotice": "本次请求的模型不可用，已自动改用默认模型：请求 {requested} → 实际 {used}。停用某模型后，正停在该模型上的既有会话仍需重新选择模型。",
      "modelsEnabledChip": "{total} 个 · 已启用 {enabled}",
      "modelsSelectionStatus": "共 {total} 个模型 · 已选 {selected} 个 · 已停用 {hidden} 个",
      "modelsTabAll": "全部 {count}",
      "modelState": "状态",
      "modelsUpdatedAt": "更新于 {time}",
      "modelVisibilityFailed": "启用状态保存失败，请重试。",
      "modelVisibilityLast": "至少保留一个可用模型；请先启用其他模型。",
      "nativeDetail": "原生结果事实：structured_output 存在 {present} · 类型 {type} · 终态 type=result {valid} · subtype 类别 {subtype}。",
      "navaccounts": "账号管理",
      "navconnection": "连接配置",
      "navdiagnostics": "诊断日志",
      "navlogs": "日志查看",
      "navmodels": "模型目录",
      "navusage": "Token 用量",
      "networkFacts": "网络：代理 {proxy} · 自定义 CA {ca} · Node {node}",
      "networkHint": "这里只显示当前进程实际生效的值，插件不保存也不修改它们。代理来自 HTTPS_PROXY（或 https_proxy / HTTP_PROXY / ALL_PROXY）；Node 24 起内置 fetch 还需 NODE_USE_ENV_PROXY=1 才会走代理，否则该值存在但请求仍直连。自定义 CA 来自 NODE_EXTRA_CA_CERTS，必须指向 PEM 文件且在启动 DSH 之前设置。显示「未知」表示没有配置，出站请求将直连——这是企业网或抓包环境下请求失败的常见原因。",
      "openPage": "打开 CodeBuddy 配置",
      "pageEntryHint": "配置已移至左侧栏的 CodeBuddy 独立页面。",
      "pageSections": "配置板块",
      "perModelEmpty": "本进程还没有调用记录。",
      "perModelTitle": "按模型消耗统计",
      "preflightFailed": "保存前检查未通过：{item}（{code}）。请修正后再保存。",
      "quotaAuthorize": "授权读取额度",
      "quotaAuthorizeHint": "已生成授权链接，请复制到浏览器打开并确认授权；完成后回来点「我已完成授权」。",
      "quotaCompleteAuth": "我已完成授权",
      "quotaDisconnect": "断开授权",
      "quotaDisconnected": "已断开授权，本地保存的凭据已删除。",
      "quotaEmpty": "账号下没有可用的资源包。",
      "quotaExpire": "到期 {time}",
      "quotaFailed": "额度读取失败，请重试或去官网查看。",
      "quotaLoading": "正在读取额度…",
      "quotaNotAuthorized": "尚未授权读取额度。额度由官方账号决定，可授权后直接读取，或去官网查看。",
      "quotaPackages": "资源包明细（同名已合并，共 {count} 类）",
      "quotaRefresh": "刷新额度",
      "quotaRefreshAllNote": "刷新所有账号的额度：默认登录行与每个已登录账号各读一次。",
      "quotaRefreshedAt": "已于 {time} 刷新。",
      "quotaRefreshing": "刷新中…",
      "quotaRemain": "剩余积分",
      "quotaSourceCli": "来自该账号的 CLI 登录",
      "quotaSourceDevice": "来自浏览器授权",
      "quotaTotal": "总额度",
      "quotaUnavailable": "额度暂时读取不到，请稍后重试或去官网查看。",
      "quotaUnit": "分",
      "quotaUsed": "已用积分",
      "recentCallsTitle": "最近调用",
      "rewriteAudit": "标识覆盖：本次改写 {hits} 处；插件可见范围内仍有 {residual} 处身份文本未被覆盖（合法运行时路径不计）。",
      "rewriteClientNames": "覆盖标识",
      "rewriteClientNamesNote": "开启后，请求体系统提示里的客户端自称统一替换为 WorkBuddy，大小写不敏感，只作用于系统提示范围；用户消息即使提到这些名字也不会被改动。CLI 自己写入身份段（OAuth 分支）不在覆盖范围内。切换即时生效，保存在 DSH 配置里，重启后仍然有效。",
      "rewriteClientNamesToggle": "启用：把系统提示里的客户端自称统一改为 WorkBuddy",
      "rewriteTitle": "功能开关",
      "selectAll": "全选",
      "selectColumn": "选择",
      "sidebarEntry": "CodeBuddy",
      "sortHint": "点击排序：升序 → 降序 → 目录原序",
      "statAccount": "当前账号",
      "statCalls": "本进程调用",
      "statCli": "CLI 状态",
      "statFailures": "失败",
      "statModels": "已启用 / 总数",
      "subtitle": "用官方 CodeBuddy 账号额度驱动 DSH 模型，目录与倍率自动同步。",
      "timeoutChip": "超时 {seconds}s",
      "todayCalls": "今日调用",
      "toolCoverage": "查看工具与返回内容适配范围",
      "toolCoverageUrl": "https://github.com/liuwenjie74/dsh-codebuddy-cli/blob/main/docs/cn/工具适配范围.md",
      "undoBatch": "撤销上次批量",
      "usageCache": "缓存命中",
      "usageInput": "输入 tokens",
      "usageOutput": "输出 tokens",
      "autoCheckin": "每日自动签到",
      "autoCheckinToggle": "开启后按东八区窗口自动签到（国内版每日签到 / 国际版活跃信标）",
      "autoCheckinNote": "默认关闭。国内版在东八区 9:00 / 21:00 检查并领取每日签到；国际版在 8:00 / 12:00 / 16:00 / 20:00 检查热力图并在未点亮时上报单次活跃信标（次日凌晨自动发放奖励积分）。当日已完成会自动跳过。",
      "autoTokenKeepalive": "Token 定时续期",
      "autoTokenKeepaliveToggle": "每日东八区 22:00 自动续期已保存的设备授权令牌",
      "autoTokenKeepaliveNote": "默认关闭。默认仅续期插件自身保存的设备授权令牌，不会改动官方 CLI 的磁盘登录文件；若需同时续期官方 CLI 明文凭据，请显式开启下方开关。",
      "allowCliCredentialRefresh": "允许续期并写回明文 CLI 凭据",
      "allowCliCredentialRefreshToggle": "续期时同步刷新并原子写回明文 CLI .info 登录文件",
      "allowCliCredentialRefreshNote": "默认关闭。开启后仅作用于明文 .info 文件，自动跳过桌面端加密凭据（$wbEncrypted）与跨区文件，且在无活跃 CLI 调用时采用两段式快照校验原子写回，避免与官方 CLI 冲突。",
      "checkinAll": "一键签到",
      "checkinBusy": "签到中…",
      "checkinDone": "签到完成：{msg}",
      "keepaliveAll": "续期令牌",
      "keepaliveBusy": "续期中…",
      "keepaliveDone": "续期完成：{msg}"
    }
    const intlLocaleEn = {
      // 由 locales/intl.en.json 生成，请勿手改；改词表请改该 JSON 后运行 node scripts/build-client-locales.mjs
      "title": "CodeBuddy CLI (International)",
      "intro": "Connect international models through the official CodeBuddy CLI native JSON Schema output. Models and credit multipliers refresh automatically; DSH manages conversations and tool execution.",
      "quickSetup": "Automatic CLI setup",
      "setup": "Set up CLI",
      "setupBusy": "Setting up…",
      "setupNote": "Find an existing installation, or download and run the official installer. Supports Windows x64, macOS and Linux without entering a user-specific path.",
      "detecting": "Finding and checking CLI…",
      "installing": "Installing the official CLI…",
      "setupReady": "CLI configured, version {version}.",
      "actionFailed": "The action failed. Check your network and retry.",
      "installationGuide": "Official installation guide",
      "loginTitle": "Sign in or switch account",
      "copyLogin": "Copy sign-in command",
      "copied": "Sign-in command copied",
      "loginHelp": "Paste into PowerShell (Terminal on macOS/Linux), run /login, choose International Site and complete sign-in, then refresh models. Repeat official sign-in for a 401 error.",
      "loginMissing": "Set up the CLI first to obtain its sign-in command.",
      "accountsTitle": "Multiple accounts",
      "accountOverviewTitle": "Account overview",
      "quotaAuthForeignRegion": "Note: the upstream sign-in page belongs to the other region; check the domain before authorising.",
      "accountNote": "Sign in to each account separately; once one is selected, the DSH model picker shows that account's models under their plain model names.",
      "accountValidation": "Multiple accounts require Windows and the official CLI 2.174.0 or newer (the npm codebuddy.cmd or the official codebuddy.exe; verified on 2.174.0 / 2.177.0, newer versions pass with a warning). Directory isolation and automated checks passed; real two-account sign-in, refresh and billing attribution still need acceptance testing.",
      "accountLabel": "Account label",
      "accountAdd": "Add account",
      "accountUse": "Use this account",
      "accountLegacy": "Use default CLI sign-in",
      "accountPrepare": "Prepare official sign-in command",
      "accountRemove": "Remove from list",
      "accountSelected": "Selected",
      "accountHasCredential": "Local credential present (identity, validity and credits unverified)",
      "accountNoCredential": "No local sign-in credential",
      "accountPathError": "Invalid isolation directory; requests blocked",
      "accountUnsupported": "Multiple-account isolation is unverified on this platform. Continue using the default CLI sign-in.",
      "accountStoreError": "Account list could not be read. Requests are blocked; preserve local data and see the guide.",
      "accountAdded": "Isolated environment created. Prepare its sign-in command and run it in a new PowerShell window. Choose Chinese Site, verify the account, exit the CLI after sign-in, then refresh models.",
      "accountPrepared": "The official sign-in command is ready for this isolated environment. Run it in a new PowerShell window and choose International Site.",
      "accountRemoved": "Removed from the list. Official local sign-in data is retained. Existing conversations fail explicitly instead of switching accounts.",
      "accountUsage": "This process: {calls} requests · input {input} / output {output} tokens; not official billing or remaining credits.",
      "accountPrivacy": "The plugin does not import or copy your everyday credentials. Adding or selecting an account does not send model prompts; run sign-in commands manually.",
      "accountGuide": "Multiple-account guide",
      "accountGuideSteps": "1. Add an environment. 2. Prepare and run its command in a new PowerShell window. 3. Choose Chinese Site, verify the identity, then exit after sign-in. 4. Select the entry and refresh models. 5. Select that account's model in the conversation (model names carry no account label). Authorize accounts separately; never copy credentials or send tokens with feedback.",
      "accountGuideErrors": "ACCOUNT_LOGIN_REQUIRED: sign in in that environment. ACCOUNT_MODEL_REQUIRED: choose that account's model. ACCOUNT_CLI_UNVERIFIED: unverified CLI version. ACCOUNT_IN_USE: switch and wait. For 401, use official /login in the corresponding environment. Labels do not establish verified identities.",
      "accountGuideLink": "Open the full account guide",
      "accountGuideUrl": "https://github.com/liuwenjie74/dsh-codebuddy-cli/blob/main/docs/intl/ACCOUNT_GUIDE.en.md",
      "accountConfirmRemove": "Confirm removal (keep local sign-in data)",
      "accountCancel": "Cancel removal",
      "accountStoreScope": "Labels are local hints and do not verify the official account identity.",
      "settings": "Connection and defaults",
      "cliPath": "CLI path (blank: auto-detect)",
      "configDir": "Configuration directory (default: ~/.dsh-codebuddy-cli-intl)",
      "model": "Default model ID (optional)",
      "modelPlaceholder": "Follow CLI default, or choose a discovered model",
      "modelNote": "The DSH conversation model takes priority. This is a fallback; unlisted model IDs can also be entered.",
      "effort": "Default reasoning effort",
      "followDefault": "Use model default",
      "timeoutMs": "Request timeout (ms)",
      "save": "Save settings",
      "saving": "Saving…",
      "saved": "Settings saved",
      "saveFailed": "Could not save settings. Try again.",
      "saveFirst": "Save your pending changes before checking or configuring the CLI.",
      "inspect": "Check CLI executable",
      "inspectBusy": "Checking…",
      "notChecked": "Waiting for CLI executable check",
      "cliAvailable": "CLI executable starts: {version}",
      "cliUnavailable": "CLI executable check failed ({code}). Run setup or check its path.",
      "cliCheckNote": "This runs the version command only. It does not verify sign-in, network connectivity or model responses. Catalog discovery is not a model-call test.",
      "timeoutHelp": "Total deadline from CLI startup to process exit, including model processing. Complex tasks may need 300000–600000 ms (5–10 minutes). Timeouts are not retried automatically.",
      "runtimeVersion": "Running plugin: {version} · Call timeout: {seconds} seconds",
      "timeoutDetail": "CLI process diagnostics: {seconds}s · stdout {stdout} bytes · stderr {stderr} bytes. Byte counts do not measure model generation progress.",
      "streamDetail": "Stream diagnostics: {reason} · phase {phase} · parse {stage} · frame {index}/{count} ({bytes} bytes) · init/results {inits}/{results} · last frame {frame} · termination {terminator} · close observed {closed} · deadline reached {deadline}.",
      "responseDetail": "Result: {mode} · {reason} · {finals} final record(s) · type {type} · normalization {normalized}. {facts} {notice}Basic diagnostics contain no reply content.",
      "nativeOutput": "Native JSON Schema",
      "parseValid": "Valid structure",
      "parsePlainText": "Plain-text reply (no tools executed)",
      "parseEmpty": "Empty result",
      "parseIncomplete": "Unclosed JSON, possibly truncated",
      "parseSyntax": "CLI output is not valid JSON",
      "parseAmbiguous": "Ambiguous protocol fragments",
      "parseFinalCount": "Final result record is not unique",
      "parseEnvelope": "Invalid root structure",
      "parseText": "Missing or invalid text",
      "parseCalls": "Invalid toolCalls structure",
      "parseUnknownTool": "Undeclared tool",
      "parseArguments": "Tool arguments must be an object",
      "parseOutputMissing": "Missing structured_output",
      "noNormalization": "None",
      "parseNativeResult": "Native final result received",
      "parseNotice": "CLI notice",
      "parseOutputInvalid": "CLI output has no valid result",
      "parseDeadline": "Request deadline reached",
      "parseStreamError": "CLI error frame",
      "parsePermissionFrame": "CLI requested interactive permission",
      "parseResultBeforeInit": "Result before init frame",
      "parsePostResult": "Extra frame after final result",
      "structuredFacts": "structured_output: {present} ({type}); result type {resultType}; final subtype: {subtype}.",
      "noticeDetail": "Notice class: {classification} · source: {source}.",
      "streamReasonNone": "No stream error",
      "streamReasonJson": "JSON parse failed",
      "streamReasonShape": "Invalid frame shape",
      "streamReasonDuplicateInit": "Duplicate init frame",
      "streamReasonPostResult": "Conflicting sequence after result",
      "streamReasonResultBeforeInit": "Result before init",
      "streamReasonMultiple": "Multiple final results",
      "streamReasonError": "Error frame received",
      "streamReasonPermission": "Permission control frame received",
      "streamReasonMissingInit": "Init frame missing at close",
      "streamReasonMissingResult": "Final result missing at close",
      "streamReasonExit": "CLI exited nonzero",
      "streamReasonDeadline": "Request deadline reached",
      "streamReasonCancelled": "Request cancelled",
      "streamReasonTooLarge": "Output limit exceeded",
      "streamReasonSpawn": "CLI failed to start",
      "streamPhaseAwait": "Waiting for init",
      "streamPhaseInit": "Initialized",
      "streamPhaseResult": "Final result received",
      "streamPhaseDrain": "Draining terminal output",
      "streamPhaseClosed": "Process closed",
      "parseStageLine": "Newline frame",
      "parseStageTail": "Unterminated tail frame",
      "parseStageNone": "None",
      "frameNone": "None",
      "frameInit": "Init",
      "frameSystem": "System frame",
      "frameAssistant": "Assistant frame",
      "frameResult": "Result frame",
      "frameError": "Error frame",
      "frameControl": "Permission control frame",
      "frameOther": "Other frame",
      "frameMalformed": "Unparseable frame",
      "terminatorNone": "Not terminated",
      "terminatorAdapter": "Adapter stopped process",
      "terminatorDrain": "Terminal drain stopped process",
      "terminatorDeadline": "Deadline stopped process",
      "terminatorCancel": "External cancellation",
      "terminatorChildError": "Child process error",
      "terminatorClose": "Natural close",
      "terminatorSpawn": "Spawn failure",
      "noticeNone": "No matching notice",
      "noticeUnknown": "Unclassified notice",
      "noticeContext": "Context limit",
      "noticeBalance": "Insufficient balance",
      "noticeAuth": "Authentication",
      "noticeAccess": "Service access denied",
      "noticeRate": "Rate limit",
      "noticeLocalPermission": "Local permission",
      "noticeNetwork": "Network connection",
      "noticeSourceStderr": "stderr",
      "noticeSourceStdout": "stdout",
      "noticeSourceAssistant": "assistant text frame",
      "noticeSourceError": "error frame",
      "noticeSourceResult": "result frame",
      "noticeSourceMixed": "multiple output channels",
      "factReported": "present",
      "factMissing": "missing",
      "factObject": "object",
      "factArray": "array",
      "factString": "string",
      "factNumber": "number",
      "factBoolean": "boolean",
      "factNull": "null",
      "factUndefined": "undefined",
      "factYes": "valid",
      "factNo": "invalid",
      "subtypeSuccess": "success",
      "subtypeError": "error",
      "subtypeOther": "other",
      "subtypeMissing": "not provided",
      "recentFailures": "Recent failures (up to 5, cleared on restart)",
      "diagnosticId": "Diagnostic ID: {id} (search for this in exported logs)",
      "guideTitle": "Troubleshooting and usage guide",
      "guideIntro": "Some format failures cannot be recovered automatically. Check completed operations before retrying a write or command.",
      "guideMultipleTitle": "Final result record is not unique",
      "guideMultiple": "Native output requires exactly one final CLI result record. Missing or multiple records fail, even if their contents appear identical. The adapter does not choose the last record, merge results or execute partial tools. Check completed DSH tools and file state before sending a short new request.",
      "guideIncompleteTitle": "No valid structured result from the CLI",
      "guideIncomplete": "The adapter accepts only the official structured_output JSON object. It does not extract protocol fields from prose, invent missing content or request an automatic model repair. Check completed tools before retrying a smaller task.",
      "guideProgressTitle": "Tools completed but the final reply failed",
      "guideProgress": "A failed final reply does not undo earlier tools. Check tool records, file contents and exit codes before retrying. When requesting only a summary of completed work, explicitly ask not to repeat completed operations.",
      "guideLiteralTitle": "Paths, code or backslashes differ",
      "guideLiteral": "The adapter passes the structured text field through as-is and does not parse or unescape its contents again. If the text itself differs, request only the affected short section and compare literal characters.",
      "guideAccessTitle": "CLI, sign-in, deadlines or file permissions",
      "guideAccess": "A version check only proves the executable starts. Use official sign-in for 401 errors; model access and credits are controlled by the service. Split slow tasks or adjust the deadline. For file or ACL failures, confirm the DSH workspace and path rather than changing permissions to fix response formatting.",
      "guideRequestSizeTitle": "Local request size limits",
      "guideRequestSize": "REQUEST_TOO_LARGE means a local size check refused this request: the international text envelope is limited to 12 MiB, and the final stream-json CLI input in image mode to 24 MiB. Both use UTF-8 bytes, not tokens. Image offloading does not compress text history; JSONL encoding and image blocks count toward final image input. Settings and basic logs show the measured stage, actual bytes, limit and size breakdown; sizes absent from older logs cannot be reconstructed. The adapter never automatically deletes history, drops images, truncates schemas, switches models or retries.",
      "guideLimitsTitle": "Context or credit errors (400 / 402)",
      "guideLimits": "400 means the service explicitly reported that the input exceeded the model context limit; shorten history or start a new session before retrying. 402 means the official service reported insufficient balance; check the official usage page. The plugin does not switch models or accounts or retry automatically.",
      "guideNetworkTitle": "CLI_NETWORK_ERROR: connection reset or TLS failure",
      "guideNetwork": "This classification means the official CLI reported a reset connection or an incomplete TLS handshake. Check connectivity to the official International service and your proxy settings. The adapter only classifies the CLI message; it cannot repair connectivity or confirm the exact cause, and it does not retry automatically. Check completed DSH actions before you decide whether to retry.",
      "guideLogsTitle": "Useful issue reports",
      "guideLogs": "Export basic logs with the diagnostic ID, time and reproduction steps. Arm failure capture beforehand only when raw replies are needed, and review before sharing. Successes and user-aborted tasks preserve capture; cancelling capture, clearing logs or restarting disables it.",
      "logsTitle": "Diagnostic logs and feedback",
      "logsNote": "Basic logs stay on this computer across restarts, bounded to 100 calls and 2 MiB. They include versions, models, timing, usage and structural summaries, without request/reply bodies, login credentials or configuration paths. Nothing is uploaded automatically.",
      "logsStatus": "{entries} records · {failures} failures · {samples} detailed samples",
      "viewLogs": "View basic logs",
      "hideLogs": "Hide logs",
      "exportLogs": "Export basic logs",
      "captureNotice": "For format failures, optionally capture the next failed raw model reply, excluding requests, CLI stderr and login files. Replies can contain chats, code, file contents, tool arguments and repeated sensitive information. Samples are limited to 256 KiB; larger replies retain both ends with a truncation marker.",
      "captureConsent": "I understand detailed samples may contain private content and will review and remove sensitive information before sharing.",
      "armCapture": "Capture next failed reply",
      "cancelCapture": "Cancel detailed capture",
      "captureArmed": "Waiting for the next non-user-aborted failure, then capture turns off. Restart also turns it off. Successes and user-aborted tasks preserve capture. Earlier failures cannot be recovered.",
      "previewDetailed": "Preview detailed logs",
      "exportDetailed": "Export detailed logs (raw replies)",
      "clearLogs": "Clear logs",
      "confirmClear": "Confirm clearing all logs and samples",
      "cancelClear": "Cancel",
      "logsExported": "Log download prepared. Check that the file was saved and review it before sharing.",
      "logsFailed": "Log operation failed. Try again.",
      "logsStorageError": "Local log storage failed ({code}). Available in-memory records can still be exported but may be lost after restart.",
      "logsHelp": "Report issues with the JSON log, error screenshot and reproduction steps. If basic logs are insufficient, enable one-time detailed capture and reproduce. Clearing removes local records and disables capture; downloaded files must be deleted separately.",
      "models": "Model catalog",
      "refreshModels": "Refresh models and rates",
      "refreshing": "Discovering models…",
      "catalogReady": "{count} models · Updated {time}",
      "catalogEmpty": "No model catalog yet. Set up and sign in to the CLI, then refresh.",
      "catalogStale": "Refresh failed; showing the previous catalog. {message}",
      "imageInput": "Image input",
      "imagesSupported": "Declared by catalog",
      "imagesUnknown": "Not declared",
      "imageNote": "Image input is enabled only for models explicitly marked supportsImages in the live official catalog. DSH attachment service reads the images and the plugin sends native image blocks through the official CLI stream-json input; an undeclared model fails explicitly instead of silently dropping images. Per request history: up to 5 images, 2 MiB per image, 8 MiB total Base64; the longest edge is capped at 1920 pixels when resized. Inline image data URIs over 32,768 total characters are rejected before a model request. Images already offloaded by DSH are not reread, and image content is excluded from diagnostics.",
      "creditsNote": "Rates come from the official catalog; official billing is authoritative.",
      "searchModels": "Search model name or ID",
      "modelName": "Model / ID",
      "multiplier": "Credit multiplier",
      "efforts": "Reasoning efforts",
      "context": "Context",
      "unknown": "Not provided",
      "noEffort": "Model default",
      "noMatches": "No matching models.",
      "usage": "Cumulative token usage this run",
      "usageNote": "Input includes uncached, cache-read and cache-write tokens, counted once. This is not the latest question length or billed credits. The adapter starts one CLI process per request, while structured processing inside the CLI may involve multiple rounds; official usage details are authoritative. Resets on restart.",
      "usageTotals": "{calls} cumulative requests · {input} total input (including cache) · {output} total output tokens",
      "outcomeTotals": "Local event counts (reset on restart): {cancelled} cancellations · {offloads} DSH image-offload requests ({images} images requested) · {history} already-offloaded images in request history. A request does not confirm DSH completed it.",
      "usageBreakdown": "Input breakdown: {uncached} uncached · {read} cache read · {write} cache write tokens",
      "requestSize": "Last request envelope: {messages} messages · {tools} tools; prompt envelope {total} UTF-8 bytes (system {system} / history {history} / tools {schemas}). This is the locally assembled request size, not tokens or proof that it was sent.",
      "sizeUnknown": "Not recorded",
      "budgetEnvelope": "Text envelope",
      "budgetInput": "Encoded CLI input",
      "budgetDetail": "Local size check: {stage} · {actual} / {limit} bytes; the request was refused before starting the CLI model invocation and was not submitted to the model.",
      "requestSizeExtra": "Other sizes: response schema {schema} / fixed instructions and envelope structure {overhead} / computed CLI input {input} bytes. Image mode includes final stream-json encoding and native image blocks; a local refusal does not mean the input was sent.",
      "requestTime": "Last call took {seconds} seconds. Complete JSON responses do not expose model decoding speed.",
      "noUsage": "No DSH model request yet. The plugin does not send test prompts automatically.",
      "lastCall": "Last: {model} · {time} · {input} input (including cache) / {output} output tokens for this call",
      "lastFailed": "Last request failed: {code}",
      "active": "{count} request(s) active",
      "openHome": "Open CodeBuddy usage page",
      "toolNote": "Models and image capabilities come from the current international CLI catalog; account permissions are enforced by the official service. Image requests use the CLI native image input. CLI business tools remain disabled and DSH executes tools.",
      "accountAddTitle": "Add an account",
      "accountAutoLabel": "Account {count}",
      "accountCreditsLeft": "{credits} credits left",
      "accountCreditsUnknown": "Credits not read",
      "accountDefaultAccount": "Default account (this region)",
      "accountDefaultEmpty": "The international build shows no default account: add an account, complete one sign-in in a new PowerShell window, then use it. Another region's record is never borrowed.",
      "accountDefaultLogin": "Default CLI sign-in (read-only)",
      "accountExhausted": "Out of credits until {time}",
      "accountIdentity": "Signed in: {nickname} · {uid} · valid until {time}",
      "accountIdentityENCRYPTED": "The sign-in record is encrypted (written by the desktop app) and cannot be read here; sign this account in with the npm CLI.",
      "accountIdentityEXPIRED": "The sign-in credential expired. Sign in again, then read the credits.",
      "accountIdentityFOREIGN_REGION": "The readable sign-in record belongs to another region ({nickname} at {domain}) and is never used for this region's credits; sign in to this region's account here, or use the device authorisation.",
      "accountIdentityMISSING": "This account has no sign-in record yet. Run its login command first.",
      "accountIdentityUNREADABLE": "The sign-in record could not be read, so the identity is unconfirmed.",
      "copyAuthLink": "Copy authorisation link",
      "accountLoginCancel": "Cancel",
      "accountLoginDone": "I have signed in, refresh",
      "accountLoginGenerating": "Generating the official sign-in command…",
      "accountLoginNotYet": "No login record yet. Finish the official sign-in, then press again.",
      "accountLoginStart": "The official sign-in command is ready. Run it in PowerShell, then come back and press the button below.",
      "accountNativeNotice": "This is the native codebuddy.exe. Account isolation relies on it honouring the isolated directories; if an account still shows no local sign-in after logging in, switch to the npm codebuddy.cmd.",
      "accountOff": "Off",
      "accountOn": "On",
      "accountOtherTitle": "Other accounts",
      "accountPickProgram": "Choose another program",
      "accountReadOnly": "Read-only",
      "accountRotation": "Switch accounts when credits run out",
      "accountRotationNote": "The account is part of the model id, so rotating on every request would rewrite the conversation prefix and cost more than it saves. When enabled, only an insufficient-credits answer moves the next request to another account that has a sign-in, and one switch is recorded; when disabled, every failure is reported as-is.",
      "accountRotationToggle": "Yields only when credits run out",
      "accountStatusSignedIn": "Signed in",
      "accountSummaryCurrent": "Current account",
      "accountSummaryRotation": "Auto switch",
      "accountSummarySigned": "Signed in",
      "batchSaved": "Saved the enabled state for {count} models.",
      "captureRequestSamples": "Capture redacted request samples",
      "captureRequestSamplesNote": "When on, each request saves one redacted sample of its system-prompt scope under the requests subfolder of the diagnostics directory: system prompt and system messages only, never user, assistant or tool messages. Keys, Bearer tokens, data URIs, long blobs, emails, long numbers and UUIDs are masked first; each sample is capped at 64 KiB and only the newest 20 are kept. The identity block the CLI writes itself in its OAuth branch never passes through this plugin, so no sample can capture it. The switch takes effect immediately and is stored in the DSH configuration.",
      "captureRequestSamplesToggle": "Apply: save the system-prompt scope of each request (redacted and size-capped) to the diagnostics folder; off by default",
      "clearSelection": "Clear",
      "cliExecutable": "Executable",
      "cliVersionLabel": "Version",
      "colCalls": "Calls",
      "controlSummary": "Separate control events: cancellations {cancelled} · image offloads {offloads}.",
      "disableSelected": "Disable selected",
      "enabled": "Enabled",
      "enableSelected": "Enable selected",
      "exportCsv": "Export CSV",
      "filterModels": "Filter",
      "guideCliError": "CLI_REQUEST_FAILED means the CLI returned an error that cannot safely be mapped to a known category. Keep the diagnostic ID and basic logs, and record CLI/plugin versions, model and whether images were attached. A short text request can help determine whether the issue is limited to image requests. Do not assume an unknown error means a balance or network problem, and do not repeat DSH tools that already ran.",
      "guideCliErrorTitle": "CLI request failed with no recognized cause",
      "guideLocalSize": "REQUEST_TOO_LARGE refuses this request before the model invocation: the text envelope is limited to 12 MiB and final CLI input to 20 MiB, measured in UTF-8 bytes rather than tokens. Image offloading removes image content without compressing text history. JSONL escaping also increases final input size. Settings and basic logs show the check stage and size breakdown; missing sizes in old logs cannot be reconstructed. Keep the original conversation and provide a necessary summary in a new one, or reduce the tools needed for the task. The adapter never automatically deletes history, drops images, truncates tool definitions or retries.",
      "guideLocalSizeTitle": "Local request size limits",
      "guideSize": "CLI_CONTEXT_TOO_LARGE (400) means the official service explicitly rejected an over-context request; the adapter never truncates or deletes DSH history. A standard inline image data URI exceeding 32,768 characters in total is blocked before the model request with IMAGE_DATA_URI_TOO_LARGE. Reattach through DSH or start a new conversation with a concise summary. This character threshold is not a token estimate. CLI_INSUFFICIENT_BALANCE (402) is used only when the CLI explicitly reports insufficient balance; check the official plan and usage page.",
      "guideSizeTitle": "Long history, oversized image text or insufficient credits",
      "hintShow": "Show explanation",
      "imageBase64": "Inline images as Base64",
      "imageBase64Note": "When on, image attachments are inlined into the request as Base64. When off, nothing is inlined and a request that carries images reports an offload requirement instead, so an oversized body is never built silently. The switch takes effect immediately and is stored in the DSH configuration.",
      "imageBase64Toggle": "When off, requests with images fall back to the offload hint",
      "images": "Image input",
      "imagesHelp": "User images and standard DSH tool image attachments are supported, including desktop, window, region and browser captures. Both share a 5-image request budget, each converted to ≤2 MiB and longest edge ≤1920; DSH records historical offloading. A path, URL or raw Base64 returned as text is not loaded automatically. Standard inline image data URIs exceeding 32,768 characters in total are blocked before the model request; reattach through DSH. Native model image generation is not adapted. Raw failure samples are disabled for image requests; images and Base64 are excluded from feedback logs.",
      "imagesNo": "Not declared",
      "imagesShort": "Text and standard image attachments (up to 5 per request, 2 MiB each)",
      "imagesYes": "Images",
      "lastUsed": "Last used {time}",
      "logConsoleEmpty": "No logs recorded in this process yet.",
      "logConsoleTitle": "Log console",
      "logLevel": "Log level",
      "logLevelDebug": "Debug",
      "logLevelError": "Failures only",
      "logLevelInfo": "All calls",
      "logLevelNote": "The level only changes how much diagnostics get written: failures records failed calls only, all calls records every call, and debug currently matches all calls (reserved for finer diagnostics). It never changes the request payload or the model output.",
      "maxConcurrency": "Max concurrent calls",
      "maxConcurrencyNote": "Throttling applies only to the layer that starts CLI calls for this plugin: once the limit is reached, new requests wait instead of hitting the official service all at once, which avoids 429 storms. 0 keeps the previous unbounded behaviour. The value is stored in the DSH configuration.",
      "maxConcurrencyToggle": "0 means unlimited; new requests queue once the limit is reached",
      "metricEntries": "Records",
      "metricFailures": "Failures",
      "metricmodels": "Models in catalog",
      "metricSamples": "Detailed samples",
      "metricSamplesRedacted": "Redacted samples",
      "metricusage": "Calls this process",
      "modelDisabled": "Disabled",
      "modelEnable": "Enabled",
      "modelEnabled": "Enabled",
      "modelFallbackNotice": "The requested model was unavailable, so the default model was used: requested {requested} → used {used}. A session already sitting on a disabled model still has to pick another model.",
      "modelsEnabledChip": "{total} models · {enabled} enabled",
      "modelsSelectionStatus": "{total} models · {selected} selected · {hidden} disabled",
      "modelsTabAll": "All {count}",
      "modelState": "Status",
      "modelsUpdatedAt": "updated {time}",
      "modelVisibilityFailed": "Failed to save the enabled state. Try again.",
      "modelVisibilityLast": "Keep at least one model enabled; enable another model first.",
      "nativeDetail": "Native result facts: structured_output present {present} · type {type} · terminal type=result {valid} · subtype class {subtype}.",
      "navaccounts": "Accounts",
      "navconnection": "Connection",
      "navdiagnostics": "Diagnostics",
      "navlogs": "Logs",
      "navmodels": "Models",
      "navusage": "Token usage",
      "networkFacts": "Network: proxy {proxy} · custom CA {ca} · Node {node}",
      "networkHint": "These are the values the running process actually has; the plugin neither stores nor changes them. The proxy comes from HTTPS_PROXY (or https_proxy / HTTP_PROXY / ALL_PROXY); from Node 24 on, built-in fetch also needs NODE_USE_ENV_PROXY=1 to use it, otherwise the value is present but requests still go direct. The custom CA comes from NODE_EXTRA_CA_CERTS and must point at a PEM file set before DSH starts. \"unknown\" means nothing is configured and requests go direct -- a common reason calls fail behind a corporate proxy or a TLS-inspecting gateway.",
      "openPage": "Open CodeBuddy settings",
      "pageEntryHint": "Settings now have a dedicated CodeBuddy page in the left sidebar.",
      "pageSections": "Settings sections",
      "perModelEmpty": "No calls recorded in this process yet.",
      "perModelTitle": "Per-model usage",
      "preflightFailed": "Pre-save check failed: {item} ({code}). Fix it and save again.",
      "quotaAuthorize": "Authorise quota access",
      "quotaAuthorizeHint": "Open the generated link in your browser and confirm; then come back and press \"I have authorised\".",
      "quotaCompleteAuth": "I have authorised",
      "quotaDisconnect": "Disconnect",
      "quotaDisconnected": "Authorisation removed and the stored credential deleted.",
      "quotaEmpty": "This account has no usable packages.",
      "quotaExpire": "Expires {time}",
      "quotaFailed": "Reading quota failed. Retry or check the official site.",
      "quotaLoading": "Reading credits…",
      "quotaNotAuthorized": "Quota access is not authorised. Credits belong to the official account: authorise to read them here, or check the official site.",
      "quotaPackages": "Package breakdown ({count} merged groups)",
      "quotaRefresh": "Refresh quota",
      "quotaRefreshAllNote": "Refreshes every account: the default sign-in row and each signed-in account is read once.",
      "quotaRefreshedAt": "Refreshed at {time}.",
      "quotaRefreshing": "Refreshing…",
      "quotaRemain": "Credits remaining",
      "quotaSourceCli": "From this account's CLI sign-in",
      "quotaSourceDevice": "From browser authorisation",
      "quotaTotal": "Total credits",
      "quotaUnavailable": "Quota is temporarily unavailable. Retry later or check the official site.",
      "quotaUnit": "credits",
      "quotaUsed": "Credits used",
      "recentCallsTitle": "Recent calls",
      "rewriteAudit": "Identity coverage: {hits} rewritten in this request; {residual} identity text(s) still uncovered within the plugin-visible scope (legitimate runtime paths are not counted).",
      "rewriteClientNames": "Cover identity",
      "rewriteClientNamesNote": "When on, client self-names in the request system prompt are replaced with WorkBuddy, case-insensitively, in the system prompt only; a user message that mentions these names is left untouched. The identity the CLI writes itself (OAuth branch) is out of scope. The switch takes effect immediately and is stored in the DSH configuration.",
      "rewriteClientNamesToggle": "Apply: rewrite client self-names in the system prompt to WorkBuddy",
      "rewriteTitle": "Feature switches",
      "selectAll": "Select all",
      "selectColumn": "Select",
      "sidebarEntry": "CodeBuddy",
      "sortHint": "Click to sort: ascending → descending → catalog order",
      "statAccount": "Account",
      "statCalls": "Calls",
      "statCli": "CLI",
      "statFailures": "Failures",
      "statModels": "Enabled / total",
      "subtitle": "Drive DSH models with your official CodeBuddy account quota; catalog and rates sync automatically.",
      "timeoutChip": "Timeout {seconds}s",
      "todayCalls": "Calls today",
      "toolCoverage": "Tool and result compatibility",
      "toolCoverageUrl": "https://github.com/liuwenjie74/dsh-codebuddy-cli/blob/main/docs/cn/TOOL_COMPATIBILITY.en.md",
      "undoBatch": "Undo last batch",
      "usageCache": "Cache hits",
      "usageInput": "Input tokens",
      "usageOutput": "Output tokens",
      "autoCheckin": "Daily auto check-in",
      "autoCheckinToggle": "Run daily check-in (China) or active bonus beacon (International) on UTC+8 schedule",
      "autoCheckinNote": "Off by default. China checks in at 09:00 / 21:00 UTC+8; International checks the UTC+8 heatmap at 08:00 / 12:00 / 16:00 / 20:00 and sends a single activity beacon when unlit (bonus pack granted next morning). Already-completed accounts are skipped.",
      "autoTokenKeepalive": "Scheduled token keepalive",
      "autoTokenKeepaliveToggle": "Refresh stored device-authorisation tokens daily at 22:00 UTC+8",
      "autoTokenKeepaliveNote": "Off by default. Refreshes only plugin-stored device grants without touching official CLI login files unless the plaintext CLI refresh switch below is explicitly enabled.",
      "allowCliCredentialRefresh": "Allow plaintext CLI credential refresh",
      "allowCliCredentialRefreshToggle": "Refresh and atomically write back plaintext CLI .info login files",
      "allowCliCredentialRefreshNote": "Off by default. Only touches plaintext .info files for the current region (skips encrypted desktop records), avoids active CLI calls, and uses two-phase snapshot verification before atomic write-back.",
      "checkinAll": "Check in",
      "checkinBusy": "Checking in…",
      "checkinDone": "Check-in finished: {msg}",
      "keepaliveAll": "Refresh token",
      "keepaliveBusy": "Refreshing…",
      "keepaliveDone": "Keepalive finished: {msg}"
    }

    // ---- 2. browser-side helpers (no imports: the bundle stays self-contained) ----
    function useFormSnapshot(form) {
      return React.useSyncExternalStore(
        (listener) => typeof form?.subscribe === 'function' ? form.subscribe(listener) : () => {},
        () => typeof form?.getSnapshot === 'function' ? form.getSnapshot() : form?.state,
        () => typeof form?.getSnapshot === 'function' ? form.getSnapshot() : form?.state
      )
    }
    function translate(t, key, values = {}) {
      return t(key).replace(/\{(\w+)\}/gu, (_, name) => String(values[name] ?? ''))
    }
    function formatTime(value) {
      try { return new Date(value).toLocaleString() } catch { return String(value) }
    }
    function isStatus(value) {
      return !!value && typeof value === 'object' && typeof value.activeCalls === 'number'
        && !!value.usage && typeof value.usage.calls === 'number' && !!value.cliCheck && typeof value.cliCheck.state === 'string'
    }
    // Sections follow the mockup's card shape: soft border, one shadow, a header
    // bar and a padded body. Colours come from the tokens above, never hardcoded.
    const sectionStyle = () => ({ ...cardStyle(), margin: 0, padding: 16, display: 'grid', gap: 12 })
    const inputStyle = () => ({ width: '100%', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8, border: '1px solid rgba(127,127,127,.45)', background: 'rgba(127,127,127,.12)', color: 'inherit' })
    const rowStyle = { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10 }
    const buttonStyle = { padding: '8px 12px', borderRadius: 8, border: '1px solid rgba(127,127,127,.45)', background: 'rgba(127,127,127,.16)', color: 'inherit', cursor: 'pointer' }
    // ---- design tokens ------------------------------------------------------
    // The mockup ships a hardcoded light palette; every value here is mapped to a
    // DSH theme token instead, so the page keeps the mockup's shapes (cards,
    // strips, switches, chips, spacing) while still following the host light/dark
    // theme. Hardcoding the mockup colours would be unreadable in dark mode.
    // Control surfaces deliberately avoid unverified alias tokens: when a token
    // name does not exist the var() fallback wins, and if that fallback is light
    // while the label stays `inherit` (white in a dark theme) the button, select
    // or badge becomes unreadable white-on-light. Semi-transparent greys plus one
    // solid blue read correctly in both themes.
    const T_TEXT = 'inherit'
    const T_MUTED = 'var(--dsw-alias-label-secondary, #8b93a1)'
    const T_LINE = 'var(--dsw-alias-border-primary, rgba(127,127,127,.38))'
    const T_SOFT = 'rgba(127,127,127,.14)'
    const T_BRAND = '#2563eb'
    const T_ACCENT = '#3b82f6'
    const T_OK = '#16a34a'
    const T_WARN = '#b45309'
    const cardStyle = () => ({ background: 'var(--dsw-alias-background-primary, rgba(127,127,127,.03))', border: `1px solid ${T_LINE}`, borderRadius: 10, boxShadow: '0 1px 2px rgba(16,24,40,.05)', margin: '0 0 14px', overflow: 'hidden' })
    const cardHeaderStyle = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '12px 16px', borderBottom: `1px solid ${T_LINE}` }
    const cardTitleStyle = { fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }
    const cardBodyStyle = { padding: '4px 16px 14px' }
    const fieldRowStyle = { display: 'grid', gridTemplateColumns: '170px minmax(0,1fr)', gap: 12, padding: '9px 0', alignItems: 'center', borderTop: `1px dashed ${T_LINE}` }
    const fieldLabelStyle = { color: T_MUTED, fontSize: 13 }
    const fieldValueStyle = { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 }
    // Chips tint only the background and keep the inherited label colour, so the
    // status text can never end up lighter than its own background.
    const chipBase = { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '1px 8px', borderRadius: 999, fontSize: 12, background: 'rgba(127,127,127,.16)', color: 'inherit', whiteSpace: 'nowrap' }
    const chipTones = { ok: { background: 'rgba(22,163,74,.18)' }, warn: { background: 'rgba(180,83,9,.20)' }, brand: { background: 'rgba(37,99,235,.20)' }, plain: {} }
    const primaryButtonStyle = { ...buttonStyle, background: T_BRAND, borderColor: T_BRAND, color: '#fff' }
    const switchRowStyle = { display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 0', borderTop: `1px dashed ${T_LINE}` }
    const switchTextStyle = { flex: 1, minWidth: 0, display: 'grid', gap: 2 }
    const switchTitleStyle = { fontWeight: 600, fontSize: 13.5, color: T_TEXT }
    const switchSubStyle = { color: T_MUTED, fontSize: 12.5 }
    function Card({ title, actions, children, style, ...rest }) {
      return h('section', { ...rest, style: { ...cardStyle(), ...(style ?? {}) } },
        title || actions ? h('div', { style: cardHeaderStyle },
          title ? h('div', { style: cardTitleStyle }, title) : h('span', null),
          actions ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } }, actions) : null) : null,
        h('div', { style: cardBodyStyle }, children))
    }
    function Field({ label, children }) {
      return h('div', { style: fieldRowStyle }, h('div', { style: fieldLabelStyle }, label), h('div', { style: fieldValueStyle }, children))
    }
    function Chip({ tone = 'plain', children }) {
      return h('span', { style: { ...chipBase, ...(chipTones[tone] ?? {}) } }, children)
    }
    // iOS-style switch. The native checkbox stays inside so aria labels, keyboard
    // focus and render-tree assertions all keep working exactly as before.
    function Switch({ checked, disabled, onChange, label }) {
      return h('label', { style: { position: 'relative', display: 'inline-flex', width: 38, height: 22, flex: '0 0 auto', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? .5 : 1 } },
        h('input', {
          type: 'checkbox', checked: checked === true, disabled: disabled === true, 'aria-label': label,
          onChange: (event) => onChange(event.target.checked),
          style: { position: 'absolute', inset: 0, width: '100%', height: '100%', margin: 0, opacity: 0, cursor: 'inherit' }
        }),
        h('i', { style: { position: 'absolute', inset: 0, borderRadius: 999, background: checked === true ? T_BRAND : 'rgba(127,127,127,.35)', transition: 'background .18s' } }),
        h('i', { style: { position: 'absolute', top: 3, left: checked === true ? 19 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 2px rgba(16,24,40,.25)', transition: 'left .18s' } }))
    }
    function Notice({ children }) {
      return h('p', { style: { margin: 0, color: 'var(--dsw-alias-label-secondary, inherit)', lineHeight: 1.5 } }, children)
    }
    // Long rule/background explanations used to be laid out as body text, which
    // buried the controls. They now sit behind a small inline info glyph placed
    // next to its own heading or switch: hover opens it, clicking pins it. The
    // body stays mounted and only `display` and `aria-expanded` flip, so
    // assistive technology and render-tree assertions still see the text, and a
    // touch device without hover can still open it by tapping.
    function Hint({ label, children }) {
      const [pinned, setPinned] = React.useState(false)
      const [hover, setHover] = React.useState(false)
      const [placement, setPlacement] = React.useState({ left: 12, top: 12, width: 320 })
      const anchor = React.useRef(null)
      const open = pinned || hover
      // The body is an absolutely-positioned popover so opening it never changes
      // the wrapper's box. The earlier in-flow column body grew the wrapper on
      // hover, which re-centred the 16px glyph in its row and slid it out from
      // under the cursor: mouseleave closed it, the glyph slid back, mouseenter
      // reopened it -- an endless flicker. Hover handlers live on the wrapper so
      // moving into the popover keeps it open; the body stays mounted (display
      // only) for assistive tech, touch and source assertions.
      // A fixed layer clamped to the viewport. An absolute body was clipped by any
      // scrolling table or card it sat inside, and ran off the right edge of narrow
      // panels; fixed ignores ancestor overflow entirely. Canvas/CanvasText is a
      // matched system pair, so the popover cannot become white-on-white the way
      // the old background-token fallback did.
      const measure = () => {
        const box = anchor.current?.getBoundingClientRect?.()
        const vw = Number(globalThis.innerWidth) || 1024
        const vh = Number(globalThis.innerHeight) || 768
        const width = Math.min(320, Math.max(200, vw - 24))
        if (!box) return { left: 12, top: 12, width }
        const left = Math.max(12, Math.min(Math.round(box.left), vw - width - 12))
        const below = Math.round(box.bottom) + 6
        const fits = below + 160 <= vh
        return { left, top: fits ? below : Math.max(12, Math.round(box.top) - 166), width }
      }
      React.useEffect(() => { if (open) setPlacement(measure()) }, [open])
      return h('span', {
        ref: anchor,
        style: { display: 'inline-flex', alignItems: 'center', position: 'relative', verticalAlign: 'middle' },
        onMouseEnter: () => setHover(true),
        onMouseLeave: () => setHover(false)
      },
        h('button', {
          type: 'button',
          onClick: () => setPinned((value) => !value),
          onFocus: () => setHover(true),
          onBlur: () => setHover(false),
          'aria-expanded': open ? 'true' : 'false',
          'aria-label': label,
          title: label,
          // The mockup's 15px circled "i" badge. Kept as a real button so keyboard
          // focus, aria-expanded and the pin-on-click behaviour all survive.
          style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 15, height: 15, padding: 0,
            border: '1px solid rgba(127,127,127,.55)', borderRadius: '50%', background: open ? 'rgba(37,99,235,.20)' : 'rgba(127,127,127,.12)',
            color: 'inherit', fontSize: 10, fontWeight: 600, cursor: 'pointer', lineHeight: 0 }
        }, 'i'),
        h('div', { style: { display: open ? 'block' : 'none', position: 'fixed', left: placement.left, top: placement.top,
          zIndex: 9999, width: placement.width, maxWidth: 'calc(100vw - 24px)', boxSizing: 'border-box', padding: '8px 10px', borderRadius: 8,
          border: '1px solid CanvasText', background: 'Canvas', color: 'CanvasText',
          boxShadow: '0 8px 24px rgba(0,0,0,.3)', fontSize: 12.5, lineHeight: 1.55 } }, h(Notice, null, children)))
    }

    const PANEL_ID = 'codebuddy-cli'
    // Self-contained browser helpers: no filesystem scan, model request or external upload.
    function createFeedbackKit() {
      const encoder = new TextEncoder()
      const MAX_ARCHIVE = 32 * 1024 * 1024
      const textKeys = ['title', 'occurredAt', 'dshVersion', 'model', 'sessionId', 'diagnosticId', 'missingReason', 'steps', 'expected', 'actual', 'errorText', 'tool', 'context', 'frequency', 'network', 'workaround']
      const limits = { title: 160, context: 16000, steps: 8000, expected: 4000, actual: 8000, errorText: 16000 }
      const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/iu
      const clean = (v, max = 2000) => typeof v === 'string' ? v.slice(0, max) : ''
      function inspectImage(bytes, type) {
        // Bound decoded dimensions before asking the browser to allocate a bitmap.
        let width, height
        const text = (at, length) => String.fromCharCode(...bytes.subarray(at, at + length))
        const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength)
        if (type === 'image/png' && bytes.length >= 24 && bytes[0] === 137 && text(1, 7) === 'PNG\r\n\x1a\n' && text(12, 4) === 'IHDR') {
          width = view.getUint32(16); height = view.getUint32(20)
        } else if (type === 'image/jpeg' && bytes[0] === 255 && bytes[1] === 216) {
          let at = 2
          while (at + 3 < bytes.length) {
            if (bytes[at++] !== 255) throw Error('jpeg marker')
            while (bytes[at] === 255) at++
            const marker = bytes[at++]
            if (marker === 217 || marker === 218) break
            if (marker === 1 || marker >= 208 && marker <= 215) continue
            if (at + 2 > bytes.length) break
            const length = view.getUint16(at)
            if (length < 2 || at + length > bytes.length) throw Error('jpeg segment')
            if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker) && length >= 8) {
              height = view.getUint16(at + 3); width = view.getUint16(at + 5); break
            }
            at += length
          }
        } else if (type === 'image/webp' && bytes.length >= 30 && text(0, 4) === 'RIFF' && text(8, 4) === 'WEBP') {
          const chunk = text(12, 4)
          if (chunk === 'VP8X') {
            width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16); height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16)
          } else if (chunk === 'VP8L' && bytes[20] === 47) {
            width = 1 + bytes[21] + ((bytes[22] & 63) << 8); height = 1 + (bytes[22] >> 6) + (bytes[23] << 2) + ((bytes[24] & 15) << 10)
          } else if (chunk === 'VP8 ' && bytes[23] === 157 && bytes[24] === 1 && bytes[25] === 42) {
            width = view.getUint16(26, true) & 16383; height = view.getUint16(28, true) & 16383
          }
        }
        if (!(width > 0 && height > 0) || width * height > 16000000 || Math.max(width, height) > 8192) throw Error('image dimensions or format')
        return { width, height }
      }
      function redact(text) {
        return text.replace(/\b(Bearer\s+)[a-zA-Z0-9._~+\/-]+=*/giu, '$1[REDACTED]')
          .replace(/((?:["']?(?:api[_-]?key|access[_-]?token|refresh[_-]?token|authorization|cookie|password|secret|token)["']?)\s*[:=]\s*)(?:"[^"\r\n]*"|'[^'\r\n]*'|[^\s,;}]+)/giu, '$1[REDACTED]')
          .replace(/\b(?:gh[pousr]_[a-zA-Z0-9_]{16,}|github_pat_[a-zA-Z0-9_]{16,}|sk-[a-zA-Z0-9_-]{16,})\b/gu, '[REDACTED]')
      }
      const redactObject = value => typeof value === 'string' ? redact(value) : Array.isArray(value) ? value.map(redactObject) : value && typeof value === 'object' ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, redactObject(item)])) : value
      const strings = (obj, keys, max = 128) => Object.fromEntries(keys.filter(k => typeof obj?.[k] === 'string').map(k => [k, clean(obj[k], max)]))
      function facts(obj) {
        if (!obj || typeof obj !== 'object') return {}
        // Only numbers, booleans and named diagnostic labels; never copy arbitrary nested strings.
        const labels = new Set(['channel', 'exitSignal', 'requestLimitStage', 'streamReason', 'streamPhase', 'parseStage', 'lastFrameClass', 'terminationInitiator', 'structuredOutputType', 'finalSubtypeClass', 'noticeClass', 'noticeSource', 'outputMode', 'inputType', 'valueType', 'textType', 'toolCallsType', 'reason'])
        const result = {}
        const numbers = new Set(('messageCount toolCount promptBytes systemBytes messagesBytes toolsBytes schemaBytes envelopeOverheadBytes cliInputBytes requestLimitBytes requestActualBytes requestBytes streamInputBytes timeoutMs totalFrames imageCount offloadedImageCount imageBytes imageBase64Bytes inlineImageDataUriCount inlineImageDataUriChars stdoutBytes stderrBytes durationMs frameIndex frameCount frameBytes initCount resultCount exitCode characters bytes completeContainers validProtocolCandidates ignoredContainers duplicateProtocolCandidates openContainerDepth finalResultCount elapsedMs firstByteMs firstFrameMs lastFrameMs').split(' '))
        const flags = new Set(('firstFinalSeen closeObserved deadlineReached tailFrame resultTypePresent hasText hasToolCalls hasStructuredOutput resultTypeValid containerSummariesTruncated scanIncomplete scanBroken insideString incompleteTailIgnored').split(' '))
        for (const [key, value] of Object.entries(obj)) {
          if (numbers.has(key) && Number.isSafeInteger(value) && value >= 0) result[key] = value
          if (key === 'exitCode' && Number.isSafeInteger(value) && value >= -2147483648 && value <= 4294967295) result[key] = value
          if (flags.has(key) && typeof value === 'boolean') result[key] = value
          if (labels.has(key) && typeof value === 'string') result[key] = clean(value, 128).replace(/[^a-zA-Z0-9_.:/ -]/gu, '_')
        }
        if (Array.isArray(obj.normalizations)) result.normalizations = obj.normalizations.slice(0, 16).filter(x => typeof x === 'string').map(x => clean(x, 128).replace(/[^a-zA-Z0-9_.:/ -]/gu, '_'))
        if (Array.isArray(obj.containerSummaries)) result.containerSummaries = obj.containerSummaries.slice(0, 12).map(facts)
        return result
      }
      function logs(report, detailed) {
        const entries = (Array.isArray(report?.entries) ? report.entries : []).slice(-100).map(entry => {
          const result = { ...strings(entry, ['state', 'model', 'effort', 'errorCode', 'cliVersion', 'pluginVersion', 'controlClass']), diagnostics: facts(entry.diagnostics), processDiagnostics: facts(entry.processDiagnostics), responseDiagnostics: facts(entry.responseDiagnostics) }
          if (uuid.test(entry.id)) result.id = entry.id
          if (uuid.test(entry.accountId)) result.accountId = entry.accountId
          for (const key of ['at', 'durationMs', 'timeoutMs', 'inputTokens', 'outputTokens', 'uncachedInputTokens', 'cacheReadTokens', 'cacheWriteTokens', 'toolCalls', 'offloadImages', 'offloadImagesRequested', 'historyOffloadedImages']) if (Number.isSafeInteger(entry[key]) && entry[key] >= 0) result[key] = entry[key]
          for (const key of ['imageRequest', 'captureAttempted', 'sampleAvailable', 'cancelled']) if (typeof entry[key] === 'boolean') result[key] = entry[key]
          if (detailed && entry.imageRequest !== true && entry.state === 'error' && typeof entry.sample?.head === 'string') result.sample = { ...strings(entry.sample, ['head', 'tail'], 262144), truncated: entry.sample.truncated === true, originalBytes: Number.isSafeInteger(entry.sample.originalBytes) ? entry.sample.originalBytes : null }
          return result
        })
        return { schemaVersion: 1, ...strings(report, ['pluginVersion', 'storageError']), exportedAt: Number.isSafeInteger(report?.exportedAt) ? report.exportedAt : null, environment: strings(report?.environment, ['platform', 'arch', 'nodeVersion']), entries }
      }
      function validate(form, pictures) {
        for (const [key, minimum] of Object.entries({ title: 6, actual: 5 })) if ((form[key] || '').trim().length < minimum) return key
        if (!pictures.length || pictures.length > 6) return 'screenshots'
        if (pictures.some(x => !(x.bytes instanceof Uint8Array) || x.bytes.length > 5 * 1024 * 1024) || pictures.reduce((sum, x) => sum + x.bytes.length, 0) > 20 * 1024 * 1024) return 'screenshots'
        return null
      }
      function importLogs(text, region) {
        if (encoder.encode(text).length > 4 * 1024 * 1024) throw Error('log-size')
        const data = JSON.parse(text)
        if (data?.schemaVersion !== 1 || !Array.isArray(data.entries) || data.entries.length > 100 || data.entries.some(x => !x || Array.isArray(x) || typeof x !== 'object' || !uuid.test(x.id))) throw Error('log-shape')
        if (new Set(data.entries.map(x => x.id.toLowerCase())).size !== data.entries.length) throw Error('log-duplicate-id')
        if (data.region !== undefined && data.region !== region || data.provider !== undefined && data.provider !== 'codebuddy-cli-' + region) throw Error('log-region')
        return { report: logs(data, true), regionVerified: data.region === region || data.provider === 'codebuddy-cli-' + region }
      }
      function safeStatus(status, config) {
        return { ...strings(status, ['provider', 'pluginVersion', 'responseMode', 'model', 'effort']),
          timeoutMs: Number.isSafeInteger(status?.timeoutMs) ? status.timeoutMs : null,
          activeCalls: Number.isSafeInteger(status?.activeCalls) ? status.activeCalls : null,
          cliCheck: { ...strings(status?.cliCheck, ['state', 'version', 'code']), checkedAt: Number.isSafeInteger(status?.cliCheck?.checkedAt) ? status.cliCheck.checkedAt : null },
          configuration: { ...strings(config, ['model', 'effort']), explicitCliPath: !!config?.cliPath, explicitConfigDirectory: !!config?.configDir, timeoutMs: Number.isSafeInteger(config?.timeoutMs) ? config.timeoutMs : null },
          accounts: { independentAccountSelected: !!status?.accounts?.selectedId, count: Array.isArray(status?.accounts?.accounts) ? status.accounts.accounts.length : null, supported: status?.accounts?.supported === true },
          catalog: { ...strings(status?.catalog, ['state']), modelCount: Array.isArray(status?.catalog?.models) ? status.catalog.models.length : null } }
      }
      async function archive(files) {
        const chunks = [], central = []
        let offset = 0, centralBytes = 0
        const crc = bytes => { let n = 0xffffffff; for (const b of bytes) { n ^= b; for (let j = 0; j < 8; j++) n = (n >>> 1) ^ (n & 1 ? 0xedb88320 : 0) } return (n ^ 0xffffffff) >>> 0 }
        for (const file of files) {
          if (!/^[a-zA-Z0-9_./-]+$/u.test(file.name) || file.name.includes('..') || file.name.startsWith('/')) throw Error('unsafe archive path')
          const name = encoder.encode(file.name), bytes = typeof file.data === 'string' ? encoder.encode(file.data) : file.data
          const checksum = crc(bytes), local = new Uint8Array(30 + name.length), a = new DataView(local.buffer)
          a.setUint32(0, 0x04034b50, true); a.setUint16(4, 20, true); a.setUint16(6, 0x800, true); a.setUint16(12, 33, true)
          a.setUint32(14, checksum, true); a.setUint32(18, bytes.length, true); a.setUint32(22, bytes.length, true); a.setUint16(26, name.length, true); local.set(name, 30)
          const dir = new Uint8Array(46 + name.length), b = new DataView(dir.buffer)
          b.setUint32(0, 0x02014b50, true); b.setUint16(4, 20, true); b.setUint16(6, 20, true); b.setUint16(8, 0x800, true); b.setUint16(14, 33, true)
          b.setUint32(16, checksum, true); b.setUint32(20, bytes.length, true); b.setUint32(24, bytes.length, true); b.setUint16(28, name.length, true); b.setUint32(42, offset, true); dir.set(name, 46)
          chunks.push(local, bytes); central.push(dir); offset += local.length + bytes.length; centralBytes += dir.length
          if (offset + centralBytes > MAX_ARCHIVE) throw Error('archive too large')
        }
        const end = new Uint8Array(22), d = new DataView(end.buffer)
        d.setUint32(0, 0x06054b50, true); d.setUint16(8, files.length, true); d.setUint16(10, files.length, true); d.setUint32(12, centralBytes, true); d.setUint32(16, offset, true)
        return new Blob([...chunks, ...central, end], { type: 'application/zip' })
      }
      async function prepare({ form, pictures, report, region, status, config, browser, detailed = false, attachments = [], logSource = 'automatic', localRegionConfirmed = false, logRegionEvidence = 'none' }) {
        const invalid = validate(form, pictures)
        if (invalid) throw Error(invalid)
        if (!['cn', 'intl'].includes(region)) throw Error('region')
        const user = Object.fromEntries(textKeys.map(key => [key, clean(form[key], limits[key] || 2000).trim()]))
        const diagnostics = logs(report, false)
        const target = user.diagnosticId ? diagnostics.entries.find(x => x.id?.toLowerCase() === user.diagnosticId.toLowerCase()) : null
        if (detailed && target) {
          const captured = logs(report, true).entries.find(x => x.id?.toLowerCase() === user.diagnosticId.toLowerCase())
          if (captured?.sample) target.sample = captured.sample
        }
        const gaps = ['普通诊断仅保留有限近期调用，不是完整会话或全部历史。Basic diagnostics retain only bounded recent calls, not the full conversation or history.']
        if (status?.pluginVersion && status.pluginVersion !== PLUGIN_VERSION) gaps.push('配置页和运行端版本不同。Settings UI and runtime versions differ.')
        if (!status) gaps.push('运行状态不可读取，配置或版本信息可能缺失。Runtime status was unavailable; configuration and version facts may be incomplete.')
        if (!target) gaps.push('未找到完全匹配的诊断事件，其他调用只供参考。No matching diagnostic event. Nearby calls are context only; do not infer a matching request from their order.')
        for (const key of ['steps', 'errorText', 'occurredAt', 'dshVersion', 'model']) if (!user[key]) gaps.push('最好填写的材料未提供 / Recommended evidence not provided: ' + key)
        if (!user.sessionId) gaps.push('未提供 DSH 会话 ID。DSH session ID not provided.')
        if (!report) gaps.push('诊断服务不可用，没有采集到本次日志事实。Diagnostic service was unavailable; no diagnostic facts were collected.')
        if (diagnostics.storageError) gaps.push('诊断日志存储异常 / Diagnostic storage error: ' + diagnostics.storageError)
        if (!detailed || !diagnostics.entries.some(x => x.sample)) gaps.push('未附原始 CLI 回复；必要时可在诊断日志中主动开启一次失败采集后安全复现，含图请求不采集原始回复。Raw CLI reply not included. Enable existing one-failure capture before a safe reproduction only if needed; image replies are excluded.')
        if (!attachments.length) gaps.push('未附对话导出或额外工具/CLI 日志，现有材料未必能证明根因。No DSH conversation export or additional tool/CLI log was supplied. Screenshots and the user description may not prove a root cause.')
        if (status?.activeCalls > 0) gaps.push('取证时仍有请求在运行，其最终结果可能尚未记录。There were active requests during collection; their final results may not yet be recorded.')
        if (target?.pluginVersion && status?.pluginVersion && target.pluginVersion !== status.pluginVersion) gaps.push('所选故障记录与当前运行版本不同，不应假定使用同一版本代码。Selected event and current runtime versions differ; do not assume they used the same code.')
        const id = crypto.randomUUID(), at = new Date().toISOString()
        const document = { schemaVersion: 1, reportId: id, exportedAt: at, region,
          userProvided: user, automatic: { uiVersion: PLUGIN_VERSION, logSource: { kind: logSource === 'local-file' ? 'local-file' : 'automatic', localRegionConfirmed: logSource === 'local-file' && localRegionConfirmed, regionEvidence: ['file-metadata', 'user-confirmed'].includes(logRegionEvidence) ? logRegionEvidence : 'none' }, diagnosticCoverage: { retainedCalls: diagnostics.entries.length, earliestAt: diagnostics.entries.length ? Math.min(...diagnostics.entries.map(x => x.at).filter(Number.isFinite)) : null, latestAt: diagnostics.entries.length ? Math.max(...diagnostics.entries.map(x => x.at).filter(Number.isFinite)) : null }, browser: strings(browser, ['userAgent', 'language', 'timezone', 'utcOffset']), status: safeStatus(status, config), diagnosticMatch: target ? 'exact-id' : 'not-found', selectedEvent: target || null },
          evidenceGaps: gaps, privacy: { rawRepliesRequested: detailed, includesRawReplies: diagnostics.entries.some(x => x.sample), screenshotMetadataRemoved: true, automaticSecretRedaction: 'best-effort text patterns only; pixels require manual review', includesCredentialsByDesign: false, userReviewRequired: true } }
        const files = [{ name: 'report.json', data: JSON.stringify(redactObject(document), null, 2) }, { name: 'diagnostics.json', data: JSON.stringify(redactObject(diagnostics), null, 2) }]
        if (attachments.length > 3 || attachments.reduce((sum, x) => sum + encoder.encode(x.text).length, 0) > 4 * 1024 * 1024) throw Error('attachments')
        attachments.forEach((item, i) => files.push({ name: `supplements/context-${i + 1}.txt`, data: redact(item.text) }))
        pictures.forEach((item, i) => files.push({ name: `screenshots/context-${i + 1}.png`, data: item.bytes }))
        const headings = { title: '问题 / Issue', occurredAt: '发生时间（用户本地时间）/ Local time', dshVersion: 'DSH 版本 / Version', model: '用户确认的会话模型 / Model', sessionId: '会话 ID / Session', diagnosticId: '诊断 ID / Diagnostic', missingReason: '缺失原因 / Missing evidence', steps: '复现步骤 / Steps', expected: '预期 / Expected', actual: '实际 / Actual', errorText: '完整报错 / Error', tool: '相关工具和执行状态 / Tools', context: '上下文补充 / Context', frequency: '复现频率 / Frequency', network: '网络及代理情况 / Network', workaround: '已尝试的方法 / Attempts' }
        files.push({ name: 'README.md', data: redact(`# CodeBuddy 问题反馈 / Issue report\n\n报告 ${id} · ${at} · ${region}\n\n\nNothing is automatically uploaded.\n\n` + textKeys.map(key => `## ${headings[key]}\n\n${user[key] || '未提供 / Not provided'}\n`).join('\n') + '\n## 证据边界 / Evidence limits\n\n' + gaps.map(x => '- ' + x).join('\n') + '\n\nThe diagnostic event is matched only by the exact ID. Other calls are not proof of the same failure. Cancellation and image offload are control events, not necessarily product failures. No login credentials, account labels, login commands, proxy configuration or original image paths are read. Text redaction is limited; inspect every file and screenshot before sharing. Screenshot pixels and manually supplied conversation exports may contain private content. This report does not guarantee a root cause or a complete historical record.\n') })
        const manifest = { schemaVersion: 1, reportId: id, exportedAt: at, region, files: [] }
        for (const file of files) {
          const bytes = typeof file.data === 'string' ? encoder.encode(file.data) : file.data
          const hash = await crypto.subtle.digest('SHA-256', bytes)
          manifest.files.push({ path: file.name, bytes: bytes.length, sha256: Array.from(new Uint8Array(hash), b => b.toString(16).padStart(2, '0')).join('') })
        }
        files.push({ name: 'manifest.json', data: JSON.stringify(manifest, null, 2) })
        return { name: `dsh-codebuddy-feedback-${region}-${at.slice(0, 10)}-${id}.zip`, files, manifest, gaps, document }
      }
      return { validate, prepare, archive, redact, logs, safeStatus, inspectImage, importLogs }
    }

    const feedbackZh = {
      // 由 locales/feedback.zh.json 生成，请勿手改；改词表请改该 JSON 后运行 node scripts/build-client-locales.mjs
      "feedbackTierrequired": "必填",
      "feedbackTierrecommended": "最好填（可展开补充）",
      "feedbackTieroptional": "可选（可展开补充）",
      "feedbackLogSource": "日志与诊断（自动获取）",
      "feedbackAutoLoading": "正在自动读取当前区域日志，不影响填写问题…",
      "feedbackAutoReady": "已自动获取当前区域日志；生成时会再读取最新快照，不需要选择本地日志。",
      "feedbackReplaceLogs": "使用本地诊断 JSON 替换（可选）",
      "feedbackLocalNote": "仅接受插件导出的诊断 JSON，最大 4 MiB。不会合并到自动日志；替换前会检查内容及区域。普通对话导出或工具日志请放在文字补充附件中。",
      "feedbackLocalConfirm": "此旧日志未记录区域；我确认它来自当前所选区域。",
      "feedbackLocalPreview": "待替换的诊断记录数：",
      "feedbackApplyLocal": "应用本地日志替换",
      "feedbackLocalActive": "当前使用手动替换的本地日志，不会混入自动日志。",
      "feedbackUseAuto": "恢复自动获取日志",
      "feedbackLocalFailed": "无法读取此文件：请选择有效的插件诊断 JSON（最大 4 MiB），不接受凭据文件。原日志来源保持不变。",
      "feedbackLocalWrongRegion": "这份日志标记的区域与当前页面不一致，已拒绝替换。",
      "feedbackEventSearch": "搜索时间、模型、错误或诊断 ID",
      "feedbackShowAll": "显示成功、取消与其他记录",
      "feedbackNoEvents": "没有符合条件的诊断记录。",
      "feedbackLogTools": "日志工具：查看、导出与失败采集（可选）",
      "feedbackLogToolsNote": "这些工具操作当前区域正在运行的插件日志，不会修改导入的本地文件。",
      "feedbackTitle": "问题反馈与取证包",
      "feedbackIntro": "填写问题经过并附上错误前后的上下文截图，生成 ZIP 后自行保存。不会自动上传或发送消息；本页草稿只在当前页面内存中保留。",
      "feedbackPrivacy": "请先遮挡截图中的密钥、手机号、私人消息等内容。导出时会移除截图文件元数据并尝试遮盖常见文本密钥，但无法自动识别所有隐私，尤其是图片中的文字。不要上传登录二维码、验证码、恢复码或凭据文件。",
      "feedbackRefresh": "刷新自动日志",
      "feedbackEvent": "选择对应调用（请核对时间、模型和诊断 ID）",
      "feedbackEventNone": "手动填写诊断 ID / 无对应记录",
      "feedbackReady": "诊断快照已获取。其他调用仅为上下文，不会当作同一次故障。",
      "feedbackNoLogs": "未能读取诊断服务，可继续反馈；包内将注明证据缺失。",
      "feedbacktitle": "问题简述（至少 6 个字）",
      "feedbackoccurredAt": "问题发生时间（本地时间）",
      "feedbackdshVersion": "DSH 版本（在“关于”中查看；无法查看请写未知）",
      "feedbackmodel": "出错会话选择的模型与区域",
      "feedbacksessionId": "DSH 会话 ID（如果有）",
      "feedbackdiagnosticId": "报错中的 diagnostic-id（如果有）",
      "feedbackmissingReason": "缺少 ID 或其他材料的原因",
      "feedbacksteps": "复现步骤（从什么状态，做了什么）",
      "feedbackexpected": "预期结果",
      "feedbackactual": "实际结果（至少 5 个字）",
      "feedbackerrorText": "完整报错原文（无报错请注明；不要只写“失败”）",
      "feedbacktool": "涉及的工具/插件名称，以及是否已执行（不涉及请写无）",
      "feedbackcontext": "前后文补充：长历史/图片数量与来源、工作区、是否换模型或账号等；不要粘贴密钥",
      "feedbackfrequency": "出现频率及同样操作能否复现",
      "feedbacknetwork": "网络/代理使用情况（不知道请写未知，不要提供代理密码）",
      "feedbackworkaround": "已尝试的方法及其结果（可选）",
      "feedbackRequired": "红色圆点：必填，简述、实际结果和截图。黄色圆点：最好填；灰色圆点：可选，后两类留空也能生成。日志会自动获取，无需先选本地文件。",
      "feedbackBasics": "1. 定位问题",
      "feedbackStory": "2. 经过与上下文",
      "feedbackEvidence": "3. 截图与补充材料",
      "feedbackReviewStep": "4. 预览并生成反馈包",
      "feedbackScreenshots": "上下文截图（必需，1–6 张；错误位置及前后消息）",
      "feedbackScreenshotNote": "PNG / JPEG / WebP，每张原文件及转换后的 PNG 均不超过 5 MiB，合计不超过 20 MiB，单张不超过 1600 万像素。请在上传前自行打码。",
      "feedbackRemove": "移除",
      "feedbackImageFailed": "截图无效或超过限制。请裁剪、缩小或另存为 PNG/JPEG/WebP 后重新选择。",
      "feedbackAttachments": "追加已脱敏的 DSH 对话导出 / 工具日志（可选）",
      "feedbackAttachmentNote": "最多 3 个 txt/md/json/log 文本文件，合计 4 MiB。请仅选择相关片段；不得选择认证配置或凭据文件。它们不会被当作插件自动验证的事实。",
      "feedbackAttachmentFailed": "补充文件无效、不是 UTF-8 文本或超过限制，请重新选择。",
      "feedbackDetail": "附加此前主动采集的原始失败回复（可能包含私人内容）",
      "feedbackDetailNote": "默认只含普通诊断。不自动开启采集；如需原始回复，在本页展开“日志工具”阅读说明并开启一次失败采集，再安全复现。含图片请求的原始回复始终不采集。",
      "feedbackPrepare": "检查材料并预览反馈包",
      "feedbackBusy": "正在整理材料…",
      "feedbackInvalid": "请补全或检查：",
      "feedbackFailure": "反馈包生成失败；草稿仍保留。请检查材料大小后重试，或手动导出普通日志。",
      "feedbackPreview": "反馈包预览（用户补充与自动证据分开保存）",
      "feedbackGaps": "仍缺少的证据 / 注意事项",
      "feedbackConsent": "我已检查以下文本内容、全部截图及补充文件，确认可分享；自动脱敏不保证覆盖所有隐私。",
      "feedbackDownload": "生成并下载反馈 ZIP",
      "feedbackDownloaded": "已发起 ZIP 下载（保存位置由浏览器或 DSH 决定）。请确认文件已保存。",
      "feedbackNoMatch": "此诊断 ID 未匹配到当前区域日志；不会用其他记录替代。",
      "feedbackReadOnly": "运行配置尚未就绪，反馈仍可填写；自动配置证据可能缺失。",
      "feedbackPreviewNote": "下载使用此次预览时冻结的证据。修改描述、材料或采集选项会要求重新预览。截图与补充文件请逐一检查。",
      "feedbackFileList": "包内文件与 SHA-256 校验",
      "feedbackRegion": "反馈区域：",
      "feedbackDraftConfig": "有未保存的配置草稿。反馈包只记录运行配置，不会把草稿当成实际配置。"
    }
    const feedbackEn = {
      // 由 locales/feedback.en.json 生成，请勿手改；改词表请改该 JSON 后运行 node scripts/build-client-locales.mjs
      "feedbackTierrequired": "Required",
      "feedbackTierrecommended": "Recommended (expand to add)",
      "feedbackTieroptional": "Optional (expand to add)",
      "feedbackLogSource": "Logs and diagnostics (automatic)",
      "feedbackAutoLoading": "Reading this region’s logs automatically. You can keep writing…",
      "feedbackAutoReady": "Current-region logs loaded automatically; a fresh snapshot is read at export. No local file is needed.",
      "feedbackReplaceLogs": "Replace with local diagnostic JSON (optional)",
      "feedbackLocalNote": "Plugin diagnostic exports only, up to 4 MiB. The replacement is validated and never merged with automatic logs. Add conversation exports or tool logs as text supplements instead.",
      "feedbackLocalConfirm": "This legacy file has no region metadata. I confirm it belongs to the selected region.",
      "feedbackLocalPreview": "Diagnostic entries ready to replace: ",
      "feedbackApplyLocal": "Apply local log replacement",
      "feedbackLocalActive": "Using manually replaced local logs; automatic logs are not mixed in.",
      "feedbackUseAuto": "Restore automatic logs",
      "feedbackLocalFailed": "Invalid plugin diagnostic JSON, credential file or size over 4 MiB. The previous log source is unchanged.",
      "feedbackLocalWrongRegion": "This log declares a different region; replacement was rejected.",
      "feedbackEventSearch": "Search time, model, error or diagnostic ID",
      "feedbackShowAll": "Show successes, cancellations and other records",
      "feedbackNoEvents": "No matching diagnostic records.",
      "feedbackLogTools": "Log tools: view, export and failure capture (optional)",
      "feedbackLogToolsNote": "These tools operate on the running region’s diagnostics, not on imported files.",
      "feedbackTitle": "Issue report and evidence bundle",
      "feedbackIntro": "Describe the issue and attach screenshots showing the error and surrounding messages. Download the ZIP and save it. Nothing is uploaded or messaged automatically. Drafts exist only in this page’s memory.",
      "feedbackPrivacy": "Mask secrets and private information in screenshots first. Screenshot metadata is removed and common text secrets are masked on a best-effort basis. Image pixels are not automatically redacted. Never attach login QR codes, verification or recovery codes, or credential files.",
      "feedbackRefresh": "Refresh automatic logs",
      "feedbackEvent": "Select the matching call (check time, model and ID)",
      "feedbackEventNone": "Enter diagnostic ID manually / no matching record",
      "feedbackReady": "Diagnostic snapshot loaded. Other calls are context only, not the same incident.",
      "feedbackNoLogs": "Diagnostics are unavailable. You can still report; the bundle will record the evidence gap.",
      "feedbacktitle": "Issue summary (at least 6 characters)",
      "feedbackoccurredAt": "When it happened (local time)",
      "feedbackdshVersion": "DSH version (About; enter unknown if unavailable)",
      "feedbackmodel": "Model and region selected in the failed conversation",
      "feedbacksessionId": "DSH session ID, if available",
      "feedbackdiagnosticId": "Diagnostic ID from the error, if available",
      "feedbackmissingReason": "Why an ID or other evidence is unavailable",
      "feedbacksteps": "Reproduction steps",
      "feedbackexpected": "Expected result",
      "feedbackactual": "Actual result (at least 5 characters)",
      "feedbackerrorText": "Full error text (state no error if none)",
      "feedbacktool": "Tool/plugin names and whether they already executed (or none)",
      "feedbackcontext": "Context: long history, image count and sources, workspace, model/account changes. Do not paste secrets.",
      "feedbackfrequency": "Frequency and reproducibility",
      "feedbacknetwork": "Network/proxy use (or unknown; no proxy passwords)",
      "feedbackworkaround": "Attempts and results (optional)",
      "feedbackRequired": "Red dot: required -- summary, actual result and screenshots. Yellow dot: recommended. Grey dot: optional. Only required fields block export. Logs are collected automatically.",
      "feedbackBasics": "1. Identify the incident",
      "feedbackStory": "2. Steps and context",
      "feedbackEvidence": "3. Screenshots and supplements",
      "feedbackReviewStep": "4. Review and create the bundle",
      "feedbackScreenshots": "Context screenshots (required, 1–6)",
      "feedbackScreenshotNote": "PNG/JPEG/WebP. Each source and converted PNG: at most 5 MiB; total: 20 MiB; at most 16 million pixels per image. Mask private pixels before attaching.",
      "feedbackRemove": "Remove",
      "feedbackImageFailed": "Invalid or oversized image. Resize/crop or save as PNG/JPEG/WebP and select again.",
      "feedbackAttachments": "Attach redacted DSH conversation exports / tool logs (optional)",
      "feedbackAttachmentNote": "Up to 3 UTF-8 txt/md/json/log files, 4 MiB total. Related excerpts only; no credential files. These are user-supplied evidence, not automatically verified facts.",
      "feedbackAttachmentFailed": "Invalid, oversized or non-UTF-8 text attachment. Please select again.",
      "feedbackDetail": "Include previously captured raw failure replies (may contain private content)",
      "feedbackDetailNote": "Basic diagnostics only by default. Capture is never enabled automatically. Use this page’s Log tools to arm a single failure capture before a safe reproduction if needed. Raw replies for image requests remain excluded.",
      "feedbackPrepare": "Check materials and preview bundle",
      "feedbackBusy": "Preparing evidence…",
      "feedbackInvalid": "Complete or check: ",
      "feedbackFailure": "Could not create the bundle. Your draft remains. Check sizes and retry, or export basic logs.",
      "feedbackPreview": "Bundle preview (user descriptions and automatic evidence are separated)",
      "feedbackGaps": "Evidence gaps / limitations",
      "feedbackConsent": "I reviewed all text, screenshots and supplements and agree to share them. Automatic redaction may miss private content.",
      "feedbackDownload": "Create and download feedback ZIP",
      "feedbackDownloaded": "ZIP download requested; the browser or DSH controls where it is saved. Confirm it was saved.",
      "feedbackNoMatch": "This ID is not in this region’s logs. Other calls will not be substituted.",
      "feedbackReadOnly": "Runtime configuration is not ready. You can still report; configuration evidence may be missing.",
      "feedbackPreviewNote": "The download uses the evidence frozen for this preview. Editing the description, materials or capture option requires a new preview. Inspect all screenshots and supplements.",
      "feedbackFileList": "Included files and SHA-256 checksums",
      "feedbackRegion": "Report region: ",
      "feedbackDraftConfig": "Unsaved configuration draft exists. The bundle records the runtime configuration, not the draft."
    }
    const feedbackKit = createFeedbackKit()
    function IssueFeedback({ t, region, statusUrl, diagnosticsUrl, config, dirty, active = true, logTools }) {
      const [form, setForm] = React.useState({})
      const [pictures, setPictures] = React.useState([])
      const [attachments, setAttachments] = React.useState([])
      const [detailed, setDetailed] = React.useState(false)
      const [busy, setBusy] = React.useState(false)
      const [message, setMessage] = React.useState('')
      const [available, setAvailable] = React.useState(null)
      const [logLoading, setLogLoading] = React.useState(false)
      const [localReport, setLocalReport] = React.useState(null)
      const [localCandidate, setLocalCandidate] = React.useState(null)
      const [localConfirmed, setLocalConfirmed] = React.useState(false)
      const [eventSearch, setEventSearch] = React.useState('')
      const [showAllEvents, setShowAllEvents] = React.useState(false)
      const logSequence = React.useRef(0)
      const [prepared, setPrepared] = React.useState(null)
      const [consent, setConsent] = React.useState(false)
      const lock = React.useRef(false)
      const urls = React.useRef(new Set())
      React.useEffect(() => () => { for (const url of urls.current) URL.revokeObjectURL(url) }, [])
      const invalidate = () => { setPrepared(null); setConsent(false); setMessage('') }
      const edit = (key, value) => { invalidate(); setForm(old => ({ ...old, [key]: value })) }
      const getJson = async (url, detail = false) => {
        const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 15000)
        try {
          const response = await fetch(url, { signal: controller.signal, cache: 'no-store', ...(detail ? { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' }, body: JSON.stringify({ action: 'exportDetailedLogs' }) } : {}) })
          if (!response.ok) throw Error('unavailable')
          return await response.json()
        } finally { clearTimeout(timeout) }
      }
      const refresh = async (manual = true) => {
        const sequence = ++logSequence.current
        setLogLoading(true)
        if (manual) invalidate()
        try {
          const result = await getJson(diagnosticsUrl)
          if (!Array.isArray(result?.entries)) throw Error('invalid diagnostic report')
          if (sequence !== logSequence.current) return
          setAvailable(feedbackKit.logs(result, false)); setMessage(t('feedbackReady'))
        } catch { if (sequence === logSequence.current) { setAvailable(null); setMessage(t('feedbackNoLogs')) } }
        finally { if (sequence === logSequence.current) setLogLoading(false) }
      }
      React.useEffect(() => {
        if (active && !localReport) void refresh(false)
        return () => { logSequence.current++ }
      }, [active, localReport, diagnosticsUrl])
      const chooseLocalLog = async event => {
        const file = event.target.files?.[0]; event.target.value = ''
        if (!file || lock.current) return
        lock.current = true; setBusy(true); invalidate(); setLocalCandidate(null); setLocalConfirmed(false)
        try {
          if (!/\.json$/iu.test(file.name) || /^(?:auth|credentials?|tokens?|cookies?|secrets?)(?:[._-]|$)/iu.test(file.name) || file.size > 4 * 1024 * 1024) throw Error('log-file')
          const text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer())
          setLocalCandidate(feedbackKit.importLogs(text, region))
        } catch (error) { setMessage(t(error.message === 'log-region' ? 'feedbackLocalWrongRegion' : 'feedbackLocalFailed')) }
        finally { lock.current = false; setBusy(false) }
      }
      const useLocalLog = () => {
        if (!localCandidate || !localCandidate.regionVerified && !localConfirmed) return
        logSequence.current++; setLogLoading(false); invalidate()
        setLocalReport(localCandidate); setAvailable(feedbackKit.logs(localCandidate.report, false)); setLocalCandidate(null)
      }
      const useAutomaticLog = () => {
        invalidate(); setLocalCandidate(null)
        if (localReport) setLocalReport(null)
        else void refresh()
      }
      const choosePictures = async event => {
        const files = Array.from(event.target.files || []); event.target.value = ''
        if (!files.length || lock.current) return
        invalidate(); lock.current = true; setBusy(true)
        const added = []
        try {
          if (pictures.length + files.length > 6 || files.reduce((s, f) => s + f.size, 0) > 20 * 1024 * 1024) throw Error('size')
          for (const file of files) {
            if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) throw Error('image')
            feedbackKit.inspectImage(new Uint8Array(await file.arrayBuffer()), file.type)
            const bitmap = await createImageBitmap(file)
            let png
            try {
              if (bitmap.width * bitmap.height > 16000000 || Math.max(bitmap.width, bitmap.height) > 8192) throw Error('dimensions')
              const canvas = document.createElement('canvas'); canvas.width = bitmap.width; canvas.height = bitmap.height
              const context = canvas.getContext('2d'); if (!context) throw Error('canvas')
              context.drawImage(bitmap, 0, 0)
              png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
            } finally { bitmap.close() }
            if (!png || png.size > 5 * 1024 * 1024) throw Error('converted size')
            const bytes = new Uint8Array(await png.arrayBuffer()), url = URL.createObjectURL(png)
            urls.current.add(url); added.push({ bytes, url })
          }
          if ([...pictures, ...added].reduce((s, f) => s + f.bytes.length, 0) > 20 * 1024 * 1024) throw Error('total')
          setPictures(old => [...old, ...added])
        } catch { for (const item of added) { URL.revokeObjectURL(item.url); urls.current.delete(item.url) } setMessage(t('feedbackImageFailed')) }
        finally { lock.current = false; setBusy(false) }
      }
      const chooseAttachments = async event => {
        const files = Array.from(event.target.files || []); event.target.value = ''
        if (!files.length || lock.current) return
        invalidate(); lock.current = true; setBusy(true)
        try {
          if (attachments.length + files.length > 3 || files.reduce((s, f) => s + f.size, 0) > 4 * 1024 * 1024) throw Error('size')
          const added = []
          for (const file of files) {
            if (!/\.(txt|md|json|log)$/iu.test(file.name) || /^(?:auth|credentials?|tokens?|cookies?|secrets?)(?:[._-]|$)/iu.test(file.name) || file.size > 4 * 1024 * 1024) throw Error('type')
            const text = new TextDecoder('utf-8', { fatal: true }).decode(await file.arrayBuffer())
            if (text.includes('\0')) throw Error('binary')
            added.push({ text })
          }
          if ([...attachments, ...added].reduce((s, x) => s + new TextEncoder().encode(x.text).length, 0) > 4 * 1024 * 1024) throw Error('total')
          setAttachments(old => [...old, ...added])
        } catch { setMessage(t('feedbackAttachmentFailed')) }
        finally { lock.current = false; setBusy(false) }
      }
      const prepare = async () => {
        if (lock.current) return
        const invalid = feedbackKit.validate(form, pictures)
        if (invalid) { setMessage(t('feedbackInvalid') + t(invalid === 'screenshots' ? 'feedbackScreenshots' : 'feedback' + invalid)); return }
        lock.current = true; setBusy(true); invalidate()
        try {
          const [logResult, statusResult] = await Promise.allSettled([localReport ? Promise.resolve(localReport.report) : getJson(diagnosticsUrl, detailed), getJson(statusUrl)])
          const report = logResult.status === 'fulfilled' && Array.isArray(logResult.value?.entries) ? logResult.value : null
          if (report) setAvailable(feedbackKit.logs(report, false))
          const next = await feedbackKit.prepare({ form, pictures, attachments, detailed, report, region, config, logSource: localReport ? 'local-file' : 'automatic', localRegionConfirmed: !!localReport, logRegionEvidence: localReport ? localReport.regionVerified ? 'file-metadata' : 'user-confirmed' : 'none', status: statusResult.status === 'fulfilled' ? statusResult.value : null,
            browser: { userAgent: navigator.userAgent, language: navigator.language, timezone: Intl.DateTimeFormat().resolvedOptions().timeZone, utcOffset: String(new Date().getTimezoneOffset()) } })
          setPrepared(next)
          if (!report) setMessage(t('feedbackNoLogs'))
          else if (form.diagnosticId && next.document.automatic.diagnosticMatch !== 'exact-id') setMessage(t('feedbackNoMatch'))
        } catch { setMessage(t('feedbackFailure')) }
        finally { lock.current = false; setBusy(false) }
      }
      const download = async () => {
        if (lock.current || !prepared || !consent) return
        lock.current = true; setBusy(true)
        try {
          const blob = await feedbackKit.archive(prepared.files), url = URL.createObjectURL(blob)
          urls.current.add(url)
          const anchor = document.createElement('a'); anchor.href = url; anchor.download = prepared.name
          document.body.appendChild(anchor); anchor.click(); anchor.remove()
          setTimeout(() => { URL.revokeObjectURL(url); urls.current.delete(url) }, 60000)
          setMessage(t('feedbackDownloaded'))
        } catch { setMessage(t('feedbackFailure')) }
        finally { lock.current = false; setBusy(false) }
      }
      const required = new Set(['title', 'actual'])
      const recommended = new Set(['steps', 'expected', 'errorText', 'occurredAt', 'dshVersion', 'model', 'sessionId', 'diagnosticId', 'tool', 'context', 'frequency'])
      // Priority is a small coloured dot, not a literal '#'. The hash used to be
      // rendered as UI text, which read like a stray markdown symbol and put a
      // "# " prefix in front of every field title.
      const mark = tier => h('span', { 'data-feedback-priority': tier, title: t('feedbackTier' + tier), 'aria-hidden': true, style: { flex: '0 0 auto', width: 7, height: 7, borderRadius: 999, background: tier === 'required' ? '#d84444' : tier === 'recommended' ? '#b77900' : 'rgba(127,127,127,.55)', marginRight: 7 } })
      const field = (key, multiline = false) => h('label', { key, style: { display: 'grid', gap: 6 } },
        h('span', null, mark(required.has(key) ? 'required' : recommended.has(key) ? 'recommended' : 'optional'), t('feedback' + key)),
        h(multiline ? 'textarea' : 'input', { 'aria-label': t('feedback' + key), value: form[key] || '', disabled: busy, type: key === 'occurredAt' ? 'datetime-local' : 'text', rows: multiline ? 3 : undefined, required: required.has(key), maxLength: key === 'context' || key === 'errorText' ? 16000 : key === 'steps' || key === 'actual' ? 8000 : key === 'title' ? 160 : key === 'expected' ? 4000 : 2000, onChange: e => edit(key, e.target.value), style: { ...inputStyle(), resize: 'vertical', width: '100%', minWidth: 0 } }))
      const selectedEvent = form.diagnosticId ? available?.entries?.find(x => x.id?.toLowerCase() === form.diagnosticId.toLowerCase()) : null
      const events = (available?.entries || []).slice().reverse().filter(x => x.id)
      const failures = events.filter(x => x.state === 'error' && !x.controlClass && !x.cancelled && !x.offloadImagesRequested)
      const visibleEvents = (showAllEvents || !failures.length ? events : failures).filter(x => `${x.id} ${x.model} ${x.errorCode} ${x.at ? new Date(x.at).toLocaleString() : ''}`.toLowerCase().includes(eventSearch.toLowerCase()))
      const selectEvent = entry => {
        invalidate(); setForm(old => ({ ...old, diagnosticId: entry?.id || '', ...(entry?.model ? { model: entry.model } : {}), ...(Number.isSafeInteger(entry?.at) ? { occurredAt: new Date(entry.at - new Date(entry.at).getTimezoneOffset() * 60000).toISOString().slice(0, 16) } : {}) }))
      }
      return h('div', { style: { display: 'grid', gap: 16, color: 'var(--dsw-alias-label-primary, inherit)' } },
        h(SectionHeading, { kind: 'feedback', hint: h(Hint, { label: t('hintShow') }, t('feedbackIntro')) }, t('feedbackTitle')),
        h('div', { style: { display: 'grid', gap: 4, justifyItems: 'start' } }, ...['required', 'recommended', 'optional'].map(tier => h('span', { key: tier, style: { display: 'inline-flex', alignItems: 'center', fontSize: 12, color: T_MUTED } }, mark(tier), t('feedbackTier' + tier)))),
        h('div', { style: { ...rowStyle, gap: 6 } }, h(Hint, { label: t('hintShow') }, t('feedbackRequired')), h(Notice, null, t('feedbackRegion') + t(region))), dirty ? h(Notice, null, t('feedbackDraftConfig')) : null,
        h('section', { 'aria-label': t('feedbackLogSource'), style: sectionStyle() }, h('strong', null, t('feedbackLogSource')),
          h('div', { role: 'status' }, localReport ? t('feedbackLocalActive') : logLoading ? t('feedbackAutoLoading') : available ? t('feedbackAutoReady') : t('feedbackNoLogs')),
          h('div', { style: rowStyle }, h('button', { type: 'button', disabled: busy || logLoading, style: buttonStyle, onClick: useAutomaticLog }, t(localReport ? 'feedbackUseAuto' : 'feedbackRefresh'))),
          h('details', null, h('summary', { style: { cursor: 'pointer' } }, mark('optional'), t('feedbackReplaceLogs')),
            h(Hint, { label: t('hintShow') }, t('feedbackLocalNote')), h('input', { type: 'file', accept: '.json', disabled: busy, 'aria-label': t('feedbackReplaceLogs'), onChange: chooseLocalLog, style: { maxWidth: '100%', marginTop: 8 } }),
            localCandidate ? h('div', { style: { display: 'grid', gap: 8, marginTop: 12 } }, h(Notice, null, t('feedbackLocalPreview') + localCandidate.report.entries.length),
              h('pre', { style: { ...inputStyle(), maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, feedbackKit.redact(JSON.stringify(feedbackKit.logs(localCandidate.report, false), null, 2))),
              !localCandidate.regionVerified ? h('label', { style: rowStyle }, h('input', { type: 'checkbox', checked: localConfirmed, onChange: e => setLocalConfirmed(e.target.checked) }), t('feedbackLocalConfirm')) : null,
              h('button', { type: 'button', disabled: busy || !localCandidate.regionVerified && !localConfirmed, style: buttonStyle, onClick: useLocalLog }, t('feedbackApplyLocal'))) : null),
          h('details', null, h('summary', { style: { cursor: 'pointer', overflowWrap: 'anywhere' } }, mark('recommended'), t('feedbackEvent'), ' · ', selectedEvent ? `${selectedEvent.model || '?'} / ${selectedEvent.errorCode || selectedEvent.state}` : t('feedbackEventNone')),
            h('div', { style: { display: 'grid', gap: 10, marginTop: 12 } },
              h('input', { type: 'search', value: eventSearch, 'aria-label': t('feedbackEventSearch'), placeholder: t('feedbackEventSearch'), onChange: e => setEventSearch(e.target.value), style: inputStyle() }),
              h('label', { style: rowStyle }, h('input', { type: 'checkbox', checked: showAllEvents, onChange: e => setShowAllEvents(e.target.checked) }), t('feedbackShowAll')),
              h('button', { type: 'button', disabled: busy, style: buttonStyle, onClick: () => selectEvent(null) }, t('feedbackEventNone')),
              h('ul', { 'aria-label': t('feedbackEvent'), style: { margin: 0, padding: 0, listStyle: 'none', maxHeight: 280, overflowY: 'auto', border: '1px solid var(--dsw-alias-border-primary, rgba(127,127,127,.4))', borderRadius: 8, background: 'var(--dsw-alias-background-primary, transparent)', color: 'var(--dsw-alias-label-primary, inherit)' } },
                ...visibleEvents.map(entry => h('li', { key: entry.id }, h('button', { type: 'button', disabled: busy, 'aria-pressed': selectedEvent?.id === entry.id, onClick: () => selectEvent(entry), style: { ...buttonStyle, borderRadius: 0, border: 'none', borderBottom: '1px solid var(--dsw-alias-border-primary, rgba(127,127,127,.2))', width: '100%', textAlign: 'left', display: 'grid', gap: 4, whiteSpace: 'normal', overflowWrap: 'anywhere', color: 'var(--dsw-alias-label-primary, inherit)', background: selectedEvent?.id === entry.id ? 'rgba(59,130,246,.18)' : 'transparent' } },
                  h('span', null, `${entry.at ? new Date(entry.at).toLocaleString() : '?'} · ${entry.model || '?'} · ${entry.errorCode || entry.state}`), h('code', { style: { fontSize: 12 } }, entry.id)))),
                !visibleEvents.length ? h('li', { style: { padding: 12 } }, t('feedbackNoEvents')) : null))),
          logTools ? h('details', null, h('summary', { style: { cursor: 'pointer' } }, mark('optional'), t('feedbackLogTools')), h('div', { style: { display: 'grid', gap: 12, marginTop: 12 } }, h(Hint, { label: t('hintShow') }, t('feedbackLogToolsNote')), logTools)) : null),
        h('h4', { style: { margin: '12px 0 0' } }, mark('required'), t('feedbackTierrequired')),
        field('title'), field('actual', true),
        h('label', null, mark('required'), t('feedbackScreenshots'), h('input', { type: 'file', multiple: true, required: true, accept: 'image/png,image/jpeg,image/webp', disabled: busy, onChange: choosePictures, 'aria-label': t('feedbackScreenshots'), style: { display: 'block', maxWidth: '100%', marginTop: 8 } })), h('div', { style: { ...rowStyle, gap: 6 } }, h(Hint, { label: t('hintShow') }, [t('feedbackScreenshotNote'), t('feedbackPrivacy')].join(' '))),

        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: 12 } }, ...pictures.map((item, i) => h('div', { key: item.url, style: sectionStyle() }, h('a', { href: item.url, target: '_blank', rel: 'noreferrer' }, h('img', { src: item.url, alt: `Context ${i + 1}`, style: { width: '100%', maxHeight: 260, objectFit: 'contain' } })), h('button', { type: 'button', disabled: busy, style: buttonStyle, onClick: () => { invalidate(); setPictures(old => old.filter(x => x !== item)); URL.revokeObjectURL(item.url); urls.current.delete(item.url) } }, t('feedbackRemove'))))),
        h('details', { style: sectionStyle() }, h('summary', { style: { cursor: 'pointer', fontWeight: 650 } }, mark('recommended'), t('feedbackTierrecommended')),
          h('div', { style: { display: 'grid', gap: 14, marginTop: 12 } }, ...['steps', 'expected', 'errorText', 'occurredAt', 'dshVersion', 'model', 'sessionId', 'diagnosticId', 'tool', 'context', 'frequency'].map(key => field(key, ['steps', 'expected', 'errorText', 'tool', 'context'].includes(key))))),
        h('details', { style: sectionStyle() }, h('summary', { style: { cursor: 'pointer', fontWeight: 650 } }, mark('optional'), t('feedbackTieroptional')),
          h('div', { style: { display: 'grid', gap: 14, marginTop: 12 } }, ...['missingReason', 'network', 'workaround'].map(key => field(key, true)),
        h('label', null, mark('optional'), t('feedbackAttachments'), h('input', { type: 'file', multiple: true, accept: '.txt,.md,.json,.log', disabled: busy, onChange: chooseAttachments, 'aria-label': t('feedbackAttachments'), style: { display: 'block', maxWidth: '100%', marginTop: 8 } })), h(Hint, { label: t('hintShow') }, t('feedbackAttachmentNote')),
        ...attachments.map((item, i) => h('div', { key: i }, h('details', null, h('summary', null, `context-${i + 1}.txt`), h('pre', { style: { ...inputStyle(), whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: 240, overflow: 'auto' } }, feedbackKit.redact(item.text))), h('button', { type: 'button', disabled: busy, style: buttonStyle, onClick: () => { invalidate(); setAttachments(old => old.filter((_, j) => j !== i)) } }, t('feedbackRemove')))),
        mark('optional'), h(Hint, { label: t('hintShow') }, t('feedbackDetailNote')), h('label', { style: rowStyle }, h('input', { type: 'checkbox', checked: detailed, disabled: busy, onChange: e => { invalidate(); setDetailed(e.target.checked) } }), t('feedbackDetail')))),
        h('h4', { style: { margin: '12px 0 0' } }, t('feedbackReviewStep')),
        h('button', { type: 'button', disabled: busy, style: buttonStyle, onClick: prepare }, t(busy ? 'feedbackBusy' : 'feedbackPrepare')),
        message ? h('div', { role: 'status', 'aria-live': 'polite', style: { whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, message) : null,
        prepared ? h('section', { 'aria-label': t('feedbackPreview'), style: { ...sectionStyle(), minWidth: 0 } }, h('h4', null, t('feedbackPreview')), h(Notice, null, t('feedbackPreviewNote')),
          h('h4', null, t('feedbackGaps')), h('ul', null, ...prepared.gaps.map((gap, i) => h('li', { key: i, style: { overflowWrap: 'anywhere' } }, gap))),
          h('details', { open: true }, h('summary', null, t('feedbackFileList')), h('ul', { style: { paddingLeft: 20 } }, ...prepared.manifest.files.map(file => h('li', { key: file.path, style: { overflowWrap: 'anywhere', fontSize: 12 } }, `${file.path} · ${file.bytes} bytes · SHA256 ${file.sha256}`)))),
          ...prepared.files.filter(file => typeof file.data === 'string').map(file => h('details', { key: file.name }, h('summary', null, file.name), h('pre', { style: { ...inputStyle(), whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', overflow: 'auto', maxHeight: 320, fontSize: 12 } }, file.data))),
          h('label', { style: { display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12 } }, h('input', { type: 'checkbox', checked: consent, disabled: busy, onChange: e => setConsent(e.target.checked) }), t('feedbackConsent')),
          h('button', { type: 'button', disabled: busy || !consent, style: { ...buttonStyle, marginTop: 12 }, onClick: download }, t('feedbackDownload'))) : null)
    }

    const groups = ['connection', 'models', 'accounts', 'usage', 'logs']
    const iconPaths = {
      connection: 'M8 3v4m8-4v4M6 7h12v3a6 6 0 0 1-12 0V7m6 9v5',
      models: 'm12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5',
      accounts: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2m20 0v-2a4 4 0 0 0-3-3.87M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8m8 .13a4 4 0 0 1 0 7.75',
      usage: 'M4 20h16M7 16V9m5 7V4m5 12v-5',
      feedback: 'M21 11a8 8 0 0 1-8 8H7l-4 3V9a7 7 0 0 1 7-7h3a8 8 0 0 1 8 9ZM8 8h8M8 12h5',
      diagnostics: 'M8 3h8l4 4v14H4V3h4m8 0v5h4M8 12h8m-8 4h5',
      logs: 'M4 6h16M4 12h10M4 18h7',
      help: 'M12 17h.01M9 9a3 3 0 0 1 6 0c0 2-3 2-3 4M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20'
    }
    // ---- 3. view components ----
    function Icon({ kind = 'connection', size = 18 }) {
      return h('svg', { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, focusable: false }, h('path', { d: iconPaths[kind] }))
    }
    // `hint` is an inline explanation glyph rendered on the same line as the
    // heading title. Explanations must never occupy a line of their own -- a
    // lone icon floating in a grid row is exactly what looked broken before --
    // so every section-level note is passed in here instead of as a sibling.
    function SectionHeading({ kind, children, hint, actions }) {
      // Rendered as the mockup's card header bar: it pulls itself over the card
      // padding, draws a single bottom rule and keeps the explanation glyph on the
      // title line. Every section gets the header for free.
      return h('h3', { style: { margin: '-16px -16px 0', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: T_TEXT, borderBottom: `1px solid ${T_LINE}`, flexWrap: 'wrap' } }, h(Icon, { kind, size: 15 }), children, hint ?? null,
        actions ? h('span', { style: { marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 } }, actions) : null)
    }
    function SettingsSection({ active, group, children, style, ...props }) {
      return h('section', { ...props, hidden: active !== group, 'data-settings-group': group, style: { ...style, minWidth: 0, ...(active !== group ? { display: 'none' } : {}) } }, children)
    }
    function SettingsDetails({ active, group, ...props }) {
      return h('div', { hidden: active !== group, style: { display: active === group ? 'block' : 'none', minWidth: 0 } }, h('details', props))
    }
    function SettingsLauncher({ t, openPage, view }) {
      if (view === 'summary') return t('intro')
      return h('div', { style: { ...rowStyle, margin: 16, padding: 12, border: '1px solid var(--dsw-alias-border-primary, rgba(127,127,127,.25))', borderRadius: 12 } }, h(Hint, { label: t('hintShow') }, t('pageEntryHint')),
        h('button', { type: 'button', style: buttonStyle, onClick: openPage }, t('openPage')))
    }

    function Segmented({ options, value, onChange, disabled, ariaLabel }) {
      return h('div', { role: 'group', 'aria-label': ariaLabel, style: { display: 'inline-flex', alignItems: 'center', background: T_SOFT, borderRadius: 10, padding: 3, gap: 2, flexWrap: 'wrap' } },
        ...options.map((opt) => {
          const on = opt.value === value
          return h('button', {
            key: opt.value,
            type: 'button',
            disabled: disabled || opt.disabled,
            'aria-pressed': on,
            onClick: () => onChange(opt.value),
            style: {
              border: 0,
              background: on ? 'var(--dsw-alias-background-primary, Canvas)' : 'transparent',
              color: on ? T_TEXT : T_MUTED,
              padding: '4px 11px',
              borderRadius: 7,
              cursor: (disabled || opt.disabled) ? 'not-allowed' : 'pointer',
              font: 'inherit',
              fontSize: 12,
              fontWeight: on ? 600 : 400,
              boxShadow: on ? '0 1px 4px rgba(0,0,0,.2)' : 'none',
              whiteSpace: 'nowrap',
              opacity: (disabled || opt.disabled) ? .5 : 1
            }
          }, opt.label)
        }))
    }
    function CodeBuddySettingsPage(props) {
      const { t, statusUrl } = props
      const actionUrl = props.actionUrl ?? ACTION_PATH
      const form = props.form ?? props.legacyForm
      const snapshot = useFormSnapshot(form)
      const value = snapshot?.value ?? {}
      const [draft, setDraft] = React.useState(() => ({ ...value }))
      const [dirty, setDirty] = React.useState(false)
      const [busy, setBusy] = React.useState(false)
      const [rewriteBusy, setRewriteBusy] = React.useState(false)
      const [captureBusy, setCaptureBusy] = React.useState(false)
      // The catalog-sync, image-inlining and log-level switches share one
      // busy flag because they all commit through savePref below.
      const [prefBusy, setPrefBusy] = React.useState(false)
      // Every account carries its own balance and its own pending authorisation
      // link, so two rows never share a busy flag or a URL.
      const [balances, setBalances] = React.useState({})
      const [quotaUrls, setQuotaUrls] = React.useState({})
      const [quotaBusy, setQuotaBusy] = React.useState({})
      // A refresh whose numbers do not change is indistinguishable from a click
      // that did nothing, so each row keeps the outcome of its own last attempt.
      const [quotaNotes, setQuotaNotes] = React.useState({})
      const [notice, setNotice] = React.useState('')
      const [status, setStatus] = React.useState()
      const [checking, setChecking] = React.useState(false)
      const [netProbeBusy, setNetProbeBusy] = React.useState(false)
      const [netProbe, setNetProbe] = React.useState(null)
      const [action, setAction] = React.useState('')
      const [search, setSearch] = React.useState('')
      const [logBusy, setLogBusy] = React.useState(false)
      const [logReport, setLogReport] = React.useState(null)
      const [logConsent, setLogConsent] = React.useState(false)
      const [confirmClear, setConfirmClear] = React.useState(false)
      const [addStep, setAddStep] = React.useState('')
      const [pendingAdd, setPendingAdd] = React.useState('')
      const [confirmAccountRemoval, setConfirmAccountRemoval] = React.useState('')
      const [activeSection, setActiveSection] = React.useState('connection')
      const [selectedIds, setSelectedIds] = React.useState(() => new Set())
      // Column sort cycles ascending -> descending -> catalog order. An empty
      // sortKey keeps the CLI's own ordering, so the default view is unchanged.
      const [sortKey, setSortKey] = React.useState('')
      const [sortDir, setSortDir] = React.useState(1)
      // The last successful visibility batch, so one click can reverse it.
      const [lastBatch, setLastBatch] = React.useState(null)
      const [usageChartMode, setUsageChartMode] = React.useState('tokens')
      const localDateStr = (offsetDays = 0) => {
        const d = new Date(Date.now() + offsetDays * 86400000)
        return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
      }
      const [usageRange, setUsageRange] = React.useState('today')
      const [usageFrom, setUsageFrom] = React.useState(() => localDateStr(-6))
      const [usageTo, setUsageTo] = React.useState(() => localDateStr(0))
      const [usageModel, setUsageModel] = React.useState('')
      const [usageQuery, setUsageQuery] = React.useState(null)
      const [usageLoading, setUsageLoading] = React.useState(false)
      const [usageRefreshSeq, setUsageRefreshSeq] = React.useState(0)
      const usageUrl = props.usageUrl ?? ('/plugins/dsh-codebuddy-cli-' + (props.region ?? 'cn') + '/usage')
      const [logViewRaw, setLogViewRaw] = React.useState(false)
      const [logCollapsed, setLogCollapsed] = React.useState(false)
      const [logFilterState, setLogFilterState] = React.useState('all')
      const [logFilterQuery, setLogFilterQuery] = React.useState('')
      const [logHideCancelled, setLogHideCancelled] = React.useState(false)
      const [renamingId, setRenamingId] = React.useState('')
      const [renameDraft, setRenameDraft] = React.useState('')
      const [capImages, setCapImages] = React.useState(false)
      const [capReasoning, setCapReasoning] = React.useState(false)
      const [capLowMult, setCapLowMult] = React.useState(false)
      const [modelStateFilter, setModelStateFilter] = React.useState('all')
      const [maintBusy, setMaintBusy] = React.useState('')
      const [toastDismissed, setToastDismissed] = React.useState('')
      React.useEffect(() => {
        if (!dirty && snapshot?.status === 'ready') setDraft({ ...snapshot.value })
      }, [snapshot?.status, snapshot?.revision, dirty])
      const quotaAsked = React.useRef(null)
      const quotaSeq = React.useRef({})
      const nextQuotaSeq = (key) => {
        const next = (quotaSeq.current[key] || 0) + 1
        quotaSeq.current[key] = next
        return next
      }
      const loadBalances = async (rows) => {
        const updates = {}
        await Promise.all(rows.map(async (row) => {
          const key = row.id || 'legacy'
          const seq = nextQuotaSeq(key)
          try {
            const response = await fetch(actionUrl, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' },
              body: JSON.stringify({ action: 'quotaRead', accountId: row.id ?? null }), cache: 'no-store'
            })
            const result = await response.json()
            if (quotaSeq.current[key] !== seq) return
            if (result && result.ok === true && result.balance) updates[key] = result.balance
            else updates[key] = { available: false, code: typeof result?.code === 'string' ? result.code : 'QUOTA_NOT_AUTHORIZED' }
          } catch {
            if (quotaSeq.current[key] !== seq) return
            quotaAsked.current?.delete(key)
            updates[key] = { available: false, code: 'QUOTA_NETWORK' }
          }
        }))
        if (Object.keys(updates).length) setBalances((current) => ({ ...current, ...updates }))
      }
      React.useEffect(() => {
        if (snapshot?.status !== 'ready' || props.activeRegion === false) return
        const controller = new AbortController()
        const refresh = () => {
          if (typeof document !== 'undefined' && document.hidden === true) return
          fetch(statusUrl, { signal: controller.signal, cache: 'no-store' })
            .then((response) => response.ok ? response.json() : Promise.reject(new Error('status unavailable')))
            .then((result) => { if (isStatus(result)) setStatus(result) }).catch(() => {})
        }
        refresh()
        let timer = setInterval(refresh, action ? 1500 : 10000)
        const onVis = () => {
          if (document.hidden) {
            if (timer) { clearInterval(timer); timer = null }
          } else {
            refresh()
            if (!timer) timer = setInterval(refresh, action ? 1500 : 10000)
          }
        }
        if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
          document.addEventListener('visibilitychange', onVis)
        }
        return () => {
          if (timer) clearInterval(timer)
          if (typeof document !== 'undefined' && typeof document.removeEventListener === 'function') {
            document.removeEventListener('visibilitychange', onVis)
          }
          controller.abort()
        }
      }, [statusUrl, action, snapshot?.status, props.activeRegion])
      React.useEffect(() => {
        if (snapshot?.status !== 'ready' || props.activeRegion === false) return
        if (activeSection !== 'accounts' || !status?.accounts) return
        // Every row is asked, not just the ones whose CLI record looks readable. The
        // default CLI login is one machine-wide file that either region can own, so its
        // readability says nothing about whether credits can be read -- gating on it kept
        // the row showing "authorise credits" for ever while a stored grant sat on disk.
        // When the server has nothing usable it answers with a typed reason and no
        // network call, so asking is cheap and always ends in a terminal state.
        if (!quotaAsked.current) quotaAsked.current = new Set()
        const rows = (props.region === 'intl' ? [] : [{ id: null, pathError: false }])
          .concat((status.accounts.accounts || []).map((account) => ({ id: account.id, pathError: account.pathError === true })))
        // A broken isolation directory is a real failure rather than a credential
        // question: the server rejects it before any read, and its row states the path
        // problem while rendering no credit panel at all.
        const pending = rows.filter((row) => !row.pathError && !quotaAsked.current.has(row.id || 'legacy'))
        if (!pending.length) return
        for (const row of pending) quotaAsked.current.add(row.id || 'legacy')
        loadBalances(pending)
      }, [snapshot?.status, props.activeRegion, activeSection, status?.accounts])
      React.useEffect(() => {
        if (snapshot?.status !== 'ready' || props.activeRegion === false) return
        if (activeSection !== 'usage') return
        let cancelled = false
        const controller = new AbortController()
        setUsageLoading(true)
        const qs = new URLSearchParams()
        qs.set('range', usageRange)
        if (usageRange === 'custom') {
          if (usageFrom) qs.set('from', usageFrom)
          if (usageTo) qs.set('to', usageTo)
        }
        if (usageModel) qs.set('model', usageModel)
        fetch(`${usageUrl}?${qs.toString()}`, { signal: controller.signal, cache: 'no-store' })
          .then((r) => r.ok ? r.json() : Promise.reject(new Error('usage unavailable')))
          .then((data) => { if (!cancelled && data && typeof data === 'object') setUsageQuery(data) })
          .catch(() => {})
          .finally(() => { if (!cancelled) setUsageLoading(false) })
        return () => { cancelled = true; controller.abort() }
      }, [snapshot?.status, props.activeRegion, activeSection, usageUrl, usageRange, usageFrom, usageTo, usageModel, usageRefreshSeq, status?.usage?.calls])
      React.useEffect(() => {
        if (snapshot?.status !== 'ready' || props.activeRegion === false) return
        if (activeSection !== 'logs' || logCollapsed || logReport !== null) return
        let cancelled = false
        const controller = new AbortController()
        setLogBusy(true)
        fetch(props.diagnosticsUrl ?? DIAGNOSTICS_PATH, { signal: controller.signal, cache: 'no-store' })
          .then((response) => response.ok ? response.json() : Promise.reject(new Error('logs unavailable')))
          .then((result) => { if (!cancelled) setLogReport(result) })
          .catch(() => {})
          .finally(() => { if (!cancelled) setLogBusy(false) })
        return () => { cancelled = true; controller.abort() }
      }, [snapshot?.status, props.activeRegion, activeSection, logCollapsed, logReport, props.diagnosticsUrl])
      if (props.view === 'summary') return t('intro')
      if (snapshot?.status !== 'ready') return h('div', { style: { padding: 24, overflowY: 'auto', height: '100%', boxSizing: 'border-box' } }, h(Notice, null, t('feedbackReadOnly')), h(IssueFeedback, { t, region: props.region ?? 'cn', statusUrl, diagnosticsUrl: props.diagnosticsUrl ?? DIAGNOSTICS_PATH, config: {}, active: props.activeRegion !== false }))

      const edit = (key, next) => {
        setDirty(true); setNotice(''); setDraft((old) => ({ ...old, [key]: next }))
      }
      const commit = async (patch) => {
        const current = typeof form?.getSnapshot === 'function' ? form.getSnapshot() : snapshot
        if (typeof form?.mutate === 'function') {
          await form.mutate(Object.entries(patch).map(([key, next]) => ({ op: 'set', path: [key], value: next })), current?.revision)
        } else {
          for (const [key, next] of Object.entries(patch)) if (!await form.set(key, next)) throw new Error('rejected')
        }
      }
      const save = async () => {
        if (busy || snapshot?.writable === false) return
        setBusy(true); setNotice('')
        try {
          const changed = Object.fromEntries(['cliPath', 'configDir', 'model', 'effort', 'timeoutMs', 'firstByteTimeoutMs', 'maxConcurrency', 'proxyUrl']
            .filter((key) => draft[key] !== undefined && draft[key] !== value[key]).map((key) => [key, draft[key]]))
          if (Object.keys(changed).length) {
            if (Object.hasOwn(changed, 'firstByteTimeoutMs')) changed.firstByteTimeoutMs = Number(changed.firstByteTimeoutMs)
            if (Object.hasOwn(changed, 'maxConcurrency')) {
              const mc = Number(changed.maxConcurrency)
              if (!Number.isSafeInteger(mc) || mc < 0 || mc > 32) {
                setNotice(translate(t, 'preflightFailed', { item: t('maxConcurrency'), code: 'CLI_ERROR' }))
                return
              }
              changed.maxConcurrency = mc
            }
            // Preflight the draft before committing. The server clamps timeoutMs
            // on read, so an invalid value would otherwise be saved silently and
            // only surface as a wrong timeout at request time.
            const response = await fetch(actionUrl, {
              method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' },
              body: JSON.stringify({ action: 'preflight', cliPath: draft.cliPath, configDir: draft.configDir, timeoutMs: draft.timeoutMs, firstByteTimeoutMs: draft.firstByteTimeoutMs ?? 0, proxyUrl: draft.proxyUrl }), cache: 'no-store'
            })
            if (!response.ok) throw new Error('preflight unavailable')
            const report = await response.json()
            if (report && report.ok === false) {
              const failed = (report.checks || []).find((check) => !check.ok) || {}
              const itemLabel = failed.key === 'proxyUrl' ? (/[一-鿿]/.test(t('quickSetup')) ? '代理地址' : 'Proxy URL') : failed.key === 'firstByteTimeoutMs' ? (/[一-鿿]/.test(t('quickSetup')) ? '首包/无响应超时' : 'First-byte timeout') : t(['timeoutMs', 'cliPath', 'configDir'].includes(failed.key) ? failed.key : 'cliPath')
              setNotice(translate(t, 'preflightFailed', { item: itemLabel, code: failed.code || 'CLI_ERROR' }) + (guidance(failed.code) ? ' ' + guidance(failed.code) : ''))
              return
            }
            await commit(changed)
          }
          setDirty(false); setNotice(t('saved'))
        } catch { setNotice(t('saveFailed')) } finally { setBusy(false) }
      }
      // The identity switch is deliberately independent of the advanced connection
      // form: it commits on its own, so it never needs that block expanded or its
      // Save button pressed.
      const saveRewrite = async (next) => {
        if (busy || rewriteBusy || dirty || snapshot?.writable === false) return
        setRewriteBusy(true); setNotice('')
        try {
          await commit({ rewriteClientNames: next })
          setDraft((old) => ({ ...old, rewriteClientNames: next }))
          setNotice(t('saved'))
        } catch { setNotice(t('saveFailed')) } finally { setRewriteBusy(false) }
      }
      // Request-sample capture is its own opt-in switch with its own commit, for
      // the same reason as the identity switch above: it must not require the
      // advanced connection form to be expanded or its Save pressed.
      const saveCapture = async (next) => {
        if (busy || captureBusy || dirty || snapshot?.writable === false) return
        setCaptureBusy(true); setNotice('')
        try {
          await commit({ captureRequestSamples: next })
          setDraft((old) => ({ ...old, captureRequestSamples: next }))
          setNotice(t('saved'))
        } catch { setNotice(t('saveFailed')) } finally { setCaptureBusy(false) }
      }
      // The catalog-sync, image-inlining and log-level preferences save
      // on their own for the same reason as the two switches above: a value that
      // only lands when the advanced form is expanded looks unsaved.
      const savePref = async (key, next) => {
        if (busy || prefBusy || dirty || snapshot?.writable === false) return
        setPrefBusy(true); setNotice('')
        try {
          await commit({ [key]: next })
          setDraft((old) => ({ ...old, [key]: next }))
          setNotice(t('saved'))
        } catch { setNotice(t('saveFailed')) } finally { setPrefBusy(false) }
      }
      // A balance belongs to one row. Reading it never changes settings, so the
      // request carries the row's account id and the answer is stored under that id.
      const quotaAction = async (name, accountId) => {
        const key = accountId || 'legacy'
        if (quotaBusy[key]) return
        const seq = nextQuotaSeq(key)
        setQuotaBusy((current) => ({ ...current, [key]: true })); setNotice('')
        setQuotaNotes((current) => ({ ...current, [key]: null }))
        try {
          const response = await fetch(actionUrl, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' },
            body: JSON.stringify({ action: name, accountId: accountId ?? null }), cache: 'no-store'
          })
          const result = await response.json()
          if (quotaSeq.current[key] !== seq) return
          if (!result || result.ok !== true) {
            const code = typeof result?.code === 'string' ? result.code : ''
            setQuotaNotes((current) => ({
              ...current,
              [key]: { tone: 'bad', text: code && guidance(code) ? guidance(code) : (typeof result?.message === 'string' && result.message ? result.message : t('quotaFailed')) }
            }))
            if (name !== 'quotaPoll') setQuotaUrls((current) => ({ ...current, [key]: '' }))
            return
          }
          if (result.balance) setBalances((current) => ({ ...current, [key]: result.balance }))
          if (name === 'quotaStart') {
            const url = typeof result.url === 'string' ? result.url : ''
            setQuotaUrls((current) => ({ ...current, [key]: url }))
            setNotice(url ? t('quotaAuthorizeHint') : t('quotaUnavailable'))
          } else if (name === 'quotaDisconnect') {
            setQuotaUrls((current) => ({ ...current, [key]: '' })); setNotice(t('quotaDisconnected'))
          } else {
            setQuotaUrls((current) => ({ ...current, [key]: '' }))
            setQuotaNotes((current) => ({
              ...current,
              [key]: { tone: 'ok', text: translate(t, 'quotaRefreshedAt', { time: formatTime(Date.now()) }) }
            }))
          }
        } catch { setNotice(t('quotaFailed')) } finally {
          setQuotaBusy((current) => { const next = { ...current }; delete next[key]; return next })
        }
      }
      const postAction = async (name, extra) => {
        const response = await fetch(actionUrl, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' },
          body: JSON.stringify({ action: name, ...extra }), cache: 'no-store'
        })
        const result = await response.json()
        if (!response.ok || !isStatus(result)) {
          const failure = new Error(typeof result?.message === 'string' ? result.message : 'action unavailable')
          failure.code = result?.error
          throw failure
        }
        setStatus(result)
        return result
      }
      const toggleModelBatch = async (ids, enabled, record = true) => {
        if (action || dirty || !ids.length) return
        setAction('modelVisibility'); setNotice('')
        try {
          await postAction('setModelVisibility', { ids, enabled })
          setSelectedIds(new Set())
          if (record) setLastBatch({ ids: [...ids], enabled })
          setNotice(translate(t, 'batchSaved', { count: ids.length }))
        } catch (error) { setNotice(error?.code === 'MODEL_VISIBILITY_LAST' ? t('modelVisibilityLast') : t('modelVisibilityFailed')) } finally { setAction('') }
      }
      // Undo reverses the last batch without recording a new one, so the button
      // disappears after use instead of offering an endless redo loop.
      const undoBatch = async () => {
        if (!lastBatch || action || dirty) return
        const { ids, enabled } = lastBatch
        setLastBatch(null)
        await toggleModelBatch(ids, !enabled, false)
      }
      const toggleModel = (id, enabled) => toggleModelBatch([id], enabled)
      const toggleSelection = (id, checked) => setSelectedIds((old) => {
        const next = new Set(old)
        if (checked) next.add(id); else next.delete(id)
        return next
      })
      const selectShownModels = () => setSelectedIds((old) => new Set([...old, ...shown.map((item) => item.id)]))
      const toggleSelectedModels = (enabled) => toggleModelBatch(selectedModels.map((item) => item.id), enabled)
      const refreshModels = async () => {
        if (action || dirty) return
        setAction('refreshModels'); setNotice('')
        try {
          const result = await postAction('refreshModels')
          // Success is reported by the button state and the updated-at stamp in the
          // selection summary; putting the whole "detected N models / updated at"
          // sentence here duplicated the card text on the page.
          setNotice(result.catalog?.errorMessage || '')
        } catch { setNotice(t('actionFailed')) } finally { setAction('') }
      }
      const setup = async () => {
        if (action || dirty || snapshot?.writable !== true) return
        setAction('setup'); setNotice('')
        try {
          let result = await postAction('setup')
          let attempts = 0
          while (['detecting', 'installing'].includes(result.setup?.state) && attempts++ < 400) {
            await new Promise((resolve) => setTimeout(resolve, 1500))
            const response = await fetch(statusUrl, { cache: 'no-store' })
            result = await response.json()
            if (!response.ok || !isStatus(result)) throw new Error('status unavailable')
            setStatus(result)
          }
          if (result.setup?.state !== 'ready' || !result.setup.path) {
            setNotice(result.setup?.message || t('actionFailed')); return
          }
          try {
            await commit({ cliPath: result.setup.path })
            setDraft((old) => ({ ...old, cliPath: result.setup.path }))
          } catch { setNotice(t('saveFailed')); return }
          const refreshed = await postAction('refreshModels')
          setNotice(refreshed.catalog?.errorMessage || translate(t, 'setupReady', { version: result.setup.version }))
        } catch { setNotice(t('actionFailed')) } finally { setAction('') }
      }
      const checkCli = async () => {
        if (checking || action || dirty) return
        setChecking(true)
        try {
          const response = await fetch(`${statusUrl}?checkCli=1`, { cache: 'no-store' })
          const result = await response.json()
          if (!response.ok || !isStatus(result)) throw new Error('status unavailable')
          setStatus(result)
        } catch { setNotice(t('actionFailed')) } finally { setChecking(false) }
      }
      const probeNetwork = async () => {
        if (netProbeBusy || action) return
        setNetProbeBusy(true); setNotice('')
        try {
          const response = await fetch(actionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' },
            body: JSON.stringify({ action: 'probeNetwork', proxyUrl: draft.proxyUrl ?? '' })
          })
          const result = await response.json().catch(() => null)
          if (!response.ok || !result || typeof result !== 'object') throw new Error('probe failed')
          setNetProbe({ ...result, checkedAt: Date.now() })
        } catch {
          setNetProbe({ ok: false, code: 'PROBE_FAILED', message: /[一-鿿]/.test(t('quickSetup')) ? '连通性探测请求失败，请稍后重试。' : 'Connectivity probe failed; please retry.', checkedAt: Date.now() })
        } finally {
          setNetProbeBusy(false)
        }
      }
      const copyLogin = async () => {
        try { await navigator.clipboard.writeText(status.loginCommand); setNotice(t('copied')) }
        catch { setNotice(t('loginHelp')) }
      }
      const accountAction = async (name, id, extra) => {
        if (action || dirty || snapshot?.writable !== true) return
        setAction('accounts'); setNotice('')
        try {
          const response = await fetch(props.accountsUrl ?? ACCOUNTS_PATH, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' },
            body: JSON.stringify({ action: name, ...(name === 'rotation' ? {} : { id }), ...extra }), cache: 'no-store'
          })
          const result = await response.json()
          if (!response.ok || !isStatus(result)) { setNotice(typeof result.message === 'string' ? result.message : t('actionFailed')); return }
          setStatus(result); setConfirmAccountRemoval('')
          if (name === 'remove') setNotice(t('accountRemoved'))
          if (name === 'prepareLogin') setNotice(t('accountAdded'))
          if (name === 'rotation') setNotice(t('saved'))
        } catch { setNotice(t('actionFailed')) } finally { setAction('') }
      }
      // Adding an account is one click: the row is created with a placeholder
      // name, the official sign-in command is generated at once, and the CLI's
      // own login record supplies the real account name afterwards.
      const postAccounts = async (body) => {
        try {
          const response = await fetch(props.accountsUrl ?? ACCOUNTS_PATH, {
            method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' },
            body: JSON.stringify(body), cache: 'no-store'
          })
          const result = await response.json()
          if (!response.ok || !isStatus(result)) { setNotice(typeof result.message === 'string' ? result.message : t('actionFailed')); return null }
          setStatus(result)
          return result
        } catch { setNotice(t('actionFailed')); return null }
      }
      const addAccount = async () => {
        if (action || dirty || readOnly || !status?.accounts || status.accounts.storageError) return
        const taken = new Set((status.accounts.accounts ?? []).map((item) => item.label))
        let index = 1
        while (taken.has(translate(t, 'accountAutoLabel', { count: index })) && index < 99) index += 1
        const label = translate(t, 'accountAutoLabel', { count: index })
        setAction('accounts'); setNotice(''); setAddStep('started')
        try {
          const added = await postAccounts({ action: 'add', label })
          if (!added) { setAddStep(''); return }
          const created = (added.accounts?.accounts ?? []).find((item) => item.label === label)
          if (!created) { setNotice(t('actionFailed')); setAddStep(''); return }
          setPendingAdd(created.id)
          const prepared = await postAccounts({ action: 'prepareLogin', id: created.id })
          if (!prepared) { setAddStep(''); setPendingAdd('') }
        } finally { setAction('') }
      }
      const confirmAccountLogin = async () => {
        if (action || readOnly) return
        setAction('accounts')
        try {
          const response = await fetch(`${statusUrl}?checkCli=1`, { cache: 'no-store' })
          const result = await response.json()
          if (!response.ok || !isStatus(result)) { setNotice(t('actionFailed')); return }
          setStatus(result)
          const row = (result.accounts?.accounts ?? []).find((item) => item.id === pendingAdd)
          if (row?.credentialsPresent) { setNotice(t('accountAdded')); setAddStep(''); setPendingAdd('') }
          else setNotice(t('accountLoginNotYet'))
        } catch { setNotice(t('actionFailed')) } finally { setAction('') }
      }
      // Cancelling discards the placeholder row, unless the official login already
      // succeeded: then the row is real and only the panel closes.
      const cancelAdd = async () => {
        const id = pendingAdd
        const signedIn = Boolean((status?.accounts?.accounts ?? []).find((item) => item.id === id)?.credentialsPresent)
        setAddStep(''); setPendingAdd('')
        if (id && !signedIn) await postAccounts({ action: 'remove', id })
      }
      // One figure of the credit panel: the number in a monospace face so two
      // accounts can be compared at a glance, with the unit pushed to the side.
      const readOnly = snapshot?.status !== 'ready' || snapshot?.writable !== true
      // Localised fix for an error code, from the shared guidance table. A missing
      // key falls back to '' rather than leaking the raw 'fix_CODE' lookup key.
      const guidance = (code) => {
        if (!code) return ''
        const key = 'fix_' + code
        const text = t(key)
        return text === key ? '' : text
      }
      // Card geometry follows the reference explainer: one hairline card, a head
      // separated by a rule, a padded body and a single radius. Colours stay on the
      // host tokens so dark mode keeps working.
      const ACCT = {
        card: { border: `1px solid ${T_LINE}`, borderRadius: 12, overflow: 'hidden', minWidth: 0 },
        head: { display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', borderBottom: `1px solid ${T_LINE}`, flexWrap: 'wrap' },
        title: { fontSize: 14.5, fontWeight: 600, color: T_TEXT, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
        body: { padding: '12px 14px 14px', display: 'grid', gap: 10 },
        row: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px' },
        label: { fontSize: 11.5, color: T_MUTED, whiteSpace: 'nowrap' },
        value: { fontSize: 15.5, fontWeight: 600, color: T_TEXT, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' },
        meta: { fontSize: 12, color: T_MUTED },
        callout: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px', borderRadius: 8, background: T_SOFT, boxShadow: `inset 3px 0 0 ${T_MUTED}` }
      }
      const creditFigure = (label, count) => h('div', { key: label, style: { display: 'grid', gap: 3, justifyItems: 'start', padding: '10px 12px', borderRadius: 10, border: `1px solid ${T_LINE}`, background: 'rgba(255,255,255,0.02)', minWidth: 88 } },
        h('span', { style: ACCT.label }, t(label)),
        h('span', { style: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize: 20, fontWeight: 700, color: T_TEXT, fontVariantNumeric: 'tabular-nums', letterSpacing: '-.01em', lineHeight: 1.15, whiteSpace: 'nowrap' } }, String(count)),
        h('span', { style: { fontSize: 11, color: T_MUTED, lineHeight: 1.2 } }, t('quotaUnit')))
      // Credits of the account the page is about. A row without a usable credential
      // says why instead of showing 0 / 0, which would read as an exhausted account.
      // The package breakdown is one fold wherever credits are shown: under the three
      // figures on the current card, and under the account's own line on a row.
      // Disconnecting lives inside it and only for a device grant -- a CLI sign-in
      // is the CLI's business, not ours to revoke.
      const creditPackages = (key, align = 'end') => {
        const bal = balances[key]
        if (!bal || !bal.available) return null
        const busy = quotaBusy[key] === true
        const accountId = key === 'legacy' ? null : key
        const packages = bal.packages ?? []
        const side = align === 'end' ? 'right' : 'left'
        if (!packages.length) return h('span', { style: { fontSize: 12, color: T_MUTED, textAlign: side } }, t('quotaEmpty'))
        return h('details', { style: { width: '100%' } },
          h('summary', { style: { cursor: 'pointer', fontSize: 12, color: T_MUTED, textAlign: side } }, translate(t, 'quotaPackages', { count: packages.length })),
          h('div', { style: { display: 'grid', gap: 4, marginTop: 6 } },
            ...packages.map((item, index) => {
              const pTotal = Number(item.total) || 0
              const pRemain = Math.max(0, Number(item.remain) || 0)
              const pPct = pTotal > 0 ? Math.min(100, Math.round((pRemain / pTotal) * 100)) : 0
              const expMs = item.expireAt ? (typeof item.expireAt === 'number' ? item.expireAt : Date.parse(item.expireAt)) : NaN
              const daysLeft = Number.isFinite(expMs) ? Math.ceil((expMs - Date.now()) / 86400000) : null
              const expUrgent = daysLeft !== null && daysLeft <= 7
              return h('div', { key: (item.name || 'pkg') + index, style: { display: 'grid', gap: 4, fontSize: 12, color: T_MUTED, borderTop: '1px dashed ' + T_LINE, paddingTop: 6 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                  h('span', { style: { color: T_TEXT, fontWeight: 500 } }, item.name),
                  h('span', { style: { fontVariantNumeric: 'tabular-nums' } }, pRemain + ' / ' + pTotal),
                  Number.isFinite(expMs) ? h('span', { style: { color: expUrgent ? T_WARN : T_MUTED, fontWeight: expUrgent ? 600 : 400 } },
                    translate(t, 'quotaExpire', { time: formatTime(expMs) }) + (daysLeft !== null && daysLeft >= 0 ? (/[\u4e00-\u9fff]/.test(t('quotaExpire')) ? `（剩 ${daysLeft} 天）` : ` (${daysLeft}d)`) : '')) : null),
                pTotal > 0 ? h('div', { style: { height: 4, borderRadius: 999, background: T_SOFT, overflow: 'hidden' } },
                  h('div', { style: { width: `${pPct}%`, height: '100%', borderRadius: 999, background: pPct < 10 ? '#ef4444' : pPct < 30 ? '#f59e0b' : T_BRAND } })) : null)
            }),
            bal.source === 'device' ? h('button', { type: 'button', disabled: busy, style: { ...buttonStyle, justifySelf: 'start', marginTop: 4 }, onClick: () => quotaAction('quotaDisconnect', accountId) }, t('quotaDisconnect')) : null))
      }
      const creditPanel = (key, { showPackages = true } = {}) => {
        const bal = balances[key]
        const busy = quotaBusy[key] === true
        const accountId = key === 'legacy' ? null : key
        const official = h('a', { href: bal?.officialHome ?? props.officialHome ?? 'https://www.codebuddy.cn', target: '_blank', rel: 'noreferrer', style: { fontSize: 12, color: T_BRAND, textDecoration: 'none', whiteSpace: 'nowrap' } }, `${t('openHome')} ↗`)
        if (!bal) return h('span', { style: { fontSize: 12, color: T_MUTED } }, t('quotaLoading'))
        if (!bal.available) {
          const url = quotaUrls[key]
          // For the default CLI login the identity line above already states the reason,
          // so repeating the same sentence on the right only made one row say it twice.
          const identityExplains = key === 'legacy' && String(bal.code ?? '').startsWith('CLI_CREDENTIAL_')
          // The authorisation URL comes from upstream and can name the other region's
          // sign-in page. The link is still offered, but a domestic page must not look
          // like an international one without saying so.
          const regionHostRe = (props.region ?? 'cn') === 'intl' ? /(?:^|\.)(?:workbuddy|codebuddy)\.ai$/iu : /(?:^|\.)(?:workbuddy|codebuddy)\.cn$/iu
          let foreignLink = false
          if (url) {
            try { foreignLink = !regionHostRe.test(new URL(String(url)).hostname) } catch { foreignLink = true }
          }
          return h('div', { style: { display: 'grid', gap: 6, justifyItems: 'end', maxWidth: 360 } },
            identityExplains ? null : h('span', { style: { fontSize: 12, color: T_MUTED, textAlign: 'right' } }, guidance(bal.code ?? 'QUOTA_NOT_AUTHORIZED') || t('quotaNotAuthorized')),
            url ? h('div', { style: { display: 'grid', gap: 6, justifyItems: 'end' } },
              h('code', { style: { overflowWrap: 'anywhere', fontSize: 11.5, textAlign: 'right' } }, url),
              foreignLink ? h('span', { style: { fontSize: 11.5, color: T_WARN, textAlign: 'right' } }, t('quotaAuthForeignRegion')) : null,
              h('div', { style: rowStyle },
                h('button', { type: 'button', disabled: busy, style: buttonStyle, onClick: async () => { try { await navigator.clipboard.writeText(url); setNotice(t('copied')) } catch { setNotice(t('quotaFailed')) } } }, t('copyAuthLink')),
                h('button', { type: 'button', disabled: busy, style: buttonStyle, onClick: () => quotaAction('quotaPoll', accountId) }, busy ? t('saving') : t('quotaCompleteAuth')))) : null,
            // One action per state: while a link is outstanding the row only offers the
            // official site here, so \"I have authorised\" never appears twice.
            h('div', { style: rowStyle },
              url ? null : h('button', { type: 'button', disabled: busy, style: buttonStyle, onClick: () => quotaAction('quotaStart', accountId) }, busy ? t('saving') : t('quotaAuthorize')),
              official))
        }
        const qTotal = Number(bal.total) || 0
        const qRemain = Math.max(0, Number(bal.remain) || 0)
        const qPct = qTotal > 0 ? Math.min(100, Math.round((qRemain / qTotal) * 100)) : 0
        const barBg = qPct < 10 ? '#ef4444' : qPct < 30 ? '#f59e0b' : 'linear-gradient(90deg, #60a5fa, #a78bfa)'
        const isZhPanel = /[\u4e00-\u9fff]/.test(t('quotaRemain'))
        return h('div', { style: { display: 'grid', gap: 10, width: '100%', minWidth: 280 } },
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(88px, 1fr))', gap: 10, width: '100%' } },
            creditFigure('quotaRemain', bal.remain ?? 0), creditFigure('quotaTotal', bal.total ?? 0), creditFigure('quotaUsed', bal.used ?? 0)),
          qTotal > 0 ? h('div', { title: `${qPct}%`, style: { width: '100%', height: 7, borderRadius: 999, background: T_SOFT, overflow: 'hidden' } },
            h('div', { style: { width: `${qPct}%`, height: '100%', borderRadius: 999, background: barBg, transition: 'width .25s ease' } })) : null,
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', width: '100%' } },
            h('span', { style: { fontSize: 12, color: T_MUTED } },
              `${qTotal > 0 ? (isZhPanel ? `剩余 ${qPct}%` : `${qPct}% left`) + ' · ' : ''}${t(bal.source === 'cli' ? 'quotaSourceCli' : 'quotaSourceDevice')}`),
            official),
          showPackages ? creditPackages(key) : null)
      }
      const usageLine = (account) => account
        ? h('span', { style: { fontSize: 12, color: T_MUTED } }, translate(t, 'accountUsage', { calls: account.usage?.calls || 0, input: account.usage?.inputTokens || 0, output: account.usage?.outputTokens || 0, cancelled: account.usage?.cancelledRequests || 0, offloads: account.usage?.imageOffloadRequests || 0, images: account.usage?.offloadImagesRequested || 0, history: account.usage?.historyOffloadedImages || 0 }))
        : null
      const lastUsedLine = (account) => account?.lastUsedAt
        ? h('span', { style: { fontSize: 12, color: T_MUTED } }, translate(t, 'lastUsed', { time: formatTime(account.lastUsedAt) }))
        : null
      // The note for the native build points at the one control that can change the
      // entry, so it is a shortcut instead of a dead-end warning.
      const revealCliPath = () => {
        setActiveSection('connection')
        const scope = document.querySelector(`[data-region="${props.region ?? 'cn'}"]`) || document
        const panel = scope.querySelector('[data-cli-advanced]')
        if (panel) panel.open = true
        setTimeout(() => {
          const input = scope.querySelector('[data-cli-path]')
          if (!input) return
          input.scrollIntoView({ block: 'center' })
          input.focus()
        }, 80)
      }
      const copyLoginCommand = async (command) => {
        try { await navigator.clipboard.writeText(command); setNotice(t('copied')) } catch { setNotice(t('loginHelp')) }
      }
      // Everything the page renders is derived once, so the summary strip, the current
      // card and the list can never disagree about which account is in use.
      const accountState = status?.accounts
      const accountRows = Array.isArray(accountState?.accounts) ? accountState.accounts : []
      const currentAccount = accountRows.find((item) => item.id === (accountState?.selectedId ?? null)) ?? null
      // A sign-in command is a repair path, so the current card only offers one while
      // its account still has no usable credential.
      const currentSignedIn = currentAccount ? currentAccount.credentialsPresent === true : false
      const currentKey = currentAccount ? currentAccount.id : 'legacy'
      // The CLI's own record names the account; the stored label is only the
      // placeholder shown before anyone has signed in.
      const currentLabel = currentAccount ? (currentAccount.identity?.nickname || currentAccount.label) : (props.region === 'intl' ? '—' : t('accountDefaultAccount'))
      const currentIdentity = currentAccount ? currentAccount.identity : accountState?.defaultLogin
      const currentIdentityCode = currentAccount ? currentAccount.identityCode : accountState?.defaultLogin?.code
      const signedInCount = (props.region === 'intl' ? 0 : (accountState?.defaultLogin?.present && accountState?.defaultLogin?.code === '' ? 1 : 0)) + accountRows.filter((item) => item.credentialsPresent).length
      // The international build exposes no default account at all: with no isolated
      // account selected it says that plainly instead of presenting the shared
      // machine-wide record, which can only ever belong to one region.
      const noDefaultHere = props.region === 'intl' && !currentAccount
      const currentBalance = balances[currentKey]
      const pendingRow = pendingAdd ? accountRows.find((item) => item.id === pendingAdd) ?? null : null
      const addCommand = pendingRow?.loginCommand || ''
      const rotationOn = (status?.rotation ?? 'off') === 'quota'
      const summaryCells = [
        ['cb-account-current', 'accountSummaryCurrent', currentLabel, true],
        ['cb-account-list', 'accountSummarySigned', `${signedInCount} / ${accountRows.length + (props.region === 'intl' ? 0 : 1)}`, true],
        ['cb-account-current', 'quotaRemain', !noDefaultHere && currentBalance?.available ? translate(t, 'accountCreditsLeft', { credits: currentBalance.remain ?? 0 }) : '—', !noDefaultHere && Boolean(currentBalance?.available)],
        ['cb-rewrite', 'accountSummaryRotation', rotationOn ? t('accountOn') : t('accountOff'), rotationOn]
      ]
      // Identity of a row, as the CLI itself recorded it. Only shown when the record
      // could be read; an unreadable record is reported by code, never guessed.
      const identityLine = (identity, code) => {
        if (!identity) return null
        if (identity.present && code === '') {
          return h('span', { style: { fontSize: 12, color: T_MUTED } }, translate(t, 'accountIdentity', {
            nickname: identity.nickname || t('sizeUnknown'),
            uid: identity.uid ? identity.uid.slice(0, 8) : t('sizeUnknown'),
            time: identity.expiresAt ? formatTime(identity.expiresAt) : t('sizeUnknown')
          }))
        }
        // This line carries two placeholders, so it must be interpolated rather than
        // looked up verbatim; the English wording orders them the other way round, so
        // the values are passed by name.
        if (code === 'CLI_CREDENTIAL_FOREIGN_REGION') {
          return h('span', { style: { fontSize: 12, color: T_MUTED } }, translate(t, 'accountIdentityFOREIGN_REGION', {
            nickname: identity.nickname || t('sizeUnknown'),
            domain: identity.domain || t('sizeUnknown')
          }))
        }
        return h('span', { style: { fontSize: 12, color: T_MUTED } }, t(code ? 'accountIdentity' + code.replace('CLI_CREDENTIAL_', '') : 'accountNoCredential'))
      }
      // The numbers are identical whether the call succeeded or never left, so a
      // refresh reports itself: time on success, the reason on failure.
      const quotaNoteLine = (key) => {
        const note = quotaNotes[key]
        if (!note) return null
        return h('span', { style: { fontSize: 12, color: note.tone === 'bad' ? T_WARN : T_MUTED } }, note.text)
      }
      const rowStatus = (account) => account.pathError ? t('accountPathError')
        : account.credentialsPresent ? t('accountStatusSignedIn')
          : t('accountNoCredential')
      // An account row is laid out exactly like the current account card: who it is
      // on the left, its credits and its actions on the right. The default CLI login
      // is a row of its own whenever another account is in use, so switching back
      // never needs a control somewhere else.
      // One button refreshes every account, so the rows carry no refresh of their
      // own; each row still reports its own outcome under its figures.
      const refreshAll = async () => {
        // Only rows with a usable credential have credits to read; an unsigned
        // account would just answer "not authorised" on every press.
        const targets = []
        const everyday = accountState?.defaultLogin
        if (props.region !== 'intl' && everyday?.present && everyday.code === '') targets.push(null)
        for (const account of accountRows) if (account.credentialsPresent === true) targets.push(account.id)
        await Promise.all(targets.map((id) => quotaAction('quotaRefresh', id)))
      }
      const accountDisplayName = (key) => {
        if (!key || key === 'legacy') return accountState?.defaultLogin?.nickname || t('accountDefaultAccount')
        const matched = accountRows.find((r) => r.id === key)
        return matched?.identity?.nickname || matched?.label || String(key).slice(0, 8)
      }
      const runMaintenance = async (kind, payload = { all: true }) => {
        if (maintBusy) return
        setMaintBusy(kind)
        setNotice('')
        setToastDismissed('')
        try {
          const response = await fetch(actionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' },
            body: JSON.stringify({ action: kind, ...payload }),
            cache: 'no-store'
          })
          const result = await response.json()
          const isZhUi = /[\u4e00-\u9fff]/.test(t('accountOverviewTitle'))
          let summary = ''
          if (result?.results && typeof result.results === 'object' && Object.keys(result.results).length > 0) {
            const entries = Object.entries(result.results)
            let okCount = 0
            let failCount = 0
            const lines = []
            for (const [acctKey, item] of entries) {
              const rec = item?.checkin || item?.keepalive
              const ok = Boolean(item?.ok)
              if (ok) okCount += 1
              else failCount += 1
              const msg = rec?.message || item?.message || (ok ? 'OK' : (item?.code || t('actionFailed')))
              lines.push(`${ok ? '✓' : '✗'} ${accountDisplayName(acctKey)}：${msg}`)
            }
            const head = isZhUi
              ? `成功 ${okCount} / 失败 ${failCount}`
              : `${okCount} succeeded / ${failCount} failed`
            summary = `${head}\n${lines.join('\n')}`
          } else {
            const rec = result?.checkin || result?.keepalive
            summary = rec?.message || result?.message || (result?.ok ? 'OK' : (result?.error || t('actionFailed')))
          }
          setNotice(translate(t, kind === 'checkin' ? 'checkinDone' : 'keepaliveDone', { msg: summary }))
          // Trigger fresh status poll so maintenance badges update immediately
          try {
            const st = await fetch(statusUrl, { cache: 'no-store' }).then((r) => r.ok ? r.json() : null)
            if (isStatus(st)) setStatus(st)
          } catch { /* ignore */ }
        } catch {
          setNotice(t('actionFailed'))
        } finally {
          setMaintBusy('')
        }
      }
      const maintBadgeLine = (key) => {
        const ck = status?.maintenance?.checkin?.[key]
        const ka = status?.maintenance?.keepalive?.[key]
        if (!ck && !ka) return null
        return h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontSize: 11.5, color: T_MUTED } },
          ck ? h(Chip, { tone: ck.ok ? (ck.notRecorded ? 'plain' : 'ok') : 'warn' }, ck.message || (ck.ok ? 'OK' : ck.code)) : null,
          ka ? h(Chip, { tone: ka.ok ? 'plain' : 'warn' }, ka.message || (ka.ok ? 'OK' : ka.code)) : null)
      }
      const creditActions = (key, buttons) => h('div', { style: { display: 'grid', gap: 8, justifyItems: 'stretch', minWidth: 0 } },
        creditPanel(key, { showPackages: false }),
        quotaNoteLine(key),
        h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' } }, buttons))
      // A row without a usable credential has nothing to read, so it shows its own
      // actions only: a credits panel would sit there saying "reading" for ever.
      const rowBlock = (key, title, statusText, detail, buttons, withCredits = true, rowIdentity = null, rowIdentityCode = '') => {
        const cleanSigned = rowIdentity?.present && rowIdentityCode === ''
        return h('div', {
          key,
          style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', alignItems: 'start', gap: 18, padding: '14px', borderTop: `1px solid ${T_LINE}` }
        },
          h('div', { style: { display: 'grid', gap: 8, minWidth: 0 } },
            cleanSigned
              ? h('div', { style: { display: 'grid', gap: 6, minWidth: 0 } },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                  h('strong', { style: { fontSize: 16, fontWeight: 700, color: T_TEXT, lineHeight: 1.3 } }, rowIdentity.nickname || title),
                  h(Chip, { tone: 'ok' }, t('accountStatusSignedIn'))),
                h('span', { style: { fontSize: 12, color: T_MUTED, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' } },
                  `${rowIdentity.uid ? rowIdentity.uid.slice(0, 8) : t('sizeUnknown')} · ${/[\u4e00-\u9fff]/.test(t('accountOverviewTitle')) ? '凭据有效至' : 'Valid until'} ${rowIdentity.expiresAt ? formatTime(rowIdentity.expiresAt) : t('sizeUnknown')}`))
              : h('strong', { style: ACCT.title }, title),
            statusText ? h('span', { style: ACCT.meta }, statusText) : null,
            detail,
            maintBadgeLine(key),
            withCredits && balances[key]?.available ? creditPackages(key, 'start') : null),
          withCredits
            ? creditActions(key, buttons)
            : h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' } }, buttons))
      }
      const otherRows = []
      let listIndex = 0
      // The overview holds the everyday login beside the isolated accounts, in both
      // regions: the two pages are required to read the same, so nothing here is gated
      // on region.
      if (currentAccount && props.region !== 'intl') {
        const defId = accountState?.defaultLogin
        const defClean = defId?.present && defId.code === ''
        otherRows.push(rowBlock('legacy', t('accountDefaultAccount'),
          accountState?.defaultAccountId ? (defId?.present ? null : t('accountNoCredential')) : t('accountDefaultEmpty'),
          h(React.Fragment, null,
            !defClean && defId?.present ? identityLine(defId, defId.code) : null),
          [h('button', { key: 'use', type: 'button', style: buttonStyle, disabled: !!action || dirty || readOnly || !!accountState?.storageError, onClick: () => accountAction('select', null) }, t('accountUse'))],
          true, defId, defId?.code ?? ''))
      }
      for (const account of accountRows) {
        if (currentAccount && account.id === currentAccount.id) continue
        // The account being added is shown by the add panel until it is signed in.
        if (addStep && pendingAdd === account.id) continue
        const signedIn = account.credentialsPresent === true
        const cleanSigned = signedIn && account.identity?.present && (account.identityCode ?? '') === ''
        const buttons = [h('button', { key: 'use', type: 'button', style: buttonStyle, disabled: !!action || dirty || readOnly || account.pathError, onClick: () => accountAction('select', account.id) }, t('accountUse'))]
        const zhAcct = /[一-鿿]/.test(t('accountsTitle'))
        if (renamingId === account.id) {
          buttons.push(h('input', { key: 'rename-input', type: 'text', maxLength: 40, value: renameDraft, onChange: (e) => setRenameDraft(e.target.value), placeholder: account.label, style: { ...inputStyle(), width: 130, padding: '4px 8px', fontSize: 12 } }))
          buttons.push(h('button', { key: 'rename-save', type: 'button', style: buttonStyle, disabled: !!action || readOnly || !renameDraft.trim(), onClick: async () => { await accountAction('rename', account.id, { label: renameDraft.trim() }); setRenamingId(''); setRenameDraft('') } }, t('save')))
          buttons.push(h('button', { key: 'rename-cancel', type: 'button', style: buttonStyle, onClick: () => { setRenamingId(''); setRenameDraft('') } }, t('accountCancel')))
        } else {
          buttons.push(h('button', { key: 'rename', type: 'button', style: buttonStyle, disabled: !!action || dirty || readOnly, onClick: () => { setRenamingId(account.id); setRenameDraft(account.label || '') } }, zhAcct ? '改备注' : 'Rename'))
        }
        if (confirmAccountRemoval === account.id) {
          buttons.push(h('button', { key: 'confirm', type: 'button', style: buttonStyle, disabled: !!action || readOnly, onClick: () => accountAction('remove', account.id) }, t('accountConfirmRemove')))
          buttons.push(h('button', { key: 'cancel', type: 'button', style: buttonStyle, onClick: () => setConfirmAccountRemoval('') }, t('accountCancel')))
        } else {
          buttons.push(h('button', { key: 'remove', type: 'button', style: buttonStyle, disabled: !!action || dirty || readOnly || account.activeCalls > 0, onClick: () => setConfirmAccountRemoval(account.id) }, t('accountRemove')))
        }
        // A signed-in account states who it is and what it used; the sign-in command
        // is a repair path, so it only appears while there is no usable credential.
        otherRows.push(rowBlock(account.id, account.identity?.nickname || account.label,
          account.exhaustedUntil ? translate(t, 'accountExhausted', { time: formatTime(account.exhaustedUntil) }) : signedIn ? null : rowStatus(account),
          h(React.Fragment, null,
            signedIn && !cleanSigned ? identityLine(account.identity, account.identityCode) : null,
            signedIn ? null : h('div', { style: { display: 'grid', gap: 8 } },
              h('button', { type: 'button', style: { ...buttonStyle, justifySelf: 'start' }, disabled: !!action || dirty || readOnly || account.pathError, onClick: () => accountAction('prepareLogin', account.id) }, t('accountPrepare')),
              account.loginCommand ? h('code', { style: { overflowWrap: 'anywhere', fontSize: 12 } }, account.loginCommand) : null,
              account.loginCommand ? h('button', { type: 'button', style: { ...buttonStyle, justifySelf: 'start' }, onClick: () => copyLoginCommand(account.loginCommand) }, t('copyLogin')) : null)),
          buttons, signedIn, signedIn ? account.identity : null, account.identityCode ?? ''))
      }

      const logRequest = async (name) => {
        const response = await fetch(props.diagnosticsUrl ?? DIAGNOSTICS_PATH, name ? {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-DSH-CodeBuddy-Action': '1' },
          body: JSON.stringify({ action: name }), cache: 'no-store'
        } : { cache: 'no-store' })
        const result = await response.json()
        if (!response.ok) throw new Error('logs unavailable')
        return result
      }
      const logAction = async (name) => {
        setLogBusy(true); setNotice('')
        try {
          if (name === 'view') setLogReport(await logRequest())
          else if (name === 'preview') setLogReport(await logRequest('exportDetailedLogs'))
          else if (name === 'exportLogs' || name === 'exportDetailedLogs') {
            const report = await logRequest(name)
            const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json;charset=utf-8' }))
            const anchor = document.createElement('a')
            anchor.href = url
            anchor.download = `dsh-codebuddy-${props.region ?? 'cn'}-${name === 'exportLogs' ? 'basic' : 'detailed'}-${Date.now()}.json`
            document.body.appendChild(anchor); anchor.click(); anchor.remove()
            setTimeout(() => URL.revokeObjectURL(url), 1000)
            setNotice(t('logsExported'))
          } else {
            const result = await logRequest(name)
            if (!isStatus(result)) throw new Error('invalid status')
            setStatus(result)
            if (name === 'clearLogs') { setLogReport(null); setConfirmClear(false); setLogConsent(false) }
          }
        } catch { setNotice(t('logsFailed')) } finally { setLogBusy(false) }
      }
      // Mockup field row: fixed label column on the left, value area on the right.
      const label = (key, control) => h('label', { key, style: fieldRowStyle }, h('span', { style: fieldLabelStyle }, t(key)), h('div', { style: fieldValueStyle }, control))
      const textInput = (key, valueType = 'text', extra = {}) => label(key, h('input', {
        type: valueType, value: draft[key] ?? '',
        onChange: (event) => edit(key, valueType === 'number' ? Number(event.target.value) : event.target.value),
        spellCheck: false, style: inputStyle(), ...extra
      }))
      const catalog = status?.catalog
      const models = Array.isArray(catalog?.models) ? catalog.models : []
      const hiddenModels = new Set(Array.isArray(status?.modelPreferences?.hidden) ? status.modelPreferences.hidden : [])
      const selectedModels = models.filter((item) => selectedIds.has(item.id))
      const selectedModel = models.find((item) => item.id === (draft.model || catalog?.currentModelId))
      const efforts = selectedModel?.efforts ?? []
      const enabledCount = models.filter((item) => !hiddenModels.has(item.id)).length
      // One filter on screen -- the search box. Enabled models are pulled to the top
      // of the list instead of being filtered apart, so no row is ever hidden by a
      // state toggle and the header checkbox still selects exactly what is shown.
      const filtered = models.filter((item) => {
        if (modelStateFilter === 'enabled' && hiddenModels.has(item.id)) return false
        if (modelStateFilter === 'disabled' && !hiddenModels.has(item.id)) return false
        if (!`${item.name} ${item.id}`.toLowerCase().includes(search.toLowerCase())) return false
        if (capImages && item.supportsImages !== true) return false
        if (capReasoning && item.supportsReasoning !== true) return false
        if (capLowMult && !(typeof item.multiplier === 'number' && item.multiplier <= 1)) return false
        return true
      })
      const maxCtxWindow = Math.max(1, ...models.map((m) => Number(m.contextWindow) || 0))
      const sortValue = (item, key) => {
        if (key === 'modelName') return item.name ?? ''
        if (key === 'modelState') return hiddenModels.has(item.id) ? 1 : 0
        if (key === 'multiplier') return typeof item.multiplier === 'number' ? item.multiplier : Number.POSITIVE_INFINITY
        if (key === 'context') return item.contextWindow ?? 0
        return 0
      }
      // Enabled models always float to the top; a clicked column orders the rows
      // inside each of those two groups, never across them.
      const shown = filtered.slice().sort((a, b) => {
        const byState = Number(hiddenModels.has(a.id)) - Number(hiddenModels.has(b.id))
        if (byState !== 0) return byState
        if (!sortKey) return 0
        const va = sortValue(a, sortKey); const vb = sortValue(b, sortKey)
        const base = typeof va === 'string' ? va.localeCompare(vb) : va - vb
        return base * sortDir
      })
      const lastCall = status?.usage?.lastCall
      const streamNote = details => translate(t, 'streamDetail', {
        reason: details.streamReason ?? t('unknown'), phase: details.streamPhase ?? t('unknown'), index: details.frameIndex ?? t('unknown'),
        total: details.totalFrames ?? t('unknown'), bytes: details.frameBytes ?? t('unknown'), init: details.initCount ?? t('unknown'),
        final: details.finalResultCount ?? t('unknown'), last: details.lastFrameClass ?? t('unknown'), origin: details.terminationInitiator ?? t('unknown'),
        closed: details.closeObserved ?? t('unknown'), deadline: details.deadlineReached ?? t('unknown')
      })
      const nativeNote = details => translate(t, 'nativeDetail', { present: details.hasStructuredOutput ?? t('unknown'), type: details.structuredOutputType ?? t('unknown'), valid: details.resultTypeValid ?? t('unknown'), subtype: details.finalSubtypeClass ?? t('unknown') })
      const sizeValue = value => Number.isSafeInteger(value) && value >= 0 ? value : t('sizeUnknown')
      const budgetNote = details => ['envelope', 'cli-input'].includes(details?.requestLimitStage) ? translate(t, 'budgetDetail', {
        stage: t(details.requestLimitStage === 'envelope' ? 'budgetEnvelope' : 'budgetInput'), actual: sizeValue(details.requestBytes), limit: sizeValue(details.requestLimitBytes)
      }) : null
      const domesticResponseNote = (details) => {
        const reasons = { valid: 'parseValid', 'plain-text-fallback': 'parsePlainText', 'empty-result': 'parseEmpty', 'empty-content': 'parseEmpty', 'possibly-truncated-json': 'parseIncomplete', 'invalid-json': 'parseSyntax', 'ambiguous-json': 'parseAmbiguous', 'invalid-envelope': 'parseEnvelope', 'invalid-text-field': 'parseText', 'invalid-tool-calls-field': 'parseCalls', 'unknown-tool': 'parseUnknownTool', 'invalid-tool-arguments': 'parseArguments', 'invalid-tool-arguments-json': 'parseArguments' }
        return translate(t, 'responseDetail', {
          reason: reasons[details.reason] ? t(reasons[details.reason]) : details.reason,
          type: details.inputType, bytes: details.bytes ?? t('unknown'),
          normalized: details.normalizations?.length ? details.normalizations.join(', ') : t('noNormalization')
        })
      }
      const intlResponseNote = (details) => {
        const reasons = { valid: 'parseValid', 'plain-text-fallback': 'parsePlainText', 'empty-result': 'parseEmpty', 'empty-content': 'parseEmpty', 'possibly-truncated-json': 'parseIncomplete', 'native-structured-output-missing': 'parseOutputMissing', 'native-final-results': 'parseFinalCount', 'invalid-json': 'parseSyntax', 'ambiguous-json': 'parseAmbiguous', 'invalid-envelope': 'parseEnvelope', 'native-envelope': 'parseEnvelope', 'native-tool-envelope': 'parseCalls', 'invalid-text-field': 'parseText', 'invalid-tool-calls-field': 'parseCalls', 'unknown-tool': 'parseUnknownTool', 'invalid-tool-arguments': 'parseArguments', 'invalid-tool-arguments-json': 'parseArguments', 'native-result': 'parseNativeResult', 'cli-notice': 'parseNotice', 'cli-output-invalid': 'parseOutputInvalid', deadline: 'parseDeadline', 'error-frame': 'parseStreamError', 'permission-frame': 'parsePermissionFrame', 'result-before-init': 'parseResultBeforeInit', 'post-result-sequence': 'parsePostResult' }
        const valueTypes = { missing: 'factMissing', null: 'factNull', object: 'factObject', array: 'factArray', string: 'factString', number: 'factNumber', boolean: 'factBoolean', undefined: 'factUndefined' }
        const subtypeTypes = { missing: 'subtypeMissing', success: 'subtypeSuccess', error: 'subtypeError', other: 'subtypeOther' }
        const noticeClasses = { none: 'noticeNone', unclassified: 'noticeUnknown', 'context-limit': 'noticeContext', 'insufficient-balance': 'noticeBalance', authentication: 'noticeAuth', 'access-denied': 'noticeAccess', 'rate-limit': 'noticeRate', 'local-permission': 'noticeLocalPermission', network: 'noticeNetwork' }
        const noticeSources = { none: 'noticeNone', stderr: 'noticeSourceStderr', stdout: 'noticeSourceStdout', 'assistant-text': 'noticeSourceAssistant', 'error-frame': 'noticeSourceError', 'result-frame': 'noticeSourceResult', mixed: 'noticeSourceMixed' }
        const facts = details.hasStructuredOutput === undefined ? '' : translate(t, 'structuredFacts', {
          present: t(details.hasStructuredOutput ? 'factReported' : 'factMissing'),
          type: t(valueTypes[details.structuredOutputType] ?? 'unknown'),
          resultType: t(details.resultTypeValid ? 'factYes' : 'factNo'),
          subtype: t(subtypeTypes[details.finalSubtypeClass] ?? 'unknown')
        })
        const notice = details.noticeClass && details.noticeClass !== 'none' ? translate(t, 'noticeDetail', {
          classification: t(noticeClasses[details.noticeClass] ?? 'noticeUnknown'),
          source: t(noticeSources[details.noticeSource] ?? 'unknown')
        }) : ''
        return translate(t, 'responseDetail', {
          mode: details.outputMode === 'native-json-schema' ? t('nativeOutput') : t('unknown'),
          reason: reasons[details.reason] ? t(reasons[details.reason]) : (details.reason || t('unknown')),
          finals: details.finalResultCount ?? t('unknown'),
          type: details.inputType || t('unknown'), bytes: details.bytes ?? t('unknown'),
          normalized: details.normalizations?.length ? details.normalizations.join(', ') : t('noNormalization'), facts, notice
        })
      }
      const intlProcessNote = (details) => {
        if (!details?.streamReason) return null
        const reasons = { none: 'streamReasonNone', 'json-parse': 'streamReasonJson', 'frame-shape': 'streamReasonShape', 'duplicate-init': 'streamReasonDuplicateInit', 'post-result-sequence': 'streamReasonPostResult', 'result-before-init': 'streamReasonResultBeforeInit', 'multiple-results': 'streamReasonMultiple', 'error-frame': 'streamReasonError', 'permission-frame': 'streamReasonPermission', 'missing-init': 'streamReasonMissingInit', 'missing-result': 'streamReasonMissingResult', 'nonzero-exit': 'streamReasonExit', deadline: 'streamReasonDeadline', cancelled: 'streamReasonCancelled', 'output-too-large': 'streamReasonTooLarge', 'spawn-error': 'streamReasonSpawn' }
        const phases = { 'await-init': 'streamPhaseAwait', 'after-init': 'streamPhaseInit', 'after-result': 'streamPhaseResult', draining: 'streamPhaseDrain', closed: 'streamPhaseClosed' }
        const stages = { none: 'parseStageNone', line: 'parseStageLine', tail: 'parseStageTail' }
        const frames = { none: 'frameNone', 'system-init': 'frameInit', system: 'frameSystem', assistant: 'frameAssistant', result: 'frameResult', error: 'frameError', 'control-request': 'frameControl', other: 'frameOther', malformed: 'frameMalformed' }
        const terminators = { none: 'terminatorNone', 'adapter-error': 'terminatorAdapter', 'adapter-drain': 'terminatorDrain', deadline: 'terminatorDeadline', 'external-cancel': 'terminatorCancel', 'child-error': 'terminatorChildError', 'natural-close': 'terminatorClose', 'spawn-error': 'terminatorSpawn' }
        return translate(t, 'streamDetail', {
          reason: t(reasons[details.streamReason] ?? 'unknown'), phase: t(phases[details.streamPhase] ?? 'unknown'),
          stage: t(stages[details.parseStage] ?? 'unknown'), index: details.frameIndex ?? 0, count: details.frameCount ?? 0,
          bytes: details.frameBytes ?? 0, inits: details.initCount ?? 0, results: details.resultCount ?? 0,
          frame: t(frames[details.lastFrameClass] ?? 'unknown'), terminator: t(terminators[details.terminationInitiator] ?? 'unknown'),
          closed: t(details.closeObserved ? 'factYes' : 'factNo'), deadline: t(details.deadlineReached ? 'factYes' : 'factNo')
        })
      }
      const responseNote = details => props.region === 'intl' ? intlResponseNote(details) : domesticResponseNote(details)
      const regionProcessNote = details => props.region === 'intl' ? intlProcessNote(details) : streamNote(details)
      const cliState = status?.cliCheck?.state === 'available'
        ? translate(t, 'cliAvailable', { version: status.cliCheck.version })
        : status?.cliCheck?.state === 'unavailable' ? translate(t, 'cliUnavailable', { code: status.cliCheck.code }) : t('notChecked')
      const setupState = status?.setup?.state
      const cellStyle = { padding: '10px 8px', borderBottom: '1px solid rgba(127,127,127,.2)', textAlign: 'left', verticalAlign: 'top' }
      const chipStyle = { display: 'inline-flex', alignItems: 'center', padding: '1px 8px', borderRadius: 999, border: '1px solid rgba(127,127,127,.3)', fontSize: 12, opacity: .8, whiteSpace: 'nowrap' }
      // The strip names the account the same way its card does: the name the CLI
      // recorded, and only the placeholder while nothing is signed in.
      const activeAccount = status?.accounts?.accounts?.find((account) => account.selected) ?? null
      const activeAccountLabel = activeAccount ? (activeAccount.identity?.nickname || activeAccount.label) : (props.region === 'intl' ? '—' : t('accountLegacy'))

      // CSV export of the bounded recent-call ring, generated in the page.
      // No server endpoint is added and nothing is uploaded.
      const exportCallsCsv = () => {
        try {
          const header = ['at', 'model', 'state', 'durationMs', 'inputTokens', 'outputTokens', 'toolCalls', 'errorCode']
          const rows = (usageQuery?.recentCalls ?? status?.usage?.recentCalls ?? []).map((call) => [
            new Date(call.at ?? Date.now()).toISOString(), call.model ?? '', call.state ?? '',
            call.durationMs ?? '', call.inputTokens ?? 0, call.outputTokens ?? 0, call.toolCalls ?? 0, call.errorCode ?? ''
          ])
          const quoted = (cell) => '"' + String(cell).replaceAll('"', '""') + '"'
          const csv = [header, ...rows].map((row) => row.map(quoted).join(',')).join('\n')
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
          const url = URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          link.download = 'codebuddy-calls-' + new Date().toISOString().slice(0, 10) + '.csv'
          document.body.appendChild(link)
          link.click()
          link.remove()
          URL.revokeObjectURL(url)
        } catch { setNotice(t('actionFailed')) }
      }
      // Showing only the tail of the executable path keeps it recognisable in the
      // card without dumping a full Windows path.
      const cliExecutablePath = status?.cliCheck?.path ? (String(status.cliCheck.path).length > 38 ? '…' + String(status.cliCheck.path).slice(-36) : String(status.cliCheck.path)) : t('sizeUnknown')

      return h('div', { style: { height: '100%', boxSizing: 'border-box', overflowY: 'auto', padding: 'var(--dsh-frame-top-clearance, 20px) clamp(16px, 3vw, 40px) 32px', color: 'var(--dsw-alias-label-primary, inherit)' } },
        h('div', { style: { display: 'grid', gap: 20, maxWidth: 1120, margin: '0 auto', minWidth: 0 } },
        h('header', { style: { display: 'grid', gap: 10 } },
          h('div', { style: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' } },
            h('div', { style: { display: 'flex', alignItems: 'flex-start', gap: 12, minWidth: 0 } },
              h('div', { style: { width: 36, height: 36, borderRadius: 9, flex: '0 0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, letterSpacing: '.02em', color: '#fff', background: 'linear-gradient(135deg,#3d7cf0,#2456bd)', boxShadow: '0 1px 2px rgba(36,86,189,.35)' } }, 'CB'),
              h('div', { style: { display: 'grid', gap: 4, minWidth: 0 } },
                h('div', { style: { ...rowStyle, gap: 8 } },
                  h('h1', { style: { margin: 0, fontSize: 17, fontWeight: 650, letterSpacing: '-.01em' } }, t('sidebarEntry')), h(Hint, { label: t('hintShow') }, t('intro'))),
                h('p', { style: { margin: 0, fontSize: 12.5, color: T_MUTED, lineHeight: 1.5 } }, t('subtitle')))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
              status?.activeCalls > 0 ? h(Chip, { tone: 'ok' }, translate(t, 'active', { count: status.activeCalls })) : null,
              status?.pluginVersion ? h(Chip, { tone: 'brand' }, `v${status.pluginVersion}`) : null,
              status?.timeoutMs ? h('span', { style: { fontSize: 12, color: T_MUTED, whiteSpace: 'nowrap' } }, translate(t, 'timeoutChip', { seconds: status.timeoutMs / 1000 })) : null)),
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
            ...[['connection', t('statCli'), cliState, status?.cliCheck?.state === 'available' ? 'ok' : 'plain'], ['models', t('statModels'), `${enabledCount} / ${models.length}`, 'ok'], ['accounts', t('statAccount'), activeAccountLabel, status?.accountError ? 'err' : 'ok'], ['usage', t('statCalls'), String(status?.usage?.calls ?? 0), 'plain']].map(([group, label, value, tone]) =>
              h('button', { key: group, type: 'button', onClick: () => setActiveSection(group), style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, border: `1px solid ${activeSection === group ? T_BRAND : T_LINE}`, background: activeSection === group ? 'rgba(37,99,235,.1)' : 'rgba(127,127,127,.04)', color: T_TEXT, cursor: 'pointer', font: 'inherit', fontSize: 12 } },
                h('span', { style: { width: 6, height: 6, borderRadius: '50%', flex: '0 0 auto', background: tone === 'err' ? '#ef4444' : tone === 'ok' ? T_OK : 'rgba(127,127,127,.45)' } }),
                h('span', { style: { color: T_MUTED } }, label),
                h('strong', { style: { fontWeight: 600, fontVariantNumeric: 'tabular-nums' } }, value))))),
        h('nav', { 'aria-label': t('pageSections'), style: { display: 'flex', gap: 2, margin: '4px 0 0', borderBottom: `1px solid ${T_LINE}`, overflowX: 'auto' } },
          ...groups.map(group => h('button', { key: group, type: 'button', 'aria-pressed': activeSection === group, onClick: () => setActiveSection(group), style: { border: 0, background: 'transparent', padding: '10px 14px', font: 'inherit', fontSize: 13.5, color: activeSection === group ? T_BRAND : T_MUTED, cursor: 'pointer', borderBottom: `2px solid ${activeSection === group ? T_BRAND : 'transparent'}`, marginBottom: -1, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 6, fontWeight: activeSection === group ? 600 : 400 } }, h(Icon, { kind: group, size: 15 }), t('nav' + group)))),
        h(SettingsSection, { active: activeSection, group: 'connection', style: sectionStyle(), 'aria-label': t('quickSetup') },
          h(SectionHeading, { kind: 'connection', hint: h(Hint, { label: t('hintShow') }, [t('setupNote'), t('cliCheckNote')].join(' ')), actions: h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
            h(Chip, { tone: status?.cliCheck?.state === 'available' ? 'ok' : 'plain' }, setupState === 'installing' ? t('installing') : setupState === 'detecting' ? t('detecting') : cliState),
            h('button', { type: 'button', disabled: netProbeBusy || !!action || snapshot?.status !== 'ready', onClick: probeNetwork, style: buttonStyle }, netProbeBusy ? (/[一-鿿]/.test(t('quickSetup')) ? '测速中…' : 'Testing…') : (/[一-鿿]/.test(t('quickSetup')) ? '测试连通性' : 'Test network')),
            h('button', { type: 'button', disabled: checking || !!action || dirty || snapshot?.status !== 'ready', onClick: checkCli, style: buttonStyle }, checking ? t('inspectBusy') : t('inspect')),
            h('button', { type: 'button', disabled: !!action || dirty || readOnly, onClick: setup, style: primaryButtonStyle }, action === 'setup' ? t('setupBusy') : t('setup'))) }, t('quickSetup')),
          h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 } },
            h('div', { style: { border: `1px solid ${T_LINE}`, borderRadius: 10, padding: '9px 12px', minWidth: 0 } },
              h('div', { style: { fontSize: 11.5, color: T_MUTED } }, t('cliExecutable')),
              h('code', { title: status?.cliCheck?.path || '', style: { fontSize: 12.5, display: 'block', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, cliExecutablePath)),
            h('div', { style: { border: `1px solid ${T_LINE}`, borderRadius: 10, padding: '9px 12px', minWidth: 0 } },
              h('div', { style: { fontSize: 11.5, color: T_MUTED } }, t('cliVersionLabel')),
              h('code', { style: { fontSize: 12.5, display: 'block', marginTop: 2 } }, status?.cliCheck?.version || t('sizeUnknown'))),
            h('div', { style: { border: `1px solid ${T_LINE}`, borderRadius: 10, padding: '9px 12px', minWidth: 0 } },
              h('div', { style: { fontSize: 11.5, color: T_MUTED } }, /[\u4e00-\u9fff]/.test(t('quickSetup')) ? '最近检查' : 'Last checked'),
              h('code', { style: { fontSize: 12.5, display: 'block', marginTop: 2 } }, status?.cliCheck?.checkedAt ? formatTime(status.cliCheck.checkedAt) : t('sizeUnknown')))),
          netProbe ? h('div', { role: 'status', style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', padding: '8px 12px', borderRadius: 10, fontSize: 12.5, border: `1px solid ${netProbe.ok ? 'rgba(22,163,74,.35)' : 'rgba(239,68,68,.35)'}`, background: netProbe.ok ? 'rgba(22,163,74,.08)' : 'rgba(239,68,68,.08)', color: T_TEXT } },
            h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
              h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: netProbe.ok ? T_OK : '#ef4444', flex: '0 0 auto' } }),
              h('strong', null, netProbe.ok
                ? (/[一-鿿]/.test(t('quickSetup')) ? `连通正常 · ${netProbe.elapsedMs ?? 0} ms (HTTP ${netProbe.status || '-'})` : `Reachable · ${netProbe.elapsedMs ?? 0} ms (HTTP ${netProbe.status || '-'})`)
                : (/[一-鿿]/.test(t('quickSetup')) ? `${netProbe.code === 'PROBE_TIMEOUT' ? '连接超时' : '连接失败'} (${netProbe.elapsedMs ?? 0} ms)` : `${netProbe.code === 'PROBE_TIMEOUT' ? 'Timed out' : 'Unreachable'} (${netProbe.elapsedMs ?? 0} ms)`)),
              !netProbe.ok && netProbe.message ? h('span', { style: { color: T_MUTED } }, netProbe.message) : null),
            netProbe.target ? h('code', { style: { fontSize: 11.5, color: T_MUTED } }, netProbe.target.replace(/^https?:\/\//u, '') + (netProbe.viaProxy ? ` via ${netProbe.viaProxy}` : '')) : null) : null,
          h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', fontSize: 12, color: T_MUTED } },
            h('span', null, t('cliCheckNote')),
            h('a', { href: props.region === 'intl' ? 'https://www.codebuddy.ai/docs/cli/installation' : 'https://www.codebuddy.cn/docs/cli/installation', target: '_blank', rel: 'noreferrer', style: { color: T_BRAND, textDecoration: 'none', whiteSpace: 'nowrap' } }, `${t('installationGuide')} ↗`)),
          props.region !== 'intl' ? h('details', { open: catalog?.errorCode === 'CLI_LOGIN_REQUIRED' || lastCall?.errorCode === 'CLI_AUTH_REQUIRED' || undefined, style: { border: `1px solid ${T_LINE}`, borderRadius: 10, padding: '10px 14px', background: 'rgba(127,127,127,.02)' } },
            h('summary', { style: { cursor: 'pointer', fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8, listStyle: 'none', color: T_TEXT } },
              t('loginTitle'),
              h('span', { style: { marginLeft: 'auto', fontSize: 11, color: T_MUTED } }, '▶')),
            h('div', { style: { display: 'grid', gap: 10, marginTop: 12 } },
              h(Notice, null, status?.loginCommand ? t('loginHelp') : t('loginMissing')),
              status?.loginCommand ? h(React.Fragment, null,
                h('code', { style: { ...inputStyle(), display: 'block', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' } }, status.loginCommand),
                h('button', { type: 'button', onClick: copyLogin, style: { ...buttonStyle, justifySelf: 'start' } }, t('copyLogin'))) : null)) : null),
        status?.accounts ? h(SettingsSection, { active: activeSection, group: 'accounts', style: sectionStyle(), 'aria-label': t('accountsTitle') },
          // Both page-level actions live in the card header, on the title line, so
          // they sit where the user looks for them instead of on a stray row.
          h(SectionHeading, { kind: 'accounts', hint: h(Hint, { label: t('hintShow') }, [t('accountValidation'), t('accountPrivacy')].join(' ')) }, t('accountsTitle')),
          h('p', { style: { margin: '-4px 0 0', fontSize: 12.5, color: T_MUTED, lineHeight: 1.5, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
            h('span', null, t('accountNote')),
            status.cliRuntime === 'native' ? h(Hint, { label: t('hintShow') }, t('accountNativeNotice')) : null),
          status.accounts.storageError ? h('p', { role: 'alert' }, t('accountStoreError')) : null,
          status?.accountError ? h('div', { role: 'alert', style: { padding: '9px 12px', borderRadius: 10, border: '1px solid rgba(239,68,68,.35)', background: 'rgba(239,68,68,.08)', fontSize: 12.5, color: T_TEXT, display: 'grid', gap: 4 } },
            h('strong', null, `${/[一-鿿]/.test(t('accountsTitle')) ? '当前账号状态异常' : 'Active account check failed'} (${status.accountError})`),
            guidance(status.accountError) ? h('span', { style: { color: T_MUTED } }, guidance(status.accountError)) : null) : null,
          !status.accounts.supported ? h(Notice, null, t('accountUnsupported')) : h(React.Fragment, null,

            // Four facts as compact jump pills so the Account Overview card stays the visual anchor.
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
              ...summaryCells.map(([target, label, value, tone], index) => h('button', { key: label + index, type: 'button', onClick: () => {
                const go = () => {
                  const scope = document.querySelector(`[data-region="${props.region ?? 'cn'}"]`)
                  const node = scope?.querySelector(`#${target}`) || document.getElementById(target)
                  if (node) node.scrollIntoView({ block: 'nearest' })
                }
                // The rotation switch moved to the connection page, so this cell
                // switches page first and only then scrolls to it.
                if (target === 'cb-rewrite') { setActiveSection('connection'); setTimeout(go, 60) } else go()
              }, style: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 11px', borderRadius: 999, border: `1px solid ${T_LINE}`, background: 'rgba(127,127,127,.04)', color: T_TEXT, cursor: 'pointer', font: 'inherit', fontSize: 12, minWidth: 0 } },
                h('span', { style: { color: T_MUTED } }, t(label)),
                h('strong', { style: { fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: tone ? T_TEXT : T_MUTED } }, value)))),
            h('div', { id: 'cb-account-current', style: ACCT.card },
              h('div', { style: ACCT.head },
                // One module for everything: the current account's card and the list of
                // the others used to be two blocks, which read as two features.
                h(Icon, { kind: 'accounts', size: 15 }),
                h('strong', { style: ACCT.title }, t('accountOverviewTitle')),
                noDefaultHere ? null : currentAccount && currentAccount.exhaustedUntil
                  ? h(Chip, { tone: 'plain' }, translate(t, 'accountExhausted', { time: formatTime(currentAccount.exhaustedUntil) }))
                  : h(Chip, { tone: 'brand' }, t('accountSelected')),
                noDefaultHere || currentAccount ? null : h(Chip, { tone: 'plain' }, t('accountDefaultAccount')),
                noDefaultHere || currentAccount ? null : h(Chip, { tone: 'plain' }, t('accountReadOnly')),
                h('span', { style: { flex: 1, minWidth: 8 } }),
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                  h('button', { type: 'button', disabled: !!action || !!maintBusy || dirty || readOnly || !!status.accounts.storageError, style: primaryButtonStyle, onClick: refreshAll, title: t('quotaRefreshAllNote') }, t('quotaRefresh')),
                  h('button', { type: 'button', disabled: !!action || !!maintBusy || dirty || readOnly || !!status.accounts.storageError, style: buttonStyle, onClick: () => runMaintenance('checkin', { all: true }) }, maintBusy === 'checkin' ? t('checkinBusy') : t('checkinAll')),
                  h('button', { type: 'button', disabled: !!action || !!maintBusy || dirty || readOnly || !!status.accounts.storageError, style: buttonStyle, onClick: () => runMaintenance('keepalive', { all: true }) }, maintBusy === 'keepalive' ? t('keepaliveBusy') : t('keepaliveAll')),
                  status.cliRuntime === 'native' ? h('button', { type: 'button', style: buttonStyle, onClick: revealCliPath }, t('accountPickProgram')) : null)),
              noDefaultHere
                ? h('div', { style: { ...ACCT.body, gridTemplateColumns: '1fr' } },
                  h('span', { style: { fontSize: 12.5, color: T_MUTED, lineHeight: 1.5 } }, t('accountDefaultEmpty')))
                : h(React.Fragment, null,
                  h('div', { style: { ...ACCT.body, gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 18, alignItems: 'start' } },
                    h('div', { style: { display: 'grid', gap: 10, minWidth: 0 } },
                      currentIdentity?.present && currentIdentityCode === ''
                        ? h('div', { style: { display: 'grid', gap: 6, minWidth: 0 } },
                          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                            h('strong', { style: { fontSize: 16, fontWeight: 700, color: T_TEXT, lineHeight: 1.3 } }, currentIdentity.nickname || currentLabel),
                            h(Chip, { tone: 'ok' }, t('accountStatusSignedIn'))),
                          h('span', { style: { fontSize: 12, color: T_MUTED, fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace' } },
                            `${currentIdentity.uid ? currentIdentity.uid.slice(0, 8) : t('sizeUnknown')} · ${/[\u4e00-\u9fff]/.test(t('accountOverviewTitle')) ? '凭据有效至' : 'Valid until'} ${currentIdentity.expiresAt ? formatTime(currentIdentity.expiresAt) : t('sizeUnknown')}`))
                        : identityLine(currentIdentity, currentIdentityCode),
                      maintBadgeLine(currentKey),
                      balances[currentKey]?.available ? creditPackages(currentKey, 'start') : null,
                      !currentSignedIn && currentAccount?.loginCommand ? h('div', { style: { display: 'grid', gap: 8, marginTop: 2 } },
                        h('code', { style: { overflowWrap: 'anywhere', fontSize: 12 } }, currentAccount.loginCommand),
                        h('button', { type: 'button', style: { ...buttonStyle, justifySelf: 'start' }, onClick: () => copyLoginCommand(currentAccount.loginCommand) }, t('copyLogin'))) : null),
                    h('div', { style: { display: 'grid', gap: 6, justifyItems: 'stretch', minWidth: 0 } },
                      creditPanel(currentKey, { showPackages: false }),
                      quotaNoteLine(currentKey))),
                  h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', padding: '10px 14px', borderTop: `1px solid ${T_LINE}`, fontSize: 12, color: T_MUTED } },
                    usageLine(currentAccount || { usage: status?.usage }),
                    currentAccount ? lastUsedLine(currentAccount) : null)),
              // The other accounts live inside the same card, right under the current one.
              otherRows.length ? h('div', { id: 'cb-account-list' }, otherRows) : null),
            h('div', { id: 'cb-account-add', style: ACCT.card },
              h('div', { style: ACCT.head },
                h('strong', { style: ACCT.title }, t('accountAddTitle')),
                h('span', { style: { flex: 1, minWidth: 8 } }),
                addStep ? null : h('button', { type: 'button', style: primaryButtonStyle, disabled: !!action || dirty || readOnly || !!status.accounts.storageError, onClick: addAccount }, t('accountAdd'))),
              addStep ? h('div', { style: { ...ACCT.body, gap: 8 } },
                h('span', { style: { fontSize: 12.5, color: T_MUTED } }, t('accountLoginStart')),
                addCommand ? h('code', { style: { overflowWrap: 'anywhere', fontSize: 12 } }, addCommand) : h('span', { style: { fontSize: 12.5, color: T_MUTED } }, t('accountLoginGenerating')),
                h('div', { style: { ...rowStyle, padding: 0, gap: 8 } },
                  addCommand ? h('button', { type: 'button', style: buttonStyle, onClick: () => copyLoginCommand(addCommand) }, t('copyLogin')) : null,
                  h('button', { type: 'button', style: primaryButtonStyle, disabled: !!action || readOnly || !pendingAdd || !addCommand, onClick: confirmAccountLogin }, t('accountLoginDone')),
                  h('button', { type: 'button', style: buttonStyle, disabled: !!action || readOnly, onClick: cancelAdd }, t('accountLoginCancel')))) : null),
            h('details', { style: { border: `1px solid ${T_LINE}`, borderRadius: 12, padding: '12px 16px', background: 'rgba(127,127,127,.02)' } },
              h('summary', { style: { cursor: 'pointer', fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', listStyle: 'none', color: T_TEXT } },
                t('accountGuide'),
                h(Hint, { label: t('hintShow') }, [t('accountGuideSteps'), t('accountGuideErrors')].join(' ')),
                h('span', { style: { marginLeft: 'auto', fontSize: 11, color: T_MUTED } }, '▶')),
              h('div', { style: { marginTop: 10 } }, h(Notice, null, t('accountRemoved')))))) : null,
        h(SettingsSection, { id: 'cb-rewrite', active: activeSection, group: 'connection', style: sectionStyle(), 'aria-label': t('rewriteTitle') },
          h(SectionHeading, { kind: 'connection', actions: h(Chip, { tone: 'plain' }, /[\u4e00-\u9fff]/.test(t('rewriteTitle')) ? '切换即保存' : 'Auto-saved') }, t('rewriteTitle')),
          h('div', { style: switchRowStyle },
            h('div', { style: switchTextStyle },
              h('strong', { style: switchTitleStyle }, t('rewriteClientNames')),
              h('span', { style: switchSubStyle }, t('rewriteClientNamesToggle'))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 } }, h(Hint, { label: t('hintShow') }, t('rewriteClientNamesNote')),
              h(Switch, { checked: draft.rewriteClientNames !== false, disabled: busy || rewriteBusy || !!action || dirty || readOnly, label: t('rewriteClientNames'), onChange: saveRewrite }))),
          rewriteBusy ? h(Notice, null, t('saving')) : null,
          status?.usage?.lastCall?.diagnostics?.rewrite
            ? h('div', { style: { fontSize: 11.5, color: T_MUTED, lineHeight: 1.45, marginTop: -4 } }, translate(t, 'rewriteAudit', { hits: status.usage.lastCall.diagnostics.rewrite.hits ?? 0, residual: status.usage.lastCall.diagnostics.rewrite.residual ?? 0 }))
            : null,
          // Opt-in capture of a redacted request sample. Same reasoning as the
          // identity switch: it commits on its own, so it never depends on the
          // advanced connection form being expanded or its Save being pressed.
          h('div', { style: { ...switchRowStyle, borderTop: `1px solid ${T_LINE}`, paddingTop: 12 } },
            h('div', { style: switchTextStyle },
              h('strong', { style: switchTitleStyle }, t('captureRequestSamples')),
              h('span', { style: switchSubStyle }, t('captureRequestSamplesToggle'))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 } }, h(Hint, { label: t('hintShow') }, t('captureRequestSamplesNote')),
              h(Switch, { checked: draft.captureRequestSamples === true, disabled: busy || captureBusy || !!action || dirty || readOnly, label: t('captureRequestSamples'), onChange: saveCapture }))),
          captureBusy ? h(Notice, null, t('saving')) : null,

          h('div', { style: { ...switchRowStyle, borderTop: `1px solid ${T_LINE}`, paddingTop: 12 } },
            h('div', { style: switchTextStyle },
              h('strong', { style: switchTitleStyle }, t('imageBase64')),
              h('span', { style: switchSubStyle }, t('imageBase64Toggle'))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 } }, h(Hint, { label: t('hintShow') }, t('imageBase64Note')),
              h(Switch, { checked: draft.imageBase64 !== false, disabled: busy || prefBusy || !!action || dirty || readOnly, label: t('imageBase64'), onChange: (next) => savePref('imageBase64', next) }))),
          prefBusy ? h(Notice, null, t('saving')) : null,
          // Failing over to another account when one runs out of credits. It commits
          // the moment it moves, like the switches above it.
          h('div', { style: { ...switchRowStyle, borderTop: `1px solid ${T_LINE}`, paddingTop: 12 } },
            h('div', { style: switchTextStyle },
              h('strong', { style: switchTitleStyle }, t('accountRotation')),
              h('span', { style: switchSubStyle }, t('accountRotationToggle'))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 } }, h(Hint, { label: t('hintShow') }, t('accountRotationNote')),
              h(Switch, { checked: rotationOn, disabled: !!action || dirty || readOnly || !!status?.accounts?.storageError, label: t('accountRotation'), onChange: (next) => accountAction('rotation', null, { mode: next ? 'quota' : 'off' }) }))),
          h('div', { style: { ...switchRowStyle, borderTop: `1px solid ${T_LINE}`, paddingTop: 12 } },
            h('div', { style: switchTextStyle },
              h('strong', { style: switchTitleStyle }, t('autoCheckin')),
              h('span', { style: switchSubStyle }, t('autoCheckinToggle'))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 } }, h(Hint, { label: t('hintShow') }, t('autoCheckinNote')),
              h(Switch, { checked: draft.autoCheckin === true, disabled: busy || prefBusy || !!action || dirty || readOnly, label: t('autoCheckin'), onChange: (next) => savePref('autoCheckin', next) }))),
          h('div', { style: { ...switchRowStyle, borderTop: `1px solid ${T_LINE}`, paddingTop: 12 } },
            h('div', { style: switchTextStyle },
              h('strong', { style: switchTitleStyle }, t('autoTokenKeepalive')),
              h('span', { style: switchSubStyle }, t('autoTokenKeepaliveToggle'))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 } }, h(Hint, { label: t('hintShow') }, t('autoTokenKeepaliveNote')),
              h(Switch, { checked: draft.autoTokenKeepalive === true, disabled: busy || prefBusy || !!action || dirty || readOnly, label: t('autoTokenKeepalive'), onChange: (next) => savePref('autoTokenKeepalive', next) }))),
          h('div', { style: { ...switchRowStyle, borderTop: `1px solid ${T_LINE}`, paddingTop: 12 } },
            h('div', { style: switchTextStyle },
              h('strong', { style: switchTitleStyle }, t('allowCliCredentialRefresh')),
              h('span', { style: switchSubStyle }, t('allowCliCredentialRefreshToggle'))),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 } }, h(Hint, { label: t('hintShow') }, t('allowCliCredentialRefreshNote')),
              h(Switch, { checked: draft.allowCliCredentialRefresh === true, disabled: busy || prefBusy || !!action || dirty || readOnly, label: t('allowCliCredentialRefresh'), onChange: (next) => savePref('allowCliCredentialRefresh', next) }))),
          h('div', { style: { ...switchRowStyle, borderTop: `1px solid ${T_LINE}`, paddingTop: 12 } },
            h('div', { style: switchTextStyle },
              h('strong', { style: switchTitleStyle }, /[一-鿿]/.test(t('quickSetup')) ? '纯文本流式帧通道（实时探活）' : 'Stream-JSON channel for text'),
              h('span', { style: switchSubStyle }, /[一-鿿]/.test(t('quickSetup')) ? '开启后纯文本请求改走 stream-json 逐帧解析，可实时捕获 init 阶段与网络异常，配合首包超时避免死节点干等' : 'Use stream-json framing for text requests to observe init/upstream phases and fail fast on stalled nodes')),
            h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 } },
              h(Switch, { checked: draft.textStreamMode === true, disabled: busy || prefBusy || !!action || dirty || readOnly, label: /[一-鿿]/.test(t('quickSetup')) ? '纯文本流式帧通道' : 'Stream-JSON channel for text', onChange: (next) => savePref('textStreamMode', next) })))),
        // Low-frequency connection parameters come last and stay collapsed, so the
        // two request-behaviour switches above remain first-screen content.
        h(SettingsDetails, { active: activeSection, group: 'connection', 'data-cli-advanced': '1', style: { ...sectionStyle(), display: 'block' }, 'aria-label': t('settings') },
          h('summary', { style: { cursor: 'pointer', fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', color: T_TEXT, listStyle: 'none' } },
            h(Icon, { kind: 'connection', size: 15 }),
            t('settings'),
            h(Hint, { label: t('hintShow') }, [t('modelNote'), t('timeoutHelp')].join(' ')),
            h('span', { style: { marginLeft: 'auto', fontSize: 11, color: T_MUTED } }, '▶')),
          h('div', { style: { display: 'grid', gap: 12, marginTop: 14 } },
          textInput('cliPath', 'text', { 'data-cli-path': '1' }), textInput('configDir'),
          // Model selector backed by the synced catalog; preserves any unlisted/custom id
          // already saved and auto-resets effort if the newly selected model doesn't support it.
          label('model', h('select', {
            value: draft.model ?? '',
            disabled: busy || !!action || readOnly,
            onChange: (event) => {
              const nextModelId = event.target.value
              const targetModel = models.find((item) => item.id === (nextModelId || catalog?.currentModelId))
              const nextEfforts = targetModel?.efforts ?? []
              setDraft((old) => {
                const keepEffort = !old.effort || nextEfforts.some((item) => item.id === old.effort)
                return { ...old, model: nextModelId, effort: keepEffort ? old.effort : '' }
              })
              setDirty(true)
              setNotice('')
            },
            style: { ...inputStyle(), background: 'var(--dsw-alias-background-primary, Canvas)' }
          },
            h('option', { value: '' }, catalog?.currentModelId ? `${t('followDefault')} (${catalog.currentModelId})` : t('followDefault')),
            ...models.filter((item) => !hiddenModels.has(item.id)).map((item) => h('option', { key: item.id, value: item.id }, `${item.name} (${item.id})${typeof item.multiplier === 'number' ? ` · ×${item.multiplier}` : ''}`)),
            draft.model && !models.some((item) => !hiddenModels.has(item.id) && item.id === draft.model) ? h('option', { value: draft.model }, draft.model) : null)),
          label('effort', h('select', { value: draft.effort ?? '', disabled: busy || !!action || readOnly, onChange: (event) => edit('effort', event.target.value), style: { ...inputStyle(), background: 'var(--dsw-alias-background-primary, Canvas)' } },
            h('option', { value: '' }, t('followDefault')),
            ...efforts.map((item) => h('option', { key: item.id, value: item.id }, item.name)),
            draft.effort && !efforts.some((item) => item.id === draft.effort) ? h('option', { value: draft.effort }, draft.effort) : null)),
          textInput('timeoutMs', 'number', { min: 15000, max: 600000, step: 1000 }),
          h('label', { style: { display: 'grid', gap: 6, fontSize: 13 } },
            h('span', { style: { fontWeight: 500, color: T_TEXT } }, /[一-鿿]/.test(t('quickSetup')) ? '首包/无响应超时（毫秒，可选）' : 'First-byte / stall timeout (ms, optional)'),
            h('input', {
              type: 'number', min: 0, max: 600000, step: 1000,
              value: draft.firstByteTimeoutMs ?? 0,
              disabled: busy || !!action || readOnly,
              onChange: (event) => edit('firstByteTimeoutMs', event.target.value),
              style: inputStyle()
            }),
            h('span', { style: { fontSize: 11.5, color: T_MUTED } }, /[一-鿿]/.test(t('quickSetup')) ? '0 表示关闭；填 15000–600000（推荐国际版 45000–60000），在无首包/无上游响应帧时提前中止，避免死等总超时。' : '0 disables; set 15000–600000 ms (e.g. 45000–60000) to fail fast when no upstream output arrives.')),
          // 0 keeps the previous unbounded behaviour, so an untouched form field
          // never starts queueing requests behind an accidental default.
          // The bound matches what both providers clamp to (0-32); offering a higher
          // number here would look accepted and then be silently lowered.
          label('maxConcurrency', h('div', { style: { display: 'grid', gap: 4 } },
            h('input', {
              type: 'number', min: 0, max: 32, step: 1,
              value: draft.maxConcurrency ?? 0,
              disabled: busy || !!action || readOnly,
              onChange: (event) => edit('maxConcurrency', event.target.value),
              style: inputStyle()
            }),
            h('span', { style: { fontSize: 11.5, color: T_MUTED } }, /[\u4e00-\u9fff]/.test(t('quickSetup')) ? '0 表示不限制并发（可填 0–32，超限时本地排队等待）' : '0 = unlimited concurrency (0–32; excess calls queue locally)'))),
          h('label', { style: { display: 'grid', gap: 6, fontSize: 13 } },
            h('span', { style: { fontWeight: 500, color: T_TEXT } }, /[一-鿿]/.test(t('quickSetup')) ? 'CLI 代理地址（可选）' : 'CLI proxy URL (optional)'),
            h('input', {
              type: 'text',
              value: draft.proxyUrl ?? '',
              placeholder: 'http://127.0.0.1:7897',
              disabled: busy || !!action || readOnly,
              onChange: (event) => edit('proxyUrl', event.target.value),
              style: inputStyle()
            }),
            h('span', { style: { fontSize: 11.5, color: T_MUTED } }, /[一-鿿]/.test(t('quickSetup')) ? '留空时继承系统环境；填写后仅注入本区 CLI 子进程与连通性探测（支持 http:// / https:// / socks5://）。' : 'Leave empty to inherit system env; applies only to this region\'s CLI child processes and connectivity probe.')),
          h('div', { style: rowStyle }, h('button', { type: 'button', disabled: busy || !!action || !dirty || readOnly, onClick: save, style: buttonStyle }, busy ? t('saving') : t('save'))),
          dirty ? h(Notice, null, t('saveFirst')) : null)),
        h(SettingsSection, { active: activeSection, group: 'models', style: sectionStyle(), 'aria-label': t('models') },
          h(SectionHeading, { kind: 'models', actions: h('div', { style: { ...rowStyle, gap: 8, flexWrap: 'nowrap', padding: 0 } },
            h(Chip, { tone: enabledCount ? 'ok' : 'plain' }, translate(t, 'modelsEnabledChip', { total: models.length, enabled: enabledCount })),
            Number.isFinite(catalog?.fetchedAt) ? h('span', { style: { fontSize: 12, color: T_MUTED, whiteSpace: 'nowrap' } }, translate(t, 'modelsUpdatedAt', { time: formatTime(catalog.fetchedAt) })) : null,
            h('button', { type: 'button', disabled: !!action || dirty || snapshot?.status !== 'ready', onClick: refreshModels, style: { ...buttonStyle, padding: '6px 10px' } }, action === 'refreshModels' || catalog?.state === 'checking' ? t('refreshing') : t('refreshModels'))) }, t('models')),
          !models.length ? h(Notice, null, catalog?.errorMessage || t('catalogEmpty')) : null,
          catalog?.state === 'stale' ? h(Notice, null, translate(t, 'catalogStale', { message: catalog.errorMessage })) : null,
          h('div', { style: { ...rowStyle, gap: 8, fontSize: 12, color: T_MUTED } }, h(Notice, null, t('imagesShort')),
            h('a', { href: t('toolCoverageUrl'), target: '_blank', rel: 'noreferrer' }, t('toolCoverage')), h(Hint, { label: t('hintShow') }, t('imagesHelp'))),
          models.length ? h(React.Fragment, null,
            // One toolbar row: the model count, the batch actions, then the search box.
            // The batch actions hold a fixed place and simply arm themselves once a row
            // is selected, so the toolbar never reflows under the pointer.
            h('div', { style: { ...rowStyle, gap: 8 } },
              h(Segmented, {
                ariaLabel: t('modelState'),
                value: modelStateFilter,
                onChange: setModelStateFilter,
                options: [
                  { value: 'all', label: translate(t, 'modelsTabAll', { count: models.length }) },
                  { value: 'enabled', label: `${t('modelEnabled')} ${enabledCount}` },
                  { value: 'disabled', label: `${t('modelDisabled')} ${models.length - enabledCount}` }
                ]
              }),
              h('button', { type: 'button', disabled: !selectedModels.length || !!action || dirty || readOnly, onClick: () => toggleSelectedModels(false), style: selectedModels.length ? { ...buttonStyle, borderColor: T_BRAND, color: T_BRAND } : buttonStyle }, selectedModels.length ? `${t('disableSelected')} (${selectedModels.length})` : t('disableSelected')),
              h('button', { type: 'button', disabled: !selectedModels.length || !!action || dirty || readOnly, onClick: () => toggleSelectedModels(true), style: selectedModels.length ? primaryButtonStyle : buttonStyle }, selectedModels.length ? `${t('enableSelected')} (${selectedModels.length})` : t('enableSelected')),
              h('button', { type: 'button', disabled: !selectedModels.length || !!action || dirty || readOnly, onClick: () => setSelectedIds(new Set()), style: buttonStyle }, t('clearSelection')),
              lastBatch ? h('button', { type: 'button', disabled: !!action || dirty || readOnly, onClick: undoBatch, style: buttonStyle }, t('undoBatch')) : null,
              h('input', { type: 'search', value: search, onChange: (event) => setSearch(event.target.value), placeholder: t('searchModels'), 'aria-label': t('searchModels'), style: { ...inputStyle(), flex: '1 1 180px', minWidth: 140 } }),
              h('div', { style: { display: 'inline-flex', alignItems: 'center', background: T_SOFT, borderRadius: 10, padding: 3, gap: 2 } },
                h('button', { type: 'button', 'aria-pressed': capImages, onClick: () => setCapImages(v => !v), style: { border: 0, padding: '4px 10px', borderRadius: 7, font: 'inherit', fontSize: 12, cursor: 'pointer', background: capImages ? 'var(--dsw-alias-background-primary, Canvas)' : 'transparent', color: capImages ? T_TEXT : T_MUTED, fontWeight: capImages ? 600 : 400 } }, t('images')),
                h('button', { type: 'button', 'aria-pressed': capReasoning, onClick: () => setCapReasoning(v => !v), style: { border: 0, padding: '4px 10px', borderRadius: 7, font: 'inherit', fontSize: 12, cursor: 'pointer', background: capReasoning ? 'var(--dsw-alias-background-primary, Canvas)' : 'transparent', color: capReasoning ? T_TEXT : T_MUTED, fontWeight: capReasoning ? 600 : 400 } }, t('efforts')),
                h('button', { type: 'button', 'aria-pressed': capLowMult, onClick: () => setCapLowMult(v => !v), style: { border: 0, padding: '4px 10px', borderRadius: 7, font: 'inherit', fontSize: 12, cursor: 'pointer', background: capLowMult ? 'var(--dsw-alias-background-primary, Canvas)' : 'transparent', color: capLowMult ? T_TEXT : T_MUTED, fontWeight: capLowMult ? 600 : 400 } }, '≤1×'))),
            h('div', { style: { overflow: 'auto', maxHeight: 540, border: `1px solid ${T_LINE}`, borderRadius: 10 } }, h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 14 } },
              h('thead', { style: { position: 'sticky', top: 0, zIndex: 2, background: 'var(--dsw-alias-background-primary, Canvas)', boxShadow: `0 1px 0 ${T_LINE}` } }, h('tr', null,
                h('th', { scope: 'col', style: { ...cellStyle, whiteSpace: 'nowrap', width: 32 } }, h('input', {
                  type: 'checkbox',
                  'aria-label': t('selectAll'),
                  checked: shown.length > 0 && shown.every((item) => selectedIds.has(item.id)),
                  disabled: !!action || dirty || readOnly || shown.length === 0,
                  onChange: (event) => { if (event.target.checked) selectShownModels(); else setSelectedIds(new Set()) }
                })),
                ...['modelName', 'modelState', 'multiplier', 'efforts', 'context', 'images'].map((key) => {
                  const sortable = ['modelName', 'modelState', 'multiplier', 'context'].includes(key)
                  const active = sortKey === key
                  const cycle = () => {
                    if (!active) { setSortKey(key); setSortDir(1) }
                    else if (sortDir === 1) setSortDir(-1)
                    else { setSortKey(''); setSortDir(1) }
                  }
                  return h('th', { key, scope: 'col', 'aria-sort': active ? (sortDir === 1 ? 'ascending' : 'descending') : 'none', style: { ...cellStyle, whiteSpace: 'nowrap' } },
                    sortable ? h('button', { type: 'button', onClick: cycle, title: t('sortHint'), style: { ...buttonStyle, padding: '2px 6px', border: 0, fontWeight: active ? 600 : 400, opacity: active ? 1 : .7 } },
                      t(key), active ? (sortDir === 1 ? ' ↑' : ' ↓') : '') : t(key))
                }),
                h('th', { scope: 'col', style: { ...cellStyle, whiteSpace: 'nowrap', width: 56, textAlign: 'right' } }, t('modelEnable')))),
              h('tbody', null, ...shown.map((item) => {
                const modelEnabled = !hiddenModels.has(item.id)
                return h('tr', { key: item.id, style: modelEnabled ? undefined : { opacity: .55 } },
                  h('td', { style: { ...cellStyle, whiteSpace: 'nowrap' } }, h('input', {
                    type: 'checkbox', checked: selectedIds.has(item.id), disabled: !!action || dirty || readOnly,
                    'aria-label': `${t('selectColumn')} ${item.name}`,
                    onChange: (event) => toggleSelection(item.id, event.target.checked)
                  })),
                  h('td', { style: cellStyle }, h('div', { style: { fontWeight: 600 } }, item.name), h('code', { style: { opacity: .75, fontSize: 12, overflowWrap: 'anywhere' } }, item.id)),
                  h('td', { style: { ...cellStyle, whiteSpace: 'nowrap' } }, h(Chip, { tone: modelEnabled ? 'ok' : 'plain' }, t(modelEnabled ? 'modelEnabled' : 'modelDisabled'))),
                  h('td', { style: { ...cellStyle, whiteSpace: 'nowrap' } }, typeof item.multiplier === 'number'
                    ? (item.multiplier >= 2 ? h(Chip, { tone: 'warn' }, `×${item.multiplier}`) : `×${item.multiplier}`)
                    : item.credits || t('unknown')),
                  h('td', { style: cellStyle }, item.efforts?.map((option) => option.id).join(' / ') || t('noEffort')),
                  h('td', { style: { ...cellStyle, whiteSpace: 'nowrap' } }, item.contextWindow
                    ? h('div', { style: { display: 'grid', gap: 3, minWidth: 80 } },
                        h('span', { style: { fontVariantNumeric: 'tabular-nums' } }, item.contextWindow.toLocaleString()),
                        h('div', { style: { height: 3, borderRadius: 999, background: T_SOFT, overflow: 'hidden' } },
                          h('div', { style: { width: `${Math.max(6, Math.round((item.contextWindow / maxCtxWindow) * 100))}%`, height: '100%', background: T_BRAND, opacity: .65 } })))
                    : t('unknown')),
                  h('td', { style: cellStyle }, t(item.supportsImages === true ? 'imagesYes' : 'imagesNo')),
                  h('td', { style: { ...cellStyle, whiteSpace: 'nowrap', textAlign: 'right' } }, h(Switch, { checked: modelEnabled, disabled: !!action || dirty || readOnly, label: `${t('modelEnable')} ${item.name}`, onChange: (next) => toggleModel(item.id, next) })))
              }),
              !shown.length ? h('tr', null, h('td', { colSpan: 8, style: cellStyle }, t('noMatches'))) : null)))) : null,
          h('div', { style: { ...rowStyle, justifyContent: 'space-between', alignItems: 'center', gap: 12 } },
            h('span', { style: { fontSize: 12.5, color: T_MUTED } }, translate(t, 'modelsSelectionStatus', { total: models.length, selected: selectedModels.length, hidden: hiddenModels.size })),
            h('span', { style: { fontSize: 12, color: T_MUTED, textAlign: 'right' } }, t('creditsNote')))),
        h('div', { style: { display: activeSection === 'usage' ? 'grid' : 'none', gap: 16, minWidth: 0 }, 'aria-label': t('usage') },
          (() => {
            const u = status?.usage ?? {}
            const q = usageQuery
            const isZh = /[\u4e00-\u9fff]/.test(t('usage'))
            const fmtNum = (n) => {
              const v = Number(n) || 0
              if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M'
              if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K'
              return String(v)
            }
            const totals = q?.totals ?? {
              calls: u.calls ?? 0,
              okCalls: Math.max(0, (u.calls ?? 0) - (status?.logs?.failures ?? 0)),
              errorCalls: status?.logs?.failures ?? 0,
              inputTokens: u.inputTokens ?? 0,
              uncachedInputTokens: u.uncachedInputTokens ?? 0,
              cacheReadTokens: u.cacheReadTokens ?? 0,
              cacheWriteTokens: u.cacheWriteTokens ?? 0,
              outputTokens: u.outputTokens ?? 0
            }
            const inTok = Number(totals.inputTokens) || 0
            const cacheTok = Number(totals.cacheReadTokens) || 0
            const outTok = Number(totals.outputTokens) || 0
            const hitRatio = inTok > 0 ? Math.min(100, Math.round((cacheTok / inTok) * 100)) : 0
            const ringR = 16, ringC = 2 * Math.PI * ringR
            const perModel = Array.isArray(q?.perModel) ? q.perModel : (Array.isArray(u.perModel) ? u.perModel : [])
            const maxModelTok = Math.max(1, ...perModel.map((r) => (Number(r.inputTokens) || 0) + (Number(r.outputTokens) || 0)))
            const buckets = Array.isArray(q?.buckets) ? q.buckets : []
            const recent = Array.isArray(q?.recentCalls) ? q.recentCalls : (Array.isArray(u.recentCalls) ? u.recentCalls : [])
            const bucketVal = (b) => usageChartMode === 'calls' ? (Number(b.calls) || 0) : usageChartMode === 'duration' ? (Number(b.avgDurationMs) || 0) : ((Number(b.inputTokens) || 0) + (Number(b.outputTokens) || 0))
            const maxBucketVal = Math.max(1, ...buckets.map(bucketVal))
            const failRows = Array.isArray(q?.failures)
              ? q.failures.map((f) => [f.errorCode || 'CLI_ERROR', f.count || 0])
              : (() => {
                  const m = new Map()
                  for (const f of (u.recentFailures ?? [])) {
                    const code = f?.errorCode || 'CLI_ERROR'
                    m.set(code, (m.get(code) || 0) + 1)
                  }
                  return [...m.entries()].sort((a, b) => b[1] - a[1])
                })()
            const maxFail = Math.max(1, ...failRows.map(([, n]) => n))
            const failTotal = q ? (totals.errorCalls ?? 0) : (status?.logs?.failures ?? 0)
            const modelOptions = (() => {
              const seen = new Set()
              const list = []
              for (const m of (q?.availableModels ?? [])) { if (m && !seen.has(m)) { seen.add(m); list.push(m) } }
              for (const m of models) { if (m?.id && !seen.has(m.id)) { seen.add(m.id); list.push(m.id) } }
              if (usageModel && !seen.has(usageModel)) list.unshift(usageModel)
              return list
            })()
            const rangeLabels = isZh
              ? { today: '今天', '24h': '近 24 小时', '7d': '近 7 天', '30d': '近 30 天', custom: `${usageFrom || '…'} ~ ${usageTo || '…'}` }
              : { today: 'Today', '24h': 'Last 24h', '7d': 'Last 7d', '30d': 'Last 30d', custom: `${usageFrom || '…'} ~ ${usageTo || '…'}` }
            const scopeNote = isZh
              ? `当前范围：${rangeLabels[usageRange] || usageRange}${usageModel ? ` · 模型：${usageModel}` : ' · 全部模型'}（本地保存最近 ${q?.retentionDays ?? 90} 天，重启不清零）`
              : `Scope: ${rangeLabels[usageRange] || usageRange}${usageModel ? ` · Model: ${usageModel}` : ' · All models'} (stored locally for ${q?.retentionDays ?? 90} days across restarts)`
            return h(React.Fragment, null,
              // Card 0: Filter bar (time range + scope hint + custom dates + model + refresh)
              h('section', { style: { ...sectionStyle(), gap: 10, padding: '14px 16px' } },
                h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' } },
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                    h(Segmented, {
                      ariaLabel: isZh ? '时间范围' : 'Time range',
                      value: usageRange,
                      onChange: setUsageRange,
                      options: [
                        { value: 'today', label: isZh ? '今天' : 'Today' },
                        { value: '24h', label: isZh ? '24小时' : '24h' },
                        { value: '7d', label: isZh ? '7天' : '7d' },
                        { value: '30d', label: isZh ? '30天' : '30d' },
                        { value: 'custom', label: isZh ? '自定义' : 'Custom' }
                      ]
                    }),
                    h(Hint, { label: t('hintShow') }, scopeNote)),
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                    h('select', {
                      'aria-label': isZh ? '按模型筛选' : 'Filter by model',
                      value: usageModel,
                      onChange: (e) => setUsageModel(e.target.value),
                      style: { ...inputStyle(), width: 'auto', minWidth: 160, maxWidth: 260, padding: '5px 10px', fontSize: 12.5, background: 'var(--dsw-alias-background-primary, Canvas)', color: T_TEXT }
                    },
                      h('option', { value: '', style: { background: 'var(--dsw-alias-background-primary, Canvas)', color: T_TEXT } }, isZh ? '全部模型' : 'All models'),
                      ...modelOptions.map((m) => h('option', { key: m, value: m, style: { background: 'var(--dsw-alias-background-primary, Canvas)', color: T_TEXT } }, m))),
                    h('button', {
                      type: 'button',
                      disabled: usageLoading,
                      onClick: () => setUsageRefreshSeq((n) => n + 1),
                      style: { ...buttonStyle, padding: '5px 11px', fontSize: 12.5 }
                    }, usageLoading ? (isZh ? '查询中…' : 'Loading…') : (isZh ? '刷新' : 'Refresh')))),
                usageRange === 'custom' ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 12.5, color: T_MUTED } },
                  h('span', null, isZh ? '自定义日期：' : 'Date range:'),
                  h('input', { type: 'date', 'aria-label': isZh ? '开始日期' : 'Start date', value: usageFrom, max: usageTo || undefined, onChange: (e) => setUsageFrom(e.target.value), style: { ...inputStyle(), width: 'auto', padding: '4px 8px', fontSize: 12.5, background: 'var(--dsw-alias-background-primary, Canvas)', color: T_TEXT } }),
                  h('span', null, isZh ? '至' : 'to'),
                  h('input', { type: 'date', 'aria-label': isZh ? '结束日期' : 'End date', value: usageTo, min: usageFrom || undefined, onChange: (e) => setUsageTo(e.target.value), style: { ...inputStyle(), width: 'auto', padding: '4px 8px', fontSize: 12.5, background: 'var(--dsw-alias-background-primary, Canvas)', color: T_TEXT } })) : null),
              // Card 1: Usage overview (6-up even KPI grid, zero orphan card)
              h('section', { style: sectionStyle() },
                h(SectionHeading, { kind: 'usage', hint: h(Hint, { label: t('hintShow') }, t('usageNote')), actions: failTotal > 0 ? h(Chip, { tone: 'warn' }, `${t('statFailures')} ${failTotal}`) : null }, isZh ? '用量总览' : t('usage')),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 10 } },
                  ...[
                    ['calls', isZh ? '范围内调用' : 'Calls', totals.calls ?? 0],
                    ['okCalls', isZh ? '成功调用' : 'Succeeded', totals.okCalls ?? 0],
                    ['usageInput', t('usageInput'), fmtNum(inTok)],
                    ['usageCache', t('usageCache'), fmtNum(cacheTok)],
                    ['usageOutput', t('usageOutput'), fmtNum(outTok)]
                  ].map(([key, labelText, value]) =>
                    h('div', { key, style: { border: `1px solid ${T_LINE}`, borderRadius: 10, padding: '10px 14px', background: 'var(--dsw-alias-background-primary, rgba(127,127,127,.03))' } },
                      h('div', { style: { fontSize: 11.5, color: T_MUTED } }, labelText),
                      h('div', { style: { fontSize: 20, fontWeight: 700, marginTop: 4, letterSpacing: '-.01em', color: T_TEXT, fontVariantNumeric: 'tabular-nums' } }, String(value)))),
                  h('div', { style: { border: `1px solid ${T_LINE}`, borderRadius: 10, padding: '9px 14px', background: 'var(--dsw-alias-background-primary, rgba(127,127,127,.03))', display: 'flex', alignItems: 'center', gap: 10 } },
                    h('svg', { width: 42, height: 42, viewBox: '0 0 42 42', 'aria-hidden': true, style: { flex: '0 0 auto' } },
                      h('circle', { cx: 21, cy: 21, r: ringR, fill: 'none', stroke: T_LINE, strokeWidth: 4 }),
                      h('circle', { cx: 21, cy: 21, r: ringR, fill: 'none', stroke: hitRatio >= 50 ? '#10b981' : T_BRAND, strokeWidth: 4, strokeDasharray: `${(hitRatio / 100) * ringC} ${ringC}`, strokeLinecap: 'round', transform: 'rotate(-90 21 21)' })),
                    h('div', { style: { display: 'grid', gap: 2 } },
                      h('span', { style: { fontSize: 11.5, color: T_MUTED } }, isZh ? '缓存命中率' : 'Cache hit'),
                      h('strong', { style: { fontSize: 18, fontWeight: 700, color: T_TEXT, fontVariantNumeric: 'tabular-nums' } }, `${hitRatio}%`)))),
                h('div', { style: { fontSize: 12, color: T_MUTED, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                  h('span', null, translate(t, 'usageTotals', { calls: totals.calls ?? 0, input: inTok, output: outTok, read: cacheTok })),
                  status?.activeCalls > 0 ? h(Chip, { tone: 'ok' }, translate(t, 'active', { count: status.activeCalls })) : null,
                  status?.usage?.modelFallback ? h(Chip, { tone: 'warn' }, translate(t, 'modelFallbackNotice', { requested: status.usage.modelFallback.requested, used: status.usage.modelFallback.used })) : null),
                props.region === 'intl' && status?.usage ? h('div', { style: { fontSize: 12, color: T_MUTED } }, translate(t, 'outcomeTotals', { cancelled: status.usage.cancelledRequests ?? 0, offloads: status.usage.imageOffloadRequests ?? 0, images: status.usage.offloadImagesRequested ?? 0, history: status.usage.historyOffloadedImages ?? 0 })) : null),
              // Card 2: Model token breakdown
              perModel.length ? h('section', { style: sectionStyle() },
                h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' } },
                  h('span', { style: { fontWeight: 700, fontSize: 14.5, color: T_TEXT } }, isZh ? '模型 Token 构成图' : 'Token breakdown by model'),
                  h('div', { style: { display: 'flex', gap: 12, fontSize: 11.5, color: T_MUTED, flexWrap: 'wrap' } },
                    h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } }, h('i', { style: { width: 8, height: 8, borderRadius: 2, background: '#3b82f6', display: 'inline-block' } }), isZh ? '未命中输入' : 'Uncached in'),
                    h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } }, h('i', { style: { width: 8, height: 8, borderRadius: 2, background: '#10b981', display: 'inline-block' } }), isZh ? '缓存命中' : 'Cache read'),
                    h('span', { style: { display: 'inline-flex', alignItems: 'center', gap: 4 } }, h('i', { style: { width: 8, height: 8, borderRadius: 2, background: '#8b5cf6', display: 'inline-block' } }), isZh ? '输出' : 'Output'))),
                h('div', { style: { display: 'grid', gap: 10 } },
                  ...perModel.map((row) => {
                    const cache = Number(row.cacheReadTokens) || 0
                    const uncached = Math.max(0, (Number(row.inputTokens) || 0) - cache)
                    const out = Number(row.outputTokens) || 0
                    const tot = uncached + cache + out
                    const wUncached = (uncached / maxModelTok) * 100
                    const wCache = (cache / maxModelTok) * 100
                    const wOut = (out / maxModelTok) * 100
                    return h('div', { key: row.model, style: { display: 'grid', gap: 4 } },
                      h('div', { style: { display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 12 } },
                        h('code', { style: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: T_TEXT } }, row.model),
                        h('span', { style: { color: T_MUTED, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } }, `${fmtNum(tot)} · ${row.calls ?? 0} ${isZh ? '次' : 'calls'}`)),
                      h('svg', { width: '100%', height: 10, viewBox: '0 0 100 10', preserveAspectRatio: 'none', style: { display: 'block', borderRadius: 5, background: T_SOFT, overflow: 'hidden' } },
                        h('title', null, isZh ? `${row.model}：未命中输入 ${uncached}，缓存命中 ${cache}，输出 ${out}` : `${row.model}: uncached ${uncached}, cache ${cache}, out ${out}`),
                        wUncached > 0 ? h('rect', { x: 0, y: 0, width: wUncached, height: 10, fill: '#3b82f6' }) : null,
                        wCache > 0 ? h('rect', { x: wUncached, y: 0, width: wCache, height: 10, fill: '#10b981' }) : null,
                        wOut > 0 ? h('rect', { x: wUncached + wCache, y: 0, width: wOut, height: 10, fill: '#8b5cf6' }) : null))
                  }))) : null,
              // Card 3: Bucketed trend chart (hourly for today/24h, daily for 7d/30d/custom)
              buckets.length ? h('section', { style: sectionStyle() },
                h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' } },
                  h('span', { style: { fontWeight: 700, fontSize: 14.5, color: T_TEXT } }, isZh ? (q?.bucketUnit === 'hour' ? '分时段用量趋势（按小时）' : '分日用量趋势（按天）') : (q?.bucketUnit === 'hour' ? 'Hourly usage trend' : 'Daily usage trend')),
                  h(Segmented, {
                    ariaLabel: isZh ? '趋势维度' : 'Trend metric',
                    value: usageChartMode,
                    onChange: setUsageChartMode,
                    options: [
                      { value: 'tokens', label: isZh ? '按 Token' : 'Tokens' },
                      { value: 'calls', label: isZh ? '按次数' : 'Calls' },
                      { value: 'duration', label: isZh ? '按平均耗时' : 'Avg ms' }
                    ]
                  })),
                h('svg', { width: '100%', height: 104, viewBox: `0 0 ${Math.max(buckets.length * 18, 180)} 104`, preserveAspectRatio: 'none', style: { display: 'block' } },
                  ...buckets.map((b, idx) => {
                    const val = bucketVal(b)
                    const barH = val > 0 ? Math.max(4, Math.round((val / maxBucketVal) * 88)) : 2
                    const fill = val === 0 ? T_LINE : (b.errorCalls > 0 && b.errorCalls >= b.calls ? '#ef4444' : '#3b82f6')
                    return h('rect', { key: b.key || idx, x: idx * 18 + 3, y: 98 - barH, width: 12, height: barH, rx: 2, fill, opacity: val > 0 ? .9 : .4 },
                      h('title', null, isZh
                        ? `${b.key} · 调用 ${b.calls} 次（失败 ${b.errorCalls}）· 输入 ${b.inputTokens} / 输出 ${b.outputTokens} · 平均耗时 ${b.avgDurationMs}ms`
                        : `${b.key} · ${b.calls} calls (${b.errorCalls} failed) · in ${b.inputTokens} / out ${b.outputTokens} · avg ${b.avgDurationMs}ms`))
                  })),
                h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 11.5, color: T_MUTED, flexWrap: 'wrap', gap: 8 } },
                  h('span', null, `${buckets[0]?.label || ''} → ${buckets[buckets.length - 1]?.label || ''}`),
                  h('span', null, isZh
                    ? `峰值：${usageChartMode === 'tokens' ? fmtNum(maxBucketVal) + ' tokens' : usageChartMode === 'calls' ? maxBucketVal + ' 次' : maxBucketVal + ' ms'}（悬停柱条看明细）`
                    : `Peak: ${usageChartMode === 'tokens' ? fmtNum(maxBucketVal) + ' tokens' : usageChartMode === 'calls' ? maxBucketVal + ' calls' : maxBucketVal + ' ms'} (hover for details)`))) : null,
              // Card 4: Failure breakdown
              failRows.length ? h('section', { style: sectionStyle() },
                h('span', { style: { fontWeight: 700, fontSize: 14.5, color: T_TEXT } }, isZh ? '范围内失败原因分布' : 'Failure breakdown'),
                h('div', { style: { display: 'grid', gap: 8 } },
                  ...failRows.map(([code, count]) => h('div', { key: code, style: { display: 'grid', gap: 3 } },
                    h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 12 } },
                      h('code', { style: { color: T_WARN } }, code),
                      h('span', { style: { color: T_MUTED } }, `${count} ${isZh ? '次' : 'x'}`)),
                    h('div', { style: { height: 5, borderRadius: 999, background: T_SOFT, overflow: 'hidden' } },
                      h('div', { style: { width: `${Math.round((count / maxFail) * 100)}%`, height: '100%', background: '#ef4444', opacity: .85 } })),
                    guidance(code) ? h('span', { style: { fontSize: 11.5, color: T_MUTED } }, guidance(code)) : null)))) : null,
              // Card 5: Per-model table
              h('section', { style: sectionStyle() },
                h('span', { style: { fontWeight: 700, fontSize: 14.5, color: T_TEXT } }, t('perModelTitle')),
                perModel.length
                  ? h('div', { style: { overflowX: 'auto' } }, h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize: 13 } },
                    h('thead', null, h('tr', null, ...['modelName', 'colCalls', 'usageInput', 'usageCache', 'usageOutput', 'multiplier'].map((key) => h('th', { key, scope: 'col', style: { ...cellStyle, whiteSpace: 'nowrap' } }, t(key))))),
                    h('tbody', null, ...perModel.map((row) => {
                      const found = models.find((item) => item.id === row.model)
                      return h('tr', { key: row.model },
                        h('td', { style: cellStyle }, h('code', { style: { fontSize: 12, overflowWrap: 'anywhere' } }, row.model)),
                        h('td', { style: { ...cellStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } }, String(row.calls ?? 0)),
                        h('td', { style: { ...cellStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } }, String(row.inputTokens ?? 0)),
                        h('td', { style: { ...cellStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } }, String(row.cacheReadTokens ?? 0)),
                        h('td', { style: { ...cellStyle, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } }, String(row.outputTokens ?? 0)),
                        h('td', { style: { ...cellStyle, whiteSpace: 'nowrap' } }, found && typeof found.multiplier === 'number' ? '×' + found.multiplier : t('unknown')))
                    }))))
                  : h(Notice, null, t('perModelEmpty'))),
              // Card 6: Filtered calls + recent failure cards
              h('section', { style: sectionStyle() },
                h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' } },
                  h('span', { style: { fontWeight: 700, fontSize: 14.5, color: T_TEXT } }, isZh ? `${t('recentCallsTitle')}（当前筛选 ${recent.length} 条）` : `${t('recentCallsTitle')} (${recent.length})`),
                  h('button', { type: 'button', disabled: !recent.length, onClick: exportCallsCsv, style: { ...buttonStyle, padding: '4px 10px', fontSize: 12 } }, t('exportCsv'))),
                recent.length
                  ? h('div', { style: { display: 'grid', gap: 6 } }, ...recent.map((call, index) => h('div', { key: call.id || index, style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '8px 12px', border: `1px solid ${T_LINE}`, borderRadius: 10, fontSize: 12.5, background: 'rgba(127,127,127,.02)' } },
                    h('span', { style: { color: T_MUTED, fontVariantNumeric: 'tabular-nums' } }, formatTime(call.at)),
                    h('code', { style: { fontSize: 12, color: T_TEXT } }, call.model || t('unknown')),
                    h('span', { style: { color: T_MUTED, fontVariantNumeric: 'tabular-nums' } }, (call.durationMs ?? 0) + ' ms'),
                    h('span', { style: { color: T_MUTED, fontVariantNumeric: 'tabular-nums' } }, isZh ? `输入 ${call.inputTokens ?? 0} / 输出 ${call.outputTokens ?? 0}` : `in ${call.inputTokens ?? 0} / out ${call.outputTokens ?? 0}`),
                    h('span', { style: { flex: 1, minWidth: 4 } }),
                    h(Chip, { tone: call.state === 'error' ? 'warn' : 'ok' }, call.state === 'error' ? (call.errorCode || 'ERROR') : 'OK'))))
                  : h(Notice, null, t('noUsage')),
                lastCall?.state === 'error' && !(u.recentFailures?.length) ? h('div', { style: { display: 'grid', gap: 4, fontSize: 12, color: T_MUTED } },
                  h(Notice, null, translate(t, 'lastFailed', { code: lastCall.errorCode ?? 'CLI_ERROR' })),
                  lastCall.errorMessage ? h(Notice, null, lastCall.errorMessage) : null,
                  guidance(lastCall.errorCode ?? 'CLI_ERROR') ? h(Notice, null, guidance(lastCall.errorCode ?? 'CLI_ERROR')) : null,
                  lastCall?.id ? h(Notice, null, translate(t, 'diagnosticId', { id: lastCall.id })) : null,
                  lastCall?.processDiagnostics ? h(Notice, null, translate(t, 'timeoutDetail', { seconds: Number.isFinite(lastCall.processDiagnostics.elapsedMs) ? (lastCall.processDiagnostics.elapsedMs / 1000).toFixed(2) : t('sizeUnknown'), stdout: sizeValue(lastCall.processDiagnostics.stdoutBytes), stderr: sizeValue(lastCall.processDiagnostics.stderrBytes) })) : null,
                  (lastCall?.processDiagnostics?.channel === 'image-jsonl' || props.region === 'intl' && lastCall?.processDiagnostics?.streamReason) ? h(Notice, null, regionProcessNote(lastCall.processDiagnostics)) : null,
                  lastCall?.responseDiagnostics ? h(Notice, null, responseNote(lastCall.responseDiagnostics)) : null,
                  budgetNote(lastCall?.diagnostics) ? h(Notice, null, budgetNote(lastCall.diagnostics)) : null) : null,
                u.recentFailures?.length ? h('details', { open: true, style: { marginTop: 4 } },
                  h('summary', { style: { cursor: 'pointer', fontWeight: 600, fontSize: 13.5, color: T_TEXT, marginBottom: 8 } }, `${t('recentFailures')} (${u.recentFailures.length})`),
                  h('div', { style: { display: 'grid', gap: 10, marginTop: 8 } },
                    ...u.recentFailures.map((failure, index) => {
                      const techLines = [
                        failure.id ? translate(t, 'diagnosticId', { id: failure.id }) : null,
                        budgetNote(failure.diagnostics),
                        (failure.processDiagnostics?.channel === 'image-jsonl' || (props.region === 'intl' && failure.processDiagnostics?.streamReason)) ? regionProcessNote(failure.processDiagnostics) : null,
                        failure.responseDiagnostics?.structuredOutputType ? nativeNote(failure.responseDiagnostics) : null,
                        failure.responseDiagnostics ? responseNote(failure.responseDiagnostics) : null
                      ].filter(Boolean)
                      return h('div', { key: failure.id || index, style: { border: `1px solid ${T_LINE}`, borderLeft: '3px solid #ef4444', borderRadius: 10, padding: '10px 14px', background: 'var(--dsw-alias-background-primary, rgba(239,68,68,.03))', display: 'grid', gap: 6 } },
                        h('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' } },
                          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', minWidth: 0 } },
                            h(Chip, { tone: 'warn' }, failure.errorCode || 'CLI_ERROR'),
                            h('code', { style: { fontSize: 12.5, fontWeight: 600, color: T_TEXT, overflowWrap: 'anywhere' } }, failure.model || t('unknown'))),
                          h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                            h('span', { style: { fontSize: 12, color: T_MUTED, fontVariantNumeric: 'tabular-nums' } }, formatTime(failure.at)),
                            failure.id ? h('button', { type: 'button', style: { ...buttonStyle, padding: '2px 8px', fontSize: 11.5 }, onClick: async () => { try { await navigator.clipboard.writeText(failure.id); setNotice(t('copied')) } catch { setNotice(t('actionFailed')) } } }, isZh ? '复制 ID' : 'Copy ID') : null)),
                        failure.errorMessage ? h('div', { style: { fontSize: 13, color: T_TEXT, lineHeight: 1.5, overflowWrap: 'anywhere' } }, failure.errorMessage) : null,
                        failure.errorCode === 'CLI_TIMEOUT' && (failure.diagnostics?.cliInputBytes || failure.diagnostics?.promptBytes)
                          ? h('div', { style: { fontSize: 12, color: T_WARN, lineHeight: 1.45 } }, (() => {
                            const bytes = Number(failure.diagnostics.cliInputBytes || failure.diagnostics.promptBytes) || 0
                            const mb = (bytes / (1024 * 1024)).toFixed(2)
                            const msgs = failure.diagnostics.messageCount ?? '?'
                            const tls = failure.diagnostics.toolCount ?? '?'
                            return isZh ? `本次请求体量：${mb} MiB · ${msgs} 条消息 · ${tls} 个工具（上下文较大时建议调大超时或压缩会话）` : `Request size: ${mb} MiB · ${msgs} messages · ${tls} tools (consider raising timeout or compacting history)`
                          })())
                          : null,
                        guidance(failure.errorCode) ? h('div', { style: { fontSize: 12, color: T_MUTED, lineHeight: 1.5 } }, guidance(failure.errorCode)) : null,
                        techLines.length ? h('details', { style: { marginTop: 2 } },
                          h('summary', { style: { cursor: 'pointer', fontSize: 12, color: T_MUTED } }, isZh ? '技术诊断详情' : 'Technical diagnostics'),
                          h('div', { style: { display: 'grid', gap: 4, marginTop: 6, padding: '8px 10px', borderRadius: 6, background: T_SOFT, fontSize: 11.5, color: T_MUTED, lineHeight: 1.5 } },
                            ...techLines.map((line, i) => h('div', { key: i, style: { overflowWrap: 'anywhere' } }, line)))) : null)
                    }))) : null))
          })()),
        h('div', { style: { display: activeSection === 'logs' ? 'grid' : 'none', gap: 16, minWidth: 0 }, 'aria-label': t('logsTitle') },
          (() => {
            const isZh = /[\u4e00-\u9fff]/.test(t('logsTitle'))
            const captureArmed = status?.logs?.captureArmed === true
            const entries = Array.isArray(logReport?.entries) ? logReport.entries : []
            const q = logFilterQuery.trim().toLowerCase()
            const cancelledEntryCount = entries.filter((entry) => entry.errorCode === 'ABORTED' || entry.controlClass === 'cancelled').length
            const shownEntries = entries.filter((entry) => {
              if (logHideCancelled && logFilterState !== 'cancelled' && (entry.errorCode === 'ABORTED' || entry.controlClass === 'cancelled')) return false
              if (logFilterState === 'error' && !(entry.state === 'error' && !entry.controlClass)) return false
              if (logFilterState === 'cancelled' && entry.controlClass !== 'cancelled') return false
              if (logFilterState === 'offload' && entry.controlClass !== 'image-offload') return false
              if (q && !JSON.stringify(entry).toLowerCase().includes(q)) return false
              return true
            }).slice().reverse()
            return h(React.Fragment, null,
              // Card 1: Diagnostic logs overview & controls
              h('section', { style: sectionStyle() },
                h(SectionHeading, { kind: 'diagnostics', hint: h(Hint, { label: t('hintShow') }, t('logsNote')), actions: h('div', { style: { display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' } },
                  h(Chip, { tone: 'plain' }, isZh ? '不含自动上传' : 'Local only'),
                  h(Chip, { tone: 'plain' }, isZh ? '不含请求与回复正文' : 'No message bodies')) }, t('logsTitle')),
                h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10 } },
                  ...[['metricEntries', status?.logs?.entries ?? 0], ['metricFailures', status?.logs?.failures ?? 0], ['metricSamples', status?.logs?.samples ?? 0], ['metricSamplesRedacted', status?.logs?.requestSamples ?? 0]].map(([key, value]) =>
                    h('div', { key, style: { display: 'grid', gap: 2, padding: '10px 14px', borderRadius: 10, border: `1px solid ${T_LINE}`, background: 'var(--dsw-alias-background-primary, rgba(127,127,127,.03))' } },
                      h('span', { style: { fontSize: 11.5, color: T_MUTED } }, t(key)),
                      h('strong', { style: { fontSize: 20, fontWeight: 700, letterSpacing: '-.01em', color: T_TEXT, fontVariantNumeric: 'tabular-nums' } }, String(value))))),
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
                  h('span', { style: { fontSize: 13, fontWeight: 600, color: T_TEXT } }, t('logLevel')),
                  h(Segmented, {
                    ariaLabel: t('logLevel'),
                    disabled: busy || prefBusy || !!action || dirty || readOnly,
                    value: draft.logLevel ?? 'info',
                    onChange: (level) => savePref('logLevel', level),
                    options: ['error', 'info', 'debug'].map((level) => ({ value: level, label: t('logLevel' + level[0].toUpperCase() + level.slice(1)) }))
                  }),
                  h(Hint, { label: t('hintShow') }, t('logLevelNote')),
                  h('span', { style: { fontSize: 12, color: T_MUTED, display: 'inline-flex', alignItems: 'center', gap: 6 } },
                    translate(t, 'networkFacts', { proxy: status?.network?.proxy || t('unknown'), ca: status?.network?.caFile || t('unknown'), node: status?.network?.nodeMajor ?? '?' }),
                    h(Hint, { label: t('hintShow') }, t('networkHint')))),
                h('div', { style: { display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' } },
                  logReport
                    ? h('button', { type: 'button', disabled: logBusy, style: primaryButtonStyle, onClick: () => logAction('view') }, isZh ? '刷新日志' : 'Refresh logs')
                    : null,
                  h('button', { type: 'button', disabled: logBusy, style: logReport ? buttonStyle : primaryButtonStyle, onClick: () => { if (logReport) { setLogCollapsed(true); setLogReport(null) } else { setLogCollapsed(false); logAction('view') } } }, logReport ? t('hideLogs') : t('viewLogs')),
                  h('button', { type: 'button', disabled: logBusy, style: buttonStyle, onClick: () => logAction('exportLogs') }, t('exportLogs')),
                  h('button', { type: 'button', disabled: logBusy, style: buttonStyle, onClick: () => logAction('exportDetailedLogs') }, t('exportDetailed')),
                  h('button', { type: 'button', disabled: logBusy, style: { ...buttonStyle, borderColor: captureArmed ? T_WARN : undefined }, onClick: () => logAction(captureArmed ? 'cancelCapture' : 'armCapture') }, t(captureArmed ? 'cancelCapture' : 'armCapture')),
                  confirmClear
                    ? h(React.Fragment, null,
                        h('button', { type: 'button', disabled: logBusy, style: buttonStyle, onClick: () => logAction('clearLogs') }, t('confirmClear')),
                        h('button', { type: 'button', disabled: logBusy, style: buttonStyle, onClick: () => setConfirmClear(false) }, t('cancelClear')))
                    : h('button', { type: 'button', disabled: logBusy, style: buttonStyle, onClick: () => setConfirmClear(true) }, t('clearLogs')))),
              // Card 2: Basic logs timeline (auto-loaded & expanded by default)
              h('section', { style: sectionStyle() },
                h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
                  h('span', { style: { fontWeight: 700, fontSize: 14.5, color: T_TEXT } }, t('logConsoleTitle')),
                  h(Chip, { tone: 'plain' }, isZh ? `最近 ${entries.length} 条` : `${entries.length} recent`)),
                logReport ? h('div', { style: { display: 'grid', gap: 10 } },
                  h('div', { style: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' } },
                    h(Segmented, {
                      ariaLabel: isZh ? '日志筛选' : 'Log filter',
                      value: logFilterState,
                      onChange: setLogFilterState,
                      options: [['all', isZh ? '全部' : 'All'], ['error', isZh ? '失败' : 'Errors'], ['cancelled', isZh ? '取消' : 'Cancelled'], ['offload', isZh ? '图片卸载' : 'Offload']].map(([value, label]) => ({ value, label }))
                    }),
                    h('button', { type: 'button', 'aria-pressed': logHideCancelled, onClick: () => setLogHideCancelled(v => !v), style: { ...buttonStyle, padding: '4px 10px', fontSize: 12, borderColor: logHideCancelled ? T_BRAND : T_LINE, background: logHideCancelled ? 'rgba(37,99,235,.12)' : 'transparent', color: logHideCancelled ? T_BRAND : T_TEXT } }, isZh ? `${logHideCancelled ? '已隐藏取消' : '隐藏已取消'} (${cancelledEntryCount})` : `${logHideCancelled ? 'Cancelled hidden' : 'Hide cancelled'} (${cancelledEntryCount})`),
                    h('input', { type: 'search', value: logFilterQuery, onChange: (e) => setLogFilterQuery(e.target.value), placeholder: isZh ? '按模型 / 错误码 / ID 筛选' : 'Filter model / code / ID', style: { ...inputStyle(), flex: '1 1 180px', maxWidth: 280, padding: '5px 10px', fontSize: 12 } }),
                    h('span', { style: { flex: 1, minWidth: 4 } }),
                    h('button', { type: 'button', style: { ...buttonStyle, padding: '4px 10px', fontSize: 12 }, onClick: () => setLogViewRaw(v => !v) }, logViewRaw ? (isZh ? '结构化视图' : 'Timeline view') : (isZh ? '原始 JSON' : 'Raw JSON')),
                    h('button', { type: 'button', style: { ...buttonStyle, padding: '4px 10px', fontSize: 12 }, onClick: async () => { try { await navigator.clipboard.writeText(JSON.stringify(logReport, null, 2)); setNotice(t('copied')) } catch { setNotice(t('actionFailed')) } } }, isZh ? '复制 JSON' : 'Copy JSON')),
                  logViewRaw
                    ? h('pre', { style: { ...inputStyle(), maxHeight: 380, overflow: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 12 } }, JSON.stringify(logReport, null, 2))
                    : (shownEntries.length
                      ? h('div', { style: { display: 'grid', gap: 6, maxHeight: 420, overflowY: 'auto', paddingRight: 2 } },
                          ...shownEntries.slice(0, 80).map((entry, idx) => h('details', { key: entry.id || idx, style: { border: `1px solid ${T_LINE}`, borderRadius: 10, padding: '8px 12px', background: 'rgba(127,127,127,.02)' } },
                            h('summary', { style: { cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12.5, listStyle: 'none' } },
                              h('span', { style: { width: 7, height: 7, borderRadius: '50%', background: entry.state === 'error' ? '#ef4444' : entry.controlClass ? '#94a3b8' : '#10b981', flex: '0 0 auto' } }),
                              h('span', { style: { color: T_MUTED, fontVariantNumeric: 'tabular-nums' } }, entry.at ? formatTime(entry.at) : '—'),
                              h('code', { style: { fontSize: 12, color: T_TEXT } }, entry.model || t('unknown')),
                              entry.durationMs !== undefined ? h('span', { style: { color: T_MUTED, fontVariantNumeric: 'tabular-nums' } }, `${entry.durationMs}ms`) : null,
                              h('span', { style: { flex: 1, minWidth: 4 } }),
                              (entry.inputTokens !== undefined || entry.outputTokens !== undefined)
                                ? h('span', { style: { color: T_MUTED, fontSize: 12, fontVariantNumeric: 'tabular-nums' } }, isZh ? `输入 ${entry.inputTokens ?? 0} / 输出 ${entry.outputTokens ?? 0}` : `in ${entry.inputTokens ?? 0} / out ${entry.outputTokens ?? 0}`)
                                : null,
                              entry.errorCode ? h(Chip, { tone: 'warn' }, entry.errorCode) : entry.controlClass === 'cancelled' ? h(Chip, { tone: 'plain' }, 'CANCELLED') : h(Chip, { tone: 'ok' }, 'OK')),
                            h('pre', { style: { ...inputStyle(), marginTop: 8, maxHeight: 200, overflow: 'auto', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontSize: 11.5 } }, JSON.stringify(entry, null, 2)))))
                      : h(Notice, null, t('noMatches'))))
                  : h(Notice, null, logBusy ? (isZh ? '正在加载日志…' : 'Loading logs…') : t('logConsoleEmpty'))))
          })()),
        dirty && !readOnly ? h('div', { style: { position: 'sticky', bottom: 12, zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '10px 14px', borderRadius: 10, border: `1px solid ${T_BRAND}`, background: 'var(--dsw-alias-background-primary, Canvas)', boxShadow: '0 8px 24px rgba(0,0,0,.22)' } },
          h('span', { style: { fontSize: 13, fontWeight: 600, color: T_TEXT } }, t('saveFirst')),
          h('div', { style: { display: 'flex', gap: 8 } },
            h('button', { type: 'button', disabled: busy, style: buttonStyle, onClick: () => { setDraft({ ...value }); setDirty(false); setNotice('') } }, t('accountCancel')),
            h('button', { type: 'button', disabled: busy || !!action, style: primaryButtonStyle, onClick: save }, busy ? t('saving') : t('save')))) : null,
        notice && toastDismissed !== notice ? h('div', { role: 'status', 'aria-live': 'polite', style: { position: 'fixed', right: 20, bottom: 20, zIndex: 40, maxWidth: 460, maxHeight: 280, overflowY: 'auto', display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, border: `1px solid ${T_LINE}`, background: 'var(--dsw-alias-background-primary, Canvas)', color: T_TEXT, boxShadow: '0 10px 28px rgba(0,0,0,.28)', fontSize: 12.5, lineHeight: 1.5 } },
          h('span', { style: { flex: 1, overflowWrap: 'anywhere', whiteSpace: 'pre-line' } }, notice),
          h('button', { type: 'button', 'aria-label': 'Close', onClick: () => setToastDismissed(notice), style: { border: 0, background: 'transparent', color: T_MUTED, cursor: 'pointer', fontSize: 14, padding: '0 4px', lineHeight: 1.2 } }, '×')) : null,
        h(Notice, null, t('toolNote'))))
    }

    const name = 'dsh-dkn-codebuddy-cli-client'
    const BUNDLE_NAME = 'dsh-dkn-codebuddy-cli'
    const inject = ['slots', 'locale', 'configForms', 'layout']
    // A region only appears once its own /status reports ready. Both regions used
    // to render unconditionally, so a user who never enabled the international
    // channel still got a whole page of "not ready" placeholders. cn is the
    // fallback entry and is always kept, so the panel never ends up empty.
    // A bounded retry watches for a region being switched on after this page mounted,
    // without polling a disabled region for ever.
    const REGION_RETRIES = 10
    function useRegionReadiness(regions) {
      const [ready, setReady] = React.useState({})
      const [pass, setPass] = React.useState(0)
      const retries = React.useRef(0)
      const lookAgain = React.useCallback(() => { retries.current = 0; setPass(value => value + 1) }, [])
      // Enabling or disabling a provider used to change nothing on screen until the
      // whole page was remounted, because the probe ran once with [regions] as its
      // dependency and that array is created once at startup.
      React.useEffect(() => {
        // The host page provides window and document; a headless renderer may provide
        // neither, so a listener is attached only when it actually exists.
        const canWindow = typeof window !== 'undefined' && !!window && typeof window.addEventListener === 'function'
        const canDocument = typeof document !== 'undefined' && !!document && typeof document.addEventListener === 'function'
        const onVisible = () => { if (document.visibilityState !== 'hidden') lookAgain() }
        if (canWindow) window.addEventListener('focus', lookAgain)
        if (canDocument) document.addEventListener('visibilitychange', onVisible)
        return () => {
          if (canWindow) window.removeEventListener('focus', lookAgain)
          if (canDocument) document.removeEventListener('visibilitychange', onVisible)
        }
      }, [lookAgain])
      React.useEffect(() => {
        let cancelled = false
        let timer = null
        const controller = typeof AbortController === 'function' ? new AbortController() : null
        const probe = async region => {
          if (region.id === 'cn') return true
          try {
            const response = await fetch(region.props.statusUrl, { signal: controller ? controller.signal : undefined, cache: 'no-store' })
            if (!response.ok) return false
            const payload = await response.json()
            // A region is live once its own status route answers with a payload: that
            // route only exists while its provider is enabled, and every payload
            // carries `provider`. Waiting for a `status` field the route never sends
            // kept the international tab hidden even after the provider was enabled.
            return payload && (payload.status === 'ready' || typeof payload.provider === 'string')
          } catch { return false }
        }
        Promise.all(regions.map(async region => [region.id, await probe(region)]))
          .then(entries => {
            if (cancelled) return
            const map = Object.fromEntries(entries)
            setReady(map)
            const missing = regions.some(region => !map[region.id])
            if (missing && retries.current < REGION_RETRIES) {
              retries.current += 1
              timer = setTimeout(() => setPass(value => value + 1), 3000)
            }
          })
        return () => { cancelled = true; if (timer) clearTimeout(timer); if (controller) controller.abort() }
      }, [regions, pass])
      return ready
    }
    function UnifiedSettingsPage({ regions, t }) {
      const ready = useRegionReadiness(regions)
      const [activeRegion, setActiveRegion] = React.useState('cn')
      const listed = regions.filter(region => ready[region.id])
      const visible = listed.length ? listed : regions.slice(0, 1)
      const current = visible.some(region => region.id === activeRegion) ? activeRegion : visible[0].id
      return h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 } },
        h('header', { style: { padding: '16px 24px', borderBottom: '1px solid rgba(127,127,127,.2)', display: 'grid', gap: 8 } },
          h('div', { style: { ...rowStyle, gap: 10 } },
            h(Segmented, { ariaLabel: t('regionPicker'), value: current, onChange: setActiveRegion, options: visible.map(region => ({ value: region.id, label: t(region.id) })) }),
            h('span', { style: { fontSize: 12, opacity: .7 } }, t('regionPicker')),
            h(Hint, { label: t('hintShow') }, t('regionNote')))),
        ...visible.map(region => h('div', { key: region.id, hidden: current !== region.id, 'data-region': region.id, style: { display: current === region.id ? 'block' : 'none', flex: 1, minHeight: 0 } }, h(CodeBuddySettingsPage, { ...region.props, activeRegion: current === region.id }))))
    }
    const guidanceZh = {
      // 由 locales/guidance.zh.json 生成，请勿手改；改词表请改该 JSON 后运行 node scripts/build-client-locales.mjs
      "fix_ABORTED": "请求被取消。如需结果请重新发送；频繁取消请检查是否手动停止或超时。",
      "fix_CLI_STREAM_INPUT_INVALID": "传给 CLI 的流式输入不合法。请更新插件到最新版；若仍出现请导出诊断反馈。",
      "fix_CLI_STREAM_INVALID": "CLI 流式输出格式异常。请重试；持续出现请检查 CLI 版本并导出诊断。",
      "fix_CLI_TOOL_PROTOCOL_ERROR": "工具调用协议错误。请重试该请求；若反复出现请导出诊断反馈。",
      "fix_CLI_PERMISSION_REQUIRED": "CLI 需要本地权限确认。请在终端允许该操作后重试。",
      "fix_STRUCTURED_OUTPUT_INVALID": "结构化输出校验失败。请重试；持续出现请更换模型或导出诊断。",
      "fix_CLI_OUTPUT_TOO_LARGE": "CLI 输出超过上限。请减少上下文或附件后重试。",
      "fix_CLI_TIMEOUT": "调用超时。请在高级连接中增大超时毫秒数，或减少请求内容后重试。",
      "fix_CLI_OUTPUT_INVALID": "CLI 输出无法解析。请重试；持续出现请检查 CLI 版本。",
      "fix_CLI_STRUCTURED_OUTPUT_MISSING": "缺少结构化输出。请重试或更换支持结构化输出的模型。",
      "fix_CLI_RESULT_MISSING": "CLI 未返回最终结果。请重试；若持续请导出诊断反馈。",
      "fix_CLI_NOT_FOUND": "找不到 CodeBuddy CLI。请点击“一键配置 CLI”，或在高级连接中填写正确的可执行文件路径。",
      "fix_CLI_VERSION_INVALID": "无法识别 CLI 版本。请安装官方 CodeBuddy CLI 后重试。",
      "fix_CLI_INSTALL_PLATFORM": "当前平台不支持自动安装。请手动安装官方 CLI 后填写路径。",
      "fix_CLI_INSTALL_FAILED": "自动安装失败。请检查网络与 npm 后重试，或手动安装并填写路径。",
      "fix_CLI_START_FAILED": "CLI 启动失败。请检查路径与权限后重试；必要时重新安装。",
      "fix_MODEL_CATALOG_INVALID": "模型目录数据无效。请点击“刷新模型与倍率”重试。",
      "fix_MODEL_CATALOG_EMPTY": "模型目录为空。请确认已登录后刷新模型。",
      "fix_MODEL_CATALOG_TIMEOUT": "获取模型目录超时。请检查网络后刷新模型。",
      "fix_MODEL_CATALOG_TOO_LARGE": "模型目录响应过大。请刷新重试；持续出现请导出诊断。",
      "fix_MODEL_CATALOG_FAILED": "获取模型目录失败。请检查登录与网络后刷新模型。",
      "fix_IMAGE_ATTACHMENT_INVALID": "图片附件无效。请更换图片后重试。",
      "fix_IMAGE_OFFLOAD_REQUIRED": "图片需走离线通道。请重试；持续出现请检查模型是否支持图片。",
      "fix_IMAGE_ROLE_UNSUPPORTED": "当前模型不支持该图片角色。请更换支持图片的模型。",
      "fix_IMAGE_TOOL_CALL_INVALID": "图片工具调用参数无效。请重试该请求。",
      "fix_IMAGE_MODEL_UNSUPPORTED": "当前模型不支持图片。请更换支持图片的模型后重试。",
      "fix_IMAGE_SERVICE_UNAVAILABLE": "图片服务不可用。请稍后重试或检查网络。",
      "fix_IMAGE_READ_FAILED": "读取图片失败。请确认文件存在且可读后重试。",
      "fix_IMAGE_TOO_LARGE": "图片超过大小上限。请压缩或更换较小图片。",
      "fix_IMAGE_DATA_URI_TOO_LARGE": "内联图片数据过大。请改用较小图片或附件方式。",
      "fix_IMAGE_UNSUPPORTED": "不支持的图片格式。请使用 PNG/JPEG/WebP/GIF。",
      "fix_REQUEST_TOO_LARGE": "请求体超过上限。请减少历史消息、工具或附件后重试。",
      "fix_ACCOUNT_LOGIN_REQUIRED": "该账号需要登录。请在账号管理中准备登录并完成 CLI 登录。",
      "fix_MODEL_VISIBILITY_LAST": "至少保留一个可用模型。请先启用其他模型，再停用这一个。",
      "fix_MODEL_PREFERENCE_INVALID": "模型偏好数据无效。请重新设置默认模型或停用列表。",
      "fix_MODEL_PREFERENCE_LIMIT": "模型偏好数量超限。请减少停用的模型数量。",
      "fix_MODEL_PREFERENCE_UNWRITABLE": "模型偏好无法写入。请检查配置目录权限后重试。",
      "fix_MODEL_PREFS_UNSAFE": "模型偏好文件不安全。请检查偏好目录权限与归属。",
      "fix_MODEL_PREFS_INVALID": "模型偏好文件损坏。请删除偏好文件后重新设置。",
      "fix_PREFLIGHT_TIMEOUT_RANGE": "超时毫秒数须在 15000–600000 之间。请修正后再保存。",
      "fix_PREFLIGHT_CONFIG_DIR": "配置目录必须是已存在且可写的文件夹。请修正路径后再保存。",
      "fix_CLI_ERROR": "CLI 调用失败。请检查登录状态与 CLI 配置后重试。",
      "fix_CLI_AUTH_REQUIRED": "需要认证。请完成 CLI 登录后重试。",
      "fix_CLI_LOGIN_REQUIRED": "需要登录。请点击登录指引完成 CLI 登录。",
      "fix_CLI_CREDENTIAL_MISSING": "没有找到官方 CLI 的登录记录。请先用 CodeBuddy CLI 登录一次，再回到本页刷新额度。",
      "fix_CLI_CREDENTIAL_UNREADABLE": "CLI 登录记录无法读取。请确认当前用户能读该文件，或重新登录 CLI 后再刷新。",
      "fix_CLI_CREDENTIAL_ENCRYPTED": "CLI 登录记录是加密格式，本插件不解析加密凭据。请改用「设备授权」按钮读取额度。",
      "fix_CLI_CREDENTIAL_EXPIRED": "CLI 登录记录已过期。请在 CLI 中重新登录，再回到本页刷新额度。",
      "fix_CLI_CREDENTIAL_FOREIGN_REGION": "本机可读的登录记录属于另一个区域，不会用于本区额度。请在本环境登录本区账号，或点「设备授权」读取本区额度。",
      "fix_QUOTA_NETWORK": "网络请求失败。请检查网络与代理后重试，或直接去官网查看额度。",
      "fix_QUOTA_AUTH_UNAVAILABLE": "无法发起额度授权。请稍后重试；持续失败请检查网络，或去官网查看额度。",
      "fix_QUOTA_STATE_MISSING": "授权已过期或尚未发起。请重新点击「授权读取额度」，用新链接在浏览器确认。",
      "fix_QUOTA_PENDING": "尚未在浏览器完成授权。请打开链接确认授权，再回来点「我已完成授权」。",
      "fix_QUOTA_TOKEN_FAILED": "换取凭据失败。请重新发起授权；持续失败请去官网查看额度。",
      "fix_QUOTA_ACCOUNT_FAILED": "读取账号信息失败。请重新发起授权后重试。",
      "fix_QUOTA_BILLING_UNAVAILABLE": "暂时读不到额度。请稍后重试，或去官网查看。",
      "fix_QUOTA_BILLING_FAILED": "额度读取被拒绝。请重新授权后重试；持续失败请去官网查看。",
      "fix_QUOTA_NOT_AUTHORIZED": "尚未授权读取额度。请点击「授权读取额度」完成一次浏览器授权，或直接去官网查看。",
      "fix_QUOTA_REFRESH_REJECTED": "授权已失效，本地保存的凭据已自动清除。请重新授权。",
      "fix_QUOTA_REFRESH_FAILED": "刷新凭据失败。请重试；持续失败请重新发起授权。",
      "fix_QUOTA_ACTION_UNKNOWN": "插件不支持该额度操作。请更新插件到最新版后重试。",
      "fix_MAINTENANCE_UNAVAILABLE": "账号维护模块尚未就绪，请稍后重试或重新加载插件。",
      "fix_KEEPALIVE_NO_SOURCE": "未找到可续期的设备授权凭据；如需续期官方 CLI 明文凭据，请先在「功能开关」中开启「允许续期并写回明文 CLI 凭据」。",
      "fix_CLI_REFRESH_INVALID": "CLI 凭据续期参数无效，请更新插件或重试。",
      "fix_CLI_CREDENTIAL_NOT_REFRESHABLE": "未找到当前区域的明文 CLI 凭据（桌面端加密凭据或跨区凭据会自动跳过）。请使用官方 CLI 重新登录或改用设备授权。",
      "fix_CLI_CREDENTIAL_UNSAFE": "检测到凭据文件大小异常或为符号链接，已拒绝写入以保护账号安全。",
      "fix_CLI_CREDENTIAL_WRITE_FAILED": "写回 CLI 凭据文件失败，请确认该目录具备写入权限且未被其他进程锁定。",
      "fix_CHECKIN_NO_TOKEN": "当前没有可用的已登录账号凭据，请先登录账号或完成设备授权后再签到。",
      "fix_PROBE_FAILED": "官方服务连通性探测失败。请检查网络连接、代理端口与分流规则，或切换代理节点后重试。",
      "fix_PROBE_TIMEOUT": "官方服务连通性探测超时。若为国际版，常见原因为当前代理节点无回包，请切换新加坡/日本/香港节点或开启 TUN 模式后重试。",
      "fix_PREFLIGHT_PROXY_URL": "代理地址格式不合法。请填写完整的 http://、https://、socks5:// 或 socks5h:// 地址（如 http://127.0.0.1:7897），或留空以继承系统环境。",
      "fix_PREFLIGHT_FIRST_BYTE_TIMEOUT": "首包/无响应超时需填 0（关闭）或 15000–600000 毫秒之间的整数。"
    }
    const guidanceEn = {
      // 由 locales/guidance.en.json 生成，请勿手改；改词表请改该 JSON 后运行 node scripts/build-client-locales.mjs
      "fix_ABORTED": "The request was cancelled. Resend it if you need the result; frequent cancels usually mean a manual stop or a timeout.",
      "fix_CLI_STREAM_INPUT_INVALID": "The streaming input sent to the CLI is invalid. Update the plugin; if it persists, export diagnostics and report it.",
      "fix_CLI_STREAM_INVALID": "The CLI stream output is malformed. Retry; if it persists, check the CLI version and export diagnostics.",
      "fix_CLI_TOOL_PROTOCOL_ERROR": "Tool-call protocol error. Retry the request; if it recurs, export diagnostics and report it.",
      "fix_CLI_PERMISSION_REQUIRED": "The CLI needs a local permission confirmation. Allow the operation in the terminal, then retry.",
      "fix_STRUCTURED_OUTPUT_INVALID": "Structured output failed validation. Retry; if it persists, switch models or export diagnostics.",
      "fix_CLI_OUTPUT_TOO_LARGE": "CLI output exceeded the limit. Reduce context or attachments, then retry.",
      "fix_CLI_TIMEOUT": "The call timed out. Raise the timeout in Advanced connection, or reduce the request, then retry.",
      "fix_CLI_OUTPUT_INVALID": "CLI output could not be parsed. Retry; if it persists, check the CLI version.",
      "fix_CLI_STRUCTURED_OUTPUT_MISSING": "Structured output is missing. Retry or switch to a model that supports structured output.",
      "fix_CLI_RESULT_MISSING": "The CLI returned no final result. Retry; if it persists, export diagnostics and report it.",
      "fix_CLI_NOT_FOUND": "CodeBuddy CLI was not found. Click “Set up CLI”, or enter the correct executable path in Advanced connection.",
      "fix_CLI_VERSION_INVALID": "The CLI version could not be recognised. Install the official CodeBuddy CLI, then retry.",
      "fix_CLI_INSTALL_PLATFORM": "Automatic installation is not supported on this platform. Install the official CLI manually and enter its path.",
      "fix_CLI_INSTALL_FAILED": "Automatic installation failed. Check network and npm, then retry, or install manually and enter the path.",
      "fix_CLI_START_FAILED": "The CLI failed to start. Check the path and permissions, then retry; reinstall if needed.",
      "fix_MODEL_CATALOG_INVALID": "The model catalog data is invalid. Click “Refresh models & rates” to retry.",
      "fix_MODEL_CATALOG_EMPTY": "The model catalog is empty. Confirm you are signed in, then refresh models.",
      "fix_MODEL_CATALOG_TIMEOUT": "Fetching the model catalog timed out. Check the network, then refresh models.",
      "fix_MODEL_CATALOG_TOO_LARGE": "The model catalog response is too large. Refresh to retry; if it persists, export diagnostics.",
      "fix_MODEL_CATALOG_FAILED": "Fetching the model catalog failed. Check sign-in and network, then refresh models.",
      "fix_IMAGE_ATTACHMENT_INVALID": "The image attachment is invalid. Replace the image, then retry.",
      "fix_IMAGE_OFFLOAD_REQUIRED": "The image must use the offload channel. Retry; if it persists, check whether the model supports images.",
      "fix_IMAGE_ROLE_UNSUPPORTED": "The current model does not support this image role. Switch to a model that supports images.",
      "fix_IMAGE_TOOL_CALL_INVALID": "The image tool-call arguments are invalid. Retry the request.",
      "fix_IMAGE_MODEL_UNSUPPORTED": "The current model does not support images. Switch to an image-capable model, then retry.",
      "fix_IMAGE_SERVICE_UNAVAILABLE": "The image service is unavailable. Retry later or check the network.",
      "fix_IMAGE_READ_FAILED": "Reading the image failed. Confirm the file exists and is readable, then retry.",
      "fix_IMAGE_TOO_LARGE": "The image exceeds the size limit. Compress it or use a smaller image.",
      "fix_IMAGE_DATA_URI_TOO_LARGE": "The inline image data is too large. Use a smaller image or the attachment channel.",
      "fix_IMAGE_UNSUPPORTED": "Unsupported image format. Use PNG/JPEG/WebP/GIF.",
      "fix_REQUEST_TOO_LARGE": "The request body exceeds the limit. Reduce history, tools or attachments, then retry.",
      "fix_ACCOUNT_LOGIN_REQUIRED": "This account needs sign-in. Prepare login in Account management and complete the CLI sign-in.",
      "fix_MODEL_VISIBILITY_LAST": "Keep at least one usable model. Enable another model first, then disable this one.",
      "fix_MODEL_PREFERENCE_INVALID": "Model preference data is invalid. Re-set the default model or the disabled list.",
      "fix_MODEL_PREFERENCE_LIMIT": "Too many model preferences. Reduce the number of disabled models.",
      "fix_MODEL_PREFERENCE_UNWRITABLE": "Model preferences cannot be written. Check the config directory permissions, then retry.",
      "fix_MODEL_PREFS_UNSAFE": "The model preference file is unsafe. Check the preference directory permissions and ownership.",
      "fix_MODEL_PREFS_INVALID": "The model preference file is corrupt. Delete it and set preferences again.",
      "fix_PREFLIGHT_TIMEOUT_RANGE": "The timeout must be between 15000 and 600000 ms. Fix it, then save again.",
      "fix_PREFLIGHT_CONFIG_DIR": "The config directory must be an existing, writable folder. Fix the path, then save again.",
      "fix_CLI_ERROR": "The CLI call failed. Check sign-in and CLI configuration, then retry.",
      "fix_CLI_AUTH_REQUIRED": "Authentication is required. Complete the CLI sign-in, then retry.",
      "fix_CLI_LOGIN_REQUIRED": "Sign-in is required. Follow the login guide to complete the CLI sign-in.",
      "fix_CLI_CREDENTIAL_MISSING": "No CLI sign-in record was found. Sign in once with the CodeBuddy CLI, then refresh the quota on this page.",
      "fix_CLI_CREDENTIAL_UNREADABLE": "The CLI sign-in record cannot be read. Check that the current user can read that file, or sign in again and refresh.",
      "fix_CLI_CREDENTIAL_ENCRYPTED": "The CLI sign-in record is encrypted and this plugin does not decrypt credentials. Use the device-authorisation button to read the quota instead.",
      "fix_CLI_CREDENTIAL_EXPIRED": "The CLI sign-in record has expired. Sign in again with the CLI, then refresh the quota on this page.",
      "fix_CLI_CREDENTIAL_FOREIGN_REGION": "The readable sign-in record belongs to another region and is never used for this region's credits. Sign in to this region's account here, or use the device authorisation.",
      "fix_QUOTA_NETWORK": "The network request failed. Check connectivity and any proxy, then retry, or read the quota on the official site.",
      "fix_QUOTA_AUTH_UNAVAILABLE": "Quota authorisation could not be started. Retry shortly; if it keeps failing, check the network or read the quota on the official site.",
      "fix_QUOTA_STATE_MISSING": "The authorisation expired or was never started. Press Authorise quota access again and confirm the new link in your browser.",
      "fix_QUOTA_PENDING": "Authorisation is not finished in the browser yet. Open the link, confirm it, then press \"I have authorised\".",
      "fix_QUOTA_TOKEN_FAILED": "Exchanging the authorisation for a token failed. Start the authorisation again, or read the quota on the official site.",
      "fix_QUOTA_ACCOUNT_FAILED": "Reading the account identity failed. Start the authorisation again and retry.",
      "fix_QUOTA_BILLING_UNAVAILABLE": "Quota is temporarily unavailable. Retry later or read it on the official site.",
      "fix_QUOTA_BILLING_FAILED": "The quota read was rejected. Authorise again and retry; if it keeps failing, read the quota on the official site.",
      "fix_QUOTA_NOT_AUTHORIZED": "Quota access is not authorised. Press Authorise quota access to confirm once in your browser, or read the quota on the official site.",
      "fix_QUOTA_REFRESH_REJECTED": "The authorisation is no longer valid and the stored credential was removed. Authorise again.",
      "fix_QUOTA_REFRESH_FAILED": "Refreshing the credential failed. Retry; if it keeps failing, authorise again.",
      "fix_QUOTA_ACTION_UNKNOWN": "This quota action is not supported by the installed plugin. Update the plugin and retry.",
      "fix_MAINTENANCE_UNAVAILABLE": "Account maintenance is not ready yet. Retry shortly or reload the plugin.",
      "fix_KEEPALIVE_NO_SOURCE": "No refreshable device grant found. To refresh plaintext CLI credentials, enable 'Allow plaintext CLI credential refresh' under Feature switches.",
      "fix_CLI_REFRESH_INVALID": "Invalid CLI credential refresh parameters. Update the plugin or retry.",
      "fix_CLI_CREDENTIAL_NOT_REFRESHABLE": "No plaintext CLI credential found for this region (encrypted desktop records and foreign-region records are skipped). Sign in via the official CLI or use device authorisation.",
      "fix_CLI_CREDENTIAL_UNSAFE": "Refused to write the credential file because it is a symlink or exceeds the safe size limit.",
      "fix_CLI_CREDENTIAL_WRITE_FAILED": "Could not write back the CLI credential file. Check folder write permissions and ensure no other process is locking it.",
      "fix_CHECKIN_NO_TOKEN": "No signed-in account credential is available. Sign in or authorise an account before checking in.",
      "fix_PROBE_FAILED": "Official endpoint connectivity probe failed. Check your network, proxy port, or routing rules and retry.",
      "fix_PROBE_TIMEOUT": "Official endpoint connectivity probe timed out. For the International channel, switch to another proxy node or enable TUN mode and retry.",
      "fix_PREFLIGHT_PROXY_URL": "Invalid proxy URL. Enter a full http://, https://, socks5://, or socks5h:// URL (e.g. http://127.0.0.1:7897), or leave it empty to inherit the system environment.",
      "fix_PREFLIGHT_FIRST_BYTE_TIMEOUT": "First-byte timeout must be 0 (disabled) or an integer between 15000 and 600000 ms."
    }
    function apply(ctx) {
      const commonZh = { ...localeZh, ...feedbackZh, ...guidanceZh, sidebarEntry: 'CodeBuddy', pageEntryHint: '从左侧 CodeBuddy 打开统一配置页，在页内分别配置国内和国际通道。', channelUnavailable: '此通道配置尚未就绪或未启用，请检查插件组件状态。', regionPicker: '配置区域', cn: '国内版', intl: '国际版', regionNote: '此处切换只改变配置页面。对话使用哪个区域，取决于会话中选择的提供方；两侧分别登录和统计。' }
      const commonEn = { ...localeEn, ...feedbackEn, ...guidanceEn, sidebarEntry: 'CodeBuddy', pageEntryHint: 'Open CodeBuddy in the sidebar to configure China and International separately.', channelUnavailable: 'This channel is not ready or enabled. Check its plugin component.', regionPicker: 'Configuration region', cn: 'China', intl: 'International', regionNote: 'This changes the settings view only. Conversation providers determine routing. Each region has separate sign-in and usage.' }
      ctx.effect(() => ctx.locale.register('settings.codebuddy-cli', { zh: commonZh, en: commonEn }), 'codebuddy: common locales')
      const actionLabels = common => Object.fromEntries(['accountLabel', 'accountAdd', 'accountUse', 'accountLegacy', 'accountRemove', 'accountConfirmRemove', 'accountCancel', 'accountSelected', 'accountPrepare', 'accountsTitle'].map(key => [key, common[key]]))
      ctx.effect(() => ctx.locale.register('settings.codebuddy-cli-intl-unified', { zh: { ...commonZh, ...intlLocaleZh, ...actionLabels(commonZh), guideLocalSize: commonZh.guideLocalSize.replace('20 MiB', '24 MiB') }, en: { ...commonEn, ...intlLocaleEn, ...actionLabels(commonEn), guideLocalSize: commonEn.guideLocalSize.replace('20 MiB', '24 MiB') } }), 'codebuddy: international locales')
      const t = ctx.locale.bind('settings.codebuddy-cli')
      const regions = ['cn', 'intl'].map(id => ({ id, ns: 'llm-codebuddy-cli-' + id, props: {
        region: id, legacyForm: ctx.configForms.get('llm-codebuddy-cli-' + id),
        statusUrl: '/plugins/dsh-codebuddy-cli-' + id + '/status',
        actionUrl: '/plugins/dsh-codebuddy-cli-' + id + '/actions',
        diagnosticsUrl: '/plugins/dsh-codebuddy-cli-' + id + '/diagnostics',
        usageUrl: '/plugins/dsh-codebuddy-cli-' + id + '/usage',
        accountsUrl: '/plugins/dsh-codebuddy-cli-' + id + '/accounts',
        officialHome: id === 'cn' ? 'https://www.codebuddy.cn' : 'https://www.codebuddy.ai',
        t: id === 'cn' ? t : ctx.locale.bind('settings.codebuddy-cli-intl-unified')
      }}))
      const openPage = () => ctx.layout.selectPanel(PANEL_ID)
      ctx.effect(() => ctx.configForms.whileServed(regions.map(region => region.ns), () => {
        const disposers = [
          ctx.slots.inject('main', () => ctx.slots.register({ name: 'main', key: PANEL_ID, locale: 'settings.codebuddy-cli', inject: () => ({ regions, t }) }, UnifiedSettingsPage)),
          ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, order: 20, label: () => t('sidebarEntry'), locale: 'settings.codebuddy-cli' }, Icon))
        ]
        return () => {
          if (ctx.layout.panelInfo.getSnapshot().activePanelId === PANEL_ID) ctx.layout.selectPanel(null)
          for (const dispose of disposers.reverse()) dispose()
        }
      }), 'codebuddy: unified page')
      for (const region of regions) ctx.effect(() => ctx.configForms.whileServed([region.ns], () => ctx.slots.inject('plugins.row.config', () => ctx.slots.register({
        name: 'plugins.row.config', key: `${BUNDLE_NAME}#${region.ns}`, locale: 'settings.codebuddy-cli', inject: () => ({ t, openPage })
      }, SettingsLauncher))), 'codebuddy: ' + region.id + ' entry')
    }
    Object.assign(exports, { BUNDLE_NAME, apply, inject, name, createFeedbackKit, IssueFeedback })
    return module.exports
  }
})
