#!/usr/bin/env node
/**
 * Backfill responsive `<name>-<width>w.webp` variants from existing optimized
 * `<name>.webp` files when original sources (jpg/png) are no longer available.
 *
 * Walks public/images/optimized/** and, for every base webp (skipping
 * `-thumb.webp` and existing `-{n}w.webp`), emits any missing variants by
 * downscaling the base file. Larger-than-source widths are skipped via
 * `withoutEnlargement: true`.
 *
 * Usage:
 *   node scripts/optimize-images-from-webp.js
 *   FORCE=1 node scripts/optimize-images-from-webp.js   # overwrite existing variants
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const RESPONSIVE_WIDTHS = [640, 828, 1080, 1920, 2560];
const QUALITY = 90; // matches the lower-tier qualities; safe re-encode floor
const FORCE = !!process.env.FORCE;

const root = path.join(process.cwd(), 'public', 'images', 'optimized');

const VARIANT_RE = /-(?:\d+)w\.webp$/;
const THUMB_RE = /-thumb\.webp$/;

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile() && entry.name.endsWith('.webp')) yield full;
  }
}

async function main() {
  if (!fs.existsSync(root)) {
    console.error(`Missing ${root}`);
    process.exit(1);
  }
  let processed = 0;
  let written = 0;
  let skipped = 0;
  for (const file of walk(root)) {
    const base = path.basename(file);
    if (THUMB_RE.test(base) || VARIANT_RE.test(base)) continue;
    processed++;
    const dir = path.dirname(file);
    const stem = base.replace(/\.webp$/, '');
    for (const width of RESPONSIVE_WIDTHS) {
      const out = path.join(dir, `${stem}-${width}w.webp`);
      if (!FORCE && fs.existsSync(out)) {
        skipped++;
        continue;
      }
      try {
        await sharp(file)
          .resize({ width, fit: 'inside', withoutEnlargement: true })
          .webp({ quality: QUALITY })
          .toFile(out);
        written++;
        console.log(`  + ${path.relative(root, out)}`);
      } catch (err) {
        console.error(`  ! ${path.relative(root, out)}: ${err.message}`);
      }
    }
  }
  console.log(`\nDone. base=${processed} written=${written} skipped=${skipped}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
