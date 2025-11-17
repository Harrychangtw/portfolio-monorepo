# Portfolio Monorepo (harrychang.me, emilychang-me)


## Architecture Overview

- **Turbo monorepo**: Multiple Next.js 15 apps managed via Turborepo (`apps/`)
- **Dual-domain, single codebase**: `harrychang.me` (main) and `lab.harrychang.me` (lab) served from one Next.js app using middleware
- **File-based CMS**: Markdown in `content/` with YAML frontmatter, auto-localized by filename suffix (`_zh-tw.md`)
- **Custom i18n**: Client-only React Context, dynamic JSON loading from `/public/locales/`
- **Image optimization**: Build-time WebP/thumbnail generation, runtime path transforms
- **Prisma/Postgres**: DB for lab features (not required for main portfolio)

## Key Patterns & Conventions

- **Routing**: 
  - Main: `app/(main)/[route]/`
  - Lab: `app/(lab)/lab/[route]/`
  - Shared API: `app/api/`
  - Middleware (`middleware.ts`) rewrites/redirects based on subdomain
- **Content**: 
  - Projects: `content/projects/[slug].md` (+ `_zh-tw.md` for Chinese)
  - Gallery: `content/gallery/[slug].md`
  - Images: Place originals in `public/images/[type]/[slug]/`, always run `npm run optimize-images` after adding
- **i18n**: 
  - Use `useLanguage()` hook, `t(key, ns)` for translations
  - Add new keys to both `en` and `zh-TW` JSON files in `/public/locales/`
- **Components**: 
  - Server components by default. Use `"use client"` only for interactivity, hooks, or context
  - Framer Motion for animation (client only)
  - Custom hooks in `packages/lib/hooks/`
- **Styling**: 
  - Tailwind CSS, dark mode only, custom HSL variables in `app/globals.css`
  - Radix UI for complex UI
- **API**: 
  - Locale-aware: always accept `?locale=` param, call markdown fetchers with locale
  - Return JSON via `NextResponse.json()`
- **Testing**: 
  - Vitest + React Testing Library, config in `vitest.config.ts`, setup in `test/setup.tsx`
  - Test files: `**/*.{test,spec}.{ts,tsx}`

## Developer Workflows

- **Install**: `npm install` (runs Prisma generate)
- **Dev main**: `npm run dev` (http://localhost:3000)
- **Dev lab**: `npm run dev:lab` (http://localhost:3001, sets `NEXT_PUBLIC_IS_STUDIO=true`)
- **Content update**: Add markdown/images, run `npm run optimize-images`, commit
- **Test**: `npm run test`, `npm run test:watch`, `npm run test:ui`
- **Build**: `npm run build` (runs prebuild hooks), `npm run start` (prod)
- **DB**: Local: `npx prisma migrate dev`. Deploy: `prisma migrate deploy` (in prebuild)

## Key Files & Directories

- `apps/harrychang-me/middleware.ts` — Dual-domain routing logic
- `apps/harrychang-me/lib/markdown.ts` — Content/image/locale logic
- `apps/harrychang-me/contexts/LanguageContext.tsx` — i18n system
- `apps/harrychang-me/scripts/optimize-images.js` — Image pipeline
- `apps/harrychang-me/scripts/build-papers.mjs` — arXiv paper fetch
- `apps/harrychang-me/app/(main)/layout.tsx` — Main layout
- `apps/harrychang-me/app/(lab)/lab/layout.tsx` — Lab layout
- `packages/ui/` — Shared UI components
- `packages/lib/` — Shared hooks, logic

## Project-Specific Gotchas

- **Never use server-side i18n** — All translation is client-only
- **Image paths** — Always reference `/images/projects/...` in markdown; system rewrites to optimized WebP
- **Locale suffix** — Must be `_zh-tw.md` (not `_zh-TW.md`)
- **Pinned sorting** — Use numeric `pinned: 1` (highest), not boolean
- **Middleware** — All non-shared routes are affected; see `sharedPaths` in `middleware.ts`
- **LanguageProvider** — Must wrap client components, not server components
- **Video embeds** — Only specific markdown image syntax is auto-transformed

## Example: Adding a Project

1. Add `content/projects/my-project.md` (see frontmatter schema in `apps/harrychang-me/README.md`)
2. Add images to `public/images/projects/my-project/`
3. Run `npm run optimize-images`
4. Commit and push

## License

Code: [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/)
Content: All Rights Reserved (see `/content/`, `/public/`)

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Radix UI](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Prisma](https://www.prisma.io/)
- [Vitest](https://vitest.dev/)
