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

<!-- LIGHTHOUSE_PROD_RESULTS_START -->

> 🕐 **Last audited:** Sat, 09 May 2026 06:20:53 GMT  
> 🌐 **Deployment:** https://emilychang.me

#### Desktop (Production Deployment)

| Tested Route | Performance                                                                              | FCP   | LCP   | TBT      | CLS | Speed Index |
| :----------- | :--------------------------------------------------------------------------------------- | :---- | :---- | :------- | :-- | :---------- |
| `/`          | ![Lighthouse 58](https://img.shields.io/badge/lighthouse-58-important?style=flat-square) | 0.5 s | 1.7 s | 7,490 ms | 0   | 2.6 s       |
| `/linktree`  | ![Lighthouse 93](https://img.shields.io/badge/lighthouse-93-success?style=flat-square)   | 0.5 s | 1.8 s | 40 ms    | 0   | 0.5 s       |

#### Mobile (Production Deployment)

| Tested Route | Performance                                                                              | FCP   | LCP   | TBT        | CLS | Speed Index |
| :----------- | :--------------------------------------------------------------------------------------- | :---- | :---- | :--------- | :-- | :---------- |
| `/`          | ![Lighthouse 39](https://img.shields.io/badge/lighthouse-39-critical?style=flat-square)  | 1.8 s | 9.3 s | 142,550 ms | 0   | 6.1 s       |
| `/linktree`  | ![Lighthouse 63](https://img.shields.io/badge/lighthouse-63-important?style=flat-square) | 1.7 s | 9.3 s | 470 ms     | 0   | 2.0 s       |

<!-- LIGHTHOUSE_PROD_RESULTS_END -->
