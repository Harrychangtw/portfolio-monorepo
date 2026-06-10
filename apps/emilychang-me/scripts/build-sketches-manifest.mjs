#!/usr/bin/env node
// Generates content/generated/sketches.json so /api/sketches doesn't have to
// readdir public/images/** at runtime — public/ isn't bundled into the
// Vercel serverless function, so the runtime scan returns []. The manifest
// lives under content/, which IS traced into the lambda.

import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const APP_ROOT = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "..",
);
const SKETCHES_DIR = path.join(
  APP_ROOT,
  "public",
  "images",
  "optimized",
  "sketches",
);
const OUTPUT_FILE = path.join(
  APP_ROOT,
  "content",
  "generated",
  "sketches.json",
);

if (!fs.existsSync(SKETCHES_DIR)) {
  console.warn(`! ${SKETCHES_DIR} does not exist; writing empty manifest`);
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, "[]\n");
  process.exit(0);
}

const fileNames = fs.readdirSync(SKETCHES_DIR);
const sketchFiles = fileNames
  .filter(
    (f) =>
      f.endsWith(".webp") && !f.includes("-thumb") && !/-\d+w\.webp$/.test(f),
  )
  .sort();

const entries = [];
for (const fileName of sketchFiles) {
  const slug = fileName.replace(/\.webp$/, "");
  const thumbName = fileName.replace(".webp", "-thumb.webp");
  const thumbPath = path.join(SKETCHES_DIR, thumbName);
  const imageUrl = `/images/optimized/sketches/${thumbName}`;

  let width;
  let height;
  if (fs.existsSync(thumbPath)) {
    try {
      const meta = await sharp(thumbPath).metadata();
      width = meta.width;
      height = meta.height;
    } catch (err) {
      console.warn(`  ! could not read ${thumbPath}: ${err.message}`);
    }
  }

  entries.push({ slug, imageUrl, width, height });
}

fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
// 2-space indent matches the repo's prettier pre-commit hook, so the
// committed file and prebuild-regenerated output stay byte-identical.
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(entries, null, 2) + "\n");
console.log(
  `✓ wrote ${entries.length} sketches to ${path.relative(APP_ROOT, OUTPUT_FILE)}`,
);
