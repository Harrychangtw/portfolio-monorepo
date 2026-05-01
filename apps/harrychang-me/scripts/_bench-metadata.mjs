#!/usr/bin/env node
// Benchmark for getAllPostsMetadata + getAllProjectsMetadata
import fs from "node:fs";
import path from "node:path";
import { performance } from "node:perf_hooks";
import matter from "gray-matter";
import { imageSize } from "image-size";

const cwd = process.cwd();
const projectsDirectory = path.join(cwd, "content/projects");
const postsDirectory = path.join(cwd, "content/posts");

// Counters
let counters;
function resetCounters() {
  counters = {
    readFileSyncCalls: 0,
    bytesRead: 0,
    imageSizeCalls: 0,
    getDimsCalls: 0,
    matterCalls: 0,
    timeReadFileMs: 0,
    timeImageSizeMs: 0,
    timeMatterMs: 0,
  };
}

function readFileTracked(p, enc) {
  const t0 = performance.now();
  const data = fs.readFileSync(p, enc);
  counters.timeReadFileMs += performance.now() - t0;
  counters.readFileSyncCalls += 1;
  counters.bytesRead += enc ? Buffer.byteLength(data) : data.length;
  return data;
}

function getFullResolutionPath(imagePath) {
  if (!imagePath) return imagePath;
  if (!imagePath.startsWith("/") && !imagePath.startsWith("http"))
    imagePath = "/" + imagePath;
  if (imagePath.includes("/images/") && !imagePath.includes("/optimized/"))
    imagePath = imagePath.replace("/images/", "/images/optimized/");
  imagePath = imagePath.replace(/-thumb\.webp$/i, ".webp");
  imagePath = imagePath.replace(/\.(jpe?g|png|webp)$/i, ".webp");
  return imagePath;
}
function getThumbnailPath(imagePath) {
  if (!imagePath) return imagePath;
  if (!imagePath.startsWith("/") && !imagePath.startsWith("http"))
    imagePath = "/" + imagePath;
  if (imagePath.includes("/images/") && !imagePath.includes("/optimized/"))
    imagePath = imagePath.replace("/images/", "/images/optimized/");
  imagePath = imagePath.replace(/\.(jpe?g|png|webp)$/i, ".webp");
  if (!/-thumb\.webp$/i.test(imagePath))
    imagePath = imagePath.replace(/\.webp$/i, "-thumb.webp");
  return imagePath;
}
function getDimsFromWebPath(webPath) {
  counters.getDimsCalls += 1;
  try {
    if (!webPath || webPath.startsWith("http")) return null;
    const fullRes = getFullResolutionPath(webPath);
    const absPath = path.join(cwd, "public", fullRes.replace(/^\//, ""));
    if (!fs.existsSync(absPath)) return null;
    const buffer = readFileTracked(absPath);
    const t0 = performance.now();
    counters.imageSizeCalls += 1;
    const res = imageSize(buffer);
    counters.timeImageSizeMs += performance.now() - t0;
    if (!res?.width || !res?.height) return null;
    return { width: res.width, height: res.height };
  } catch {
    return null;
  }
}

function getAllPostsMetadata(locale = "en") {
  if (!fs.existsSync(postsDirectory)) return [];
  let fileNames = fs.readdirSync(postsDirectory);
  fileNames = fileNames.filter((f) => {
    if (locale === "zh-TW") {
      if (f.includes("_zh-tw")) return true;
      const baseName = f.replace(".md", "");
      return (
        !fs.existsSync(path.join(postsDirectory, `${baseName}_zh-tw.md`)) &&
        !f.includes("_")
      );
    }
    return !f.includes("_zh-tw") && !f.includes("_zh-TW");
  });
  return fileNames
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = readFileTracked(fullPath, "utf8");
      const tm = performance.now();
      const matterResult = matter(fileContents);
      counters.timeMatterMs += performance.now() - tm;
      counters.matterCalls += 1;
      const data = matterResult.data;
      if (data.imageUrl) {
        const fullResPath = getFullResolutionPath(data.imageUrl);
        const dims = getDimsFromWebPath(fullResPath);
        if (dims) {
          data.imageWidth = dims.width;
          data.imageHeight = dims.height;
        }
        data.imageUrl = getThumbnailPath(data.imageUrl);
      }
      return { slug, ...data };
    })
    .filter((p) => !p.hidden);
}

function getAllProjectsMetadata(locale = "en") {
  if (!fs.existsSync(projectsDirectory)) return [];
  let fileNames = fs.readdirSync(projectsDirectory);
  fileNames = fileNames.filter((f) => {
    if (locale === "zh-TW") {
      if (f.includes("_zh-tw")) return true;
      const baseName = f.replace(".md", "");
      return (
        !fs.existsSync(path.join(projectsDirectory, `${baseName}_zh-tw.md`)) &&
        !f.includes("_")
      );
    }
    return !f.includes("_zh-tw") && !f.includes("_zh-TW");
  });
  return fileNames
    .filter((f) => f.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(projectsDirectory, fileName);
      const fileContents = readFileTracked(fullPath, "utf8");
      const tm = performance.now();
      const matterResult = matter(fileContents);
      counters.timeMatterMs += performance.now() - tm;
      counters.matterCalls += 1;
      const data = matterResult.data;
      if (data.imageUrl) {
        const fullResPath = getFullResolutionPath(data.imageUrl);
        const dims = getDimsFromWebPath(fullResPath);
        if (dims) {
          data.imageWidth = dims.width;
          data.imageHeight = dims.height;
        }
        data.imageUrl = getThumbnailPath(data.imageUrl);
      }
      return { slug, ...data };
    })
    .filter((p) => !p.hidden);
}

function bench(name, fn, runs = 3) {
  const times = [];
  let res;
  let lastCounters;
  for (let i = 0; i < runs; i++) {
    resetCounters();
    const t0 = performance.now();
    res = fn();
    const t1 = performance.now();
    times.push(t1 - t0);
    lastCounters = { ...counters };
  }
  times.sort((a, b) => a - b);
  return {
    name,
    count: res.length,
    min: times[0],
    median: times[Math.floor(times.length / 2)],
    max: times[times.length - 1],
    counters: lastCounters,
  };
}

function fmt(n) {
  return typeof n === "number" ? n.toFixed(2) : n;
}
function report(label, r) {
  console.log(`\n[${label}] ${r.name}`);
  console.log(
    `  cards=${r.count}  min=${fmt(r.min)}ms  median=${fmt(r.median)}ms  max=${fmt(r.max)}ms`,
  );
  const c = r.counters;
  console.log(
    `  files: readFileSync=${c.readFileSyncCalls}  bytesRead=${(c.bytesRead / 1024).toFixed(1)}KiB  matter=${c.matterCalls}  getDims=${c.getDimsCalls}  imageSize=${c.imageSizeCalls}`,
  );
  console.log(
    `  time: readFile=${fmt(c.timeReadFileMs)}ms  imageSize=${fmt(c.timeImageSizeMs)}ms  matter=${fmt(c.timeMatterMs)}ms  per-card=${fmt(r.median / Math.max(r.count, 1))}ms`,
  );
}

console.log("=== COLD RUN (after cache drop attempt) ===");
// Best-effort cold: just first invocation in this process
const coldPosts = bench("getAllPostsMetadata", () => getAllPostsMetadata("en"), 1);
const coldProjects = bench("getAllProjectsMetadata", () => getAllProjectsMetadata("en"), 1);
report("cold", coldPosts);
report("cold", coldProjects);

console.log("\n=== WARM RUN (3x each) ===");
const warmPosts = bench("getAllPostsMetadata", () => getAllPostsMetadata("en"), 3);
const warmProjects = bench("getAllProjectsMetadata", () => getAllProjectsMetadata("en"), 3);
report("warm", warmPosts);
report("warm", warmProjects);

console.log("\n=== Combined per-render (median warm) ===");
console.log(
  `  posts+projects = ${fmt(warmPosts.median + warmProjects.median)}ms`,
);
