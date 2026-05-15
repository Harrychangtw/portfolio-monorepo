# Harry Chang Portfolio Site

<p align="center">
  <img src="public/images/optimized/projects/og/titlecard.webp" alt="Harry Chang Portfolio Site" width="1800" />
</p>

[![Lint & Format](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lint.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lint.yml)
[![Typecheck](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/typecheck.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/typecheck.yml)
[![Lighthouse CI](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse.yml)
[![Lighthouse (Production)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse-prod.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse-prod.yml)
[![Bundle Size](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/bundle-size.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/bundle-size.yml)
[![Dependency Audit](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/audit.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/audit.yml)
[![Links](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/links.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/links.yml)

A modern, highly optimized portfolio website built with Next.js 15 and React 19, featuring a dual-domain architecture, an Obsidian-style knowledge graph, custom cross-domain theme persistence, an interactive 404 experience, and a flawless 100 Real Experience Score (RES) under heavy traffic.

## ⚡ Performance: 100 RES

This site is engineered for uncompromising performance. Verified by Vercel Analytics, the site maintains a **perfect 100 Real Experience Score (RES)** across both desktop and mobile devices, gracefully handling surges of 4,000+ visitors with:

- **First Contentful Paint (FCP):** ~1.55s
- **Largest Contentful Paint (LCP):** ~1.66s
- **Interaction to Next Paint (INP):** 80ms
- **Cumulative Layout Shift (CLS):** 0.01

### Lighthouse CI Results

> **Reading the numbers.** Three different measurements appear on this page and they don't always agree:
>
> - **Real Experience Score (RES) — 100.** Field data from real visitors via Vercel Analytics. The bullets above (FCP ~1.55s, LCP ~1.66s, INP 80ms, CLS 0.01) are p75 across actual sessions on real networks and devices.
> - **Lighthouse Desktop — 90+ across all routes.** Lab data: a single emulated desktop pageload over an unthrottled local connection.
> - **Lighthouse Mobile — typically lower.** Lab data: emulated mid-tier phone with Slow 4G + 4× CPU throttling. This synthetic profile penalizes initial-render-heavy routes (RSC streaming + hydration) more aggressively than real mid-range devices on real networks; CrUX field LCP for the same routes sits in the 90+ percentile. The mobile lab number is reported here for transparency, not as a regression alarm.

<!-- LIGHTHOUSE_RESULTS_START -->

> 🕐 **Last audited:** Lab: Thu, 14 May 2026 15:09:50 GMT · Prod: Fri, 15 May 2026 07:15:47 GMT  
> 🌐 **Deployment:** https://harrychang.me

| Route                                      | Locale | Lab 🖥️ Perf                                                        | Lab 🖥️ FCP | Lab 🖥️ LCP | Lab 🖥️ TBT | Lab 🖥️ CLS | Lab 🖥️ SI | Lab 📱 Perf                                                        | Lab 📱 FCP | Lab 📱 LCP | Lab 📱 TBT | Lab 📱 CLS | Lab 📱 SI | Prod 🖥️ Perf                                                       | Prod 🖥️ FCP | Prod 🖥️ LCP | Prod 🖥️ TBT | Prod 🖥️ CLS | Prod 🖥️ SI | Prod 📱 Perf                                                       | Prod 📱 FCP | Prod 📱 LCP | Prod 📱 TBT | Prod 📱 CLS | Prod 📱 SI |
| :----------------------------------------- | :----- | :----------------------------------------------------------------- | :--------- | :--------- | :--------- | :--------- | :-------- | :----------------------------------------------------------------- | :--------- | :--------- | :--------- | :--------- | :-------- | :----------------------------------------------------------------- | :---------- | :---------- | :---------- | :---------- | :--------- | :----------------------------------------------------------------- | :---------- | :---------- | :---------- | :---------- | :--------- |
| `/`                                        | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 60 ms      | 0          | 0.6 s     | ![52](https://img.shields.io/badge/52-important?style=flat-square) | 1.1 s      | 7.4 s      | 1,210 ms   | 0          | 2.5 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.5 s       | 40 ms       | 0           | 0.9 s      | ![46](https://img.shields.io/badge/46-critical?style=flat-square)  | 2.2 s       | 8.7 s       | 1,230 ms    | 0           | 4.8 s      |
| `/`                                        | 繁中   | ![99](https://img.shields.io/badge/99-success?style=flat-square)   | 0.3 s      | 1.0 s      | 30 ms      | 0          | 0.6 s     | ![69](https://img.shields.io/badge/69-important?style=flat-square) | 0.9 s      | 4.6 s      | 580 ms     | 0          | 1.8 s     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.5 s       | 1.2 s       | 20 ms       | 0           | 0.8 s      | ![66](https://img.shields.io/badge/66-important?style=flat-square) | 1.7 s       | 6.1 s       | 440 ms      | 0           | 2.9 s      |
| `/blog`                                    | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.2 s      | 0 ms       | 0          | 0.7 s     | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 0.9 s      | 6.3 s      | 550 ms     | 0          | 2.0 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.4 s       | 0 ms        | 0           | 1.0 s      | ![58](https://img.shields.io/badge/58-important?style=flat-square) | 2.5 s       | 8.0 s       | 390 ms      | 0           | 5.7 s      |
| `/blog`                                    | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 0.8 s     | ![68](https://img.shields.io/badge/68-important?style=flat-square) | 0.9 s      | 5.8 s      | 440 ms     | 0          | 2.2 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.5 s       | 10 ms       | 0           | 1.0 s      | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 1.7 s       | 7.9 s       | 390 ms      | 0           | 3.1 s      |
| `/blog/2025_12_19_xpro1`                   | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 30 ms      | 0          | 1.0 s     | ![64](https://img.shields.io/badge/64-important?style=flat-square) | 0.9 s      | 6.5 s      | 510 ms     | 0          | 2.3 s     | ![89](https://img.shields.io/badge/89-important?style=flat-square) | 0.7 s       | 1.9 s       | 20 ms       | 0           | 1.7 s      | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 1.7 s       | 8.1 s       | 450 ms      | 0           | 3.1 s      |
| `/blog/2025_12_19_xpro1`                   | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 10 ms      | 0          | 1.1 s     | ![60](https://img.shields.io/badge/60-important?style=flat-square) | 0.9 s      | 6.8 s      | 690 ms     | 0.004      | 2.3 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.2 s      | ![59](https://img.shields.io/badge/59-important?style=flat-square) | 1.7 s       | 8.3 s       | 580 ms      | 0.012       | 3.0 s      |
| `/blog/2025_12_22_aftersun_paris_texas`    | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.3 s      | 20 ms      | 0          | 0.8 s     | ![66](https://img.shields.io/badge/66-important?style=flat-square) | 0.9 s      | 6.5 s      | 440 ms     | 0          | 2.1 s     | ![91](https://img.shields.io/badge/91-success?style=flat-square)   | 0.5 s       | 1.8 s       | 0 ms        | 0           | 1.4 s      | ![62](https://img.shields.io/badge/62-important?style=flat-square) | 1.7 s       | 8.3 s       | 480 ms      | 0           | 3.0 s      |
| `/blog/2025_12_22_aftersun_paris_texas`    | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 10 ms      | 0          | 0.9 s     | ![58](https://img.shields.io/badge/58-important?style=flat-square) | 0.9 s      | 6.9 s      | 770 ms     | 0.004      | 2.2 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.1 s      | ![59](https://img.shields.io/badge/59-important?style=flat-square) | 1.7 s       | 8.1 s       | 570 ms      | 0.012       | 3.5 s      |
| `/blog/2026_01_10_plushies`                | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.3 s      | 20 ms      | 0          | 0.8 s     | ![66](https://img.shields.io/badge/66-important?style=flat-square) | 0.9 s      | 6.7 s      | 430 ms     | 0          | 2.2 s     | ![90](https://img.shields.io/badge/90-success?style=flat-square)   | 0.5 s       | 2.0 s       | 0 ms        | 0           | 1.2 s      | ![62](https://img.shields.io/badge/62-important?style=flat-square) | 1.7 s       | 8.5 s       | 470 ms      | 0           | 3.1 s      |
| `/blog/2026_01_10_plushies`                | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 10 ms      | 0          | 0.9 s     | ![62](https://img.shields.io/badge/62-important?style=flat-square) | 0.9 s      | 7.0 s      | 580 ms     | 0.004      | 2.1 s     | ![93](https://img.shields.io/badge/93-success?style=flat-square)   | 0.5 s       | 1.7 s       | 10 ms       | 0           | 1.0 s      | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 1.7 s       | 8.4 s       | 520 ms      | 0           | 3.1 s      |
| `/blog/2026_02_10_synecdoche_truman`       | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 0.9 s     | ![64](https://img.shields.io/badge/64-important?style=flat-square) | 0.9 s      | 6.6 s      | 520 ms     | 0          | 2.3 s     | ![93](https://img.shields.io/badge/93-success?style=flat-square)   | 0.5 s       | 1.7 s       | 10 ms       | 0           | 1.2 s      | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 1.7 s       | 8.5 s       | 430 ms      | 0           | 3.0 s      |
| `/blog/2026_02_10_synecdoche_truman`       | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 20 ms      | 0          | 0.9 s     | ![62](https://img.shields.io/badge/62-important?style=flat-square) | 0.9 s      | 6.8 s      | 600 ms     | 0.004      | 2.2 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.6 s       | 10 ms       | 0           | 1.1 s      | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 1.7 s       | 8.5 s       | 500 ms      | 0.012       | 2.9 s      |
| `/blog/9_m11d`                             | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 20 ms      | 0          | 1.1 s     | ![62](https://img.shields.io/badge/62-important?style=flat-square) | 0.9 s      | 6.6 s      | 610 ms     | 0          | 2.2 s     | ![92](https://img.shields.io/badge/92-success?style=flat-square)   | 0.5 s       | 1.7 s       | 20 ms       | 0           | 1.3 s      | ![60](https://img.shields.io/badge/60-important?style=flat-square) | 1.7 s       | 8.5 s       | 520 ms      | 0           | 3.6 s      |
| `/blog/9_m11d`                             | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 20 ms      | 0          | 1.0 s     | ![60](https://img.shields.io/badge/60-important?style=flat-square) | 0.9 s      | 6.9 s      | 680 ms     | 0.004      | 2.2 s     | ![92](https://img.shields.io/badge/92-success?style=flat-square)   | 0.5 s       | 1.8 s       | 20 ms       | 0           | 1.3 s      | ![49](https://img.shields.io/badge/49-critical?style=flat-square)  | 3.0 s       | 8.7 s       | 670 ms      | 0           | 5.9 s      |
| `/cv`                                      | EN     | ![100](https://img.shields.io/badge/100-success?style=flat-square) | 0.3 s      | 0.8 s      | 0 ms       | 0          | 0.5 s     | ![80](https://img.shields.io/badge/80-important?style=flat-square) | 0.9 s      | 3.9 s      | 360 ms     | 0          | 1.5 s     | ![98](https://img.shields.io/badge/98-success?style=flat-square)   | 0.5 s       | 1.1 s       | 10 ms       | 0           | 0.7 s      | ![70](https://img.shields.io/badge/70-important?style=flat-square) | 1.7 s       | 5.9 s       | 340 ms      | 0           | 2.5 s      |
| `/cv`                                      | 繁中   | ![99](https://img.shields.io/badge/99-success?style=flat-square)   | 0.3 s      | 0.8 s      | 0 ms       | 0          | 0.5 s     | ![77](https://img.shields.io/badge/77-important?style=flat-square) | 0.9 s      | 3.9 s      | 440 ms     | 0          | 1.6 s     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.6 s       | 1.2 s       | 0 ms        | 0           | 0.8 s      | ![68](https://img.shields.io/badge/68-important?style=flat-square) | 1.7 s       | 5.7 s       | 410 ms      | 0           | 2.4 s      |
| `/design`                                  | EN     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.3 s      | 1.5 s      | 10 ms      | 0          | 0.7 s     | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 0.9 s      | 6.8 s      | 480 ms     | 0          | 1.9 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.6 s       | 0 ms        | 0           | 1.0 s      | ![64](https://img.shields.io/badge/64-important?style=flat-square) | 1.7 s       | 8.5 s       | 400 ms      | 0           | 3.2 s      |
| `/design`                                  | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 0 ms       | 0          | 0.7 s     | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 0.9 s      | 7.7 s      | 570 ms     | 0          | 2.4 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.6 s       | 10 ms       | 0           | 0.9 s      | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 1.7 s       | 9.0 s       | 420 ms      | 0           | 3.2 s      |
| `/gallery`                                 | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 10 ms      | 0          | 0.8 s     | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 0.9 s      | 6.1 s      | 680 ms     | 0          | 2.2 s     | ![92](https://img.shields.io/badge/92-success?style=flat-square)   | 0.5 s       | 1.8 s       | 20 ms       | 0           | 1.1 s      | ![57](https://img.shields.io/badge/57-important?style=flat-square) | 1.8 s       | 8.3 s       | 560 ms      | 0           | 4.4 s      |
| `/gallery`                                 | 繁中   | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.3 s      | 1.5 s      | 0 ms       | 0          | 0.9 s     | ![64](https://img.shields.io/badge/64-important?style=flat-square) | 0.9 s      | 5.7 s      | 570 ms     | 0.003      | 2.3 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.6 s       | 10 ms       | 0           | 1.1 s      | ![60](https://img.shields.io/badge/60-important?style=flat-square) | 1.7 s       | 8.3 s       | 560 ms      | 0.003       | 3.1 s      |
| `/gallery/2023_07_07_splash_of_red`        | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.3 s      | 30 ms      | 0          | 0.9 s     | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 0.9 s      | 6.5 s      | 490 ms     | 0          | 2.2 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.1 s      | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 1.7 s       | 8.1 s       | 440 ms      | 0           | 2.9 s      |
| `/gallery/2023_07_07_splash_of_red`        | 繁中   | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 0.9 s     | ![66](https://img.shields.io/badge/66-important?style=flat-square) | 0.9 s      | 6.4 s      | 470 ms     | 0          | 2.2 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.1 s      | ![59](https://img.shields.io/badge/59-important?style=flat-square) | 2.1 s       | 7.9 s       | 560 ms      | 0           | 3.0 s      |
| `/gallery/2023_10_06_against_giants`       | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.3 s      | 40 ms      | 0          | 0.9 s     | ![67](https://img.shields.io/badge/67-important?style=flat-square) | 0.9 s      | 6.6 s      | 420 ms     | 0          | 2.1 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.4 s       | 0 ms        | 0           | 1.2 s      | ![66](https://img.shields.io/badge/66-important?style=flat-square) | 1.7 s       | 8.1 s       | 350 ms      | 0           | 2.9 s      |
| `/gallery/2023_10_06_against_giants`       | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 1.0 s     | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 0.9 s      | 6.5 s      | 540 ms     | 0          | 2.1 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.4 s       | 10 ms       | 0           | 1.1 s      | ![59](https://img.shields.io/badge/59-important?style=flat-square) | 2.7 s       | 7.9 s       | 480 ms      | 0           | 3.1 s      |
| `/gallery/2023_11_18_dusk_impressions`     | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.2 s      | 20 ms      | 0          | 0.9 s     | ![67](https://img.shields.io/badge/67-important?style=flat-square) | 0.9 s      | 6.4 s      | 420 ms     | 0          | 2.1 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.1 s      | ![64](https://img.shields.io/badge/64-important?style=flat-square) | 1.7 s       | 8.1 s       | 400 ms      | 0           | 3.4 s      |
| `/gallery/2023_11_18_dusk_impressions`     | 繁中   | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.3 s      | 10 ms      | 0          | 0.9 s     | ![66](https://img.shields.io/badge/66-important?style=flat-square) | 0.9 s      | 6.5 s      | 460 ms     | 0          | 2.0 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.4 s       | 10 ms       | 0           | 1.1 s      | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 1.7 s       | 7.9 s       | 390 ms      | 0           | 3.0 s      |
| `/gallery/2024_01_06_hehuanshan`           | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.2 s      | 10 ms      | 0          | 0.8 s     | ![64](https://img.shields.io/badge/64-important?style=flat-square) | 0.9 s      | 6.4 s      | 510 ms     | 0          | 2.2 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.5 s       | 10 ms       | 0           | 1.1 s      | ![67](https://img.shields.io/badge/67-important?style=flat-square) | 1.7 s       | 8.3 s       | 330 ms      | 0           | 3.0 s      |
| `/gallery/2024_01_06_hehuanshan`           | 繁中   | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 0.9 s     | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 0.9 s      | 6.5 s      | 500 ms     | 0          | 2.1 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.6 s       | 1.5 s       | 10 ms       | 0           | 1.1 s      | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 1.7 s       | 8.1 s       | 470 ms      | 0           | 2.7 s      |
| `/gallery/2026_02_08_italy_mountain`       | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.3 s      | 10 ms      | 0          | 0.7 s     | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 0.9 s      | 6.8 s      | 480 ms     | 0          | 2.5 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.6 s       | 0 ms        | 0           | 1.0 s      | ![62](https://img.shields.io/badge/62-important?style=flat-square) | 1.7 s       | 8.6 s       | 450 ms      | 0           | 3.4 s      |
| `/gallery/2026_02_08_italy_mountain`       | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 0.7 s     | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 0.9 s      | 6.8 s      | 530 ms     | 0.002      | 2.5 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.6 s       | 20 ms       | 0           | 1.0 s      | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 1.7 s       | 8.3 s       | 520 ms      | 0           | 3.4 s      |
| `/graph`                                   | EN     | ![99](https://img.shields.io/badge/99-success?style=flat-square)   | 0.3 s      | 0.8 s      | 0 ms       | 0          | 0.8 s     | ![60](https://img.shields.io/badge/60-important?style=flat-square) | 0.9 s      | 3.8 s      | 2,520 ms   | 0          | 2.8 s     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.5 s       | 1.2 s       | 0 ms        | 0           | 1.1 s      | ![44](https://img.shields.io/badge/44-critical?style=flat-square)  | 1.7 s       | 7.7 s       | 2,290 ms    | 0           | 4.5 s      |
| `/graph`                                   | 繁中   | ![99](https://img.shields.io/badge/99-success?style=flat-square)   | 0.3 s      | 0.8 s      | 0 ms       | 0          | 0.8 s     | ![56](https://img.shields.io/badge/56-important?style=flat-square) | 0.9 s      | 3.8 s      | 3,770 ms   | 0          | 4.4 s     | ![98](https://img.shields.io/badge/98-success?style=flat-square)   | 0.5 s       | 1.1 s       | 0 ms        | 0           | 1.0 s      | ![48](https://img.shields.io/badge/48-critical?style=flat-square)  | 1.7 s       | 5.8 s       | 2,720 ms    | 0           | 3.5 s      |
| `/linktree`                                | EN     | ![98](https://img.shields.io/badge/98-success?style=flat-square)   | 0.3 s      | 1.1 s      | 0 ms       | 0          | 0.6 s     | ![67](https://img.shields.io/badge/67-important?style=flat-square) | 0.9 s      | 6.0 s      | 430 ms     | 0          | 2.4 s     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.5 s       | 1.4 s       | 0 ms        | 0           | 0.8 s      | ![64](https://img.shields.io/badge/64-important?style=flat-square) | 1.7 s       | 7.7 s       | 420 ms      | 0           | 3.1 s      |
| `/linktree`                                | 繁中   | ![98](https://img.shields.io/badge/98-success?style=flat-square)   | 0.3 s      | 1.1 s      | 0 ms       | 0          | 0.6 s     | ![66](https://img.shields.io/badge/66-important?style=flat-square) | 0.9 s      | 6.0 s      | 470 ms     | 0          | 2.2 s     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.5 s       | 1.3 s       | 0 ms        | 0           | 0.9 s      | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 1.7 s       | 7.7 s       | 430 ms      | 0           | 3.5 s      |
| `/manifesto`                               | EN     | ![99](https://img.shields.io/badge/99-success?style=flat-square)   | 0.3 s      | 0.8 s      | 0 ms       | 0          | 0.5 s     | ![75](https://img.shields.io/badge/75-important?style=flat-square) | 0.9 s      | 5.0 s      | 320 ms     | 0          | 1.7 s     | ![98](https://img.shields.io/badge/98-success?style=flat-square)   | 0.5 s       | 1.1 s       | 0 ms        | 0           | 0.7 s      | ![68](https://img.shields.io/badge/68-important?style=flat-square) | 1.7 s       | 7.2 s       | 320 ms      | 0           | 2.7 s      |
| `/manifesto`                               | 繁中   | ![100](https://img.shields.io/badge/100-success?style=flat-square) | 0.3 s      | 0.8 s      | 0 ms       | 0          | 0.5 s     | ![72](https://img.shields.io/badge/72-important?style=flat-square) | 0.9 s      | 5.1 s      | 380 ms     | 0          | 1.7 s     | ![98](https://img.shields.io/badge/98-success?style=flat-square)   | 0.5 s       | 1.1 s       | 10 ms       | 0           | 0.7 s      | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 1.7 s       | 7.1 s       | 410 ms      | 0           | 2.6 s      |
| `/paper-reading`                           | EN     | ![99](https://img.shields.io/badge/99-success?style=flat-square)   | 0.5 s      | 1.0 s      | 0 ms       | 0          | 0.6 s     | ![68](https://img.shields.io/badge/68-important?style=flat-square) | 1.7 s      | 5.6 s      | 420 ms     | 0          | 2.0 s     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.6 s       | 1.4 s       | 10 ms       | 0           | 1.0 s      | ![66](https://img.shields.io/badge/66-important?style=flat-square) | 2.0 s       | 7.4 s       | 350 ms      | 0           | 2.9 s      |
| `/paper-reading`                           | 繁中   | ![99](https://img.shields.io/badge/99-success?style=flat-square)   | 0.5 s      | 1.0 s      | 0 ms       | 0          | 0.6 s     | ![69](https://img.shields.io/badge/69-important?style=flat-square) | 1.2 s      | 5.4 s      | 450 ms     | 0          | 1.8 s     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.6 s       | 1.4 s       | 0 ms        | 0           | 0.9 s      | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 1.9 s       | 7.5 s       | 390 ms      | 0           | 2.8 s      |
| `/projects`                                | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 0 ms       | 0          | 0.9 s     | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 0.9 s      | 6.3 s      | 490 ms     | 0          | 2.1 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.2 s      | ![59](https://img.shields.io/badge/59-important?style=flat-square) | 2.5 s       | 8.0 s       | 370 ms      | 0           | 5.9 s      |
| `/projects`                                | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 0.9 s     | ![70](https://img.shields.io/badge/70-important?style=flat-square) | 0.9 s      | 5.7 s      | 390 ms     | 0          | 2.2 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.4 s       | 0 ms        | 0           | 1.4 s      | ![57](https://img.shields.io/badge/57-important?style=flat-square) | 2.8 s       | 8.7 s       | 380 ms      | 0           | 5.8 s      |
| `/projects/2024_08_19_classics_reimagined` | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 1.1 s     | ![62](https://img.shields.io/badge/62-important?style=flat-square) | 0.9 s      | 6.5 s      | 580 ms     | 0          | 2.2 s     | ![92](https://img.shields.io/badge/92-success?style=flat-square)   | 0.5 s       | 1.7 s       | 20 ms       | 0           | 1.3 s      | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 1.8 s       | 8.3 s       | 450 ms      | 0           | 3.2 s      |
| `/projects/2024_08_19_classics_reimagined` | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 20 ms      | 0          | 1.1 s     | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 0.9 s      | 6.8 s      | 610 ms     | 0.013      | 2.2 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.3 s      | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 1.7 s       | 8.3 s       | 520 ms      | 0           | 2.9 s      |
| `/projects/2024_09_23_chingshin_rag`       | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.2 s      | 10 ms      | 0          | 1.0 s     | ![62](https://img.shields.io/badge/62-important?style=flat-square) | 0.9 s      | 6.5 s      | 610 ms     | 0          | 2.3 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.3 s      | ![52](https://img.shields.io/badge/52-important?style=flat-square) | 2.9 s       | 8.2 s       | 520 ms      | 0           | 5.9 s      |
| `/projects/2024_09_23_chingshin_rag`       | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 1.1 s     | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 0.9 s      | 6.7 s      | 620 ms     | 0          | 2.1 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.4 s       | 20 ms       | 0           | 1.3 s      | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 1.7 s       | 8.3 s       | 500 ms      | 0           | 3.2 s      |
| `/projects/2025_03_08_sitcon_keynote`      | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 1.0 s     | ![67](https://img.shields.io/badge/67-important?style=flat-square) | 0.9 s      | 6.5 s      | 410 ms     | 0          | 2.2 s     | ![93](https://img.shields.io/badge/93-success?style=flat-square)   | 0.5 s       | 1.6 s       | 0 ms        | 0           | 1.3 s      | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 1.7 s       | 8.6 s       | 490 ms      | 0           | 3.2 s      |
| `/projects/2025_03_08_sitcon_keynote`      | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 0 ms       | 0          | 1.1 s     | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 0.9 s      | 6.9 s      | 520 ms     | 0          | 2.2 s     | ![93](https://img.shields.io/badge/93-success?style=flat-square)   | 0.5 s       | 1.6 s       | 10 ms       | 0           | 1.3 s      | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 1.7 s       | 8.4 s       | 440 ms      | 0           | 3.1 s      |
| `/projects/2025_04_12_portfolio`           | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 10 ms      | 0          | 1.0 s     | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 0.9 s      | 6.4 s      | 470 ms     | 0          | 2.3 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.2 s      | ![64](https://img.shields.io/badge/64-important?style=flat-square) | 1.7 s       | 8.4 s       | 430 ms      | 0           | 3.1 s      |
| `/projects/2025_04_12_portfolio`           | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 20 ms      | 0          | 1.0 s     | ![60](https://img.shields.io/badge/60-important?style=flat-square) | 0.9 s      | 6.6 s      | 680 ms     | 0          | 2.2 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.5 s       | 10 ms       | 0           | 1.2 s      | ![60](https://img.shields.io/badge/60-important?style=flat-square) | 1.7 s       | 8.2 s       | 570 ms      | 0           | 3.1 s      |
| `/projects/2025_08_04_debate`              | EN     | ![97](https://img.shields.io/badge/97-success?style=flat-square)   | 0.3 s      | 1.2 s      | 20 ms      | 0          | 1.1 s     | ![66](https://img.shields.io/badge/66-important?style=flat-square) | 0.9 s      | 6.3 s      | 450 ms     | 0          | 2.2 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.5 s       | 0 ms        | 0           | 1.2 s      | ![62](https://img.shields.io/badge/62-important?style=flat-square) | 1.7 s       | 8.2 s       | 480 ms      | 0           | 3.0 s      |
| `/projects/2025_08_04_debate`              | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.3 s      | 10 ms      | 0          | 1.1 s     | ![64](https://img.shields.io/badge/64-important?style=flat-square) | 0.9 s      | 6.6 s      | 530 ms     | 0          | 2.2 s     | ![95](https://img.shields.io/badge/95-success?style=flat-square)   | 0.5 s       | 1.4 s       | 20 ms       | 0           | 1.2 s      | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 1.7 s       | 8.1 s       | 500 ms      | 0           | 3.1 s      |
| `/uses`                                    | EN     | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 0 ms       | 0          | 0.9 s     | ![71](https://img.shields.io/badge/71-important?style=flat-square) | 0.9 s      | 5.4 s      | 380 ms     | 0          | 2.4 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.6 s       | 0 ms        | 0           | 1.1 s      | ![60](https://img.shields.io/badge/60-important?style=flat-square) | 2.5 s       | 6.7 s       | 380 ms      | 0           | 5.7 s      |
| `/uses`                                    | 繁中   | ![96](https://img.shields.io/badge/96-success?style=flat-square)   | 0.3 s      | 1.4 s      | 20 ms      | 0          | 0.8 s     | ![72](https://img.shields.io/badge/72-important?style=flat-square) | 0.9 s      | 5.0 s      | 400 ms     | 0          | 2.0 s     | ![94](https://img.shields.io/badge/94-success?style=flat-square)   | 0.5 s       | 1.6 s       | 10 ms       | 0           | 1.1 s      | ![65](https://img.shields.io/badge/65-important?style=flat-square) | 1.7 s       | 7.6 s       | 420 ms      | 0           | 2.8 s      |

<!-- LIGHTHOUSE_RESULTS_END -->

## 🌟 Key Features

### Dual-Domain Architecture

- **Main site** (`harrychang.me`): Portfolio, projects, photo gallery, blog, links, design system, and manifesto.
- **Lab subdomain** (`lab.harrychang.me`): Hub for consulting, strategy, and educational content.
- Single codebase utilizing Next.js middleware routing. Shared components, APIs, and cross-subdomain cookie persistence (`.harrychang.me`) for theme preferences.

### Obsidian-Style Knowledge Graph

An interactive, force-directed knowledge graph that maps the relationships between all site content — projects, blog posts, gallery photos, and papers. Built with D3.js and rendered on HTML5 Canvas for smooth performance with hundreds of nodes.

- **Full-page `/graph` route** with category filtering, cursor-following preview tooltips, and a mobile-optimized node card.
- **Embedded local subgraph** in the "Next Up" card on every content page, surfacing related content via shared tags, categories, and semantic similarity.
- **Offline embedding pipeline** (`scripts/build_graph.py`) generates node descriptions and cosine-similarity edges, cached as static JSON for zero-runtime cost.

<p align="center">
  <img src="public/images/optimized/projects/2025_04_12_portfolio_design/screenshot-2026-04-17-at-12-36-27-knowledge-graph-harry-chang.webp" alt="Knowledge Graph — full site graph view" width="1800" />
</p>

### Advanced Design & Micro-Interactions

- **The "Rangefinder" 404 Page:** An interactive, camera-inspired 404 page. Users scroll their mouse wheel to "focus" a misaligned split-image text projection. Once focused, it locks on and transports the user to a random piece of content (Mobile users are auto-redirected to reduce friction).
- **Dynamic Headers & Navigation:** Custom navigation hooks cycle through nuanced loading messages ("Computing", "Spelunking") while traversing pages. Uses smooth `motion/react` transitions.
- **Guestbook Widget:** An integrated anonymous feedback module featuring animated, rotating text placeholders and live database submission.
- **Live Spotify Status:** Context-aware "Now Playing" footer widget with a custom animated equalizer and dynamic tooltips.
- **Cross-Subdomain Theme Engine:** A custom light/dark mode implementation using root domain cookies to ensure seamless transitions when navigating between the main site and the Lab subdomain without FOUC.

### Automated Asset Pipelines

- **Google Drive Font Fetching:** Custom fonts are intentionally kept out of the repository. A pre-build Node script (`fetch-fonts.mjs`) securely pulls the required typefaces from Google Drive, unzips them, and cleans up the assets for the build.
- **Image Processing:** Automated WebP conversion, progressive 20px blur-up thumbnails, and strict dimension detection to eliminate Layout Shift.

### Custom Internationalization & CMS

- **Client-side i18n:** Context-based language switching (EN / ZH-TW) with visibility gating.
- **File-based Markdown CMS:** Stores data for projects, gallery items, and blog posts, with automated fallback logic for localization.

## 🎨 Design Philosophy

### The "Anti-Hero" Architecture

The site actively avoids standard web tropes like massive hero sections or scroll-jacking. Intent-driven navigation replaces splash screens, giving visitors immediate access to the content (`About`, `Updates`, `Projects`, `Links`).

### Visual Framing & Classical Integration

- **Dynamic Aspect Ratios:** The Gallery applies custom border padding based on mathematical aspect ratios (Portrait, Cinematic, Standard) to create a museum-like visual rhythm.
- **Classical Motif:** Blends brutalist digital grids, pixel art accents, and neon fluid gradients (`--gradient-primary`) with Renaissance/Baroque art themes (Vermeer, Tiepolo, Bruegel) to ground the modern tech stack in timeless aesthetics.

<table align="center">
  <tr>
    <td width="50%">
      <img src="public/images/og-image-blog.webp" alt="Blog: The Astronomer" />
    </td>
    <td width="50%">
      <img src="public/images/og-image-gallery.webp" alt="Gallery: The Art of Painting" />
    </td>
  </tr>
  <tr>
    <td width="50%">
      <img src="public/images/og-image-lab.webp" alt="Lab: The Fall of Icarus" />
    </td>
    <td width="50%">
      <img src="public/images/og-image-projects.webp" alt="Projects: The Forge of Vulcan" />
    </td>
  </tr>
</table>

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL database (or Vercel Postgres) for the Lab waitlist and guestbook
- Google Drive API ID for the font pipeline

### Installation

```bash
# Clone the repository
git clone https://github.com/Harrychangtw/portfolio_site.git
cd portfolio_site

# Install dependencies (runs prisma generate automatically)
pnpm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables (.env.local)

```bash
# Database
DATABASE_POSTGRES_URL=postgres://user:pass@host/db
DATABASE_PRISMA_DATABASE_URL=postgres://user:pass@host/db?pgbouncer=true

# Spotify API (for contextual footer widget)
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REFRESH_TOKEN=your_refresh_token

# Build Assets
FONT_DRIVE_ID=your_google_drive_file_id
```

### Start Development

```bash
# Fetch required fonts before first run
node apps/harrychang-me/scripts/fetch-fonts.mjs

# Run database migrations
npx prisma migrate dev

# Start development server
pnpm dev                 # Main site on http://localhost:3000
```

## 📝 Content Management

1. **Adding Projects/Posts:** Add markdown files with YAML frontmatter to `/content/`. Add `_zh-tw` suffix for localized versions. (Blog posts require a `YYYY_MM_DD_` prefix).
2. **Optimizing Media:** Place raw images in `public/images/` and run `pnpm --filter harry-chang-portfolio optimize-images` to auto-generate WebP variants.
3. **Updating Translations:** Edit the namespaces inside `public/locales/en/` and `public/locales/zh-TW/`.

## 📄 License

This project uses a dual-licensing model. The source code is licensed under **CC BY-NC 4.0**, while the creative content (text, images, markdown files in `/content/`, and assets in `/public/`) is under standard copyright.

**All Rights Reserved for Content.** No part of the original creative material may be reproduced without prior written permission.

## 🙏 Acknowledgments

Built with:

- [Next.js 15](https://nextjs.org/) & [React 19](https://react.dev/)
- [Turborepo](https://turbo.build/)
- [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- [Motion](https://motion.dev/)
- [Prisma](https://www.prisma.io/)
- [v0](https://v0.app/)
