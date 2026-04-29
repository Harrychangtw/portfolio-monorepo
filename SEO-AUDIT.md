# SEO Audit — harrychang.me

Diagnostic only. No prose / voice / visible-content changes proposed.
Generated 2026-04-29 from six parallel sub-agent investigations.

---

## TL;DR — the smoking gun

**Google indexes 2 of ~60 sitemap URLs**, and brand-name queries ("Harry Chang", "張祺煒") surface a random gallery post instead of `/`.

Single root cause behind both: **the homepage SSR bails out to client-side rendering.** Live HTML at `https://harrychang.me/` contains `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template>` and **zero rendered body text** — no `<h1>`, no `<h2>`, no bio, "Harry Chang" appears once (in `<title>`). Meanwhile `/gallery/[slug]` ships fully-rendered HTML with "Harry Chang" 20× and "張祺煒" 5× in body, plus complete `Photograph` schema with author linked to the Person `@id`. Googlebot picks the gallery post as the entity page because it's the only fully-rendered URL containing the name.

Layered on top: a hreflang/i18n strategy that's internally inconsistent (sitemap uses `?lang=zh-TW`; per-route metadata uses `_zh-tw` path suffix; client-side language context reads neither — both URLs serve byte-identical EN HTML), so Google treats most pages as duplicates and drops them.

Fix the SSR bailout + reconcile the hreflang strategy and indexing should recover within one re-crawl cycle.

---

## P0 — Critical (blocking indexing / brand-query ranking)

### P0-1 Homepage bails out to client-side rendering

- **Evidence:** live `https://harrychang.me/` HTML contains `BAILOUT_TO_CLIENT_SIDE_RENDERING`, no rendered body, no headings, "Harry Chang" 1× total.
- **Cause:** `app/(main)/page.tsx:67` mounts client-only sections (`AboutSection` is `"use client"` and calls `useLanguage()`). Something in the tree (likely a `useSearchParams` consumer without a `<Suspense>` boundary, or a render-time error) is forcing the entire route to CSR.
- **Fix:** find the bailout source in `apps/harrychang-me/app/(main)/page.tsx` and its descendants; wrap any `useSearchParams` usage in `<Suspense>` or render an SSR-safe default-language fallback before hydration. Verify with `curl https://harrychang.me/ | grep -c BAILOUT` returning `0`.
- **Note:** this is a code-architecture fix, not a prose change. But it's non-trivial — needs careful implementation to avoid breaking the language switcher. **Recommend separate PR after diagnosis.**

### P0-2 Hreflang strategy is internally inconsistent

- **Evidence:**
  - `app/sitemap.ts:62-65, 97-100, 134-137, 170-173` advertises zh-TW alternate as `?lang=zh-TW`.
  - `app/(main)/blog/[slug]/page.tsx:52-54`, `projects/[slug]/page.tsx:57-60`, `gallery/[slug]/page.tsx:55-58` advertise zh-TW alternate as `${baseSlug}_zh-tw`.
  - `?lang=zh-TW` URL serves identical EN HTML (verified — same `etag`); language context is cookie-only, doesn't read the param.
  - Homepage emits `hreflang="en"` and `hreflang="zh-TW"` pointing to **the same URL** (invalid per Google spec).
  - `_zh-tw` URLs (which DO serve Chinese content) are absent from the sitemap.
- **Fix:** pick one strategy. Recommended:
  1. Drop `?lang=zh-TW` alternates from `app/layout.tsx:107`, `app/(main)/layout.tsx:21`, `app/(main)/page.tsx:45`, `app/(main)/blog/page.tsx:23`, `projects/page.tsx`, `gallery/page.tsx`.
  2. In `app/sitemap.ts`, when `hasChineseVersion`, emit a separate `<url>` entry for `/{section}/{baseSlug}_zh-tw` with reciprocal `_zh-tw ↔ baseSlug` alternates, plus `x-default` → EN URL.
  3. Listing pages (`/blog`, `/projects`, `/gallery`) and `/`: drop the zh-TW alternate entirely OR implement server-side language resolution.

### P0-3 Sitemap contains stale legacy slugs

- **Evidence:** `content/posts/` has `9_m11d.md`, `10-lego-mount.md`, `11-portfolio.md`, `12-us-trip.md` (and `_zh-tw` siblings) violating the documented `YYYY_MM_DD_[slug]` convention. Sitemap emits `/blog/10-lego-mount` etc.; the slug→post resolver may 404 these.
- **Fix:** either rename the four legacy posts to date-prefix form, or filter them out in `getAllPostSlugs()` (`packages/lib/lib/markdown.ts`). Re-verify each sitemap URL returns 200 after.

### P0-4 Person schema scoped to `(main)` only; `sameAs[]` incomplete

- **Evidence:** `app/(main)/layout.tsx:88-137` emits `WebSite` + `Person` `@graph`. Lab subdomain, `(graph)`, root `not-found.tsx` get no Person. `sameAs[]` includes 5 of 9+ owned profiles — missing **medium, telegram, discord, spotify**, and `@harrychangtw` X/Twitter URL.
- **Fix:** hoist the JSON-LD block to `app/layout.tsx`; delete the duplicate from `(main)/layout.tsx`; extend `sameAs[]` to include all `siteConfig.social.*` entries plus `https://x.com/harrychangtw`.

### P0-5 Person schema repeated on every subpage dilutes entity attribution

- **Cause:** because the block lives in `(main)/layout.tsx`, every gallery/project/blog page declares itself an authoritative source of `Person.name = "Harry Chang"`. Combined with P0-1 (empty homepage), gallery URLs become the only fully-rendered Person-bearing pages.
- **Fix:** keep the Person + WebSite block at root layout (so subpages can reference by `@id`), but on subpages reference the Person via `@id` only — do not re-declare `name`. Add `WebPage`/`ProfilePage` to `app/(main)/page.tsx` with `mainEntity: { @id: '/#person' }` so `/` becomes the canonical profile page.

### P0-6 `noindex` on real content pages

- **Evidence:** `/manifesto`, `/uses`, `/paper-reading`, `/design`, `/cv` carry `robots: { index: false, follow: false }` while having unique well-written titles/descriptions and (at least `/cv`) appearing in the sitemap. Conflicting signals; high-quality unique pages hidden from Google.
- **Fix:** remove `robots.index:false` from `app/(main)/{manifesto,uses,paper-reading}/{layout,page}.tsx`. For `/design` and `/cv`, confirm intent — if internal/private keep noindex AND remove from sitemap.

### P0-7 `/linktree` title double-suffix bug

- **Evidence:** live title is `Links | Harry Chang 張祺煒 | Harry Chang` — root `template: "%s | Harry Chang"` re-appends "Harry Chang".
- **Fix:** in `app/(main)/linktree/page.tsx`, change to `title: { absolute: "Links | Harry Chang 張祺煒" }`. Same for `openGraph.title`.

---

## P1 — High

### P1-1 Hardcoded `<html lang="en">` always

- `app/layout.tsx:162` — never reflects zh-TW even when alternates claim it does.
- **Fix:** derive `lang` from middleware-set header / route param after hreflang strategy is reconciled.

### P1-2 Canonical drift across nested layouts

- `app/layout.tsx:104` (no slash), `app/(main)/layout.tsx:18` (with slash), `app/(main)/page.tsx:42` (with slash) all set `alternates.canonical`. Nested overrides invite future drift.
- **Fix:** keep canonical only on leaf `page.tsx`; remove `alternates` from layouts. Add `trailingSlash: false` in `next.config.mjs`.

### P1-3 `@id` host-mismatch risk in slug pages

- `blog/[slug]/page.tsx:12`, `projects/[slug]/page.tsx`, `gallery/[slug]/page.tsx` hardcode `const baseUrl = "https://www.harrychang.me"`. If `siteConfig.url` ever changes, schema `@id` references break.
- **Fix:** import from `siteConfig`.

### P1-4 zh-TW pages share titles/descriptions with EN

- Frontmatter `description` often duplicates between `foo.md` and `foo_zh-tw.md`. Even after fixing P0-2, the two URLs will look identical to Google.
- **Fix:** in slug-page `generateMetadata`, when the slug ends with `_zh-tw`, append a localized suffix (e.g. ` | 部落格`) and require non-empty zh-TW frontmatter description.

### P1-5 Dynamic-route description fallback missing

- `blog/[slug]`, `projects/[slug]`, `gallery/[slug]` use `post.description` directly. If frontmatter is empty, the root description leaks in → duplicate descriptions across posts.
- **Fix:** add fallback `description: post.description ?? \`${post.title} — by Harry Chang\``.

### P1-6 Listing pages alternates broken

- `/blog`, `/projects`, `/gallery` emit `hreflang="zh-TW"` to `?lang=zh-TW` URLs that serve identical EN HTML. Same root cause as P0-2.

### P1-7 Internal anchor text never says "Harry Chang"

- Header nav points to `/` with no text or just home icon. Footer has no `/` link with the brand as anchor. Gallery breadcrumbs link `/` as "Home" (`gallery/[slug]/page.tsx:165`).
- **Fix:** in gallery breadcrumb `BreadcrumbList`, change position-1 `name: "Home"` → `name: "Harry Chang"`. (Schema-only change, not visible UI.) Add `<a href="/" rel="author">Harry Chang</a>` byline element on gallery/blog/project pages.

### P1-8 Description over Google's display limit on `/` and `/lab`

- Homepage description = 195 chars (truncated by Google). Lab root = 178 chars.
- **Fix:** trim to ≤155 chars in `app/(main)/page.tsx` and `app/(lab)/lab/layout.tsx`.

### P1-9 `/linktree` is orphaned

- Zero internal pages link to it. Only `pageMappings` references it for breadcrumbs.
- **Fix:** add `/linktree` to `RESOURCE_LINKS` in `apps/harrychang-me/components/footer.tsx`.

### P1-10 Dead internal link `/icarus`

- Listed in `components/footer.tsx:40`; no route exists at `app/(main)/icarus/`.
- **Fix:** remove that entry, or repoint to `https://lab.harrychang.me`.

---

## P2 — Medium

### P2-1 `/cal/` disallow is dead weight

- `app/robots.ts:35` blocks `/cal/`; route has no dedicated page, so URL serves homepage HTML. Confusing.
- **Fix:** remove `"/cal/"` from `app/robots.ts:35`.

### P2-2 `/graph` indexable by default but not in sitemap

- `app/(graph)/graph/page.tsx` only sets a title; no `robots`, not in sitemap, page is heavy/interactive.
- **Fix:** add `robots: { index: false }` if intentional (it's a tool, not content), or include in sitemap. Also: `metadata.title` doubles via layout template — use `title: { absolute: "Knowledge Graph | Harry Chang" }`.

### P2-3 `app/sitemap.ts` `isLab` branch is dead code

- The lab subdomain is served by `app/(lab)/lab/sitemap.ts`. The `isLab` branch in `app/sitemap.ts:23-38` is never reached and disagrees with the real one (lists `/waitlist` which the real sitemap omits).
- **Fix:** delete the `isLab` branch.

### P2-4 Lab subdomain has 0 indexed pages

- Lab sitemap correctly served but only contains the homepage. Submit `https://lab.harrychang.me/sitemap.xml` to Search Console as a separate property.

### P2-5 Add `x-default` hreflang

- No page emits `x-default`. Add `'x-default': baseUrl` to every `alternates.languages` map.

### P2-6 Single-source orphans (low resilience)

- `/readme` — only linked from `footer.tsx:57`. Add to `links-page-client.tsx`.
- `/manifesto` — in footer + typography body, missing from `links-page-client.tsx`.
- `/discord, /telegram, /medium, /uses, /paper-reading` — commented out of header mobile staggered menu (`header.tsx:410, 413, 415, 424, 425`). Uncomment to surface mobile crawl paths.

### P2-7 Lab subdomain missing `alternates.languages`

- `app/(lab)/lab/layout.tsx:15-17` canonical only. Add `alternates.languages: { 'x-default': 'https://lab.harrychang.me', en: 'https://lab.harrychang.me' }`.

### P2-8 `/lab/waitlist` link from lab home

- Verify `app/(lab)/lab/page.tsx` links to `/waitlist`; if not, add.

---

## Files to touch (consolidated)

| File                                                                                       | Findings                                                                                 |
| ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| `apps/harrychang-me/app/layout.tsx`                                                        | P0-4 (hoist Person/WebSite), P0-2 (drop ?lang= alternate), P1-1 (lang), P1-2 (canonical) |
| `apps/harrychang-me/app/(main)/layout.tsx`                                                 | P0-4 (delete duplicate Person), P0-5, P1-2, P1-6                                         |
| `apps/harrychang-me/app/(main)/page.tsx`                                                   | P0-1 (SSR bailout), P0-2, P0-5 (add ProfilePage), P1-2, P1-8                             |
| `apps/harrychang-me/app/(main)/linktree/page.tsx`                                          | P0-7 (title.absolute)                                                                    |
| `apps/harrychang-me/app/(main)/{manifesto,uses,paper-reading,design,cv}/{layout,page}.tsx` | P0-6                                                                                     |
| `apps/harrychang-me/app/(main)/blog/[slug]/page.tsx`                                       | P0-2, P1-3, P1-4, P1-5                                                                   |
| `apps/harrychang-me/app/(main)/projects/[slug]/page.tsx`                                   | P0-2, P1-3, P1-5                                                                         |
| `apps/harrychang-me/app/(main)/gallery/[slug]/page.tsx`                                    | P0-2, P1-3, P1-5, P1-7                                                                   |
| `apps/harrychang-me/app/(main)/{blog,projects,gallery}/page.tsx`                           | P0-2, P1-6                                                                               |
| `apps/harrychang-me/app/sitemap.ts`                                                        | P0-2, P0-3, P2-3                                                                         |
| `apps/harrychang-me/app/robots.ts`                                                         | P2-1                                                                                     |
| `apps/harrychang-me/app/(graph)/graph/page.tsx`                                            | P2-2                                                                                     |
| `apps/harrychang-me/app/(lab)/lab/layout.tsx`                                              | P1-8, P2-7                                                                               |
| `apps/harrychang-me/components/footer.tsx`                                                 | P1-9, P1-10                                                                              |
| `apps/harrychang-me/components/header.tsx`                                                 | P2-6                                                                                     |
| `apps/harrychang-me/components/main/links-page-client.tsx`                                 | P2-6                                                                                     |
| `packages/lib/lib/markdown.ts`                                                             | P0-3                                                                                     |
| `apps/harrychang-me/content/posts/{9_m11d,10-lego-mount,11-portfolio,12-us-trip}.md`       | P0-3 (rename)                                                                            |

---

## Recommended PR scope (safe, schema/structural only)

**Ship in PR #1 (low-risk, no visible changes):**

- P0-2 hreflang reconciliation (drop `?lang=` alternates; add `_zh-tw` sitemap entries; reciprocal alternates; `x-default`)
- P0-3 sitemap stale slugs (rename or filter — pick one)
- P0-4 hoist Person/WebSite to root layout + complete `sameAs[]`
- P0-5 add `ProfilePage` JSON-LD to `/`
- P0-7 linktree title absolute
- P1-2 canonical de-duplication
- P1-3 `@id` host import from siteConfig
- P1-4 zh-TW title suffix
- P1-5 description fallback
- P1-7 gallery breadcrumb position-1 name (schema-only)
- P1-8 description trim
- P1-9 footer add `/linktree`
- P1-10 footer remove `/icarus`
- P2-1, P2-2, P2-3, P2-5, P2-7

**Defer (need separate decisions):**

- **P0-1 SSR bailout** — root cause but architectural; needs investigation of which client component triggers CSR. Separate PR.
- **P0-6 noindex removal** — needs your confirmation per page (is `/cv` truly public? `/design` an internal style guide?).
- **P1-1 dynamic `<html lang>`** — depends on P0-1 + middleware change.
- **P2-6 uncomment mobile menu socials** — visible UI change; out of scope per "no visible content" rule.
- **P2-8 lab/waitlist link** — visible UI change.

---

# Addendum — Google Search Console findings (2026-04-29)

Live data from GSC overrides several assumptions in the report above. The `site:` operator was misleading; ground truth is below.

## Coverage reality

| Metric        | Assumed (from `site:`) | Actual (GSC)                       |
| ------------- | ---------------------- | ---------------------------------- |
| Indexed pages | 2                      | **56**                             |
| Total known   | ~60                    | 201 (56 indexed + 145 not indexed) |

Not-indexed reasons:

- **113 "Crawled — currently not indexed"** — 95%+ are Next.js `_next/static/css/*.css?dpl=…` asset URLs from deployment churn (noise, ignore). Real-page subset: `/blog/2025_12_22_aftersun_paris_texas`, `/projects/2025_10_12_fortress`, `/projects/.../proj_zephyr?lang=zh-TW`, `/projects/.../portfolio?lang=zh-TW`, `/gallery/.../city_stroll?lang=zh-TW`, `/projects/.../classics_reimagined?lang=zh-TW`, `/issues` (route doesn't exist — broken inbound link somewhere), and trailing-slash variants of project URLs.
- **16 "Page with redirect"** — mostly trailing-slash variants (`/gallery/2024_01_06_hehuanshan/` → `/gallery/2024_01_06_hehuanshan`) and the social redirect routes (`/spotify`, `/github`, `/instagram`). All intentional/expected.
- **8 "Excluded by 'noindex' tag"** — `/telegram, /design, /uses, /manifesto, /letterboxd, /paper-reading, /cv, lab.harrychang.me/`. Confirms P0-6. **`lab.harrychang.me/` being noindex was not in the original audit** — likely unintentional; lab homepage is the entire lab subdomain's entry.
- **5 "Not found (404)"** — 3 stale Next.js CSS asset URLs (deployment churn) + `/&` and `/$` (malformed external links / scrapers). No action.
- **2 "Alternate page with proper canonical tag"** — Google correctly clustered. No action.
- **1 "Redirect error"** — investigate via GSC if it persists.

## Performance / brand query reality

Last 90 days: **35 clicks, 842 impressions, avg position 10.6**.

Top queries:

| Query                                       | Clicks | Impressions | CTR   | Position |
| ------------------------------------------- | ------ | ----------- | ----- | -------- |
| **張祺煒**                                  | 14     | 113         | 12.4% | **11.6** |
| tixcraft discord                            | 1      | 14          | 7.1%  | 9.7      |
| fujifilm x-pro1                             | 1      | 1           | 100%  | 46.0     |
| "struggle itself toward the heights" thesis | 0      | 28          | 0%    | 7.9      |

**"Harry Chang" is not in the top 23 queries** — the global namesake namespace is too crowded; nobody finds the site that way. The actual brand query is **張祺煒**.

For "張祺煒", the ranking pages are:

| Rank                   | Page                                      | Clicks | Impressions | Position |
| ---------------------- | ----------------------------------------- | ------ | ----------- | -------- |
| 1                      | **`/design`**                             | 8      | 56          | 9.0      |
| 2                      | `/projects/2024_10_04_proj_zephyr_zh-tw`  | 3      | 31          | 10.5     |
| 3                      | `/gallery/2023_10_06_guided_by_the_tides` | 2      | 12          | 25.2     |
| 4                      | `/projects/2024_10_09_vrc_2813b_nova`     | 1      | 1           | 10.0     |
| ... (15 more subpages) |                                           |        |             |          |

**`/` (homepage) does not appear at all in the brand-query ranking.** Empirically confirms P0-1 (homepage SSR bailout — Google indexed it but has no name content to rank).

`/design` ranks #1 for the brand query — and is currently `noindex` in code (P0-6). It will drop out of the index on the next crawl. **Removing the noindex from `/design` is now a P0 emergency, not a P0 cleanup.**

## Indexed-pages discoveries

**`?lang=zh-TW` URLs are indexed as duplicates.** Confirmed in the indexed-pages list:

- `/blog?lang=zh-TW`
- `/projects?lang=zh-TW`
- `/gallery/2023_10_06_against_giants?lang=zh-TW`
- `/gallery/2024_04_06_city_of_tears?lang=zh-TW`
- `/gallery/2024_02_09_mortal_sparks?lang=zh-TW`
- `/gallery/2023_10_06_guided_by_the_tides?lang=zh-TW`
- `/gallery/2023_12_30_against_the_unknown?lang=zh-TW`

Each serves byte-identical EN HTML to its base URL but Google indexed them anyway because the hreflang block told it to. **This is index bloat / duplicate content — Google is splitting ranking signals across two URLs per page.** Strengthens P0-2 from "wasted hreflang" to "active duplicate content harm."

**Legacy slugs are indexed and earning clicks.** `/blog/12-us-trip`, `/blog/9_m11d`, `/blog/9_m11d_zh-tw`, `/blog/11-portfolio`, `/gallery/2026-us-trip` all indexed despite violating the date-prefix convention. **Renaming them would 404 the existing index entries.** Switch P0-3 fix to **filter** (not rename) — leave the legacy URLs in place, just exclude them from sitemap if they're causing confusion. Or: leave them entirely; they're not harming anything.

**`/graph` is indexed and crawled regularly.** The audit suggested noindex'ing it. Reverse: leave it indexed.

## Revised PR scope (post-GSC)

**Promoted to P0 emergency:**

- **Remove `noindex` from `/design`** — currently the #1 ranking page for the brand query 張祺煒; will drop out of the index on next crawl. Same for `/manifesto`, `/uses`, `/paper-reading` (real content with unique titles).
- **Remove `noindex` from `lab.harrychang.me/`** (lab subdomain root) unless intentional.
- **Reconcile hreflang strategy (P0-2)** — `?lang=zh-TW` duplicates are actively in the index splitting signals.

**Demoted/removed from PR:**

- ~~P0-3 stale slug rename~~ — these slugs are indexed and getting impressions. Leave alone or filter from sitemap only.
- ~~P2-2 `/graph` noindex~~ — page is indexed and working; leave alone.

**Confirmed-still-needed:**

- P0-1 SSR bailout fix (separate PR; biggest single lever for brand query — moves `/` from invisible to ranking).
- P0-4 hoist Person/WebSite + complete `sameAs[]`.
- P0-5 ProfilePage on `/`.
- P0-7 linktree title bug.
- P1-2 canonical de-duplication.
- P1-3 `@id` host import.
- P1-4 zh-TW title localization.
- P1-5 description fallback.
- P1-7 gallery breadcrumb position-1 name (helps anchor 張祺煒 ↔ `/`).
- P1-9 add `/linktree` to footer.
- P1-10 remove dead `/icarus` link.

**New finding (not in original audit):**

- **`/issues` returns 404 but Google has crawled it** → there's a broken inbound link somewhere (header/footer/typography body). Grep for `href="/issues"` and either remove the link or create the page.

## Submit-after-PR checklist

1. Use GSC URL Inspection → Request Indexing for: `/`, `/design`, `/manifesto`, `/uses`, `/paper-reading`, `/cv`, `lab.harrychang.me/`.
2. Resubmit `https://harrychang.me/sitemap.xml` after sitemap fixes ship.
3. Submit `https://lab.harrychang.me/sitemap.xml` as a separate property if not already.
4. Watch the "Page with redirect" and "Crawled — not indexed" buckets shrink as `?lang=zh-TW` and trailing-slash duplicates drop out.
