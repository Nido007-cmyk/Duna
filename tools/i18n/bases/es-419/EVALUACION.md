# Base es-419: evaluación y adopción (2026-10-18)

**Veredicto: ADOPTADA COMO BASE de la fase en español.** No importable:
su manifiesto nace con `importable: false` y ninguna línea de esta base
llega a la app hasta que la revisión bilingüe completa de la casa la
firme (regla del dueño: ahorra el arranque, no la revisión).

## Origen y licencias (verificado en los archivos)
- Repo: Tropicalrambler/os-taxonomy, head `e510d9bd7ae64ae148fa0a418c15e13ba24d5c60`,
  carpeta `data/i18n/es-419/` (publicada el 2026-10-17). Descarga por la
  Git Data API; hashes en `origen.json`.
- Cada archivo abre con la atribución a Marble y declara el texto como
  traducción derivada distribuida bajo las mismas licencias: ODbL 1.0
  (base de datos) y CC BY-SA 4.0 (texto). Es obra derivada de Marble:
  conserva su atribución y su share-alike, como la base en inglés.

## Protocolo corrido (herramientas nuestras, tools/i18n/)
1. Validación estructural completa con nuestro validador de overlays
   (ids contra data/marble, completitud, vacíos, bordes):
   **0 errores, 1 aviso**. El aviso: el nombre de `mt_Wu-ftkzoiE` es
   idéntico a la fuente porque es «Tsunamis», cognado correcto.
2. Completitud exacta: 1.590/1.590 temas, 3.221/3.221 aristas con su
   motivo, 183/183 clusters con las mismas tuplas
   (materia, dominio, edad) que la referencia verificada por hash de la
   puerta Marble.
3. Traducción real, no espejo: descripciones idénticas al inglés 0,
   motivos idénticos 0, nombres idénticos 1 (el cognado). Ratio de
   longitud ES/EN por descripción: mediana 1,14 (p10 1,02, p90 1,28),
   el patrón sano del español.
4. Campo `evidence` (criterios de logro por tema): presente y traducido
   en 1.555/1.590; los 35 idénticos quedan como objetivo expreso de la
   revisión.
5. Muestreo leído por nosotros (temas 0, 500, 1000 y 1589, una arista,
   un cluster, labels): español latinoamericano natural y correcto en
   la muestra. Una muestra no es una revisión: el conjunto sigue sin
   revisión humana, como su propio repo no declara ninguna.

## Forma en que queda guardada
- `crudo/`: los cuatro archivos tal como se publicaron (topics,
  dependencies, clusters, labels), intocados, con `origen.json`.
- `topics.json`, `dependencies.json`, `evidence.json`: nuestro formato
  overlay por id, generados por `convertir.mjs` (reproducible).
- `clusters.json` y las etiquetas de `labels.json` se quedan en el crudo:
  su overlay llega con la fase del informe de padres, que es su uso.
- `manifest.json`: hashes de la fuente en inglés y de los archivos del
  overlay, método y estado de revisión (`draft`, `importable: false`).

## Lo que esta base NO cubre
La capa infantil escrita por Jane (kid-prompts y el glosario) no está
traducida en ningún fork, éste incluido: esa traducción es trabajo
propio de la casa pase lo que pase, y es la mitad visible de la fase ES.
