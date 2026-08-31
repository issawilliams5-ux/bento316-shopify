# UI & interaction design: apple-design skill

For any frontend/UI work — animations, gestures (drag/swipe/flick), sheets and
drawers, transitions, translucent "glass" chrome, or size-aware typography —
consult the **`apple-design`** skill (`.claude/skills/apple-design/`) before
writing motion or interaction code. It encodes Apple's fluid-interface
principles (spring physics over fixed CSS transitions, 1:1 gesture tracking,
momentum/velocity handoff, interruptible animations, materials/depth,
reduced-motion) translated for the web. Build premium-feeling UI by default;
respect `prefers-reduced-motion`.

# Dev-loop skills

- **`webapp-testing`** (`.claude/skills/webapp-testing/`) — Playwright-based
  checks for this app: verifying frontend behavior, capturing screenshots,
  reading browser console logs. Use it before claiming a UI change works.
- **`changelog-generator`** (`.claude/skills/changelog-generator/`) — turns
  git commit history into a customer-facing changelog. Use when cutting a
  release or summarizing what shipped.

Both were vendored from `ComposioHQ/awesome-claude-skills` (see
`skills-lock.json` for provenance/hashes) by the `skill-gap-scanner` /
`skill-upgrader` agent pair in `.claude/agents/` — re-run that pair to check
for new or updated skills worth pulling in.
