# Portfolio Site - AI Agent Instructions

## Project Overview

A Next.js 15+ portfolio featuring file-based content management, bilingual support (English/繁體中文), and a separate studio subdomain. Content is markdown files with frontmatter metadata—no database needed.

**Architecture**: Next.js App Router + TypeScript + Tailwind + Radix UI + Framer Motion

## Key Architectural Patterns

### 1. Dual-Domain Architecture
- **Main domain** (`harrychang.me`): Public portfolio via `app/(main)/*`
- **Studio subdomain** (`studio.harrychang.me`): Admin/private content via `app/(studio)/studio/*`
- Routing handled by `middleware.ts` and `vercel.json` rewrites
- Studio routes are noindex and subdomain-only (see `vercel.json` headers)

### 2. Markdown Content System
Content lives in `content/{projects,gallery,papers}/*.md` with YAML frontmatter:

```markdown
---
title: "Project Name"
pinned: 1        # Numeric pinning: -1 = unpinned, 0+ = pin order (lower is higher priority)
locked: false    # Hides from non-admin views
date: "2024-01-01"
---
```

**Localization**: Files with `_zh-tw.md` suffix serve Chinese content. Logic in `lib/markdown.ts` filters by locale (see `getAllProjectsMetadata(locale)`).

**Image paths**: Always use `/images/optimized/{projects,gallery}/...` structure. Thumbnails end in `-thumb.webp`.

### 3. Build-Time Content Processing

**Critical**: Run `npm run prebuild` before deployment to:
1. Fetch arXiv papers from `content/arxiv-papers.md` IDs
2. Merge with manual papers from `content/papers/*.md`
3. Output to `content/generated/papers.json` (consumed by API routes)

Image optimization (`npm run optimize-images`) generates WebP variants + thumbnails using Sharp (see `scripts/optimize-images.js`).

### 4. Client-Side Internationalization
- **Never SSR translations**: All i18n is client-side via `contexts/LanguageContext.tsx`
- Translations load from `/public/locales/{en,zh-TW}/{common,about,updates,uses}.json`
- Components use `useLanguage()` hook: `const { t, language } = useLanguage()`
- Always check `isLoading` before rendering to prevent FOUC with raw keys

Example:
```tsx
const { t, language, isLoading } = useLanguage()
if (isLoading) return <LoadingSkeleton />
return <h1>{t('title', 'common')}</h1>
```

### 5. Image Handling & CLS Prevention
- All images include `width` and `height` attributes computed at build time
- Main image function: `getDimsFromWebPath()` in `lib/markdown.ts` reads dimensions via `image-size`
- Gallery items compute `aspectRatio` and `aspectType` ('v'/'h') on load
- Use `getThumbnailPath()` for card views, `getFullResolutionPath()` for detail pages

### 6. API Routes Pattern
All content APIs follow this pattern:
```typescript
// app/api/{content-type}/route.ts
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const items = getAllXMetadata(locale)
  return NextResponse.json(items)
}
```

No POST/PUT/DELETE—content is managed via filesystem only.

### 7. Animation Standards
- **Framer Motion** for all transitions (not GSAP despite dependency)
- Page transitions via `<AnimatePresence mode="wait">`
- Hover effects: `<motion.div whileHover={{ y: -2 }}>`
- Client components only—wrap SSR layouts with client boundary

## Development Workflows

### Starting Development
```bash
npm run dev              # Main site on :3000
npm run dev:studio       # Studio site on :3001 with NEXT_PUBLIC_IS_STUDIO=true
```

### Adding Content

**New Project:**
1. Copy `content/templates/project-template.md` → `content/projects/project-slug.md`
2. Add images to `public/images/projects/project-slug/`
3. Run `npm run optimize-images`
4. Set `imageUrl: "/images/optimized/projects/project-slug/cover.webp"`

**New Gallery Item:**
1. Use `content/templates/gallery-template.md`
2. Gallery frontmatter includes `gallery: [{url, caption}]` array
3. First image in folder = title image (receives highest quality export)

### Build Process
```bash
npm run prebuild  # Fetch arXiv papers, required before build
npm run build     # Next.js build
npm start         # Production server
```

### Image Optimization Rules
- Projects: Hero images → 2560px, portraits → 1200x1800, landscapes → 2000x1200
- Gallery: Full-screen → 3200px, title images → 3840px (4K), thumbnails → 20px blurred
- Title/titlecard images always get highest quality (98% WebP)
- Script auto-detects orientation and applies correct preset

## Critical Conventions

### Pinning System
Numeric pinning controls sort order:
- `-1` = not pinned (sorts by date descending)
- `0+` = pinned (lower number = higher priority)
- Example: `pinned: 1` appears before `pinned: 10`

### Component File Naming
- Page client components: `{feature}-page-client.tsx` (e.g., `gallery-page-client.tsx`)
- UI components: Lower kebab-case in `components/ui/`
- Layout boundaries: `ClientLayout.tsx` wraps SSR layouts for client-only features

### Typography & Styling
- Headings use Space Grotesk (`font-space-grotesk`)
- Body text uses IBM Plex Sans (`font-ibm-plex-sans`)
- Prose content via `@tailwindcss/typography` with custom link styling (dashed underline + `*` suffix)
- External links: `className="link-external"` for consistent styling

### Video Embeds
Markdown images with YouTube/Google Drive URLs auto-transform to lazy-loaded embeds via `transformMedia()` in `lib/markdown.ts`. Uses placeholder with play button until user interaction.

## Common Pitfalls

❌ **Don't** use SSR for translations—client-side only via `LanguageContext`  
❌ **Don't** skip `npm run prebuild`—papers won't exist  
❌ **Don't** reference images without `/images/optimized/` prefix  
❌ **Don't** use `pinned: true/false`—use numeric values (`-1` for unpinned)  
❌ **Don't** forget width/height on images—causes CLS  

✅ **Do** use `getDimsFromWebPath()` when adding new image fields  
✅ **Do** check `isLoading` before rendering i18n content  
✅ **Do** run image optimization after adding new photos  
✅ **Do** test both locales when changing content APIs  

## Key Files Reference

- `lib/markdown.ts` - All content loading logic, image path transforms, dimension computation
- `middleware.ts` + `vercel.json` - Subdomain routing configuration
- `contexts/LanguageContext.tsx` - Client-side i18n system
- `scripts/build-papers.mjs` - arXiv fetcher (prebuild step)
- `scripts/optimize-images.js` - Image processing pipeline
- `content/templates/` - Starter templates for new content

## Testing Checklist

When modifying content systems:
- [ ] Test both English and Chinese locales
- [ ] Verify images load with correct dimensions (no layout shift)
- [ ] Check pinned items appear in correct order
- [ ] Confirm locked items hidden on main domain
- [ ] Test studio subdomain routing (if applicable)

## Testing

### Running Tests
```bash
npm test              # Run all tests once
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Open Vitest UI for interactive testing
npm run test:coverage # Generate coverage report
```

### Test Structure
- **Unit tests**: Test individual functions and utilities
  - `lib/markdown.test.ts` - Content loading, image transforms, locale filtering
  - Located alongside source files with `.test.ts` suffix
- **Component tests**: Test React components with user interactions
  - `contexts/LanguageContext.test.tsx` - i18n functionality
  - Use `render()` from `@testing-library/react` with LanguageProvider wrapper
- **Integration tests**: Test API routes end-to-end
  - `app/api/api.test.ts` - API endpoint responses
  
### Writing Tests
Example component test pattern:
```tsx
import { render } from '@testing-library/react'
import { LanguageProvider } from '@/contexts/LanguageContext'

const { getByTestId } = render(
  <LanguageProvider>
    <YourComponent />
  </LanguageProvider>
)

await vi.waitFor(() => {
  expect(getByTestId('element')).toHaveTextContent('Expected text')
})
```

### Mocking Guidelines
- File system operations are mocked in `lib/markdown.test.ts`
- Next.js router/image components mocked in `test/setup.tsx`
- Framer Motion mocked to render static divs (no animations in tests)
- Translation files mocked with `global.fetch` in component tests
- Mock data available in `test/mockData.ts`

### Key Test Patterns
1. **Locale filtering**: Verify `_zh-tw.md` files load for Chinese locale
2. **Pinning logic**: Ensure numeric pinning (`-1`, `0+`) sorts correctly
3. **Image paths**: Check thumbnail/full-resolution transforms
4. **CLS prevention**: Validate width/height attributes on images
5. **i18n loading**: Test `isLoading` state before rendering translations
