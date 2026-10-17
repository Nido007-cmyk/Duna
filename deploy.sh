#!/usr/bin/env bash
# Build (generators, taxonomy bundle, glossary) and deploy the Worker.
#   ./deploy.sh                      back up live progress to backups/, then deploy (needs CLOUDFLARE_API_TOKEN)
#   ./deploy.sh --dry-run --outdir /tmp/jane-dist   build and bundle only, nothing uploaded or read
set -euo pipefail
source "$(dirname "$0")/lib-sh.sh"
node build.mjs
if [[ " $* " != *" --dry-run "* ]]; then node backup-progress.mjs; fi
npx --no-install wrangler deploy "$@"
