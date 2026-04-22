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

> 🕐 **Last audited:** Wed, 22 Apr 2026 06:07:46 GMT

#### Desktop

| Tested Route                               | Performance                                                                              | FCP   | LCP   | TBT      | CLS   | Speed Index |
| :----------------------------------------- | :--------------------------------------------------------------------------------------- | :---- | :---- | :------- | :---- | :---------- |
| `/`                                        | ![Lighthouse 72](https://img.shields.io/badge/lighthouse-72-important?style=flat-square) | 0.9 s | 4.3 s | 530 ms   | 0     | 1.7 s       |
| `/blog`                                    | ![Lighthouse 79](https://img.shields.io/badge/lighthouse-79-important?style=flat-square) | 0.9 s | 3.9 s | 370 ms   | 0     | 1.9 s       |
| `/blog/2025_12_19_xpro1`                   | ![Lighthouse 63](https://img.shields.io/badge/lighthouse-63-important?style=flat-square) | 0.9 s | 6.0 s | 610 ms   | 0     | 2.1 s       |
| `/blog/2025_12_22_aftersun_paris_texas`    | ![Lighthouse 64](https://img.shields.io/badge/lighthouse-64-important?style=flat-square) | 0.9 s | 6.3 s | 520 ms   | 0     | 2.4 s       |
| `/blog/2026_01_10_plushies`                | ![Lighthouse 65](https://img.shields.io/badge/lighthouse-65-important?style=flat-square) | 0.9 s | 6.0 s | 510 ms   | 0     | 2.0 s       |
| `/blog/2026_02_10_synecdoche_truman`       | ![Lighthouse 64](https://img.shields.io/badge/lighthouse-64-important?style=flat-square) | 0.9 s | 6.2 s | 560 ms   | 0     | 2.2 s       |
| `/blog/9_m11d`                             | ![Lighthouse 64](https://img.shields.io/badge/lighthouse-64-important?style=flat-square) | 0.9 s | 5.9 s | 590 ms   | 0     | 2.0 s       |
| `/cv`                                      | ![Lighthouse 82](https://img.shields.io/badge/lighthouse-82-important?style=flat-square) | 0.9 s | 3.8 s | 320 ms   | 0     | 1.4 s       |
| `/design`                                  | ![Lighthouse 66](https://img.shields.io/badge/lighthouse-66-important?style=flat-square) | 0.9 s | 5.7 s | 500 ms   | 0     | 1.9 s       |
| `/gallery`                                 | ![Lighthouse 75](https://img.shields.io/badge/lighthouse-75-important?style=flat-square) | 0.9 s | 3.9 s | 510 ms   | 0     | 2.0 s       |
| `/gallery/2023_07_07_splash_of_red`        | ![Lighthouse 68](https://img.shields.io/badge/lighthouse-68-important?style=flat-square) | 0.9 s | 5.6 s | 450 ms   | 0     | 2.1 s       |
| `/gallery/2023_10_06_against_giants`       | ![Lighthouse 68](https://img.shields.io/badge/lighthouse-68-important?style=flat-square) | 0.9 s | 5.6 s | 460 ms   | 0     | 2.1 s       |
| `/gallery/2023_11_18_dusk_impressions`     | ![Lighthouse 68](https://img.shields.io/badge/lighthouse-68-important?style=flat-square) | 0.9 s | 5.6 s | 460 ms   | 0     | 2.2 s       |
| `/gallery/2024_01_06_hehuanshan`           | ![Lighthouse 69](https://img.shields.io/badge/lighthouse-69-important?style=flat-square) | 0.9 s | 5.6 s | 430 ms   | 0     | 2.0 s       |
| `/gallery/2026_02_08_italy_mountain`       | ![Lighthouse 65](https://img.shields.io/badge/lighthouse-65-important?style=flat-square) | 0.9 s | 6.2 s | 510 ms   | 0     | 2.4 s       |
| `/graph`                                   | ![Lighthouse 61](https://img.shields.io/badge/lighthouse-61-important?style=flat-square) | 0.9 s | 3.6 s | 2,480 ms | 0     | 2.6 s       |
| `/linktree`                                | ![Lighthouse 76](https://img.shields.io/badge/lighthouse-76-important?style=flat-square) | 0.9 s | 4.2 s | 400 ms   | 0     | 2.2 s       |
| `/manifesto`                               | ![Lighthouse 80](https://img.shields.io/badge/lighthouse-80-important?style=flat-square) | 0.9 s | 4.2 s | 290 ms   | 0     | 1.6 s       |
| `/paper-reading`                           | ![Lighthouse 80](https://img.shields.io/badge/lighthouse-80-important?style=flat-square) | 0.9 s | 4.0 s | 300 ms   | 0     | 1.4 s       |
| `/projects`                                | ![Lighthouse 79](https://img.shields.io/badge/lighthouse-79-important?style=flat-square) | 0.9 s | 3.9 s | 370 ms   | 0     | 1.8 s       |
| `/projects/2024_08_19_classics_reimagined` | ![Lighthouse 65](https://img.shields.io/badge/lighthouse-65-important?style=flat-square) | 0.9 s | 5.7 s | 560 ms   | 0     | 2.1 s       |
| `/projects/2024_09_23_chingshin_rag`       | ![Lighthouse 66](https://img.shields.io/badge/lighthouse-66-important?style=flat-square) | 0.9 s | 5.6 s | 510 ms   | 0     | 2.2 s       |
| `/projects/2025_03_08_sitcon_keynote`      | ![Lighthouse 65](https://img.shields.io/badge/lighthouse-65-important?style=flat-square) | 0.9 s | 6.1 s | 510 ms   | 0     | 2.4 s       |
| `/projects/2025_04_12_portfolio`           | ![Lighthouse 65](https://img.shields.io/badge/lighthouse-65-important?style=flat-square) | 0.9 s | 5.7 s | 550 ms   | 0     | 2.1 s       |
| `/projects/2025_08_04_debate`              | ![Lighthouse 65](https://img.shields.io/badge/lighthouse-65-important?style=flat-square) | 0.9 s | 5.7 s | 550 ms   | 0     | 2.2 s       |
| `/uses`                                    | ![Lighthouse 66](https://img.shields.io/badge/lighthouse-66-important?style=flat-square) | 0.9 s | 4.4 s | 330 ms   | 0.239 | 2.0 s       |

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
