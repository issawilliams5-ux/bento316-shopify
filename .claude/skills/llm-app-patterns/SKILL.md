---
name: llm-app-patterns
description: Consult before extending AdPilot AI's OpenAI-based generation pipeline (lib/ai.ts, app/api/generate/route.ts) with a new AI capability - RAG over the swipe file, multi-step/agentic generation, streaming, or a new generation mode. Points to the awesome-llm-apps reference catalog registered in the issa-agent-os capability router, and to the concrete next-step already identified for this repo.
user-invocable: true
---

# LLM app patterns for AdPilot AI

This repo's AI generation is currently a single `chat.completions.create`
call (`lib/ai.ts:generateAdPack`) that asks the model for one big strict-JSON
`AdPack` in one shot, with a full mock fallback (`lib/demo.ts`) when
`OPENAI_API_KEY` is unset. That's the right shape for the MVP. Reach for this
skill when a task wants to go beyond it.

## Where to look first

`issawilliams5-ux/issa-agent-os` (`registry/capabilities.json`, id
`awesome-llm-apps`) registers `Shubhamsaboo/awesome-llm-apps` as a
discovery-only catalog of runnable example LLM apps: starter/advanced AI
agents, RAG systems, memory-enabled apps, multi-agent teams, voice agents.
Search it for a matching pattern before designing a new AI feature from
scratch. It's a reference catalog, not a dependency - adapt the pattern,
don't vendor the repo.

## The concrete next step already identified for this repo

`app/dashboard/swipe-file/page.tsx` collects saved competitor/inspiration
ads (`SwipeItem`: adLink, platform, product, hook, angle, notes, status) but
is demo-data-only right now - no persistence, no wiring into generation.
The natural RAG pattern from the catalog's "RAG Systems" category: once
swipe items are persisted (Supabase is already wired via `lib/supabase.ts`,
just unused for this), retrieve the user's own `Winner`-status swipe items
similar to the new product being generated, and inject them as few-shot
context into `generateAdPack`'s prompt. This is retrieval over the user's
own saved ads, not a new vector-DB dependency - a simple similarity-by-
category/tone filter is enough to start.

## Rules

- Keep `mockAdPack` fallback working for any new mode - demo mode with no
  API key is a stated product requirement (see README "Mocked behavior").
- Don't add a second LLM provider/router; `lib/ai.ts` is the single
  generation entry point.
- Don't introduce a vector database or embeddings pipeline before a simpler
  filter-based retrieval has been tried - the swipe file is small
  (per-user, manually curated), not a corpus that needs ANN search.
- Any new external repo pulled in for a pattern gets audited (license,
  deps, provenance) the same way the issa-agent-os registry already does
  for its other discovery-only sources - don't skip that step just because
  the pattern looked good in a README.
