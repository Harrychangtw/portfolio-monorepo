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
      const url = new URL(lhr.requestedUrl);
      const urlPath = url.pathname || "/";
      const locale =
        url.searchParams.get("lang")?.toLowerCase() === "zh-tw"
          ? "ZH-TW"
          : "EN";
      const key = `${urlPath}|${locale}`;
      const perfScore = Math.round(
        (lhr.categories?.performance?.score ?? 0) * 100,
      );
      const get = (k) => lhr.audits?.[k]?.displayValue ?? "-";

      if (!data[key] || perfScore > data[key].perfScore) {
        data[key] = {
          route: urlPath,
          locale,
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

function badge(score) {
  const color =
    score >= 90 ? "success" : score >= 50 ? "important" : "critical";
  return `![${score}](https://img.shields.io/badge/${score}-${color}?style=flat-square)`;
}

function metricsCell(d) {
  if (!d) return "- | - | - | - | - | -";
  return `${badge(d.perfScore)} | ${d.fcp} | ${d.lcp} | ${d.tbt} | ${d.cls} | ${d.si}`;
}

function buildMergedTable(desktopData, mobileData) {
  const allKeys = new Set([
    ...Object.keys(desktopData),
    ...Object.keys(mobileData),
  ]);

  const rows = [];
  for (const key of allKeys) {
    const entry = desktopData[key] || mobileData[key];
    rows.push({
      route: entry.route,
      locale: entry.locale,
      desktop: desktopData[key] || null,
      mobile: mobileData[key] || null,
    });
  }

  rows.sort((a, b) => {
    const r = a.route.localeCompare(b.route);
    if (r !== 0) return r;
    return a.locale.localeCompare(b.locale);
  });

  const header = [
    "| Route | Locale | Desktop Perf | Desktop FCP | Desktop LCP | Desktop TBT | Desktop CLS | Desktop SI | Mobile Perf | Mobile FCP | Mobile LCP | Mobile TBT | Mobile CLS | Mobile SI |",
    "|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|",
  ].join("\n");

  const body = rows
    .map(
      (r) =>
        `| \`${r.route}\` | ${r.locale} | ${metricsCell(r.desktop)} | ${metricsCell(r.mobile)} |`,
    )
    .join("\n");

  return `${header}\n${body}`;
}

const mode = process.argv.includes("--mode=prod") ? "prod" : "simulated";

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

  const block = [
    "<!-- LIGHTHOUSE_PROD_RESULTS_START -->",
    header,
    "",
    buildMergedTable(desktopData, mobileData),
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

const block = [
  "<!-- LIGHTHOUSE_RESULTS_START -->",
  `> 🕐 **Last audited:** ${timestamp}`,
  "",
  buildMergedTable(desktopData, mobileData),
  "<!-- LIGHTHOUSE_RESULTS_END -->",
].join("\n");

const updated = readme.replace(
  /<!-- LIGHTHOUSE_RESULTS_START -->[\s\S]*?<!-- LIGHTHOUSE_RESULTS_END -->/,
  block,
);
fs.writeFileSync(readmePath, updated, "utf8");
console.log("README Lighthouse section updated successfully.");
