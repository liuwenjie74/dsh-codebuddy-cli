# 更新记录 / Changelog

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
