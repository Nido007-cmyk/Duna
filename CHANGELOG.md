# Changelog

All notable changes to Jane are listed here. Versions follow [Semantic Versioning](https://semver.org/).
Dates are Pacific Time.

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

[0.1.0]: https://github.com/kentlangley/Jane/releases/tag/v0.1.0
