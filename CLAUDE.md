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

# Publishing automation: MoneyPrinterV2 (installed on demand)

[MoneyPrinterV2](https://github.com/FujiwaraChoki/MoneyPrinterV2) (**AGPL-3.0**)
automates the publish loop: a Twitter/X bot, a YouTube Shorts automator (both
with CRON schedulers), Amazon affiliate posts, and local-business scraping for
cold outreach. Installed on demand by `./ai-tools/setup.sh` into
`~/ai-tools/MoneyPrinterV2`; **not vendored** here and not part of any build or
deploy. Needs **Python 3.12** — upstream says 3.13 does not work.

Installed and boot-verified 2026-09-24; not configured and never run against a
live account. Two things about it surprise people: its LLM is a **local Ollama**
(`ollama_base_url`/`ollama_model`), not OpenRouter like the rest of this repo's
tooling, and the X/YouTube posting path drives a **logged-in Firefox profile**
rather than platform API keys. Images need a `GEMINI_API_KEY`. It also wants
ffmpeg and ImageMagick on the host, and ~6.3 GB of disk. Run
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

Three, deliberately. Every connected server injects its tool list into the
prompt on *every* turn, so this file is a budget, not a wishlist.

- **`context7`** (http) — version-correct docs for whatever is being imported.
  Next.js, React, Tailwind, `@supabase/supabase-js` and `stripe` all move fast
  enough that half-remembered APIs are the main source of code that reads
  perfectly and does not run.
- **`chrome-devtools`** (npx) — console errors, network requests and perf
  traces read off the live page, and it drives the page too. Needs Chrome and a
  current Node LTS. Pinned to an exact version rather than `@latest`, so a new
  release cannot execute here unreviewed; bump it deliberately.
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

Before adding a fourth, check it is not something the session already reaches.
Anything unused in a fortnight comes back out.
