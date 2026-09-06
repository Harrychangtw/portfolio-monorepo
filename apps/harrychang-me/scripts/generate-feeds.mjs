#!/usr/bin/env node

/**
 * Build-time RSS generation for the harrychang.me blog.
 *
 * Emits one RSS 2.0 feed per language, mirroring what /blog shows:
 *   public/feed.xml        English posts        (content/posts/<slug>.md)
 *   public/feed-zh-tw.xml  Chinese posts        (content/posts/<slug>_zh-tw.md)
 *
 * Static files rather than a route handler, for the same reason the social
 * redirects live in next.config.mjs: the CDN can serve them without invoking
 * a function, and the source of truth only changes at build time anyway.
 *
 * Summaries, not full text. The post HTML from `getPostData` carries
 * placeholder divs that only mean something once React hydrates them
 * (markdown-compare-placeholder, video-embed-container), so shipping it into
 * feed readers would render blank gaps where the compare sliders and video
 * embeds are. Title card + description + link degrades honestly instead.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const MAIN_DOMAIN = "https://www.harrychang.me";
const AUTHOR = "Harry Chang";
const AUTHOR_EMAIL = "chiwei@harrychang.me";
const APP_ROOT = path.join(__dirname, "..");
const POSTS_DIR = path.join(APP_ROOT, "content", "posts");
const PUBLIC_DIR = path.join(APP_ROOT, "public");

// Feed readers poll; there is no reason to hand them the entire archive.
const MAX_ITEMS = 50;

const FEEDS = [
  {
    locale: "en",
    file: "feed.xml",
    language: "en",
    title: "Harry Chang 張祺煒",
    description:
      "Film essays, hardware reflections, and the things worth sitting with. Writing by Harry Chang on technology, creation, and curiosity.",
    readMore: "Read the full post →",
  },
  {
    locale: "zh-TW",
    file: "feed-zh-tw.xml",
    language: "zh-TW",
    title: "Harry Chang 張祺煒",
    description:
      "電影隨筆、器材心得，以及那些值得慢慢咀嚼的事。張祺煒關於技術、創作與好奇心的書寫。",
    readMore: "閱讀全文 →",
  },
];

const isZhSlug = (slug) => /_zh-tw$/i.test(slug);

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// The CDATA payload is parsed as HTML, not XML, so it gets HTML escaping:
// text nodes need only &<>, and `&apos;` — legal in XML but not in HTML 4 —
// would otherwise surface literally in older readers.
function escapeHtmlText(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtmlAttr(value) {
  return escapeHtmlText(value).replace(/"/g, "&quot;");
}

// CDATA cannot contain the terminator itself; split it across two sections.
function cdata(value) {
  return `<![CDATA[${String(value).replace(/\]\]>/g, "]]]]><![CDATA[>")}]]>`;
}

// RSS 2.0 requires RFC 822 dates. Date-only frontmatter ("2026-02-10") parses
// as UTC midnight, which is what the sitemap assumes too.
function toRfc822(date) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toUTCString();
}

function absoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${MAIN_DOMAIN}/${String(pathOrUrl).replace(/^\/+/, "")}`;
}

function readPosts() {
  if (!fs.existsSync(POSTS_DIR)) {
    console.warn(`⚠️  Posts directory not found: ${POSTS_DIR}`);
    return [];
  }

  const now = Date.now();

  return (
    fs
      .readdirSync(POSTS_DIR)
      .filter((file) => file.endsWith(".md"))
      .map((file) => {
        const slug = file.replace(/\.md$/, "");
        const { data } = matter(
          fs.readFileSync(path.join(POSTS_DIR, file), "utf8"),
        );
        return { slug, ...data };
      })
      .filter((post) => {
        if (post.hidden) return false;
        if (!post.title || !post.date) return false;
        // `locked` posts count down to their own date on the blog cards; keep
        // them out of the feed until that countdown has run out.
        if (post.locked && new Date(post.date).getTime() > now) return false;
        return toRfc822(post.date) !== null;
      })
      // Feeds are strictly reverse-chronological. `pinned` orders the blog
      // index, but a pinned post arriving at the top of someone's reader years
      // after they read it is just noise.
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  );
}

function buildItem(post, feed) {
  const link = `${MAIN_DOMAIN}/blog/${post.slug}`;
  const description = post.description || post.title;

  // Inline <img> rather than <enclosure>. Title cards are multi-megabyte
  // originals — on the site next/image resizes them, but a feed has no such
  // step, and readers fetch enclosures eagerly while inline images wait until
  // the item is opened. (The /_next/image endpoint is not an option here:
  // `contentDispositionType: 'attachment'` in next.config.mjs would make
  // readers download the file instead of rendering it.)
  const imageSrc = absoluteUrl(post.imageUrl);

  const summaryHtml = [
    imageSrc
      ? `<p><img src="${escapeHtmlAttr(imageSrc)}" alt="${escapeHtmlAttr(post.title)}" /></p>`
      : "",
    `<p>${escapeHtmlText(description)}</p>`,
    `<p><a href="${escapeHtmlAttr(link)}">${escapeHtmlText(feed.readMore)}</a></p>`,
  ]
    .filter(Boolean)
    .join("\n");

  const categories = (post.tags || [])
    .map((tag) => `      <category>${escapeXml(tag)}</category>`)
    .join("\n");

  return [
    "    <item>",
    `      <title>${cdata(post.title)}</title>`,
    `      <link>${escapeXml(link)}</link>`,
    `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
    `      <pubDate>${toRfc822(post.date)}</pubDate>`,
    `      <dc:creator>${cdata(post.author || AUTHOR)}</dc:creator>`,
    categories,
    `      <description>${cdata(description)}</description>`,
    `      <content:encoded>${cdata(summaryHtml)}</content:encoded>`,
    "    </item>",
  ]
    .filter(Boolean)
    .join("\n");
}

function buildFeed({ file, language, title, description, readMore }, posts) {
  const self = `${MAIN_DOMAIN}/${file}`;
  const items = posts.slice(0, MAX_ITEMS);

  // Anchored to the newest post rather than `new Date()` so a rebuild with no
  // new writing produces a byte-identical file — these are committed, and a
  // timestamp that moves every build is pure diff noise.
  const lastBuildDate = items.length
    ? toRfc822(items[0].date)
    : toRfc822("1970-01-01");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${cdata(title)}</title>
    <link>${MAIN_DOMAIN}/blog</link>
    <description>${cdata(description)}</description>
    <language>${language}</language>
    <copyright>© ${new Date(items[0]?.date || Date.now()).getUTCFullYear()} ${escapeXml(AUTHOR)}</copyright>
    <managingEditor>${AUTHOR_EMAIL} (${escapeXml(AUTHOR)})</managingEditor>
    <webMaster>${AUTHOR_EMAIL} (${escapeXml(AUTHOR)})</webMaster>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <generator>scripts/generate-feeds.mjs</generator>
    <atom:link href="${self}" rel="self" type="application/rss+xml" />
    <image>
      <url>${MAIN_DOMAIN}/images/og-image-blog.webp</url>
      <title>${cdata(title)}</title>
      <link>${MAIN_DOMAIN}/blog</link>
    </image>
${items.map((post) => buildItem(post, { readMore })).join("\n")}
  </channel>
</rss>
`;
}

function main() {
  console.log("📡 Generating RSS feeds...");

  const posts = readPosts();
  if (posts.length === 0) {
    console.warn("⚠️  No publishable posts found; feeds will be empty.");
  }

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  for (const feed of FEEDS) {
    // Every English post currently has a `_zh-tw` sibling, so each feed is
    // just its own half of the corpus. If a post is ever published in one
    // language only, it simply appears in that language's feed.
    const localePosts = posts.filter((post) =>
      feed.locale === "zh-TW" ? isZhSlug(post.slug) : !isZhSlug(post.slug),
    );

    const outputPath = path.join(PUBLIC_DIR, feed.file);
    fs.writeFileSync(outputPath, buildFeed(feed, localePosts), "utf8");
    console.log(
      `  ✓ ${feed.file} — ${Math.min(localePosts.length, MAX_ITEMS)} items (${feed.language})`,
    );
  }

  console.log("✅ RSS feeds generated");
}

main();
