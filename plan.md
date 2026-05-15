# SEO Plan — brooklynfilmcamera.com Homepage

## Status Key
- [ ] todo
- [x] done
- [-] skipped

---

## Tasks

### [x] 1. Schema Markup — LocalBusiness + WebSite
**File:** `snippets/meta-tags.liquid`  
**Change:** Add JSON-LD `@graph` with `LocalBusiness` (855 Grand St, Brooklyn, open daily, sameAs social links) and `WebSite` with `SearchAction` sitelinks searchbox. Outputs on homepage only (`request.page_type == 'index'`).  
**Impact:** Local pack eligibility, knowledge panel, sitelinks searchbox.

---

### [x] 2. H1 Placement Fix
**File:** `templates/index.json`  
**Problem:** H1 "Brooklyn's Film Camera Shop" is in slide 5 of the hero carousel (`slide_4mJX4C`). Slide 1 (`slide_WQMqUQ`) uses an H2. Crawlers weight early document order.  
**Change:** Move the `<h1>` tag to slide 1's heading field, or add a visually-hidden H1 above the carousel in the section template.  
**Options:**
- A) Change slide 1 heading from `<h2>` to `<h1>` (simplest)
- B) Add static visually-hidden H1 above carousel in `sections/hero-banner.liquid`  
**Impact:** Correct H1 signal to Google for homepage.

---

### [x] 3. OG Image Fallback
**File:** `snippets/meta-tags.liquid`  
**Problem:** `og:image` only outputs when `page_image` is set. Homepage has no `page_image` — social shares render imageless.  
**Change:** Add fallback to `settings.share_image` (Shopify theme setting), then hardcode a CDN URL for the hero image if both are blank.  
**Impact:** All social shares show an image instead of blank card.

---

### [x] 4. Twitter Image Tag
**File:** `snippets/meta-tags.liquid`  
**Problem:** `twitter:card` is `summary_large_image` but no `twitter:image` tag — card renders blank.  
**Change:** Add `twitter:image` using same fallback chain as OG image (task 3). Do task 3 first.  
**Impact:** Twitter/X share cards show image.

---

### [x] 5. Theme Color Meta
**File:** `layout/theme.liquid` line 150  
**Problem:** `<meta name="theme-color" content="">` is empty — does nothing.  
**Change:** Set to brand olive `#525741` (trust bar background) or orange `#e36e15` (accent).  
**Impact:** Minor — browser chrome color on mobile Chrome/Android.

---

### [x] 6. Hreflang Tags
**File:** `snippets/meta-tags.liquid`  
**Problem:** 10 languages supported, zero hreflang links — translated pages may cannibalize each other in SERPs.  
**Change:** Loop `shop.published_locales` and output `<link rel="alternate" hreflang="..." href="...">` for each, plus `x-default`.  
**Impact:** Prevents international duplicate content issues.

---

## Out of Scope (need Shopify Admin, not theme files)
- Set homepage `page_title` (SEO tab in Admin → Online Store → Preferences)
- Set `shop.description` (Admin → Settings → Store details)
- Set `settings.share_image` (Admin → Online Store → Themes → Customize → Theme settings)
- Verify phone number for LocalBusiness schema (add to task 1 if known)
