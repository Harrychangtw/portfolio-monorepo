#!/usr/bin/env node
/**
 * Comprehensive audit of image references vs files on disk.
 *
 * Catches what normalize-image-filenames.mjs misses:
 *  - Optimized variants (`-thumb.webp`, `-Nw.webp`) whose case/stem doesn't
 *    match the base webp in the same folder. The previous normalizer only
 *    discovers stems from base webps (or sources), so when the base was
 *    already lowercase but the variants weren't, the variants got orphaned.
 *  - Markdown image refs that point at files which don't exist on disk
 *    (with case-sensitive matching, since prod is Linux).
 *  - Source files (jpg/png) whose stem differs from their corresponding
 *    optimized base webp.
 *
 * Usage (from apps/harrychang-me):
 *   node scripts/audit-image-refs.mjs            # report only
 *   node scripts/audit-image-refs.mjs --apply    # rename + rewrite mds
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();
const PUBLIC_IMAGES = path.join(ROOT, 'public', 'images');
const CONTENT_DIR = path.join(ROOT, 'content');
const KINDS = ['projects', 'gallery', 'blogs'];
const VARIANT_RE = /^(.*?)(-thumb|-\d+w)\.webp$/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.isFile()) out.push(full);
  }
  return out;
}

function rel(p) {
  return path.relative(ROOT, p);
}

// 1. For each optimized image folder, find variants whose stem doesn't match
//    a base webp in the same folder. Choose the canonical stem by preferring
//    the existing base webp's exact case; if no base exists, prefer the
//    lowercase form.
const planRenames = []; // { from, to, reason }
const orphanVariants = []; // variants with no matching base — informational

for (const kind of KINDS) {
  const optKindDir = path.join(PUBLIC_IMAGES, 'optimized', kind);
  if (!fs.existsSync(optKindDir)) continue;
  const slugs = fs.readdirSync(optKindDir, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name);
  for (const slug of slugs) {
    const dir = path.join(optKindDir, slug);
    const entries = fs.readdirSync(dir).filter((n) => n.endsWith('.webp'));

    // Group by case-insensitive stem.
    const groups = new Map(); // lowerStem → { bases: [name], variants: [{name, stem, suffix}] }
    for (const name of entries) {
      const m = VARIANT_RE.exec(name);
      let stem;
      if (m) stem = m[1];
      else stem = name.replace(/\.webp$/, '');
      const key = stem.toLowerCase();
      let g = groups.get(key);
      if (!g) {
        g = { bases: [], variants: [] };
        groups.set(key, g);
      }
      if (m) g.variants.push({ name, stem, suffix: m[2].toLowerCase() });
      else g.bases.push({ name, stem });
    }

    for (const [, g] of groups) {
      // Pick canonical stem.
      let canonical;
      if (g.bases.length) {
        // Prefer the lowercase base if multiple, else the only one.
        const lower = g.bases.find((b) => b.stem === b.stem.toLowerCase());
        canonical = (lower ?? g.bases[0]).stem;
      } else {
        // No base; pick the most common variant casing, fallback lowercase.
        const counts = new Map();
        for (const v of g.variants) counts.set(v.stem, (counts.get(v.stem) ?? 0) + 1);
        canonical = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
        // Prefer lowercase if it exists among variants.
        const lc = g.variants.find((v) => v.stem === v.stem.toLowerCase());
        if (lc) canonical = lc.stem;
        orphanVariants.push(`${kind}/${slug}/${canonical}.webp (no base webp)`);
      }

      // Plan renames for any base/variant whose stem != canonical.
      for (const b of g.bases) {
        if (b.stem === canonical) continue;
        planRenames.push({
          from: path.join(dir, b.name),
          to: path.join(dir, `${canonical}.webp`),
          reason: `base stem ${b.stem} → ${canonical}`,
        });
      }
      for (const v of g.variants) {
        if (v.stem === canonical) continue;
        const newName = `${canonical}${v.suffix}.webp`;
        // Preserve original suffix casing form (-thumb / -Nw are already lowered)
        planRenames.push({
          from: path.join(dir, v.name),
          to: path.join(dir, newName),
          reason: `variant stem ${v.stem}${v.suffix} → ${canonical}${v.suffix}`,
        });
      }
    }
  }
}

// 2. Plan source-file renames (jpg/png) so stems match their optimized base.
for (const kind of KINDS) {
  const srcKindDir = path.join(PUBLIC_IMAGES, kind);
  if (!fs.existsSync(srcKindDir)) continue;
  const slugs = fs.readdirSync(srcKindDir, { withFileTypes: true })
    .filter((d) => d.isDirectory()).map((d) => d.name);
  for (const slug of slugs) {
    const srcDir = path.join(srcKindDir, slug);
    const optDir = path.join(PUBLIC_IMAGES, 'optimized', kind, slug);
    if (!fs.existsSync(optDir)) continue;
    const optBaseStems = new Set(
      fs.readdirSync(optDir)
        .filter((n) => n.endsWith('.webp') && !VARIANT_RE.test(n))
        .map((n) => n.replace(/\.webp$/, ''))
    );
    for (const file of fs.readdirSync(srcDir)) {
      if (!/\.(jpg|jpeg|png)$/i.test(file)) continue;
      const ext = path.extname(file);
      const stem = path.basename(file, ext);
      if (optBaseStems.has(stem)) continue;
      // Find a case-insensitive match.
      const match = [...optBaseStems].find((s) => s.toLowerCase() === stem.toLowerCase());
      if (match) {
        planRenames.push({
          from: path.join(srcDir, file),
          to: path.join(srcDir, `${match}${ext}`),
          reason: `source stem ${stem} → ${match} (match optimized)`,
        });
      }
    }
  }
}

// 3. Build set of all image paths that exist (case-sensitive, post-rename).
const finalPaths = new Set();
function collectAfterPlan() {
  finalPaths.clear();
  const renameMap = new Map(planRenames.map((r) => [r.from, r.to]));
  for (const kind of KINDS) {
    for (const root of [path.join(PUBLIC_IMAGES, kind), path.join(PUBLIC_IMAGES, 'optimized', kind)]) {
      for (const f of walk(root)) {
        const finalAbs = renameMap.get(f) ?? f;
        finalPaths.add(path.relative(path.join(ROOT, 'public'), finalAbs));
      }
    }
  }
}
collectAfterPlan();

// 4. Scan markdown for image refs and verify they resolve post-plan.
const mdFiles = walk(CONTENT_DIR).filter((f) => f.endsWith('.md'));
const REF_RE = /(images\/(?:optimized\/)?(?:projects|gallery|blogs)\/[^\s"')\]]+?\.(?:webp|jpg|jpeg|png))/gi;
const brokenRefs = []; // { file, ref }
const refsByFile = new Map();

for (const mdFile of mdFiles) {
  const content = fs.readFileSync(mdFile, 'utf8');
  const refs = new Set();
  let m;
  while ((m = REF_RE.exec(content)) !== null) {
    refs.add(decodeURIComponent(m[1]));
  }
  refsByFile.set(mdFile, refs);
  for (const ref of refs) {
    if (!finalPaths.has(ref)) {
      brokenRefs.push({ file: mdFile, ref });
    }
  }
}

// 5. Plan markdown edits to fix broken refs by case-insensitive lookup.
const finalLowerMap = new Map();
for (const p of finalPaths) finalLowerMap.set(p.toLowerCase(), p);

const mdEdits = []; // { file, oldRef, newRef }
const stillBroken = [];
for (const { file, ref } of brokenRefs) {
  const fix = finalLowerMap.get(ref.toLowerCase());
  if (fix && fix !== ref) {
    mdEdits.push({ file, oldRef: ref, newRef: fix });
  } else {
    stillBroken.push({ file, ref });
  }
}

// ============ REPORT ============
console.log('=== AUDIT REPORT ===\n');
console.log(`File renames planned: ${planRenames.length}`);
const byReason = new Map();
for (const r of planRenames) {
  const k = r.reason.split(' ')[0];
  byReason.set(k, (byReason.get(k) ?? 0) + 1);
}
for (const [k, n] of byReason) console.log(`  ${k}: ${n}`);
if (planRenames.length && planRenames.length <= 200) {
  for (const r of planRenames) console.log(`  ${rel(r.from)}  →  ${rel(r.to)}`);
} else if (planRenames.length) {
  for (const r of planRenames.slice(0, 50)) console.log(`  ${rel(r.from)}  →  ${rel(r.to)}`);
  console.log(`  ... +${planRenames.length - 50} more`);
}

console.log(`\nMarkdown edits planned: ${mdEdits.length}`);
for (const e of mdEdits.slice(0, 100)) {
  console.log(`  ${rel(e.file)}: ${e.oldRef} → ${e.newRef}`);
}
if (mdEdits.length > 100) console.log(`  ... +${mdEdits.length - 100} more`);

console.log(`\nUnresolvable broken refs (no candidate file): ${stillBroken.length}`);
for (const b of stillBroken) console.log(`  ${rel(b.file)}: ${b.ref}`);

console.log(`\nOptimized folders with no base webp: ${orphanVariants.length}`);
for (const o of orphanVariants.slice(0, 20)) console.log(`  ${o}`);
if (orphanVariants.length > 20) console.log(`  ... +${orphanVariants.length - 20} more`);

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to perform renames + markdown rewrites.');
  process.exit(0);
}

// ============ APPLY ============
function gitMv(from, to) {
  try {
    execFileSync('git', ['mv', '-f', '--', from, to], { stdio: 'pipe' });
  } catch {
    fs.renameSync(from, to);
  }
}

// Detect case-only renames (same inode on case-insensitive FS).
for (const r of planRenames) {
  let caseOnly = false;
  if (fs.existsSync(r.to)) {
    try {
      const a = fs.statSync(r.from);
      const b = fs.statSync(r.to);
      caseOnly = a.dev === b.dev && a.ino === b.ino;
    } catch {}
  }
  if (caseOnly) {
    const tmp = `${r.to}.tmp-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
    gitMv(r.from, tmp);
    gitMv(tmp, r.to);
  } else {
    gitMv(r.from, r.to);
  }
}

// Apply markdown edits (group by file, regex-replace each ref).
const editsByFile = new Map();
for (const e of mdEdits) {
  if (!editsByFile.has(e.file)) editsByFile.set(e.file, []);
  editsByFile.get(e.file).push(e);
}
for (const [file, edits] of editsByFile) {
  let content = fs.readFileSync(file, 'utf8');
  for (const { oldRef, newRef } of edits) {
    // Replace exact occurrences (also handle %20-encoded variant just in case).
    const variants = [oldRef];
    if (oldRef.includes(' ')) variants.push(oldRef.replace(/ /g, '%20'));
    for (const v of variants) {
      content = content.split(v).join(newRef);
    }
  }
  fs.writeFileSync(file, content);
}

console.log('\nApplied.');
