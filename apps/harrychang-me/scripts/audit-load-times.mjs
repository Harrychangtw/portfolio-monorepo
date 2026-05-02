#!/usr/bin/env node
/**
 * Audit page-transition load times across all routes and emit a histogram
 * suitable for pasting into config/load-time-distribution.ts.
 *
 * Measures wall-clock from navigation start to first contentful paint —
 * the same window the on-screen timer counts up over.
 *
 * Usage:
 *   1. Build + start prod server in another shell:
 *        pnpm --filter harry-chang-portfolio build
 *        pnpm --filter harry-chang-portfolio start
 *   2. Install playwright once (one-time):
 *        pnpm add -D playwright -w && pnpm exec playwright install chromium
 *   3. Run:
 *        node scripts/audit-load-times.mjs
 *        BASE_URL=http://localhost:3000 RUNS=8 node scripts/audit-load-times.mjs
 */

import fs from "node:fs";
import path from "node:path";

const APP_ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const RUNS = Number(process.env.RUNS || 6);
const BUCKET_MS = 200;
const BUCKETS = 16;

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error(
    "playwright is not installed. Run:\n  pnpm add -D playwright -w && pnpm exec playwright install chromium",
  );
  process.exit(1);
}

const pathsFile = path.join(APP_ROOT, "scripts/lighthouse-local-paths.txt");
const routes = fs
  .readFileSync(pathsFile, "utf8")
  .split("\n")
  .map((s) => s.trim())
  .filter((s) => s && !s.startsWith("#"));

const samples = [];

const browser = await chromium.launch();
try {
  for (const route of routes) {
    for (let i = 0; i < RUNS; i++) {
      const ctx = await browser.newContext();
      const page = await ctx.newPage();
      const url = new URL(route, BASE_URL).toString();
      const t0 = Date.now();
      try {
        await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });
        const fcp = await page.evaluate(
          () =>
            new Promise((resolve) => {
              const ob = new PerformanceObserver((list) => {
                for (const e of list.getEntries()) {
                  if (e.name === "first-contentful-paint") {
                    resolve(e.startTime);
                    ob.disconnect();
                    return;
                  }
                }
              });
              ob.observe({ type: "paint", buffered: true });
              setTimeout(() => resolve(performance.now()), 5000);
            }),
        );
        const elapsed = Math.round(fcp ?? Date.now() - t0);
        samples.push(elapsed);
        process.stderr.write(`${route} #${i + 1}: ${elapsed}ms\n`);
      } catch (err) {
        process.stderr.write(`${route} #${i + 1}: FAIL ${err.message}\n`);
      } finally {
        await ctx.close();
      }
    }
  }
} finally {
  await browser.close();
}

const counts = new Array(BUCKETS).fill(0);
for (const ms of samples) {
  const i = Math.min(BUCKETS - 1, Math.max(0, Math.floor(ms / BUCKET_MS)));
  counts[i]++;
}
const max = Math.max(...counts, 1);
const density = counts.map((c) => Number((c / max).toFixed(3)));

console.log(`\n// n=${samples.length} samples, BUCKET_MS=${BUCKET_MS}`);
console.log("export const LOAD_TIME_HISTOGRAM: readonly number[] = [");
for (let i = 0; i < density.length; i += 8) {
  console.log("  " + density.slice(i, i + 8).join(", ") + ",");
}
console.log("];");
