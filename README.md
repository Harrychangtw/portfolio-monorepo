## Overview

This project showcases a Next.js application featuring:

- **Content Management**: Filesystem-based CMS using Markdown files
- **Internationalization**: Multi-language support (English, Traditional Chinese)
- **Image Pipeline**: Automated optimization with WebP conversion and responsive variants
- **Modern Stack**: TypeScript, Next.js App Router, Tailwind CSS, Radix UI

## Key Features

### Backend Architecture
- RESTful API routes for dynamic content serving
- Server-side markdown parsing with gray-matter
- Locale-aware content loading
- Automated image optimization pipeline

### Content Types
- Projects with metadata and categorization
- Gallery items with photography EXIF data
- Academic papers with summaries
- Template system for new content creation

### Image Optimization
Automated script that:
- Converts images to WebP format
- Generates multiple resolution variants
- Creates blur-up thumbnails for progressive loading
- Outputs optimized files to `/public/images/optimized/`

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Optimize images before deployment
npm run optimize-images

# Build for production
npm run build
npm run start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   └── [locale]/          # Internationalized pages
├── components/            # React components
│   └── ui/               # Reusable UI components
├── content/              # Markdown content files
│   ├── projects/
│   ├── gallery/
│   └── papers/
├── lib/                  # Utility functions
├── public/               # Static assets
│   ├── images/          # Source images
│   └── locales/         # Translation files
└── scripts/             # Build and optimization scripts
```

## Content Management

Content is managed through markdown files with YAML frontmatter. See `/content/templates/` for starter templates.

Content files support localization via filename suffixes (e.g., `project_zh-tw.md`).

## License

This project is licensed under [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).

You are free to:
- **Share** — copy and redistribute the material
- **Adapt** — remix, transform, and build upon the material

Under the following terms:
- **Attribution** — You must give appropriate credit
- **NonCommercial** — You may not use the material for commercial purposes

## Reference Purpose

This site is primarily intended as a **reference implementation** demonstrating:
- File-based CMS patterns
- API route architecture
- Content localization strategies
- Image optimization workflows
- TypeScript + Next.js best practices

Feel free to reference the code for educational and non-commercial projects.