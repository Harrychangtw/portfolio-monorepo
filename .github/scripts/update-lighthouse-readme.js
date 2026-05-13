#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const LOCALE_LABEL = { en: "EN", "zh-tw": "繁中" };
const DATA_DIR = path.join(process.cwd(), ".github/lighthouse-data");
const LAB_FILE = path.join(DATA_DIR, "harry-lab.json");
const PROD_FILE = path.join(DATA_DIR, "harry-prod.json");

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
      const langParam = url.searchParams.get("lang")?.toLowerCase() || "en";
      const locale = LOCALE_LABEL[langParam] || "EN";
      const key = `${urlPath}|${locale}`;
      const perfScore = Math.round(
        (lhr.categories?.performance?.score ?? 0) * 100,
      );

      if (!data[key] || perfScore > data[key].perfScore) {
        data[key] = { route: urlPath, locale, perfScore };
      }
    } catch (err) {
      console.warn(`Skipping ${file}: ${err.message}`);
    }
  }
  return data;
}

function readDataFile(filePath) {
  if (!fs.existsSync(filePath))
    return { timestamp: null, desktop: {}, mobile: {} };
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return { timestamp: null, desktop: {}, mobile: {} };
  }
}

function writeDataFile(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function badge(score) {
  if (score == null) return "-";
  const color =
    score >= 90 ? "success" : score >= 50 ? "important" : "critical";
  return `![${score}](https://img.shields.io/badge/${score}-${color}?style=flat-square)`;
}

function buildUnifiedTable(lab, prod) {
  const allKeys = new Set([
    ...Object.keys(lab.desktop || {}),
    ...Object.keys(lab.mobile || {}),
    ...Object.keys(prod.desktop || {}),
    ...Object.keys(prod.mobile || {}),
  ]);

  const rows = [];
  for (const key of allKeys) {
    const [route, locale] = key.split("|");
    rows.push({
      route,
      locale,
      labDesktop: lab.desktop?.[key]?.perfScore ?? null,
      labMobile: lab.mobile?.[key]?.perfScore ?? null,
      prodDesktop: prod.desktop?.[key]?.perfScore ?? null,
      prodMobile: prod.mobile?.[key]?.perfScore ?? null,
    });
  }

  rows.sort((a, b) => {
    const r = a.route.localeCompare(b.route);
    if (r !== 0) return r;
    return a.locale.localeCompare(b.locale);
  });

  const header = [
    "| Route | Locale | Lab 🖥️ | Lab 📱 | Prod 🖥️ | Prod 📱 |",
    "| :--- | :--- | :--- | :--- | :--- | :--- |",
  ].join("\n");

  const body = rows
    .map(
      (r) =>
        `| \`${r.route}\` | ${r.locale} | ${badge(r.labDesktop)} | ${badge(r.labMobile)} | ${badge(r.prodDesktop)} | ${badge(r.prodMobile)} |`,
    )
    .join("\n");

  return `${header}\n${body}`;
}

// --- Main ---

const mode = process.argv.includes("--mode=prod") ? "prod" : "lab";

const readmeArg = process.argv.find((a) => a.startsWith("--readme="));
const readmeRel = readmeArg
  ? readmeArg.slice("--readme=".length)
  : "apps/harrychang-me/README.md";
const readmePath = path.join(process.cwd(), readmeRel);

const desktopData = readLhrDir(".lighthouseci");
const mobileData = readLhrDir(".lighthouseci-mobile");

const hasDesktop = Object.keys(desktopData).length > 0;
const hasMobile = Object.keys(mobileData).length > 0;

if (!hasDesktop && !hasMobile) {
  console.log("No LHR JSON files found — skipping update.");
  process.exit(0);
}

const timestamp = new Date().toUTCString();
const dataFile = mode === "prod" ? PROD_FILE : LAB_FILE;

writeDataFile(dataFile, {
  timestamp,
  desktop: desktopData,
  mobile: mobileData,
});
console.log(
  `Wrote ${mode} scores to ${path.relative(process.cwd(), dataFile)}`,
);

const lab = readDataFile(LAB_FILE);
const prod = readDataFile(PROD_FILE);

const parts = [];
if (lab.timestamp) parts.push(`Lab: ${lab.timestamp}`);
if (prod.timestamp) parts.push(`Prod: ${prod.timestamp}`);
const tsLine = parts.join(" · ");

const deploymentUrl = mode === "prod" ? process.env.DEPLOYMENT_URL || "" : "";
const headerLines = [`> 🕐 **Last audited:** ${tsLine}`];
if (deploymentUrl) headerLines.push(`> 🌐 **Deployment:** ${deploymentUrl}`);

const block = [
  "<!-- LIGHTHOUSE_RESULTS_START -->",
  "",
  headerLines.join("  \n"),
  "",
  buildUnifiedTable(lab, prod),
  "",
  "<!-- LIGHTHOUSE_RESULTS_END -->",
].join("\n");

const readme = fs.readFileSync(readmePath, "utf8");

if (
  !/<!-- LIGHTHOUSE_RESULTS_START -->[\s\S]*?<!-- LIGHTHOUSE_RESULTS_END -->/.test(
    readme,
  )
) {
  console.error(
    "Marker block <!-- LIGHTHOUSE_RESULTS_START/END --> not found in README.",
  );
  process.exit(1);
}

const updated = readme.replace(
  /<!-- LIGHTHOUSE_RESULTS_START -->[\s\S]*?<!-- LIGHTHOUSE_RESULTS_END -->/,
  block,
);
fs.writeFileSync(readmePath, updated, "utf8");
console.log("README unified Lighthouse table updated.");
