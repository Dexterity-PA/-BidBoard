# SEO Assets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add robots.txt, favicon (SVG), and Open Graph images to BidBoard using Next.js App Router file conventions — no new npm packages, no binary file generation.

**Architecture:** `public/robots.txt` is a plain text file served statically. `app/icon.svg` triggers Next.js's file-based favicon injection. `app/opengraph-image.tsx` (and per-route variants) use `next/og`'s `ImageResponse` to render 1200×630 PNGs at build time — these are auto-wired into page metadata by the framework.

**Tech Stack:** Next.js 16 App Router, `next/og` (`ImageResponse`), TypeScript, plain SVG

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `public/robots.txt` | Create | Crawler directives + sitemap pointer |
| `app/icon.svg` | Create | Favicon served at `/icon.svg`, auto-injected by Next.js |
| `app/opengraph-image.tsx` | Create | Root 1200×630 OG PNG — dark hero background, BidBoard wordmark + tagline |
| `app/layout.tsx` | Modify | Add `icons`, `openGraph`, `twitter` to metadata export |
| `app/privacy/layout.tsx` | Modify | Add `openGraph`, `twitter` to existing metadata |
| `app/privacy/opengraph-image.tsx` | Create | Privacy page OG image variant |
| `app/terms/layout.tsx` | Create | Metadata-only layout for /terms |
| `app/terms/opengraph-image.tsx` | Create | Terms page OG image variant |
| `app/pricing/layout.tsx` | Create | Metadata-only layout for /pricing |
| `app/pricing/opengraph-image.tsx` | Create | Pricing page OG image variant |

---

### Task 1: robots.txt

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Create the file**

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dashboard/

Sitemap: https://bidboard.app/sitemap.xml
```

Write exactly this content to `public/robots.txt`. Mind the blank line between the Disallow block and the Sitemap line — it is required by the robots.txt spec.

- [ ] **Step 2: Verify it serves correctly in dev**

Run `npm run dev` (or confirm dev server is running), then visit `http://localhost:3000/robots.txt`. You should see the raw text. Next.js serves `public/` files as-is.

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "feat(seo): add robots.txt with crawler rules and sitemap pointer"
```

---

### Task 2: Favicon SVG

**Files:**
- Create: `app/icon.svg`

**How this works:** Placing a file named `icon.svg` (or `icon.png`, `icon.ico`) in the `app/` directory causes Next.js to automatically inject a `<link rel="icon">` tag pointing to it into every page's `<head>`. No manual `<link>` tags needed. The file is also served at `/icon.svg`.

- [ ] **Step 1: Create `app/icon.svg`**

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#4F46E5"/>
  <text
    x="16"
    y="22"
    text-anchor="middle"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
    font-size="20"
    font-weight="700"
    fill="#FFFFFF"
  >B</text>
</svg>
```

Design rationale: Bold white "B" on indigo (`#4F46E5`) rounded-square. Readable at 16px tab size. `rx="6"` gives a subtle rounded corner matching the app's card radius.

- [ ] **Step 2: Verify in browser**

With dev server running, visit any page (e.g. `http://localhost:3000`). Check the browser tab — you should see a small indigo square with a "B". Also verify the SVG serves at `http://localhost:3000/icon.svg`.

- [ ] **Step 3: Commit**

```bash
git add app/icon.svg
git commit -m "feat(seo): add favicon SVG (indigo B lettermark)"
```

---

### Task 3: Update root layout metadata

**Files:**
- Modify: `app/layout.tsx`

**Current state of `app/layout.tsx` metadata block (lines 22–26):**
```ts
export const metadata: Metadata = {
  title: "BidBoard — Scholarship strategy, engineered.",
  description:
    "BidBoard scores every scholarship by expected value — award × win probability ÷ hours. Stop guessing. Start winning.",
};
```

- [ ] **Step 1: Replace the metadata export**

Replace the entire `metadata` export with:

```ts
export const metadata: Metadata = {
  title: "BidBoard — Scholarship strategy, engineered.",
  description:
    "BidBoard scores every scholarship by expected value — award × win probability ÷ hours. Stop guessing. Start winning.",
  icons: { icon: "/icon.svg" },
  openGraph: {
    title: "BidBoard — Scholarship strategy, engineered.",
    description:
      "BidBoard scores every scholarship by expected value — award × win probability ÷ hours. Stop guessing. Start winning.",
    url: "https://bidboard.app",
    siteName: "BidBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BidBoard — Scholarship strategy, engineered.",
    description:
      "BidBoard scores every scholarship by expected value — award × win probability ÷ hours. Stop guessing. Start winning.",
  },
};
```

Note: `og:image` and `twitter:image` URLs do **not** need to be specified manually here. When `app/opengraph-image.tsx` exists, Next.js automatically inserts the correct image URL into all page metadata that inherits from this root layout.

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(seo): add openGraph and twitter metadata to root layout"
```

---

### Task 4: Root OG image

**Files:**
- Create: `app/opengraph-image.tsx`

**How this works:** Next.js looks for `opengraph-image.tsx` in each `app/` route folder. When found, it renders it as a PNG using `ImageResponse` and inserts the URL into `og:image` and `twitter:image` meta tags. The default export must return an `ImageResponse`. The exported `size` and `contentType` constants tell Next.js the image dimensions.

- [ ] **Step 1: Create `app/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          position: "relative",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        }}
      >
        {/* Top-right indigo accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 360,
            height: 6,
            background: "#4F46E5",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "auto" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            B
          </div>
          <span
            style={{
              fontSize: 36,
              fontWeight: 700,
              color: "#FFFFFF",
              letterSpacing: "-0.02em",
            }}
          >
            BidBoard
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: 24,
          }}
        >
          Scholarship strategy,
          <br />
          engineered.
        </div>

        {/* Subtext */}
        <div style={{ fontSize: 28, color: "#94A3B8", lineHeight: 1.4 }}>
          Score every scholarship by expected value. Stop guessing. Start winning.
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Visual check**

With dev server running, visit `http://localhost:3000/opengraph-image`. You should see the rendered 1200×630 PNG directly in the browser — dark background, indigo accent bar top-right, "BidBoard" logo row, large headline, muted subtext.

- [ ] **Step 4: Commit**

```bash
git add app/opengraph-image.tsx
git commit -m "feat(seo): add root open graph image (1200×630, dark hero theme)"
```

---

### Task 5: Privacy page OG metadata

**Files:**
- Modify: `app/privacy/layout.tsx`
- Create: `app/privacy/opengraph-image.tsx`

**Current `app/privacy/layout.tsx`:**
```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — BidBoard",
  description:
    "BidBoard's Privacy Policy. Learn what data we collect, how we use it, and how we protect it.",
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 1: Add openGraph and twitter to `app/privacy/layout.tsx`**

Replace the `metadata` export:

```ts
export const metadata: Metadata = {
  title: "Privacy Policy — BidBoard",
  description:
    "BidBoard's Privacy Policy. Learn what data we collect, how we use it, and how we protect it.",
  openGraph: {
    title: "Privacy Policy — BidBoard",
    description:
      "BidBoard's Privacy Policy. Learn what data we collect, how we use it, and how we protect it.",
    url: "https://bidboard.app/privacy",
    siteName: "BidBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy — BidBoard",
    description:
      "BidBoard's Privacy Policy. Learn what data we collect, how we use it, and how we protect it.",
  },
};
```

Leave the `PrivacyLayout` component unchanged.

- [ ] **Step 2: Create `app/privacy/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          position: "relative",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 360,
            height: 6,
            background: "#4F46E5",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "auto" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            B
          </div>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            BidBoard
          </span>
        </div>

        {/* Page label */}
        <div style={{ fontSize: 22, color: "#4F46E5", fontWeight: 600, marginBottom: 20, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Legal
        </div>

        {/* Page title */}
        <div style={{ fontSize: 80, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 32 }}>
          Privacy Policy
        </div>

        <div style={{ fontSize: 26, color: "#94A3B8", lineHeight: 1.5 }}>
          Learn what data we collect, how we use it, and how we protect it.
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Visual check**

Visit `http://localhost:3000/privacy/opengraph-image` — should show the Privacy Policy variant.

- [ ] **Step 5: Commit**

```bash
git add app/privacy/layout.tsx app/privacy/opengraph-image.tsx
git commit -m "feat(seo): add openGraph metadata and OG image for /privacy"
```

---

### Task 6: Terms page layout + OG image

**Files:**
- Create: `app/terms/layout.tsx`
- Create: `app/terms/opengraph-image.tsx`

- [ ] **Step 1: Create `app/terms/layout.tsx`**

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — BidBoard",
  description:
    "BidBoard's Terms of Service. Read the terms governing use of our scholarship strategy platform.",
  openGraph: {
    title: "Terms of Service — BidBoard",
    description:
      "BidBoard's Terms of Service. Read the terms governing use of our scholarship strategy platform.",
    url: "https://bidboard.app/terms",
    siteName: "BidBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Terms of Service — BidBoard",
    description:
      "BidBoard's Terms of Service. Read the terms governing use of our scholarship strategy platform.",
  },
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Create `app/terms/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          position: "relative",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 360,
            height: 6,
            background: "#4F46E5",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "auto" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            B
          </div>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            BidBoard
          </span>
        </div>

        {/* Page label */}
        <div style={{ fontSize: 22, color: "#4F46E5", fontWeight: 600, marginBottom: 20, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Legal
        </div>

        {/* Page title */}
        <div style={{ fontSize: 80, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 32 }}>
          Terms of Service
        </div>

        <div style={{ fontSize: 26, color: "#94A3B8", lineHeight: 1.5 }}>
          Read the terms governing use of our scholarship strategy platform.
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Visual check**

Visit `http://localhost:3000/terms/opengraph-image` — should show the Terms of Service variant.

- [ ] **Step 5: Commit**

```bash
git add app/terms/layout.tsx app/terms/opengraph-image.tsx
git commit -m "feat(seo): add metadata layout and OG image for /terms"
```

---

### Task 7: Pricing page layout + OG image

**Files:**
- Create: `app/pricing/layout.tsx`
- Create: `app/pricing/opengraph-image.tsx`

- [ ] **Step 1: Create `app/pricing/layout.tsx`**

```ts
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — BidBoard",
  description:
    "BidBoard pricing. Free to start — no credit card required. Upgrade for unlimited scholarship matches and AI essay tools.",
  openGraph: {
    title: "Pricing — BidBoard",
    description:
      "BidBoard pricing. Free to start — no credit card required. Upgrade for unlimited scholarship matches and AI essay tools.",
    url: "https://bidboard.app/pricing",
    siteName: "BidBoard",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing — BidBoard",
    description:
      "BidBoard pricing. Free to start — no credit card required. Upgrade for unlimited scholarship matches and AI essay tools.",
  },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
```

- [ ] **Step 2: Create `app/pricing/opengraph-image.tsx`**

```tsx
import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0F172A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "80px",
          position: "relative",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: 360,
            height: 6,
            background: "#4F46E5",
          }}
        />

        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: "auto" }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 10,
              background: "#4F46E5",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              color: "#FFFFFF",
            }}
          >
            B
          </div>
          <span style={{ fontSize: 30, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>
            BidBoard
          </span>
        </div>

        {/* Page label */}
        <div style={{ fontSize: 22, color: "#4F46E5", fontWeight: 600, marginBottom: 20, letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Plans
        </div>

        {/* Page title */}
        <div style={{ fontSize: 80, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.03em", lineHeight: 1.05, marginBottom: 32 }}>
          Simple pricing.
          <br />
          Free to start.
        </div>

        <div style={{ fontSize: 26, color: "#94A3B8", lineHeight: 1.5 }}>
          No credit card required. Upgrade anytime for unlimited matches and AI essay tools.
        </div>
      </div>
    ),
    { ...size }
  );
}
```

- [ ] **Step 3: Type-check**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 4: Visual check**

Visit `http://localhost:3000/pricing/opengraph-image` — should show the Pricing variant with "Simple pricing. Free to start."

- [ ] **Step 5: Commit**

```bash
git add app/pricing/layout.tsx app/pricing/opengraph-image.tsx
git commit -m "feat(seo): add metadata layout and OG image for /pricing"
```

---

### Task 8: Full build verification

**Files:** None (verification only)

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: all routes compile cleanly with exit code 0. You should see all routes listed in the build output, including the new OG image routes shown as dynamic segments.

- [ ] **Step 2: Spot-check OG meta tags in dev**

Run `npm run dev`, then use `curl` to inspect a page's HTML and confirm OG tags are present:

```bash
curl -s http://localhost:3000 | grep -E 'og:|twitter:|icon'
```

Expected output includes lines like:
```
<meta property="og:title" content="BidBoard — Scholarship strategy, engineered."/>
<meta property="og:image" content="..."/>
<meta name="twitter:card" content="summary_large_image"/>
<link rel="icon" href="/icon.svg"/>
```

- [ ] **Step 3: Check robots.txt**

```bash
curl http://localhost:3000/robots.txt
```

Expected: raw robots.txt content with all four lines.

- [ ] **Step 4: If build fails, fix and recommit**

Common issues:
- `ImageResponse` import path changed in Next.js 16 → try `import { ImageResponse } from 'next/server'` as fallback
- TypeScript strict mode rejecting JSX in `.tsx` without explicit return type → add `: ImageResponse` return type annotation to the default export function

- [ ] **Step 5: Final commit (only if fixes were needed in Step 4)**

```bash
git add -A
git commit -m "fix(seo): resolve build issues from OG image or metadata changes"
```
