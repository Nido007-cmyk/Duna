#!/bin/bash
# Supervisor: keeps the Node server and the Cloudflare quick tunnel alive.
cd "$(dirname "$0")"
CF=$(command -v cloudflared || echo ./bin/cloudflared)
( while true; do node server.js >> data/server.log 2>&1; echo "server exited $(date)" >> data/server.log; sleep 2; done ) &
( while true; do $CF tunnel --no-autoupdate --protocol http2 --url http://localhost:8080 2>&1 | tee -a data/tunnel.log | grep --line-buffered -o 'https://[a-z0-9-]*\.trycloudflare\.com' | while read u; do echo "$u" > data/public_url.txt; done; sleep 3; done ) &
wait
