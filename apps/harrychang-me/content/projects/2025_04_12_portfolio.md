---
title: "Portfolio Website"
category: "Web Development"
subcategory: "Personal Project"
description: "A modern portfolio website built with Next.js and a Markdown-based content management system for easy updates."
imageUrl: "images/optimized/projects/2025_04_12_portfolio_design/titlecard.webp"
year: "2025"
date: "2025-04-12"
role: "Designer & Developer"
technologies: ["Next.js", "React", "TypeScript", "TailwindCSS"]
pinned: 5
featured: true
---

## Project Overview

This portfolio is a modern, statically generated website designed to provide a fast and content-centric user experience. Built with **Next.js**, the site’s foundation is a custom Markdown-based content system. This unique architecture parses Markdown files at build time to create static pages, eliminating the need for a traditional database and resulting in a highly performant and easily maintainable website.

The front end is developed with **React** and **TypeScript**, ensuring a robust, type-safe codebase. The user interface is styled with **TailwindCSS** for rapid, utility-first development and features a responsive three-column layout inspired by the portfolio of [Joseph Zhang](https://joseph.cv/).

### A Content-First Architecture

The core of this project is its Markdown-powered content system. All content for projects and the gallery is stored in Markdown files within the `content/**` directory, which effectively acts as a headless CMS. A custom script processes these files using several key libraries:

- `gray-matter` parses YAML frontmatter from each file to provide metadata.
- `remark` and `remark-html` convert the Markdown content into HTML for rendering.

This structure cleanly separates content from presentation, making site updates simple and efficient.

### Technical Highlights

Performance and advanced features were primary goals during development.

**Static Performance:** By using Static Site Generation (SSG), all pages are pre-rendered at build time. This, combined with Next.js’s automatic code-splitting, ensures that only the necessary code is loaded for each page, resulting in exceptionally fast load times.

**Dynamic Media:** A custom Remark plugin, `transformMedia`, was developed to intelligently handle various media types. It traverses the Markdown structure to embed YouTube and Google Drive videos with custom placeholders, and it replaces standard images with optimized figure elements that feature lazy loading and a shimmer effect for a smooth visual experience.

**Image Optimization:** A custom script automates the process of converting images to the modern WebP format. It also resizes them and generates low-quality image placeholders to create a "blur-up" effect while loading.

**Internationalization (i18n):** The site fully supports both English and Traditional Chinese. Content is filtered based on the current locale using a file-based routing system. Chinese content is identified by the `_zh-tw.md` suffix, and the site gracefully falls back to English if a translation is unavailable.
### Content & Features

The portfolio is designed to showcase a variety of work and thought.

- **Projects Section:** A list of projects, each with its own page containing detailed descriptions, images, and videos used. Projects are still being retroactively added, so some may be under construction.
- **Gallery Section:** A collection of images, each with a dedicated page for detailed viewing, with some having additional images to complete a narrative. The gallery features a custom framing system that enhances the visual presentation of each piece.
- **Manifesto Page:** A dedicated space to express the core principles and philosophies that drive my work, presented on a standalone page for focused reading.
- **Paper Reading Section:** A dynamic list of academic papers I have studied.

The source code for this site is available on [GitHub](https://github.com/Harrychangtw/portfolio_site) under a CC BY-NC 4.0 license. All content, including text and images, is protected by copyright.