#!/usr/bin/env node

/**
 * Build-time sitemap generation for emilychang.me.
 * Shared helpers (frontmatter reading, localized URL expansion, XML
 * serialization) live in @portfolio/lib/sitemap; this script only declares
 * this app's domain, static routes, and content sections.
 *
 * Note: robots.txt is NOT generated here (the checked-in public/robots.txt
 * currently disallows all crawling; flip it manually at launch).
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  formatDate,
  getMarkdownEntries,
  buildLocalizedContentUrls,
  writeSitemap,
} from "@portfolio/lib/sitemap";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Keep in sync with config/site.ts (siteConfig.url).
const DOMAIN = "https://www.emilychang.me";
const APP_ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(APP_ROOT, "public");

const contentDir = (dir) => path.join(APP_ROOT, "content", dir);

function main() {
  console.log("\n🚀 Starting sitemap generation...\n");

  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const today = formatDate(new Date());
    const urls = [];

    // Static pages
    const staticPages = [
      { path: "", priority: 1.0 },
      { path: "/projects", priority: 0.8 },
      { path: "/canvas", priority: 0.8 },
      { path: "/linktree", priority: 0.5 },
    ];

    staticPages.forEach(({ path: pagePath, priority }) => {
      urls.push({
        loc: `${DOMAIN}${pagePath}`,
        lastmod: today,
        changefreq: "weekly",
        priority,
        // No zh-TW alternates while the app runs with `englishOnly`;
        // add `?lang=zh-TW` alternates when bilingual mode launches.
      });
    });

    // Content sections (canvas pages are backed by content/gallery)
    const sections = [
      { dir: "projects", basePath: "/projects", priority: 0.7 },
      { dir: "gallery", basePath: "/canvas", priority: 0.6 },
    ];

    for (const { dir, basePath, priority } of sections) {
      const entries = getMarkdownEntries(contentDir(dir));
      const sectionUrls = buildLocalizedContentUrls({
        domain: DOMAIN,
        basePath,
        entries,
        priority,
      });
      urls.push(...sectionUrls);
      console.log(`  ✓ Added ${sectionUrls.length} ${dir} URLs`);
    }

    const outputPath = writeSitemap(path.join(OUTPUT_DIR, "sitemap.xml"), urls);
    console.log(`\n✅ Sitemap generated: ${outputPath} (${urls.length} URLs)\n`);
  } catch (error) {
    console.error("\n❌ Error generating sitemap:", error);
    process.exit(1);
  }
}

main();
