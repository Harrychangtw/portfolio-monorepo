#!/usr/bin/env node

/**
 * Build-time sitemap generation for harrychang.me.
 * Generates static XML sitemaps for both main and lab domains, robots.txt,
 * and a sitemap index. Shared helpers (frontmatter reading, localized URL
 * expansion, XML serialization) live in @portfolio/lib/sitemap; this script
 * only declares this app's domains, static routes, and content sections.
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

const MAIN_DOMAIN = "https://www.harrychang.me";
const LAB_DOMAIN = "https://lab.harrychang.me";
const APP_ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(APP_ROOT, "public");

const contentDir = (dir) => path.join(APP_ROOT, "content", dir);

function generateMainSitemap() {
  console.log("🌐 Generating main domain sitemap...");

  const today = formatDate(new Date());
  const urls = [];

  // Static pages
  const staticPages = [
    { path: "", priority: 1.0 },
    { path: "/projects", priority: 0.8 },
    { path: "/gallery", priority: 0.8 },
    { path: "/blog", priority: 0.8 },
  ];

  staticPages.forEach(({ path: pagePath, priority }) => {
    urls.push({
      loc: `${MAIN_DOMAIN}${pagePath}`,
      lastmod: today,
      changefreq: "weekly",
      priority,
      alternates: {
        en: `${MAIN_DOMAIN}${pagePath}`,
        "zh-TW": `${MAIN_DOMAIN}${pagePath}?lang=zh-TW`,
      },
    });
  });

  // Content sections
  const sections = [
    { dir: "projects", basePath: "/projects", priority: 0.7 },
    { dir: "gallery", basePath: "/gallery", priority: 0.6 },
    { dir: "posts", basePath: "/blog", priority: 0.7 },
  ];

  for (const { dir, basePath, priority } of sections) {
    const entries = getMarkdownEntries(contentDir(dir));
    const sectionUrls = buildLocalizedContentUrls({
      domain: MAIN_DOMAIN,
      basePath,
      entries,
      priority,
    });
    urls.push(...sectionUrls);
    console.log(`  ✓ Added ${sectionUrls.length} ${dir} URLs`);
  }

  const outputPath = writeSitemap(path.join(OUTPUT_DIR, "sitemap.xml"), urls);
  console.log(`✅ Main sitemap generated: ${outputPath} (${urls.length} URLs)`);
  return urls.length;
}

function generateLabSitemap() {
  console.log("🧪 Generating lab domain sitemap...");

  const urls = [
    {
      loc: LAB_DOMAIN,
      lastmod: formatDate(new Date()),
      changefreq: "weekly",
      priority: 1.0,
    },
  ];

  const outputPath = writeSitemap(
    path.join(OUTPUT_DIR, "sitemap-lab.xml"),
    urls,
  );
  console.log(`✅ Lab sitemap generated: ${outputPath} (${urls.length} URLs)`);
  return urls.length;
}

function generateRobotsTxt() {
  console.log("🤖 Generating robots.txt...");

  const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${MAIN_DOMAIN}/sitemap.xml
Sitemap: ${LAB_DOMAIN}/sitemap-lab.xml

# Disallow admin/private routes (if any)
Disallow: /api/
`;

  const outputPath = path.join(OUTPUT_DIR, "robots.txt");
  fs.writeFileSync(outputPath, robotsTxt, "utf8");
  console.log(`✅ robots.txt generated: ${outputPath}`);
}

function generateSitemapIndex() {
  console.log("📑 Generating sitemap index...");

  const today = new Date().toISOString().split("T")[0];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${MAIN_DOMAIN}/sitemap.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${LAB_DOMAIN}/sitemap-lab.xml</loc>
    <lastmod>${today}</lastmod>
  </sitemap>
</sitemapindex>`;

  const outputPath = path.join(OUTPUT_DIR, "sitemap-index.xml");
  fs.writeFileSync(outputPath, xml, "utf8");
  console.log(`✅ Sitemap index generated: ${outputPath}`);
}

async function main() {
  console.log("\n🚀 Starting sitemap generation...\n");

  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const mainCount = generateMainSitemap();
    const labCount = generateLabSitemap();
    generateRobotsTxt();
    generateSitemapIndex();

    console.log("\n✨ Sitemap generation complete!");
    console.log(`   Total URLs: ${mainCount + labCount}`);
    console.log(`   Main domain: ${mainCount} URLs`);
    console.log(`   Lab domain: ${labCount} URLs\n`);
  } catch (error) {
    console.error("\n❌ Error generating sitemaps:", error);
    process.exit(1);
  }
}

main();
