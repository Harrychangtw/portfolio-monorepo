# Harry Chang Portfolio Site

<p align="center">
  <img src="public/images/optimized/projects/og/titlecard.webp" alt="Harry Chang Portfolio Site" width="1800" />
</p>

[![Lint & Format](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lint.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lint.yml)
[![Typecheck](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/typecheck.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/typecheck.yml)
[![Lighthouse CI](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse.yml)
[![Dependency Audit](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/audit.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/audit.yml)

A modern, highly optimized portfolio website built with Next.js 15 and React 19, featuring a dual-domain architecture, an Obsidian-style knowledge graph, custom cross-domain theme persistence, an interactive 404 experience, and a flawless 100 Real Experience Score (RES) under heavy traffic.

## ⚡ Performance: 100 RES

This site is engineered for uncompromising performance. Verified by Vercel Analytics, the site maintains a **perfect 100 Real Experience Score (RES)** across both desktop and mobile devices, gracefully handling surges of 4,000+ visitors with:

- **First Contentful Paint (FCP):** ~1.55s
- **Largest Contentful Paint (LCP):** ~1.66s
- **Interaction to Next Paint (INP):** 80ms
- **Cumulative Layout Shift (CLS):** 0.01

### Lighthouse CI Results

<!-- LIGHTHOUSE_RESULTS_START -->

> 🕐 **Last audited:** Thu, 23 Apr 2026 16:11:25 GMT

#### Desktop

| Tested Route                               | Performance                                                                              | FCP   | LCP   | TBT   | CLS | Speed Index |
| :----------------------------------------- | :--------------------------------------------------------------------------------------- | :---- | :---- | :---- | :-- | :---------- |
| `/`                                        | ![Lighthouse 99](https://img.shields.io/badge/lighthouse-99-success?style=flat-square)   | 0.3 s | 0.9 s | 70 ms | 0   | 0.6 s       |
| `/blog`                                    | ![Lighthouse 100](https://img.shields.io/badge/lighthouse-100-success?style=flat-square) | 0.3 s | 0.8 s | 10 ms | 0   | 0.7 s       |
| `/blog/2025_12_19_xpro1`                   | ![Lighthouse 98](https://img.shields.io/badge/lighthouse-98-success?style=flat-square)   | 0.3 s | 1.1 s | 40 ms | 0   | 1.1 s       |
| `/blog/2025_12_22_aftersun_paris_texas`    | ![Lighthouse 97](https://img.shields.io/badge/lighthouse-97-success?style=flat-square)   | 0.3 s | 1.2 s | 20 ms | 0   | 0.9 s       |
| `/blog/2026_01_10_plushies`                | ![Lighthouse 92](https://img.shields.io/badge/lighthouse-92-success?style=flat-square)   | 0.3 s | 1.9 s | 0 ms  | 0   | 0.9 s       |
| `/blog/2026_02_10_synecdoche_truman`       | ![Lighthouse 95](https://img.shields.io/badge/lighthouse-95-success?style=flat-square)   | 0.3 s | 1.5 s | 20 ms | 0   | 1.0 s       |
| `/blog/9_m11d`                             | ![Lighthouse 93](https://img.shields.io/badge/lighthouse-93-success?style=flat-square)   | 0.3 s | 1.6 s | 70 ms | 0   | 1.2 s       |
| `/cv`                                      | ![Lighthouse 100](https://img.shields.io/badge/lighthouse-100-success?style=flat-square) | 0.3 s | 0.8 s | 0 ms  | 0   | 0.5 s       |
| `/design`                                  | ![Lighthouse 96](https://img.shields.io/badge/lighthouse-96-success?style=flat-square)   | 0.3 s | 1.4 s | 40 ms | 0   | 0.8 s       |
| `/gallery`                                 | ![Lighthouse 100](https://img.shields.io/badge/lighthouse-100-success?style=flat-square) | 0.3 s | 0.8 s | 10 ms | 0   | 0.7 s       |
| `/gallery/2023_07_07_splash_of_red`        | ![Lighthouse 97](https://img.shields.io/badge/lighthouse-97-success?style=flat-square)   | 0.3 s | 1.2 s | 0 ms  | 0   | 1.1 s       |
| `/gallery/2023_10_06_against_giants`       | ![Lighthouse 98](https://img.shields.io/badge/lighthouse-98-success?style=flat-square)   | 0.3 s | 1.2 s | 20 ms | 0   | 1.0 s       |
| `/gallery/2023_11_18_dusk_impressions`     | ![Lighthouse 98](https://img.shields.io/badge/lighthouse-98-success?style=flat-square)   | 0.3 s | 1.1 s | 0 ms  | 0   | 0.9 s       |
| `/gallery/2024_01_06_hehuanshan`           | ![Lighthouse 98](https://img.shields.io/badge/lighthouse-98-success?style=flat-square)   | 0.3 s | 1.1 s | 20 ms | 0   | 0.9 s       |
| `/gallery/2026_02_08_italy_mountain`       | ![Lighthouse 97](https://img.shields.io/badge/lighthouse-97-success?style=flat-square)   | 0.3 s | 1.3 s | 10 ms | 0   | 0.7 s       |
| `/graph`                                   | ![Lighthouse 100](https://img.shields.io/badge/lighthouse-100-success?style=flat-square) | 0.3 s | 0.7 s | 0 ms  | 0   | 0.7 s       |
| `/linktree`                                | ![Lighthouse 100](https://img.shields.io/badge/lighthouse-100-success?style=flat-square) | 0.3 s | 0.8 s | 0 ms  | 0   | 0.6 s       |
| `/manifesto`                               | ![Lighthouse 100](https://img.shields.io/badge/lighthouse-100-success?style=flat-square) | 0.3 s | 0.8 s | 0 ms  | 0   | 0.4 s       |
| `/paper-reading`                           | ![Lighthouse 100](https://img.shields.io/badge/lighthouse-100-success?style=flat-square) | 0.3 s | 0.8 s | 0 ms  | 0   | 0.5 s       |
| `/projects`                                | ![Lighthouse 99](https://img.shields.io/badge/lighthouse-99-success?style=flat-square)   | 0.3 s | 0.9 s | 0 ms  | 0   | 0.8 s       |
| `/projects/2024_08_19_classics_reimagined` | ![Lighthouse 97](https://img.shields.io/badge/lighthouse-97-success?style=flat-square)   | 0.3 s | 1.2 s | 30 ms | 0   | 1.3 s       |
| `/projects/2024_09_23_chingshin_rag`       | ![Lighthouse 97](https://img.shields.io/badge/lighthouse-97-success?style=flat-square)   | 0.3 s | 1.2 s | 0 ms  | 0   | 1.1 s       |
| `/projects/2025_03_08_sitcon_keynote`      | ![Lighthouse 97](https://img.shields.io/badge/lighthouse-97-success?style=flat-square)   | 0.3 s | 1.1 s | 0 ms  | 0   | 1.1 s       |
| `/projects/2025_04_12_portfolio`           | ![Lighthouse 97](https://img.shields.io/badge/lighthouse-97-success?style=flat-square)   | 0.3 s | 1.2 s | 20 ms | 0   | 1.1 s       |
| `/projects/2025_08_04_debate`              | ![Lighthouse 97](https://img.shields.io/badge/lighthouse-97-success?style=flat-square)   | 0.3 s | 1.2 s | 20 ms | 0   | 1.1 s       |
| `/uses`                                    | ![Lighthouse 98](https://img.shields.io/badge/lighthouse-98-success?style=flat-square)   | 0.3 s | 1.2 s | 0 ms  | 0   | 0.9 s       |

<!-- LIGHTHOUSE_RESULTS_END -->

## 🌟 Key Features

### Dual-Domain Architecture

- **Main site** (`harrychang.me`): Portfolio, projects, photo gallery, blog, links, design system, and manifesto.
- **Lab subdomain** (`lab.harrychang.me`): Hub for consulting, strategy, and educational content.
- Single codebase utilizing Next.js middleware routing. Shared components, APIs, and cross-subdomain cookie persistence (`.harrychang.me`) for theme preferences.

### Obsidian-Style Knowledge Graph

An interactive, force-directed knowledge graph that maps the relationships between all site content — projects, blog posts, gallery photos, and papers. Built with D3.js and rendered on HTML5 Canvas for smooth performance with hundreds of nodes.

- **Full-page `/graph` route** with category filtering, cursor-following preview tooltips, and a mobile-optimized node card.
- **Embedded local subgraph** in the "Next Up" card on every content page, surfacing related content via shared tags, categories, and semantic similarity.
- **Offline embedding pipeline** (`scripts/build_graph.py`) generates node descriptions and cosine-similarity edges, cached as static JSON for zero-runtime cost.

<p align="center">
  <img src="public/images/optimized/projects/2025_04_12_portfolio_design/Screenshot 2026-04-17 at 12-36-27 Knowledge Graph Harry Chang.webp" alt="Knowledge Graph — full site graph view" width="1800" />
</p>

### Advanced Design & Micro-Interactions

- **The "Rangefinder" 404 Page:** An interactive, camera-inspired 404 page. Users scroll their mouse wheel to "focus" a misaligned split-image text projection. Once focused, it locks on and transports the user to a random piece of content (Mobile users are auto-redirected to reduce friction).
- **Dynamic Headers & Navigation:** Custom navigation hooks cycle through nuanced loading messages ("Computing", "Spelunking") while traversing pages. Uses smooth `motion/react` transitions.
- **Guestbook Widget:** An integrated anonymous feedback module featuring animated, rotating text placeholders and live database submission.
- **Live Spotify Status:** Context-aware "Now Playing" footer widget with a custom animated equalizer and dynamic tooltips.
- **Cross-Subdomain Theme Engine:** A custom light/dark mode implementation using root domain cookies to ensure seamless transitions when navigating between the main site and the Lab subdomain without FOUC.

### Automated Asset Pipelines

- **Google Drive Font Fetching:** Custom fonts are intentionally kept out of the repository. A pre-build Node script (`fetch-fonts.mjs`) securely pulls the required typefaces from Google Drive, unzips them, and cleans up the assets for the build.
- **Image Processing:** Automated WebP conversion, progressive 20px blur-up thumbnails, and strict dimension detection to eliminate Layout Shift.

### Custom Internationalization & CMS

- **Client-side i18n:** Context-based language switching (EN / ZH-TW) with visibility gating.
- **File-based Markdown CMS:** Stores data for projects, gallery items, and blog posts, with automated fallback logic for localization.

## 🎨 Design Philosophy

### The "Anti-Hero" Architecture

The site actively avoids standard web tropes like massive hero sections or scroll-jacking. Intent-driven navigation replaces splash screens, giving visitors immediate access to the content (`About`, `Updates`, `Projects`, `Links`).

### Visual Framing & Classical Integration

- **Dynamic Aspect Ratios:** The Gallery applies custom border padding based on mathematical aspect ratios (Portrait, Cinematic, Standard) to create a museum-like visual rhythm.
- **Classical Motif:** Blends brutalist digital grids, pixel art accents, and neon fluid gradients (`--gradient-primary`) with Renaissance/Baroque art themes (Vermeer, Tiepolo, Bruegel) to ground the modern tech stack in timeless aesthetics.

<table align="center">
  <tr>
    <td width="50%">
      <img src="public/images/og-image-blog.webp" alt="Blog: The Astronomer" />
    </td>
    <td width="50%">
      <img src="public/images/og-image-gallery.webp" alt="Gallery: The Art of Painting" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/images/og-image-lab.webp" alt="Lab: The Fall of Icarus" />
    </td>
    <td width="50%">
      <img src="public/images/og-image-projects.webp" alt="Projects: The Forge of Vulcan" />
    </td>
  </tr>
</table>

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (or Vercel Postgres) for the Lab waitlist and guestbook
- Google Drive API ID for the font pipeline

### Installation

```bash
# Clone the repository
git clone https://github.com/Harrychangtw/portfolio_site.git
cd portfolio_site

# Install dependencies (runs prisma generate automatically)
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables (.env.local)

```bash
# Database
DATABASE_POSTGRES_URL=postgres://user:pass@host/db
DATABASE_PRISMA_DATABASE_URL=postgres://user:pass@host/db?pgbouncer=true

# Spotify API (for contextual footer widget)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token

# Build Assets
FONT_DRIVE_ID=your_google_drive_file_id
```

### Start Development

```bash
# Fetch required fonts before first run
node apps/harrychang-me/scripts/fetch-fonts.mjs

# Run database migrations
npx prisma migrate dev

# Start development server
pnpm dev                 # Main site on http://localhost:3000
```

## 📝 Content Management

1. **Adding Projects/Posts:** Add markdown files with YAML frontmatter to `/content/`. Add `_zh-tw` suffix for localized versions. (Blog posts require a `YYYY_MM_DD_` prefix).
2. **Optimizing Media:** Place raw images in `public/images/` and run `pnpm --filter harry-chang-portfolio optimize-images` to auto-generate WebP variants.
3. **Updating Translations:** Edit the namespaces inside `public/locales/en/` and `public/locales/zh-TW/`.

## 📄 License

This project uses a dual-licensing model. The source code is licensed under **CC BY-NC 4.0**, while the creative content (text, images, markdown files in `/content/`, and assets in `/public/`) is under standard copyright.

**All Rights Reserved for Content.** No part of the original creative material may be reproduced without prior written permission.

## 🙏 Acknowledgments

Built with:

- [Next.js 15](https://nextjs.org/) & [React 19](https://react.dev/)
- [Turborepo](https://turbo.build/)
- [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- [Motion](https://motion.dev/)
- [Prisma](https://www.prisma.io/)
- [v0](https://v0.app/)
