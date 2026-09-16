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

# Headless agent UI: OpenHands Agent Canvas (available tooling, not deployed)

[OpenHands Agent Canvas](https://github.com/OpenHands/OpenHands) (Apache-2.0)
is a control-center UI over one or more Agent Servers — REST-driven coding
agents you can run locally, in Docker, or point at a hosted OpenHands Cloud
instance. It is **not installed or vendored** in this repo and is not part of
the Next.js build or the deploy; it's a separate dev tool a contributor runs
on their own machine, not something this session runs for you.

- **No sandbox** (Node.js 22.12+, `uv`): `npm install -g @openhands/agent-canvas`
  then `agent-canvas` — runs the agent server directly on your machine with
  full filesystem access. `agent-canvas --frontend-only` / `--backend-only`
  split the stack.
- **Docker sandbox** (recommended if you don't want host filesystem access):
  set `PROJECTS_PATH` to a directory containing the project folders you want
  the agent to see, then
  `docker run -it --rm -p 8000:8000 -v "$HOME/.openhands:/home/openhands/.openhands" -v "${PROJECTS_PATH}:/projects" ghcr.io/openhands/agent-canvas:1.18.0`.
- **From source**: `git clone https://github.com/OpenHands/OpenHands.git && cd OpenHands && npm install && npm run dev`.
- UI: `http://localhost:8000` (npm/source), or `http://localhost:8000/canvas`
  (Docker image). Additional Agent Server backends can be added from the UI.

**Guardrails:**
- The no-sandbox and from-source paths run the agent server directly on the
  host with full filesystem access — prefer the Docker path, scoped to
  `PROJECTS_PATH`, unless you specifically want host access.
- Treat it like any other coding agent with write access: review its diffs
  before merging, same as the Ponytail rules above ask of any generator.
- This is a separate multi-repo project (OpenHands frontend, `software-agent-sdk`,
  `typescript-client`, `automation`) — file bugs/feature work against the repo
  that owns the behavior, not this one.

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
