# UI & interaction design: apple-design skill

For any frontend/UI work — animations, gestures (drag/swipe/flick), sheets and
drawers, transitions, translucent "glass" chrome, or size-aware typography —
consult the **`apple-design`** skill (`.claude/skills/apple-design/`) before
writing motion or interaction code. It encodes Apple's fluid-interface
principles (spring physics over fixed CSS transitions, 1:1 gesture tracking,
momentum/velocity handoff, interruptible animations, materials/depth,
reduced-motion) translated for the web. Build premium-feeling UI by default;
respect `prefers-reduced-motion`.

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
