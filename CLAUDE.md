# UI & interaction design: apple-design skill

For any frontend/UI work — animations, gestures (drag/swipe/flick), sheets and
drawers, transitions, translucent "glass" chrome, or size-aware typography —
consult the **`apple-design`** skill (`.claude/skills/apple-design/`) before
writing motion or interaction code. It encodes Apple's fluid-interface
principles (spring physics over fixed CSS transitions, 1:1 gesture tracking,
momentum/velocity handoff, interruptible animations, materials/depth,
reduced-motion) translated for the web. Build premium-feeling UI by default;
respect `prefers-reduced-motion`.

# Design quality gate

Before presenting, committing, or shipping any visual design/UI output,
run the **`design-quality-gate`** skill
(`.claude/skills/design-quality-gate/`). It's a mandatory anti-"AI slop"
checklist — distilled from Impeccable (pbakaus/impeccable) and Taste Skill
(Leonxlnx/taste-skill) — that runs after `apple-design`-guided motion work
is in place and before the result reaches the user. Fix anything it flags;
don't present a failing draft as finished.

# Shader backgrounds: lumen-shaders skill

For a website, app, or template being built to sell (or any hero/section
that genuinely needs distinctive ambient motion), the **`lumen-shaders`**
skill (`.claude/skills/lumen-shaders/`) is the backup resource — a vendored,
MIT-licensed WebGL2 shader engine (liquid chrome, silk ribbons, bloom, aura
rings, light rays, halftone, data glyphs, reeded glass, pixel mosaic) from
LUMEN (Leonxlnx/lumenshaders). It's a fallback, not a default: reach for it
when `design-quality-gate` would otherwise flag a generic gradient or
floating blob, not reflexively on every hero.
