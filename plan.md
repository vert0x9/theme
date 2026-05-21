# SEO Plan — brooklynfilmcamera.com Homepage

## Status Key
- [ ] todo
- [x] done
- [-] skipped

---

## Tasks

### [x] 1. Schema Markup — LocalBusiness + WebSite
**File:** `snippets/meta-tags.liquid`  
**Change:** Add JSON-LD `@graph` w/ `LocalBusiness` (855 Grand St, Brooklyn, open daily, sameAs social links) + `WebSite` w/ `SearchAction` sitelinks searchbox. Homepage only (`request.page_type == 'index'`).  
**Impact:** Local pack, knowledge panel, sitelinks searchbox.

---

### [x] 2. H1 Placement Fix
**File:** `templates/index.json`  
**Problem:** H1 "Brooklyn's Film Camera Shop" buried in slide 5 (`slide_4mJX4C`). Slide 1 (`slide_WQMqUQ`) uses H2. Crawlers weight early document order.  
**Change:** Move `<h1>` to slide 1 heading, or add visually-hidden H1 above carousel in section template.  
**Options:**
- A) Change slide 1 heading from `<h2>` to `<h1>` (simplest)
- B) Add static visually-hidden H1 above carousel in `sections/hero-banner.liquid`  
**Impact:** Correct H1 signal for homepage.

---

### [x] 3. OG Image Fallback
**File:** `snippets/meta-tags.liquid`  
**Problem:** `og:image` only outputs when `page_image` set. Homepage has none — social shares render imageless.  
**Change:** Fallback to `settings.share_image`, then hardcode CDN URL for hero image if both blank.  
**Impact:** Social shares show image instead of blank card.

---

### [x] 4. Twitter Image Tag
**File:** `snippets/meta-tags.liquid`  
**Problem:** `twitter:card` = `summary_large_image` but no `twitter:image` — card renders blank.  
**Change:** Add `twitter:image` using same fallback chain as OG image (task 3). Do task 3 first.  
**Impact:** Twitter/X share cards show image.

---

### [x] 5. Theme Color Meta
**File:** `layout/theme.liquid` line 150  
**Problem:** `<meta name="theme-color" content="">` empty — does nothing.  
**Change:** Set to brand olive `#525741` (trust bar bg) or orange `#e36e15` (accent).  
**Impact:** Minor — browser chrome color on mobile Chrome/Android.

---

### [x] 6. Hreflang Tags
**File:** `snippets/meta-tags.liquid`  
**Problem:** 10 languages, zero hreflang links — translated pages may cannibalize each other in SERPs.  
**Change:** Loop `shop.published_locales`, output `<link rel="alternate" hreflang="..." href="...">` for each + `x-default`.  
**Impact:** Prevents international duplicate content issues.

---

---

### [x] 7. JSON-LD Schema — Remove Duplicates
**Files:** `sections/header.liquid`, `snippets/ecom_google_snippet.liquid`  
**Problem:** Organization schema output 2x (header.liquid all pages + meta-tags.liquid homepage). WebSite + SearchAction also duplicated. `ecom_google_snippet.liquid` (367 lines) = dead EComposer code — never rendered.  
**Change:** Removed Organization + WebSite blocks from header.liquid. Deleted ecom_google_snippet.liquid.  
**Impact:** Eliminates duplicate structured data signals.

---

### [x] 8. JSON-LD Schema — Centralized Product Schema
**Files:** New `snippets/bfc-product-schema.liquid`, all 14 `sections/bfc-pdp-*.liquid`  
**Problem:** Only `bfc-pdp-default.liquid` had Product schema. 13 other PDP sections (v4, sx70, mf, ps, s8, film, bundle, box, etc.) had zero — most cameras invisible to Google rich results. Also: itemCondition hardcoded `NewCondition` despite selling refurbished cameras.  
**Change:** Created centralized snippet w/ dynamic itemCondition (checks product.type — cameras → RefurbishedCondition, film/accessories → NewCondition, `new-condition` tag override). Includes Judge.me ratings, multi-variant offers, GTIN, seller @id, shipping/return policy defs. Rendered from all 14 PDP sections.  
**Impact:** Product rich results (price, availability, reviews, condition) on ALL product pages.

---

### [x] 9. JSON-LD Schema — Enhanced LocalBusiness + Organization
**File:** `snippets/meta-tags.liquid`  
**Problem:** LocalBusiness missing telephone, email, geo coords, priceRange. OpeningHoursSpecification had days but no opens/closes times. No Organization node w/ @id for cross-referencing.  
**Change:** Added Organization w/ @id, logo, contactPoint (customer service + repairs), sameAs. Fixed LocalBusiness: phone, email, priceRange $$, geo (40.7128, -73.9387), hours 11:00–19:00, parentOrganization ref. WebSite now has publisher ref.  
**Impact:** Complete Knowledge Panel, Maps listing w/ hours, local pack eligibility.

---

### [x] 10. JSON-LD Schema — FAQPage
**Files:** `sections/bfc-faq.liquid`, `sections/FAQ.liquid`  
**Problem:** 30+ Q&A accordion items, zero FAQPage schema. Data already structured in blocks.  
**Change:** Added FAQPage JSON-LD iterating through section blocks (faq_item / faq types).  
**Impact:** FAQ rich results — expandable dropdowns in SERPs.

---

### [x] 11. JSON-LD Schema — Service (Repairs)
**Files:** New `snippets/bfc-service-schema.liquid`, `sections/bfc-repair-section.liquid`, `sections/polaroid-repairs.liquid`, `sections/repair-pricing.liquid`  
**Change:** Created reusable Service schema snippet. Added to 3 repair sections w/ specific service names/descriptions.  
**Impact:** Service rich results, enhanced Knowledge Panel for repair services.

---

### [x] 12. JSON-LD Schema — CollectionPage + ItemList
**File:** `sections/main-collection.liquid`  
**Change:** Added CollectionPage schema w/ ItemList (first 20 products, name + URL + position).  
**Impact:** Google understands collection structure, helps w/ sitelinks + indexing.

---

### [x] 13. JSON-LD Schema — MerchantReturnPolicy + OfferShippingDetails
**File:** `snippets/bfc-product-schema.liquid`  
**Problem:** Product offers referenced `#shipping_policy` and `#return_policy` @ids but definitions never existed.  
**Change:** Added OfferShippingDetails (free US shipping, 1-3 day handling, 2-7 day transit) + MerchantReturnPolicy (14-day window, return by mail) as separate script blocks on every product page.  
**Impact:** Shipping/return info in product rich results, higher CTR.

---

### [x] 14. JSON-LD Schema — Enhanced Article
**File:** `sections/main-article.liquid`  
**Change:** Added @id, dateModified, wordCount, publisher @id ref. Fixed image URL format.  
**Impact:** More complete article snippets, publisher attribution.

---

## Out of Scope (need Shopify Admin, not theme files)
- Set homepage `page_title` (SEO tab in Admin → Online Store → Preferences)
- Set `shop.description` (Admin → Settings → Store details)
- Set `settings.share_image` (Admin → Online Store → Themes → Customize → Theme settings)
- Verify phone number for LocalBusiness schema (add to task 1 if known)