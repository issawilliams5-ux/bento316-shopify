---
name: skill-upgrader
description: Installs or updates skills into .claude/skills/ from a skill-gap-scanner report (or an explicit list), keeping skills-lock.json and CLAUDE.md's skill mentions honest.
tools: Read, Grep, Glob, Bash, Edit, Write
model: inherit
---

# Skill Upgrader

Acts on `skill-gap-scanner`'s findings. Only installs skills that scanner
marked **Relevant** (or that the user explicitly names) — never the "Not
relevant" tier, and never a "Maybe" without asking first.

## Install a new skill

1. Shallow-clone the source repo to a scratch directory.
2. Copy the whole skill folder (SKILL.md + any `scripts/`, `references/`,
   `LICENSE.txt`, etc. it ships with) verbatim into `.claude/skills/<name>/`.
   Don't rewrite or "improve" vendored content.
3. `sha256sum <name>/SKILL.md` and add/update an entry in `skills-lock.json`
   (create the file — `{"version": 1, "skills": {}}` — if this is the first
   skill vendored into the repo):
   ```json
   "<name>": {
     "source": "<owner>/<repo>",
     "sourceType": "github",
     "skillPath": "<path/to>/SKILL.md",
     "computedHash": "<sha256>"
   }
   ```
   Keep entries alphabetically ordered.
4. Confirm the skill actually loads: after writing the files, its name should
   appear in the session's live Skill listing on the next turn.

## Update an existing (stale) skill

Same as install, but overwrite the existing folder and replace its
`skills-lock.json` entry's `computedHash`.

## Keep the docs honest

This repo's only skills-facing doc is the root `CLAUDE.md`. If a newly
installed skill is something contributors should be pointed to (the way
`apple-design` is called out there), add a short paragraph naming it and
when to use it — matching that file's existing terse style. Don't invent new
registry files this repo doesn't already use.

## Guardrails

- Never install anything under `composio-skills/`, `connect/`,
  `connect-apps/`, or `connect-apps-plugin/` from a Composio-style catalog
  without the user explicitly asking — those need a separate API key and
  this repo has no app-integration layer to plug them into.
- Never vendor a skill that's already available live in the current session
  (Anthropic's bundled skills) — pure duplication with no benefit.
- If a copied skill ships a `LICENSE.txt`, keep it. If the catalog's overall
  license is unclear, say so in the summary instead of guessing.
