# CodeBuddy CLI — China and International

[简体中文](README.md)

**Unified 2.1.16 supports DSH >=0.2.1-rc.2 <0.5.0-0 (including 0.2.2-rc.1 / rc.2 / rc.3).**

[Download v2.1.16](https://github.com/liuwenjie74/dsh-codebuddy-cli/releases/download/v2.1.16/dsh-dkn-codebuddy-cli-2.1.16.tgz) One package and one CodeBuddy sidebar page contain two separate official CLI providers. DSH retains conversation and business-tool control.

Choose a region in settings, then Connection, Models, Accounts, Usage or Logs. This changes the settings view only. Select the intended provider in each DSH conversation.

Before installation, record existing settings and disable both standalone plugins while no task is running. Retain old packages, sessions and official sign-in files. Do not enable old adapters alongside this package. See [migration instructions](docs/MIGRATION.en.md).

Original provider IDs, configuration entry IDs and account-bound model IDs remain available. Profile overrides naming old modules may require manual setting restoration; automatic migration of every existing profile is not claimed. Actual DSH UI and old-session continuation remain unverified.

Region-specific environment, catalogs, counters, logs, cancellation, native parsers and budgets remain separate: 12MiB envelopes, 20MiB China final input and 24MiB International image-stream input. No automatic region/account fallback is added. Shared invocation, lexical-envelope and usage helpers are pure common modules; region-sensitive processing remains separate.

Default CLI mode preserves official sign-in storage; separate config directories alone do not establish credential isolation. Use isolated-account environments where needed (Windows official CLI 2.174.0 or newer: the npm `codebuddy.cmd` or the official `codebuddy.exe`). Real multi-account refresh and billing attribution still need acceptance testing.

237 automated checks and synthetic headless UI checks passed. No real official model call, actual DSH business tool or private-session replay was performed. Merging does not resolve unknown incidents, improve connectivity or grant model/credit permissions. This independent adapter provides no relay server, shared accounts or credit resale.

