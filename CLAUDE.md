# Ponytail ruleset (always on)

Adapted for this repo from [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) — that repo is outside this session's GitHub access scope, so this is a manual port of the published ladder/philosophy, not the plugin itself. No `/ponytail lite|full|ultra|off` mode switching and no `/ponytail-review|-audit|-debt|-gain` commands here — those are plugin skill files this port doesn't include. If the real plugin ever becomes installable in your environment (`/plugin marketplace add DietrichGebert/ponytail` then `/plugin install ponytail@ponytail`), prefer that over this file.

The rule was never "fewest tokens." It is: **write only what the task needs, and never cut validation, error handling, security, or accessibility.** Code ends up small because it's necessary, not golfed.

## The ladder

Before writing code, stop at the first rung that holds:

1. Does this need to exist? → no: skip it (YAGNI)
2. Already in this codebase? → reuse it, don't rewrite
3. Stdlib does it? → use it
4. Native platform feature? → use it (e.g. reach for a native `<input>` before reaching for a component)
5. Installed dependency? → use it
6. One line? → one line
7. Only then: the minimum that works

Run the ladder *after* understanding the problem, not instead of it — read the code the change touches and trace the real flow before picking a rung. Lazy about the solution, never about reading.

## Never on the chopping block

Trust-boundary validation, data-loss handling, security, and accessibility are never cut for brevity, no matter what rung you land on.

# UI & interaction design: apple-design skill

For any frontend/UI work — animations, gestures (drag/swipe/flick), sheets and
drawers, transitions, translucent "glass" chrome, or size-aware typography —
consult the **`apple-design`** skill (`.claude/skills/apple-design/`) before
writing motion or interaction code. It encodes Apple's fluid-interface
principles (spring physics over fixed CSS transitions, 1:1 gesture tracking,
momentum/velocity handoff, interruptible animations, materials/depth,
reduced-motion) translated for the web. Build premium-feeling UI by default;
respect `prefers-reduced-motion`.

# Headless agent: OpenManus (installed on demand)

[OpenManus](https://github.com/FoundationAgents/OpenManus) (MIT) is an
open-source general AI agent — an agent loop over browser, code-execution,
file, and MCP tools — installed on demand by `./ai-tools/setup.sh` into
`~/ai-tools/OpenManus`. It is **not vendored** here and is not part of the
Next.js build or the deploy.

Use it for open-ended, multi-step research and web work you'd otherwise do by
hand (competitor/pricing research, pulling numbers out of a portal). It is the
complement to Skyvern below: Skyvern automates a *known, repeated* flow with
vision; OpenManus decides its own steps.

- Backed by OpenRouter — set `OPENROUTER_API_KEY` (see `.env.example`) before
  running `ai-tools/setup.sh`. Never commit the key; the rendered
  `config/config.toml` lives outside this repo.
- Each run is an autonomous loop of up to 20 LLM calls with accumulated
  context. Start on a cheap model and a narrow prompt, and check spend before
  scheduling anything recurring.
- Full install/run instructions, knobs, and gotchas: `ai-tools/README.md`.

# Screenshot/prompt -> UI code: screenshot-to-code & OpenUI (installed on demand)

Two open-source design-to-code tools, installed on demand by
`./ai-tools/setup.sh` into `~/ai-tools` alongside OpenManus. Like OpenManus,
they are **not vendored** here and are not part of the Next.js build or the
deploy.

- [screenshot-to-code](https://github.com/abi/screenshot-to-code) (MIT) — give
  it a **screenshot, mockup, or screen recording**, get back HTML+Tailwind,
  React+Tailwind, Vue, Bootstrap or Ionic. FastAPI backend on **:7001**, Vite
  frontend on **:5173**; open http://localhost:5173.
- [OpenUI](https://github.com/wandb/openui) (Apache-2.0, from W&B) — describe a
  component in **words**, see it render live, iterate in chat, convert to
  React/Svelte/Web Components. One process on **:7878**, prebuilt frontend
  included.

Which one: screenshot-to-code when a design already exists as an image; OpenUI
when it doesn't and you are exploring. Both are one-shot code generators — they
are the complement to OpenManus (decides its own multi-step plan) and Skyvern
(drives a browser through a known, repeated flow).

**Guardrails:**
- Both need a vision-capable model key and neither can generate without one.
  Set at least one of `OPENAI_API_KEY` / `ANTHROPIC_API_KEY` / `GEMINI_API_KEY`
  (see `.env.example`); `GEMINI_API_KEY` also drives asset extraction and video
  mode, `REPLICATE_API_KEY` unlocks image editing.
- Every generation is a vision call on a full screenshot — not cheap. Try one
  before batching a design system through it.
- `~/ai-tools/screenshot-to-code/backend/.env` holds keys in plaintext outside
  this repo. Keep it there; never commit a key.
- Treat the output as a **first draft**, not shippable code: review it against
  this repo's conventions, and re-add the validation, error handling and
  accessibility a generator will happily leave out (see the Ponytail rules
  above).
- OpenUI phones home (Sentry in its bundled frontend, `wandb`/`weave` in the
  backend). Non-fatal, but know it before pointing it at anything sensitive.

Full install/run instructions, ports, keys and gotchas: `ai-tools/README.md`.

# Site cloning: ai-website-cloner-template (installed on demand)

[ai-website-cloner-template](https://github.com/JCodesMore/ai-website-cloner-template)
(MIT) turns a URL into a Next.js 16 app via its `/clone-website <url>` command.
Installed by `./ai-tools/setup.sh` into `~/ai-tools/ai-website-cloner-template`
(origin remote removed); the app itself is **not vendored** and not part of any build or deploy.
Only clone sites we own or may reproduce — never ship a competitor's copy,
images or branding. Output is Next.js, not Liquid: a first draft to port from.
Details: `ai-tools/README.md`.

Its skill is also vendored here, so no install is needed to use it:
`.claude/skills/clone-website/` (upstream SKILL.md + references, MIT,
pinned at upstream `ee3f5a2`) and `.claude/skills/shopify-design-import/`, which
auto-activates on asks like "take this design and add it to my Shopify store"
and builds native Liquid sections in the theme repo (`bento316-shopify-store`)
rather than a Next.js app. Invoke directly with `/clone-website <url>` or
`/shopify-design-import`.

# Publishing automation: MoneyPrinterV2 (installed on demand)

[MoneyPrinterV2](https://github.com/FujiwaraChoki/MoneyPrinterV2) (**AGPL-3.0**)
automates the publish loop: a Twitter/X bot, a YouTube Shorts automator (both
with CRON schedulers), Amazon affiliate posts, and local-business scraping for
cold outreach. Installed on demand by `./ai-tools/setup.sh` into
`~/ai-tools/MoneyPrinterV2`; **not vendored** here and not part of any build or
deploy. Needs **Python 3.12** — upstream says 3.13 does not work.

**Run it on a desktop, not in a cloud session.** The posting path needs a
logged-in Firefox profile and the LLM is a local Ollama — a container has
neither, and this environment's network policy blocks installing either. It is
installed and boot-verified here (2026-09-24) as far as that goes: not
configured, never run against a live account. `ai-tools/README.md` has the
Windows setup. Two things about it surprise people: its LLM is a **local Ollama**
(`ollama_base_url`/`ollama_model`), not OpenRouter like the rest of this repo's
tooling, and the X/YouTube posting path drives a **logged-in Firefox profile**
rather than platform API keys. Images need a `GEMINI_API_KEY`. It also needs ffmpeg and
ImageMagick on the host (`apt-get install ffmpeg imagemagick`; both are
installed here and the video path is verified) and ~6.3 GB of disk. Run
`.venv/bin/python scripts/preflight_local.py` after editing `config.json`.

It is the one tool here that publishes on its own, so:

- `~/ai-tools/MoneyPrinterV2/config.json` is a credential file (API keys plus
  social logins). It stays in `~/ai-tools` at `0600`. Never commit it, paste it,
  or prefill it from guessed field names — the installer copies upstream's
  `config.example.json` verbatim for that reason.
- Run every feature once by hand, on a burner account, and read what it posted
  before letting a CRON job have it. Automated posting is the account owner's
  call and the platform's rule — check both.
- The cold-outreach feature e-mails scraped businesses. That is regulated
  (GDPR/CAN-SPAM): no sends without a lawful basis, a real sender identity, and
  a working unsubscribe.
- AGPL-3.0 is viral over a network. Keep it a standalone tool in `~/ai-tools`
  and do not import its code into this repo.

Full install/run instructions, guardrails, and gotchas: `ai-tools/README.md`.

# Browser automation: Skyvern (available tooling, not deployed)

[Skyvern](https://github.com/Skyvern-AI/skyvern) is vision-AI-driven browser
automation (Playwright-compatible SDK + no-code workflow builder) that can be
used for tasks like pulling reports from a portal, repetitive cross-site data
entry, or scheduled dashboard checks. It is **not currently deployed** in
this repo — no Docker service is running and no API key is configured.

To stand it up: `git clone https://github.com/Skyvern-AI/skyvern.git`, add a
vision-capable model API key to its env file, then `docker compose up -d`
(or `pip install skyvern` for the Python SDK). See `.env.example` for the
placeholder var this repo expects if/when Skyvern is wired in.

**Guardrails before using it on anything real:**
- Only automate sites/actions covered by that site's terms of service —
  never bypass anti-bot protection or scrape personal data.
- Vision-model runs cost tokens; test one run and check the bill before
  scheduling anything recurring.
- Never point it at anything that submits, pays, or sends without a human
  approval step, and use test accounts while building a new workflow.
- Skyvern is AGPL-3.0 — review license implications before shipping it as
  part of a commercial product.

# MCP servers (`.mcp.json`)

Four, deliberately. Every connected server injects its tool list into the
prompt on *every* turn, so this file is a budget, not a wishlist.

- **`graft`** (`graft mcp`) — the graft code-graph tooling this repo's
  `.claude/helpers` statusline and edit hooks already use.
- **`context7`** (http) — version-correct docs for whatever is being imported.
  Next.js, React, Tailwind, `@supabase/supabase-js` and `stripe` all move fast
  enough that half-remembered APIs are the main source of code that reads
  perfectly and does not run.
- **`chrome-devtools`** (node launcher) — console errors, network requests and perf
  traces read off the live page, and it drives the page too. Started through
  `.claude/helpers/mcp-browser.cjs`, which pins `chrome-devtools-mcp@1.10.1`
  (never `@latest`, so a new release cannot execute here unreviewed; bump it
  there deliberately), turns Google usage statistics and CrUX lookups off, and
  picks the browser: the desktop's Chrome, or in a cloud container the
  preinstalled Chromium, headless with `--no-sandbox` as root. Verified
  2026-10-14: 30 tools, loaded a page in the cloud container.
- **`stripe`** (http) — this repo has a real integration (`lib/stripe.ts`,
  billing settings, the `001_initial_schema.sql` migration). OAuth on first use.
  **Point it at a sandbox before live mode**: the same tools that read a
  customer can create, update and refund one.

Not here, on purpose: `supabase` (already a session connector — a second copy
only duplicates its tool list), `playwright` (`chrome-devtools` already
navigates, clicks and fills, and there are no e2e tests here),
`desktop-commander` (duplicates the agent's own shell and file tools),
`firecrawl` (needs a paid key; `ai-tools/` already covers crawling), and
`sequential-thinking` (a scaffold for models without native extended thinking).

Before adding a fifth, check it is not something the session already reaches.
Anything unused in a fortnight comes back out.

# Ad claim check: TypeSafe (optional, keyed)

`lib/claim-check.ts` runs after `generateAdPack()` and asks a TypeSafe Noul
question per copy line: does it guarantee a result or make a health, medical,
income or before/after claim? Lines at or above `FLAG_AT` (0.5, untuned) come
back in `pack.claimCheck.flags`; the copy itself is never edited.

- Opt-in via `TYPESAFE_API_KEY`, server-side only. Each line is one API call
  (~100 per pack), so check spend before turning it on.
- `claimCheck.status` is `checked`, `skipped` (no key) or `unavailable` (any
  error) — a failed check is never reported as clean.
- A flag is a prompt for human review, not legal clearance.

# Legal assistant (Harvey-style, built in)

`/dashboard/legal` → `POST /api/legal` → `lib/legal.ts`. Modes: `contract`,
`claims`, `policy`. Requires a Supabase login (bearer token) and is rate-limited
per user via `usage_events` (`LEGAL_RATE_LIMIT`, default 20/window). Model via
OpenRouter (`OPENROUTER_API_KEY`, `LEGAL_MODEL`, default
`anthropic/claude-sonnet-4.5`), falling back to `OPENAI_API_KEY`. Output is
triage, never legal advice; documents are not stored and only sizes are logged.

# /arena — tournament for a better answer (vendored skill)

[Jakeschincariol/arena-skill](https://github.com/Jakeschincariol/arena-skill)
(MIT, pinned at upstream `df07b8e`), vendored at `.claude/skills/arena/`. When an
answer is not good enough, `/arena` gives N sub-agents the same task with
different strategy cards and runs an attack → defend → judge bracket until one
solution survives. `bracket.py` (stdlib Python 3.8+) holds all state in
`.arena/<run>/arena.json` (gitignored); `bracket.py next` resumes after compaction.

- **Cost guardrail:** default 100 agents = 595 sub-agent calls. Use `--quick`
  (16 agents, 91 calls) or `--agents 8` (43) unless the user asks for more, and
  run `python3 .claude/skills/arena/bracket.py plan --agents N` to show the bill
  first. Never start it unprompted without asking.
- It never edits the project; the winning answer comes back for the user to apply.
- Sub-agents can't see the chat: everything they need goes in `.arena/task.md`.
- Use accept-edits mode for a run, or every `.arena/` file write prompts.

# /brag-slim — launch video for what we built (vendored skill)

[latent-spaces/brag](https://github.com/latent-spaces/brag) (MIT, pinned at
upstream `069432c`); its single-file `brag-slim` skill is vendored at
`.claude/skills/brag-slim/`. Turns this project, or a URL (e.g. the live
Bento316 store), into a ~20s launch video plus `share-copy.txt` in
`brag-output/` (gitignored). Needs ffmpeg and Node 22, both present in the
cloud container, plus a headless browser for rendering (Playwright's Chromium is preinstalled).

- The full Hyperframes-based `/brag` (17 MB of bundled music/SFX) is not
  vendored; on Opus 5.5 it hands off to `brag-slim` anyway. For it or for voiceover:
  `npx skills add https://github.com/latent-spaces/brag --skill brag`.
- The output is public-facing: no secrets, internal URLs or real customer data
  on screen or in the share copy, and only claims the product can back (see the
  legal assistant's `claims` mode).

# /motionmaxxing — directed motion films (vendored skill)

[tejashmakwana/motionmaxxing](https://github.com/tejashmakwana/motionmaxxing)
(Apache-2.0, pinned at upstream `8c8ec0f`; keep `LICENSE` and `NOTICE`), vendored
at `.claude/skills/motionmaxxing/` without `docs/media/` (20 MB of showcase films;
upstream's `install.sh --copy` drops them too). Launch films, product promos,
brand stings, kinetic type, social ads and CTAs, built as plain HTML on a seek-safe
GSAP runtime with eases measured from 53 pro films, then rendered to MP4 and
checked by scripts (gates G0–G5: `look.py`, `lint.mjs`) instead of self-certified.
Every film ships with a `NOTE.md` that quotes the gate numbers.

- **Which video skill:** `brag-slim` for a quick ~20 s "look what we built" cut of
  this project; `/motionmaxxing` when the film has to be directed (one idea,
  storyboard, world, sound) and checked, or to rate and repair a draft. Websites
  and designs: its measured eases (`runtime/motion.js`, `references/motion.md`)
  and its "never ship" slop list are a good reference for site motion. But the
  runtime is driven by seeking frames for rendering, not by live UI, so build site
  interaction with `apple-design` and Emil's `animate`.
- **Cloud container:** `export CHROME_PATH="$PWD/.claude/helpers/chrome-root.sh"`
  (the preinstalled Chromium, with `--no-sandbox` as root and no background
  update traffic). Verified 2026-10-15:
  - `scripts/providers.sh` reports ready.
  - The runtime selftest asserts PASS.
  - The demo, phone and 3D-hero examples render; WebGL runs through SwiftShader,
    at about 7.5 fps at `--scale 0.5`.
  - `look.py` and `lint.mjs` run. The gates are real: they fail upstream's own
    demo on G3 (a 2.0 s end hold).
- **Optional keys:** `ELEVENLABS_API_KEY` for voice, SFX and music; without it,
  films are silent. Codex CLI image generation is used for surface plates, and it
  is not installed here. Keep keys in the environment and never commit them.
- **GSAP licence:** `runtime/vendor/gsap.min.js` is under GreenSock's Standard
  "No Charge" licence. It is not open source and not covered by the Apache
  licence. It is fine for rendering our films, but read its terms before copying
  it into the app or theme bundle. three.js and opentype.js are MIT; Inter is OFL.
- **Brand capture and output:** `brand.mjs` captures a site. Point it only at
  our own store or at sites we may reproduce, never at a competitor's. Films are
  public-facing, so the brag rules apply:
  - no secrets, internal URLs or real customer data;
  - only claims we can back (legal assistant `claims` mode);
  - generated imagery declared in `NOTE.md`.

  Work goes in `film/` (gitignored).

# Website design toolkit (from the "Build better-looking websites with Claude" guide)

Three design-skill packs are vendored in `.claude/skills/` (licences inside
each folder), plus a browser-check step. Use them on any UI work, alongside
`apple-design`:

- **Emil Kowalski's skills** — [emilkowalski/skills](https://github.com/emilkowalski/skills)
  (MIT, pinned `2d22863`): `emil-design-eng` (polish philosophy), `animate`,
  `review-animations`, `improve-animations`, `find-animation-opportunities`,
  `animation-performance`, `animation-vocabulary`, `mobile-native`,
  `break-ui`, `pick-ui-library`, `prototype`. Not vendored: `write-swift`,
  `animate-expo`, `ask-sonner` (not our stack); upstream's `apple-design` is
  the same as ours.
- **Impeccable** — [pbakaus/impeccable](https://github.com/pbakaus/impeccable)
  (Apache-2.0, pinned `2f98774`, engine 0.1.14; keep `LICENSE` and `NOTICE.md`):
  `/impeccable` with 24 sub-commands (`audit`, `polish`, `critique`,
  `typeset`, `layout`, `colorize`, `harden`, …) and a 59-rule detector for
  AI-design tells, contrast and accessibility.
  - The detector is a Rust binary the launcher downloads from GitHub releases to
    `~/.impeccable/bin/` on first use (sha256-checked). Scanning a URL needs
    Chromium; as root set `CI=1`.
  - **Telemetry is on by default** (concept-seed "roll" feature, plus update
    checks to impeccable.style). Off for every Claude Code session here:
    `.claude/settings.json` sets `DO_NOT_TRACK=1` and `IMPECCABLE_NO_TELEMETRY=1`.
  - `npx impeccable install` was *not* used: it also adds Stop/PostToolUse hooks
    that run the detector on every edit. Opt in deliberately if wanted.
  - It can't read `.liquid` or resolve Tailwind classes from source; scan the
    rendered page (`next dev` URL or store preview).
- **Taste** — [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill)
  (MIT, pinned `f624f37`): `taste-skill` deals 3 researched art directions
  before coding, then screenshots at 1440/768/390 and fixes what looks
  templated. For public pages, not dashboards; a full run is 30–45 min and a
  few hundred thousand tokens. `taste-skill-v2-experimental` is the older
  version with the `DESIGN_VARIANCE` / `MOTION_INTENSITY` / `VISUAL_DENSITY`
  dials. Its inspector needs `--no-sandbox` as root:
  `CHROME_PATH=.claude/helpers/chrome-root.sh` adds it. Working files go to `.taste-skill/` (gitignored).
- **Figma** — already a session connector plus the `figma:*` skills; nothing
  to add here. Needs a Figma full or dev seat.
- **Browser check** — `chrome-devtools` (see the MCP section) is this repo's
  "open the site and test it" step and works in the cloud container too;
  Playwright MCP is deliberately not added. `node
  .claude/helpers/mcp-browser.cjs playwright` launches it if ever needed.

# TypeScript 7 (side by side with the TS 6 API)

`npm run typecheck` runs the **TypeScript 7** native compiler
(`typescript7` → `typescript@7.0.2`). TS 7 ships no classic JS API, and
typescript-eslint (via `eslint-config-next`) refuses TS 7, so the `typescript`
package name is aliased to **`@typescript/typescript6`** (the official TS 6 API
re-export): ESLint, `next build`'s type check and editors load that.

- Plain `npx tsc` is TS 6 (`@typescript/old` owns the `tsc` bin); use
  `npm run typecheck` for TS 7.
- Drop the alias (set `typescript` back to a real version) once
  typescript-eslint supports TS 7:
  https://github.com/typescript-eslint/typescript-eslint/issues/10940
- **ESLint stays on 9** (2026-10-15): `eslint-config-next` 16 bundles
  `eslint-plugin-react` 7.37, `-import` 2.32 and `-jsx-a11y` 6.10, none of
  which support ESLint 10 (react crashes on the removed
  `context.getFilename`). Upgrade once they do; don't drop the a11y rules to
  get there.

# Seven-tool batch: WordCraft, ARTEMIS, VoiceStudio, OpenTerminal, Anatomy, SolidCraft, XERJ (2026-10-19)

Cloned on demand into `~/ai-tools` by `./ai-tools/setup.sh` (step 6); not
vendored, not part of any build or deploy. **Anatomy is the exception**: it is a
Claude skill, vendored at `.claude/skills/anatomy/` (MIT, pinned `1482e84`).
Use `/anatomy <idea>` for an interactive isometric SVG explainer (needs Node
20.10+, Chrome/Chromium for its checks).

- **WordCraft** (Rust, .docx word processor, alpha) and **SolidCraft** (Rust
  parametric CAD, early, has an MCP server): MIT/Apache-2.0. Builds are long;
  `BUILD_RUST=1 ./ai-tools/setup.sh` builds the CLIs.
- **XERJ** (Apache-2.0): local agent search engine, Elasticsearch API, MCP via
  `xerj init`. The `xerj.org` installer is blocked by the cloud proxy, so build
  from `engine/`. `--insecure` means no auth: localhost dev only.
- **ARTEMIS** (Google, Apache-2.0): Android automation from natural language,
  MCP server. Needs `adb` and a device/emulator: desktop only.
- **VoiceStudio** (**AGPL-3.0**): local voice cloning/dubbing. Desktop with a
  GPU; in the cloud container the backend runs on CPU via the PyPI-torch route in `ai-tools/README.md` (no models: Hugging Face is blocked); clone voices only with the speaker's permission; keep it a standalone
  tool and do not import its code here.
- **OpenTerminal** (MIT): market dashboard on unofficial public data. Never use
  it for investment decisions; `ANTHROPIC_API_KEY` stays in the environment.

Details, run commands and roadmaps: `ai-tools/README.md`.
