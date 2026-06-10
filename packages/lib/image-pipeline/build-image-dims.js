"use strict";

// Walks public/images/optimized for canonical .webp files (no -thumb, no
// -{n}w width-variant suffix), reads pixel dimensions, and writes a JSON map
// keyed by web path. Consumed by getDimsFromWebPath in markdown.ts so the
// runtime serverless function never has to bundle public/images/**.
//
// Apps invoke this via a thin scripts/build-image-dims.mjs wrapper.

const fs = require("node:fs");
const path = require("node:path");
const { imageSize } = require("image-size");

const VARIANT_SUFFIX = /-\d+w\.webp$/i;
const THUMB_SUFFIX = /-thumb\.webp$/i;

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

/**
 * Build the image-dimension map for an app.
 *
 * @param {object} opts
 * @param {string} opts.appRoot - Absolute path to the app root.
 * @param {string} [opts.optimizedDir] - Defaults to <appRoot>/public/images/optimized.
 * @param {string} [opts.outputFile] - Defaults to <appRoot>/content/generated/image-dims.json.
 * @returns {{ count: number, skipped: number, outputFile: string }}
 */
function buildImageDims({ appRoot, optimizedDir, outputFile }) {
  const publicDir = path.join(appRoot, "public");
  const srcDir = optimizedDir ?? path.join(publicDir, "images", "optimized");
  const outFile =
    outputFile ?? path.join(appRoot, "content", "generated", "image-dims.json");

  const dims = {};
  let count = 0;
  let skipped = 0;

  for (const file of walk(srcDir)) {
    if (!file.endsWith(".webp")) continue;
    if (THUMB_SUFFIX.test(file) || VARIANT_SUFFIX.test(file)) {
      skipped++;
      continue;
    }
    try {
      const buf = fs.readFileSync(file);
      const { width, height } = imageSize(buf);
      if (!width || !height) continue;
      const webPath =
        "/" + path.relative(publicDir, file).split(path.sep).join("/");
      dims[webPath] = { width, height };
      count++;
    } catch (err) {
      console.warn(`  ! could not read ${file}: ${err.message}`);
    }
  }

  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  // 2-space indent matches the repo's prettier pre-commit hook, so the
  // committed file and prebuild-regenerated output stay byte-identical.
  fs.writeFileSync(outFile, JSON.stringify(dims, null, 2) + "\n");
  console.log(
    `✓ wrote ${count} entries to ${path.relative(appRoot, outFile)} (skipped ${skipped} variants/thumbs)`,
  );

  return { count, skipped, outputFile: outFile };
}

module.exports = { buildImageDims };
