# Nightly lesson-pack workflow

Each evening, tomorrow's quest is written from today's results. The full rules (quest structure, 3-quest cap and
catch-up boosts, deep dives, voice, formats, schema, glossary terms) are in **[LESSONS.md](../LESSONS.md)**.

```bash
# 1. Export progress (read-only) → exports/progress-<PT date>.json (gitignored: it contains the child's data)
node export-progress.mjs                   # options: --date YYYY-MM-DD  --days 7  --out file.json

# 2. Check quests.nextStep in the export:
#    - "new quest"  → write packs/<tomorrow>.json (gitignored)
#    - at the cap (3 active) → write a catch-up boost: {"boostFor":"<oldest active quest date>", ...}

# 3. Validate until there are no errors, and fix the warnings
node publish-lessons.mjs packs/2026-10-18.json --dry-run

# 4. Publish (writes lessons:<date> or boost:<quest date> to KV)
node publish-lessons.mjs packs/2026-10-18.json
```

- Start from [`packs/examples/example-quest.json`](../packs/examples/example-quest.json). It validates with
  `node publish-lessons.mjs packs/examples/example-quest.json --dry-run`.
- Real packs are written from a real child's answers, so they stay **out of git** (`packs/*.json` is ignored).
  Don't copy notes about the child's performance into `packs/examples/`.
- Preview the quest in the sandbox before the child sees it: `/api/sandbox?on=1`, then
  `POST /api/sandbox/reset {"offsetDays":1}` to see tomorrow.
- Both scripts need `CLOUDFLARE_API_TOKEN` and a configured `wrangler.toml` (see [INSTALL.md](../INSTALL.md)).
