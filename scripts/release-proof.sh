#!/usr/bin/env bash

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
LOG_DIR="$ROOT/.phase-loop/logs"
CONVEX_LOG="$LOG_DIR/release-proof-convex.log"
CONVEX_PID=""

cd "$ROOT"
mkdir -p "$LOG_DIR"

is_convex_running() {
  lsof -nP -iTCP:3210 -sTCP:LISTEN >/dev/null 2>&1
}

cleanup() {
  if [[ -n "$CONVEX_PID" ]]; then
    kill "$CONVEX_PID" >/dev/null 2>&1 || true
    wait "$CONVEX_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

warn_if_dirty() {
  local dirty
  dirty="$(git status --short --untracked-files=no | rg -v '^ ?M SESSION\.md$' || true)"
  if [[ -n "$dirty" ]]; then
    echo "Warning: release proof is running on a dirty working tree." >&2
    echo "$dirty" >&2
  fi
}

echo "==> Syncing local Convex auth variables"
bun run setup:convex-auth-local --sync

if ! is_convex_running; then
  echo "==> Bootstrapping local Convex backend"
  : >"$CONVEX_LOG"
  bunx convex dev --typecheck disable --tail-logs disable >"$CONVEX_LOG" 2>&1 &
  CONVEX_PID=$!

  for _ in {1..60}; do
    if is_convex_running; then
      break
    fi
    sleep 1
  done

  if ! is_convex_running; then
    echo "Convex backend did not start. Recent log output:" >&2
    tail -n 40 "$CONVEX_LOG" >&2 || true
    exit 1
  fi
fi

echo "==> Generating Convex bindings"
bunx convex codegen

echo "==> Running full gate"
./scripts/phase-check.sh full

echo "==> Running regression gate"
./scripts/phase-check.sh regression

warn_if_dirty

echo "Release proof complete for $(git rev-parse --short HEAD)"
echo "Suggested next step: git tag -a v0.1.0 -m \"Lunch-Table release v0.1.0\""
