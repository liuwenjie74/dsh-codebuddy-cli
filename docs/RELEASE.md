# 发布流程

一条命令发版，不再手工串临时脚本。

## 前置条件

- 本机已登录 GitHub，`git credential fill`（`host=github.com`）能取到凭据；脚本只在内存中使用，不落文件、不打印。
- 当前分支是 `main`，工作区干净（脚本会检查，不干净直接失败）。
- 目标版本已写进 `CHANGELOG.md` 的一个 `## <版本>` 小节——Release 正文就是从这里抽的。

## 发版

```bash
node scripts/release.mjs <X.Y.Z> --dry-run   # 先演练：不写文件、不打包、不提交、不推送
node scripts/release.mjs <X.Y.Z>             # 正式发布
```

脚本按顺序执行，任一步失败立即停止并打印**复现命令**：

1. `bump package.json`
2. `scripts/sync-version.mjs`（同步派生版本号）+ `--check`（全仓不得残留非当前版本的字面量）
3. `node --check` 全部 `lib/`、`scripts/`、`test/` 下的 JS
4. 三批回归（`test/cn`、`test/intl`、`test/`），带 `--test-force-exit --test-timeout=60000`
5. `npm pack` → `releases/<name>-<version>.tgz`
6. 计算 SHA-256 → 写入 `releases/SHA256SUMS.txt`
7. 单次提交 + 推送 `main`
8. 打/移 tag 并推送
9. 建 GitHub Release（正文取 CHANGELOG 对应小节）+ 上传资产
10. 自校验

## 三条硬约束（每条都对应一次真实事故）

**tag 只用显式 lease 推送。**

```bash
git ls-remote --tags origin refs/tags/<tag>            # 先取远端实际 sha
git push --force-with-lease=refs/tags/<tag>:<远端 sha> origin refs/tags/<tag>
```

绝不用 `-f`；也绝不先 `git fetch --tags --force`——那会刷新本地追踪值，使 `--force-with-lease` 以 `stale info` 失败。

**发布是否成功只认服务端 `size` + `digest`。**

`releases/download/...` 直连成功与否只记录、不阻塞：历史上出现过超时、`ECONNRESET`、`404` 三种症状，而同一时刻 API 侧资产 `state=uploaded`、`size` 与 `digest` 都与本地包逐字节一致。因此脚本的结论来自 digest，输出里也会明确写「本机链路不可达 != 资产缺失」。

**版本号只有一个权威源。**

`package.json` 的 `version`。其余位置（`lib/shared/version.js`、`lib/client.js` 的内联常量、README 与两份迁移文档）由 `scripts/sync-version.mjs` 派生；`--check` 模式在 `lib/`、`test/`、`scripts/` 与 README/package.json 里扫描任何非当前版本的 `1.x.y` 字面量并失败。`CHANGELOG.md` 与 `releases/` 天然排除（前者保留历史小节，后者是产物）。

## CI

- `.github/workflows/ci.yml`：push `main` 与所有 PR 跑语法检查、三批回归、版本一致性校验。
- `.github/workflows/release.yml`：push `v*` tag 时先校验**tag 版本 == 包内 version == CHANGELOG 小节**，三者不一致直接失败不发布；通过后 `npm pack` 并用 `GITHUB_TOKEN` 建 Release、上传资产。

## 失败怎么复盘

脚本每个步骤都有 `=== step N: ...` 行，失败处会输出被调用命令与可直接复制重跑的命令。常见三种：

| 症状 | 含义 | 处理 |
|---|---|---|
| `工作区不干净` | 有未提交改动 | 先提交或 `git stash`，再重跑 |
| `残留旧版本字面量 ...` | 某处仍写死版本 | 改掉该处；运行时位置应引用常量而非字面量 |
| `下载链接在本机不可达` | 本机到下载域的链路问题 | 不用管，看 digest 判定；需要肉眼确认就用浏览器打开 Release 页 |
