#!/usr/bin/env bash
# Wipe the learner's progress (fresh start). Backs it up to backups/ first. Logs (log:YYYY-MM-DD) and lesson packs are kept.
#   ./reset.sh            live Cloudflare KV
#   ./reset.sh --local    the standalone server's files (DATA_DIR, default ./local-data); or set STORAGE=file
set -euo pipefail
if [[ " $* " == *" --local "* || "${STORAGE:-}" =~ ^(file|local)$ ]]; then
  cd "$(dirname "${BASH_SOURCE[0]}")"; export STORAGE=file; where="local progress (${DATA_DIR:-./local-data})"
else source "$(dirname "$0")/lib-sh.sh"; where="live progress"; fi
read -r -p "Delete $where (a backup is saved first)? Type RESET: " ok; [ "$ok" = RESET ] || { echo "Cancelled."; exit 1; }
node backup-progress.mjs
node -e "import('./lib-cli.mjs').then(m=>m.kvDel('progress'))"
echo "Progress reset."
