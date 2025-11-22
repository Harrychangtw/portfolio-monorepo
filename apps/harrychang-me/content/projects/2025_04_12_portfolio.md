---
title: "Portfolio Website"
category: "Web Development"
subcategory: "Personal Project"
description: "A dual-domain portfolio built on a Turborepo monorepo with Next.js, featuring a file-based CMS and shared UI components."
imageUrl: "images/optimized/projects/2025_04_12_portfolio_design/titlecard.webp"
year: "2025"
date: "2025-04-12"
role: "Designer & Developer"
technologies: ["Next.js", "React", "TypeScript", "TailwindCSS"]
pinned: 5
featured: true
---

## Project Overview

This project is a modern, performant platform designed to serve two distinct domains—`harrychang.me` and `lab.harrychang.me`—from a single, unified codebase. Architected as a **Turborepo monorepo**, it manages multiple Next.js applications efficiently. This structure was adopted to streamline development and share code not only between my main portfolio and experimental lab but also to support the development of my sister's portfolio, `emilychang.me`.

The core of the main portfolio is a custom Markdown-based content system. This architecture parses Markdown files from a central `content/` directory at build time to generate static pages, eliminating the need for a traditional database for the main site and resulting in a highly performant and easily maintainable website.

The front end is developed with **React** and **TypeScript**, ensuring a robust, type-safe codebase. The user interface is styled with **TailwindCSS** for rapid, utility-first development and features a responsive three-column layout inspired by the portfolio of [Joseph Zhang](https://joseph.cv/).

![Portfolio website layout and planning in Affinity](images/optimized/projects/2025_04_12_portfolio_design/affinity_branding.webp)

### A Content-First, Multi-Domain Architecture

The heart of this project is its flexible architecture. Next.js middleware dynamically rewrites requests based on the subdomain, directing users to either the main portfolio or the lab while using a single Next.js instance. Content for the main portfolio is stored in Markdown files, effectively creating a headless CMS. A custom script processes these files using several key libraries:

- `gray-matter` parses YAML frontmatter from each file to provide metadata.
- `remark` and `remark-html` convert the Markdown content into HTML for rendering.

This structure cleanly separates content from presentation and allows for simple, Git-baㄇsed content updates.

### Technical Highlights

Performance, scalability, and advanced features were primary goals during development.


**Monorepo Efficiency:** Using **Turborepo**, we share UI components, hooks, and utility functions across different applications from `packages/ui` and `packages/lib`. This drastically reduces code duplication and simplifies dependency management.

**Static & Dynamic Rendering:** The main portfolio uses Static Site Generation (SSG) for exceptional performance. All pages are pre-rendered at build time, and Next.js’s automatic code-splitting ensures minimal load times. The lab section is rendered dynamically to support its database-driven features.

**Dynamic Media:** A custom Remark plugin, `transformMedia`, was developed to intelligently handle various media types. It traverses the Markdown structure to embed YouTube and Google Drive videos with custom placeholders and replaces standard images with optimized figure elements that feature lazy loading and a shimmer effect.

**Image Optimization:** A custom script automates converting images to the modern WebP format. It also resizes them and generates low-quality image placeholders to create a "blur-up" effect while loading.

**Internationalization (i18n):** The site supports English and Traditional Chinese through a custom, client-side React Context. Content is localized based on filename suffixes (`_zh-tw.md`), and the site gracefully falls back to English if a translation is unavailable.

![Lighthouse audit report for the portfolio website.](images/optimized/projects/2025_04_12_portfolio_design/lighthouse_benchmark.webp)


### Content & Features

The portfolio is designed to showcase a variety of work and thought, with key sections including:

- [**Projects Section:**](https://harrychang.me/#projects) A list of projects, each with its own page containing detailed descriptions, images, and videos.
- [**Gallery Section:**](https://harrychang.me/#gallery) A collection of images with dedicated pages, enhanced by a custom framing system for visual presentation.
- [**Manifesto Page:**](https://harrychang.me/manifesto) A dedicated space to express the core principles and philosophies that drive my work.
- [**Paper Reading Section:**](https://harrychang.me/paper-reading) A dynamic list of academic papers I have studied.
- [**Uses**](https://harrychang.me/uses) A list of tools and technologies I use regularly.
The source code for this site is available on [GitHub](https://github.com/Harrychangtw/portfolio-monorepo) under a CC BY-NC 4.0 license. All content, including text and images, is protected by copyright.