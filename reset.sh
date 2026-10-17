#!/usr/bin/env bash
# Wipe the learner's progress (fresh start). Backs it up to backups/ first. Logs (log:YYYY-MM-DD) and lesson packs are kept.
set -euo pipefail
source "$(dirname "$0")/lib-sh.sh"
read -r -p "Delete live progress (a backup is saved first)? Type RESET: " ok; [ "$ok" = RESET ] || { echo "Cancelled."; exit 1; }
node backup-progress.mjs
npx --no-install wrangler kv key delete --binding LANDON_KV --remote progress
