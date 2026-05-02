#!/usr/bin/env node
/**
 * Case-exact image-ref check for CI.
 *
 * Source of truth is `git ls-files` (Linux/Vercel semantics). Any markdown
 * image ref under content/ that doesn't match a tracked path *case-exactly*
 * fails the build. Catches the class of bug PR #56 left behind: kebab/lowercase
 * filenames on disk but mixed-case refs in markdown — silent on macOS APFS,
 * 404 on Linux.
 *
 * Pure node, no deps. Exit 1 on any broken ref.
 *
 * Usage (from apps/harrychang-me):
 *   node scripts/check-image-refs.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'content');

if (!fs.existsSync(CONTENT_DIR)) {
  console.error(`Missing ${CONTENT_DIR}. Run from apps/harrychang-me.`);
  process.exit(2);
}

const tracked = execFileSync('git', ['ls-files', 'public/images'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);

const trackedRefs = new Set(tracked.map((p) => p.replace(/^public\//, '')));
const lowerToExact = new Map();
for (const p of trackedRefs) lowerToExact.set(p.toLowerCase(), p);

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full));
    else if (e.isFile() && full.endsWith('.md')) out.push(full);
  }
  return out;
}

// Stop only at quote/paren/bracket/newline so refs containing spaces (legacy
// camera filenames in YAML strings) are still captured — that class of ref is
// exactly what we need to flag.
const REF_RE = /(images\/(?:optimized\/)?(?:projects|gallery|blogs)\/[^"')\]\n]+?\.(?:webp|jpg|jpeg|png))/gi;

const mdFiles = walk(CONTENT_DIR).filter(
  (f) => !f.includes(`${path.sep}templates${path.sep}`) && path.basename(f) !== 'README.md'
);

const broken = [];
for (const file of mdFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const refs = new Set();
  let m;
  while ((m = REF_RE.exec(content)) !== null) refs.add(decodeURIComponent(m[1]));
  for (const ref of refs) {
    if (trackedRefs.has(ref)) continue;
    const caseFix = lowerToExact.get(ref.toLowerCase());
    broken.push({ file, ref, caseFix });
  }
}

if (broken.length === 0) {
  console.log(`Image-ref check: OK (${mdFiles.length} md files scanned, ${trackedRefs.size} tracked images).`);
  process.exit(0);
}

console.error(`Image-ref check FAILED: ${broken.length} broken ref(s).\n`);
console.error('These markdown image references will 404 on Linux/Vercel:\n');
for (const b of broken) {
  const rel = path.relative(ROOT, b.file);
  if (b.caseFix) {
    console.error(`  ${rel}`);
    console.error(`    ref: ${b.ref}`);
    console.error(`    fix: ${b.caseFix}  (case-only mismatch)\n`);
  } else {
    console.error(`  ${rel}`);
    console.error(`    ref: ${b.ref}`);
    console.error(`    fix: no candidate file in git — image missing or path wrong\n`);
  }
}
process.exit(1);
