#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

const lhciDir = path.join(process.cwd(), '.lighthouseci');

if (!fs.existsSync(lhciDir)) {
  console.log('No .lighthouseci directory found — skipping README update.');
  process.exit(0);
}

const lhrFiles = fs
  .readdirSync(lhciDir)
  .filter(f => f.startsWith('lhr-') && f.endsWith('.json'));

if (lhrFiles.length === 0) {
  console.log('No LHR JSON files found — skipping README update.');
  process.exit(0);
}

/** @type {Record<string, { perfScore: number; fcp: string; lcp: string; tbt: string; cls: string; si: string }>} */
const routeData = {};

for (const file of lhrFiles) {
  try {
    const lhr = JSON.parse(fs.readFileSync(path.join(lhciDir, file), 'utf8'));
    const urlPath   = new URL(lhr.requestedUrl).pathname || '/';
    const perfScore = Math.round((lhr.categories?.performance?.score ?? 0) * 100);

    const get = key => lhr.audits?.[key]?.displayValue ?? '-';

    if (!routeData[urlPath] || perfScore > routeData[urlPath].perfScore) {
      routeData[urlPath] = {
        perfScore,
        fcp: get('first-contentful-paint'),
        lcp: get('largest-contentful-paint'),
        tbt: get('total-blocking-time'),
        cls: get('cumulative-layout-shift'),
        si:  get('speed-index'),
      };
    }
  } catch (err) {
    console.warn(`Skipping ${file}: ${err.message}`);
  }
}

const timestamp = new Date().toUTCString(); // e.g. "Mon, 23 Mar 2026 08:00:00 GMT"

const rows = Object.keys(routeData)
  .sort()
  .map(route => {
    const d     = routeData[route];
    const color = d.perfScore >= 90 ? 'success' : d.perfScore >= 50 ? 'important' : 'critical';
    // Label-based badge: left side = "lighthouse" (gray), right side = score (colored)
    // No &logo= param → eliminates the clashing red Lighthouse icon
    const badge = `![Lighthouse ${d.perfScore}](https://img.shields.io/badge/lighthouse-${d.perfScore}-${color}?style=flat-square)`;
    return `| \`${route}\` | ${badge} | ${d.fcp} | ${d.lcp} | ${d.tbt} | ${d.cls} | ${d.si} |`;
  })
  .join('\n');

const block = [
  '<!-- LIGHTHOUSE_RESULTS_START -->',
  `> 🕐 **Last audited:** ${timestamp}`,
  '',
  '| Tested Route | Performance | FCP | LCP | TBT | CLS | Speed Index |',
  '|:---|:---|:---|:---|:---|:---|:---|',
  rows,
  '<!-- LIGHTHOUSE_RESULTS_END -->',
].join('\n');

const readmePath = path.join(process.cwd(), 'apps', 'harrychang-me', 'README.md');
const readme     = fs.readFileSync(readmePath, 'utf8');
const updated    = readme.replace(
  /<!-- LIGHTHOUSE_RESULTS_START -->[\s\S]*?<!-- LIGHTHOUSE_RESULTS_END -->/,
  block,
);
fs.writeFileSync(readmePath, updated, 'utf8');
console.log('README Lighthouse section updated successfully.');
