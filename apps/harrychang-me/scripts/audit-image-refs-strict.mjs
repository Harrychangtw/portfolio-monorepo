#!/usr/bin/env node
/**
 * Strict, case-sensitive image-ref audit.
 *
 * Why a separate script: audit-image-refs.mjs reads the disk via
 * fs.readdirSync, which on case-insensitive filesystems (macOS/APFS) returns
 * the on-disk casing, not what git tracks. After PR #56 we ended up with
 * mixed-case in git (e.g. variants `l1000226-1080w.webp` lowercase, but the
 * base `L1000226.webp` and thumb `L1000226-thumb.webp` still uppercase).
 * That ships broken to Linux/Vercel even though it looks fine locally.
 *
 * Source of truth here is `git ls-files`. We then:
 *   1. For each kind/slug folder, group all webp variants by case-insensitive
 *      stem and report any group whose members disagree on casing.
 *   2. Scan content/**.md for image refs and verify each one matches a
 *      git-tracked path *case-exactly*. Suggest a fix when only the case
 *      differs.
 *   3. Plan renames so every group converges on one canonical stem
 *      (preferring the form already used by markdown refs; otherwise the
 *      majority casing among variants).
 *
 * Usage (from apps/harrychang-me):
 *   node scripts/audit-image-refs-strict.mjs            # report only
 *   node scripts/audit-image-refs-strict.mjs --apply    # rename + rewrite mds
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const APPLY = process.argv.includes('--apply');
const ROOT = process.cwd();
const KINDS = ['projects', 'gallery', 'blogs'];
const VARIANT_RE = /^(.*?)(-thumb|-\d+w)\.(webp)$/i;
const IMG_EXT_RE = /\.(webp|jpg|jpeg|png)$/i;

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

// 1. Authoritative file list from git (case-exact, Linux semantics).
const tracked = git(['ls-files',
  'public/images/projects',
  'public/images/gallery',
  'public/images/blogs',
  'public/images/optimized/projects',
  'public/images/optimized/gallery',
  'public/images/optimized/blogs',
]).split('\n').filter(Boolean);

// Strip "public/" prefix so we can compare to markdown refs ("images/...").
const trackedRefs = new Set(tracked.map((p) => p.replace(/^public\//, '')));
const trackedLowerToExact = new Map();
for (const p of trackedRefs) trackedLowerToExact.set(p.toLowerCase(), p);

// 2. Group optimized webps per slug folder by case-insensitive stem.
//    Detect intra-group casing disagreement.
const groupsByDir = new Map(); // dir → Map(lowerStem → entries[])
for (const full of tracked) {
  // full like: public/images/optimized/gallery/slug/file.webp
  if (!full.endsWith('.webp')) continue;
  const parts = full.split('/');
  // public / images / [optimized?] / kind / slug / file
  // We care about both raw source folders and optimized folders.
  const dir = path.posix.dirname(full);
  const file = path.posix.basename(full);
  const m = VARIANT_RE.exec(file);
  let stem, kind;
  if (m) { stem = m[1]; kind = m[2].toLowerCase(); }
  else   { stem = file.replace(/\.webp$/i, ''); kind = 'base'; }
  if (!groupsByDir.has(dir)) groupsByDir.set(dir, new Map());
  const g = groupsByDir.get(dir);
  const k = stem.toLowerCase();
  if (!g.has(k)) g.set(k, []);
  g.get(k).push({ full, file, stem, kind });
}

const inconsistentGroups = []; // { dir, lowerStem, stems: Set, entries }
for (const [dir, g] of groupsByDir) {
  for (const [lower, entries] of g) {
    const stems = new Set(entries.map((e) => e.stem));
    if (stems.size > 1) inconsistentGroups.push({ dir, lower, stems: [...stems], entries });
  }
}

// 3. Scan markdown for image refs.
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
const mdFiles = walk(path.join(ROOT, 'content')).filter((f) => f.endsWith('.md'));
const REF_RE = /(images\/(?:optimized\/)?(?:projects|gallery|blogs)\/[^\s"')\]]+?\.(?:webp|jpg|jpeg|png))/gi;

const refsByFile = new Map(); // file → Set<ref>
for (const mdFile of mdFiles) {
  const content = fs.readFileSync(mdFile, 'utf8');
  const refs = new Set();
  let m;
  while ((m = REF_RE.exec(content)) !== null) refs.add(decodeURIComponent(m[1]));
  refsByFile.set(mdFile, refs);
}

const exactBroken = []; // ref does not match git path even case-insensitively
const caseOnlyBroken = []; // ref matches git path only after lowercasing
for (const [file, refs] of refsByFile) {
  for (const ref of refs) {
    if (trackedRefs.has(ref)) continue;
    const fix = trackedLowerToExact.get(ref.toLowerCase());
    if (fix) caseOnlyBroken.push({ file, ref, fix });
    else exactBroken.push({ file, ref });
  }
}

// 4. Build canonical stem per group (prefer markdown casing, else majority).
//    Then plan file renames + markdown edits to converge.
const refStemsByDirLower = new Map(); // dir → Map(lowerStem → Map(stem → count from md refs))
for (const refs of refsByFile.values()) {
  for (const ref of refs) {
    const full = `public/${ref}`;
    if (!full.endsWith('.webp')) continue;
    const dir = path.posix.dirname(full);
    const file = path.posix.basename(full);
    const m = VARIANT_RE.exec(file);
    const stem = m ? m[1] : file.replace(/\.webp$/i, '');
    const k = stem.toLowerCase();
    if (!refStemsByDirLower.has(dir)) refStemsByDirLower.set(dir, new Map());
    const dm = refStemsByDirLower.get(dir);
    if (!dm.has(k)) dm.set(k, new Map());
    const sm = dm.get(k);
    sm.set(stem, (sm.get(stem) ?? 0) + 1);
  }
}

const plannedRenames = []; // { from, to, reason }
const plannedMdEdits = []; // { file, oldRef, newRef }

for (const grp of inconsistentGroups) {
  // Choose canonical: markdown stem if any, else majority on disk, else lowercase.
  let canonical;
  const refMap = refStemsByDirLower.get(grp.dir)?.get(grp.lower);
  if (refMap && refMap.size) {
    canonical = [...refMap.entries()].sort((a, b) => b[1] - a[1])[0][0];
  } else {
    const counts = new Map();
    for (const e of grp.entries) counts.set(e.stem, (counts.get(e.stem) ?? 0) + 1);
    canonical = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    // Tie-break: prefer the lowercase form if present.
    const lc = grp.entries.find((e) => e.stem === e.stem.toLowerCase());
    if (lc) canonical = lc.stem;
  }
  for (const e of grp.entries) {
    if (e.stem === canonical) continue;
    // e.kind is "base", or a variant suffix already prefixed with "-"
    // (e.g. "-thumb", "-1080w") because VARIANT_RE captures it that way.
    const newFile = e.kind === 'base'
      ? `${canonical}.webp`
      : `${canonical}${e.kind}.webp`;
    plannedRenames.push({
      from: e.full,
      to: path.posix.join(grp.dir, newFile),
      reason: `${e.stem} → ${canonical} (${e.kind})`,
    });
  }
}

// Also handle source jpg/png whose stem disagrees with optimized base canonical.
// We also want every source file to match its corresponding optimized base stem.
const optimizedBaseByDirLower = new Map(); // optDir → Map(lowerStem → canonicalStem after rename)
for (const [dir, g] of groupsByDir) {
  if (!dir.includes('/optimized/')) continue;
  const m = new Map();
  for (const [lower, entries] of g) {
    const base = entries.find((e) => e.kind === 'base');
    let canonicalStem;
    const refMap = refStemsByDirLower.get(dir)?.get(lower);
    if (refMap && refMap.size) canonicalStem = [...refMap.entries()].sort((a, b) => b[1] - a[1])[0][0];
    else if (base) canonicalStem = base.stem;
    else {
      const counts = new Map();
      for (const e of entries) counts.set(e.stem, (counts.get(e.stem) ?? 0) + 1);
      canonicalStem = [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
    }
    m.set(lower, canonicalStem);
  }
  optimizedBaseByDirLower.set(dir, m);
}

for (const full of tracked) {
  if (!/\.(jpg|jpeg|png)$/i.test(full)) continue;
  const dir = path.posix.dirname(full);
  const file = path.posix.basename(full);
  const ext = path.posix.extname(file);
  const stem = file.slice(0, -ext.length);
  // Map source dir to its optimized counterpart.
  // public/images/<kind>/<slug>/  →  public/images/optimized/<kind>/<slug>/
  const mDir = dir.match(/^public\/images\/(projects|gallery|blogs)\/([^/]+)$/);
  if (!mDir) continue;
  const optDir = `public/images/optimized/${mDir[1]}/${mDir[2]}`;
  const canonMap = optimizedBaseByDirLower.get(optDir);
  if (!canonMap) continue;
  const canonical = canonMap.get(stem.toLowerCase());
  if (!canonical || canonical === stem) continue;
  plannedRenames.push({
    from: full,
    to: path.posix.join(dir, `${canonical}${ext}`),
    reason: `source ${stem} → ${canonical} (match optimized canonical)`,
  });
}

// Plan markdown edits: any ref whose path isn't tracked exactly but maps to a
// canonical name post-rename.
const finalTracked = new Set(trackedRefs);
const renameMap = new Map();
for (const r of plannedRenames) {
  const fromRef = r.from.replace(/^public\//, '');
  const toRef = r.to.replace(/^public\//, '');
  finalTracked.delete(fromRef);
  finalTracked.add(toRef);
  renameMap.set(fromRef, toRef);
}
const finalLowerToExact = new Map();
for (const p of finalTracked) finalLowerToExact.set(p.toLowerCase(), p);

const stillBroken = [];
for (const [file, refs] of refsByFile) {
  for (const ref of refs) {
    if (finalTracked.has(ref)) continue;
    const fix = finalLowerToExact.get(ref.toLowerCase());
    if (fix) plannedMdEdits.push({ file, oldRef: ref, newRef: fix });
    else stillBroken.push({ file, ref });
  }
}

// =================== REPORT ===================
console.log('=== STRICT AUDIT (source of truth: git ls-files) ===\n');

console.log(`Inconsistent-casing groups in git: ${inconsistentGroups.length}`);
for (const g of inconsistentGroups.slice(0, 50)) {
  console.log(`  ${g.dir}  stems=[${g.stems.join(', ')}]`);
}
if (inconsistentGroups.length > 50) console.log(`  ... +${inconsistentGroups.length - 50} more`);

console.log(`\nMarkdown refs broken on Linux (case mismatch only): ${caseOnlyBroken.length}`);
for (const b of caseOnlyBroken.slice(0, 30)) {
  console.log(`  ${path.relative(ROOT, b.file)}: ${b.ref}  (git has: ${b.fix})`);
}
if (caseOnlyBroken.length > 30) console.log(`  ... +${caseOnlyBroken.length - 30} more`);

console.log(`\nMarkdown refs with no candidate file at all: ${exactBroken.length}`);
for (const b of exactBroken.slice(0, 30)) {
  console.log(`  ${path.relative(ROOT, b.file)}: ${b.ref}`);
}
if (exactBroken.length > 30) console.log(`  ... +${exactBroken.length - 30} more`);

console.log(`\nPlanned file renames: ${plannedRenames.length}`);
for (const r of plannedRenames.slice(0, 50)) {
  console.log(`  ${r.from}  →  ${r.to}    [${r.reason}]`);
}
if (plannedRenames.length > 50) console.log(`  ... +${plannedRenames.length - 50} more`);

console.log(`\nPlanned markdown edits: ${plannedMdEdits.length}`);
for (const e of plannedMdEdits.slice(0, 30)) {
  console.log(`  ${path.relative(ROOT, e.file)}: ${e.oldRef} → ${e.newRef}`);
}
if (plannedMdEdits.length > 30) console.log(`  ... +${plannedMdEdits.length - 30} more`);

console.log(`\nStill broken after plan: ${stillBroken.length}`);
for (const b of stillBroken) console.log(`  ${path.relative(ROOT, b.file)}: ${b.ref}`);

if (!APPLY) {
  console.log('\nDry run. Re-run with --apply to perform renames + markdown rewrites.');
  process.exit(0);
}

// =================== APPLY ===================
function gitMv(from, to) {
  // Always go via a tmp name to handle case-only renames on case-insensitive FS.
  const tmp = `${to}.tmp-${process.pid}-${Math.random().toString(36).slice(2, 8)}`;
  try { execFileSync('git', ['mv', '-f', '--', from, tmp], { stdio: 'pipe' }); }
  catch { fs.renameSync(from, tmp); }
  try { execFileSync('git', ['mv', '-f', '--', tmp, to], { stdio: 'pipe' }); }
  catch { fs.renameSync(tmp, to); }
}

for (const r of plannedRenames) gitMv(r.from, r.to);

const editsByFile = new Map();
for (const e of plannedMdEdits) {
  if (!editsByFile.has(e.file)) editsByFile.set(e.file, []);
  editsByFile.get(e.file).push(e);
}
for (const [file, edits] of editsByFile) {
  let content = fs.readFileSync(file, 'utf8');
  for (const { oldRef, newRef } of edits) {
    const variants = [oldRef];
    if (oldRef.includes(' ')) variants.push(oldRef.replace(/ /g, '%20'));
    for (const v of variants) content = content.split(v).join(newRef);
  }
  fs.writeFileSync(file, content);
}

console.log('\nApplied.');
