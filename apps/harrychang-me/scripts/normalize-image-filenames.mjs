#!/usr/bin/env node
/**
 * Normalize image filenames to kebab-case and update markdown references.
 *
 * Renames in lockstep:
 *   public/images/<kind>/<slug>/<Old Name>.<ext>
 *   public/images/optimized/<kind>/<slug>/<Old Name>.webp
 *   public/images/optimized/<kind>/<slug>/<Old Name>-thumb.webp
 *   public/images/optimized/<kind>/<slug>/<Old Name>-{640|828|...}w.webp
 * → all share the same kebab stem after the run, so optimize-images does not
 *   need to be re-run.
 *
 * Markdown references in content/**\/*.md are rewritten when they appear in a
 * path-shaped context (preceded by `/`, followed by `.` extension or `-`
 * variant suffix). URL-encoded spaces (`%20`) are handled too.
 *
 * Usage (run from apps/harrychang-me):
 *   node scripts/normalize-image-filenames.mjs            # dry run
 *   node scripts/normalize-image-filenames.mjs --apply    # perform changes
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images');
const CONTENT_DIR = path.join(ROOT, 'content');
const KINDS = ['projects', 'gallery', 'blogs'];
const SRC_EXT_RE = /\.(jpg|jpeg|png)$/i;

if (!fs.existsSync(PUBLIC_IMAGES)) {
  console.error(`Missing ${PUBLIC_IMAGES}. Run from apps/harrychang-me.`);
  process.exit(1);
}

function toKebab(stem) {
  return stem
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '');
}

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.isFile()) out.push(full);
  }
  return out;
}

// Strip optimize-images.js suffixes (`-thumb`, `-{n}w`) to recover the source stem.
function strippedOptStem(filename) {
  const noExt = filename.replace(/\.webp$/i, '');
  return noExt.replace(/-thumb$/, '').replace(/-\d+w$/, '');
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Discover stem renames from BOTH source files (jpg/png) and base optimized
// webps (in case the source has been deleted). Keyed by `${kind}/${slug}|stem`
// so the same stem isn't recorded twice.
const stemRenamesMap = new Map(); // key → { kind, slug, oldStem, newStem }

function recordStem(kind, slug, oldStem) {
  const newStem = toKebab(oldStem);
  if (!newStem || newStem === oldStem) return;
  const key = `${kind}/${slug}|${oldStem}`;
  if (!stemRenamesMap.has(key)) {
    stemRenamesMap.set(key, { kind, slug, oldStem, newStem });
  }
}

for (const kind of KINDS) {
  const srcDir = path.join(PUBLIC_IMAGES, kind);
  for (const file of walk(srcDir)) {
    if (!SRC_EXT_RE.test(file)) continue;
    const oldStem = path.basename(file, path.extname(file));
    const slug = path.relative(srcDir, path.dirname(file));
    recordStem(kind, slug, oldStem);
  }
  const optDir = path.join(PUBLIC_IMAGES, 'optimized', kind);
  for (const file of walk(optDir)) {
    if (!file.endsWith('.webp')) continue;
    const name = path.basename(file);
    // Only base webps drive stem discovery; siblings (-thumb / -Nw) follow.
    if (/-thumb\.webp$/.test(name) || /-\d+w\.webp$/.test(name)) continue;
    const oldStem = name.replace(/\.webp$/, '');
    const slug = path.relative(optDir, path.dirname(file));
    recordStem(kind, slug, oldStem);
  }
}

const stemRenames = [...stemRenamesMap.values()];

// Build the actual rename plan (source + every matching optimized sibling).
const plan = []; // { from, to }
for (const { kind, slug, oldStem, newStem } of stemRenames) {
  const srcDir = path.join(PUBLIC_IMAGES, kind, slug);
  if (fs.existsSync(srcDir)) {
    for (const entry of fs.readdirSync(srcDir)) {
      if (!SRC_EXT_RE.test(entry)) continue;
      const ext = path.extname(entry);
      if (path.basename(entry, ext) !== oldStem) continue;
      plan.push({
        from: path.join(srcDir, entry),
        to: path.join(srcDir, newStem + ext),
      });
    }
  }
  const optDir = path.join(PUBLIC_IMAGES, 'optimized', kind, slug);
  if (fs.existsSync(optDir)) {
    for (const entry of fs.readdirSync(optDir)) {
      if (!entry.endsWith('.webp')) continue;
      if (strippedOptStem(entry) !== oldStem) continue;
      plan.push({
        from: path.join(optDir, entry),
        to: path.join(optDir, entry.replace(oldStem, newStem)),
      });
    }
  }
}

// Collision check. On case-insensitive filesystems (default APFS on macOS),
// `from` and `to` may point at the same inode for case-only renames — that's
// not a real collision. Mark those entries so the apply step uses a two-step
// rename (via a tmp name) to make the case change actually take effect.
const seenDest = new Set();
const collisions = [];
const fromSet = new Set(plan.map((p) => p.from));
for (const entry of plan) {
  const { from, to } = entry;
  if (seenDest.has(to)) collisions.push(`duplicate destination: ${to}`);
  let sameInode = false;
  if (fs.existsSync(to) && !fromSet.has(to)) {
    try {
      const a = fs.statSync(from);
      const b = fs.statSync(to);
      sameInode = a.dev === b.dev && a.ino === b.ino;
    } catch {}
    if (!sameInode) collisions.push(`destination already exists: ${to}`);
  }
  entry.caseOnly = sameInode;
  seenDest.add(to);
}
if (collisions.length) {
  console.error('Aborting — collisions detected:');
  for (const c of collisions) console.error('  ' + c);
  process.exit(1);
}

console.log(`Renames planned: ${plan.length}`);
for (const { from, to } of plan) {
  console.log(`  ${path.relative(ROOT, from)}  →  ${path.relative(ROOT, to)}`);
}

// Plan markdown rewrites.
const mdFiles = walk(CONTENT_DIR).filter((f) => f.endsWith('.md'));
const mdEdits = [];

for (const file of mdFiles) {
  const original = fs.readFileSync(file, 'utf8');
  let next = original;
  for (const { oldStem, newStem } of stemRenames) {
    const candidates = [oldStem];
    if (oldStem.includes(' ')) candidates.push(oldStem.replace(/ /g, '%20'));
    for (const variant of candidates) {
      const re = new RegExp(`/${escapeRegex(variant)}(?=[.-])`, 'g');
      next = next.replace(re, `/${newStem}`);
    }
  }
  if (next !== original) mdEdits.push({ file, content: next });
}

console.log(`\nMarkdown files to update: ${mdEdits.length}`);
for (const { file } of mdEdits) console.log(`  ${path.relative(ROOT, file)}`);

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to perform renames + markdown rewrites.');
  process.exit(0);
}

// Apply renames. Prefer `git mv` so history follows. For case-only renames on
// case-insensitive filesystems, go via a tmp name so the FS actually records
// the new casing.
function gitMv(from, to) {
  try {
    // execFileSync with an arg array — no shell parsing, so filenames containing
    // spaces or shell metacharacters can never reshape the command.
    execFileSync('git', ['mv', '-f', '--', from, to], { stdio: 'pipe' });
  } catch {
    fs.renameSync(from, to);
  }
}
for (const { from, to, caseOnly } of plan) {
  if (caseOnly) {
    const tmp = `${to}.tmp-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
    gitMv(from, tmp);
    gitMv(tmp, to);
  } else {
    gitMv(from, to);
  }
}
for (const { file, content } of mdEdits) {
  fs.writeFileSync(file, content);
}
console.log('\nDone.');
