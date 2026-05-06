# harrychang-platform

The Turborepo workspace powering [harrychang.me](https://harrychang.me) and [lab.harrychang.me](https://lab.harrychang.me), plus the shared Next.js infrastructure (UI, hooks, config, image pipeline, Prisma client) that additional portfolio apps can build on.

[![Lint & Format](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lint.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lint.yml)
[![Typecheck](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/typecheck.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/typecheck.yml)
[![Lighthouse CI](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse.yml)
[![Lighthouse Audit (harrychang.me)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse-prod.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse-prod.yml)
[![Lighthouse Audit (emilychang.me)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse-prod-emily.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/lighthouse-prod-emily.yml)
[![Bundle Size](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/bundle-size.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/bundle-size.yml)
[![Dependency Audit](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/audit.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/audit.yml)
[![Links](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/links.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/links.yml)
[![Image Refs](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/image-refs.yml/badge.svg)](https://github.com/Harrychangtw/portfolio-monorepo/actions/workflows/image-refs.yml)

## Apps

| App                                    | Status                     | Description                                                                                                                                                                                                                            |
| :------------------------------------- | :------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`harrychang-me`](apps/harrychang-me/) | Production                 | The primary tenant. Serves both `harrychang.me` and `lab.harrychang.me` from a single Next.js 15 codebase via subdomain middleware. See its [README](apps/harrychang-me/README.md) for features, performance numbers, and quick start. |
| [`emilychang-me`](apps/emilychang-me/) | Deployed (content pending) | A second Next.js app deployed at `emilychang.me`. The shell is live; content is being authored and will land later this summer. Doubles as a check that shared packages stay genuinely portable across tenants.                        |

The `harrychang-me` README is where the full feature writeup lives (Obsidian-style knowledge graph, Rangefinder 404, cross-domain theme engine, automated asset pipelines, Lighthouse CI tables for every route). This file stays focused on the workspace itself.

## Shared packages

| Package           | Purpose                                                                                            |
| :---------------- | :------------------------------------------------------------------------------------------------- |
| `packages/ui`     | Shared React components (header, footer, gallery card, blog card, theme switcher, and more).       |
| `packages/lib`    | Shared hooks (`useStableHashScroll`, `useNowPlaying`), Theme/Language contexts, and Prisma client. |
| `packages/config` | Shared Tailwind and TypeScript configurations.                                                     |

Anything that should be reusable across apps belongs in a package. Anything tenant-specific (content, routes, app-level styling) lives inside that app.

## Workspace commands

Run from the repository root:

```bash
pnpm install      # installs everything; postinstall runs `prisma generate`
pnpm dev          # turbo dev across all apps
pnpm build        # turbo build across all apps and packages
pnpm lint         # turbo lint
pnpm format       # prettier across the whole workspace
pnpm check-types  # turbo type-checking
pnpm check-links  # link audit (delegates to harrychang-me)
```

App-specific scripts run via pnpm filters:

```bash
pnpm --filter harry-chang-portfolio dev           # main site on :3000
pnpm --filter harry-chang-portfolio dev:lab       # lab subdomain on :3001
pnpm --filter harry-chang-portfolio build         # production build
pnpm --filter harry-chang-portfolio optimize-images
```

For database, fonts, content authoring, environment variables, and the rest of the operational detail, see [`apps/harrychang-me/README.md`](apps/harrychang-me/README.md).

## Tech stack

Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Radix UI, Motion (`motion/react`), Prisma, PostgreSQL, pnpm, Turborepo.

## Repository layout

```
apps/
  harrychang-me/   production app, dual-domain (main + lab)
  emilychang-me/   second tenant, deployed, content landing later this summer
packages/
  ui/              shared React components
  lib/             shared hooks, contexts, Prisma client
  config/          shared Tailwind + TS configs
```

## License

This project uses a dual-licensing model.

- **Code:** [CC BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/) (see `LICENSE-CODE`).
- **Content:** All Rights Reserved (see `LICENSE-CONTENT`). The creative material under each app's `content/` and `public/` directories may not be reproduced without prior written permission.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md).
