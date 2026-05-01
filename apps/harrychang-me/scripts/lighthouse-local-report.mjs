#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const APP_ROOT = path.resolve(new URL('..', import.meta.url).pathname);

function readLhrDir(dir) {
  const abs = path.join(APP_ROOT, dir);
  if (!fs.existsSync(abs)) return {};
  const data = {};
  for (const file of fs.readdirSync(abs)) {
    if (!file.startsWith('lhr-') || !file.endsWith('.json')) continue;
    try {
      const lhr = JSON.parse(fs.readFileSync(path.join(abs, file), 'utf8'));
      const route = new URL(lhr.requestedUrl).pathname || '/';
      const perf = Math.round((lhr.categories?.performance?.score ?? 0) * 100);
      const get = (k) => lhr.audits?.[k]?.displayValue ?? '-';
      if (!data[route] || perf > data[route].perf) {
        data[route] = {
          perf,
          fcp: get('first-contentful-paint'),
          lcp: get('largest-contentful-paint'),
          tbt: get('total-blocking-time'),
          cls: get('cumulative-layout-shift'),
          si: get('speed-index'),
        };
      }
    } catch (err) {
      console.warn(`skip ${file}: ${err.message}`);
    }
  }
  return data;
}

const HEADER = [
  '| Tested Route | Performance | FCP | LCP | TBT | CLS | Speed Index |',
  '|:---|:---|:---|:---|:---|:---|:---|',
].join('\n');

function rows(routes) {
  return Object.keys(routes)
    .sort()
    .map((r) => {
      const d = routes[r];
      const color = d.perf >= 90 ? 'success' : d.perf >= 50 ? 'important' : 'critical';
      const badge = `![${d.perf}](https://img.shields.io/badge/lighthouse-${d.perf}-${color}?style=flat-square)`;
      return `| \`${r}\` | ${badge} | ${d.fcp} | ${d.lcp} | ${d.tbt} | ${d.cls} | ${d.si} |`;
    })
    .join('\n');
}

function summary(routes) {
  const scores = Object.values(routes).map((d) => d.perf);
  if (!scores.length) return 'no data';
  const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const min = Math.min(...scores);
  const max = Math.max(...scores);
  return `n=${scores.length} · avg ${avg} · min ${min} · max ${max}`;
}

function section(title, dir) {
  const data = readLhrDir(dir);
  if (!Object.keys(data).length) return `### ${title}\n\n_no LHR results in \`${dir}\`_\n`;
  return `### ${title}\n\n_${summary(data)}_\n\n${HEADER}\n${rows(data)}\n`;
}

const out = [
  '# Local Lighthouse Report',
  '',
  `> 🕐 Generated: ${new Date().toUTCString()}`,
  `> 💻 Host: \`${process.env.USER ?? 'local'}@${process.env.HOSTNAME ?? 'm1'}\``,
  `> 🔁 numberOfRuns: ${process.env.LH_RUNS ?? '1'}`,
  '',
  '## Simulated (localhost:3000)',
  '',
  section('Desktop', '.lighthouseci-local-desktop'),
  section('Mobile', '.lighthouseci-local-mobile'),
  '## Production (https://harrychang.me)',
  '',
  section('Desktop', '.lighthouseci-prod-desktop'),
].join('\n');

const outPath = path.join(APP_ROOT, 'LIGHTHOUSE_LOCAL.md');
fs.writeFileSync(outPath, out, 'utf8');
console.log(`wrote ${outPath}`);
