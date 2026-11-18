# International Isolated Account Guide

The account pool gives each International Site account its own CodeBuddy CLI configuration directory and Windows user-directory environment. A model labelled with an environment in DSH stays bound to that environment, including later tool-result and image follow-ups.

Windows is supported with the official CodeBuddy CLI `2.174.0` and above: the npm `codebuddy.cmd` or the official `codebuddy.exe`. `2.174.0 / 2.177.0` are verified and newer builds are used with a warning. Native executables rely on honouring the isolated directories -- an account that does not show a local sign-in reports no credential and never borrows another account. Other operating systems and non-official entrypoints (for example an arbitrary `node.exe` running a custom script) cannot use isolated account calls. Default single-account mode remains available. Real dual-account sign-in, token refresh and official billing attribution have not been verified with real accounts.

## Add and sign in

1. Open **Isolated account environments**, enter a label used only to distinguish environments on this computer, and add it.
2. Prepare the official sign-in command. It starts a dedicated PowerShell script and contains no login credential.
3. Run the command in a new PowerShell window. Choose **International Site** in the official CLI sign-in menu, verify the account identity, finish sign-in, and exit the CLI.
4. Select the environment in settings and refresh the model catalog.
5. Choose a model carrying that label in the DSH model picker. An existing conversation stays bound to its original environment when the settings selection changes.

Adding or selecting an environment and refreshing its model catalog send no model prompt. Catalog refresh does not run DSH business tools. The first actual conversation is subject to the selected model and the official service's usage rules.

## Binding and failures

The account model ID includes its environment binding. A conversation using an A-labelled model continues to use A after the settings page switches to B, including later tool and image follow-ups. If A is removed from the management list, its old conversations fail explicitly; they do not switch to B or the default sign-in. While an isolated environment is selected, old unbound model IDs are rejected. Select a model carrying the environment label in DSH.

The plugin does not rotate accounts by default: a 401, network error, permission failure or timeout is reported as-is, because switching accounts would only repeat the failure and hide the real cause. Only when "switch account when credits run out" is enabled on the settings page, and the upstream explicitly reports a quota error (`CLI_INSUFFICIENT_BALANCE` or HTTP 402) before anything has been streamed, does the plugin mark that account as exhausted (10-minute cooldown) and step aside to the next account that has a sign-in record. Rerun the generated official sign-in command for the affected environment and choose International Site. The CLI gate is a shape check plus a floor: 2.174.0 and above are allowed, with 2.174.0 and 2.177.0 verified; a newer build is used with a warning, and only an unparsable or below-floor version is refused. The default single-account mode is unaffected by this gate.

## Remove an environment

Before removing an entry, switch to the default single account or another environment and wait for its active calls to finish. Removing an entry only removes its label from the management list. It does not sign out or delete official CLI sign-in files or other files a user may have added. To sign out, use a flow supported by the official CLI in that isolated environment.

## Local counters and privacy

Settings shows request, input-token and output-token counters for each environment within the current plugin process. The counters reset when the plugin restarts; they are not official billing, credit balances or remaining quota. Use the official usage page for billing information.

The plugin checks only whether a sign-in file exists and is nonempty; it does not read its contents. Sign-in data stays in each isolated environment. Labels, directories and credentials are not placed in model prompts; diagnostic logs use only a random environment ID and do not record labels, directories or sign-in file contents. Logs are never uploaded automatically.

If the account list, an environment directory or a lock file is invalid, isolated account operations stop with an error instead of silently using the default account. An existing lock is treated as another process updating the list; the plugin does not decide whether a lock is stale or take it over.
