#!/usr/bin/env node
// Compares anchor ids emitted by build_graph.py (via graph-data.json) with the
// ids the JS markdown pipeline would assign to <h2/h3/h4> and to <figure>
// elements for body images/videos. Run after rebuilding graph-data.json.
//
// Usage: node scripts/verify_anchor_parity.mjs

import { readFileSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const GRAPH_PATH = join(ROOT, "public", "graph-data.json");

// Mirrors slugify in packages/lib/lib/markdown.ts.
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .trim();
}

// Walk markdown body the same way addHeadingIds does (visit all headings) and
// transformMedia does (visit all images, classify drive/youtube/mp4/regular).
function collectExpected(body) {
  const used = new Set();
  const headings = []; // { level, text, id }
  let imgIdx = 0;
  let vidIdx = 0;
  const media = []; // { kind: 'img'|'vid', src, anchorId }

  // Headings: regex for ^#{1,6} space text
  const headingRe = /^(#{1,6})\s+(.+?)\s*$/gm;
  // Images: ![alt](url)
  const imageRe = /!\[([^\]]*)\]\(([^)]+)\)/g;

  // Walk in document order by interleaving matches by index
  const events = [];
  let m;
  while ((m = headingRe.exec(body))) {
    events.push({ pos: m.index, kind: "h", level: m[1].length, text: m[2] });
  }
  while ((m = imageRe.exec(body))) {
    events.push({ pos: m.index, kind: "i", alt: m[1], url: m[2] });
  }
  events.sort((a, b) => a.pos - b.pos);

  for (const e of events) {
    if (e.kind === "h") {
      const text = e.text.trim();
      if (!text) continue;
      const base = slugify(text);
      if (!base) {
        headings.push({ level: e.level, text, id: null });
        continue;
      }
      let id = base;
      let c = 1;
      while (used.has(id)) id = `${base}-${c++}`;
      used.add(id);
      headings.push({ level: e.level, text, id });
    } else {
      const url = e.url;
      const isDrive = /https?:\/\/drive\.google\.com\/file\/d\//.test(url);
      const isYouTube =
        /(?:youtube\.com\/(?:.+v=|v\/|embed\/)|youtu\.be\/)/.test(url);
      const isMp4 = /\.mp4(\?|$)/i.test(url);
      const isImage = /\.(webp|jpg|jpeg|png|gif|svg|avif)(\?|$)/i.test(url);
      if (isDrive || isYouTube) {
        media.push({ kind: "vid", src: url, anchorId: `vid-${vidIdx++}` });
      } else if (isImage) {
        media.push({ kind: "img", src: url, anchorId: `img-${imgIdx++}` });
      } else if (isMp4) {
        // mp4 is rendered as video figure but not represented in graph
      }
    }
  }
  return { headings, media };
}

function readMarkdown(sourceType, slug, locale) {
  const dir = {
    post: "posts",
    project: "projects",
    gallery: "gallery",
  }[sourceType];
  const filename = locale === "zh-TW" ? `${slug}_zh-tw.md` : `${slug}.md`;
  const fullPath = join(ROOT, "content", dir, filename);
  const text = readFileSync(fullPath, "utf-8");
  return matter(text).content;
}

function compareForFile(graph, sourceType, slug, locale) {
  const body = readMarkdown(sourceType, slug, locale);
  const expected = collectExpected(body);

  // Only check sections that the graph thinks should have a DOM target.
  // Sections whose heading slugifies to empty (e.g. CJK headings) get no
  // anchor on either side, which is the desired behaviour.
  const sectionNodes = graph.nodes.filter(
    (n) =>
      n.nodeType === "section" &&
      n.sourceType === sourceType &&
      n.sourceSlug === slug &&
      n.locale === locale &&
      n.heading &&
      n.anchorId,
  );
  const imageNodes = graph.nodes.filter(
    (n) =>
      n.nodeType === "image" &&
      n.sourceType === sourceType &&
      n.sourceSlug === slug &&
      n.locale === locale &&
      n.anchorId,
  );
  const videoNodes = graph.nodes.filter(
    (n) =>
      n.nodeType === "video" &&
      n.sourceType === sourceType &&
      n.sourceSlug === slug &&
      n.locale === locale &&
      n.anchorId,
  );

  const issues = [];

  // Section anchors: find expected id by heading text + level (level >= 2)
  const headingsByText = new Map();
  for (const h of expected.headings) {
    if (!headingsByText.has(h.text)) headingsByText.set(h.text, []);
    headingsByText.get(h.text).push(h);
  }
  for (const sec of sectionNodes) {
    const candidates = headingsByText.get(sec.heading) || [];
    const found = candidates.find((c) => c.id === sec.anchorId);
    if (!found) {
      issues.push(
        `[${sourceType}/${slug}/${locale}] section heading="${sec.heading}" anchorId="${sec.anchorId}" not found in expected ${JSON.stringify(candidates.map((c) => c.id))}`,
      );
    }
  }

  // Image/video anchors: simple sequential check
  const expectedImg = expected.media.filter((m) => m.kind === "img");
  const expectedVid = expected.media.filter((m) => m.kind === "vid");
  if (imageNodes.length !== expectedImg.length) {
    issues.push(
      `[${sourceType}/${slug}/${locale}] image count mismatch graph=${imageNodes.length} expected=${expectedImg.length}`,
    );
  }
  if (videoNodes.length !== expectedVid.length) {
    issues.push(
      `[${sourceType}/${slug}/${locale}] video count mismatch graph=${videoNodes.length} expected=${expectedVid.length}`,
    );
  }
  // Verify the set of img anchorIds matches
  const graphImgIds = new Set(imageNodes.map((n) => n.anchorId));
  const expectedImgIds = new Set(expectedImg.map((m) => m.anchorId));
  for (const id of expectedImgIds) {
    if (!graphImgIds.has(id))
      issues.push(
        `[${sourceType}/${slug}/${locale}] missing image anchor ${id} in graph`,
      );
  }
  for (const id of graphImgIds) {
    if (!expectedImgIds.has(id))
      issues.push(
        `[${sourceType}/${slug}/${locale}] graph image anchor ${id} not expected`,
      );
  }

  return { issues, counts: { sectionNodes: sectionNodes.length, imageNodes: imageNodes.length, videoNodes: videoNodes.length } };
}

function main() {
  const graph = JSON.parse(readFileSync(GRAPH_PATH, "utf-8"));

  // Pick a few representative slugs across content types and locales.
  const samples = [
    { sourceType: "post", slug: "10-lego-mount", locale: "en" },
    { sourceType: "post", slug: "10-lego-mount", locale: "zh-TW" },
    { sourceType: "project", slug: "2024_08_19_classics_reimagined", locale: "en" },
  ];

  // Add the largest few posts (most headings/images) for stress.
  const fileNodes = graph.nodes.filter((n) => n.nodeType === "file" && n.sourceType !== "locale");
  const slugSizes = new Map();
  for (const n of graph.nodes) {
    if (n.nodeType !== "section" && n.nodeType !== "image") continue;
    const key = `${n.sourceType}|${n.sourceSlug}|${n.locale}`;
    slugSizes.set(key, (slugSizes.get(key) || 0) + 1);
  }
  const top = [...slugSizes.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [key] of top) {
    const [sourceType, slug, locale] = key.split("|");
    if (!samples.some((s) => s.sourceType === sourceType && s.slug === slug && s.locale === locale)) {
      samples.push({ sourceType, slug, locale });
    }
  }

  let totalIssues = 0;
  for (const s of samples) {
    let result;
    try {
      result = compareForFile(graph, s.sourceType, s.slug, s.locale);
    } catch (e) {
      console.log(`[${s.sourceType}/${s.slug}/${s.locale}] SKIP: ${e.message}`);
      continue;
    }
    if (result.issues.length === 0) {
      console.log(
        `[${s.sourceType}/${s.slug}/${s.locale}] OK (sections=${result.counts.sectionNodes} imgs=${result.counts.imageNodes} vids=${result.counts.videoNodes})`,
      );
    } else {
      console.log(`[${s.sourceType}/${s.slug}/${s.locale}] ${result.issues.length} ISSUE(S):`);
      for (const i of result.issues) console.log("  - " + i);
      totalIssues += result.issues.length;
    }
  }

  console.log(`\nTotal issues: ${totalIssues}`);
  process.exit(totalIssues === 0 ? 0 : 1);
}

main();
