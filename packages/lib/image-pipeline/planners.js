"use strict";

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const { walkImages } = require("./engine");

function pickFlatVariant(imagePath, kindConfig) {
  const lower = imagePath.toLowerCase();
  const baseName = path.basename(imagePath).toLowerCase();
  const isTitleCard =
    !!kindConfig.title &&
    (lower.includes("titlecard") || baseName.includes("title"));
  const isHero =
    !!kindConfig.hero &&
    (lower.includes("hero") || baseName.startsWith("hero"));
  return { isTitleCard, isHero };
}

async function planFlat(imagePath, sourceRoot, outputSub, optimizedRoot, opts) {
  const { config: kindConfig, rotate = false } = opts;
  const relativePath = path.relative(sourceRoot, imagePath);
  const outputDir = path.join(
    optimizedRoot,
    outputSub,
    path.dirname(relativePath),
  );
  const outputFilename = path.join(
    outputDir,
    path.basename(imagePath).replace(/\.[^.]+$/, ".webp"),
  );

  const { isTitleCard, isHero } = pickFlatVariant(imagePath, kindConfig);

  const meta = await (
    rotate ? sharp(imagePath).rotate() : sharp(imagePath)
  ).metadata();
  const isPortrait = meta.height > meta.width;

  let variant, settings;
  if (isTitleCard) {
    variant = "title";
    settings = kindConfig.title;
  } else if (isHero) {
    variant = "hero";
    settings = kindConfig.hero;
  } else if (isPortrait) {
    variant = "portrait";
    settings = kindConfig.portrait;
  } else {
    variant = "landscape";
    settings = kindConfig.landscape;
  }

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

async function planGallery(
  imagePath,
  galleryFolder,
  indexInFolder,
  optimizedRoot,
  opts,
) {
  const { config: kindConfig } = opts;
  const fileName = path.basename(imagePath);
  const outputDir = path.join(optimizedRoot, "gallery", galleryFolder);
  const outputFilename = path.join(
    outputDir,
    fileName.replace(/\.[^.]+$/, ".webp"),
  );

  const meta = await sharp(imagePath).metadata();
  const isPortrait = meta.height > meta.width;
  const isFullscreen =
    !!kindConfig.fullscreen &&
    (fileName.includes("fullscreen") || fileName.includes("hero"));
  const isTitle = !!kindConfig.title && indexInFolder === 0;

  let variant, settings;
  if (isTitle) {
    variant = "title";
    settings = kindConfig.title;
  } else if (isFullscreen) {
    variant = "fullscreen";
    settings = kindConfig.fullscreen;
  } else if (isPortrait) {
    variant = "portrait";
    settings = kindConfig.portrait;
  } else {
    variant = "landscape";
    settings = kindConfig.landscape;
  }

  return {
    imagePath,
    outputFilename,
    category: "gallery",
    variant,
    mainResize: { width: settings.width, height: settings.height },
    mainQuality: settings.quality,
    thumbnailQuality: kindConfig.thumbnail.quality,
    thumbnailWidth: kindConfig.thumbnail.width,
    displayPath: `${galleryFolder}/${fileName}`,
  };
}

async function planSquare(
  imagePath,
  sourceRoot,
  outputSub,
  optimizedRoot,
  opts,
) {
  const { config: kindConfig, rotate = false } = opts;
  const relativePath = path.relative(sourceRoot, imagePath);
  const outputDir = path.join(
    optimizedRoot,
    outputSub,
    path.dirname(relativePath),
  );
  const outputFilename = path.join(
    outputDir,
    path.basename(imagePath).replace(/\.[^.]+$/, ".webp"),
  );

  const settings = kindConfig.square;

  return {
    imagePath,
    outputFilename,
    category: outputSub,
    variant: "square",
    mainResize: { width: settings.width, height: settings.height },
    mainQuality: settings.quality,
    mainFit: "cover",
    mainPosition: "center",
    thumbnailQuality: kindConfig.thumbnail.quality,
    thumbnailWidth: kindConfig.thumbnail.width,
    thumbnailFit: "cover",
    thumbnailPosition: "center",
    rotate,
    displayPath: relativePath,
  };
}

async function buildPlansForCategory(name, spec, directories) {
  const { mode, source, config, rotate } = spec;
  const optimizedRoot = directories.optimized;
  const plans = [];

  if (!fs.existsSync(source)) return plans;

  if (mode === "gallery") {
    const folders = fs.readdirSync(source).filter((f) => {
      if (f === "raw") return false;
      try {
        return fs.statSync(path.join(source, f)).isDirectory();
      } catch {
        return false;
      }
    });
    for (const folder of folders) {
      const folderPath = path.join(source, folder);
      const images = fs
        .readdirSync(folderPath)
        .filter((f) => /\.(jpg|jpeg|png)$/i.test(f))
        .sort();
      for (let i = 0; i < images.length; i++) {
        plans.push(
          await planGallery(
            path.join(folderPath, images[i]),
            folder,
            i,
            optimizedRoot,
            { config },
          ),
        );
      }
    }
  } else if (mode === "flat") {
    for (const img of walkImages(source)) {
      plans.push(
        await planFlat(img, source, name, optimizedRoot, {
          config,
          rotate,
        }),
      );
    }
  } else if (mode === "square") {
    for (const img of walkImages(source)) {
      plans.push(
        await planSquare(img, source, name, optimizedRoot, {
          config,
          rotate,
        }),
      );
    }
  } else {
    throw new Error(`Unknown category mode: ${mode}`);
  }

  return plans;
}

module.exports = { planFlat, planGallery, planSquare, buildPlansForCategory };
