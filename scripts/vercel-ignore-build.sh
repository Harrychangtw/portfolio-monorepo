#!/usr/bin/env bash
# Vercel "Ignored Build Step" — decide whether a commit needs a new build.
#
#   exit 0  -> skip the build (Vercel re-points the alias at the previous deployment)
#   exit 1  -> run the build
#
# Wired up through "ignoreCommand" in each app's vercel.json. Two guards:
#
#   1. The Lighthouse workflows commit README badge updates every ~3 days.
#      Vercel does not honour "[skip ci]", so each of those was shipping a
#      full deployment — 29 of the last 43 commits on main. Skip them.
#   2. Two apps share this repo. Without a path filter each app rebuilds for
#      commits that cannot affect it (emilychang-me had zero own-app commits
#      in 30 days but still built 53 times).
#
# Usage: bash scripts/vercel-ignore-build.sh apps/harrychang-me

set -u

APP_DIR="${1:?usage: vercel-ignore-build.sh <app-dir>}"

# ignoreCommand runs from the project's Root Directory; the pathspecs below
# are repo-relative, so move to the repo root first.
cd "$(git rev-parse --show-toplevel)" || exit 1

case "${VERCEL_GIT_COMMIT_MESSAGE:-}" in
  *"[skip ci]"*)
    echo "skip: CI housekeeping commit ([skip ci])"
    exit 0
    ;;
esac

# SHA of the last *successful* deployment of this project and branch. Vercel
# only exposes it when an Ignored Build Step is configured, which is how this
# script runs. Using it (rather than HEAD^) keeps the diff correct when several
# commits land at once or after a run of skipped ones.
BASE="${VERCEL_GIT_PREVIOUS_SHA:-}"

# Vercel clones shallowly, so the base commit may not be present locally.
if [ -n "$BASE" ] && ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
  git fetch --quiet --depth=100 origin "$BASE" 2>/dev/null || true
fi

if [ -z "$BASE" ] || ! git cat-file -e "${BASE}^{commit}" 2>/dev/null; then
  echo "build: no usable base commit — not risking a skipped deploy"
  exit 1
fi

# Anything outside these paths cannot change this app's build output.
if git diff --quiet "$BASE" HEAD -- \
  "$APP_DIR" \
  packages \
  package.json \
  pnpm-lock.yaml \
  pnpm-workspace.yaml \
  turbo.json
then
  echo "skip: no changes under $APP_DIR, packages/ or root workspace files"
  exit 0
fi

echo "build: changes affect $APP_DIR"
exit 1
