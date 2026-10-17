# Jane

**Jane** is a friendly, adaptive learning app for kids, designed around ages ~8-12 (upper elementary) and named after its tutor character.
The learner's name, target age and grade are settings.
It runs as a single Cloudflare Worker with static assets and Workers KV, and it is built on the open
[Marble Skill Taxonomy](https://github.com/withmarbleapp/os-taxonomy): 1,590 micro-topics across 8 subjects,
linked by 3,221 prerequisite edges.

> **v0.1.0.** It's a child's learning app, so all personal data is excluded from the repo, and every path has a clear
> license (see [LICENSING.md](LICENSING.md)). What's next: [Roadmap](#roadmap). Changes: [CHANGELOG.md](CHANGELOG.md).

## Philosophy

When I (Kent) thought about creating this with Landon, my thought was: here is an incredible taxonomy of knowledge as a
knowledge graph (powah!), AND pretty much any LLM these days of any power knows all the stuff in the taxonomy cold, so
let's lean on that. **Note that this system is NOT live AI. That is on purpose.**

- **The knowledge graph is the backbone.** The [Marble Skill Taxonomy](https://github.com/withmarbleapp/os-taxonomy)
  (1,590 topics, 3,221 prerequisites) decides *what* to learn, *in what order*, and *what mastery looks like*.
  Placement, inference, spaced review and the island map all come from it.
- **An LLM is an author, offline.** It writes things ahead of time: the kid-friendly questions, the glossary entries,
  and each night's quest. Everything it writes is checked (`build.mjs` and `publish-lessons.mjs` validate it) before it
  is published.
- **The app your kid uses has no live AI.** There's no chatbot, no text generated while the kid plays, and nothing is
  sent to a model during play. Jane's lines, the questions and the hints are all fixed content or simple procedural
  generators.

Why on purpose:
- **Predictable and safe for a kid.** Jane can only say what's already been written and checked. There are no surprises
  and no off-topic chats.
- **Reviewable.** Every question and quest is a plain file you can read before (or after) it's shown.
- **Private.** The kid's answers stay in your own storage, and no model sees them while they play.
- **Cheap.** No per-question API calls. It runs on a free-tier Worker.
- **Light to run.** It needs no AI service and no API key, just a free-tier Cloudflare Worker today (a standalone
  Node server is planned for v0.2). It keeps working if the nightly author skips a night.
- **Transparent for parents.** You can see exactly what gets shown, in the packs and on the parent report.

## Why "Jane"?

The tutor is named after Jane, the AI who first appears in *Speaker for the Dead*, the second book of Orson Scott Card's
*Ender's Game* series. In the books, Jane is a companion and teacher to Ender, and that inspired the name of this
friendly tutor. The name is just a nod to the books: this project has no affiliation with Orson Scott Card or his publishers.

## Features

- **Adaptive placement over the 1,590-topic graph.** Diagnostic questions walk the prerequisite graph to find where
  the learner is, aiming at a configurable target age (`LEARNER_AGE`).
- **Inference.** Getting a harder topic right credits its prerequisites ("inferred" mastery); misses step down to
  easier prerequisites.
- **Spaced repetition.** Leitner boxes with gaps of 1 → 3 → 7 → 21 → 60 days; reviews come back automatically.
- **Island map ("My World").** Each subject is an island and each topic is a stone, colored mastered / review due /
  learning / ready / locked. Tap a stone for *Explore now!* or *Practice now* mini-sessions.
- **Quests.** Each daily lesson pack is a quest with a story hook, stages, a boss finale and a quest medal, plus an
  animated "New quest!" reveal and a Quests tab. **At most 3 quests are active at once**; at the cap, the nightly job
  publishes a *catch-up boost* for the oldest one instead of a new quest.
- **Nightly lesson packs.** `export-progress.mjs` exports weak spots, strengths, frontier topics and due reviews.
  You (or an AI assistant) write tomorrow's pack following [LESSONS.md](LESSONS.md), then
  `publish-lessons.mjs` validates and publishes it.
- **Interactive formats:** multiple choice, fill-in-the-blank, order, match, picture choice, number line,
  fraction bars, true/false speed rounds, "why" and fun-fact cards, scenes and templates.
- **Glossary popups.** Key words get a playful dotted underline; tap or hover shows a kid-friendly definition. Tapping a
  term never counts as an answer. Lookups are logged so the next quests can reuse those words.
- **Creative answers.** Open questions ("as brave as a ___") accept any sensible answer and celebrate it. Fuzzy
  matching handles plurals, articles and small typos. After 2 misses, the app shows a kind "learning moment"
  instead of counting it as wrong.
- **Medals & trophies.** Bronze, silver or gold topic medals (by depth in the graph), streaks, stars and quest medals.
- **Parent report (`/parent`).** A calm, read-only report: overall %, time today and this week, wins and struggle spots,
  words looked up, charts, per-subject progress, quest history, upcoming reviews, a searchable answer log and medals.
  It works on phones and prints cleanly. All times are Pacific Time.
- **Sandbox.** `/api/sandbox?on=1` switches your browser to a copy of the progress for testing, so the real record is
  never touched.

## How this was built

Jane was designed by **Kent Langley and Landon**, and developed with **Grok Bot**, an AI assistant. Grok Bot wrote and
iterated on the code, the content and these docs from their feedback: what was fun, what was confusing, what was too
hard. Each night Grok Bot also acts as the **lesson author**. It reads the day's export and writes the next quest
following [LESSONS.md](LESSONS.md). That role is just the scripts' interface, so anyone can fill it, by hand or with
any assistant (see [How the nightly cycle works](docs/NIGHTLY.md)).

## Nightly lessons

A nightly cycle turns the day's answers into tomorrow's quest: **export → check the quest cap → write a quest or a
catch-up boost → validate → publish**. It runs on whatever scheduler you choose (cron, launchd, a CI schedule, or by
hand). The two scripts are the whole interface, and no outside service is needed. A Cloudflare Cron Trigger is the natural
built-in option, and a **built-in nightly generator** (a `scheduled()` handler) is a planned feature. Details and a
diagram: **[docs/NIGHTLY.md](docs/NIGHTLY.md)**.

## UI polish

The kid app and parent report are plain HTML/CSS/JS (no framework). A small vendored bundle
(`public/vendor/ui.js`, about 19 KB gzipped, built from `vendor/entry.mjs`) adds Motion springs, Floating UI popovers,
canvas-confetti and AutoAnimate. `public/fx.js` wires them in: tactile press/hover states, spring entrances, View Transitions
between tabs and map zooms, haptics (where supported), optional synthesized sound effects (off by default; 🔇/🔈/🔊 toggle in
the header), skeleton loading states, keyboard support (tab arrows, Esc, focus rings, focusable islands) and
`prefers-reduced-motion` support. Everything still works if the bundle doesn't load.

## Architecture

```
Browser (public/: index.html, app.js, app.css; parent.js/css; tax.json, glossary.json)
   │  static assets are served first by Cloudflare
   ▼
Cloudflare Worker (src/worker.js)  ── /api/* JSON API, /parent HTML report (read-only)
   ├─ src/engine.js   topic states, placement & inference, Leitner reviews, packs/quests, grading, learning moments
   ├─ src/gen.js      procedural math generators (GENERATED by build.mjs from prototype/server.js)
   └─ src/parent.js   parent report data + HTML shell
   ▼
Workers KV (binding JANE_KV)
   progress              the learner's single progress record
   log:YYYY-MM-DD        that day's answer log (Pacific Time days)
   lessons:YYYY-MM-DD    published lesson pack / quest
   boost:YYYY-MM-DD      catch-up boost for a quest
   sandbox:*             sandbox copies (testing only)
```

- **`build.mjs`** turns `data/marble/` + `data/kid-prompts/` + `data/glossary.txt` into `public/tax.json` and
  `public/glossary.json`, and extracts the math generators into `src/gen.js`. It also validates the inputs.
- **CLI scripts** (`export-progress.mjs`, `publish-lessons.mjs`, `backup-progress.mjs`) talk to KV through
  `wrangler` (`lib-cli.mjs`).
- **`prototype/`** is the early, **math-only** version of Jane: a zero-dependency Node server (`server.js`). It is
  *not* the full app (no taxonomy, quests, map or parent report). It's kept because `build.mjs` takes the math
  generators from it. A standalone Node server for the full app is planned for v0.2 (see [Roadmap](#roadmap)).

## Learner settings

Set in the `[vars]` block of your (gitignored) `wrangler.toml`, see `wrangler.toml.example`:

| Var | Default | Used for |
|---|---|---|
| `LEARNER_NAME` | `Explorer` | Greetings, "X's Learning World", trophy case, parent report. Kid-facing text and lesson packs write `{name}` and the Worker fills it in |
| `LEARNER_AGE` | `10` | Target age for placement, topic choice and the nightly export |
| `LEARNER_GRADE` | `upper elementary` | Parent report and lesson-pack warnings |

## Repository layout

| Path | Contents |
|---|---|
| `src/`, `public/` | Worker and browser app |
| `data/marble/` | Marble Skill Taxonomy v1, unchanged, with its LICENSE, LICENSE-CONTENT, PROVENANCE.md, CITATION.cff |
| `data/kid-prompts/`, `data/glossary.txt` | Kid-friendly layer derived from the taxonomy |
| `packs/examples/` | A generic example quest. Real nightly packs (`packs/*.json`) are gitignored |
| `LESSONS.md`, `docs/` | Lesson-pack rules and the nightly workflow |
| `prototype/` | Early math-only Node prototype (source of the math generators); not the full app |
| `build.mjs`, `deploy.sh`, `reset.sh`, `*-progress.mjs`, `publish-lessons.mjs` | Build and ops scripts |

## Getting started

See **[INSTALL.md](INSTALL.md)** (Node 22, wrangler, Cloudflare account, KV namespace, configuration, deploy,
reset, local dev). For the daily content loop, see **[How the nightly cycle works](docs/NIGHTLY.md)**.

```bash
npm install
cp wrangler.toml.example wrangler.toml   # fill in your account id and KV namespace id
npm run dev                              # local Worker (wrangler dev) with simulated local KV
./deploy.sh                              # backs up live progress, builds, deploys
```

## Adapt it to your setup

The repo is written so you can hand it to your own AI coding assistant or bot (a general-purpose assistant or a coding
agent, such as Grok, Claude Code or similar) and have it adapted to your setup. Everything it needs is in the docs.

- **Hosting.** Today Jane runs on **Cloudflare Workers + KV**: deploy with `./deploy.sh`, or run it locally with
  `npm run dev` (wrangler dev with a simulated local KV). There is **no standalone Node server for the full app yet**;
  [`prototype/`](prototype/) is only the early math-only version. A standalone Node server with file-based storage
  (`npm start`) and a Docker option are planned for v0.2 (see [Roadmap](#roadmap)). Until then, moving to another
  host (a Node server, another edge or serverless platform, a VPS) means adapting `src/worker.js`. To swap the storage layer, implement `get`, `put` and `list` (by key prefix) for the progress record, the daily answer
  logs (`log:YYYY-MM-DD`) and the lesson packs (`lessons:` / `boost:` keys). The CLI scripts reach the same keys
  through `lib-cli.mjs`.
- **Nightly authoring.** Run it on any scheduler, with a person or any assistant as the author
  (see [docs/NIGHTLY.md](docs/NIGHTLY.md)). An assistant that has its own computer, like Grok Bot, can run the whole
  nightly cycle there: export, write, validate, publish.

Suggested prompt to paste into your assistant:

> Read README.md, INSTALL.md, LESSONS.md and docs/NIGHTLY.md in this repo. Deploy Jane to `<my host: Cloudflare Workers,
> or adapt src/worker.js for a Node server / my VPS>`, creating the storage it needs. Set `LEARNER_NAME` to `<name>`, `LEARNER_AGE` to `<age>` and
> `LEARNER_GRADE` to `<grade>`, keeping secrets and ids out of git. Back up progress before every deploy. Then schedule
> the nightly cycle for about 1:00 AM `<my time zone>`: run export-progress.mjs, write tomorrow's quest (or a catch-up
> boost) following LESSONS.md, validate with publish-lessons.mjs --dry-run, then publish. Only message me if something
> fails or needs my attention.

## Roadmap

See [CHANGELOG.md](CHANGELOG.md) for what's shipped.

**v0.2**
- **Standalone Node server** for the full app with file-based storage (`npm start`), plus a **Docker** option.

**Later**
- **Built-in nightly generator** that authors packs offline only, validates every pack before publishing, and never uses live AI during play ([details](docs/NIGHTLY.md#planned-a-built-in-nightly-generator)).
- **GitHub Action** running gitleaks on every push.
- **Multi-learner support** (more than one kid per deployment).
- **Passcode for the parent page.**

## Privacy

There is **no** child data in this repository. Progress, answer logs, exports, backups, real lesson packs, sandbox data,
screenshots, `wrangler.toml` and tokens are all gitignored. See [CONTRIBUTING.md](CONTRIBUTING.md).

## License & attribution

- Code: **MIT**, © 2026 Kent Langley and Landon ([LICENSE](LICENSE)).
- Marble taxonomy (`data/marble/`): **ODbL 1.0** (database) + **CC BY-SA 4.0** (content); upstream notices in
  [PROVENANCE.md](data/marble/PROVENANCE.md).
- Derived data (kid prompts, glossary, bundled taxonomy): **ODbL 1.0** / **CC BY-SA 4.0**, adapted by Kent Langley and Landon.
- Lesson packs, quests, LESSONS.md and docs: **CC BY-SA 4.0**, © 2026 Kent Langley and Landon.

Full map: [LICENSING.md](LICENSING.md) · [NOTICE](NOTICE) · [CITATION.cff](CITATION.cff)

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).
