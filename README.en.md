# CodeBuddy CLI — China and International

[简体中文](README.md)

**2.1.33 supports DSH >=0.2.1-rc.2 <0.5.0-0 (including 0.2.2-rc.1 / rc.2 / rc.3).**

[Download v2.1.33](https://github.com/liuwenjie74/dsh-codebuddy-cli/releases/download/v2.1.33/dsh-dkn-codebuddy-cli-2.1.33.tgz) · [Changelog](CHANGELOG.md) · [Installation & Migration](docs/MIGRATION.en.md)

One package and one unified **CodeBuddy** sidebar settings page containing two isolated official CLI providers: **China (`codebuddy-cli-cn`)** and **International (`codebuddy-cli-intl`)**. DSH retains full conversation and business-tool control while this plugin bridges local official CLI execution and catalog sync.

## Key Features

- **Connection & Switches**: One-click CLI detection and installation, instant feature switches (system-prompt identity rewrite with audit readout, opt-in redacted request sampling, inline image Base64, quota-exhaustion failover), and collapsible advanced defaults (enabled-model dropdown with linked reasoning effort, 5-minute default timeout, and configurable concurrency queue).
- **Model Catalog**: Auto-syncs models and credit multipliers every 15 minutes with All / Enabled / Disabled segmented filters, capability filters (images / reasoning / ≤1×), sorting, and batch toggle. See [Tool Compatibility](docs/cn/TOOL_COMPATIBILITY.en.md).
- **Multiple Accounts**: Two-column Account Overview and isolated per-account directories (Windows official CLI 2.174.0+, npm `codebuddy.cmd` or native `codebuddy.exe`) with live credit cards, gradient progress bars, package expiry details, and automatic quota failover. See [Account Guide](docs/intl/ACCOUNT_GUIDE.en.md).
- **Token Usage**: 6-card visual dashboard featuring a 6-up summary & cache-hit ring, per-model stacked breakdown, recent 24-call trend (duration / tokens), failure breakdown, per-model table, CSV export, and request-size hints on timeout cards.
- **Logs & Diagnostics**: Auto-loaded structured log timeline with status/keyword filtering, raw JSON toggle, basic/detailed log export, and local-only privacy guarantees (no automatic uploads).

## Region Isolation & Scope

- China and International channels keep separate child-process environments, model catalogs, usage counters, diagnostic logs, and cancellation states. Switching regions in settings only changes the active settings view.
- Envelope budget is 12 MiB; final input budget is 20 MiB (China) and 24 MiB (International image stream).
- Sign-in and billing are handled exclusively by the official CLI and official sites; this plugin provides no relay server, shared accounts, or credit resale.
