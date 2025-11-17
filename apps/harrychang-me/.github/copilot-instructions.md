# GitHub Copilot Instructions for Portfolio Site

## Project Overview

This is a Next.js 15 portfolio site featuring a **dual-domain architecture** (`harrychang.me` + `lab.harrychang.me`), file-based CMS using markdown, custom i18n implementation, and advanced image optimization. It uses TypeScript, App Router, Radix UI, Tailwind CSS, Framer Motion, and Prisma.

## Critical Architecture Patterns

### 1. Dual-Domain Routing via Middleware

The site serves **two distinct apps** from a single codebase:
- **Main domain** (`harrychang.me`): Content in `app/(main)/`
- **Lab subdomain** (`lab.harrychang.me`): Experimental features in `app/(lab)/lab/`

**Middleware logic** (`middleware.ts`):
- Detects subdomain via hostname inspection
- Rewrites `/` → `/lab` for lab subdomain (excluding shared assets like `/api/`, `/images/`, `/locales/`)
- Redirects `/lab` → `/` on main domain in production
- Allows direct `/lab` access on Vercel preview deployments for testing

**When adding routes:**
- Main site routes go in `app/(main)/[route]/`
- Lab routes go in `app/(lab)/lab/[route]/`
- API routes in `app/api/` are shared across both domains

### 2. Custom Client-Side i18n System

**No next-i18next at runtime** - this project uses a custom React Context pattern:

**Implementation** (`contexts/LanguageContext.tsx`):
- Detects language from `localStorage` or browser on mount
- Fetches JSON translation files from `/public/locales/{lang}/{namespace}.json`
- Provides `t(key, namespace)`, `tHtml(key)`, and `getTranslationData(key)` functions
- Uses visibility gating to prevent FOUC (flash of untranslated content)
- Namespaces: `common`, `about`, `updates`, `uses`

**Translation file structure:**
```json
{
  "key": "value",
  "nested": {
    "key": "value"
  }
}
```

**Usage in components:**
```tsx
const { t, tHtml, language, setLanguage } = useLanguage()
const text = t('projects.title', 'common') // namespace defaults to 'common'
const htmlContent = tHtml('about.bio') // Parses HTML and returns React nodes
```

**For new translations:**
1. Add keys to both `/public/locales/en/[namespace].json` and `/public/locales/zh-TW/[namespace].json`
2. Use `t()` for plain text, `tHtml()` for content with links
3. Never show raw translation keys - return empty string if loading

### 3. Markdown-Based Content System

**Content architecture:**
- Projects: `content/projects/[slug].md` or `[slug]_zh-tw.md`
- Gallery: `content/gallery/[slug].md` or `[slug]_zh-tw.md`
- Papers: Auto-fetched from arXiv via `scripts/build-papers.mjs` (runs in `prebuild`)

**Metadata handling** (`lib/markdown.ts`):
- `getAllProjectsMetadata(locale)` / `getAllGalleryMetadata(locale)` - Lists all items, filtered by locale
- `getProjectData(slug)` / `getGalleryItemData(slug)` - Fetches single item with HTML content
- Sorting: Pinned items first (numeric `pinned` field, lower = higher priority), then by `date` DESC
- Image URL processing: Converts to `/images/optimized/` paths and adds `-thumb.webp` suffix for cards

**Frontmatter schema:**
```yaml
---
title: "Project Title"
category: "Design"
description: "Brief description"
imageUrl: "/images/projects/slug/image.jpg"  # Auto-converted to optimized WebP
date: "2024-01-15"
year: "2024"
pinned: 1  # 1 = highest priority, -1 = not pinned
locked: false  # Hide from public
featured: true
---
```

**Locale handling:**
- English: Files without suffix (e.g., `project.md`)
- Chinese: Files with `_zh-tw.md` suffix (e.g., `project_zh-tw.md`)
- If Chinese version exists, it's shown for `zh-TW` locale; otherwise fallback to English

### 4. Image Optimization Pipeline

**Two-stage approach:**

**Build-time optimization** (`scripts/optimize-images.js`):
- Converts JPG/PNG → WebP
- Generates responsive sizes (2000-3840px depending on type)
- Creates 20px blur thumbnails for progressive loading
- Outputs to `/public/images/optimized/[projects|gallery]/`
- Naming: `image.webp` (full) + `image-thumb.webp` (thumbnail)

**Runtime URL transformation** (`lib/markdown.ts`):
- `getThumbnailPath()`: Converts to optimized + adds `-thumb.webp` suffix (for cards)
- `getFullResolutionPath()`: Converts to optimized + removes `-thumb` (for detail views)
- `getDimsFromWebPath()`: Reads actual dimensions from disk to prevent CLS (Cumulative Layout Shift)

**Image quality tiers:**
- Title images/first in collection: 3200-3840px, 98% quality
- Hero images: 2560px, 95% quality
- Standard landscape: 2000-2560px, 90% quality
- Thumbnails: 20px, 60% quality, with blur

**When adding images:**
1. Place originals in `/public/images/[projects|gallery]/[slug]/`
2. Run `npm run optimize-images`
3. Reference in markdown: `/images/projects/slug/image.jpg` (auto-converted to optimized WebP)

### 5. API Route Patterns

**All API routes follow this structure:**
```typescript
// app/api/projects/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const projects = getAllProjectsMetadata(locale)
  return NextResponse.json(projects)
}
```

**Locale-aware routes:**
- Accept `?locale=en` or `?locale=zh-TW` query param
- Call markdown functions with locale parameter
- Return filtered/localized data

### 6. Styling & UI Conventions

**Design system:**
- Dark mode only (`dark` class on `<html>`)
- Primary font: IBM Plex Sans (body), Space Grotesk (headings)
- Custom CSS variables in `app/globals.css` (HSL-based color system)
- Radix UI for complex components (dialogs, dropdowns, etc.)
- Tailwind utilities for layout/spacing
- Custom Tailwind typography plugin config in `tailwind.config.ts`

**Component patterns:**
- Server components by default (no `"use client"` unless needed)
- Client components only for: hooks, context, browser APIs, interactivity
- Framer Motion for animations (requires `"use client"`)
- Custom hooks in `/hooks/` (e.g., `use-mobile.tsx`, `use-intersection-observer.ts`)

**Link handling:**
- External links in markdown get `*` suffix via Tailwind typography config
- Custom video embed transformation for YouTube/Google Drive links in markdown

### 7. Database & Environment

**Prisma setup** (`prisma/schema.prisma`):
- PostgreSQL via Vercel Postgres
- `WaitlistEntry` model for lab subdomain waitlist
- `EmailCampaign` model for marketing (future use)

**Environment variables required:**
```bash
DATABASE_POSTGRES_URL        # Vercel Postgres connection string (runtime)
DATABASE_PRISMA_DATABASE_URL # Direct connection for migrations
SPOTIFY_CLIENT_ID            # For now-playing widget
SPOTIFY_CLIENT_SECRET
SPOTIFY_REFRESH_TOKEN
```

**Database workflow:**
1. `prisma generate` runs in `postinstall`
2. `prisma migrate deploy` runs in `prebuild` (production)
3. Local development: `npx prisma migrate dev`

## Development Workflows

### Starting Development
```bash
npm install           # Installs deps + runs prisma generate
npm run dev           # Starts main site on :3000
npm run dev:lab       # Starts lab site on :3001 with NEXT_PUBLIC_IS_STUDIO=true
```

### Content Management
```bash
# 1. Add markdown file to content/projects/ or content/gallery/
# 2. Add images to public/images/[projects|gallery]/[slug]/
npm run optimize-images  # Generates optimized WebP variants
# 3. Commit changes - build will regenerate static props
```

### Testing
```bash
npm run test          # Vitest (single run)
npm run test:watch    # Watch mode
npm run test:ui       # Vitest UI
npm run test:coverage # Coverage report
```

**Test setup** (`vitest.config.ts`):
- Uses `happy-dom` environment
- Setup file: `test/setup.tsx`
- Includes React Testing Library
- Tests in `**/*.{test,spec}.{ts,tsx}` files

### Building & Deployment
```bash
npm run build         # Runs prebuild (prisma migrate + build-papers) → next build
npm run start         # Production server
npm run build:analyze # Bundle analysis with ANALYZE=true
```

**Build order (package.json):**
1. `postinstall`: `prisma generate`
2. `prebuild`: `prisma migrate deploy` + `node scripts/build-papers.mjs`
3. `build`: `next build`

## Key Files Reference

- `middleware.ts` - Dual-domain routing logic
- `lib/markdown.ts` - Content fetching, image processing, markdown parsing (700+ lines)
- `contexts/LanguageContext.tsx` - Custom i18n system
- `scripts/optimize-images.js` - Image optimization pipeline
- `scripts/build-papers.mjs` - ArXiv paper fetching for `/papers` page
- `app/(main)/layout.tsx` - Main site layout with SEO
- `app/(lab)/lab/layout.tsx` - Lab site layout (separate from main)
- `components/main/ClientLayout.tsx` - Client-side wrapper with LanguageProvider

## Common Pitfalls

1. **Don't use server-side i18n** - Translation loading is client-side only via LanguageContext
2. **Image paths must go through optimization** - Never reference `/public/images/projects/` directly in markdown; the system auto-converts to `/images/optimized/`
3. **Locale suffixes are exact** - Must be `_zh-tw.md`, not `_zh-TW.md` or `_zh.md`
4. **Middleware affects all routes** - Shared resources (API, images, locales) must be in `sharedPaths` array
5. **Pinned sorting is numeric** - Use `pinned: 1` (highest) to `pinned: 10`, not `pinned: true`
6. **Server/Client component boundaries** - LanguageProvider must wrap client components, not server components
7. **Video embeds require specific format** - YouTube/Google Drive links in markdown images are transformed to custom embed containers

## Adding New Features

**New API route:**
1. Create `app/api/[route]/route.ts`
2. Export `GET`, `POST`, etc. as async functions
3. Parse `locale` from `searchParams` if needed
4. Return `NextResponse.json(data)`

**New page (main site):**
1. Create `app/(main)/[route]/page.tsx`
2. Use server components for data fetching
3. Wrap client interactivity in separate client component

**New lab feature:**
1. Create `app/(lab)/lab/[route]/page.tsx`
2. Test locally with `npm run dev:lab`
3. Deploy to preview branch and test subdomain routing

**New translation namespace:**
1. Create `/public/locales/en/[namespace].json` and `/public/locales/zh-TW/[namespace].json`
2. Add to `namespaces` array in `contexts/LanguageContext.tsx` `loadTranslations()` function
3. Use `t('key', 'namespace')` in components
