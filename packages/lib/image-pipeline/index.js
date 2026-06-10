"use strict";

const fs = require("fs");
const os = require("os");

const { processOne, pool } = require("./engine");
const { buildPlansForCategory } = require("./planners");
const { makeRenderer } = require("./renderer");
const { dim, bold, cyan, green, red, elapsed } = require("./format");
const { buildImageDims } = require("./build-image-dims");
/**
 * Run the image-optimization pipeline.
 *
 * @param {object} opts
 * @param {{ optimized: string }} opts.directories - Output dir.
 * @param {Record<string, {
 *   mode: "flat" | "gallery" | "square",
 *   source: string,
 *   config: object,
 *   rotate?: boolean,
 * }>} opts.categories - Per-category specs keyed by output subdirectory name.
 * @param {number} [opts.concurrency]
 */
async function runOptimize({ directories, categories, concurrency }) {
  if (!fs.existsSync(directories.optimized)) {
    fs.mkdirSync(directories.optimized, { recursive: true });
  }

  const conc = concurrency ?? Math.min(8, Math.max(2, os.cpus().length));

  console.log(
    `${bold(cyan("◆"))} ${bold("Optimizing images")} ${dim(`· concurrency=${conc}`)}`,
  );

  const planStart = Date.now();
  const plans = [];
  const counts = {};
  for (const [name, spec] of Object.entries(categories)) {
    const cat = await buildPlansForCategory(name, spec, directories);
    counts[name] = cat.length;
    plans.push(...cat);
  }

  const summary = Object.entries(counts)
    .map(([k, n]) => `${n} ${k}`)
    .join(", ");
  console.log(
    dim(
      `  ${plans.length} images planned in ${elapsed(Date.now() - planStart)}` +
        (summary ? ` (${summary})` : ""),
    ),
  );

  if (plans.length === 0) {
    console.log(`${green("✔")} Nothing to do.`);
    return { optimized: 0, skipped: 0, errors: 0 };
  }

  const renderer = makeRenderer(plans.length);

  await pool(
    plans,
    async (plan) => {
      renderer.start(plan);
      try {
        const r = await processOne(plan);
        renderer.complete(plan, r);
        return r;
      } catch (err) {
        renderer.error(plan, err);
        return { status: "error", ...plan, error: err.message };
      }
    },
    conc,
  );

  const result = renderer.finalize();
  if (result.errors > 0) process.exitCode = 1;
  return result;
}

module.exports = { runOptimize, buildImageDims };
