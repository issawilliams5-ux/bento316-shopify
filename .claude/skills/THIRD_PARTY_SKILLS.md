# Third-party skill packs (vendored 2026-11-12)

Six public GitHub repos from a social-media "7 repos" post were read through and copied here as **pinned copies**. Nothing is fetched at runtime and no install script was run. The seventh ("Repo 1", slide 2 of that post) was not in the screenshots, so it is **not installed**.

| Pack | Upstream @ pinned commit | Licence | Included | Invocation |
|---|---|---|---|---|
| humanizer | `blader/humanizer` @ `b48c832f0f809c1b5658edbb838c2521b72f2413` (v4.0.0) | MIT | `humanizer` | automatic |
| scroll-craft | `nateherkai/scroll-craft` @ `75d81f74e83692add18cd7a8a8e078b8a887a579` (v0.3.1) | MIT | `scroll-craft` (skill, engine, scripts, references) | automatic |
| agent-skills | `addyosmani/agent-skills` @ `301b02b12bff98e4688e6984af6556802322bbde` (v0.6.15) | MIT | 24 of 25 skills, 7 shared checklists, 9 slash commands, 2 subagent personas | automatic |
| expo-skills | `expo/skills` @ `2a326eb51ddd93301577ad47a7bd2f2e671d53b2` | MIT | 24 skills (`expo-*`, `eas-*`) | **on demand only** |
| google-workspace-cli | `googleworkspace/cli` @ `cd3697e07eb520056dcf142d0c7439bbb9ba32e9` (skills v0.22.5) | Apache-2.0 | 19 of 95 `gws-*` skills | **on demand only** |

**Where things are.** `.claude/skills/` (Claude Code), mirrored byte for byte to `.agents/skills/` (Codex). `.claude/references/` and `.agents/references/` hold the seven shared checklists that the `agent-skills` skills link to as `../../references/...`. `.claude/commands/` holds the nine commands (`/spec`, `/plan`, `/build`, `/test`, `/review`, `/code-simplify`, `/ship`, `/constraints`, `/webperf`) and `.claude/agents/` the two personas (`test-engineer`, `web-performance-auditor`). Licences are in `*-LICENSE` files in this folder (and inside the two single-skill packs); the Apache-2.0 change notice is `GWS-CLI-NOTICE.md`.

## Invocation modes

* **Automatic** (the upstream default): the 26 skills above add about 10,151 characters of descriptions (roughly 2,500 tokens) to every session prompt in each repo. Several have broad triggers: `test-driven-development` ("implementing any logic, fixing any bug") and `git-workflow-and-versioning` ("any code change") will often load.
* **On demand only**: Expo (24) and Google Workspace (19) carry `disable-model-invocation: true` (Claude) and `policy: allow_implicit_invocation: false` in `agents/openai.yaml` (Codex). They add nothing to the prompt and never trigger by themselves. Run them by name: `/expo-overview`, `/gws-gmail`, and so on. Reasons: no Expo project exists in either repo (and `expo-data-fetching` matches "ANY network request"); the `gws` binary is not installed, so automatic `gws-*` skills would steal Gmail/Drive/Calendar requests from the working connectors.
* To flip a pack: delete the `disable-model-invocation: true` line (and the `policy:` block in `agents/openai.yaml`) from each of its skills, or delete the line from the skills you want automatic.

## Changed from upstream (complete list, checked by diffing every installed skill against its pinned upstream folder)

1. `allowed-tools` frontmatter **removed** from 7 skills: `scroll-craft`, `eas-simulator`, `eas-update`, `eas-update-insights`, `eas-workflows`, `expo-examples`, `expo-ui`. Upstream pre-approved tool patterns such as plain `Bash` (scroll-craft) and `Bash(npx *eas-cli@*)` (which also matches any package whose name ends in `eas-cli`). A skill file should not widen permissions, so those skills now ask like everything else.
2. The 43 on-demand skills: `disable-model-invocation: true` added to `SKILL.md`; `agents/openai.yaml` created (19 gws skills) or given a `policy:` block (24 Expo skills).
3. Slash commands: the plugin-namespace prefix `agent-skills:` removed in 8 of 9 command files (written for plugin installs; as project skills the names are unprefixed).
4. Added files: `LICENSE` in `scroll-craft/` and `humanizer/`, the `*-LICENSE` files, `GWS-CLI-NOTICE.md`, this file.

No `SKILL.md` text below the frontmatter was edited, and the two vendored personas are byte-identical to upstream.

## Included skills

* humanizer: `humanizer`
* scroll-craft: `scroll-craft`
* agent-skills (24): `api-and-interface-design`, `browser-testing-with-devtools`, `ci-cd-and-automation`, `code-review-and-quality`, `code-simplification`, `constraint-driven-development`, `context-engineering`, `debugging-and-error-recovery`, `deprecation-and-migration`, `documentation-and-adrs`, `doubt-driven-development`, `frontend-ui-engineering`, `git-workflow-and-versioning`, `idea-refine`, `incremental-implementation`, `interview-me`, `observability-and-instrumentation`, `performance-optimization`, `planning-and-task-breakdown`, `security-and-hardening`, `shipping-and-launch`, `source-driven-development`, `spec-driven-development`, `test-driven-development`
* expo-skills (24): `eas-app-stores`, `eas-hosting`, `eas-observe`, `eas-simulator`, `eas-update`, `eas-update-insights`, `eas-workflows`, `expo-animation`, `expo-app-clip`, `expo-brownfield`, `expo-data-fetching`, `expo-design-system`, `expo-dev-client`, `expo-dom`, `expo-examples`, `expo-module`, `expo-native-ui`, `expo-overview`, `expo-project-structure`, `expo-router`, `expo-ui`, `expo-upgrade`, `expo-web-to-native`, `expo-migrate-module`
* google-workspace-cli (19): `gws-shared`, `gws-drive`, `gws-drive-upload`, `gws-gmail`, `gws-gmail-send`, `gws-gmail-triage`, `gws-gmail-reply`, `gws-gmail-reply-all`, `gws-gmail-forward`, `gws-gmail-read`, `gws-gmail-watch`, `gws-calendar`, `gws-calendar-agenda`, `gws-calendar-insert`, `gws-docs`, `gws-docs-write`, `gws-sheets`, `gws-sheets-append`, `gws-sheets-read`

## Not installed, and why

* **Open SEO** (`every-app/open-seo` @ `4fa42c879fd26657aec3472dcf44f08226816df3`): an application, not a skill. Its 12 agent skills only work through the hosted MCP server `https://app.openseo.so/mcp` (hosted subscription, listed by the project at $10/month) or a self-hosted deployment with the owner's own DataForSEO API key (pay per call). Needs an owner decision on account and cost first.
* **Hosted MCP servers** shipped inside the Expo and Open SEO plugins (`https://mcp.expo.dev/mcp`, `https://app.openseo.so/mcp`): not added to `.mcp.json`. Each adds tools to every prompt and sends data to a third party; this repo's MCP list is deliberately short.
* **agent-skills extras**: `hooks/` (opt-in hooks that intercept `Read`, `Edit`, `Write` and `WebFetch`), the `using-agent-skills` meta-skill (a second skill router; upstream itself says not to run it where skills already route natively), the `code-reviewer` and `security-auditor` personas (same names as agents already available in the owner's account, so a project copy would silently override them; `/review` and `/ship` use whichever exist), `evals/`, `docs/`, `scripts/`.
* **googleworkspace/cli**: the `gws` binary itself and the other 76 skills (personas, recipes, workflows, other services).
* scroll-craft `media/` and `EXAMPLES.md`; humanizer `scripts/`, `package.json` and editor-plugin manifests.

## What was and was not verified

Verified: every `SKILL.md` frontmatter parses and its `name` matches its folder; no `allowed-tools` remains; every relative Markdown link resolves; the Claude and Codex copies are identical; the 69 folders differ from upstream only as listed above. Every bundled script (the `scroll-craft` scripts and browser engine, `quality-gate.mjs`, `idea-refine.sh`, `list-components.js`, `fetch.js`) was read in full or at each of its network, process-spawn and file-write call sites; all vendored files were scanned for hidden Unicode, pipe-to-shell commands, credential-file reads, secret-shaped strings and instruction-override wording, with nothing found. Claude Code loaded the automatic skills in a live session (they appeared in its skill list); the on-demand ones correctly did not.

**Not verified:** no skill has been exercised on a real task, and no third-party script was executed. The `gws` CLI, `eas-cli`, Playwright/ffmpeg for scroll-craft and a kie.ai key are **not installed or configured** (`NO_RUNTIME_EVIDENCE`): those skills describe tools that do not exist in this environment yet.

## Safety notes

* `scroll-craft/scripts/kie.mjs` calls `api.kie.ai` only when `KIE_AI_API_KEY` is set (upstream's published rates are about 28 credits per still and 160 per 5-second clip). Do not set a key without owner approval. The script also sends `nsfw_checker: false` with every image request, which switches off the provider's content filter; flip it to `true` before generating anything for a public page.
* `scroll-craft/scripts/serve.mjs` binds to `127.0.0.1`; its `--lan` flag exposes the folder to the whole local network until stopped.
* Treat vendored skill text like any dependency: re-read the upstream diff before moving a pin.

## Update or remove

* **Update**: re-clone upstream, review the diff since the pin, redo the four changes above (copy folders, drop `allowed-tools`, flag on-demand packs, strip the command prefix), and update the table.
* **Remove a pack**: delete its folders (names above) from both `.claude/skills/` and `.agents/skills/`, plus its `*-LICENSE` file. For `agent-skills` also delete `.claude/references/`, `.agents/references/`, the nine commands and the two personas. Remove the `.gitignore` lines for `eas-workflows/scripts/.cache/` with the Expo pack.
