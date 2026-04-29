# Content Audit Report

Audit run on 2026-04-29 across `apps/harrychang-me/content/{projects,gallery,posts,papers}/` and `apps/emilychang-me/content/`.

This report covers items that **were not auto-fixed** and need human judgment. Structural fixes that were applied land in the same branch as separate commits — see git log.

---

## 1. Dead external links — flagged, NOT auto-replaced

73 unique external URLs found; 41 fetched, 11 unverifiable (YouTube/Drive/Reddit/social — block fetchers), 21 deduped. **Zero hard-dead (4xx/5xx/timeout).**

### Soft issues worth attention

| URL | Status | Files |
|---|---|---|
| `https://genaistars.org.tw/news/35` | 200 but page body says 「抱歉，本篇內容已被刪除或暫時無法觀看」 | `content/projects/2024_09_23_chingshin_rag.md:20`, `..._zh-tw.md:20` |
| `https://www.opentix.life/event/1783033841754939392` | 200 but listing taken down 「本節目已下架」 | `content/projects/2025_03_18_boundless_voices.md:47`, `..._zh-tw.md:48` |
| `https://www.youtube.com/watch` (no `?v=`) | Authoring mistake | `content/posts/2025_12_19_xpro1_zh-tw.md:14` — English sibling correctly links `?v=NT0Xsntv-XI` |
| `https://eu.jellycat.com/jubjub-yonnie/` | 403 to fetcher (anti-scrape; almost certainly fine in browser) | `content/posts/2026_01_10_plushies.md:81`, `..._zh-tw.md:81` |

### Unverifiable (no action — manual check if curious)

8 unique YouTube URLs, 5 Google Drive URLs, 1 Reddit URL across various posts/projects. Fetchers can't authenticate against these; assume live unless reported otherwise.

---

## 2. Broken image refs — clean

566 image references verified (93 frontmatter `imageUrl`, 218 gallery URLs, 241 body images, 14 mp4). **Zero broken.**

### Note: URL-encoded paths and CLS

`apps/harrychang-me/content/projects/2024_08_19_classics_reimagined.md` (and zh-tw sibling) embed paths with `%20` (URL-encoded spaces). Files render in the browser, but `getDimsFromWebPath()` in `packages/lib/lib/markdown.ts:122` does `fs.existsSync` on the raw `%20` path, which fails on disk (filenames have literal spaces). Result: server can't detect dimensions → potential CLS. Two options:

- Decode the path before disk lookup (one-line fix in `markdown.ts`).
- Re-author the markdown with literal spaces or rename files to use hyphens.

Out of scope for this audit-fix PR.

---

## 3. Orphan assets

### Deleted in this PR (5 stub folders + DS_Store files)

All under `apps/emilychang-me/public/images/`. Each contained a single 0-byte `cover.jpg` and the slug folder name appeared **nowhere** in the repo:

- `public/images/projects/botanical-branding/`
- `public/images/projects/ceramic-collection/`
- `public/images/projects/editorial-layout/`
- `public/images/gallery/urban-sketches/`
- `public/images/gallery/watercolor-studies/`

All `.DS_Store` files under both apps' `public/images/` were also removed.

### NOT deleted — flagged for your review

- `apps/emilychang-me/public/images/headshot.jpg` (216 KB) — zero references found in code or content.
- `apps/emilychang-me/public/images/landyard_texture.png` (868 KB) — only the `.webp` variant is referenced. May be a build-time source for the optimized image; verify before removing.

### Note: empty optimized parents

`apps/emilychang-me/public/images/optimized/{projects,gallery}/` are empty (no contents). Likely consequence of emily's content stubs using `/placeholder.webp`. Leaving as-is.

---

## 4. Frontmatter drift

### Code/content schema mismatch — NOT a content fix

`packages/lib/lib/markdown.ts:168-188` declares `quote` as required on `GalleryItemMetadata`. **No** gallery file (38/38 in harrychang-me) sets `quote`, and all set `description: ""`. The schema is stale, not the content. The gallery template uses `camera`/`lens`/`location`/`tags` instead. Recommended fix (separate PR):

```ts
// packages/lib/lib/markdown.ts
export interface GalleryItemMetadata {
  slug: string;
  title: string;
  description?: string;  // make optional
  imageUrl: string;
  quote?: string;        // make optional or remove
  date: string;
  // ...
}
```

### Cross-app schema divergence — looks intentional

`apps/emilychang-me/content/gallery/{urban-sketches,watercolor-studies}.md` use project-shaped fields (`category`, `year`) rather than gallery-shaped (photography metadata). Likely intentional — emily's gallery is drawings/sketches, a different medium. Not flagged as drift to fix, but worth confirming the rendering is correct.

### Single content fix candidate (not applied)

`content/posts/2025_12_12_blog_launch.md` and zh-tw sibling have `description: ""`. Possibly intentional (post is short); not auto-filled.

### Clean

- Dates: all 93 files parse as `YYYY-MM-DD`.
- Locale suffixes: all lowercase `_zh-tw`, no `_zh-TW`.
- Tag spellings: no near-duplicate clusters.
- `pinned`: all numeric, no legacy booleans.
- ZH-TW pairs: every translation has a base file (no orphan translations).

### Informational (not drift)

8 posts use legacy filename forms (`9_m11d`, `10-lego-mount`, `11-portfolio`, `12-us-trip` × {base, zh-tw}). Internal `date` frontmatter is valid; renaming would change canonical URLs, so leave alone.

---

## 5. Hardcoded fully-qualified URLs

### Markdown — fixed in this PR (17 links across 6 files)

Converted self-referential `https://harrychang.me/...` URLs to relative paths so Next.js client router can intercept them. Changed files:

- `content/posts/2025_12_12_blog_launch.md` + zh-tw
- `content/posts/2025_12_24_ntu_cs_special_admission.md`
- `content/projects/2025_04_12_portfolio.md` + zh-tw (6 each)
- `content/projects/2025_01_03_powerplay.md` + zh-tw

No cross-subdomain (lab.harrychang.me) self-links in markdown — nothing to flag for retention.

No fully-qualified `imageUrl` in frontmatter — clean.

### Code — lower-priority dedup candidates (NOT fixed)

Many absolute URLs in code are legitimate (metadataBase, canonical, OG tags, JSON-LD, sitemap, robots, hreflang). Two clear dedup candidates:

- `apps/harrychang-me/components/header.tsx:395` — `useState("https://lab.harrychang.me")` should use `siteConfig.labUrl`.
- `apps/emilychang-me/app/(main)/canvas/[slug]/page.tsx:9` and `projects/[slug]/page.tsx:9` — `const baseUrl = "https://www.emilychang.me"` duplicates `siteConfig.url`.

The rest (sitemap.ts, robots.ts, layout.tsx OG image URLs, JSON-LD `@id`) appear in template positions where absolute URLs are required. Leave alone unless re-auditing.

---

## Summary

- **Auto-applied**: 17 markdown URL conversions; deleted 5 empty emily image-folder stubs + DS_Store files. **2 commits** on this branch.
- **Flagged for human review** (this report): 4 soft-dead links, 1 authoring mistake (broken YT URL), 2 stray asset files, schema-vs-content gallery mismatch, 2 code dedup candidates, CLS path-encoding note.
- **Verified clean**: image refs (566 verified), date formats, locale suffixes, tag spellings, pinned types, zh-tw pairing.
