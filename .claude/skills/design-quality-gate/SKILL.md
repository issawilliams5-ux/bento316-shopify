---
name: design-quality-gate
description: Mandatory pre-presentation quality gate for any visual design, UI, website, or app-design output. Runs a deterministic anti-"AI slop" checklist plus a taste/judgment pass before design work is shown, committed, or shipped. Synthesized from Impeccable (github.com/pbakaus/impeccable) and Taste Skill (github.com/Leonxlnx/taste-skill). Use for land-analysis and buyer-matching UI, Shopify theme sections, marketing pages, dashboards, app screens, or any HTML/CSS/component output — run this after frontend-architect/apple-design produce something and before presenting it.
---

# Design Quality Gate

A checkpoint, not a style guide. `frontend-architect` and `apple-design` tell
you how to build good UI; this skill is the last thing that runs before that
output reaches the user — it catches the generic, templated "AI slop" look
that slips through even when the individual rules were followed.

Credit: the checklist below distills two open-source projects into a
portable, dependency-free gate:
- **Impeccable** (pbakaus/impeccable) — a design-skill system with 58
  deterministic detector rules plus LLM critique checks, run via commands
  like `craft`, `critique`, `audit`, `polish`.
- **Taste Skill** (Leonxlnx/taste-skill) — an "anti-slop frontend framework"
  built around three adjustable dials (variance, motion, density) and
  pre-flight / redesign-audit protocols.

Neither project's CLI/npm package is installed here — this skill inlines
their rules as a checklist so the gate works without extra dependencies or
network installs. If a project later wants the actual tooling (`npx
impeccable detect`, `npx skills add`), that's a separate, explicit decision.

## When this gate runs

Before any of the following is presented to the user, committed, or marked
done: a new page/screen, a redesigned component, a landing/marketing page,
a Shopify section or template, a dashboard, or any HTML/CSS/JS you generated
for its visual design. Skip it for pure logic/backend changes with no
visual surface.

## Step 1 — Pre-flight (before writing code)

Same spirit as Impeccable's `init` and Taste Skill's brief inference: don't
start from a blank generic default.

- Name the **design archetype** being targeted (see `frontend-architect` if
  present) or the brand/voice already established in the repo.
- Set the three **taste dials** explicitly, even if only mentally:
  - **Variance** (1–10): how experimental the layout is — low = centered/safe,
    high = asymmetric/editorial. Don't default to 1.
  - **Motion** (1–10): how much animation the interaction warrants (see
    `apple-design` for the physics).
  - **Density** (1–10): information per viewport — spacious marketing page
    vs. dense dashboard.
- State the pick in one line before generating: e.g. "Editorial archetype,
  variance 7, motion 4, density 3."

## Step 2 — Deterministic checklist (self-run, no tools required)

Read the actual output (HTML/CSS/screenshot) against every row. Any single
hit is a fail — fix it before moving on, don't argue it away.

**Typography**
- [ ] No Arial, Roboto, Inter, Open Sans, Lato, or system-ui used as the
      *only* typeface — at minimum one distinctive display/heading font.
- [ ] Type scale has real contrast between body and headline (not a flat
      14/16/18 ladder).
- [ ] Tracking/leading adjusted per size (see `apple-design` §15), not one
      fixed `letter-spacing` everywhere.

**Color**
- [ ] No pure `#000`/`#FFF` — blacks and whites are tinted toward a chosen
      hue.
- [ ] No unmodified default blue/purple primary (`#3B82F6`-style) paired
      with white — the generic AI-slop signature.
- [ ] No gray text sitting directly on a saturated/colored background
      (contrast failure that reads as careless, not minimal).
- [ ] Contrast ratio ≥ 4.5:1 for body text (WCAG AA).

**Spacing & layout**
- [ ] Spacing values fall on a consistent base grid (4px/8px multiples),
      not arbitrary numbers.
- [ ] Not an unbroken uniform grid of identically-sized cards with no
      hierarchy — at least one element breaks the grid intentionally when
      variance dial > 3.
- [ ] No excessive card-nesting (cards inside cards inside cards).
- [ ] Negative space between sections is generous, not cramped.

**Motion**
- [ ] No bounce/elastic easing on things that didn't carry gesture momentum
      (see `apple-design` §4 — overshoot is earned, not default).
- [ ] Nothing animates via fixed-duration CSS transitions where a spring/
      interruptible animation was warranted (gesture-driven UI).
- [ ] `prefers-reduced-motion` respected.

**Structural "AI tells"**
- [ ] Not a generic "hero + laptop mockup" layout used by default.
- [ ] No rainbow/gradient text as a go-to decorative effect.
- [ ] No floating blob/orb decorations unless explicitly requested — if the
      section genuinely wants ambient background motion, reach for
      `lumen-shaders` instead of a lazy CSS blob.
- [ ] Icons are a real icon set (e.g. Lucide) or the project's system — not
      emoji standing in for UI icons.
- [ ] Every component/section is traceable to an actual requirement — no
      speculative filler sections added just to look "complete."

## Step 3 — Taste/judgment pass (LLM critique, not a rule lookup)

Rules catch the mechanical tells; this catches the ones that only judgment
can. Ask honestly, and answer in one sentence each:

- Does this look like it was made by someone with a point of view, or could
  it be swapped into any other product with a find-and-replace on the copy?
- If a designer with taste reviewed this, what's the first thing they'd
  flag?
- Does the motion/density/variance actually match the dials chosen in Step
  1, or did the output regress to a generic default under the hood?
- Would `critique`-level scrutiny (Impeccable's term for a full design
  review pass) surface anything Step 2's checklist missed?

If any answer is unflattering, fix it before presenting — don't disclose the
flaw and ship it anyway.

## Step 4 — Gate decision

- **All checks pass** → present/commit the work.
- **Any check fails** → fix and re-run Step 2 on the fixed version. Don't
  present interim failing states as "good enough for now" unless the user
  explicitly asked for a rough draft.

This gate is a self-check, not a blocker requiring user sign-off — run it
silently as part of finishing the work, and only surface it in your summary
if something notable was caught and fixed.
