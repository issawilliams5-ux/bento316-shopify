# Provenance and local changes

Vendored from https://github.com/superdesigndev/superdesign-skill at `f9f05cd` (2026-08-21), MIT (see `LICENSE`).

Local change: every `npx --yes @superdesign/cli@latest` is pinned to `@superdesign/cli@0.14.0` so a new CLI release cannot execute here unreviewed. Bump it deliberately: re-read the CLI's changelog, then `sed -i 's#@superdesign/cli@0.14.0#@superdesign/cli@<new>#g'` across this folder.

Data flow to know before use: `superdesign init` builds UI context from this codebase, `create-design-draft` and `iterate-design-draft` send prompts and context files, and `extract-website` sends the URL, all to superdesign.dev. Needs a `superdesign login` account (browser). superdesign.dev is blocked in cloud sessions, so the skill only works where that host is reachable. Do not point it at anything confidential or customer-related.
