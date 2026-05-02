#!/usr/bin/env bash
# Runs both the simulated (localhost) and production (live) Lighthouse audits
# locally and writes the combined results to LIGHTHOUSE_LOCAL.md (gitignored).
# Mirrors .github/workflows/lighthouse.yml + lighthouse-prod.yml minus the
# README commit dance.
#
# Per-URL streaming: each Lighthouse run is invoked individually so the
# performance score (and key metrics) are printed the moment each one
# finishes — no waiting on a giant batch.
#
# Usage (run from anywhere):
#   apps/harrychang-me/scripts/lighthouse-local.sh           # both passes, runs=1
#   LH_RUNS=3 apps/harrychang-me/scripts/lighthouse-local.sh # match CI's 3 runs
#   LH_SKIP_LOCAL=1 …  # only prod
#   LH_SKIP_PROD=1  …  # only simulated
#   LH_SKIP_BUILD=1 …  # reuse existing .next build
#   LH_MOBILE_ONLY=1 … # skip both desktop passes (implies --preset mobile only)
#   LH_PROD_URL=https://harrychang.me …

set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_ROOT="$(cd "$APP_ROOT/../.." && pwd)"
cd "$REPO_ROOT"

LH_RUNS="${LH_RUNS:-1}"
LH_PROD_URL="${LH_PROD_URL:-https://harrychang.me}"

PATHS_FILE="$APP_ROOT/scripts/lighthouse-local-paths.txt"
mapfile -t PATHS < <(grep -v '^[[:space:]]*$' "$PATHS_FILE")

LOCAL_DESKTOP_DIR="$APP_ROOT/.lighthouseci-local-desktop"
LOCAL_MOBILE_DIR="$APP_ROOT/.lighthouseci-local-mobile"
PROD_DESKTOP_DIR="$APP_ROOT/.lighthouseci-prod-desktop"

server_pid=""
cleanup() {
  if [[ -n "$server_pid" ]] && kill -0 "$server_pid" 2>/dev/null; then
    echo "→ stopping next server (pid=$server_pid)"
    kill "$server_pid" 2>/dev/null || true
    wait "$server_pid" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

# Reads a Lighthouse JSON report and prints a one-line summary line:
#   ✓ <url>  perf=92  FCP=0.8s  LCP=1.4s  TBT=20ms  CLS=0.001  SI=1.6s
print_summary() {
  local report_json="$1"
  local label="$2"
  if [[ ! -s "$report_json" ]]; then
    echo "    ✗ $label  (no report written)"
    return
  fi
  node --input-type=module -e "
    import fs from 'node:fs';
    const r = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'));
    const perf = Math.round((r.categories?.performance?.score ?? 0) * 100);
    const g = (k) => r.audits?.[k]?.displayValue ?? '-';
    const color = perf >= 90 ? '\x1b[32m' : perf >= 50 ? '\x1b[33m' : '\x1b[31m';
    const reset = '\x1b[0m';
    console.log(\`    \${color}✓\${reset} \${process.argv[2]}  perf=\${color}\${perf}\${reset}  FCP=\${g('first-contentful-paint')}  LCP=\${g('largest-contentful-paint')}  TBT=\${g('total-blocking-time')}  CLS=\${g('cumulative-layout-shift')}  SI=\${g('speed-index')}\`);
  " "$report_json" "$label"
}

# Run Lighthouse against every path under \$base, looping LH_RUNS times.
# Reports go to \$out_dir as lhr-<epoch>-<idx>.json (matches the report
# script's expected naming).
run_collect() {
  local form_factor="$1"; shift   # desktop | mobile
  local out_dir="$1"; shift
  local base="$1"; shift
  rm -rf "$out_dir"
  mkdir -p "$out_dir"

  local total_paths=${#PATHS[@]}
  local total_runs=$((total_paths * LH_RUNS))
  local idx=0
  echo "  · $form_factor against $base ($total_paths URLs × $LH_RUNS run = $total_runs reports)"

  for run in $(seq 1 "$LH_RUNS"); do
    local path_idx=0
    for p in "${PATHS[@]}"; do
      path_idx=$((path_idx + 1))
      idx=$((idx + 1))
      local url="${base}${p}"
      local stamp; stamp=$(date +%s%N)
      local out_json="$out_dir/lhr-${stamp}-${path_idx}-r${run}.json"

      printf "  [%d/%d] run %d · %s … " "$idx" "$total_runs" "$run" "$url"

      local lh_cmd=(npx --yes lighthouse@12 "$url"
        --quiet
        --only-categories=performance
        --output=json
        "--output-path=$out_json"
        "--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage")
      [[ "$form_factor" == "desktop" ]] && lh_cmd+=(--preset=desktop)

      if "${lh_cmd[@]}" >/tmp/lighthouse-last.log 2>&1; then
        echo "done"
        print_summary "$out_json" "$p"
      else
        echo "FAILED (see /tmp/lighthouse-last.log)"
      fi
    done
  done
}

if [[ -z "${LH_SKIP_LOCAL:-}" ]]; then
  if [[ -z "${LH_SKIP_BUILD:-}" ]]; then
    echo "▶ building harrychang-me (build:ci)…"
    pnpm --filter harry-chang-portfolio build:ci
  else
    echo "▶ LH_SKIP_BUILD=1 — reusing existing build"
  fi

  echo "▶ starting next start on :3000…"
  pnpm --filter harry-chang-portfolio start >/tmp/lighthouse-local-server.log 2>&1 &
  server_pid=$!

  echo "▶ waiting for http://localhost:3000…"
  npx --yes wait-on http://localhost:3000 --timeout 60000

  if [[ -z "${LH_MOBILE_ONLY:-}" ]]; then
    echo "▶ Lighthouse simulated · desktop (runs=$LH_RUNS)"
    run_collect desktop "$LOCAL_DESKTOP_DIR" "http://localhost:3000"
  else
    echo "▶ LH_MOBILE_ONLY=1 — skipping simulated desktop pass"
  fi

  echo "▶ Lighthouse simulated · mobile  (runs=$LH_RUNS)"
  run_collect mobile  "$LOCAL_MOBILE_DIR" "http://localhost:3000"

  cleanup
  server_pid=""
else
  echo "▶ LH_SKIP_LOCAL=1 — skipping simulated pass"
fi

if [[ -z "${LH_SKIP_PROD:-}" && -z "${LH_MOBILE_ONLY:-}" ]]; then
  echo "▶ Lighthouse production · desktop ($LH_PROD_URL, runs=$LH_RUNS)"
  run_collect desktop "$PROD_DESKTOP_DIR" "$LH_PROD_URL"
elif [[ -n "${LH_MOBILE_ONLY:-}" ]]; then
  echo "▶ LH_MOBILE_ONLY=1 — skipping production desktop pass"
else
  echo "▶ LH_SKIP_PROD=1 — skipping production pass"
fi

echo "▶ writing LIGHTHOUSE_LOCAL.md…"
LH_RUNS="$LH_RUNS" node "$APP_ROOT/scripts/lighthouse-local-report.mjs"

echo "✓ done — see apps/harrychang-me/LIGHTHOUSE_LOCAL.md"
