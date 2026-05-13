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

> 🕐 **Last audited:** Wed, 13 May 2026 09:39:39 GMT  
> 🌐 **Deployment:** https://emilychang.me

| Route       | Locale | Desktop Perf                                                       | Desktop FCP | Desktop LCP | Desktop TBT | Desktop CLS | Desktop SI | Mobile Perf                                                        | Mobile FCP | Mobile LCP | Mobile TBT | Mobile CLS | Mobile SI |
| :---------- | :----- | :----------------------------------------------------------------- | :---------- | :---------- | :---------- | :---------- | :--------- | :----------------------------------------------------------------- | :--------- | :--------- | :--------- | :--------- | :-------- |
| `/`         | EN     | ![58](https://img.shields.io/badge/58-important?style=flat-square) | 0.5 s       | 1.7 s       | 3,460 ms    | 0           | 2.4 s      | ![39](https://img.shields.io/badge/39-critical?style=flat-square)  | 2.0 s      | 9.3 s      | 142,550 ms | 0          | 5.6 s     |
| `/linktree` | EN     | ![93](https://img.shields.io/badge/93-success?style=flat-square)   | 0.5 s       | 1.7 s       | 30 ms       | 0           | 0.5 s      | ![56](https://img.shields.io/badge/56-important?style=flat-square) | 2.6 s      | 9.4 s      | 500 ms     | 0          | 4.9 s     |

<!-- LIGHTHOUSE_PROD_RESULTS_END -->
