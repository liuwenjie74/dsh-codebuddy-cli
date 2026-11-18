# 更新记录 / Changelog

## 2.0.0 — 设置页按设计稿重做视觉与交互（UI 重构里程碑）

- **视觉语言整体重做**：按设计稿复刻顶栏（CB 方块标识 + 标题 + 副标题 + 版本胶囊 + 超时提示）、卡片化信息区、下划线式页签、iOS 风格开关、chip 状态徽标、170px 标签列字段行、深色日志框观感。新增 `Card` / `Field` / `Chip` / `Switch` 四个可复用组件，与一组设计令牌常量（`T_TEXT` / `T_MUTED` / `T_LINE` / `T_SOFT` / `T_BRAND` / `T_OK` / `T_WARN`）。
- **主题一致**：设计稿写死浅色调色板，本实现全部映射到 DSH 主题令牌（`--dsw-alias-label-primary` / `label-secondary` / `border-primary` / `background-primary` / `background-secondary` 等，并带浅色回退），因此深色模式同样可读；不采用硬编码色值。
- **状态条**：原三项大号 KPI 卡片改为一行四格紧凑状态条（CLI 状态 / 已启用 ÷ 总数 / 当前账号 / 本进程调用），每格带状态圆点、粗体值与右侧提示，点击仍可直达对应页签。
- **页签与卡片头**：`SectionHeading` 升级为卡片头栏（负外边距贴住卡片顶边、单条分隔线、14px/600 标题 + 15px 图标），连接页、模型页、账号页、用量页、额度区、诊断区一次性获得统一的卡片头结构。
- **字段行**：`label()` 由「标签在上、控件在下」改为设计稿的 `.frow` 形态（左侧 170px 灰色标签列、右侧值区），高级连接中的 `cliPath` / `configDir` / `model` / `effort` / `timeoutMs` 五处直接受益。
- **功能开关**：客户端标识覆盖与脱敏请求样本采集两项由单行 checkbox 改为「标题 + 说明 + 右侧 iOS 开关」的行式布局，各自仍独立即时保存，说明文字仍走可展开的信息徽标。
- **信息图标**：`Hint` 触发器由 16px 描边 SVG 改为设计稿的 15px「i」圆形徽标；浮层仍是 `position: absolute` + `display: open ? 'block' : 'none'`，`aria-expanded`、内容常驻渲染树、悬停不闪烁三项性质保持不变（`test/hint.test.js` 契约继续成立）。
- **模型页**：状态列改为 chip，新增第 8 列「启用」开关（每行独立启停）；**保留**列头排序、表头全选、批量停用/启用、撤销上一步与搜索框（只留搜索一个筛选入口，不加回状态筛选 chip）。
- **连接页主卡**：改为「状态 chip + 重新检测（次按钮）+ 一键配置（主按钮）」+「可执行文件 / 版本」两行字段，主次按钮层级与设计稿一致。
- **账号区**：每个独立环境由纯文本块改为行卡（边框圆角 + 名称 + 「当前」chip + 登录状态 chip + 单行用量摘要），按钮组保持在下方，字段来源未变（`id` / `label` / `createdAt` / `credentialsPresent` / `activeCalls` / `usage`）。
- **用量与诊断**：用量区新增四格统计（本进程调用 / 输入 tokens / 输出 tokens / 失败），诊断区四格指标改用统一 `.stat` 样式（12px 灰标签 + 20px 加粗数值 + 描边浅底）。额度区改为按钮式官网入口，文案继续如实说明「额度需去官网查看」。
- **单文件内部模块化（原计划 2B）**：在 `lib/client.js` 内部按职责分区并加注释（词表 / 浏览器 helper / 视图组件），**保持 `window.__ModuleLoader__.load` 自包含单文件、零 import**，测试的 `vm.runInContext(readFile(...))` 加载方式不变。
- **未引入任何新后端字段**：额度类（已用百分比 / 剩余额度 / 周期重置日 / 套餐等级）本版一律不接，界面不出现假进度条、假百分比或假重置日；「按模型额度分摊」改为后续批次的「按模型消耗统计」课题。
- **词表**：新增 `timeoutChip`、`modelEnable`、`usageInput`、`usageOutput`、`statFailures`、`cliExecutable`、`cliVersionLabel` 七个键，生成块由 `scripts/build-client-locales.mjs` 重建。
- 验证：生成块一致、`node --check lib/client.js` 通过、158 个 `t()` 键中英齐备、35 个错误码处置指引齐全、12 个 Markdown 内部链接全部可达、版本一致性检查通过；回归 cn 119 / intl 108 / root 43 = **270 通过 0 失败**。

## 1.1.7 — 模型页排序与批量撤销、保存前预检、错误码处置指引（第 4 批）

- **修复悬停闪烁**：`Hint` 的说明正文原先是流内列布局，悬停展开时撑高外层 `span`，父行 `alignItems:center` 随之把 16px 图标重新居中、滑出光标，触发 `mouseleave`→关闭→滑回→`mouseenter`→再展开的死循环。改为：外层 `span` 是恒定 `position:relative` 的 16×16 盒子，正文改成 `position:absolute` 浮层（`top:100%`、`zIndex:60`、`maxWidth:320`），展开不再改变外层尺寸；`onMouseEnter/onMouseLeave` 移到外层，移入浮层不关闭。`aria-expanded`、`display: open ? 'block' : 'none'` 与内容常驻渲染树保持不变。`test/hint.test.js` 新增「浮层必须脱离文档流、悬停 handler 必须在外层」的回归断言。
- **⑩ 模型页增强（只做排序 + 批量撤销）**：模型目录表头「模型 / 状态 / 倍率 / 上下文」四列可点击排序，循环 升序→降序→取消，`th` 带 `aria-sort`，排序只作用于当前搜索可见列表 `shown`；不新增筛选/分组/导入导出（上一批刚删掉状态筛选下拉，避免再加回隐性歧义）。批量「停用选中 / 启用选中」成功后记录 `lastBatch`，工具行出现「撤销上一步」按钮，反向调用 `toggleModelBatch(ids, !enabled, false)` 且不再记录，用后按钮消失。新键 `undoBatch`、`sortHint` 仅加 `cn.zh/en`，国际版经 `commonZh` 合并继承。
- **⑪ 保存前自动预检（preflight）**：`lib/cn|intl/index.js` 的 action 白名单加 `preflight`，校验**即将保存的草稿**而非已存配置——`configOf()` 读取时会把 `timeoutMs` 静默夹到 [15000,600000]，越界值若不在此拦截就会被提交、直到请求期才暴露。三项检查：`timeoutMs` 须为 15000–600000 的安全整数（否则 `PREFLIGHT_TIMEOUT_RANGE`）；`cliPath` 非空时 `resolveCli` 必须命中（否则 `CLI_NOT_FOUND`）；`configDir` 非空时必须是已存在且可写的目录（否则 `PREFLIGHT_CONFIG_DIR`）；空值记 `skipped` 不算失败。客户端 `save()` 在有改动时先 POST `preflight`，`ok===false` 则定位首个失败项、弹出「保存前检查未通过：{item}（{code}）」并**保持 dirty、不提交**；通过才 `commit`。不新增按钮。
- **⑫ 错误码处置指引**：新增 `locales/guidance.zh.json` / `guidance.en.json`（cn/intl 共用一张 `fix_<CODE>` 表，43 键），覆盖 `lib/` 中以错误码形式抛出/返回的 35 个 CODE 及客户端兜底码。`scripts/build-client-locales.mjs` 增 guidance 两块生成区；`scripts/check-locales.mjs` 增守护——扫描 `lib/` 收集所有错误码，任一码在中英指引里缺 `fix_CODE` 即发布前硬失败。客户端把 guidance 并入两区词典，`guidance(code)` 查表（缺键回退空串、不泄漏裸键），在最近一次失败、历史失败明细与被预检拦下的保存三处渲染对应处置建议。
- 测试：`test/cn|intl/model-visibility.test.js` 各补 preflight 用例（超时越界 / CLI 不存在 / 配置目录非目录 / 合法 / 空值跳过）；新增 `test/guidance.test.js`（两区注册 + 三处渲染 + 键形与中英非空）；`test/hint.test.js` 补闪烁回归。
- 验证：生成块一致、版本一致、155 个 `t()` 键中英齐备、35 个错误码处置指引齐全、12 个 Markdown 内部链接全部可达；回归 cn 119 / intl 108 / root 43 = **270 通过 0 失败**。

## 1.1.6 — 工具栏常显与用量页留白修正（第 4 批收尾）

- 模型目录区把「停用选中 / 启用选中 / 清空 / 搜索框」移到表格上方的常显工具行：按钮不再只在勾选后才出现（未选中时禁用并回落到通用文案），搜索框也回到这个工具行，与列表紧邻。
- 删除状态筛选下拉框及其 4 个词条（`filterState`、`filterAllCount`、`filterEnabledCount`、`filterDisabledCount`）。现在只有一个筛选入口（搜索框），表头全选复选框选中的就是当前可见列表，不再存在「下拉筛掉一半、全选却选了另一半」这类隐性歧义。
- 相邻两枚图标合并成一枚：截图说明与隐私提示、账号使用步骤与错误说明、默认模型与超时说明各合并为单个图标，正文用空格拼接；同时保持 `aria-expanded` 与内容常驻渲染树。
- 用量与额度页去掉半屏空白：原 `auto-fit` 双列网格在右列（账号/失败明细）无内容时会整列留空，改为单列纵向排布。
- 验证：生成块一致、版本一致、词表键中英齐备、仓库内链接全部可达；回归 cn 119 / intl 108 / root 40 = 267 通过 0 失败。

## 1.1.5 — 说明文字再收敛：内联图标不再单独成行（第 4 批收尾）

- 两条带能力与计费口径的说明改回**常显**：`toolNote`（模型目录以当前 CLI 返回结果为准，账号权限由官方判断）与 `creditsNote`（倍率来自本次 CLI 返回的官方目录，×0 表示标记免费）。它们承载「谁能用」「怎么算钱」，不该藏在图标后面。
- `setupNote` 与 `cliCheckNote` 合并成**一枚**图标，挂在「环境与安装」标题同一行；`SectionHeading` 新增 `hint` 槽位，区块级说明一律随标题渲染。
- **所有内联图标不得单独成行**：账号区三条说明合并挂「账号」标题行；覆盖标识与采集脱敏样本两条挂各自开关行；额度与诊断挂各自标题行；高级连接两条挂折叠标题行；目录说明挂「目录已就绪」状态行；图片说明挂「工具适配范围」链接行；反馈页各条挂各自标签行。同时删掉上一版遗留的一处重复渲染（多账号指南的图标在 summary 与正文各出现一次）。
- 状态条「已启用 / 总数」改用实时计算的 `enabledCount` 与 `models.length`，不再由 `models.length - hiddenModels.size` 推导，避免两者漂移。
- 用量那条长说明（累计输入含未缓存/缓存命中/缓存写入、重启后清零）不再单独成段，压进「累计请求 N 次 · 累计输入…」那一行的行尾图标。
- 测试：`test/hint.test.js` 判定规则改为可验证的形式——渲染某条折叠文案的那一行，除 `Hint` 外必须还有至少一个 `h()` 调用，否则判红；常显清单加入 `toolNote` 与 `creditsNote`；新增「启用数必须动态计算」用例。
- 验证：生成块一致、版本一致、152 个 `t()` 键中英齐备、12 个 Markdown 内部链接全部可达；回归 cn 119 / intl 108 / root 40 = 267 通过 0 失败。

## 1.1.4 — 设置页按新设计改版（第 4 批视觉重做）

- 顶部改为紧凑双层：`CodeBuddy` 标题 + 内联说明图标，右侧 `v1.1.x · 超时 Ns` 胶囊，下面一行副标题（新键 `subtitle`）；原先单独占一行的版本提示并入该胶囊。
- 三张大号 KPI 卡片改为一行四项状态条：CLI 状态 / 已启用 ÷ 总数 / 当前账号 / 本进程调用；每项可点击直达对应页签，当前页高亮。数值全部来自既有 status 字段，不新增后端接口。
- **说明文字的呈现方式重做**：上一版那个 22px 带边框的 `?` 圆钮被废弃，改成 16px 内联信息图标（默认 45% 透明度、展开时高亮，与标题或开关同一行），正文仍在同一卡片内以 12.5px 小字展开。`aria-expanded`、`display: open ? 'block' : 'none'` 与 29 处调用签名保持不变，因此 `test/hint.test.js` 的契约继续有效，不必为了改版把测试改绿。
- 模型目录工具栏单行化：标题 + 数量胶囊 + 刷新 + 状态筛选（全部 / 已启用 N / 已停用 N）+ 搜索框。状态筛选与搜索共用同一个 `shown`，表头全选复选框仍只作用于 `shown`，所以「全选只作用于当前筛选结果」这条既有约定不变。
- 批量操作只在勾选后出现（浮在表头上方的浅色条），独立的「全选 / 清空」大按钮移除，表头首列改为全选复选框（`aria-label` 仍为 `selectAll`）。
- 图片与预算那段长说明压成一行 `支持文本与标准图片附件（单次最多 5 张，单张 ≤ 2 MiB） · 工具适配范围 ▸`，全文仍收在紧邻的说明图标里。
- 连接页顺序调整为：环境与安装 → 请求行为开关（覆盖标识 / 采集脱敏样本，各自独立即时保存）→ 高级连接与默认值（默认折叠，只放低频参数）；低频参数不再挡在两个开关前面。
- 用量与诊断：诊断统计由纯文本改为四格指标条（已保存 / 失败 / 详细样本 / 脱敏样本），并删掉与新格子重复的那行文字及其词条 `rewriteAuditSample`；用量区改为两栏（本进程统计 / 历史与异常），窄屏自动堆叠。
- 词表：`locales/cn.zh.json` / `cn.en.json` 各补 14 键、删 1 键，生成块由 `scripts/build-client-locales.mjs` 重建。
- 验证：生成块一致、版本一致、152 个 `t()` 键中英齐备、12 个 Markdown 内部链接全部可达；回归 cn 119 / intl 108 / root 38 = 265 通过 0 失败。

## 1.1.3 — 默认模型兜底与说明文字收起（第 4 批）

- **默认模型兜底**（替代原来的「停用前会话预警」）：`lib/cn|intl/index.js` 的 `stream()` 计算 `selectedModel` 时改为兜底链——请求模型 → 配置的默认模型 → （仅当请求模型确实被停用时）目录中首个已启用模型 → CLI 默认；只是不在目录里的 id 一律原样透传，因为 CLI 可能接受目录快照之外的别名或模型。触发时写入 `runtimeStatus.modelFallback = { requested, used, at }`，并在状态接口的 `usage` 中暴露，界面在使用量区显示一行「请求 X → 实际 Y」。
- 边界如实说明：`session/model-unavailable` 由 DSH 宿主在发送前抛出（插件 `lib/` 全量 grep 0 命中），该请求到不了适配器，因此「会话停在已停用模型上被拒」这一层插件救不了；兜底覆盖的是仍会到达插件的隐藏/失效/账号变体模型 id。这句也已写进界面文案。
- 默认模型保留为**自由文本 + 目录建议**的原生组合框（`datalist`）：改成闭式下拉会砍掉「手输目录外 id」这条路，而这条能力必须保住；同一条理由也决定了请求期兜底链只拒绝被停用的 id。
- **说明文字收起**：新增 `Hint` 组件（`?` 圆钮，悬停展开、点击钉住，`aria-expanded` 同步）。29 处规则/背景类长说明（`intro`、`setupNote`、`cliCheckNote`、`accountNote`、`accountValidation`、`accountPrivacy`、`accountGuideSteps`、`accountGuideErrors`、`modelNote`、`timeoutHelp`、`rewriteClientNamesNote`、`captureRequestSamplesNote`、`catalogNote`、`imagesHelp`、`creditsNote`、`usageNote`、`balanceNote`、`logsNote`、`toolNote`、`regionNote`、`pageEntryHint` 与反馈页 8 条）收进 `?`；状态、结果、错误与会变的值（`saved`/`saving`/`saveFailed`、`saveFirst`、`accountUnsupported`、`feedbackReadOnly`、`channelUnavailable`、`logsStatus`、`rewriteAudit`、`catalogReady/Stale/Empty`、`modelsSelectionStatus`、`requestSize*`、`budgetNote`、`active` 等）仍常显。内容块始终挂在渲染树里（只切 `display`），读屏与既有读树断言不受影响。
- 词表：`locales/cn.zh.json` / `cn.en.json` 各补 2 键（`hintShow`、`modelFallbackNotice`）；本批一度新增又随组合框回退而删除的 `defaultModel` / `defaultModelFollow` 两键已一并清除，不留死键。

## 1.1.2 — 真实请求样本与标识覆盖审计（第 3 批）

- 新增 `lib/shared/request-audit.js`：把「系统提示范围」抽成可审计样本——`systemScopeTexts()` 只取 `envelope.system` 与 `role === 'system'` 的消息正文（用户、助手、工具消息一律不进样本），`redactText()` 按「最具体优先」遮盖 `sk-/pk-/rk-` 密钥、Bearer、data URI、≥64 字符长串、邮箱、长数字与 UUID 后再截断（先脱敏后截断，避免把密钥切成半截），`buildRequestSample()` 输出 ≤64 KiB 的结构化样本并附 `includesUserContent: false` 与 `identities` 统计。
- `lib/shared/prompt-rewrite.js` 新增 `scanIdentities()`：复用现有 4 条替换表与同一个 `looksLikePath()`，把命中分成 `guarded`（紧跟在路径分隔符后、属于 `D:\\DeepSeek Harness\\resources\\...` 这类合法运行时路径）与 `uncovered`（真正漏覆的文本）。**替换表本身一条都没改**，不在未验证的功能上叠加未验证的改动。
- `lib/cn|intl/request.js`：新增审计块 `rewrite = { enabled, hits, residual }`，`residual` 在**改写后的**系统范围上计算；`captureRequestSamples === true` 时另附 `requestSample`。两者都与 `diagnostics` 并列返回、不混入其中——`diagnostics` 的既有契约是「只放扁平数值」，`test/cn|intl/request.test.js` 有断言守着这条，本批因此特意没有改动那条断言。
- `lib/cn|intl/index.js`：新增配置 `captureRequestSamples`（默认关、`.volatile()`），样本交给 `recordRequestSample()` 落盘并从 per-call diagnostics 中摘除。
- `lib/cn|intl/diagnostics.js`：新增 `recordRequestSample()`——独立 `logs/requests/<ts>-<id>.json`、原子写、目录 0o700 / 文件 0o600、单份 ≤64 KiB、只保留最近 20 份；`status()` 增 `requestSamples`；`report().privacy` 增 `requestSamplesOnDisk` 并保持 `includesRequests: false`（导出不夹带样本）。同时修掉一个会让审计失效的问题：`summary()` 的 diagnostics 白名单会丢掉 `rewrite`，现在两侧都显式保留。
- 界面：`【连接配置】→ 覆盖标识` 下方新增默认关闭的「采集脱敏请求样本」勾选框（独立即时保存，与「覆盖标识」同形，不需要展开高级连接表单、也不需要按它的保存）；诊断日志区新增两行只读审计——本次改写命中数与插件可见范围内仍未覆盖的身份文本数（合法运行时路径不计），以及磁盘上已有脱敏样本数。
- 词表：`locales/cn.zh.json` / `cn.en.json` 各补 5 键，生成块由 `scripts/build-client-locales.mjs` 重建。
- 边界如实写进界面文案：CLI 在 OAuth 分支自己写入的身份段不经过插件，**任何样本都抓不到**；本批能验证的是「真实 `makeRequest` 输出现状 + 插件可见范围内的残留审计」，不是「逐请求检测 CLI 侧未覆盖段」。
- 测试：新增 `test/request-audit.test.js`（pathGuard 不计漏覆、脱敏先于截断、样本只含系统范围、64 KiB 上限、`makeRequest` 端到端、开关默认关、关闭时零改写）。

## 1.1.1 — 发布链路脚本化与词表外置（第 1、2 批）

- 新增 `scripts/sync-version.mjs`：版本号以 `package.json` 为唯一权威源，同步 `lib/shared/version.js`、`lib/client.js` 的内联常量，以及 README 与两份迁移文档；`--check` 模式下扫描 `lib/`、`test/`、`scripts/` 与 README/`package.json`，发现任何非当前版本的字面量即 exit 1，把「漏改一处就红」变成发布前的确定性失败。
- 版本号收口：`lib/cn/index.js`、`lib/cn/diagnostics.js`、`lib/intl/index.js`（两处）、`lib/intl/diagnostics.js` 与 `lib/client.js`（两处）不再写死版本字符串；服务端统一 `import { PLUGIN_VERSION }`，客户端 bundle 不能 `import`，改由同步脚本改写其 factory 顶部的内联常量。
- 新增 `scripts/release.mjs`：一条命令完成 bump → 版本同步校验 → `node --check` → 三批回归 → `npm pack` → `SHA256SUMS` → 单次提交 → 推送 `main` → 打/移 tag → 建 Release → 上传资产 → 自校验，并提供 `--dry-run`。tag 一律用**显式 lease 值**推送（`--force-with-lease=refs/tags/<tag>:<远端 sha>`），不再用 `-f`，也不再先 `fetch --tags --force`（那正是此前 `stale info` 失败的根因）。
- 发布判定口径固定：只以 GitHub 资产接口返回的 `size` 与 `digest` 判定成功；`releases/download/...` 直连成功与否只记录不阻塞，输出里明确标注「本机链路不可达 ≠ 资产缺失」。
- 新增 `scripts/changelog-section.mjs`：按版本抽取 CHANGELOG 小节作为 Release 正文，本地脚本与 CI 同源，避免两套口径。
- 新增 `.github/workflows/ci.yml`（push/PR：语法检查 + 三批回归 + 版本一致性校验）与 `.github/workflows/release.yml`（push `v*` tag：先校验 tag 版本 == 包内 version == CHANGELOG 小节，再打包并建 Release、上传资产）。
- 测试桩收口：新增 `test/helpers/schemastery-stub.mjs`，11 个测试文件不再各自复制一份 schemastery 桩（此前新增一个 `boolean` 字段曾让 9 个文件同时 `TypeError`）。
- `package.json` 的 `scripts` 固化 `--test-force-exit --test-timeout=60000`（治「跑完不退出」与「挂住变静默」），并新增 `test:all`、`check`、`release` 三个入口。
- 本批不发版：版本号保持当前值，下一批（计划下一次功能变更）再出包。

- **第 2 批：词表外置与两个检查器。** `lib/client.js` 里 6 张词表（国内版中英 195/195 键、国际版中英 247/247 键、反馈面板中英 73/73 键）改为由 `locales/*.json` 生成的内联区块，`locales/` 成为唯一手写来源；新增 `scripts/build-client-locales.mjs`（导出 / 重建 / `--check`，含 round-trip 深等断言，保证生成块与 JSON 逐键一致）。产物仍是 `__ModuleLoader__.load` 自包含单文件、零 import，测试的 `vm.runInContext(readFile(...))` 加载方式不变。
- 新增 `scripts/check-locales.mjs`：每个 `t('x')` 的键必须在中英两份词表里都存在，三对词表的键集合必须完全一致；无引用键只提示不失败（`t(region.id)` 这类动态键无法静态解析）。这条检查的直接动机是删掉 `modelVisibilityNote` 后 `t('feedbackGroup')` 的渲染仍留着、会在「运行配置未就绪」状态露出空串。
- 新增 `scripts/check-links.mjs`：Markdown 内部相对链接与代码内 `blob/main/...` 仓库内链接必须可达，外链只记录不判失败（离线或网络抖动不该让 CI 变红）。上线即抓到两个真死链——`docs/cn/工具适配范围.md` 与 `docs/cn/TOOL_COMPATIBILITY.en.md` 里的 `../README.md`、`../README.en.md` 解析成不存在的 `docs/README.md`，已改为 `../../`。
- `scripts/release.mjs` 增「词表与链接检查」步骤（排在回归之后、打包之前，护栏不进发布链路等于没有）；`.github/workflows/ci.yml` 增同名步骤；`package.json` 增 `check:locales` / `check:links` / `check:all` / `locales` 四个入口。
- 验证：生成块一致性、`t()` 键与中英键集合、仓库内链接、语法检查全部通过；回归 cn 119 / intl 108 / root 26（含 3 条检查器用例）= **253 通过 0 失败**；`release.mjs 1.1.1 --dry-run` 走完 11 步 exit 0。
- 本批未含组件拆分（2B）：`lib/client.js` 仍是单文件，拆分需改为「源码分片 + 拼接生成」并先处理测试里对源码字符串的断言。

## 1.1.0 — 清理他人痕迹，对外可见名统一为 CodeBuddy

- 对外可见名统一：`package.json` 的 `displayName`、侧栏入口名、四个中英页面标题、反馈包 README 与 ZIP 文件名中的 `DKN`/`dsh-DKN-codebuddy` 全部改为 `CodeBuddy`（ZIP 前缀改为 `dsh-codebuddy-feedback-`）。
- 内部标识一律未动，因此不出会话、不掉本地数据：包名 `dsh-dkn-codebuddy-cli`、`cordis.patch.yml` 的两行 `name`、client bundle id 与 `BUNDLE_NAME`、locale 命名空间、provider id `codebuddy-cli-cn/intl`、前缀 `llm-codebuddy-cli-cn/intl`、存储目录 `%LOCALAPPDATA%\dsh-codebuddy-cli-{cn,intl}` 保持不变。
- 删除原始维护者的 QQ 群反馈渠道：`report.json` 的 `support` 字段、反馈 ZIP 内 README 的中英两句、以及 `feedbackIntro`/`feedbackDownloaded`/`feedbackGroup` 等词条中的群号与「群主」表述；`docs/问题反馈.md`、`docs/ISSUE_REPORT.en.md` 随反馈页签早已移除一并删除。
- 清理死链与死键：删除指向已删文档的 `guideFull`/`guideFullUrl`（中英 × 国内/国际共 8 条），并让国际侧「工具与返回内容适配范围」链接不再被改写为不存在的 `docs/intl/` 路径。
- 两份迁移文档版本对齐到当前版本（`安装与迁移：1.1.0` / `Install and migrate — 1.1.0`），并去掉「整合版」措辞。
- 仓库清理：删除 0.3.5/0.3.9/0.4.0/0.4.2/1.0.1/1.0.3/1.0.4 七个历史安装包，`releases/SHA256SUMS.txt` 只保留 1.0.5 起的校验值。
- 本地测试同步：`test/feedback.test.js` 不再断言群号，改为断言不存在 `support` 字段，并跟随新的 ZIP 文件名前缀。
- Visible names are now `CodeBuddy`: displayName, sidebar entry, the four page titles and the feedback bundle naming no longer contain `DKN`. Internal ids, provider ids and storage directories are deliberately unchanged so existing sessions and local data keep working. The original maintainer's QQ group support channel is removed from the report payload, the bundle README and the locale strings, and the two orphan feedback documents are deleted. Dead `guideFull` keys are gone and the International compatibility link no longer points at a nonexistent path. Both migration documents now target 1.1.0, and the seven pre-1.0.5 packages were removed from `releases/`.

## 1.0.9 — 覆盖标识独立成块，移除模型页停用提示

- 【覆盖标识】从「高级连接与默认值（可选）」折叠块中拆出，成为【连接配置】页内的**独立区块**（区块标题「覆盖标识」+ 独立说明），不再随该折叠块一起被折叠。
- 该开关改为**即时保存**：勾选/取消即写入 DSH 配置并生效，不需要展开折叠块，也不需要按它的「保存」；新增 `saveRewrite()` 单独提交 `rewriteClientNames`，并把该字段从高级连接表单的变更键列表中移除，避免两条保存路径互相干扰。
- 删除模型目录页那句「取消勾选后，该模型不再出现在 DSH 模型选择器，也不能用它给会话发送消息……」提示及其词条 `modelVisibilityNote`（中英各一条），保留「共 {total} 个模型 · 已选 {selected} 个 · 已停用 {hidden} 个」状态行。
- 验证：8 个改动文件 `node --check` 通过，回归 250/250（cn 119 / intl 108 / root 23）零失败。
- The **Cover identity** switch is now its own section on the Connection page instead of living inside the collapsed connection block, and it saves immediately when toggled. The old model-page note (`modelVisibilityNote`) is removed in both locales; the model count status line stays.

## 1.0.8 — 模型批量启用/停用 + 系统提示「覆盖标识」

- 模型目录页改为**批量工具栏**：`停用选中` / `启用选中` / `全选` / `清空` + 筛选输入框；表格首列改为选择复选框，新增「状态」列显示已启用 / 已停用，停用行降透明度（列数 5→7）。
- `全选` 只作用于**当前筛选结果**，不会选中被筛掉的模型；按钮文字带选中计数（`停用选中（3）`）。
- 服务端 `setModelVisibility` 接受 `{ ids, enabled }`（继续兼容单条 `{ id, enabled }`），校验数组非空、≤500、逐条合法与去重。
- 批次护栏按**整体判定**：若整批生效后目录里一个可见模型都不剩，则整批拒绝并返回 `409 MODEL_VISIBILITY_LAST`；「启用」永不被该护栏拦住（否则目录全隐藏后无法恢复）。
- 偏好存储新增 `setHiddenMany(ids, enabled)`：一次计算、一次原子落盘、返回 `changedIds`；批量操作只发一次 `llm/models-updated` + `llm/adapters-updated`，模型选择器不再连闪。
- 【连接配置】最下方新增**覆盖标识**开关（默认开启）：在 `makeRequest` 组装完信封后，仅对 `system` 与 `role === 'system'` 的内容做大小写不敏感替换——`You are Claude Code, Anthropic's official CLI for Claude` → `You are WorkBuddy, a coding agent`，`Anthropic's official CLI for Claude` / `Claude Code` / `DeepSeek Harness` → `WorkBuddy`；按长串优先、幂等，并跳过形如 `D:\DeepSeek Harness\...` 的路径片段；用户 / 助手 / 工具消息按原引用返回，逐字不改。
- 国内版与国际版的目标名同为 **WorkBuddy**（workbuddy.cn / workbuddy.ai），因此 cn 与 intl 共用一份替换表。CLI 自身在 OAuth 分支写入的身份段不经过插件，不在覆盖范围内。
- Batch enable/disable for the model catalog: a toolbar with Disable selected / Enable selected / Select all / Clear plus a filter box, a selection column and a Status column. Select all applies to the current filter only, and a batch is validated as a whole (a batch that would leave no visible model is rejected atomically; enabling is never blocked). `setHiddenMany` persists once and the catalog is announced once. A new **Cover identity** switch in Connection rewrites client self-names inside the system prompt only (case-insensitive, longest match first, idempotent, path fragments such as `D:\DeepSeek Harness\...` are skipped); user, assistant and tool content is returned by reference and never modified. Both regions target **WorkBuddy**.

## 1.0.7 — 移除「问题反馈」「使用指南」两个页签

- 配置页导航收窄为**连接配置 / 模型目录 / 账号管理 / 用量与额度**四项；移除「问题反馈」与「使用指南」整块界面（含 `IssueFeedback` 面板与指南 9 条子项）。
- 新增独立**日志查看**页签（导航第五项，图标 `logs`，词条 `navlogs` 中英各一条）：只保留「查看普通日志 / 收起日志」，复用既有只读接口，不再提供样本采集、导出与清空等写操作。
- 删除已无入口的 4 份文档：`docs/cn|intl/使用与故障处理指南.md`、`docs/cn|intl/USER_GUIDE.en.md`，并移除 README 中对应链接与「问题反馈」段落。
- `IssueFeedback` / `createFeedbackKit` 子系统代码保留（仍被 `test/feedback.test.js` 直接引用），仅摘除界面入口。
- Remove the **Report an issue** and **Help** tabs; navigation is now Connection / Models / Accounts / Usage. A read-only diagnostic-log block (view only) replaces the feedback page log tools. Delete the four unreferenced guide documents and their README links.

## 1.0.6 — 模型启用/禁用

- 侧栏“模型”表格新增**启用**勾选列：取消勾选后，该模型不再出现在 DSH 模型选择器，也不能用它给会话发送消息；已停在该模型上的会话需重新选择。
- 偏好保存在 `%LOCALAPPDATA%\dsh-codebuddy-cli-{cn,intl}\preferences\index.json`（原子写、拒绝符号链接与超大文件）；偏好文件损坏时降级为“未隐藏任何模型”，不会让整个模型目录消失。
- 服务端在 `listModels` 中按偏好过滤，并在切换后发出 `llm/models-updated`，选择器无需重载页面即可刷新；隐藏按基础模型 ID 记录，多账号共享同一份清单。
- 护栏：不能停用最后一个可见模型（返回 `MODEL_VISIBILITY_LAST`）；若目录变化导致全部模型都被隐藏，自动回退为完整列表，避免提供方从选择器中消失。
- 语义提醒：DSH 在发送前会用 `listModels` 校验选择，因此“停用”同时意味着“禁止用该模型发送”，页面已给出明确提示。
- Add an **Enabled** checkbox per model in the sidebar table. Unchecked models leave the DSH picker and cannot be used to send messages; the choice persists in `%LOCALAPPDATA%\dsh-codebuddy-cli-{cn,intl}\preferences\index.json`. Filtering happens in `listModels` and emits `llm/models-updated`, so the picker refreshes without a reload. The last visible model cannot be disabled, and a fully hidden catalog falls back to the complete list.

## 1.0.5 — DSH 0.2.2-rc.3 兼容

- 修正版本门禁：`engines.dsh` 与 7 个 DSH peer 依赖由逐版本枚举改为区间 `>=0.2.1-rc.2 <0.3.0-0`，覆盖 0.2.2-rc.2 / rc.3，并预留 rc.4 / rc.5；0.3.0 及以上仍不放行。
- 根因：DSH 自 0.2.1-alpha.3 起由 `engines.dsh` 独占判定（`peerDependencies` 被忽略），旧区间最大只到 0.2.2-rc.1，导致 `cordis.patch.yml` 的两行在启动时被静默禁用。
- 代码零改动：抽取 app.asar 内 0.2.2-rc.3 宿主源码逐项核对 LlmAdapter / StreamChunk / 模型目录 / attachments / webServer / locale / layout / slots / configForms 契约，均与现有实现一致。
- README、README.en、多账号使用指南、ACCOUNT_GUIDE.en 的版本声明同步更新。
- Fix the version gate: `engines.dsh` and the seven DSH peer ranges now use `>=0.2.1-rc.2 <0.3.0-0`. No source changes were required; the host API surface used by the plugin is unchanged in 0.2.2-rc.3.

## 1.0.4 — DSH 0.2.2-rc.1 兼容

- engines.dsh与7个DSH peer依赖增加精确0.2.2-rc.1支持，保留已有rc.2–rc.5支持。
- 依据官方npm实际发布包核对模型、工具、附件、配置表单与侧栏协议；保持原区域/账号/图片请求逻辑。GitHub对应版本标签尚未出现，不将alpha源码作为rc.1依据。
- Add explicit DSH 0.2.2-rc.1 support while retaining the previously supported 0.2.1 release candidates. Audit the actual official npm artifacts rather than treating GitHub alpha sources as rc.1. Actual desktop acceptance remains pending.

## 1.0.3 — DSH rc.5 兼容

- 兼容声明补齐DSH 0.2.1-rc.4与rc.5，保留rc.2/rc.3。全部DSH peer依赖同步声明。
- 对照官方rc.3/rc.5完整源码核对模型、附件、配置、侧栏和布局接口；本插件使用的接口无实现变化，区域调用、图片和账号策略沿用1.0.2。
- Add explicit DSH 0.2.1-rc.4/rc.5 compatibility while retaining rc.2/rc.3. Audited official source contracts; installed desktop rc.5 acceptance remains pending.

## 1.0.2 — 多账号 CLI 兼容

- 国内与国际多账号管理增加官方 npm/Node CLI 2.177.0，保留2.174.0兼容；其他版本仍需核查。
- 登录脚本绑定生成时检测到的CLI版本，运行时版本变化需重新生成命令。
- 移除多账号标题中的预览标记，保留真实双账号登录、刷新与扣费归属未验收说明。
- Support official npm/Node CLI 2.177.0 alongside 2.174.0 for both regions. Pin generated sign-in scripts to the inspected version; keep real dual-account sign-in, refresh and billing validation limits explicit.

## 1.0.1 — 反馈流程优化 / reporting workflow

- 必填精简为问题简述、实际结果、上下文截图；所有输入分为红色#必填、黄色#最好填、普通色#可选，非必填材料缺失只作证据提示、不阻止生成。
- 日志随反馈页进入自动读取，导出前更新快照；日志查看/导出/失败采集集中到反馈页，不必先导出再选择本地文件。
- 保留可选本地诊断JSON替换，核验格式/大小/区域及重复ID；旧文件无区域时需确认，替换与自动源互斥，可一键恢复。新诊断导出标记区域。
- 原生长下拉改为页面内可搜索记录列表，优先显示故障、可展开其他记录；跟随深浅主题，避免浅色文字叠在白色弹层上。
- 国内国际分别保留表单、日志来源和材料。原模型、工具、账号、图片处理策略及旧1.0.0固定包保留；本地验证不代表实际DSH宿主验收或GitHub发布。
- Require only a summary, actual result and context screenshot. Mark required/recommended/optional with red/yellow/normal #. Collect logs automatically and integrate existing log tools. Support validated, region-safe local JSON replacement without merging sources.
- Replace the native popup with a searchable, theme-aware in-page list. Preserve independent regional drafts and inference/tool behavior.

## 1.0.0 — 本地整合版 / local unified build

- 整合版新名称 dsh-DKN-codebuddy cli，包名 dsh-dkn-codebuddy-cli，版本从1.0.0重新开始；旧独立插件、固定安装包及提供方/账号/日志兼容标识不改名。
- 配置页新增“问题反馈”板块，两区域分别填写描述、选择诊断事件、附上下文截图和脱敏对话/工具日志；强制补齐必要文字和截图，无法取得ID时可说明原因。
- 预览并确认后本地生成ZIP，包含问题说明、版本/安全配置摘要、匹配调用、近期诊断、用户材料及SHA-256清单；明示缺失、旧版本和仍在运行的调用，不把其他日志当作本次故障。
- 原始失败样本需主动选择且只附精确ID匹配的已有样本，含图请求原始回复仍排除；不自动采集、重试、读凭据或上传，模型与工具执行逻辑不变。
- 截图本地解码后重新编码PNG移除元数据，提供文本常见密钥遮盖、附件大小限制和逐项确认；图片像素及其他隐私仍需用户自行检查打码。
- 页面和反馈包提示加入QQ群1095591284，联系群主私发。本轮仅本地打包，未安装到用户DSH或发布GitHub，本条不代表已上线。
- Add regional issue-report forms with required context screenshots, reproduction details, exact diagnostic-ID matching and explicit evidence gaps. Locally prepare a reviewable ZIP with hashes, safe runtime facts, recent diagnostics and user-selected supplements.
- Raw samples require explicit opt-in and the exact event, excluding image replies. Preserve inference/tool execution. Strip screenshot metadata, mask common text secrets on a best-effort basis, and require review before download. Join QQ group 1095591284 to contact the owner; no automatic upload.

## 0.4.4 — 本地合并预览 / local unified preview

- 国内0.4.3与国际0.2.2合并为一个安装包，保留两个提供方及原配置入口ID。
- 一个侧栏配置入口，国内/国际页内切换；六个功能板块统一布局，区域草稿、账号动作、目录、用量、诊断与导出各自独立。
- 共用相同的CLI启动定位、文字恢复及用量归一化模块。保留两区域图片流/解析策略、账号目录/模型前缀及20/24MiB输入限制。
- 国内默认调用和生成的登录命令不继承外部国际配置目录；使用过该环境变量的用户可显式恢复原配置目录。不修改系统环境或用户登录文件。
- 补齐国际诊断字段的专用展示、控制事件统计、24MiB说明及带区域的日志导出文件名。
- Combine the China 0.4.3 settings UI and existing regional adapters in one package, preserving separate providers/configuration identities, caches, statistics, diagnostics, image protocols and account namespaces.
- Reuse three identical pure helpers; retain region-specific transport logic. Prevent inherited foreign config directories in default China calls/login commands, with explicit migration guidance.
- Add same-process isolation tests and unified browser fixtures. Actual installed DSH/profile/session migration and official model calls remain unverified; this is not a GitHub publication or a fix for unresolved upstream incidents.
