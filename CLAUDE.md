# AdPilot — Seraph engineering workspace

Next.js 15 / React 19 / TypeScript / Tailwind, Supabase for data and auth,
Stripe for billing, OpenAI for generation.

This repo is the **engineering** workspace of Seraph OS. The OS root is the
`issa-agent-os` repository; it owns the durable rules and this file does not
restate them:

| Concern | Canonical location (in `issa-agent-os`) |
|---|---|
| Approval boundaries | `policies/SECURITY_GATES.md` |
| Agent definitions and routing | `.claude/agents/`, `scripts/route-task.mjs` |
| Architecture and integration status | `docs/SERAPH_ARCHITECTURE.md` |

## Verification — run before saying anything works

```
npm run lint
npm run typecheck
npm run build
node scripts/seraph-validate.mjs
```

Order of work, never reversed to make a result look green:
understand → plan → implement → format → lint → typecheck → test →
security review → independent review → fix → reverify.

## Secrets

Every key this app needs is named in `.env.example` with an empty value. Read
them from the environment at runtime. `SUPABASE_SERVICE_ROLE_KEY` and
`STRIPE_SECRET_KEY` are server-only — they must never reach a client component,
a `NEXT_PUBLIC_` variable, or a log line. `.env` is git-ignored and the
pre-tool-use guard blocks writes containing live-looking credentials.

## The line that matters

Local work needs no permission: read, analyse, edit, add tests, run checks,
build. **Stop before** pushing, merging, deploying to Vercel, running a Stripe
mutation, or applying a Supabase migration to a live database.

## UI and motion

Consult the `apple-design` skill before writing motion, gesture or transition
code. Respect `prefers-reduced-motion`.
