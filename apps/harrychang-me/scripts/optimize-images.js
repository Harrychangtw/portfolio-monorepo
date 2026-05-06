#!/usr/bin/env node
/**
 * Image Optimization Script
 *
 * Processes images in public/images/{projects,gallery,blogs} into responsive
 * WebP variants under public/images/optimized.
 *
 * Behaviors:
 *   - Skips images whose outputs are all newer than the source.
 *   - Runs main + responsive variants + thumbnail in parallel per image.
 *   - Processes multiple images concurrently (pool sized to CPU count, capped 8).
 *   - Colorful pnpm-style logging.
 */

const fs = require("fs");
const os = require("os");
const path = require("path");
const sharp = require("sharp");

// ─── Output formatting ─────────────────────────────────────────────────────

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code) => (s) => (useColor ? `\x1b[${code}m${s}\x1b[0m` : s);
const dim = c("2");
const bold = c("1");
const cyan = c("36");
const green = c("32");
const yellow = c("33");
const red = c("31");
const magenta = c("35");

const startedAt = Date.now();
function elapsed(ms = Date.now() - startedAt) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

// ─── Config (unchanged) ────────────────────────────────────────────────────

const RESPONSIVE_WIDTHS = [640, 828, 1080, 1920, 2560];

const config = {
  projects: {
    landscape: { width: 2000, height: 1200, quality: 90 },
    portrait: { width: 1200, height: 1800, quality: 90 },
    hero: { width: 2560, quality: 95 },
    title: { width: 3200, quality: 98 },
    thumbnail: { width: 10, quality: 60 },
  },
  gallery: {
    landscape: { width: 2560, height: 1440, quality: 90 },
    portrait: { width: 1440, height: 2160, quality: 90 },
    fullscreen: { width: 3200, quality: 95 },
    title: { width: 3840, quality: 98 },
    thumbnail: { width: 10, quality: 60 },
  },
  blogs: {
    landscape: { width: 2000, height: 1200, quality: 90 },
    portrait: { width: 1200, height: 1800, quality: 90 },
    hero: { width: 2560, quality: 95 },
    title: { width: 3200, quality: 98 },
    thumbnail: { width: 10, quality: 60 },
  },
  directories: {
    projectsSource: path.join(process.cwd(), "public", "images", "projects"),
    gallerySource: path.join(process.cwd(), "public", "images", "gallery"),
    blogsSource: path.join(process.cwd(), "public", "images", "blogs"),
    optimized: path.join(process.cwd(), "public", "images", "optimized"),
  },
};

if (!fs.existsSync(config.directories.optimized)) {
  fs.mkdirSync(config.directories.optimized, { recursive: true });
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function walkImages(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkImages(full));
    else if (/\.(jpg|jpeg|png)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

function srcMtime(p) {
  return fs.statSync(p).mtimeMs;
}
function isFresh(outPath, srcTime) {
  return fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs >= srcTime;
}

function expectedOutputs(outputFilename) {
  const baseDir = path.dirname(outputFilename);
  const baseName = path.basename(outputFilename, ".webp");
  return [
    outputFilename,
    path.join(baseDir, `${baseName}-thumb.webp`),
    ...RESPONSIVE_WIDTHS.map((w) =>
      path.join(baseDir, `${baseName}-${w}w.webp`),
    ),
  ];
}

// ─── Per-image worker ──────────────────────────────────────────────────────

/**
 * Process one image: emits main + thumbnail + responsive variants.
 * Returns { status: 'optimized' | 'skipped' | 'error', kind, ms, ... }.
 */
async function processOne({
  imagePath,
  outputFilename,
  category,
  variant,
  mainResize,
  mainQuality,
  thumbnailQuality,
  thumbnailWidth,
  rotate = false,
  displayPath,
}) {
  const t0 = Date.now();
  const srcTime = srcMtime(imagePath);

  const baseDir = path.dirname(outputFilename);
  const baseName = path.basename(outputFilename, ".webp");
  const thumbFilename = path.join(baseDir, `${baseName}-thumb.webp`);
  const variantPaths = RESPONSIVE_WIDTHS.map((w) => ({
    width: w,
    out: path.join(baseDir, `${baseName}-${w}w.webp`),
  }));

  const allOutputs = [
    outputFilename,
    thumbFilename,
    ...variantPaths.map((v) => v.out),
  ];
  const inputBytes = fs.statSync(imagePath).size;
  if (allOutputs.every((p) => isFresh(p, srcTime))) {
    const outputBytes = allOutputs.reduce(
      (sum, p) => sum + (fs.existsSync(p) ? fs.statSync(p).size : 0),
      0,
    );
    return {
      status: "skipped",
      category,
      variant,
      displayPath,
      ms: Date.now() - t0,
      inputBytes,
      outputBytes,
    };
  }

  fs.mkdirSync(baseDir, { recursive: true });

  const baseInput = () => {
    const p = sharp(imagePath);
    return rotate ? p.rotate() : p;
  };

  const tasks = [];

  // Main
  tasks.push(
    baseInput()
      .resize({ ...mainResize, fit: "inside", withoutEnlargement: true })
      .webp({ quality: mainQuality })
      .toFile(outputFilename),
  );

  // Responsive variants
  for (const v of variantPaths) {
    tasks.push(
      baseInput()
        .resize({ width: v.width, fit: "inside", withoutEnlargement: true })
        .webp({ quality: mainQuality })
        .toFile(v.out),
    );
  }

  // Thumbnail (skip if filename already contains 'thumb')
  if (!imagePath.includes("thumb")) {
    tasks.push(
      baseInput()
        .resize({
          width: thumbnailWidth,
          fit: "inside",
          withoutEnlargement: true,
        })
        .blur(2)
        .webp({ quality: thumbnailQuality })
        .toFile(thumbFilename),
    );
  }

  await Promise.all(tasks);
  const outputBytes = allOutputs.reduce(
    (sum, p) => sum + (fs.existsSync(p) ? fs.statSync(p).size : 0),
    0,
  );
  return {
    status: "optimized",
    category,
    variant,
    displayPath,
    ms: Date.now() - t0,
    inputBytes,
    outputBytes,
  };
}

// ─── Per-image planner ─────────────────────────────────────────────────────

async function planGallery(imagePath, galleryFolder, indexInFolder) {
  const fileName = path.basename(imagePath);
  const outputDir = path.join(
    config.directories.optimized,
    "gallery",
    galleryFolder,
  );
  const outputFilename = path.join(
    outputDir,
    fileName.replace(/\.[^.]+$/, ".webp"),
  );
  const meta = await sharp(imagePath).metadata();
  const isPortrait = meta.height > meta.width;
  const isFullscreen =
    fileName.includes("fullscreen") || fileName.includes("hero");
  const isTitle = indexInFolder === 0;

  let variant, settings;
  if (isTitle) ((variant = "title"), (settings = config.gallery.title));
  else if (isFullscreen)
    ((variant = "fullscreen"), (settings = config.gallery.fullscreen));
  else if (isPortrait)
    ((variant = "portrait"), (settings = config.gallery.portrait));
  else ((variant = "landscape"), (settings = config.gallery.landscape));

  return {
    imagePath,
    outputFilename,
    category: "gallery",
    variant,
    mainResize: { width: settings.width, height: settings.height },
    mainQuality: settings.quality,
    thumbnailQuality: config.gallery.thumbnail.quality,
    thumbnailWidth: config.gallery.thumbnail.width,
    displayPath: `${galleryFolder}/${fileName}`,
  };
}

async function planFlat(
  imagePath,
  sourceRoot,
  outputSub,
  kindConfig,
  { rotate = false } = {},
) {
  const relativePath = path.relative(sourceRoot, imagePath);
  const outputDir = path.join(
    config.directories.optimized,
    outputSub,
    path.dirname(relativePath),
  );
  const outputFilename = path.join(
    outputDir,
    path.basename(imagePath).replace(/\.[^.]+$/, ".webp"),
  );
  const lower = imagePath.toLowerCase();
  const baseName = path.basename(imagePath).toLowerCase();
  const isTitleCard = lower.includes("titlecard") || baseName.includes("title");
  const isHero = lower.includes("hero") || baseName.startsWith("hero");

  const meta = await (
    rotate ? sharp(imagePath).rotate() : sharp(imagePath)
  ).metadata();
  const isPortrait = meta.height > meta.width;

  let variant, settings;
  if (isTitleCard) ((variant = "title"), (settings = kindConfig.title));
  else if (isHero) ((variant = "hero"), (settings = kindConfig.hero));
  else if (isPortrait)
    ((variant = "portrait"), (settings = kindConfig.portrait));
  else ((variant = "landscape"), (settings = kindConfig.landscape));

  return {
    imagePath,
    outputFilename,
    category: outputSub,
    variant,
    mainResize: { width: settings.width, height: settings.height },
    mainQuality: settings.quality,
    thumbnailQuality: kindConfig.thumbnail.quality,
    thumbnailWidth: kindConfig.thumbnail.width,
    rotate,
    displayPath: relativePath,
  };
}

// ─── Concurrency pool ──────────────────────────────────────────────────────

async function pool(items, worker, concurrency) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (true) {
        const i = cursor++;
        if (i >= items.length) return;
        results[i] = await worker(items[i], i);
      }
    },
  );
  await Promise.all(runners);
  return results;
}

// ─── Variant → color ───────────────────────────────────────────────────────

const variantColor = {
  title: magenta,
  hero: yellow,
  fullscreen: yellow,
  portrait: cyan,
  landscape: cyan,
};

// ─── Bytes formatting ──────────────────────────────────────────────────────

function fmtBytes(n) {
  if (n < 1024) return `${n}B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)}KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)}MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(2)}GB`;
}

// ─── tqdm-style progress renderer ──────────────────────────────────────────

function makeRenderer(total) {
  const isTTY = process.stdout.isTTY && !process.env.NO_COLOR;
  const inFlight = new Map(); // plan → startedAt
  let counter = 0;
  let optimized = 0;
  let skipped = 0;
  let errors = 0;
  let totalIn = 0;
  let totalOut = 0;
  const startWall = Date.now();
  let lastRender = 0;
  let rafTimer = null;

  function bar(done, tot, width = 22) {
    const filled = Math.min(width, Math.round((done / tot) * width));
    return cyan("█".repeat(filled)) + dim("░".repeat(width - filled));
  }

  function render(force = false) {
    if (!isTTY) return;
    const now = Date.now();
    if (!force && now - lastRender < 80) return;
    lastRender = now;

    let current = "...";
    let currentVariant = "";
    if (inFlight.size > 0) {
      // Show most-recently-started image.
      let latest = null;
      let latestT = 0;
      for (const [plan, t] of inFlight) {
        if (t > latestT) {
          latestT = t;
          latest = plan;
        }
      }
      if (latest) {
        current = latest.displayPath;
        const colorFn = variantColor[latest.variant] || cyan;
        currentVariant = colorFn(latest.variant);
      }
    }

    const pct = String(Math.round((counter / total) * 100)).padStart(3);
    const cnt = `${String(counter).padStart(String(total).length)}/${total}`;
    const elapsedS = ((now - startWall) / 1000).toFixed(1) + "s";
    const rate =
      counter > 0
        ? `${(counter / ((now - startWall) / 1000)).toFixed(1)}/s`
        : "—";
    const inFlightTag = inFlight.size > 1 ? dim(`+${inFlight.size - 1}`) : "";

    // Truncate path so the line fits ~120 cols
    const cols = process.stdout.columns || 120;
    const meta = `${bar(counter, total)} ${bold(`${pct}%`)} ${dim(cnt)} ${dim("·")} ${dim(elapsedS)} ${dim("·")} ${dim(rate)}`;
    const prefix = `  ${meta} ${dim("▸")} ${currentVariant} `;
    // Estimate visible length by stripping ANSI
    const visible = prefix.replace(/\x1b\[[0-9;]*m/g, "").length;
    const room = Math.max(10, cols - visible - 6);
    const shownPath =
      current.length > room
        ? "…" + current.slice(current.length - room + 1)
        : current;
    const line = `${prefix}${shownPath} ${inFlightTag}`;

    process.stdout.write("\r\x1b[2K" + line);
  }

  function scheduleRender() {
    if (!isTTY) return;
    if (rafTimer) return;
    rafTimer = setTimeout(() => {
      rafTimer = null;
      render();
    }, 80);
  }

  function clearLine() {
    if (isTTY) process.stdout.write("\r\x1b[2K");
  }

  return {
    start(plan) {
      inFlight.set(plan, Date.now());
      if (!isTTY) {
        // CI/non-TTY: print a one-line start marker.
        const colorFn = variantColor[plan.variant] || cyan;
        console.log(
          `  ${dim("▸")} ${plan.displayPath} ${dim("·")} ${colorFn(plan.variant)}`,
        );
      }
      scheduleRender();
    },
    complete(plan, result) {
      inFlight.delete(plan);
      counter++;
      if (result.status === "optimized") optimized++;
      else if (result.status === "skipped") skipped++;
      else errors++;
      totalIn += result.inputBytes || 0;
      totalOut += result.outputBytes || 0;
      if (!isTTY) {
        const tag =
          result.status === "optimized"
            ? green("✓")
            : result.status === "skipped"
              ? dim("∙")
              : red("✗");
        const colorFn = variantColor[result.variant] || cyan;
        const sizes =
          result.inputBytes && result.outputBytes
            ? ` ${dim(`${fmtBytes(result.inputBytes)} → ${fmtBytes(result.outputBytes)}`)}`
            : "";
        console.log(
          `    ${tag} ${result.displayPath} ${dim("·")} ${colorFn(result.variant)}${sizes} ${dim(`(${elapsed(result.ms)})`)}`,
        );
      }
      scheduleRender();
    },
    error(plan, err) {
      inFlight.delete(plan);
      counter++;
      errors++;
      clearLine();
      console.log(
        `  ${red("✗")} ${plan.displayPath} ${dim("·")} ${red(err.message)}`,
      );
      scheduleRender();
    },
    finalize() {
      if (rafTimer) {
        clearTimeout(rafTimer);
        rafTimer = null;
      }
      clearLine();
      const ratio = totalIn > 0 ? Math.round((totalOut / totalIn) * 100) : 0;
      const saved = Math.max(0, totalIn - totalOut);
      const sizeReport =
        totalIn > 0
          ? ` ${dim("·")} ${green(fmtBytes(totalIn))} ${dim("→")} ${green(fmtBytes(totalOut))} ${dim(`(${ratio}%, saved ${fmtBytes(saved)})`)}`
          : "";
      console.log(
        `${bold(green("✔"))} ${bold("Done")} ${dim("·")} ${green(`${optimized} optimized`)}, ${dim(`${skipped} skipped`)}${errors ? `, ${red(`${errors} errors`)}` : ""}${sizeReport} ${dim(`· ${elapsed()}`)}`,
      );
      return { optimized, skipped, errors };
    },
  };
}

async function buildPlans() {
  const plans = [];

  // Gallery: ordered per folder so isTitle = first image is deterministic.
  if (fs.existsSync(config.directories.gallerySource)) {
    const folders = fs
      .readdirSync(config.directories.gallerySource)
      .filter((f) => {
        try {
          return fs
            .statSync(path.join(config.directories.gallerySource, f))
            .isDirectory();
        } catch {
          return false;
        }
      });
    for (const folder of folders) {
      const folderPath = path.join(config.directories.gallerySource, folder);
      const images = fs
        .readdirSync(folderPath)
        .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
        .sort();
      for (let i = 0; i < images.length; i++) {
        plans.push(
          await planGallery(path.join(folderPath, images[i]), folder, i),
        );
      }
    }
  }

  // Projects
  for (const img of walkImages(config.directories.projectsSource)) {
    plans.push(
      await planFlat(
        img,
        config.directories.projectsSource,
        "projects",
        config.projects,
      ),
    );
  }

  // Blogs
  for (const img of walkImages(config.directories.blogsSource)) {
    plans.push(
      await planFlat(
        img,
        config.directories.blogsSource,
        "blogs",
        config.blogs,
        {
          rotate: true,
        },
      ),
    );
  }

  return plans;
}

async function main() {
  const concurrency = Math.min(8, Math.max(2, os.cpus().length));
  console.log(
    `${bold(cyan("◆"))} ${bold("Optimizing images")} ${dim(`· concurrency=${concurrency}`)}`,
  );

  const planStart = Date.now();
  const plans = await buildPlans();
  const galleryN = plans.filter((p) => p.category === "gallery").length;
  const projectsN = plans.filter((p) => p.category === "projects").length;
  const blogsN = plans.filter((p) => p.category === "blogs").length;
  console.log(
    dim(
      `  ${plans.length} images planned in ${elapsed(Date.now() - planStart)} ` +
        `(${galleryN} gallery, ${projectsN} projects, ${blogsN} blogs)`,
    ),
  );

  if (plans.length === 0) {
    console.log(`${green("✔")} Nothing to do.`);
    return;
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
    concurrency,
  );

  const { errors } = renderer.finalize();
  if (errors > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(red("✗ optimize-images failed:"), err);
  process.exit(1);
});
