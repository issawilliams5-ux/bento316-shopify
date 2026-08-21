# RoyalChild Shopify Theme

**Premium Christian Streetwear | Shopify Online Store 2.0**

A production-ready, custom Shopify theme built for RoyalChild—a premium Christian clothing and lifestyle brand. This theme follows Shopify OS 2.0 architecture with Liquid templates, JSON templates, sections, blocks, and theme settings.

## Benchmark Target

This theme targets **80%+ functional/UX parity with Gymshark.com** while maintaining a unique RoyalChild visual identity focused on faith-based storytelling.

---

## Quick Start

### Installation

1. **Clone or download** this repository
2. **Install Shopify CLI** (if not already installed):
   ```bash
   npm install -g @shopify/cli @shopify/theme
   ```
3. **Connect to your Shopify store**:
   ```bash
   shopify theme dev
   ```
4. **Push to your store**:
   ```bash
   shopify theme push
   ```

### GitHub Integration

1. Go to **Shopify Admin → Online Store → Themes**
2. Click **Add theme → Connect from GitHub**
3. Select this repository and branch
4. Preview the unpublished theme before publishing

---

## Theme Structure

```
royalchild-theme/
├── assets/              # CSS, JavaScript, images
│   ├── base.css         # Global styles with design tokens
│   └── global.js        # Core JavaScript components
├── blocks/              # Reusable theme blocks
├── config/              # Theme configuration
│   └── settings_schema.json  # Theme editor settings
├── layout/              # Layout templates
│   └── theme.liquid     # Main layout file
├── locales/             # Translation files
│   └── en.default.json  # English translations
├── sections/            # Section files
│   ├── announcement-bar.liquid
│   ├── header.liquid
│   └── footer.liquid
├── snippets/            # Reusable code snippets
│   ├── cart-drawer.liquid
│   ├── product-card.liquid
│   ├── mobile-nav-drawer.liquid
│   ├── search-modal.liquid
│   └── meta-tags.liquid
└── templates/           # JSON templates
    ├── index.json       # Homepage
    ├── product.json     # Product page
    ├── collection.json  # Collection page
    ├── cart.json        # Cart page
    ├── page.json        // Standard page
    ├── search.json      # Search page
    └── 404.json         # Error page
```

---

## Features

### Foundation (Phase 2 Complete)
- ✅ Design system with CSS custom properties
- ✅ Responsive typography with `clamp()`
- ✅ Mobile-first responsive layouts
- ✅ Accessibility features (WCAG 2.2 AA patterns)
- ✅ Skip-to-content link
- ✅ Keyboard navigation support
- ✅ Reduced motion support
- ✅ Semantic HTML structure

### Header & Navigation
- ✅ Transparent/sticky header option
- ✅ Desktop navigation with dropdowns
- ✅ Mobile navigation drawer
- ✅ Mega menu capability
- ✅ Search modal with predictive search
- ✅ Customer account access
- ✅ Wishlist functionality (localStorage)
- ✅ Cart icon with item count

### Cart Experience
- ✅ Slide-out cart drawer
- ✅ Quantity editing
- ✅ Item removal
- ✅ Free shipping progress bar
- ✅ Cross-sell recommendations area
- ✅ Empty cart state
- ✅ Subtotal display

### Product Cards
- ✅ Second image hover (desktop)
- ✅ Color swatches
- ✅ Quick add button
- ✅ Sale/sold-out/new badges
- ✅ Wishlist button
- ✅ Review rating display (app-compatible)

### SEO & Performance
- ✅ Open Graph metadata
- ✅ Twitter Card metadata
- ✅ JSON-LD structured data (Organization, Product, Article)
- ✅ Canonical URLs
- ✅ Lazy-loading images
- ✅ Optimized asset loading

---

## Theme Editor Settings

### Colors
- Primary Background
- Secondary Background
- Primary Text
- Muted Text
- Accent Color (gold default)
- Button Primary
- Button Text
- Border Color

### Typography
- Heading Font (Shopify font picker)
- Body Font (Shopify font picker)
- Heading Scale
- Body Font Size
- Body Line Height

### Layout
- Max Page Width (1200–1800px)
- Section Spacing
- Border Radius

### Animations
- Enable/Disable Animations
- Animation Intensity (subtle/moderate/bold)

### Header
- Logo Image
- Transparent Logo Option
- Logo Width
- Sticky Header Toggle
- Transparent Over Hero Toggle

### Cart
- Enable Cart Drawer
- Free Shipping Progress
- Free Shipping Threshold

### Product Cards
- Second Image on Hover
- Quick Add Button
- Color Swatches

### Social Media
- Instagram URL
- Facebook URL
- TikTok URL
- YouTube URL
- Social Sharing Image

---

## Required Merchant Configuration

See `STORE_SETUP.md` for the complete checklist of actions required after connecting the theme to Shopify.

### Key Items:
1. Upload logo and brand assets
2. Configure brand colors and fonts
3. Assign navigation menus
4. Set up homepage collections
5. Upload hero videos/poster images
6. Configure product metafields for storytelling
7. Test cart and checkout flow

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile Safari (iOS 14+)
- Chrome for Android (latest)

---

## Performance Guidelines

- No jQuery dependency
- Vanilla JavaScript only
- CSS-only animations where possible
- Lazy-loading for below-fold content
- Responsive images with `srcset`
- Minimal blocking resources

---

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigable
- Visible focus states
- Skip-to-content link
- Reduced motion support
- Color contrast compliance

---

## App Compatibility

This theme is compatible with common Shopify apps:

- **Reviews**: Judge.me, Loox, Yotpo (via app blocks)
- **Subscriptions**: Recharge, Skio
- **Upsells**: ReConvert, AfterSell
- **Sizing**: Kiwi Size Chart, Fitment
- **Loyalty**: Smile.io, LoyaltyLion

No paid apps are required for basic functionality.

---

## Development

### Local Development

```bash
# Install dependencies
npm install -g @shopify/cli

# Start development server
shopify theme dev

# Push to store
shopify theme push

# Pull from store
shopify theme pull
```

### Theme Check

Run Shopify Theme Check for validation:

```bash
shopify theme check
```

---

## License

This theme is proprietary software developed for RoyalChild.

---

## Support

For theme-related questions or issues, contact the development team.

For Shopify platform support, refer to [Shopify Help Center](https://help.shopify.com).
