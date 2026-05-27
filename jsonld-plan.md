# JSON-LD Schema Fixes Plan

## Summary

12 files generate JSON-LD/Microdata across 13 schema types. Major issues: Organization only on homepage (broken @id refs), inconsistent product schema across template types, breadcrumb coverage is spotty, and many page templates have no schema at all.

---

## Issues Found

### 1. Organization/WebSite only on homepage (CRITICAL)

`meta-tags.liquid` gates the Organization + LocalBusiness + WebSite `@graph` with `{%- if request.page_type == 'index' -%}`. But `@id` references (`#organization`, `#shipping_policy`, `#return_policy`) are used on EVERY product, article, and service page. Google CAN resolve cross-page @ids, but it's unreliable. The entity should be defined on every page.

### 2. Two competing product schemas

- **`bfc-product-schema.liquid`** — custom, rich (Judge.me ratings, ExpertReview condition, shipping/return policies, @id refs). Used by 13 `bfc-pdp-*` sections.
- **`{{ product | structured_data }}`** in `main-product.liquid` — Shopify built-in, simpler, no @id refs. Used by 16 `main-product` templates.

These cover DIFFERENT sets of product templates. No single product page gets both, but the schemas are inconsistent — products on bfc-pdp templates get rich schema, products on main-product templates get bare schema with no shipping/return/@id links.

### 3. BreadcrumbList is fragmented and inconsistent

- **`bfc-pdp-breadcrumbs.liquid`** — JSON-LD BreadcrumbList, only rendered on 2 PDP variants (sx70, bundle)
- **`breadcrumbs.liquid`** — HTML Microdata (NOT JSON-LD), rendered on 7+ pages, has a position-mapping bug (multiple items can share position 2)
- Most pages get NO breadcrumb schema at all

### 4. Many page templates have zero schema

These templates render NO JSON-LD at all:
- `page.json`, `page.contact.json`, `page.faq-2.json`, `page.film-camera-repairs.json`, `page.film-development.json`, `page.mailing.json`, `page.service-shipping-portal.json`, `page.about-us.json`, `page.photo-studio.json`, `page.store-locator.json`, `page.sell-us-your-gear.json`, `page.warranty.json`, `page.wholesale.json`, and ~15 more
- `search.json` — no SearchResultsPage
- `cart.json` — no schema
- `password.json`, `404.json`, `gift_card.liquid` — no schema

### 5. FAQ section disabled — FAQ-2 page has no FAQPage schema

`page.faq.json` has the `FAQ` section DISABLED but `bfc-faq` ENABLED (so FAQPage renders). However `page.faq-2.json` has NEITHER section — no FAQPage schema.

### 6. Article schema has potential comma issue

`main-article.liquid` description/image conditionals embed trailing commas inside `{% endif %}` blocks. If excerpt exists but image doesn't, the JSON is fine because image has its own `],` inside its conditional. But the logic is fragile — if excerpt is blank, the comma at end of `"description": "..."` inside `{% endif %}` doesn't render, which is correct. Needs verification that no combo produces trailing/missing commas.

### 7. Microdata breadcrumbs position bug

`breadcrumbs.liquid` has multiple items that can claim `position: 2` depending on conditional path (collection link vs product_collection vs article blog link). This produces invalid Microdata when rendered on certain page types.

---

## Plan

### Phase 1: Global Organization/WebSite (site-wide)

**Create** `snippets/bfc-global-organization.liquid`

Extract the `@graph` (Organization + LocalBusiness + WebSite) from `meta-tags.liquid` into its own snippet. Remove the `request.page_type == 'index'` gate so it renders on every page. Also add OfferShippingDetails and MerchantReturnPolicy here so they're globally defined (currently in bfc-product-schema, which means they're only defined on PDP pages that use bfc-pdp-* sections).

```liquid
{%- comment -%}
  bfc-global-organization.liquid
  Global schema entities referenced by @id from product/article/service pages.
  Rendered in layout/theme.liquid for ALL pages.
{%- endcomment -%}
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "{{ shop.url }}/#organization",
      "name": {{ shop.name | json }},
      "url": {{ shop.url | json }},
      "logo": {
        "@type": "ImageObject",
        "url": {{ 'logo.png' | asset_url | prepend: 'https:' | json }}
      },
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "contactType": "customer service",
          "telephone": "+1-718-218-4023",
          "email": "hello@brooklynfilmcamera.com",
          "availableLanguage": "English"
        },
        {
          "@type": "ContactPoint",
          "contactType": "technical support",
          "email": "repairs@brooklynfilmcamera.com",
          "availableLanguage": "English"
        }
      ],
      "sameAs": [
        {%- if settings.social_instagram_link != blank -%}"{{ settings.social_instagram_link }}",{%- endif -%}
        {%- if settings.social_twitter_link != blank -%}"{{ settings.social_twitter_link }}",{%- endif -%}
        {%- if settings.social_facebook_link != blank -%}"{{ settings.social_facebook_link }}",{%- endif -%}
        {%- if settings.social_tiktok_link != blank -%}"{{ settings.social_tiktok_link }}",{%- endif -%}
        {%- if settings.social_youtube_link != blank -%}"{{ settings.social_youtube_link }}",{%- endif -%}
        "https://brooklynfilmcamera.com"
      ]
    },
    {
      "@type": "LocalBusiness",
      "@id": "{{ shop.url }}/#localbusiness",
      "parentOrganization": { "@id": "{{ shop.url }}/#organization" },
      "name": {{ shop.name | json }},
      "description": {{ shop.description | default: "Brooklyn's film camera shop specializing in Polaroid, 35mm, medium format, and vintage cameras. Buy, sell, repair, and film developing." | json }},
      "telephone": "+1-718-218-4023",
      "priceRange": "$$",
      "email": "hello@brooklynfilmcamera.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "855 Grand St",
        "addressLocality": "Brooklyn",
        "addressRegion": "NY",
        "postalCode": "11211",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 40.7128,
        "longitude": -73.9387
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
          ],
          "opens": "11:00",
          "closes": "19:00"
        }
      ],
      "hasMap": "https://maps.google.com/?q=855+Grand+St+Brooklyn+NY+11211",
      "image": {{ 'logo.png' | asset_url | prepend: 'https:' | json }}
    },
    {
      "@type": "WebSite",
      "@id": "{{ shop.url }}/#website",
      "name": {{ shop.name | json }},
      "url": {{ shop.url | json }},
      "publisher": { "@id": "{{ shop.url }}/#organization" },
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "{{ shop.url }}/search?q={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "OfferShippingDetails",
      "@id": "{{ shop.url }}/#shipping_policy",
      "shippingRate": { "@type": "MonetaryAmount", "value": "0", "currency": "USD" },
      "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" },
      "deliveryTime": {
        "@type": "ShippingDeliveryTime",
        "handlingTime": { "@type": "QuantitativeValue", "minValue": 1, "maxValue": 3, "unitCode": "DAY" },
        "transitTime": { "@type": "QuantitativeValue", "minValue": 2, "maxValue": 7, "unitCode": "DAY" }
      }
    },
    {
      "@type": "MerchantReturnPolicy",
      "@id": "{{ shop.url }}/#return_policy",
      "applicableCountry": "US",
      "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
      "merchantReturnDays": 14,
      "returnMethod": "https://schema.org/ReturnByMail",
      "returnFees": "https://schema.org/ReturnShippingFees"
    }
  ]
}
</script>
```

**Modify** `layout/theme.liquid`

Add `{% render 'bfc-global-organization' %}` in `<head>` after `{% render 'meta-tags' %}` (line 57).

**Modify** `snippets/meta-tags.liquid`

Delete lines 68-158 (the entire `{%- if request.page_type == 'index' -%}` block containing the @graph script). Keep the SEO meta tags and OpenGraph/twitter tags.

**Modify** `snippets/bfc-product-schema.liquid`

Remove the OfferShippingDetails block (lines 100-119) and MerchantReturnPolicy block (lines 121-131) — they're now in bfc-global-organization.

### Phase 2: Unify product schema

**Modify** `sections/main-product.liquid`

Replace line 222-223:
```
<script type="application/ld+json">
  {{ product | structured_data }}
</script>
```
With:
```liquid
{%- render 'bfc-product-schema' -%}
```

This ensures ALL product templates (both `main-product` and `bfc-pdp-*` types) get the same rich Product schema with Judge.me ratings, condition logic, and @id references.

### Phase 3: Unified BreadcrumbList (all pages)

**Create** `snippets/bfc-breadcrumb-schema.liquid`

Auto-detects page type and generates JSON-LD BreadcrumbList:

```liquid
{%- comment -%}
  bfc-breadcrumb-schema.liquid
  Auto-generates JSON-LD BreadcrumbList based on page context.
  Rendered in layout/theme.liquid for ALL pages.
{%- endcomment -%}

{%- assign breadcrumb_items = '' -%}

{%- capture home_item -%}
  {"@type":"ListItem","position":1,"name":"{{ 'general.breadcrumbs.home' | t }}","item":"{{ shop.url }}"}
{%- endcapture -%}

{%- case request.page_type -%}

  {%- when 'product' -%}
    {%- if collection -%}
      {%- capture items -%}
        {{ home_item }},
        {"@type":"ListItem","position":2,"name":{{ collection.title | json }},"item":"{{ shop.url }}{{ collection.url }}"},
        {"@type":"ListItem","position":3,"name":{{ product.title | json }}}
      {%- endcapture -%}
    {%- else -%}
      {%- capture items -%}
        {{ home_item }},
        {"@type":"ListItem","position":2,"name":{{ product.title | json }}}
      {%- endcapture -%}
    {%- endif -%}

  {%- when 'collection' -%}
    {%- capture items -%}
      {{ home_item }},
      {"@type":"ListItem","position":2,"name":{{ collection.title | json }}}
    {%- endcapture -%}

  {%- when 'article' -%}
    {%- capture items -%}
      {{ home_item }},
      {"@type":"ListItem","position":2,"name":{{ blog.title | json }},"item":"{{ shop.url }}{{ blog.url }}"},
      {"@type":"ListItem","position":3,"name":{{ article.title | json }}}
    {%- endcapture -%}

  {%- when 'page' -%}
    {%- capture items -%}
      {{ home_item }},
      {"@type":"ListItem","position":2,"name":{{ page.title | json }}}
    {%- endcapture -%}

  {%- when 'search' -%}
    {%- capture items -%}
      {{ home_item }},
      {"@type":"ListItem","position":2,"name":"{{ 'general.search.title' | t }}"}
    {%- endcapture -%}

  {%- when 'cart' -%}
    {%- capture items -%}
      {{ home_item }},
      {"@type":"ListItem","position":2,"name":"{{ 'cart.general.title' | t }}"}
    {%- endcapture -%}

  {%- else -%}
    {%- capture items -%}
      {{ home_item }},
      {"@type":"ListItem","position":2,"name":"{{ page_title | default: shop.name }}"}
    {%- endcapture -%}

{%- endcase -%}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [{{ items }}]
}
</script>
```

**Modify** `layout/theme.liquid`

Add `{% render 'bfc-breadcrumb-schema' %}` in `<head>` after `bfc-global-organization`.

**Modify** `snippets/bfc-pdp-breadcrumbs.liquid`

Delete the JSON-LD script block (lines 27-60). Keep only the HTML breadcrumb nav and CSS styling. The JSON-LD is now handled by the global snippet.

**Note:** `breadcrumbs.liquid` Microdata can stay for now (backward compat). The Microdata position bug should be fixed, but since we're adding JSON-LD site-wide, the Microdata becomes redundant. Consider removing the Microdata later.

### Phase 4: Page-specific schemas

#### 4a. WebPage for general pages

**Create** `snippets/bfc-page-schema.liquid`

Generates appropriate schema based on page type. Rendered in `main-page.liquid` and any standalone page sections.

```liquid
{%- comment -%}
  bfc-page-schema.liquid
  Generates page-level schema (WebPage, AboutPage, ContactPage, etc.)
  Rendered by page sections that don't have their own schema.
{%- endcomment -%}

{%- case request.page_type -%}
  {%- when 'page' -%}
    {%- assign schema_type = 'WebPage' -%}
    {%- if page.handle == 'contact' or page.handle == 'contact-us' -%}
      {%- assign schema_type = 'ContactPage' -%}
    {%- elsif page.handle == 'about-us' or page.handle == 'about' -%}
      {%- assign schema_type = 'AboutPage' -%}
    {%- endif -%}

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": {{ schema_type | json }},
      "@id": {{ shop.url | append: page.url | json }},
      "name": {{ page.title | json }},
      "url": {{ canonical_url | json }},
      "description": {{ page.description | default: shop.description | json }},
      {%- if page.image -%}
      "image": {{ page.image | image_url: width: 1200 | prepend: 'https:' | json }},
      {%- endif -%}
      "isPartOf": { "@id": "{{ shop.url }}/#website" }
    }
    </script>

  {%- when 'search' -%}
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SearchResultsPage",
      "@id": {{ shop.url | append: '/search' | json }},
      "name": "{{ 'general.search.title' | t }}{% if search.terms %}: {{ search.terms }}{% endif %}",
      "url": {{ canonical_url | json }},
      "isPartOf": { "@id": "{{ shop.url }}/#website" }
    }
    </script>
{%- endcase -%}
```

**Modify** `sections/main-page.liquid`

Add `{% render 'bfc-page-schema' %}` at the top of the file (after the schema settings block).

#### 4b. Fix FAQ-2 page

**Modify** `templates/page.faq-2.json`

Add the `bfc-faq` section (or `FAQ` section) to the template's section order. OR add `{% render 'bfc-faq-schema' %}` directly. 

Simpler approach: add `{% render 'bfc-page-schema' %}` handles WebPage, and FAQ blocks can be added by the merchant in the customizer. But if we want automatic FAQPage schema, we need to check for FAQ blocks.

Alternative: add a check in `bfc-page-schema.liquid`:
```liquid
{%- elsif page.handle contains 'faq' -%}
  {%- assign schema_type = 'FAQPage' -%}
```

But without the actual Q&A data, FAQPage schema would be empty. The proper fix is to ensure FAQ templates include a section that renders FAQPage schema. This needs the section to be added to the JSON template.

For now, document: **page.faq-2.json should add the `bfc-faq` section to its template.**

#### 4c. Service pages without Service schema

`page.film-camera-repairs.json` uses only `custom-liquid` — no Service schema. Options:
1. Add `{% render 'bfc-service-schema', service_name: 'Camera Repair', service_type: 'Camera Repair', service_description: '...' %}` to the custom-liquid content (via Shopify admin)
2. Add a dedicated repair section to the template

Recommend: note in plan that service/page descriptions should be set by merchant in Shopify admin, and the section should render `bfc-service-schema`.

### Phase 5: Verify & clean up

#### Fix Article schema comma issue (verify)

Review `main-article.liquid` lines 320-351. The current pattern embeds trailing commas inside conditionals:
```liquid
{% if article.excerpt != blank %}
  "description": ...,
{% endif %}
{% if article.image %}
  "image": [...],
{% endif %}
```
If excerpt is blank, description+comma don't render → next property is `"datePublished"` which is fine.
If excerpt exists, description+comma renders → next is either image (with its own comma) or datePublished.
If excerpt exists AND image exists → image renders its `],` comma → next is datePublished.
All combos work for trailing commas. But image is an array `["..."]` with a trailing comma inside the conditional — this is correct.

**No fix needed.** The current pattern is correct.

#### Remove duplicate schemas

After Phase 1-3, bfc-pdp-sx70.liquid and bfc-pdp-bundle.liquid will have been rendering BOTH the global BreadcrumbList (from layout) AND the local one (from bfc-pdp-breadcrumbs.liquid). Since Phase 3 removes the JSON-LD from bfc-pdp-breadcrumbs.liquid, this is resolved.

#### Verify no product pages get double Product schema

After Phase 2, main-product.liquid renders bfc-product-schema INSTEAD of `product | structured_data`. The bfc-pdp-* sections already render bfc-product-schema. No overlap. Good.

Beta check: `product.beae-quickview-default.json`, `product.gp-template-bk-default.json`, `product.film-club.json`, `product.card.liquid`, `product.quick-cart.liquid` — these use non-standard sections. Need to check they don't already render product schema elsewhere. These are low priority (quick cart, external apps, legacy).

---

## File Changes Summary

| File | Action | Description |
|---|---|---|
| `snippets/bfc-global-organization.liquid` | **CREATE** | Global Org + LocalBusiness + WebSite + Shipping + Returns, site-wide |
| `snippets/bfc-breadcrumb-schema.liquid` | **CREATE** | Auto-detect page type, generate JSON-LD BreadcrumbList |
| `snippets/bfc-page-schema.liquid` | **CREATE** | WebPage/ContactPage/AboutPage for static pages, SearchResultsPage for search |
| `snippets/meta-tags.liquid` | **MODIFY** | Remove Organization @graph block (lines 68-158) |
| `snippets/bfc-product-schema.liquid` | **MODIFY** | Remove OfferShippingDetails + MerchantReturnPolicy blocks (now global) |
| `snippets/bfc-pdp-breadcrumbs.liquid` | **MODIFY** | Remove JSON-LD script block (now global), keep HTML nav |
| `layout/theme.liquid` | **MODIFY** | Add `bfc-global-organization` and `bfc-breadcrumb-schema` renders in `<head>` |
| `sections/main-product.liquid` | **MODIFY** | Replace `structured_data` filter with `bfc-product-schema` render |
| `sections/main-page.liquid` | **MODIFY** | Add `bfc-page-schema` render |
| `sections/main-search.liquid` | **MODIFY** | Add `bfc-page-schema` render (or main-search-banner) |
| `templates/page.faq-2.json` | **MODIFY** | Ensure bfc-faq section is present for FAQPage schema |

---

## Schema Coverage After Fixes

| Page Type | Schema | Coverage |
|---|---|---|
| All pages | Organization, LocalBusiness, WebSite, BreadcrumbList | 100% |
| Product (all templates) | Product, Offer, Brand, AggregateRating (Judge.me), OfferShippingDetails, MerchantReturnPolicy | 100% |
| Collection | CollectionPage, ItemList | Already covered (main-collection) |
| Article | Article, BlogPosting (Microdata) | Already covered (main-article) |
| FAQ pages | FAQPage | Covered if bfc-faq section present |
| Repair/service | Service | Covered if bfc-service-schema rendered |
| Static pages | WebPage / AboutPage / ContactPage | New (bfc-page-schema) |
| Search | SearchResultsPage | New (bfc-page-schema) |
| Cart, Account | BreadcrumbList only | Sufficient |
| Password, 404, Gift Card | BreadcrumbList only | Sufficient |

---

## Open Questions

1. **Should LocalBusiness be on every page or only homepage?** Schema.org best practice says defining shared entities on every page is fine via @id. But some SEO tools flag LocalBusiness on non-local pages. If concerned, split into two snippets: Organization+WebSite (site-wide) and LocalBusiness (homepage only in an additional script).

2. **Store Locator page** — should get `Store` schema with geo coordinates. Can be added to bfc-page-schema with a `page.handle == 'store-locator'` check, but the actual store list data lives in a separate section. Defer to Phase 2.

3. **Events/Calendar pages** (`page.calender-2.json`, `page.calender-events.json`) — should get `Event` schema. Need to know if these use a custom section with event data. Probably external app-driven. Defer.

4. **Product variants with Offer array** — bfc-product-schema generates an Offer array for multi-variant products. This can be very large for products with 50+ variants. Google recommends 100+ entities per page max. Should we cap the array? (Currently no cap.)

5. **`main-collection.liquid` CollectionPage** — currently hardcodes `limit: 20` for products in the ItemList. Is this intentional? Google recommends listing all products, but paginated collections only have subset loaded.

6. **Should we keep the Microdata breadcrumbs?** After Phase 3 adds JSON-LD site-wide, the Microdata from `breadcrumbs.liquid` is redundant. Remove or keep as fallback?
