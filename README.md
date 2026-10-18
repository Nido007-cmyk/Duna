# Duna (fork of Jane)

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
- **Code and art created by this fork** (`mobile/`, `tools/`, the Duna
  skin, icons and tutor art): **MIT**, copyright 2026 Nido007-cmyk.
- **The bundled Fredoka font** (`public/fonts/`): SIL Open Font License
  1.1 (see `public/fonts/OFL.txt`).
- **The adopted es-419 base** (`tools/i18n/bases/es-419/`): a derivative
  Spanish translation of the taxonomy, ODbL 1.0 / CC BY-SA 4.0 like its
  source, kept under review and not shipped in the app (see
  `tools/i18n/README.md`).

Required attribution, shown by the app and kept here as upstream wrote it:

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).

If we change or extend the taxonomy data, our version of the data stays
under ODbL 1.0 and its text under CC BY-SA 4.0. Our code stays MIT.
Using the taxonomy inside an app does not put the app code under ODbL.

## Our direction

**Our product name is Duna.** We are developing this fork under that
name; "Jane" is the name of the upstream project, and it stays in place
wherever it refers to the original work and its authors. The direction,
in one line: the app lives on the device, **local first, internet
optional**.

- **Native apps, Android first.** The learning engine and the content run
  on the phone or tablet itself. Progress is stored on the device, not
  in a cloud account.
- **Local first, internet optional.** The app starts and its complete
  learning experience works with no connection, always. Only features
  that genuinely need the network may use it (downloading new content is
  the natural example); they are optional, they never block the app, and
  downloads stay on the device. No accounts and no collection of
  children's personal data over the network.
- **iOS later, with the path ready.** The route for Apple is documented
  before we build it, and the Android work is done so it does not have to
  be redone for iOS. See [docs/DESARROLLO.md](docs/DESARROLLO.md).
- **Bilingual EN/ES** as the project matures, with the CC BY-SA note that
  applies to translated taxonomy text (see the development doc).

## Status

Real state of this branch (`android`), October 18, 2026. `main` still
holds the upstream web app exactly as forked; the native work lives here.

Built and verified:

- **Android conversion (Phase 1)** in `mobile/`: a Capacitor shell that
  runs the original engine inside the app, with local storage keeping
  the original KV interface, partitioned per learner profile from the
  start. The packaged bundle requests no network resource at all.
- **A Marble quality gate in the build**: the official os-taxonomy
  validator must pass over the packaged taxonomy or the build fails
  (`tools/marble/`).
- **The adopted interface system**: scaling from the short side with a
  tablet cap, reading floors, our palette and bundled font, a living
  tutor (our own layered SVG with a WAAPI state machine), our icon set,
  a listen button using the system TTS, and the motion token system.
  Tests: upstream suite 4/4, mobile runtime suite 4/4.
- **Spanish groundwork**: our i18n scaffolding (`tools/i18n/`: overlay
  by id, hashed manifest, QA contract) and the community es-419 base,
  evaluated with our protocol and **adopted as the base** of the Spanish
  phase. It is under review and **not importable**: no line of it ships
  until our complete bilingual review signs it.

Not built yet, stated plainly:

- **The debug APK.** Gradle cannot build in our build sandbox (its
  client-daemon protocol uses localhost sockets that the sandbox
  intercepts; root cause documented in docs/DESARROLLO.md). The project
  is synced and ready; the documented command builds it on a normal
  machine.
- **Physical testing on a real tablet** (including airplane mode) is the
  owner's gate and has not happened yet.
- Release signing, a formal trademark review and any store decision are
  pending their own steps.

Modifications in this fork are maintained by Nido007-cmyk from 2026, under
the same per-piece terms described above (see NOTICE).

---

# Duna (fork de Jane, en español)

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
- **Código y arte creados por este fork** (`mobile/`, `tools/`, la piel
  de Duna, iconos y arte de la tutora): **MIT**, copyright 2026
  Nido007-cmyk.
- **La fuente Fredoka empaquetada** (`public/fonts/`): SIL Open Font
  License 1.1 (ver `public/fonts/OFL.txt`).
- **La base es-419 adoptada** (`tools/i18n/bases/es-419/`): traducción
  derivada de la taxonomía, ODbL 1.0 / CC BY-SA 4.0 como su fuente,
  guardada en revisión y fuera de la app (ver `tools/i18n/README.md`).

Atribución obligatoria, tal como la escribió el proyecto original:

> Marble Skill Taxonomy (v1) · © Generative Spark, Inc. (Marble) · https://withmarble.com · licensed under ODbL 1.0 (database) and CC BY-SA 4.0 (content).

Si cambiamos o ampliamos los datos de la taxonomía, nuestra versión de los
datos se queda bajo ODbL 1.0 y su texto bajo CC BY-SA 4.0. Nuestro código
sigue siendo MIT. Usar la taxonomía dentro de una app no pone el código de
la app bajo ODbL.

## Nuestra dirección

**Nuestro nombre de producto es Duna.** Desarrollamos este fork con ese
nombre; «Jane» es el nombre del proyecto original, y se queda en su sitio
donde se refiere a la obra original y a sus autores. La dirección, en una
línea: la app vive en el dispositivo, **local primero, internet
opcional**.

- **Apps nativas, Android primero.** El motor de aprendizaje y el
  contenido corren en el teléfono o la tableta. El progreso se guarda en
  el dispositivo, no en una cuenta en la nube.
- **Local primero, internet opcional.** La app arranca y su experiencia
  completa de aprendizaje funciona sin conexión, siempre. Solo las
  funciones que de verdad lo necesiten pueden usar internet (descargar
  contenido nuevo es el ejemplo natural); son opcionales, jamás bloquean
  la app, y lo descargado queda en el dispositivo. Nada de cuentas ni
  recogida de datos personales de niños por la red.
- **iOS después, con el camino listo.** La ruta de Apple queda documentada
  antes de construirla, y el trabajo de Android se hace de forma que no
  haya que rehacerlo para iOS. Ver [docs/DESARROLLO.md](docs/DESARROLLO.md).
- **Bilingüe EN/ES** conforme el proyecto madura, con la nota de CC BY-SA
  que aplica al texto traducido de la taxonomía (ver el documento de
  desarrollo).

## Estado

Estado real de esta rama (`android`), 18 de octubre de 2026. `main`
conserva la app web original tal como se forkeó; el trabajo nativo vive
aquí.

Construido y verificado:

- **Conversión a Android (Fase 1)** en `mobile/`: una cáscara Capacitor
  que corre el motor original dentro de la app, con almacenamiento local
  de la misma interfaz KV, particionado por perfil de alumno desde el
  nacimiento. El paquete empaquetado no pide ningún recurso de red.
- **Puerta de calidad Marble en la build**: el validador oficial de
  os-taxonomy debe pasar sobre la taxonomía empaquetada o la build se
  cae (`tools/marble/`).
- **El sistema de interfaz adoptado**: escalado desde el lado corto con
  tope en tabletas, suelos de lectura, paleta propia y fuente
  empaquetada, la tutora viva (nuestro SVG por capas con máquina de
  estados WAAPI), nuestro set de iconos, un botón de escuchar con el TTS
  del sistema y el sistema de tokens de movimiento. Pruebas: suite
  original 4/4, suite del runtime móvil 4/4.
- **La base del español**: nuestro andamiaje i18n (`tools/i18n/`:
  overlay por id, manifiesto con hashes, contrato QA) y la base
  comunitaria es-419, evaluada con nuestro protocolo y **adoptada como
  base** de la fase en español. Está en revisión y **no es importable**:
  ninguna línea suya se publica hasta que nuestra revisión bilingüe
  completa la firme.

Lo que aún no está construido, dicho sin rodeos:

- **El APK debug.** Gradle no puede construir en nuestro sandbox de
  build (su protocolo cliente-daemon usa sockets localhost que el
  sandbox intercepta; causa raíz documentada en docs/DESARROLLO.md). El
  proyecto está sincronizado y listo; el comando documentado lo
  construye en una máquina normal.
- **La prueba física en una tablet real** (incluido el modo avión) es
  la puerta del dueño y aún no ha ocurrido.
- La firma de release, la revisión formal de marca y cualquier decisión
  de tienda quedan pendientes de sus propios pasos.

Las modificaciones de este fork las mantiene Nido007-cmyk desde 2026, bajo
los mismos términos por pieza descritos arriba (ver NOTICE).
