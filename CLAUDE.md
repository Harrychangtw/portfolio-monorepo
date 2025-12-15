# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo containing multiple Next.js 15 portfolio applications with a sophisticated dual-domain architecture, file-based markdown CMS, custom client-side i18n, and build-time image optimization.

**Tech stack:** Next.js 15 App Router, TypeScript, React 19, Tailwind CSS, Radix UI, Framer Motion, Prisma, PostgreSQL, pnpm, Turborepo

## Monorepo Structure

- `apps/harrychang-me` - Main Next.js app serving both `harrychang.me` (main site) and `lab.harrychang.me` (lab subdomain) from a single codebase
- `apps/emilychang-me` - Secondary Next.js portfolio app
- `packages/ui` - Shared React components (header, footer, gallery-card, project-card, blog-card, etc.)
- `packages/lib` - Shared hooks, utilities, Prisma client, and TypeScript types
- `packages/config` - Shared Tailwind and TypeScript configurations

## Common Development Commands

### Root-Level (Turborepo)
```bash
pnpm install              # Install all dependencies
pnpm build               # Build all apps and packages
pnpm dev                 # Start dev servers for all apps
pnpm lint                # Lint all packages
pnpm format              # Format code with Prettier
```

### Main App (harrychang-me)
Run from repository root using pnpm filters:
```bash
# Development
pnpm --filter harry-chang-portfolio dev           # Main site (:3000)
pnpm --filter harry-chang-portfolio dev:lab       # Lab site (:3001)

# Content
pnpm --filter harry-chang-portfolio optimize-images  # Generate WebP images

# Database (run from apps/harrychang-me/)
npx prisma generate        # Generate client
npx prisma migrate dev     # Run migrations locally
npx prisma migrate deploy  # Deploy migrations (production)

# Build
pnpm --filter harry-chang-portfolio build         # Production build
pnpm --filter harry-chang-portfolio build:analyze # Bundle analysis
pnpm --filter harry-chang-portfolio start         # Production server
```

**Build lifecycle:**
1. `postinstall` → runs `prisma generate`
2. `prebuild` → runs `prisma migrate deploy` + `node scripts/build-papers.mjs`
3. `build` → runs `next build`

## Critical Architecture Patterns

### Dual-Domain Architecture via Middleware

The harrychang-me app serves **two distinct applications** from one codebase using subdomain routing in `middleware.ts`:

- **Main domain** (`harrychang.me`) → routes in `app/(main)/`
- **Lab subdomain** (`lab.harrychang.me`) → routes in `app/(lab)/lab/`

**Middleware logic:**
- Detects subdomain via hostname inspection
- Rewrites `lab.harrychang.me/` → `/lab` internally
- Redirects `/lab` → `/` on main domain in production
- Allows direct `/lab` access on Vercel preview deployments
- Shared resources bypass rewriting (see `sharedPaths` array: `/api/`, `/images/`, `/locales/`)

**When adding routes:**
- Main site: `app/(main)/[route]/page.tsx`
- Lab features: `app/(lab)/lab/[route]/page.tsx`
- API routes: `app/api/[route]/route.ts` (shared across both domains)

### Custom Client-Side i18n System

**No server-side i18n.** Translation is entirely client-side via `contexts/LanguageContext.tsx`:

**How it works:**
- Detects language from `localStorage` or browser on mount
- Fetches JSON from `/public/locales/{lang}/{namespace}.json`
- Provides `t(key, namespace)`, `tHtml(key)`, `getTranslationData(key)` functions
- Uses visibility gating to prevent FOUC

**Usage:**
```tsx
const { t, tHtml, language, setLanguage } = useLanguage()
const text = t('projects.title', 'common')  // namespace defaults to 'common'
```

**Adding translations:**
1. Add keys to both `/public/locales/en/[namespace].json` and `/public/locales/zh-TW/[namespace].json`
2. If new namespace, update `loadTranslations()` in `LanguageContext.tsx`

### File-Based CMS with Markdown

Content stored in `content/` directory:
- Projects: `content/projects/[slug].md` or `[slug]_zh-tw.md`
- Gallery: `content/gallery/[slug].md` or `[slug]_zh-tw.md`
- Blog Posts: `content/posts/YYYY_MM_DD_[slug].md` or `YYYY_MM_DD_[slug]_zh-tw.md`
- Papers: Auto-fetched from arXiv via `scripts/build-papers.mjs` (runs in prebuild)

**Locale handling:**
- English: Files without suffix (e.g., `project.md`)
- Chinese: Files with `_zh-tw.md` suffix (MUST be lowercase, not `_zh-TW.md`)
- If Chinese version exists, shown for `zh-TW` locale; otherwise fallback to English

**Core functions in `lib/markdown.ts`:**
- `getAllProjectsMetadata(locale)` / `getAllGalleryMetadata(locale)` / `getAllPostsMetadata(locale)` - Lists all items, filtered by locale
- `getProjectData(slug)` / `getGalleryItemData(slug)` / `getPostData(slug)` - Fetches single item with HTML
- `getLatestPosts(locale, count)` - Gets most recent posts for homepage
- `getNextPost(currentSlug)` - Gets next post for navigation (wraps to first)
- Sorting: Pinned items first (numeric `pinned: 1` = highest priority), then by `date` DESC

**Frontmatter schemas:**

*Projects/Gallery:*
```yaml
---
title: "Project Title"
category: "Design"  # Only for projects
description: "Brief description"
imageUrl: "/images/projects/slug/image.jpg"  # Auto-converted to optimized WebP
date: "2024-01-15"
year: "2024"
pinned: 1      # 1 = highest priority, -1 = not pinned
locked: false  # Hide from public
featured: true
---
```

*Blog Posts:*
```yaml
---
title: "Post Title"
description: "Brief description"
imageUrl: "images/optimized/blogs/YYYY_MM_DD_slug/titlecard.webp"
date: "2024-01-15"
author: "Harry Chang"  # Optional, defaults to "Harry Chang"
tags: ["Tag1", "Tag2"]  # Optional, no category field
pinned: -1      # -1 = not pinned, 1+ = pinned
locked: false   # Optional
featured: true  # Optional
---
```

### Image Optimization Pipeline

**Two-stage approach:**

**1. Build-time optimization** (`scripts/optimize-images.js`):
- Converts JPG/PNG → WebP with responsive sizes (2000-3840px depending on image type)
- Generates 20px blur thumbnails for progressive loading
- Outputs to `/public/images/optimized/[projects|gallery|blogs]/`
- Naming: `image.webp` (full) + `image-thumb.webp` (thumbnail)

**Blog image sizes:**
- Title cards (contains "titlecard"): 3840px, quality 95
- Hero images (contains "hero"): 2000px, quality 95
- Portrait (height > width): 1200×1800px, quality 90
- Landscape (default): 2000×1200px, quality 90

**2. Runtime URL transformation** (`lib/markdown.ts`):
- `getThumbnailPath()` - Adds `-thumb.webp` suffix for cards
- `getFullResolutionPath()` - Removes `-thumb` for detail views
- `getDimsFromWebPath()` - Reads actual dimensions to prevent CLS

**Workflow for adding images:**
1. Place originals in `/public/images/[projects|gallery|blogs]/[slug]/`
2. Run `pnpm --filter harry-chang-portfolio optimize-images`
3. Reference in markdown:
   - Projects/Gallery: `/images/projects/slug/image.jpg` (auto-converted to optimized WebP at runtime)
   - Blog: `images/optimized/blogs/YYYY_MM_DD_slug/image.webp` (use optimized path directly)

**Image Aspect Ratio Specifications:**

All images are optimized via the same optimization script, but are displayed with different aspect ratios based on context:

**Title/Thumbnail Cards:**
- **Project cards:** 3:2 aspect ratio (1.5) by design
- **Gallery cards:** Variable aspect ratios (4:5 or 5:4) with white framelines to contain photos of varying aspect ratios
- **Blog cards:** 3:2 aspect ratio (1.5) matching projects

**Detail Pages (Slug Routes):**

*Mobile (both projects and gallery):*
- Images scale to full width
- Gallery images include framelines
- Projects have no framelines

*Desktop:*
- **Project pages:** All images are horizontal and scale to full width with no framelines
- **Gallery pages:** Images (both portrait and landscape) are contained in 3:2 aspect ratio boxes with white framelines to handle varying aspect ratios consistently

### Blog Posts

**Available on main domain only** (`harrychang.me/blog`), not on lab subdomain.

**Content structure:**
- Files in `content/posts/` with **date prefix**: `YYYY_MM_DD_slug.md` or `YYYY_MM_DD_slug_zh-tw.md`
- Locale detection from slug suffix (same pattern as projects/gallery)
- Images in `public/images/blogs/YYYY_MM_DD_slug/`

**Key differences from projects/gallery:**
- Uses `tags` array instead of `category` field
- Has optional `author` field (defaults to "Harry Chang")
- Date prefix required in filename for chronological organization
- Image paths reference optimized directory directly
- 3:2 aspect ratio cards matching projects
- Navigation uses `getNextPost()` with wrap-around to first post

**Blog components:**
- `BlogCard` - Card for grid display with date (MM.DD) and tags
- `BlogPageClient` - Main listing page with 3-column grid
- `BlogPostClient` - Detail page with ToC and "Next Up" navigation
- `BlogSection` - Homepage section showing latest 6 posts (lazy loaded)

**Routes:**
- Listing: `app/(main)/blog/page.tsx`
- Detail: `app/(main)/blog/[slug]/page.tsx` (includes Schema.org BlogPosting structured data)
- API: `app/api/posts/route.ts` and `app/api/posts/[slug]/route.ts`

### API Routes Pattern

All API routes accept `?locale=en` or `?locale=zh-TW` query param:
```typescript
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const projects = getAllProjectsMetadata(locale)
  return NextResponse.json(projects)
}
```

**Available endpoints:**
- `GET /api/projects?locale=en` - All projects
- `GET /api/projects/[slug]` - Single project
- `GET /api/gallery?locale=en` - All gallery items
- `GET /api/gallery/[slug]` - Single gallery item
- `GET /api/posts?locale=en` - All blog posts
- `GET /api/posts/[slug]` - Single blog post
- `GET /api/papers` - Research papers (from arXiv)

## Database

PostgreSQL via Vercel Postgres with Prisma:
- Schema: `apps/harrychang-me/prisma/schema.prisma`
- Client: Shared via `packages/lib/lib/prisma.ts`
- Models: `WaitlistEntry` (lab waitlist), `EmailCampaign`

## Key Files

- `apps/harrychang-me/middleware.ts` - Dual-domain routing logic
- `apps/harrychang-me/lib/markdown.ts` - Content fetching, image processing (900+ lines)
- `apps/harrychang-me/contexts/LanguageContext.tsx` - i18n system
- `apps/harrychang-me/scripts/optimize-images.js` - Image optimization pipeline (projects, gallery, blogs)
- `apps/harrychang-me/scripts/build-papers.mjs` - arXiv paper fetching
- `apps/harrychang-me/app/(main)/blog/` - Blog listing and detail pages
- `apps/harrychang-me/app/api/posts/` - Blog API routes
- `packages/ui/` - Shared UI components (blog-card, blog-page-client, blog-post-client, blog-section)
- `packages/lib/` - Shared hooks, utilities, Prisma client

## Critical Conventions

**Component patterns:**
- Server components by default - only add `"use client"` for interactivity, hooks, or context
- Framer Motion for animations (requires `"use client"`)
- Custom hooks in `packages/lib/hooks/`

**Styling:**
- Dark mode only, Tailwind CSS with custom HSL variables in `app/globals.css`
- Radix UI for complex components
- Custom typography plugin config for markdown content

**Locale suffixes:**
- MUST be `_zh-tw.md` (lowercase), not `_zh-TW.md`

**Pinned sorting:**
- Use numeric `pinned: 1` (highest priority), not boolean

**Middleware shared paths:**
- API routes, images, and locales must be in `sharedPaths` array to bypass domain rewriting

## Common Pitfalls

1. **Never use server-side i18n** - All translation is client-only via `LanguageContext`
2. **Image paths must go through optimization** - Always run `optimize-images` after adding images
3. **Locale suffix must be exact** - Use `_zh-tw.md`, not `_zh-TW.md` or `_zh.md`
4. **Middleware affects all routes** - Shared resources must be explicitly listed in `sharedPaths`
5. **Pinned sorting is numeric** - Use `pinned: 1` (highest) to `pinned: 10`, not `pinned: true`
6. **LanguageProvider must wrap client components** - Cannot wrap server components
7. **Video embeds require specific markdown syntax** - YouTube/Google Drive links auto-transformed
8. **Blog filenames must have date prefix** - Use `YYYY_MM_DD_slug.md`, not just `slug.md`
9. **Blog images use different path pattern** - Reference `images/optimized/blogs/...` directly in frontmatter and markdown
10. **Blog uses tags, not category** - Projects have `category: "Design"`, blog posts have `tags: ["Tag1"]`

## Examples: Adding Content

### Adding a Project

1. Create `content/projects/my-project.md` with frontmatter (see schema above)
2. Add images to `public/images/projects/my-project/`
3. Run `pnpm --filter harry-chang-portfolio optimize-images`
4. Commit and push (build will regenerate static props)

### Adding a Blog Post

1. Create markdown files with date prefix:
   - `content/posts/2025_01_15_my_post.md` (English)
   - `content/posts/2025_01_15_my_post_zh-tw.md` (Chinese, optional)

2. Add frontmatter (see blog schema above)

3. Add images to `public/images/blogs/2025_01_15_my_post/`:
   - `titlecard.jpg` (required for card thumbnail)
   - `hero.jpg` (optional hero image)
   - Other content images

4. Run `pnpm --filter harry-chang-portfolio optimize-images`

5. Reference optimized images in markdown:
   ```markdown
   imageUrl: "images/optimized/blogs/2025_01_15_my_post/titlecard.webp"

   ![framed:](images/optimized/blogs/2025_01_15_my_post/image1.webp)
   ```

6. Commit and push (static routes auto-generated via `generateStaticParams()`)
