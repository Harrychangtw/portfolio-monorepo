# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Turborepo monorepo containing multiple Next.js 15 portfolio applications with a sophisticated dual-domain architecture, file-based markdown CMS, custom client-side i18n, build-time image optimization, and cross-subdomain theme persistence.

**Tech stack:** Next.js 15 App Router, TypeScript, React 19, Tailwind CSS, Radix UI, Motion (`motion/react`), Prisma, PostgreSQL, pnpm, Turborepo.

## Monorepo Structure

- `apps/harrychang-me` - Main Next.js app serving both `harrychang.me` (main site) and `lab.harrychang.me` (lab subdomain) from a single codebase
- `apps/emilychang-me` - Secondary Next.js portfolio app
- `packages/ui` - Shared React components (header, footer, gallery-card, blog-card, theme-switcher, etc.)
- `packages/lib` - Shared hooks (`useStableHashScroll`, `useNowPlaying`), utilities, Prisma client, Theme/Language contexts
- `packages/config` - Shared Tailwind and TypeScript configurations

## Common Development Commands

### Root-Level (Turborepo)

```bash
pnpm install             # Install all dependencies (runs prisma generate automatically)
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

# Content & Assets
pnpm --filter harry-chang-portfolio optimize-images  # Generate WebP images
node apps/harrychang-me/scripts/fetch-fonts.mjs      # Fetch private fonts from Google Drive

# Database (run from apps/harrychang-me/)
npx prisma generate        # Generate client
npx prisma migrate dev     # Run migrations locally
npx prisma migrate deploy  # Deploy migrations (production)

# Build
pnpm --filter harry-chang-portfolio build         # Production build
pnpm --filter harry-chang-portfolio build:analyze # Bundle analysis
```

**Build lifecycle:**

1. `postinstall` → runs `prisma generate`
2. `prebuild` → runs `prisma migrate deploy` + `node scripts/build-papers.mjs` + `node scripts/fetch-fonts.mjs`
3. `build` → runs `next build`

## Critical Architecture Patterns

### Dual-Domain Architecture via Middleware

The app serves **two distinct applications** from one codebase using subdomain routing in `middleware.ts`:

- **Main domain** (`harrychang.me`) → routes in `app/(main)/`
- **Lab subdomain** (`lab.harrychang.me`) → routes in `app/(lab)/lab/`

**Middleware logic:**

- Rewrites `lab.harrychang.me/` → `/lab` internally.
- Shared resources bypass rewriting (`/api/`, `/images/`, `/locales/`).

### Cross-Subdomain Theme Engine

- Managed via `ThemeContext.tsx`.
- Uses root domain cookies (`; domain=.harrychang.me`) to ensure user preferences (Light/Dark mode) persist seamlessly when navigating between the main site and the Lab subdomain.
- Inverts specific assets (like footer/lab logos) dynamically in `.light` mode via `globals.css`.

### Custom Client-Side i18n System

- **No server-side i18n.** Entirely client-side via `LanguageContext.tsx`.
- Uses visibility gating to prevent FOUC.
- Relies on JSON files in `/public/locales/{lang}/{namespace}.json`.

### Dynamic UI & Micro-Interactions

- **Navigation:** Header utilizes `useNavigation()` to show dynamic, cycling loading status messages (e.g., "Computing", "Brewing ideas") with an animated gradient bar (`--gradient-primary`) during route transitions.
- **Header Special Pages:** Pages like `/paper-reading`, `/manifesto`, `/uses`, `/linktree`, and `/design` bypass standard section tracking.
- **Guestbook Widget:** Found in the footer and Links page. Features an animated, cycling placeholder system. Submits to `/api/guestbook`.
- **Now Playing:** Spotify integration (`useNowPlaying`) shows active tracks in the footer with an animated equalizer and tooltip rendering.
- **Rangefinder 404 Page:** An interactive 404 page (`not-found.tsx`) that uses scroll wheel input to "focus" a misaligned split-image text projection, locking onto a destination to randomly redirect the user.

### File-Based CMS with Markdown

Content stored in `content/`:

- `content/projects/[slug].md` or `[slug]_zh-tw.md`
- `content/gallery/[slug].md` or `[slug]_zh-tw.md`
- `content/posts/YYYY_MM_DD_[slug].md` (Blog requires date prefix)
- Custom fields: `pinned` (numeric sort), `locked`, `featured`. Tags used for blog instead of category.

### Image Optimization Pipeline

1. Place originals in `/public/images/[projects|gallery|blogs]/[slug]/`
2. Run `pnpm --filter harry-chang-portfolio optimize-images`
3. Generates multi-resolution WebP images and 20px blur thumbnails.

## Database (Prisma + Postgres)

- Models: `WaitlistEntry` (lab waitlist), `EmailCampaign`, `GuestbookMessage` (implicit for guestbook).
- Shared client via `packages/lib/lib/prisma.ts`.

## Critical Conventions

- **Client Components & Animations:** Default to Server Components. Use `"use client"` for interactivity. Use `motion/react` for animations (not `framer-motion` directly, though both exist, favor standard motion patterns).
- **Navigation Links:** Use `<NavigationLink>` wrapper for internal routing to ensure smooth scrolling and loading state triggering.
- **Scrolling:** Use `useStableHashScroll` for precise anchor alignment, which reads `--header-offset` from CSS variables.
- **Locale Suffixes:** MUST be `_zh-tw.md` (lowercase).
- **Image Referencing:** Blog images reference optimized paths directly (`images/optimized/blogs/...`), whereas Projects/Gallery reference raw paths which are auto-converted at runtime.

## graphify

This project has a graphify knowledge graph at apps/graphify-out/.

Rules:

- Before answering architecture or codebase questions, read apps/graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If apps/graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
