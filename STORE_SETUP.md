# RoyalChild Theme - Store Setup Checklist

**Important:** This theme is NOT connected to your Shopify store. Complete these steps after connecting via GitHub or uploading the theme.

---

## 1. Connect Theme to Shopify

### Option A: GitHub Integration (Recommended)
1. Go to **Shopify Admin → Online Store → Themes**
2. Click **Add theme → Connect from GitHub**
3. Authorize Shopify to access your GitHub account
4. Select this repository and branch
5. Click **Connect**
6. Theme will appear as "Unpublished" in your theme library

### Option B: Manual Upload
1. Download theme as ZIP
2. Go to **Shopify Admin → Online Store → Themes**
3. Click **Add theme → Upload zip file**
4. Select the downloaded ZIP file
5. Theme will appear as "Unpublished"

---

## 2. Preview & Test

1. Click **Actions → Preview** on the unpublished theme
2. Review the homepage layout
3. Test navigation on desktop and mobile
4. Test cart drawer functionality
5. Test search modal
6. Check all template pages (product, collection, cart, etc.)

---

## 3. Brand Assets Configuration

### Logo
1. Go to **Theme Editor → Theme Settings → Header**
2. Upload your logo image (PNG with transparent background recommended)
3. Upload alternate logo for transparent header (if different)
4. Adjust logo width (default: 160px)

### Favicon
1. Go to **Theme Settings → Favicon**
2. Upload 32x32px PNG favicon

### Social Sharing Image
1. Go to **Theme Settings → Social Media**
2. Upload Open Graph image (1200x630px recommended)

---

## 4. Colors & Typography

### Colors
Go to **Theme Settings → Colors** and configure:
- [ ] Primary Background (default: #ffffff)
- [ ] Secondary Background (default: #f8f8f8)
- [ ] Primary Text (default: #1a1a1a)
- [ ] Muted Text (default: #6b6b6b)
- [ ] Accent Color (default: #c9a55c gold)
- [ ] Button Primary (default: #1a1a1a)
- [ ] Button Text (default: #ffffff)
- [ ] Border Color (default: #e5e5e5)

### Typography
Go to **Theme Settings → Typography** and configure:
- [ ] Heading Font (use Shopify font picker)
- [ ] Body Font (use Shopify font picker)
- [ ] Heading Scale (default: 1.2)
- [ ] Body Font Size (default: 16px)
- [ ] Body Line Height (default: 1.6)

---

## 5. Navigation Setup

### Main Menu
1. Go to **Online Store → Navigation**
2. Create or edit "Main menu"
3. Add menu items such as:
   - NEW
   - MEN (with dropdown subcategories)
   - WOMEN (with dropdown subcategories)
   - COLLECTIONS
   - BEST SELLERS
   - OUR STORY
   - JOURNAL
   - SALE

### Footer Menus
Create separate menus for:
- Shop Menu (product categories)
- Brand Menu (About, Mission, Journal, Contact)
- Support Menu (FAQ, Shipping, Returns, Size Guide)

---

## 6. Homepage Configuration

1. Go to **Theme Editor → Homepage**
2. Configure each section:

### Video Hero Section
- Upload desktop hero video (16:9 aspect ratio, MP4)
- Upload mobile hero video (9:16 aspect ratio, MP4)
- Upload poster image (fallback)
- Set heading and subheading
- Configure CTA button text and link
- Adjust overlay opacity

### Featured Collections
- Select collections to display
- Set number of products to show
- Configure section heading

### Brand Statement
- Write brand mission statement
- Optionally add scripture reference
- Configure visibility settings

### Editorial Sections
- Upload editorial images (4:5 aspect ratio recommended)
- Write compelling copy
- Set CTA buttons

---

## 7. Collection Setup

### Create Collections
1. Go to **Products → Collections**
2. Create collections such as:
   - New Arrivals
   - Best Sellers
   - Men's All
   - Women's All
   - Hoodies
   - T-Shirts
   - Faith Collections (Identity, Child of God, Kingdom, etc.)
   - Limited Drops
   - Sale

### Collection Images
- Upload collection banner images
- Set collection descriptions

---

## 8. Product Metafields Configuration

For enhanced product storytelling, set up metafields:

### Product Metafields
Go to **Settings → Custom Data → Products** and add:

| Field Name | Type | Description |
|------------|------|-------------|
| `scripture_reference` | Single line text | Bible verse reference |
| `scripture_text` | Multi-line text | Full scripture text |
| `design_meaning` | Rich text | Story behind the design |
| `fit_description` | Single line text | Fit notes (oversized, standard, slim) |
| `model_info` | Multi-line text | Model measurements and size worn |

### Assign Metafields to Products
1. Edit each product
2. Scroll to metafields section
3. Fill in appropriate values

---

## 9. Cart & Checkout Testing

1. Add products to cart
2. Test cart drawer open/close
3. Test quantity updates
4. Test item removal
5. Verify free shipping progress bar
6. Test checkout flow (add test product if needed)

---

## 10. Mobile Testing

Test on various devices/screen sizes:
- [ ] iPhone (various models)
- [ ] Android phones (various manufacturers)
- [ ] iPad/tablet
- [ ] Desktop (various resolutions)

Key areas to verify:
- Navigation drawer opens/closes properly
- Product grids display correctly
- Images load and scale properly
- Cart drawer is usable
- Checkout transition works

---

## 11. Policy Pages

Ensure policy pages are created:
1. Go to **Settings → Policies**
2. Create/edit:
   - Privacy Policy
   - Terms of Service
   - Refund Policy
   - Shipping Policy
   - Contact Information

---

## 12. Optional App Integrations

### Reviews App (Recommended)
Install one of:
- Judge.me (free tier available)
- Loox
- Yotpo

Configure app blocks in product templates.

### Size Guide App (Optional)
Install one of:
- Kiwi Size Chart
- Fitment

### Email/SMS Marketing
Install Klaviyo, Attentive, or similar for:
- Newsletter signup integration
- Abandoned cart flows
- Welcome series

---

## 13. SEO Configuration

1. Go to **Online Store → Preferences**
2. Set:
   - Page title
   - Meta description
   - Google verification code (if using Search Console)
   - Bing verification code (if using)
   - Facebook Pixel ID (if using)

---

## 14. Final QA Before Publishing

Checklist:
- [ ] All navigation links work
- [ ] All images loaded correctly
- [ ] Videos play properly
- [ ] Cart functions correctly
- [ ] Checkout tested with real/sandbox payment
- [ ] Mobile experience verified
- [ ] Accessibility basics checked (keyboard nav, focus states)
- [ ] No console errors in browser dev tools
- [ ] Social sharing previews look correct

---

## 15. Publish Theme

When ready:
1. Go to **Online Store → Themes**
2. Find the unpublished RoyalChild theme
3. Click **Actions → Publish**
4. Confirm publication

**Note:** This will replace your live theme. Consider publishing during low-traffic hours.

---

## Post-Publish Monitoring

After publishing:
1. Monitor site analytics for any issues
2. Check Core Web Vitals in Google Search Console
3. Gather customer feedback
4. Monitor conversion rates
5. Be prepared to rollback if critical issues arise

---

## Support Resources

- **Shopify Help Center**: https://help.shopify.com
- **Shopify Community**: https://community.shopify.com
- **Theme Documentation**: See README.md in this repository
