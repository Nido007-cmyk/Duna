# Marble validation tools / Herramientas de validación de Marble

Development tooling for Duna, **not packaged into the app**.

## What is vendored here, and under what terms

`validate.mjs` and `schema/*.json` are vendored **unchanged** from the
upstream dataset repository
[withmarbleapp/os-taxonomy](https://github.com/withmarbleapp/os-taxonomy)
(Marble Skill Taxonomy v1, 2026-07-08). They travel with the dataset
release: database under **ODbL 1.0**, content under **CC BY-SA 4.0**,
© Generative Spark, Inc. (Marble). They are kept here with attribution
for development use, per the fork's licensing map (see LICENSING.md).

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) ·
> https://withmarble.com · licensed under ODbL 1.0 (database) and
> CC BY-SA 4.0 (content).

## What is ours

`validate-gate.mjs` is our own work (© 2026 Nido007-cmyk, MIT). It runs
the upstream validator as a **build quality gate** over the taxonomy
the app actually packages (`data/marble/topics.json` +
`dependencies.json`, byte-identical to upstream v1):

- The upstream validator expects the full dataset. The two files this
  repo does not vendor (`clusters.json`, `curriculum-standards.json`)
  are fetched once as validation fixtures into `.cache/` (gitignored,
  never shipped in the app) and accepted **only** if their SHA-256
  matches the checksums recorded in the vendored `manifest.json`.
- Without fixtures or network it runs in a clearly-labelled PARTIAL
  mode over just the packaged files. Partial is never reported as full.

Run it with: `node tools/marble/validate-gate.mjs` (exit 1 on failure).
The Android build (`mobile/build-app.mjs`) runs it before bundling.
