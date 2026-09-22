# AdPilot AI

Production-ready MVP scaffold for an ecommerce creative-generation SaaS built with Next.js App Router, TypeScript, Tailwind CSS, Supabase-ready auth/database, OpenAI generation with mock fallback, and Stripe placeholder billing.

## Run
```bash
npm install
npm run dev
npm run build
npm run lint
```

## Environment
Copy `.env.example` to `.env.local`. Supabase, OpenAI, and Stripe keys are optional for demo mode.

Database migrations live in `supabase/migrations/` and must be applied in
order. They are not optional: 003 provisions the `profiles` row every other
table's foreign key depends on, and 004 turns on row level security, without
which the anon key shipped in the browser bundle can read and write every
table.

## Mocked behavior
When API keys are missing the app uses demo login/signup, demo ad packs, mock AI output, and placeholder Stripe checkout.

`POST /api/image` is the exception — it fails closed rather than falling back
to a mock. Without Supabase configured it returns 503, without a
`SUPABASE_SERVICE_ROLE_KEY` it cannot enforce its rate limit so it rejects,
and without an image backend it returns 503. An unauthenticated caller never
reaches the model.

## Image generation
`POST /api/image` takes `{ prompt, aspectRatio?, steps?, seed?, transparent? }`
and returns `{ b64, width, height }`. It requires a Supabase access token in
the `Authorization` header and is rate limited per user (10 per hour by
default, see `IMAGE_RATE_LIMIT`).

Two backends, set with `QWEN_IMAGE_PROVIDER` or inferred from whichever has
credentials:

- **fal** (`FAL_KEY`) — hosted Qwen Image 2.0. No GPU, pay per image.
- **self-hosted** (`QWEN_IMAGE_BASE_URL`) — your own OpenAI-compatible images
  endpoint running Qwen-Image-2.1. Needs a 40GB+ GPU, and is the only way to
  get transparent RGBA output and multi-image references.

Self-hosted wins when both are configured.

## Routes
`/`, `/login`, `/signup`, `/dashboard`, `/dashboard/new`, `/dashboard/packs/[id]`, `/dashboard/swipe-file`, `/dashboard/settings`.

API: `POST /api/generate` (ad packs), `POST /api/image` (image generation).
