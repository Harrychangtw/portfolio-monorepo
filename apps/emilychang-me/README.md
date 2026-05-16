# emilychang-me

Next.js 15 portfolio app deployed at [emilychang.me](https://emilychang.me).

[![Lint & Format](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lint.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lint.yml)
[![Typecheck](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/typecheck.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/typecheck.yml)
[![Bundle Size](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/bundle-size.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/bundle-size.yml)
[![Lighthouse Audit (emilychang.me)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse-prod-emily.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse-prod-emily.yml)
[![Dependency Audit](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/audit.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/audit.yml)

The `lint`, `typecheck`, and `bundle-size` workflows each fan out into separate `harry` and `emily` jobs — the badges above turn red if either job fails. Production Lighthouse runs against this app via [`lighthouse-prod-emily.yml`](../../.github/workflows/lighthouse-prod-emily.yml), gated on the `portfolio-monorepo-emilychang-me` Vercel deployment so it never collides with the harry production audit.

## Production Lighthouse

Audited automatically against the live deployment after every successful Vercel
Production deploy.

<!-- LIGHTHOUSE_RESULTS_START -->

> 🕐 **Last audited:** Prod: Sat, 16 May 2026 06:25:57 GMT  
> 🌐 **Deployment:** https://emilychang.me

| Route       | Locale | Lab 🖥️ Perf | Lab 🖥️ FCP | Lab 🖥️ LCP | Lab 🖥️ TBT | Lab 🖥️ CLS | Lab 🖥️ SI | Lab 📱 Perf | Lab 📱 FCP | Lab 📱 LCP | Lab 📱 TBT | Lab 📱 CLS | Lab 📱 SI | Prod 🖥️ Perf                                                       | Prod 🖥️ FCP | Prod 🖥️ LCP | Prod 🖥️ TBT | Prod 🖥️ CLS | Prod 🖥️ SI | Prod 📱 Perf                                                       | Prod 📱 FCP | Prod 📱 LCP | Prod 📱 TBT | Prod 📱 CLS | Prod 📱 SI |
| :---------- | :----- | :---------- | :--------- | :--------- | :--------- | :--------- | :-------- | :---------- | :--------- | :--------- | :--------- | :--------- | :-------- | :----------------------------------------------------------------- | :---------- | :---------- | :---------- | :---------- | :--------- | :----------------------------------------------------------------- | :---------- | :---------- | :---------- | :---------- | :--------- |
| `/`         | EN     | -           | -          | -          | -          | -          | -         | -           | -          | -          | -          | -          | -         | ![57](https://img.shields.io/badge/57-important?style=flat-square) | 0.5 s       | 1.7 s       | 3,880 ms    | 0           | 2.6 s      | ![37](https://img.shields.io/badge/37-critical?style=flat-square)  | 1.7 s       | 9.1 s       | 142,430 ms  | 0           | 7.2 s      |
| `/linktree` | EN     | -           | -          | -          | -          | -          | -         | -           | -          | -          | -          | -          | -         | ![93](https://img.shields.io/badge/93-success?style=flat-square)   | 0.5 s       | 1.7 s       | 20 ms       | 0           | 0.5 s      | ![63](https://img.shields.io/badge/63-important?style=flat-square) | 1.7 s       | 9.4 s       | 460 ms      | 0           | 1.9 s      |

<!-- LIGHTHOUSE_RESULTS_END -->
