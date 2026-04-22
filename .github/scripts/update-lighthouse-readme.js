#!/usr/bin/env node
'use strict';

const fs   = require('fs');
const path = require('path');

function readLhrDir(dir) {
  const absDir = path.join(process.cwd(), dir);
  if (!fs.existsSync(absDir)) return {};

  const lhrFiles = fs
    .readdirSync(absDir)
    .filter(f => f.startsWith('lhr-') && f.endsWith('.json'));

  const data = {};
  for (const file of lhrFiles) {
    try {
      const lhr = JSON.parse(fs.readFileSync(path.join(absDir, file), 'utf8'));
      const urlPath   = new URL(lhr.requestedUrl).pathname || '/';
      const perfScore = Math.round((lhr.categories?.performance?.score ?? 0) * 100);
      const get = key => lhr.audits?.[key]?.displayValue ?? '-';

      if (!data[urlPath] || perfScore > data[urlPath].perfScore) {
        data[urlPath] = {
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
  return data;
}

function buildRows(routeData) {
  return Object.keys(routeData)
    .sort()
    .map(route => {
      const d     = routeData[route];
      const color = d.perfScore >= 90 ? 'success' : d.perfScore >= 50 ? 'important' : 'critical';
      const badge = `![Lighthouse ${d.perfScore}](https://img.shields.io/badge/lighthouse-${d.perfScore}-${color}?style=flat-square)`;
      return `| \`${route}\` | ${badge} | ${d.fcp} | ${d.lcp} | ${d.tbt} | ${d.cls} | ${d.si} |`;
    })
    .join('\n');
}

const TABLE_HEADER = [
  '| Tested Route | Performance | FCP | LCP | TBT | CLS | Speed Index |',
  '|:---|:---|:---|:---|:---|:---|:---|',
].join('\n');

const desktopData = readLhrDir('.lighthouseci');
const mobileData  = readLhrDir('.lighthouseci-mobile');

const hasDesktop = Object.keys(desktopData).length > 0;
const hasMobile  = Object.keys(mobileData).length > 0;

if (!hasDesktop && !hasMobile) {
  console.log('No LHR JSON files found — skipping README update.');
  process.exit(0);
}

const sections = [];
if (hasDesktop) {
  sections.push(`#### Desktop\n\n${TABLE_HEADER}\n${buildRows(desktopData)}`);
}
if (hasMobile) {
  sections.push(`#### Mobile\n\n${TABLE_HEADER}\n${buildRows(mobileData)}`);
}

const timestamp = new Date().toUTCString();
const block = [
  '<!-- LIGHTHOUSE_RESULTS_START -->',
  `> 🕐 **Last audited:** ${timestamp}`,
  '',
  sections.join('\n\n'),
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
