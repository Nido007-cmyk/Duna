# Jane

A friendly, adaptive learning app for kids, designed around ages 8 to 12
(upper elementary). Placement walks a knowledge graph of 1,590 micro-topics
across 8 subjects, linked by 3,221 prerequisite edges, so each learner is
met where they actually are. There is no live AI in the app by design:
lessons are written and checked ahead of time, and the app only serves
content a person can read and review first.

## Origin

This repository is a fork of [kentlangley/Jane](https://github.com/kentlangley/Jane),
created and designed by Kent Langley and Landon. The application code is
theirs and is licensed under MIT (see [LICENSE](LICENSE)). We forked it on
October 18, 2026 to develop it in a new direction, described below. The
original project's documentation (INSTALL.md, LESSONS.md, docs/) is still
in this tree, and the fork relationship stays visible on GitHub.

This fork is not affiliated with Kent Langley or Landon, and it is not
affiliated with Marble or Generative Spark, Inc. beyond the attribution
their license requires, which we keep intact everywhere it appears.

## Licenses, in short

Every path in this repository has a clear license. The full map is in
[LICENSING.md](LICENSING.md); the summary:

- **Application code: MIT** License, copyright 2026 Kent Langley and Landon
  (see [LICENSE](LICENSE)).
- **The Marble Skill Taxonomy data** (`data/marble/`, and the kid friendly
  layer derived from it): database under **ODbL 1.0**, text under
  **CC BY-SA 4.0**, copyright Generative Spark, Inc. (Marble).
- **Lesson packs, quests and project docs: CC BY-SA 4.0.**

Required attribution, shown by the app and kept here as upstream wrote it:

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).

If we change or extend the taxonomy data, our version of the data stays
under ODbL 1.0 and its text under CC BY-SA 4.0. Our code stays MIT.
Using the taxonomy inside an app does not put the app code under ODbL.

## Our direction

**Our product name is Duna.** We are developing this fork under that
name; "Jane" is the name of the upstream project, and it stays in place
wherever it refers to the original work and its authors. We are taking
Duna where our other project, NIDO, already lives: onto the device,
depending on no one.

- **Native apps, Android first.** The learning engine and the content move
  onto the phone or tablet itself. Progress is stored on the device, not
  in a cloud account.
- **No servers, no accounts, no outside services** in the app the child
  uses. If a network or a provider disappears, the app keeps working.
- **iOS later, with the path ready.** The route for Apple is documented
  before we build it, and the Android work is done so it does not have to
  be redone for iOS. See [docs/DESARROLLO.md](docs/DESARROLLO.md).
- **Bilingual EN/ES** as the project matures, with the CC BY-SA note that
  applies to translated taxonomy text (see the development doc).

## Status

Honest status, October 2026: the fork was just created. What is in the tree
today is upstream v0.2.0, a web app that runs on Cloudflare Workers or as a
standalone Node server (see INSTALL.md). The native, on-device work has not
started yet; this README and docs/DESARROLLO.md record the direction it
will take, and this repository will reflect the real state of the work as
it moves.

Modifications in this fork are maintained by Nido007-cmyk from 2026, under
the same per-piece terms described above (see NOTICE).

---

# Jane (español)

Una app de aprendizaje adaptativo y amable para niños, pensada para edades
de 8 a 12 años. La ubicación del alumno recorre un grafo de conocimiento de
1.590 microtemas en 8 materias, unidos por 3.221 relaciones de
prerrequisito, para encontrar a cada niño donde realmente está. La app no
usa IA en vivo, por diseño: las lecciones se escriben y se revisan antes, y
la app solo muestra contenido que una persona ya pudo leer.

## Origen

Este repositorio es un fork de [kentlangley/Jane](https://github.com/kentlangley/Jane),
creado y diseñado por Kent Langley y Landon. El código de la aplicación es
suyo y está bajo licencia MIT (ver [LICENSE](LICENSE)). Hicimos el fork el
18 de octubre de 2026 para desarrollarla en una dirección nueva, descrita
abajo. La documentación original (INSTALL.md, LESSONS.md, docs/) sigue en
este árbol, y la relación de fork queda visible en GitHub.

Este fork no está afiliado con Kent Langley ni con Landon, ni con Marble o
Generative Spark, Inc., más allá de la atribución que su licencia exige y
que mantenemos intacta en todos los lugares donde aparece.

## Licencias, en resumen

Cada ruta de este repositorio tiene una licencia clara. El mapa completo
está en [LICENSING.md](LICENSING.md); el resumen:

- **Código de la aplicación: MIT**, copyright 2026 Kent Langley and Landon
  (ver [LICENSE](LICENSE)).
- **Los datos de la taxonomía Marble** (`data/marble/` y la capa infantil
  derivada de ella): base de datos bajo **ODbL 1.0** y texto bajo
  **CC BY-SA 4.0**, copyright de Generative Spark, Inc. (Marble).
- **Paquetes de lecciones, misiones y documentos del proyecto:
  CC BY-SA 4.0.**

Atribución obligatoria, tal como la escribió el proyecto original:

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).

Si cambiamos o ampliamos los datos de la taxonomía, nuestra versión de los
datos se queda bajo ODbL 1.0 y su texto bajo CC BY-SA 4.0. Nuestro código
sigue siendo MIT. Usar la taxonomía dentro de una app no pone el código de
la app bajo ODbL.

## Nuestra dirección

**Nuestro nombre de producto es Duna.** Desarrollamos este fork con ese
nombre; «Jane» es el nombre del proyecto original, y se queda en su sitio
donde se refiere a la obra original y a sus autores. Llevamos Duna a
donde ya vive nuestro otro proyecto, NIDO: al dispositivo, sin depender
de nadie.

- **Apps nativas, Android primero.** El motor de aprendizaje y el
  contenido pasan al teléfono o la tableta. El progreso se guarda en el
  dispositivo, no en una cuenta en la nube.
- **Sin servidores, sin cuentas, sin servicios externos** en la app que
  usa el niño. Si una red o un proveedor desaparece, la app sigue
  funcionando.
- **iOS después, con el camino listo.** La ruta de Apple queda documentada
  antes de construirla, y el trabajo de Android se hace de forma que no
  haya que rehacerlo para iOS. Ver [docs/DESARROLLO.md](docs/DESARROLLO.md).
- **Bilingüe EN/ES** conforme el proyecto madura, con la nota de CC BY-SA
  que aplica al texto traducido de la taxonomía (ver el documento de
  desarrollo).

## Estado

Estado honesto, octubre de 2026: el fork se acaba de crear. Lo que hay hoy
en el árbol es la v0.2.0 original, una app web que corre en Cloudflare
Workers o como servidor Node independiente (ver INSTALL.md). El trabajo
nativo y en el dispositivo aún no empieza; este README y
docs/DESARROLLO.md registran la dirección que tomará, y este repositorio
reflejará el estado real del trabajo conforme avance.

Las modificaciones de este fork las mantiene Nido007-cmyk desde 2026, bajo
los mismos términos por pieza descritos arriba (ver NOTICE).
