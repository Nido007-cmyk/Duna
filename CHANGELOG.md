# Changelog

All notable changes to Jane are listed here. Versions follow [Semantic Versioning](https://semver.org/).
Dates are Pacific Time.

## [0.2.0] - 2026-10-17

Run the full app anywhere Node 22 runs, or in Docker. No Cloudflare account needed.

### Added
- **Standalone Node server** (`npm start`): runs the same Worker code (`src/worker.js`, `src/engine.js`) with static
  files from `public/` and **file-based storage** (one JSON file per key in `DATA_DIR`, atomic writes, one storage
  request at a time). No runtime dependencies. Configured by env: `LEARNER_NAME`, `LEARNER_AGE`, `LEARNER_GRADE`,
  `PORT` (8787), `HOST` (127.0.0.1), `DATA_DIR` (`./local-data`). `GET /healthz` for monitoring.
- **Local storage for the scripts:** `export-progress.mjs`, `publish-lessons.mjs`, `backup-progress.mjs` and
  `reset.sh` take `--local` (or `STORAGE=file`) to work against `DATA_DIR`; exports and backups go to
  `DATA_DIR/exports/` and `DATA_DIR/backups/`.
- **Docker:** multi-stage `Dockerfile` (build on Node 22, run on Node 22 Alpine with no npm packages), non-root `node`
  user, `/data` volume, health check; `docker-compose.yml` with a named volume, read-only root filesystem, dropped
  capabilities and a localhost-only port by default; `.dockerignore` keeps secrets and the learner's data out of the image.
- **`npm test`:** end-to-end smoke test of the Node server (kid app, `/about`, `/parent`, the first pizza question,
  publishing a quest locally and seeing it as a new quest, a local export).
- **INSTALL.md** now covers three options: Node, Docker and Cloudflare.

### Changed
- README: hosting, architecture, getting started and roadmap updated for the Node server and Docker.
- Cloudflare deployments are unchanged (no app code changed).

### Known limitations
- No passcode on the parent page (the Node server and Docker bind to localhost by default).
- Single learner per deployment.
- Nightly authoring happens outside the app, by a person or an assistant through the scripts.

## [0.1.0] - 2026-10-17

First public release.

### Added
- **Knowledge graph backbone:** the Marble Skill Taxonomy v1 (1,590 micro-topics, 8 subjects, 3,221 prerequisite
  edges), unchanged in `data/marble/`, plus a kid-friendly layer (3-choice questions and a glossary).
- **Adaptive placement with inference:** short placement checks per subject; prerequisites of what you show you know
  are inferred and checked later.
- **Spaced review:** Leitner boxes (1, 3, 7, 21, 60 days); inferred topics come back for a check.
- **Island map** of subjects and topics, with medals (tiers) per topic.
- **Lesson packs and quests:** nightly-authored quests with a boss finale and quest medal, at most 3 active at a time,
  and catch-up boosts when one falls behind.
- **Interactive formats:** multiple choice, pictures, fill-in-the-blank, ordering, matching, true/false speed rounds,
  number lines, fraction bars, numeric and text answers, "why it works" and fun-fact cards; **creative answers** graded
  generously; **glossary popups** for new words; kind hints after a first miss.
- **Parent report** (`/parent`): a calm, read-only report (overall progress, time today and this week, wins and
  struggle spots, what's due, quest status), in Pacific Time.
- **Learner settings:** `LEARNER_NAME`, `LEARNER_AGE`, `LEARNER_GRADE`, with a `{name}` placeholder in kid-facing text.
- **Sandbox mode** for testing against a live deployment without touching the real record.
- **Ops scripts:** `deploy.sh` (backs up progress first), `export-progress.mjs`, `publish-lessons.mjs` (validates
  packs; `--dry-run`), `backup-progress.mjs`, `reset.sh`.
- **UI polish:** a small pinned, vendored bundle (Motion, Floating UI, canvas-confetti, AutoAnimate), View Transitions,
  haptics, optional sound, keyboard and reduced-motion support.
- **Docs:** README (philosophy: no live AI, on purpose), INSTALL, LESSONS.md, docs/NIGHTLY.md, licensing map, NOTICE,
  CITATION.cff, CONTRIBUTING.

### Known limitations
- No passcode on the parent page.
- Single learner per deployment.
- Workers KV free-tier write limits apply.
- Nightly authoring happens outside the app (by a person or an assistant, through the scripts).
- Runs on Cloudflare Workers (or `npm run dev` locally) only; the standalone Node server is planned for v0.2.
  `prototype/` is the early math-only version, not the full app.

[0.2.0]: https://github.com/kentlangley/Jane/releases/tag/v0.2.0
[0.1.0]: https://github.com/kentlangley/Jane/releases/tag/v0.1.0
