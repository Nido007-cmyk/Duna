# Installing Jane

## Prerequisites
- **Node.js 22+** (`node -v`). Any install works. The scripts also pick up a portable Node at
  `~/.local/node-v22.20.0-linux-x64` if it exists.
- **A Cloudflare account** (the free plan is fine) with Workers and Workers KV.
- **wrangler** (the Cloudflare CLI). It's a dev dependency, so `npm install` installs the pinned version.

## 1. Clone and install
```bash
git clone https://github.com/kentlangley/Jane.git jane && cd jane
npm install
npm run build        # → public/tax.json, public/glossary.json, src/gen.js
```

## 2. Authenticate wrangler
Interactive: `npx wrangler login`. Headless or CI: create an API token in the Cloudflare dashboard
(*My Profile → API Tokens*, template **Edit Cloudflare Workers**, plus **Workers KV Storage: Edit**) and export it:
```bash
export CLOUDFLARE_API_TOKEN=...      # keep it in your shell or a secret store, never in the repo
```

## 3. Create the KV namespace
```bash
npx wrangler kv namespace create LANDON_KV
# → prints:  id = "<32-hex id>"
```
Your account id is shown by `npx wrangler whoami`.

## 4. Configure
```bash
cp wrangler.toml.example wrangler.toml
```
Edit `wrangler.toml`:
| Setting | Value |
|---|---|
| `name` | Worker name. The app is served at `https://<name>.<your-subdomain>.workers.dev` |
| `account_id` | Your Cloudflare account id. Or delete the line and `export CLOUDFLARE_ACCOUNT_ID=...` |
| `[[kv_namespaces]] id` | The id from step 3. Keep `binding = "LANDON_KV"` (the code uses that name) |

`wrangler.toml` is gitignored, so your ids stay out of git. The scripts refuse to run while `<YOUR_...>` placeholders remain.

Optional tuning (code constants): target age (`TARGET_AGE` in `src/engine.js`),
spaced-review boxes (`BOXES`) and the quest cap (`QUEST_CAP` in `src/worker.js` and `lib-cli.mjs`).
The learner's first name is currently written into the UI strings (`NAME` in `src/engine.js`, plus `public/index.html`,
`public/app.js` and a few prompts). Search for it to change it. A single setting for it is on the to-do list.

## 5. Deploy
```bash
./deploy.sh                                   # build → back up live progress to backups/ → wrangler deploy
./deploy.sh --dry-run --outdir /tmp/jane-dist # build + bundle only; nothing is uploaded and KV isn't touched
```
Then open `https://<name>.<subdomain>.workers.dev/` (kid app) and `/parent` (parent report).

## 6. Local development
```bash
npm run dev          # build + wrangler dev → http://localhost:8787, with a local simulated KV (no live data)
```
To try things against the live deployment without changing the real record, use the sandbox:
`/api/sandbox?on=1` → test → `/api/sandbox?on=0` (see LESSONS.md, "Testing without touching…").

The original prototype server also runs locally: `cd prototype && npm install && node server.js` → http://localhost:8080
(it stores state in `prototype/data/`, which is gitignored).

## Backups and reset
```bash
node backup-progress.mjs     # backups/<PT date>/progress-<time>.json (gitignored)
./reset.sh                   # asks you to type RESET, backs up, then deletes the live progress record
```
To restore a backup: `npx wrangler kv key put --binding LANDON_KV --remote progress --path backups/<date>/progress-<time>.json`.

## Daily lesson packs
See [docs/nightly-packs.md](docs/nightly-packs.md).
