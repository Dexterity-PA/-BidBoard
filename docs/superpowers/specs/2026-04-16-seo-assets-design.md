# SEO Assets — robots.txt, Favicon, OG Images

**Date:** 2026-04-16  
**Status:** Approved  
**Scope:** Static/config files only. No functionality changes. No new npm packages.

---

## Goal

Add the three foundational SEO/discoverability assets that BidBoard currently lacks:
1. `robots.txt` — crawler directives + sitemap pointer
2. Favicon — SVG lettermark served via Next.js App Router convention
3. Open Graph images — per-route PNG images generated via Next.js `ImageResponse`

---

## Brand Tokens (from `app/page.tsx`)

| Token | Value |
|---|---|
| Primary indigo | `#4F46E5` |
| Dark indigo | `#4338CA` |
| Dark background | `#0F172A` |
| Indigo tint | `#EEF2FF` |
| White | `#FFFFFF` |
| Text primary | `#111827` |
| Text muted | `#6B7280` |
| Border | `#E5E7EB` |

Fonts: `Instrument Serif` (display), `DM Sans` (body). Both available via `next/font/google`.

---

## 1. robots.txt

**File:** `public/robots.txt`

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/

Sitemap: https://bidboard.app/sitemap.xml
```

Rationale: Allow all public marketing pages and scholarship listings. Block authenticated/API routes from crawling. Sitemap URL uses the production domain.

---

## 2. Favicon

**Approach:** Next.js App Router file-based metadata convention. Placing `icon.svg` in `app/` causes Next.js to auto-inject `<link rel="icon">` tags and serve the file at `/icon.svg`. No manual `<link>` tags needed in layout.

**File:** `app/icon.svg`

Design: Bold "B" lettermark. White letter on indigo (`#4F46E5`) rounded-square background. Clean, single-color, readable at 16px and 32px.

The SVG uses a `viewBox="0 0 32 32"` with:
- Rounded rect fill `#4F46E5`
- Centered "B" in white using a web-safe system font stack

**Why not `public/favicon.ico`:** ICO is a binary format. The App Router convention covers all modern browsers and serves a real SVG. Legacy browsers (IE11) that require `.ico` are not a target audience for BidBoard.

---

## 3. Open Graph Images

**Approach:** Next.js App Router `opengraph-image.tsx` convention. Each file exports an `ImageResponse` that Next.js renders to a 1200×630 PNG at build time and auto-wires into page metadata. No external packages required (`next` ships `ImageResponse` via `next/og`).

### Root OG image — `app/opengraph-image.tsx`

Design:
- Background: dark (`#0F172A`) matching the hero section
- Top-left: "BidBoard" wordmark in white Instrument Serif at ~72px
- Below: tagline "Scholarship strategy, engineered." in slate/muted text
- Bottom-right: decorative indigo accent block or subtle gradient
- Dimensions: 1200×630

### Per-page OG images

Each public page with distinct metadata gets its own `opengraph-image.tsx` in its route folder. The design mirrors the root template but shows the page title prominently.

| Route | File | Page Title Shown |
|---|---|---|
| `/privacy` | `app/privacy/opengraph-image.tsx` | "Privacy Policy" |
| `/terms` | `app/terms/opengraph-image.tsx` | "Terms of Service" |
| `/pricing` | `app/pricing/opengraph-image.tsx` | "Pricing" |

---

## 4. Metadata Updates

### `app/layout.tsx`

Add to the existing `metadata` export:

```ts
icons: { icon: "/icon.svg" },
openGraph: {
  title: "BidBoard — Scholarship strategy, engineered.",
  description: "BidBoard scores every scholarship by expected value...",
  url: "https://bidboard.app",
  siteName: "BidBoard",
  type: "website",
},
twitter: {
  card: "summary_large_image",
  title: "BidBoard — Scholarship strategy, engineered.",
  description: "BidBoard scores every scholarship by expected value...",
},
```

The `og:image` and `twitter:image` URLs are automatically injected by Next.js when `app/opengraph-image.tsx` exists — no manual URL needed.

### `app/privacy/layout.tsx` (already exists)

Add `openGraph` and `twitter` fields to the existing metadata. OG image auto-resolves from `app/privacy/opengraph-image.tsx`.

### `app/terms/layout.tsx` (new file)

Create with metadata only — same pattern as privacy layout.

### `app/pricing/layout.tsx` (new file)

Create with metadata only. Pricing page currently has no layout.

---

## Files Changed

| File | Action |
|---|---|
| `public/robots.txt` | Create |
| `app/icon.svg` | Create |
| `app/opengraph-image.tsx` | Create |
| `app/privacy/opengraph-image.tsx` | Create |
| `app/terms/layout.tsx` | Create |
| `app/terms/opengraph-image.tsx` | Create |
| `app/pricing/layout.tsx` | Create |
| `app/pricing/opengraph-image.tsx` | Create |
| `app/layout.tsx` | Edit — add icons/openGraph/twitter to metadata |
| `app/privacy/layout.tsx` | Edit — add openGraph/twitter to metadata |

---

## Non-Goals

- No sitemap.xml generation (separate task)
- No `public/og-image.png` static file (replaced by `ImageResponse` approach)
- No new npm packages
- No changes to any authenticated or dashboard routes
