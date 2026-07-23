---
name: lumen-shaders
description: Backup source of distinctive, procedurally-animated WebGL2 shader backgrounds (liquid chrome, silk ribbons, soft bloom, aura rings, light rays, halftone, data glyphs, reeded glass, pixel mosaic) for websites, apps, and sellable templates. Vendored from LUMEN (github.com/Leonxlnx/lumenshaders, MIT). Use when a hero/section background needs real motion and a generic gradient or floating-blob decoration (flagged by design-quality-gate) would look like AI slop instead.
---

# Lumen Shaders

A vendored, dependency-free WebGL2 shader engine for animated hero/section
backgrounds — the fallback reached for when a design calls for ambient
motion and the honest alternative (a flat gradient, a floating blob) would
read as generic. Source: **LUMEN** (Leonxlnx/lumenshaders), MIT-licensed —
full license in `vendor/LICENSE`, keep it alongside the code per the MIT
notice-inclusion term. This is a backup resource, not a default: most
sections don't need it — reach for it deliberately, not reflexively.

## When to reach for this

- A landing/marketing hero, pricing page, or template-for-sale needs a
  premium, distinctive background and the palette/typography choices from
  `frontend-architect` alone feel flat.
- `design-quality-gate`'s Step 2 flagged a floating blob/orb or a generic
  gradient — this is the sanctioned replacement, not "keep the blob."
- Building a website/app/template meant to be **sold** (a template product,
  a premium theme, a portfolio piece) where visual differentiation is the
  point, not just acceptable — this is exactly the "backup for
  create-to-sell work" case.

Don't use it for dashboards, dense UI, or anywhere motion would compete with
content — that's `apple-design` gesture/motion territory, not this.

## The 9 modes

| id | key | name | character |
|---|---|---|---|
| 0 | chrome | Liquid Chrome | flowing metallic ribbons, high gloss |
| 1 | silk | Silk Ribbons | soft flowing bands, lower contrast than chrome |
| 2 | bloom | Soft Bloom | diffuse glowing color blooms |
| 3 | aura | Aura Rings | concentric rings radiating from a center |
| 4 | rays | Light Rays | radiating light-shaft pattern |
| 5 | halftone | Halftone | animated dot-matrix / print-halftone field |
| 6 | glyphs | Data Glyphs | flickering glyph/data-matrix texture |
| 7 | reeded | Reeded Glass | vertical fluted-glass distortion |
| 8 | mosaic | Pixel Bloom | animated pixel/mosaic blocks |

Each mode is driven by one shared uber-shader (`vendor/shaders.js`) switched
by the `u_mode` uniform — no per-mode asset swap needed.

## Two integration paths

**A — Static/video asset (zero code, safest for a quick hero image).**
Generate a design at the hosted tool (lumenshaders.vercel.app) or by running
`vendor/` alongside the upstream repo's `index.html`/`ui.js` locally, export
PNG/video/GIF, and use it as a normal background-image/video asset. Good
when the target repo has no room for a live WebGL canvas (e.g. a static
Liquid section that must stay lightweight).

**B — Live embedded background (real motion, ~35KB of JS, no build step).**
Copy `vendor/engine.js`, `vendor/shaders.js`, and (if you want the curated
palettes) `vendor/palettes.js` into the target project, then:

```html
<canvas id="lumen-bg" style="position:absolute; inset:0; width:100%; height:100%;"></canvas>
<script src="palettes.js"></script>
<script src="shaders.js"></script>
<script src="engine.js"></script>
<script>
  var canvas = document.getElementById('lumen-bg');

  // P is the parameter object the engine reads every frame — pick a mode,
  // wire in colors from the page's own palette (see frontend-architect),
  // leave the rest at these safe defaults.
  var P = {
    mode: 7, seed: 9015,                                  // 0-8, see table above
    c1: "#ff6a00", c2: "#ffb347", c3: "#a81c00", c4: "#3d0c02", bg: "#070403",
    hue: 0, sat: 1, exposure: 1, contrast: 1,
    scale: 1.2, complex: 4, warp: 0.8, flow: 0.4, stretch: 0,
    light: 1.2, gloss: 40, lightAngle: 235, irid: 0.1, glow: 0.3,
    grain: 0.03, cell: 90, lines: 60, ca: 0.02, vig: 0.15, soft: 1,
    travel: 0.6, loop: 8,
    synthOn: false, modeB: 2, mixOp: 0, blend: 0.6,
    genomeOn: false, genes: [0,0,0.5,3, 0,0,0,0.5, 0.5,0.5,0.5,0]
  };

  function resize() {
    Engine.setSize(canvas.clientWidth * devicePixelRatio, canvas.clientHeight * devicePixelRatio);
  }

  Engine.init(canvas, function () { return P; }, {
    onReady: resize,
    onError: function (msg) { canvas.style.display = 'none'; /* fall back to a static background */ }
  });
  window.addEventListener('resize', resize);
</script>
```

Map `c1`–`c4`/`bg` from the archetype's own color decisions (see
`frontend-architect`), not the shipped defaults above — a shader background
in the wrong palette is its own kind of slop.

**Framework notes:**
- **Shopify Liquid** (`bento316-shopify-store`): drop the three vendor files
  into `assets/`, reference via `{{ 'engine.js' | asset_url }}` etc. in the
  section that needs it; keep the canvas absolutely positioned behind
  section content.
- **Next.js/React** (`bento316-shopify`): the files are plain global-scope
  IIFEs (`var Engine = ...`), not ES modules — load them with `next/script`
  (`strategy="lazyOnload"`) or wrap in a small client component that
  dynamic-imports and attaches to `window` once, rather than trying to
  `import` them directly.
- **Land-app**: same dynamic-script approach as Next.js if the interface is
  React-based.

## Required for every embed

- **Respect `prefers-reduced-motion`** (see `apple-design` §14): when set,
  call `Engine.setPlaying(false)` and render a single static frame via
  `Engine.renderAt(0)`, or skip the canvas entirely and use a static
  gradient/export instead.
- **Fail closed:** if `onError` fires (no WebGL2), hide the canvas and let
  the section's normal background show — never leave a blank canvas.
- **Keep `vendor/LICENSE` alongside the vendored files** wherever they're
  copied to satisfy the MIT notice-inclusion requirement.
- Run the result through `design-quality-gate` before presenting — a shader
  background doesn't exempt a section from contrast/spacing/typography
  checks.
