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

> 🕐 **Last audited:** Prod: Sun, 17 May 2026 06:49:15 GMT  
> 🌐 **Deployment:** https://emilychang.me

| Route       | Locale | Lab 🖥️ Perf | Lab 🖥️ FCP | Lab 🖥️ LCP | Lab 🖥️ TBT | Lab 🖥️ CLS | Lab 🖥️ SI | Lab 📱 Perf | Lab 📱 FCP | Lab 📱 LCP | Lab 📱 TBT | Lab 📱 CLS | Lab 📱 SI | Prod 🖥️ Perf                                                       | Prod 🖥️ FCP | Prod 🖥️ LCP | Prod 🖥️ TBT | Prod 🖥️ CLS | Prod 🖥️ SI | Prod 📱 Perf                                                       | Prod 📱 FCP | Prod 📱 LCP | Prod 📱 TBT | Prod 📱 CLS | Prod 📱 SI |
| :---------- | :----- | :---------- | :--------- | :--------- | :--------- | :--------- | :-------- | :---------- | :--------- | :--------- | :--------- | :--------- | :-------- | :----------------------------------------------------------------- | :---------- | :---------- | :---------- | :---------- | :--------- | :----------------------------------------------------------------- | :---------- | :---------- | :---------- | :---------- | :--------- |
| `/`         | EN     | -           | -          | -          | -          | -          | -         | -           | -          | -          | -          | -          | -         | ![57](https://img.shields.io/badge/57-important?style=flat-square) | 0.5 s       | 1.7 s       | 3,860 ms    | 0           | 2.6 s      | ![34](https://img.shields.io/badge/34-critical?style=flat-square)  | 2.0 s       | 10.5 s      | 141,700 ms  | 0           | 11.5 s     |
| `/linktree` | EN     | -           | -          | -          | -          | -          | -         | -           | -          | -          | -          | -          | -         | ![93](https://img.shields.io/badge/93-success?style=flat-square)   | 0.5 s       | 1.7 s       | 50 ms       | 0           | 0.5 s      | ![61](https://img.shields.io/badge/61-important?style=flat-square) | 1.7 s       | 9.2 s       | 530 ms      | 0           | 2.0 s      |

<!-- LIGHTHOUSE_RESULTS_END -->
