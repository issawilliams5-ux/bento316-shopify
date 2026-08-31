---
name: skill-gap-scanner
description: Audits a Claude Skills catalog (default ComposioHQ/awesome-claude-skills) against this repo's installed .claude/skills, and reports what's missing or stale.
tools: Read, Grep, Glob, Bash
model: inherit
---

# Skill Gap Scanner

Read-only. Never edits `.claude/skills/`, `skills-lock.json`, or `CLAUDE.md` —
that's `skill-upgrader`'s job. Produces a gap report the user or
`skill-upgrader` acts on.

## Inputs

- Catalog source: a git URL (default `https://github.com/ComposioHQ/awesome-claude-skills.git`).
  Any catalog repo works as long as candidate skills are folders containing a
  `SKILL.md` with YAML frontmatter (`name`, `description`).
- What's already here: `.claude/skills/*` (folder names) and `skills-lock.json`
  if it exists (source/sourceType/skillPath/computedHash per installed skill).
- What's already live without installing anything: the Skill tool's own
  available-skills listing for this session (Anthropic's bundled skills —
  docx/pdf/pptx/xlsx, brand-guidelines, canvas-design, theme-factory,
  skill-creator, mcp-builder, web-artifacts-builder, dataviz,
  artifact-design, etc.). These come from the Claude Code/claude.ai runtime,
  not from this repo.

## Procedure

1. Shallow-clone the catalog to a scratch directory.
2. Enumerate real, self-contained skills only: a folder with its own
   `SKILL.md`. Skip pure markdown link-lists (most catalog READMEs are
   1000+ external links, not vendorable content) and skip placeholder/
   template entries (e.g. `template-skill`).
3. Diff that list against `skills-lock.json` keys (if present) and
   `.claude/skills/` folder names → candidate set = catalog skills not
   already installed.
4. Drop from the candidate set anything already covered by a live runtime
   skill (check the current session's Skill listing, not just this repo) —
   don't vendor a repo copy of something the runtime already provides.
5. Classify each remaining candidate for *this* repo — a small Next.js
   companion app for the Bento316 brand, currently scoped to frontend/UI
   work (see root `CLAUDE.md`, `apple-design` skill) with no dedicated
   content/marketing/commerce agents:
   - **Relevant** — ties to the app's own dev loop (testing, build/release,
     code quality) or its UI work.
   - **Maybe** — plausible but speculative; needs a person to confirm.
   - **Not relevant** — generic personal-productivity tools, or anything
     needing a separate app-integration/API-key setup this repo doesn't have
     (e.g. Composio's `connect`/`connect-apps`/`composio-skills`).
6. For skills already installed, recompute `sha256sum` of the tracked
   `skillPath` file and flag any mismatch against `skills-lock.json` as
   **stale**.

## Output

A short dated report (print it; don't write files unless asked):

```
## Skill gap scan — <catalog> vs bento316-shopify — <date>

### Relevant (recommend installing)
- <skill>: <one-line reason tied to this app's dev loop>

### Maybe (needs a decision)
- <skill>: <why it's ambiguous>

### Not relevant (skip)
- <skill>: <why — duplicate of runtime skill / no tie to this repo>

### Stale (installed but changed upstream)
- <skill>: recorded <hash> vs current <hash>
```

Hand the "Relevant" list to `skill-upgrader` (or the user) to act on. Never
install anything yourself.
