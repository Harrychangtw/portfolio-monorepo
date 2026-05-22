"use strict";

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

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

function isFresh(outPath, srcTime) {
  return fs.existsSync(outPath) && fs.statSync(outPath).mtimeMs >= srcTime;
}

async function processOne(plan) {
  const {
    imagePath,
    outputFilename,
    mainResize,
    mainQuality,
    mainFit = "inside",
    mainPosition,
    thumbnailQuality,
    thumbnailWidth,
    thumbnailFit = "inside",
    thumbnailPosition,
    rotate = false,
    category,
    variant,
    displayPath,
  } = plan;

  const t0 = Date.now();
  const srcTime = fs.statSync(imagePath).mtimeMs;

  const baseDir = path.dirname(outputFilename);
  const baseName = path.basename(outputFilename, ".webp");
  const thumbFilename = path.join(baseDir, `${baseName}-thumb.webp`);

  const wantThumb = !path.basename(imagePath).includes("thumb");
  const allOutputs = [outputFilename, ...(wantThumb ? [thumbFilename] : [])];

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

  const mainResizeOpts = {
    ...mainResize,
    fit: mainFit,
    ...(mainFit === "cover" || mainFit === "contain"
      ? { position: mainPosition || "center" }
      : { withoutEnlargement: true }),
  };

  tasks.push(
    baseInput()
      .resize(mainResizeOpts)
      .webp({ quality: mainQuality })
      .toFile(outputFilename),
  );

  if (wantThumb) {
    const thumbResize = {
      width: thumbnailWidth,
      ...(thumbnailFit === "cover" || thumbnailFit === "contain"
        ? {
            height: thumbnailWidth,
            fit: thumbnailFit,
            position: thumbnailPosition || "center",
          }
        : { fit: thumbnailFit, withoutEnlargement: true }),
    };
    tasks.push(
      baseInput()
        .resize(thumbResize)
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

module.exports = { walkImages, isFresh, processOne, pool };
