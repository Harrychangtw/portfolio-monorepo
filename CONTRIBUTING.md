# Contributing

Thanks for your interest! This monorepo hosts personal portfolios and shared infrastructure.

## 1. For Portfolio Owners (Forks)

If you have forked this repo to build your own site:

*   **Go wild:** Customize it however you like.
*   **Syncing:** You can pull from `main` to get infrastructure updates, but you are not obligated to push changes back.
*   **Contributing back:** If you improve the core infrastructure (e.g., `packages/`, config logic), PRs are welcome!

## 2. Infrastructure & Bug Fixes

If you want to improve the shared codebase:

*   **Refactors & Fixes:** Feel free to open a PR for cleanup, performance boosts, or bug fixes.
*   **Config Changes:** If your change alters how environment variables or global configs work, please **open an issue first**. We want to ensure backward compatibility for existing apps.

## 3. Adding Your App to the Monorepo

Interested in hosting your app inside this repository (`apps/your-name/`)?

We are open to this "collective" approach! However, please open an issue first so we can align on:
*   **Vercel/Deployment setup** (Independent deployments are preferred)
*   **Maintenance** (You own your app's maintenance)
