#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

function readLhrDir(dir) {
  const absDir = path.join(process.cwd(), dir);
  if (!fs.existsSync(absDir)) return {};

  const lhrFiles = fs
    .readdirSync(absDir)
    .filter((f) => f.startsWith("lhr-") && f.endsWith(".json"));

  const data = {};
  for (const file of lhrFiles) {
    try {
      const lhr = JSON.parse(fs.readFileSync(path.join(absDir, file), "utf8"));
      const urlPath = new URL(lhr.requestedUrl).pathname || "/";
      const perfScore = Math.round(
        (lhr.categories?.performance?.score ?? 0) * 100,
      );
      const get = (key) => lhr.audits?.[key]?.displayValue ?? "-";

      if (!data[urlPath] || perfScore > data[urlPath].perfScore) {
        data[urlPath] = {
          perfScore,
          fcp: get("first-contentful-paint"),
          lcp: get("largest-contentful-paint"),
          tbt: get("total-blocking-time"),
          cls: get("cumulative-layout-shift"),
          si: get("speed-index"),
        };
      }
    } catch (err) {
      console.warn(`Skipping ${file}: ${err.message}`);
    }
  }
  return data;
}

function buildRows(routeData) {
  return Object.keys(routeData)
    .sort()
    .map((route) => {
      const d = routeData[route];
      const color =
        d.perfScore >= 90
          ? "success"
          : d.perfScore >= 50
            ? "important"
            : "critical";
      const badge = `![Lighthouse ${d.perfScore}](https://img.shields.io/badge/lighthouse-${d.perfScore}-${color}?style=flat-square)`;
      return `| \`${route}\` | ${badge} | ${d.fcp} | ${d.lcp} | ${d.tbt} | ${d.cls} | ${d.si} |`;
    })
    .join("\n");
}

const TABLE_HEADER = [
  "| Tested Route | Performance | FCP | LCP | TBT | CLS | Speed Index |",
  "|:---|:---|:---|:---|:---|:---|:---|",
].join("\n");

const mode = process.argv.includes("--mode=prod") ? "prod" : "simulated";

// `--readme=<relative-path>` lets a workflow target a different app's README
// (e.g. apps/emilychang-me/README.md). Defaults to harrychang-me to preserve
// existing behavior.
const readmeArg = process.argv.find((a) => a.startsWith("--readme="));
const readmeRel = readmeArg
  ? readmeArg.slice("--readme=".length)
  : "apps/harrychang-me/README.md";
const readmePath = path.join(process.cwd(), readmeRel);
const readme = fs.readFileSync(readmePath, "utf8");
const timestamp = new Date().toUTCString();

if (mode === "prod") {
  const desktopData = readLhrDir(".lighthouseci");
  const mobileData = readLhrDir(".lighthouseci-mobile");

  const hasDesktop = Object.keys(desktopData).length > 0;
  const hasMobile = Object.keys(mobileData).length > 0;

  if (!hasDesktop && !hasMobile) {
    console.log("No production LHR JSON files found — skipping README update.");
    process.exit(0);
  }

  const deploymentUrl = process.env.DEPLOYMENT_URL || "";
  const header = deploymentUrl
    ? `> 🕐 **Last audited:** ${timestamp}  \n> 🌐 **Deployment:** ${deploymentUrl}`
    : `> 🕐 **Last audited:** ${timestamp}`;

  const sections = [];
  if (hasDesktop) {
    sections.push(
      `#### Desktop (Production Deployment)\n\n${TABLE_HEADER}\n${buildRows(desktopData)}`,
    );
  }
  if (hasMobile) {
    sections.push(
      `#### Mobile (Production Deployment)\n\n${TABLE_HEADER}\n${buildRows(mobileData)}`,
    );
  }

  const block = [
    "<!-- LIGHTHOUSE_PROD_RESULTS_START -->",
    header,
    "",
    sections.join("\n\n"),
    "<!-- LIGHTHOUSE_PROD_RESULTS_END -->",
  ].join("\n");

  if (
    !/<!-- LIGHTHOUSE_PROD_RESULTS_START -->[\s\S]*?<!-- LIGHTHOUSE_PROD_RESULTS_END -->/.test(
      readme,
    )
  ) {
    console.error(
      "Production marker block not found in README. Add the markers first.",
    );
    process.exit(1);
  }

  const updated = readme.replace(
    /<!-- LIGHTHOUSE_PROD_RESULTS_START -->[\s\S]*?<!-- LIGHTHOUSE_PROD_RESULTS_END -->/,
    block,
  );
  fs.writeFileSync(readmePath, updated, "utf8");
  console.log("README production Lighthouse section updated successfully.");
  process.exit(0);
}

const desktopData = readLhrDir(".lighthouseci");
const mobileData = readLhrDir(".lighthouseci-mobile");

const hasDesktop = Object.keys(desktopData).length > 0;
const hasMobile = Object.keys(mobileData).length > 0;

if (!hasDesktop && !hasMobile) {
  console.log("No LHR JSON files found — skipping README update.");
  process.exit(0);
}

const sections = [];
if (hasDesktop) {
  sections.push(`#### Desktop\n\n${TABLE_HEADER}\n${buildRows(desktopData)}`);
}
if (hasMobile) {
  sections.push(`#### Mobile\n\n${TABLE_HEADER}\n${buildRows(mobileData)}`);
}

const block = [
  "<!-- LIGHTHOUSE_RESULTS_START -->",
  `> 🕐 **Last audited:** ${timestamp}`,
  "",
  sections.join("\n\n"),
  "<!-- LIGHTHOUSE_RESULTS_END -->",
].join("\n");

const updated = readme.replace(
  /<!-- LIGHTHOUSE_RESULTS_START -->[\s\S]*?<!-- LIGHTHOUSE_RESULTS_END -->/,
  block,
);
fs.writeFileSync(readmePath, updated, "utf8");
console.log("README Lighthouse section updated successfully.");
