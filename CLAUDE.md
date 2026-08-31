# UI & interaction design: apple-design skill

For any frontend/UI work — animations, gestures (drag/swipe/flick), sheets and
drawers, transitions, translucent "glass" chrome, or size-aware typography —
consult the **`apple-design`** skill (`.claude/skills/apple-design/`) before
writing motion or interaction code. It encodes Apple's fluid-interface
principles (spring physics over fixed CSS transitions, 1:1 gesture tracking,
momentum/velocity handoff, interruptible animations, materials/depth,
reduced-motion) translated for the web. Build premium-feeling UI by default;
respect `prefers-reduced-motion`.

# Delegating to sub-agents

Model tiers for ANY delegated work — Agent-tool calls and Workflow-script
`agent()` calls alike. Set the `model` parameter explicitly on every call;
never omit it (omission silently inherits the session model):

- `haiku` — mechanical bulk work: renames, boilerplate, format conversion,
  log triage
- `sonnet` — default for well-specified implementation with clear acceptance
  criteria
- `opus` — genuinely tricky work: concurrency, subtle algorithms, adversarial
  verify/judge panels, gnarly debugging
- `fable` — rare; only when independence from your own context is the point
  (e.g. adversarial review of your own plan or a large diff). If you want to
  call a Fable sub-agent because the complexity of the task warrants it,
  ALWAYS check with me first — never spawn one unprompted.

When unsure between tiers, pick the cheaper and escalate on failure.

# Dynamic workflows (Workflow tool)

Applies to ALL sessions, any model. Dynamic workflows do not need to be
avoided — reach for the Workflow tool when a task has 3+ independent
parallelizable subtasks or would benefit from a pipeline/judge panel.
Standing rule on opt-in: if ultracode is NOT on for the session (no
"ultracode" keyword, toggle, or an orchestration request in my own words),
check with me first — propose the workflow in one or two sentences with the
rough shape and cost, and wait for my reply; my "yes" is the opt-in. If
ultracode IS on, invoke directly.

**Agent models inside workflow scripts:** every `agent()` call MUST set the
`model` parameter explicitly, chosen per "Delegating to sub-agents" above —
with one tightening: NEVER use `fable` agents in a dynamic workflow, not even
with approval. Only `haiku`, `sonnet`, or `opus`. If a Fable review is
warranted, it happens AFTER the workflow completes, as a standalone Agent-tool
call (ask first, per above) — never as a workflow stage.

# Third-party API discovery: api-mega-list skill

`.claude/skills/api-mega-list/` mirrors [cporter202/API-mega-list](https://github.com/cporter202/API-mega-list)
verbatim — ~11,860 third-party API/SaaS/Apify-scraper listings across 24 categories.
Consult it before a generic web search when a task needs an external API and the
provider isn't already known. Listings are unvetted (many carry the original
maintainer's affiliate referral params) — verify pricing, ToS, and data-source
legality before wiring anything in, and never use a "lead"/email scraper listing
for unsolicited outreach.

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
