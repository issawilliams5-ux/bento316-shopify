# Google Stitch Master Prompt — Bento316 Shopify Store

Use this prompt (or sections of it) inside Google Stitch to generate UI screens and components that stay on-brand and production-ready for a Shopify storefront.

---

## How to Use

1. **Start every Stitch session** by pasting the **Core Identity** block below into the system / context field.
2. **Append a Screen Prompt** from the library at the bottom to generate a specific page or component.
3. **Iterate** with the Refinement Snippets to dial in spacing, tone, or layout.

---

## CORE IDENTITY BLOCK
*(Paste this at the top of every prompt)*

```
You are designing UI screens for Bento316, a modern direct-to-consumer Shopify brand.

BRAND VOICE: Bold, minimal, confident. No fluff. Every word earns its place.

DESIGN SYSTEM
─────────────
Color palette
  Primary:    #0A0A0A  (near-black)
  Accent:     #FF4D00  (burnt orange)
  Surface:    #F5F4F0  (warm off-white)
  Muted text: #6B6B6B
  Border:     #E2E0DA

Typography
  Display:    700 weight, tight tracking (−0.03em), 48–72 px
  Heading:    600 weight, 24–36 px
  Body:       400 weight, 16 px, 1.6 line-height
  Label/CTA:  600 weight, 13–14 px, ALL CAPS, 0.08em tracking
  Font stack: "Inter", system-ui, sans-serif

Spacing scale (8-pt grid)
  xs 4px · sm 8px · md 16px · lg 24px · xl 40px · 2xl 64px · 3xl 96px

Border radius
  Cards: 12px · Buttons: 6px · Inputs: 6px · Tags: 4px

Shadow
  Card: 0 2px 12px rgba(0,0,0,0.07)
  Hover: 0 6px 24px rgba(0,0,0,0.12)

Component rules
  • Primary CTA: solid #0A0A0A background, #F5F4F0 text, 48px height, full-width on mobile
  • Secondary CTA: 1px border #0A0A0A, transparent background
  • Inputs: 1px border #E2E0DA, focus ring #FF4D00 2px offset
  • Product cards: image top, flush edges, 12px radius, price in 600 weight below title
  • Section padding: 96px top/bottom desktop · 48px mobile

Grid
  Max content width: 1280px, centered
  Desktop columns: 12-col, 24px gutter
  Tablet: 8-col · Mobile: 4-col, 16px margin

Platform targets
  Design for Shopify Online Store 2.0 (Dawn-compatible section widths).
  Deliver mobile-first. Show desktop at 1440px and mobile at 390px.

Accessibility
  WCAG AA minimum. All text on color backgrounds must pass 4.5:1 contrast.
  Interactive elements ≥ 44×44px tap target.
```

---

## SCREEN PROMPT LIBRARY

### 1 — Homepage Hero
```
Design a full-bleed homepage hero section for Bento316.

Layout: Left-aligned text column (50%) + right product image (50%) on desktop.
Mobile: Stacked — image top, text below.

Content slots:
  • Eyebrow label: e.g. "New Arrival"
  • Headline (2 lines max): punchy, benefit-led
  • Subheadline (1 line): specific, no generic copy
  • Primary CTA button: "Shop Now"
  • Secondary link: "See All Products"
  • Trust bar below fold: 3 icons (Free Shipping · Easy Returns · 2-Year Warranty)

Apply the Core Identity block above. Use the accent color (#FF4D00) only for the eyebrow label.
```

---

### 2 — Product Listing Page (PLP)
```
Design a Product Listing Page for Bento316 with a 3-column grid (desktop), 2-column (tablet), 1-column (mobile).

Each product card includes:
  • Square image (aspect-ratio 1:1), hover reveals alternate image
  • Product title (16px, 500 weight)
  • Price (16px, 600 weight) — sale price in accent color, original struck through
  • "Quick Add" button appearing on card hover (no layout shift)
  • Sold-out state: grayscale image + "Sold Out" badge

Page-level elements:
  • Filter bar (sticky top): Sort dropdown + filter chips (Category, Color, Price)
  • Result count: "Showing 24 of 48 products"
  • Load More button (centered, secondary style) — no infinite scroll

Apply Core Identity block.
```

---

### 3 — Product Detail Page (PDP)
```
Design a Product Detail Page for Bento316.

Desktop layout: 55% image gallery left, 45% product info right (sticky on scroll).
Mobile: Full-width image carousel, then info block below.

Image gallery: Main image + thumbnail strip (4 images). Zoom on hover desktop.

Product info block (top to bottom):
  1. Breadcrumb (small, muted)
  2. Product title (H1, Display style)
  3. Price — regular + sale variant
  4. Short description (2–3 sentences max)
  5. Variant selectors: Color swatches + Size pills
  6. Quantity stepper + Primary CTA "Add to Cart" (full width)
  7. Secondary link "Add to Wishlist"
  8. Collapsible accordion: Details · Shipping & Returns · Care Instructions

Below the fold: Related Products row (4 cards, same card spec as PLP).

Apply Core Identity block.
```

---

### 4 — Cart Drawer / Slide-over
```
Design a right-side cart drawer for Bento316 that overlays the page (not a full page redirect).

Dimensions: 420px wide desktop · full-width mobile with 90vh max-height.

Structure (top → bottom):
  • Header: "Your Cart (3)" + close icon
  • Item list (scrollable): product thumbnail 80×80px, name, variant, quantity stepper, remove link, line price
  • Divider
  • Order summary: Subtotal right-aligned
  • Free shipping progress bar: "You're $12 away from free shipping"
  • Checkout CTA (primary, full-width): "Checkout · $142.00"
  • Continue shopping link

Apply Core Identity block.
```

---

### 5 — Email Capture / Popup Modal
```
Design a centered modal popup for Bento316 to capture email addresses.

Trigger: exit-intent or 30-second delay. Dismissible via X or clicking outside.

Content:
  • Background: #0A0A0A (full bleed dark)
  • Optional: small product lifestyle image on left (desktop split layout)
  • Headline: single punchy line offering the value prop
  • Subtext: one sentence, what they'll receive
  • Email input field + Submit CTA button (accent color on dark bg)
  • Dismiss link: "No thanks" in muted small text

Mobile: single-column, image hidden.

Apply Core Identity block.
```

---

### 6 — Navigation Header
```
Design the global site header for Bento316.

Desktop (sticky, 72px height):
  • Left: Logo (wordmark, max 120px wide)
  • Center: Primary nav links (Home · Shop · About · Journal)
  • Right: Search icon · Account icon · Cart icon with item count badge
  • Mega-menu on "Shop" hover: 3-column layout (Categories · Featured Product · Promo banner)

Mobile (56px height):
  • Left: Hamburger menu
  • Center: Logo
  • Right: Cart icon
  • Drawer menu: full-height, slides from left, hierarchical links

Background: #F5F4F0, 1px bottom border #E2E0DA. Transparent on homepage hero, transitions to solid on scroll.

Apply Core Identity block.
```

---

### 7 — Footer
```
Design the site footer for Bento316.

Desktop: 4-column layout within max 1280px container, 96px top padding.
  Col 1: Logo + one-line brand tagline + social icons (Instagram, TikTok, Pinterest)
  Col 2: Shop — link list
  Col 3: Help — link list (FAQ, Shipping, Returns, Contact)
  Col 4: Newsletter signup (inline input + button)

Bottom bar: Copyright · Privacy Policy · Terms · payment icons (Visa, MC, PayPal, Shop Pay)

Background: #0A0A0A · All text: #F5F4F0 or #6B6B6B.

Mobile: Single column, accordion-collapsed link groups.

Apply Core Identity block.
```

---

## REFINEMENT SNIPPETS
*(Append any of these to a screen prompt to steer the output)*

```
// Tone
Make the copy more direct and urgent — assume the user has 5 seconds.

// Whitespace
Double the breathing room between sections. Less is more.

// Mobile-first
Show me only the 390px mobile view. Remove all desktop-only elements.

// Dark mode variant
Invert the surface colors: use #0A0A0A background, #F5F4F0 text.

// Accessibility check
Flag any element that may fail WCAG AA contrast or miss a 44px tap target.

// Conversion focus
Maximize the primary CTA prominence. Reduce visual noise around it.

// Animation hint
Note where micro-interactions should appear: hover states, button press feedback, cart badge update.
```

---

## COMPONENT CHEAT SHEET

| Component | Key Spec |
|---|---|
| Primary Button | #0A0A0A bg · #F5F4F0 text · 48px h · 6px radius · 600 weight · ALL CAPS |
| Secondary Button | transparent · 1px #0A0A0A border · same sizing |
| Accent Button | #FF4D00 bg · #F5F4F0 text · used sparingly (1 per screen max) |
| Input Field | 1px #E2E0DA border · 44px h · 6px radius · #FF4D00 focus ring |
| Product Card | 12px radius · image top · 8px gap · title 500w · price 600w |
| Badge / Tag | 4px radius · 600w · 12px · ALL CAPS · colored bg |
| Section Divider | 1px solid #E2E0DA · 0 margin horizontal |
| Skeleton Loader | #E2E0DA animated shimmer · match final component dimensions |

---

*Last updated: 2026-05-15 · Branch: claude/google-stitch-master-prompt-XJXxg*
