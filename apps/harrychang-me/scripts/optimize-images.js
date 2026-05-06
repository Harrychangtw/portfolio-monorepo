#!/usr/bin/env node
/**
 * harrychang-me image optimization. Engine lives in
 * @portfolio/lib/image-pipeline; this file only declares per-category specs.
 *
 * Outputs go to public/images/optimized/{projects,gallery,blogs}/...
 * Responsive variants (-{640,828,1080,1920,2560}w.webp) are consumed by the
 * shared <ImageContainer> via a custom Next loader.
 */

const path = require("path");
const {
  runOptimize,
  RESPONSIVE_WIDTHS,
} = require("@portfolio/lib/image-pipeline");

const cwd = process.cwd();
const sourcesRoot = path.join(cwd, "public", "images");

const projects = {
  landscape: { width: 2000, height: 1200, quality: 90 },
  portrait: { width: 1200, height: 1800, quality: 90 },
  hero: { width: 2560, quality: 95 },
  title: { width: 3200, quality: 98 },
  thumbnail: { width: 10, quality: 60 },
};

const gallery = {
  landscape: { width: 2560, height: 1440, quality: 90 },
  portrait: { width: 1440, height: 2160, quality: 90 },
  fullscreen: { width: 3200, quality: 95 },
  title: { width: 3840, quality: 98 },
  thumbnail: { width: 10, quality: 60 },
};

const blogs = {
  landscape: { width: 2000, height: 1200, quality: 90 },
  portrait: { width: 1200, height: 1800, quality: 90 },
  hero: { width: 2560, quality: 95 },
  title: { width: 3200, quality: 98 },
  thumbnail: { width: 10, quality: 60 },
};

runOptimize({
  directories: {
    optimized: path.join(sourcesRoot, "optimized"),
  },
  categories: {
    projects: {
      mode: "flat",
      source: path.join(sourcesRoot, "projects"),
      config: projects,
      responsiveWidths: RESPONSIVE_WIDTHS,
    },
    gallery: {
      mode: "gallery",
      source: path.join(sourcesRoot, "gallery"),
      config: gallery,
      responsiveWidths: RESPONSIVE_WIDTHS,
    },
    blogs: {
      mode: "flat",
      source: path.join(sourcesRoot, "blogs"),
      config: blogs,
      rotate: true,
      responsiveWidths: RESPONSIVE_WIDTHS,
    },
  },
}).catch((err) => {
  console.error("✗ optimize-images failed:", err);
  process.exit(1);
});
