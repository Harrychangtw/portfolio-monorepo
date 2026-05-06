#!/usr/bin/env node
/**
 * Case-exact internal link check for CI.
 *
 * Validates internal links (paths starting with `/`) found in:
 *   - markdown content (markdown links + image refs)
 *   - TS/TSX/JSON source files (string literals)
 *
 * Source of truth is `git ls-files` (Linux/Vercel semantics). Catches typos
 * like `/projects/siton-2026` vs `/projects/sitcon-2026` and case-only
 * mismatches that pass on macOS APFS but 404 on Linux.
 *
 * Pure node, no deps. Exit 1 on any broken ref.
 *
 * Usage (from apps/harrychang-me):
 *   node scripts/check-links.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');
const APP_DIR = path.join(ROOT, 'app');

if (!fs.existsSync(CONTENT_DIR) || !fs.existsSync(APP_DIR)) {
  console.error(`Missing content/ or app/ in ${ROOT}. Run from apps/harrychang-me.`);
  process.exit(2);
}

// ─── Build the set of valid internal targets ────────────────────────────────

const tracked = execFileSync('git', ['ls-files'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

// Tracked image paths as referenced from URL space (drop `public/` prefix, prepend `/`).
const imageRoutes = new Set();
const imageRoutesLower = new Map();
for (const p of tracked) {
  if (p.startsWith('public/')) {
    const url = '/' + p.slice('public/'.length);
    imageRoutes.add(url);
    imageRoutesLower.set(url.toLowerCase(), url);
  }
}

// Slug routes derived from content filenames.
// Convention: filename without `.md` is the slug; locale variants keep the
// `_zh-tw` suffix as part of the slug.
function slugsFromContentDir(rel) {
  const dir = path.join(ROOT, rel);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .map((f) => f.slice(0, -3));
}

const blogSlugs = new Set(slugsFromContentDir('content/posts'));
const projectSlugs = new Set(slugsFromContentDir('content/projects'));
const gallerySlugs = new Set(slugsFromContentDir('content/gallery'));

// Static routes derived from app/ tree. Walks `page.{tsx,ts}` files and maps
// them to URL paths, stripping route groups `(group)` and the `lab/` prefix.
function discoverStaticRoutes() {
  const routes = new Set(['/']);
  function walk(dir, urlSegs) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      if (e.name.startsWith('_')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (e.name.startsWith('[')) continue; // dynamic — handled separately
        const seg =
          e.name.startsWith('(') && e.name.endsWith(')') ? null : e.name;
        walk(full, seg == null ? urlSegs : [...urlSegs, seg]);
      } else if (/^(page|route)\.(tsx|ts|jsx|js)$/.test(e.name)) {
        // The `lab` segment is served from a subdomain, but we still allow
        // `/lab` as an internal link target on the main domain.
        const url = '/' + urlSegs.join('/');
        routes.add(url === '/' ? '/' : url.replace(/\/+$/, ''));
      }
    }
  }
  walk(APP_DIR, []);
  return routes;
}

const staticRoutes = discoverStaticRoutes();
const staticRoutesLower = new Map();
for (const r of staticRoutes) staticRoutesLower.set(r.toLowerCase(), r);

// Dynamic routes we know how to validate. URL prefix → set of valid slugs.
const dynamicRoutes = [
  { prefix: '/blog/', slugs: blogSlugs },
  { prefix: '/projects/', slugs: projectSlugs },
  { prefix: '/gallery/', slugs: gallerySlugs },
];

// ─── Validate a single URL ──────────────────────────────────────────────────

function stripTrailingSlash(s) {
  return s.length > 1 && s.endsWith('/') ? s.slice(0, -1) : s;
}

/**
 * Returns `null` if valid, otherwise an object `{ reason, fix? }`.
 * Only validates paths that begin with `/`. Anchors-only (`#foo`) and external
 * URLs are ignored by the caller.
 */
function validateUrl(rawUrl) {
  // Skip template-interpolated URLs — we can't statically validate them.
  if (rawUrl.includes('${') || rawUrl.includes('{{')) return null;

  // Strip query and fragment for the path check.
  const hashIdx = rawUrl.indexOf('#');
  const qIdx = rawUrl.indexOf('?');
  let cut = rawUrl.length;
  if (hashIdx >= 0) cut = Math.min(cut, hashIdx);
  if (qIdx >= 0) cut = Math.min(cut, qIdx);
  let url = rawUrl.slice(0, cut);
  try {
    url = decodeURI(url);
  } catch {
    /* leave as-is */
  }
  if (url === '') return null; // pure anchor or query — treat as valid

  // Trailing slash signals a directory/prefix pattern (e.g. robots.ts `/api/`).
  // Accept if any known route starts with it.
  if (url.length > 1 && url.endsWith('/')) {
    for (const r of staticRoutes) if (r.startsWith(url)) return null;
    for (const { prefix } of dynamicRoutes) if (prefix.startsWith(url)) return null;
    if (url === '/images/') return null;
    return { reason: 'unknown route prefix' };
  }

  url = stripTrailingSlash(url);

  // Image / public asset paths.
  if (
    url.startsWith('/images/') ||
    /^\/[^/]+\.(webp|jpg|jpeg|png|svg|gif|ico|pdf|mp4|mov|webm|avif)$/i.test(url)
  ) {
    if (imageRoutes.has(url)) return null;
    const fix = imageRoutesLower.get(url.toLowerCase());
    return fix
      ? { reason: 'case-only mismatch for asset', fix }
      : { reason: 'asset not tracked in public/' };
  }

  // Dynamic content slugs.
  for (const { prefix, slugs } of dynamicRoutes) {
    if (url === stripTrailingSlash(prefix)) continue; // index page handled by static
    if (url.startsWith(prefix)) {
      const slug = url.slice(prefix.length);
      if (slug.includes('/')) {
        return { reason: `unexpected nested segment under ${prefix}` };
      }
      if (slugs.has(slug)) return null;
      // Case-only fix?
      const lower = slug.toLowerCase();
      for (const s of slugs) {
        if (s.toLowerCase() === lower) {
          return { reason: 'case-only mismatch for slug', fix: prefix + s };
        }
      }
      return { reason: `slug not found under ${prefix}` };
    }
  }

  // Static routes.
  if (staticRoutes.has(url)) return null;
  const staticFix = staticRoutesLower.get(url.toLowerCase());
  if (staticFix) return { reason: 'case-only mismatch for route', fix: staticFix };

  return { reason: 'unknown route' };
}

// ─── Extract URLs from sources ──────────────────────────────────────────────

function walkFiles(dir, predicate, skip = () => false) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (skip(full, e)) continue;
    if (e.isDirectory()) out.push(...walkFiles(full, predicate, skip));
    else if (e.isFile() && predicate(full)) out.push(full);
  }
  return out;
}

// Markdown link form: `](url)` — captures both `[text](url)` and `![alt](url)`.
// Stops at whitespace/quote/closing paren so titles like `(/foo "title")` work.
const MD_LINK_RE = /\]\(\s*(\/[^)\s"'#?][^)\s"']*)/g;
// Bare `<a href="...">` style.
const HTML_HREF_RE = /(?:href|src)\s*=\s*["'](\/[^"']+)["']/g;
// String literals starting with `/` in TS/TSX/JSON. Restrict to URL-shaped
// values to avoid noise: must look like a path segment, not something like
// `/^regex$/` or division.
const STRING_URL_RE = /["'`](\/(?:images|blog|projects|gallery|paper-reading|manifesto|uses|linktree|cv|design|lab|api)(?:\/[^"'`\s)<>]*)?)["'`]/g;

function extractFromMarkdown(content) {
  const refs = [];
  for (const re of [MD_LINK_RE, HTML_HREF_RE]) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) refs.push(m[1]);
  }
  return refs;
}

function extractFromCode(content) {
  const refs = [];
  STRING_URL_RE.lastIndex = 0;
  let m;
  while ((m = STRING_URL_RE.exec(content)) !== null) refs.push(m[1]);
  return refs;
}

// ─── Run ────────────────────────────────────────────────────────────────────

const skipDir = (full, e) => {
  if (!e.isDirectory()) return false;
  const name = e.name;
  return (
    name === 'node_modules' ||
    name === '.next' ||
    name === '.turbo' ||
    name === '.git' ||
    name === 'generated' ||
    name === 'archive' ||
    name === 'drafts' ||
    name === 'templates' ||
    name === '__pycache__'
  );
};

const mdFiles = walkFiles(CONTENT_DIR, (f) => f.endsWith('.md'), skipDir).filter(
  (f) => path.basename(f) !== 'README.md'
);

const codeFiles = [];
for (const sub of ['app', 'components', 'lib', 'scripts', 'config']) {
  const dir = path.join(ROOT, sub);
  if (fs.existsSync(dir)) {
    codeFiles.push(
      ...walkFiles(
        dir,
        (f) => /\.(tsx?|jsx?|json)$/.test(f) && !f.endsWith('.d.ts'),
        skipDir
      )
    );
  }
}

const broken = [];
let totalRefs = 0;

for (const file of mdFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const ref of extractFromMarkdown(content)) {
    totalRefs++;
    const result = validateUrl(ref);
    if (result) broken.push({ file, ref, ...result });
  }
}

for (const file of codeFiles) {
  const content = fs.readFileSync(file, 'utf8');
  for (const ref of extractFromCode(content)) {
    totalRefs++;
    const result = validateUrl(ref);
    if (result) broken.push({ file, ref, ...result });
  }
}

if (broken.length === 0) {
  console.log(
    `Link check: OK (${mdFiles.length} md + ${codeFiles.length} code files scanned, ${totalRefs} internal refs validated).`
  );
  process.exit(0);
}

console.error(`Link check FAILED: ${broken.length} broken ref(s).\n`);
console.error('These internal links will 404 on Linux/Vercel:\n');
for (const b of broken) {
  const rel = path.relative(ROOT, b.file);
  console.error(`  ${rel}`);
  console.error(`    ref: ${b.ref}`);
  if (b.fix) console.error(`    fix: ${b.fix}  (${b.reason})\n`);
  else console.error(`    why: ${b.reason}\n`);
}
process.exit(1);
