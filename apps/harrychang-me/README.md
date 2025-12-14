# Harry Chang Portfolio Site

<p align="center">
  <img src="public/images/optimized/projects/og/ogimage.webp" alt="Harry Chang Portfolio Site" width="1800" />
</p>


A modern, performant portfolio website built with Next.js 15, featuring a dual-domain architecture, custom i18n implementation, file-based CMS, and advanced image optimization.


## Key Features
### Dual-Domain Architecture
- **Main site** (`harrychang.me`): Portfolio, projects, gallery
- **Lab subdomain** (`lab.harrychang.me`): Future hub for courses and engaging educational content
- Single codebase with middleware-based routing
- Shared resources (API, images, translations) across both domains

### Content Management
- **Markdown-based CMS** with YAML frontmatter
- Bilingual support (English/Traditional Chinese) via file suffixes
- Dynamic content serving through API routes
- Automated arXiv paper fetching and aggregation
- Template system for quick content creation

### Advanced Image Optimization
- Automated WebP conversion with multiple quality tiers
- Progressive loading with blur-up thumbnails (20px)
- Dimension detection to prevent Cumulative Layout Shift (CLS)
- Responsive sizes optimized for different content types:
  - Title/Hero images: 3200-3840px @ 95-98% quality
  - Standard images: 2000-2560px @ 90% quality
  - Thumbnails: 20px @ 60% quality with blur

### Custom Internationalization
- Client-side i18n with React Context (no next-i18next runtime)
- Dynamic JSON translation loading from `/public/locales/`
- FOUC prevention with visibility gating
- HTML parsing for rich text content with links
- Browser language detection with localStorage persistence

### Tech Stack
- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS with custom design system, Radix UI components
- **Animation**: Framer Motion
- **Database**: PostgreSQL (Vercel Postgres) with Prisma ORM
- **Testing**: Vitest with React Testing Library
- **Image Processing**: Sharp
- **Markdown**: gray-matter, remark, remark-html

## 🎨 Design Philosophy

This portfolio deviates from standard web trends (massive hero images, scroll-jacking animations) to focus on **intent-driven navigation** and **micro-interactions**.

### The "Anti-Hero" Architecture
The site lacks a traditional "Hero" section. This is a deliberate UX choice based on the premise that visitors arriving at the domain already possess intent. Instead of forcing users to scroll past a splash screen, the site offers immediate access to content (`About`, `Updates`), respecting the visitor's time and attention.

### Micro-Interactions over Macro-Animations
Large-scale layout animations were avoided to maintain high performance and readability. Instead, "delighters" were implemented to reward user interaction:
- **Click Sparks:** A subtle particle effect on desktop clicks that adds tactile feedback.
- **Contextual Footer:** The footer serves as a secondary navigation hub with a dynamic Spotify integration that reveals "Now Playing" data only on hover/interaction.
- **Visual Feedback:** A custom indeterminate loading bar integrated into the header provides system status without layout shifts.

### Visual Framing
The [Gallery] section utilizes a custom framing engine that calculates image aspect ratios (Portrait vs. Cinematic vs. Standard) to apply specific border padding dynamically. This ensures that regardless of the source media dimensions, the visual rhythm of the grid remains consistent and museum-like.


### Aesthetic Direction: Classical Integration
The site integrates classical artwork (featuring Vermeer, Tiepolo, and others) as distinct visual motifs for each section. This juxtaposition of Renaissance/Baroque art with a brutalist digital grid grounds the modern tech stack in timeless aesthetics.

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
- Node.js 18+ and npm
- PostgreSQL database (or Vercel Postgres) if intending to setup the lab site

### Installation

```bash
# Clone the repository
git clone https://github.com/Harrychangtw/portfolio_site.git
cd portfolio_site

# Install dependencies (runs prisma generate automatically)
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your database credentials and API keys

# Run database migrations
npx prisma migrate dev

# Start development server
pnpm dev                 # Main site on http://localhost:3000
```

### Environment Variables

Create `.env.local` with the following:

```bash
# Database (Vercel Postgres or local PostgreSQL) This is not needed for the main portfolio site to run
DATABASE_POSTGRES_URL=postgres://user:pass@host/db
DATABASE_PRISMA_DATABASE_URL=postgres://user:pass@host/db?pgbouncer=true&connect_timeout=15

# Spotify API (for now-playing widget)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token
```

## 📝 Content Management

### Adding a New Project

1. Create markdown file: `content/projects/my-project.md`
2. Add frontmatter:
```markdown
---
title: "My Project"
category: "Design"
description: "A brief description"
imageUrl: "/images/projects/my-project/cover.jpg"
date: "2024-11-04"
year: "2024"
pinned: -1        # -1 = not pinned, 1-10 = pin priority (1 = highest)
featured: true
technologies: ["Next.js", "TypeScript"]
---
```
3. Write content in markdown below frontmatter
4. Add images to `public/images/projects/my-project/`
5. Run `npm run optimize-images` to generate WebP variants
6. Commit and deploy

### Adding a Chinese Translation

Create a localized version with `_zh-tw.md` suffix:
- English: `content/projects/my-project.md`
- Chinese: `content/projects/my-project_zh-tw.md`

The system automatically shows the appropriate version based on user language preference.

### Image Optimization Workflow

```bash
# 1. Add original images (JPG/PNG) to public/images/[projects|gallery]/[slug]/
# 2. Run optimization script
node scripts/optimize-images.mjs

# Output: Generates WebP files in public/images/optimized/
# - image.webp (full resolution)
# - image-thumb.webp (20px blur thumbnail)
```

The markdown system automatically converts image paths to optimized versions.

## 🧪 Development

### Available Scripts

```bash
pnpm dev              # Start main site (:3000)
pnpm build            # Production build (runs prebuild hooks)
pnpm start            # Start production server
node scripts/optimize-images.mjs  # Optimize all images in public/images/
```

### Build Hooks

The build process runs in this order (see `package.json`):
1. `postinstall`: `prisma generate` (generates Prisma Client)
2. `prebuild`: `prisma migrate deploy` + `node scripts/build-papers.mjs` (fetches arXiv papers)
3. `build`: `npm run build`





## 📄 License

This project uses a dual-licensing model. The source code is licensed under CC BY-NC 4.0, while the creative content (text, images, and other media) is under a standard copyright.

### Code License

The source code used to build and display this website is licensed under the **[Creative Commons Attribution-NonCommercial 4.0 International License (CC BY-NC 4.0)](https://creativecommons.org/licenses/by-nc/4.0/)**.

This includes all files within this repository **except** for the contents of the `/content/` and `/public/` directories.

You are free to:
- **Share** — copy and redistribute the code in any medium or format.
- **Adapt** — remix, transform, and build upon the code for non-commercial purposes.

Under the following terms:
- **Attribution** — You must give appropriate credit.
- **NonCommercial** — You may not use the material for commercial purposes.

### Content License

All original creative content, including but not limited to text, articles, project descriptions, and images, is the exclusive property of Chi-Wei Chang (張祺煒) and is protected by international copyright law.

This applies specifically to all content within the following directories:
- `/content/`
- `/public/`

**All Rights Reserved.**

No part of this content may be reproduced, distributed, or transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written permission of the owner.

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Framer Motion](https://www.framer.com/motion/) - Animation library
- [Prisma](https://www.prisma.io/) - Database ORM
- [Vitest](https://vitest.dev/) - Testing framework
- [v0](https://v0.app/) - Accelerated project prototyping