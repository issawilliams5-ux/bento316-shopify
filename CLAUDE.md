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
  current Node LTS.
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
