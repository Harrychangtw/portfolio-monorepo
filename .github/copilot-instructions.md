## Monorepo Structure

This is a Turborepo monorepo managed with pnpm. The codebase consists of:
- **apps/harrychang-me**: Main Next.js 15 app serving dual domains (harrychang.me + lab.harrychang.me)
- **apps/emilychang-me**: Secondary Next.js 15 app
- **packages/ui**: Shared UI components
- **packages/lib**: Shared hooks, utilities, and Prisma client
- **packages/config**: Shared configuration (Tailwind, TypeScript)

## Development Commands

### Root-Level (Turborepo)
```bash
pnpm install              # Install all dependencies
pnpm build               # Build all apps and packages
pnpm dev                 # Start dev servers for all apps
pnpm lint                # Lint all packages
pnpm format              # Format code with Prettier
```

### Main App (harrychang-me)
Run these from the repository root or within `apps/harrychang-me/`:
```bash
# Development
pnpm --filter harry-chang-portfolio dev           # Start main site (:3000)
pnpm --filter harry-chang-portfolio dev:lab       # Start lab site (:3001)

# Testing
pnpm --filter harry-chang-portfolio test          # Run tests once
pnpm --filter harry-chang-portfolio test:watch    # Run tests in watch mode
pnpm --filter harry-chang-portfolio test:ui       # Open Vitest UI
pnpm --filter harry-chang-portfolio test:coverage # Generate coverage report

# Content Management
pnpm --filter harry-chang-portfolio optimize-images  # Generate optimized WebP images

# Database (Prisma)
npx prisma generate                                   # Generate Prisma client
npx prisma migrate dev                               # Run migrations locally
npx prisma migrate deploy                            # Deploy migrations (production)

# Build
pnpm --filter harry-chang-portfolio build         # Build for production
pnpm --filter harry-chang-portfolio build:analyze # Analyze bundle size
pnpm --filter harry-chang-portfolio start         # Start production server
```

Note: The main app `postinstall` script automatically runs `prisma generate`. The `prebuild` script runs `prisma migrate deploy` and `node scripts/build-papers.mjs`.

## Critical Architecture Patterns

### Dual-Domain Architecture via Middleware

The harrychang-me app serves **two distinct applications** from a single codebase using subdomain-based routing:
- **Main domain** (`harrychang.me`): Routes in `app/(main)/`
- **Lab subdomain** (`lab.harrychang.me`): Routes in `app/(lab)/lab/`

**Middleware logic** (`apps/harrychang-me/middleware.ts`):
- Detects subdomain via hostname inspection
- Rewrites `lab.harrychang.me/` → `/lab` internally
- Redirects `/lab` → `/` on main domain in production
- Allows direct `/lab` access on Vercel preview deployments
- Shared resources (`/api/`, `/images/`, `/locales/`) bypass rewriting (see `sharedPaths` array)

When adding routes:
- Main site: `app/(main)/[route]/page.tsx`
- Lab features: `app/(lab)/lab/[route]/page.tsx`
- API routes: `app/api/[route]/route.ts` (shared across both domains)

### Custom Client-Side i18n System

**No server-side i18n** - this project uses a custom React Context pattern (`apps/harrychang-me/contexts/LanguageContext.tsx`):
- Detects language from `localStorage` or browser on mount
- Fetches JSON translation files from `/public/locales/{lang}/{namespace}.json`
- Provides `t(key, namespace)`, `tHtml(key)`, and `getTranslationData(key)` functions
- Uses visibility gating to prevent FOUC (flash of untranslated content)

Usage in components:
```tsx
const { t, tHtml, language, setLanguage } = useLanguage()
const text = t('projects.title', 'common') // namespace defaults to 'common'
```

Adding new translations:
1. Add keys to both `/public/locales/en/[namespace].json` and `/public/locales/zh-TW/[namespace].json`
2. If adding a new namespace, update the `loadTranslations()` function in `LanguageContext.tsx`

### File-Based CMS with Markdown

Content is stored as markdown files with YAML frontmatter:
- Projects: `content/projects/[slug].md` or `[slug]_zh-tw.md`
- Gallery: `content/gallery/[slug].md` or `[slug]_zh-tw.md`

**Locale handling:**
- English: Files without suffix (e.g., `project.md`)
- Chinese: Files with `_zh-tw.md` suffix (MUST be lowercase, not `_zh-TW.md`)
- If Chinese version exists, it's shown for `zh-TW` locale; otherwise fallback to English

**Metadata handling** (`apps/harrychang-me/lib/markdown.ts`):
- `getAllProjectsMetadata(locale)` / `getAllGalleryMetadata(locale)` - Lists all items, filtered by locale
- `getProjectData(slug)` / `getGalleryItemData(slug)` - Fetches single item with HTML content
- Sorting: Pinned items first (numeric `pinned: 1` field = highest priority), then by `date` DESC

### Image Optimization Pipeline

**Two-stage approach:**

1. **Build-time optimization** (`apps/harrychang-me/scripts/optimize-images.js`):
   - Converts JPG/PNG → WebP with responsive sizes (2000-3840px)
   - Generates 20px blur thumbnails for progressive loading
   - Outputs to `/public/images/optimized/[projects|gallery]/`
   - Naming: `image.webp` (full) + `image-thumb.webp` (thumbnail)

2. **Runtime URL transformation** (in `lib/markdown.ts`):
   - Auto-converts markdown image paths to optimized WebP paths
   - `getThumbnailPath()`: Adds `-thumb.webp` suffix for cards
   - `getFullResolutionPath()`: Removes `-thumb` for detail views

**Workflow for adding images:**
1. Place originals in `/public/images/[projects|gallery]/[slug]/`
2. Run `pnpm --filter harry-chang-portfolio optimize-images`
3. Reference in markdown: `/images/projects/slug/image.jpg` (auto-converted to optimized WebP)

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

## Testing

Tests use Vitest + React Testing Library:
- Config: `apps/harrychang-me/vitest.config.ts`
- Setup: `apps/harrychang-me/test/setup.tsx`
- Environment: `happy-dom`
- Test files: `**/*.{test,spec}.{ts,tsx}`

## Database

PostgreSQL via Vercel Postgres with Prisma:
- Schema: `apps/harrychang-me/prisma/schema.prisma`
- Client: Shared via `packages/lib/lib/prisma.ts`
- Models: `WaitlistEntry` (lab subdomain waitlist), `EmailCampaign`

## Key Files & Directories

- `apps/harrychang-me/middleware.ts` — Dual-domain routing logic
- `apps/harrychang-me/lib/markdown.ts` — Content/image/locale logic (700+ lines)
- `apps/harrychang-me/contexts/LanguageContext.tsx` — i18n system
- `apps/harrychang-me/scripts/optimize-images.js` — Image pipeline
- `apps/harrychang-me/scripts/build-papers.mjs` — arXiv paper fetch (runs in prebuild)
- `packages/ui/` — Shared UI components (header, footer, project-card, etc.)
- `packages/lib/` — Shared hooks, utilities, types, Prisma client

## Project-Specific Patterns

- **Server components by default**: Only add `"use client"` for interactivity, hooks, or context
- **Framer Motion**: Use for animations (requires `"use client"`)
- **Styling**: Dark mode only, Tailwind CSS with custom HSL variables in `app/globals.css`, Radix UI for complex components
- **Locale suffixes**: MUST be `_zh-tw.md` (lowercase), not `_zh-TW.md`
- **Pinned sorting**: Use numeric `pinned: 1` (highest priority), not boolean
- **LanguageProvider**: Must wrap client components, not server components
- **Middleware shared paths**: API routes, images, and locales must be in `sharedPaths` array

## Common Pitfalls

1. **Never use server-side i18n** — All translation is client-only via `LanguageContext`
2. **Image paths must go through optimization** — Always run `optimize-images` after adding images
3. **Locale suffix must be exact** — Use `_zh-tw.md`, not `_zh-TW.md` or `_zh.md`
4. **Middleware affects all routes** — Shared resources must be explicitly listed in `sharedPaths`
5. **Pinned sorting is numeric** — Use `pinned: 1` (highest) to `pinned: 10`, not `pinned: true`
6. **Video embeds require specific markdown image syntax** — YouTube/Google Drive links are auto-transformed

## Example: Adding a Project

1. Create `content/projects/my-project.md` with frontmatter (see existing projects for schema)
2. Add images to `public/images/projects/my-project/`
3. Run `pnpm --filter harry-chang-portfolio optimize-images`
4. Commit and push (build will regenerate static props)
