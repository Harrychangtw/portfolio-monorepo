# GitHub Copilot Instructions

## Project Architecture

This is a Next.js 15 TypeScript portfolio site with a **filesystem-based CMS** using markdown files. Content is managed through frontmatter metadata, served via API routes, and optimized through a build-time image pipeline.

### Core Data Flow
1. Markdown files in `/content/{projects,gallery,papers}/` with YAML frontmatter
2. `/lib/markdown.ts` parses files using gray-matter, extracts metadata, converts to HTML with remark
3. API routes (`/app/api/{projects,gallery,papers}/`) serve processed content with locale support
4. Client components fetch via API or receive props from server components
5. Images auto-optimized via `/scripts/optimize-images.js` → `/public/images/optimized/`

### Critical Build Process
**Always run before deployment:**
```bash
npm run prebuild  # Executes build-papers.mjs + generate-gallery-meta.js
npm run build     # Next.js build with prebuild hook
```

The `prebuild` script:
- Fetches arXiv papers from IDs in `/content/arxiv-papers.md` via XML API
- Merges with manual papers from `/content/papers/*.md`
- Generates `/content/generated/papers.json` consumed by API routes

## Content Management Patterns

### Locale Handling (English + Traditional Chinese)
- Default files: `project.md` (English)
- Chinese variants: `project_zh-tw.md` (Traditional Chinese)
- API routes accept `?locale=en|zh-TW` query param
- `/lib/markdown.ts` filters files by locale, prioritizing localized versions when available

**Example:**
```typescript
// getAllProjectsMetadata() filters based on locale:
// - locale='zh-TW': Returns _zh-tw.md files, falls back to base .md if no translation exists
// - locale='en': Returns only base .md files (no locale suffix)
```

### Pinned Content Sorting
Uses **numeric pinning** (not boolean):
- `pinned: -1` → Not pinned (default)
- `pinned: 1` → Highest priority
- `pinned: 2+` → Lower priority

Sorting logic in `getAllProjectsMetadata()` and `getAllGalleryMetadata()`:
1. Pinned items first (sorted by pin number ascending)
2. Non-pinned items sorted by date descending

### Image Optimization Pipeline
**Source → Optimized workflow:**
```bash
# 1. Place originals in /public/images/{projects,gallery}/[slug]/
# 2. Run optimization
npm run optimize-images
# 3. Reference optimized paths in markdown:
/images/optimized/projects/[slug]/image.webp
```

**Output formats:**
- Thumbnails: `-thumb.webp` (20px width, blur for placeholders)
- Landscape: 2000×1200 (projects), 2560×1440 (gallery)
- Portrait: 1200×1800 (projects), 1440×2160 (gallery)
- Hero: 2560px max dimension (projects), 3200px (gallery)

### Markdown Media Transformation
`/lib/markdown.ts` `transformMedia()` function converts image syntax to:
- **YouTube links** → Custom video embed placeholder (loads on interaction)
- **Google Drive videos** → Custom embed with preview
- **Images** → `<figure>` with width/height attributes (prevents CLS)

Uses `imageSize` library to read dimensions at build time from `/public/images/optimized/`.

## Component Architecture

### Server vs Client Components
- **Server (default):** Page routes, API handlers, static content rendering
- **Client (`'use client'`):** Interactive UI, animations (Framer Motion), state management, browser APIs

**Client component indicators:**
- Uses hooks: `useState`, `useEffect`, `useContext`, `use-mobile`, `useLanguage`
- Animations: GSAP, Framer Motion
- Event listeners: click, scroll, intersection observers
- Browser APIs: localStorage, window, navigator

### Critical Patterns

#### 1. Client Layout Wrapper
`/app/ClientLayout.tsx` wraps all pages with:
- `LanguageProvider` (i18n context)
- `Header` (navigation)
- `ClickSpark` effect (desktop only)
- `VideoInitializer` (lazy video loading)
- Vercel Analytics

#### 2. Language Context
`/contexts/LanguageContext.tsx` provides:
- `t(key, namespace)` → Plain text translation
- `tHtml(key, namespace)` → React nodes with link parsing
- `getTranslationData(key, namespace)` → Raw objects/arrays
- Loads from `/public/locales/{locale}/{namespace}.json`
- Auto-detects browser language, persists to localStorage

**Usage:**
```typescript
const { t, language, setLanguage } = useLanguage()
const title = t('projects.title', 'common')
```

#### 3. Image Path Helpers in markdown.ts
- `getThumbnailPath(url)` → Adds `-thumb.webp` suffix, ensures `/optimized/` path
- `getFullResolutionPath(url)` → Removes `-thumb`, ensures full size
- `getDimsFromWebPath(url)` → Reads width/height from disk to prevent CLS

## Development Conventions

### TypeScript Build Settings
```javascript
// next.config.mjs
typescript: { ignoreBuildErrors: true }  // Legacy codebase
eslint: { ignoreDuringBuilds: true }
```
**Note:** Prefer fixing type errors, but builds won't block on them.

### Styling with Tailwind
- **CSS Variables:** All colors use HSL variables (`hsl(var(--primary))`)
- **Typography plugin:** Custom prose styles for markdown rendering
  - Links: Dashed underline with `*` suffix (styled via `::after`)
  - Headings: Space Grotesk font
  - Body: IBM Plex Sans font
- **Dark mode:** Class-based switching (not media query)

### API Route Pattern
```typescript
// app/api/projects/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const projects = getAllProjectsMetadata(locale)
  return NextResponse.json(projects)
}
```

## Common Tasks

### Adding New Content
1. Copy template from `/content/templates/{project,gallery}-template.md`
2. Create markdown file in appropriate `/content/` subdirectory
3. Add images to `/public/images/{projects,gallery}/[slug]/`
4. Run `npm run optimize-images`
5. Update image paths in frontmatter to use `/images/optimized/` paths

### Adding Translations
1. Create `file_zh-tw.md` variant alongside `file.md`
2. Add translations to `/public/locales/zh-TW/{namespace}.json`
3. Use `useLanguage()` hook to access translations in components

### Debugging Image Issues
- Check `/public/images/optimized/` for generated WebP files
- Verify dimensions logged in markdown.ts `getDimsFromWebPath()`
- Thumbnails should be 20px wide (blur placeholders)
- Full-res images should match landscape/portrait/hero presets

### Performance Optimization
- Images use `loading="lazy"` and `decoding="async"` (see `transformMedia()`)
- Thumbnails provide blur-up effect (CSS `blur()` filter)
- Intersection observers for lazy section loading (check `/hooks/use-intersection-observer.ts`)
- Video embeds load on first interaction (see `/components/video-initializer.tsx`)

## Key Files Reference

| File | Purpose |
|------|---------|
| `/lib/markdown.ts` | Core CMS logic: parsing, locale filtering, image optimization |
| `/app/ClientLayout.tsx` | Root client wrapper with providers and effects |
| `/contexts/LanguageContext.tsx` | i18n state management and translation helpers |
| `/scripts/optimize-images.js` | Image pipeline (WebP conversion, responsive variants) |
| `/scripts/build-papers.mjs` | arXiv API integration and paper aggregation |
| `/tailwind.config.ts` | Design tokens, typography overrides, custom utilities |
| `/next.config.mjs` | Build config, image domains, experimental features |

## Gotchas

1. **Pinning:** Use `pinned: 1` (not `true`) for highest priority
2. **Locale suffixes:** Must be exact `_zh-tw` (lowercase "tw")
3. **Image paths:** Always reference `/images/optimized/` after running optimization script
4. **Prebuild:** Paper data won't exist without running `npm run prebuild` first
5. **Client boundaries:** Don't import client components into server components without `use client` directive
6. **Video embeds:** Use image syntax `![title](url)` in markdown—transformation is automatic for YouTube/Drive links
