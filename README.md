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

## Mocked behavior
When API keys are missing the app uses demo login/signup, demo ad packs, mock AI output, and placeholder Stripe checkout.

## Routes
`/`, `/login`, `/signup`, `/dashboard`, `/dashboard/new`, `/dashboard/packs/[id]`, `/dashboard/swipe-file`, `/dashboard/settings`.
