# i18n scaffolding / Andamiaje i18n de Duna

Our own version of a pattern the Marble ecosystem proved in the
community (second sweep, 2026-10-18): translations live as an **overlay
by id** over the untouched source graph, tied to the exact source by a
**manifest with hashes**, checked by **validators**, and governed by a
**QA contract**. The scaffolding is our code (MIT); no translated text
from any fork lives in this folder except the evaluated candidate base
below, which keeps its own ODbL / CC BY-SA licensing and attribution.

## The rules (they outrank convenience)

1. **Nothing enters the app unreviewed.** Two Spanish bases of the
   taxonomy exist in community forks. Both are drafts without declared
   human review. Either may save the *start* of the Spanish phase,
   never the review: a base becomes importable only when our complete
   bilingual review is recorded in its manifest (`review.status:
   reviewed`, `importable: true`).
2. **The overlay never touches the graph.** It only supplies text by
   id (topic name/description, edge reason). Ids come from
   `data/marble/` and nowhere else.
3. **The kid layer is ours to translate.** Jane's child-facing layer
   (kid-prompts, the glossary) is translated in NO fork: that work is
   house work regardless of which base the taxonomy uses.
4. **SEP layer: provenance first.** The es-MX fork carries a mapping to
   Mexican SEP standards whose provenance document must be read before
   that layer is touched. We have not touched it.

## Candidate bases (state)

- **es-419** (Tropicalrambler/os-taxonomy): complete, published
  2026-10-17, attribution and same-license declaration in every file.
  **Evaluated with our protocol and ADOPTED AS BASE** on 2026-10-18:
  see `bases/es-419/EVALUACION.md` (0 structural errors, full coverage,
  translation statistics, samples). Review pending; not importable.
- **es-MX** (davidmedel/marble-taxonomy-mx): automatic translation
  (DeepSeek) per its own manifest, human review pending, `DRAFT_ONLY`,
  publication blocked by its author. Not adopted as text. Its
  *scaffolding pattern* is what this folder implements, in our own
  writing.

## Tools

- `overlay.mjs`: source/overlay loading, the structural QA validator
  (unknown ids, completeness, blanks, padding; identical-name warnings)
  and the manifest builder (source + file hashes, method, review state;
  `importable` is false until a review is recorded).
  CLI: `node overlay.mjs validate <overlayDir> [--parcial]`,
  `node overlay.mjs manifest <overlayDir> <locale> <method>`.
- `overlay.test.mjs`: `node --test tools/i18n/overlay.test.mjs`
  (identity overlay generated from the English source, plus negative
  controls). No fork content is used as test data.
- `bases/es-419/`: raw files as published (`crudo/`, untouched, with
  `origen.json`), our overlay conversion (`convertir.mjs`), the
  manifest, and the evaluation record.

---

# Andamiaje i18n (español)

Nuestra versión de un patrón que el ecosistema Marble probó en la
comunidad (segunda barrida, 2026-10-18): las traducciones viven como un
**overlay por id** sobre el grafo fuente intocado, atadas a la fuente
exacta por un **manifiesto con hashes**, comprobadas por **validadores**
y gobernadas por un **contrato QA**. El andamiaje es código nuestro
(MIT); en esta carpeta no vive texto traducido de ningún fork salvo la
base candidata evaluada de abajo, que conserva su licencia ODbL /
CC BY-SA y su atribución.

Las reglas: (1) nada entra en la app sin revisar: las dos bases en
español que existen son borradores sin revisión humana declarada y solo
pueden ahorrar el arranque de la fase ES, nunca la revisión; un overlay
es importable solo cuando nuestra revisión bilingüe completa queda
registrada en su manifiesto. (2) El overlay nunca toca el grafo: solo
aporta texto por id. (3) La capa infantil de Jane (kid-prompts,
glosario) no está traducida en ningún fork: es trabajo propio pase lo
que pase. (4) La capa SEP del fork es-MX exige leer su documento de
procedencia antes de tocarla; no la hemos tocado.

Estado de las candidatas: la **es-419** quedó evaluada con nuestro
protocolo y **adoptada como base** el 2026-10-18 (ver
`bases/es-419/EVALUACION.md`), con revisión pendiente y no importable.
La **es-MX** no se adopta como texto (su propio manifiesto la declara
automática, en borrador y con publicación bloqueada); lo adoptado es su
patrón de andamiaje, escrito por nosotros en `overlay.mjs`, con sus
pruebas en `overlay.test.mjs`.
