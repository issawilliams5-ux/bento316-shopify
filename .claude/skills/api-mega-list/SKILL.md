---
name: api-mega-list
description: Look up a third-party API, SaaS integration, or Apify scraper actor across 24 categories (ecommerce, automation, marketing, SEO, social media, lead-gen, AI, developer tools, and more) before reaching for a generic web search. Use when the task needs an external API/service and it's not obvious which provider to use — e.g. "find an API for X", "is there a scraper for Y", building a Shopify/n8n integration against an unfamiliar service.
---

# API Mega List

A bulk mirror of [cporter202/API-mega-list](https://github.com/cporter202/API-mega-list),
imported verbatim on 2026-08-31. ~11,860 listings across 24 category folders in this
directory (`ai-apis-1555/`, `ecommerce-apis-2245/`, `automation-apis-5653/`, etc. — the
number suffix is the listing count at import time).

## How to use this

1. Pick the category folder closest to the need (`ecommerce-apis-*` for storefront/product
   data, `marketing-apis-*` / `seo-tools-apis-*` for growth work, `automation-apis-*` /
   `integrations-apis-*` for n8n-style workflow glue, `mcp-servers-apis-*` for MCP servers).
2. Grep or open that category's `README.md` — each is a `| API Name | Description |` table.
3. Treat every entry as an unvetted lead, not a recommendation. Most listings are Apify
   Store "actor" scrapers with the maintainer's referral parameter (`?fpr=...`) still in
   the URL — verify pricing, ToS compliance, and data-source legality yourself before
   wiring one into a workflow. This directory was imported as-is, including sponsor/promo
   blocks and affiliate links; nothing in it has been vetted or endorsed.
4. Do not use scrapers here to harvest personal contact data (email/B2B "lead scraper"
   listings) for unsolicited outreach — that's a CAN-SPAM/GDPR/ToS risk regardless of what
   the listing claims.

`00-featured-apis/README.md` is the maintainer's curated highlights; `SPONSORED_PARTNERS.md`
and `FOLLOW_CREATOR.md` are promotional, not functional references.

This is a point-in-time snapshot — it will drift from the upstream repo and is not
auto-updated.
