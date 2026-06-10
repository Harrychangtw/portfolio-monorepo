"use strict";

// Shared build-time sitemap helpers. Each app composes its own URL list in
// scripts/generate-sitemap.mjs (domains, static routes, content sections) and
// uses these helpers for the repetitive parts: reading slugs/dates from
// content/*.md frontmatter, expanding localized (_zh-tw) variants with
// hreflang alternates, and serializing/writing the XML.

const fs = require("node:fs");
const path = require("node:path");

// Format a date to W3C format (YYYY-MM-DD), falling back to today.
function formatDate(date) {
  if (!date) return new Date().toISOString().split("T")[0];
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return new Date().toISOString().split("T")[0];
  }
}

// Read all markdown files from an absolute content directory, returning
// [{ slug, date }] with the date parsed from frontmatter (if present).
function getMarkdownEntries(contentPath) {
  try {
    if (!fs.existsSync(contentPath)) {
      console.warn(`⚠️  Directory not found: ${contentPath}`);
      return [];
    }

    return fs
      .readdirSync(contentPath)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const slug = file.replace(/\.md$/, "");
        const content = fs.readFileSync(path.join(contentPath, file), "utf8");

        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        let date = null;
        if (frontmatterMatch) {
          const dateMatch = frontmatterMatch[1].match(
            /date:\s*["']?([^"'\n]+)["']?/,
          );
          if (dateMatch) date = dateMatch[1];
        }

        return { slug, date };
      });
  } catch (error) {
    console.error(`❌ Error reading ${contentPath}:`, error.message);
    return [];
  }
}

const isZhSlug = (slug) => slug.includes("_zh-tw") || slug.includes("_zh-TW");

// Expand content entries under `${domain}${basePath}/${slug}` into sitemap
// URL records. English entries are primary; when a `_zh-tw` sibling exists it
// is emitted as a separate indexable URL (slightly lower priority) and both
// carry hreflang alternates.
function buildLocalizedContentUrls({
  domain,
  basePath,
  entries,
  priority,
  changefreq = "monthly",
}) {
  const urls = [];

  entries.forEach(({ slug, date }) => {
    if (isZhSlug(slug)) return;

    const chineseEntry = entries.find(
      (e) => e.slug === `${slug}_zh-tw` || e.slug === `${slug}_zh-TW`,
    );
    const chineseSlug = chineseEntry?.slug;

    const alternates = { en: `${domain}${basePath}/${slug}` };
    if (chineseEntry) {
      alternates["zh-TW"] = `${domain}${basePath}/${chineseSlug}`;
    }

    urls.push({
      loc: `${domain}${basePath}/${slug}`,
      lastmod: formatDate(date),
      changefreq,
      priority,
      alternates,
    });

    if (chineseEntry) {
      urls.push({
        loc: `${domain}${basePath}/${chineseSlug}`,
        lastmod: formatDate(chineseEntry.date || date),
        changefreq,
        priority: Math.round((priority - 0.1) * 10) / 10,
        alternates: {
          en: `${domain}${basePath}/${slug}`,
          "zh-TW": `${domain}${basePath}/${chineseSlug}`,
        },
      });
    }
  });

  return urls;
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Serialize URL records to sitemap XML (with xhtml hreflang alternates).
function buildSitemapXML(urls) {
  const urlElements = urls
    .map(({ loc, lastmod, changefreq, priority, alternates }) => {
      let urlXML = `  <url>\n    <loc>${escapeXml(loc)}</loc>\n`;
      if (lastmod) urlXML += `    <lastmod>${escapeXml(lastmod)}</lastmod>\n`;
      if (changefreq)
        urlXML += `    <changefreq>${escapeXml(changefreq)}</changefreq>\n`;
      if (priority !== undefined && priority !== null)
        urlXML += `    <priority>${escapeXml(priority)}</priority>\n`;
      if (alternates) {
        for (const [lang, href] of Object.entries(alternates)) {
          urlXML += `    <xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(href)}"/>\n`;
        }
      }
      urlXML += `  </url>`;
      return urlXML;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlElements}
</urlset>`;
}

// Write a sitemap file, creating the output directory if needed.
function writeSitemap(outputPath, urls) {
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, buildSitemapXML(urls), "utf8");
  return outputPath;
}

module.exports = {
  formatDate,
  getMarkdownEntries,
  buildLocalizedContentUrls,
  buildSitemapXML,
  writeSitemap,
};
