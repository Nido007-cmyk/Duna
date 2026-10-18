# Development direction / Dirección de desarrollo

This document records where this fork is going and the rules it works
under. It is a living document: it changes when the work changes, and it
only describes decisions that have actually been taken.

## What this fork is

A fork of kentlangley/Jane (MIT, copyright Kent Langley and Landon), made
on October 18, 2026, to develop the app in a new direction: native apps
that live on the device, in the same spirit as our NIDO project.

## Principles

1. **On the device.** The learning engine, the content and the learner's
   progress live on the phone or tablet. No cloud account holds a child's
   progress.
2. **Depending on no one.** The app the child uses needs no server, no
   account and no outside service. Authoring tools may run on our own
   machines during development; the shipped app stands on its own.
3. **Legal, with attributions intact.** Code under MIT with its notice
   kept. The Marble Skill Taxonomy data stays under ODbL 1.0 and its text
   under CC BY-SA 4.0, with the required attribution line shown wherever
   upstream shows it. Anything we translate or extend on the data side
   stays under those same licenses. Nothing ships without its license in
   place.
4. **Professional repository.** Clear bilingual documentation, structured
   docs, descriptive commits, and a repository that always reflects the
   real state of the work. If it is not built yet, the docs say so.
5. **No live AI in the app.** This is upstream's design and we keep it:
   lessons are written and reviewed ahead of time, and the app serves
   fixed, readable content.

## Phases

- **Phase 1: Android first.** Port the engine and content to an Android
  app with on-device storage replacing the Cloudflare KV and file stores.
  Distribution by direct APK, as NIDO ships, with the Play Store as a
  documented option under its families policies.
- **Phase 2: Apple, path ready.** The iOS route (toolchain, developer
  account, kids category rules, review constraints) is documented before
  any iOS build starts, and Phase 1 choices are made so the iOS port does
  not mean starting over. iOS is not built in Phase 1.
- **Phase 3: Bilingual EN/ES.** Interface and content in English and
  Spanish. Note on licensing: translating the taxonomy text is an
  adaptation, so the translated text is shared under CC BY-SA 4.0, the
  same license as the original text. Our code remains MIT.

## What we are not

- Not the upstream project, and not affiliated with Kent Langley or
  Landon. Their work is credited in README.md, LICENSE, LICENSING.md and
  NOTICE, and the fork link stays visible on GitHub.
- Not affiliated with Marble or Generative Spark, Inc., beyond the
  attribution the ODbL and CC BY-SA licenses require.
- The name Jane belongs to the upstream project. This fork is developed
  under its own product name, **Duna**, chosen by the project owner and
  recorded here as promised, with every attribution kept. The name was
  screened before adoption and no collision was found in children's
  education or in educational software; a formal trademark review remains
  a required step before any public launch.

---

# Dirección de desarrollo (español)

Este documento registra hacia dónde va este fork y las reglas bajo las que
trabaja. Es un documento vivo: cambia cuando cambia el trabajo, y solo
describe decisiones que ya se tomaron.

## Qué es este fork

Un fork de kentlangley/Jane (MIT, copyright de Kent Langley y Landon),
hecho el 18 de octubre de 2026, para desarrollar la app en una dirección
nueva: apps nativas que viven en el dispositivo, con el mismo espíritu que
nuestro proyecto NIDO.

## Principios

1. **En el dispositivo.** El motor de aprendizaje, el contenido y el
   progreso del alumno viven en el teléfono o la tableta. Ninguna cuenta
   en la nube guarda el progreso de un niño.
2. **Sin depender de nadie.** La app que usa el niño no necesita servidor,
   ni cuenta, ni servicio externo. Las herramientas de autoría pueden
   correr en nuestras propias máquinas durante el desarrollo; la app
   publicada se sostiene sola.
3. **Legal, con las atribuciones intactas.** Código bajo MIT con su aviso
   conservado. Los datos de la taxonomía Marble se quedan bajo ODbL 1.0 y
   su texto bajo CC BY-SA 4.0, con la línea de atribución obligatoria en
   los mismos lugares donde la muestra el proyecto original. Todo lo que
   traduzcamos o ampliemos del lado de los datos se queda bajo esas mismas
   licencias. Nada se publica sin su licencia en su sitio.
4. **Repositorio profesional.** Documentación bilingüe y clara, documentos
   estructurados, commits descriptivos, y un repositorio que siempre
   refleja el estado real del trabajo. Si algo aún no está construido, los
   documentos lo dicen.
5. **Sin IA en vivo en la app.** Es el diseño original y lo mantenemos:
   las lecciones se escriben y se revisan antes, y la app muestra contenido
   fijo y legible.

## Fases

- **Fase 1: Android primero.** Llevar el motor y el contenido a una app de
  Android, con almacenamiento en el dispositivo en lugar de Cloudflare KV
  y los archivos del servidor. Distribución por APK directo, como publica
  NIDO, con Play Store como opción documentada bajo sus políticas para
  familias.
- **Fase 2: Apple, con el camino listo.** La ruta de iOS (herramientas,
  cuenta de desarrollador, reglas de la categoría infantil, límites de la
  revisión) queda documentada antes de construir nada para iOS, y las
  decisiones de la Fase 1 se toman para que el porte a iOS no signifique
  empezar de cero. En la Fase 1 no se construye iOS.
- **Fase 3: Bilingüe EN/ES.** Interfaz y contenido en inglés y español.
  Nota de licencia: traducir el texto de la taxonomía es una adaptación,
  así que el texto traducido se comparte bajo CC BY-SA 4.0, la misma
  licencia del texto original. Nuestro código sigue siendo MIT.

## Lo que no somos

- No somos el proyecto original, ni estamos afiliados con Kent Langley o
  Landon. Su trabajo está acreditado en README.md, LICENSE, LICENSING.md y
  NOTICE, y el enlace de fork queda visible en GitHub.
- No estamos afiliados con Marble ni con Generative Spark, Inc., más allá
  de la atribución que exigen las licencias ODbL y CC BY-SA.
- El nombre Jane pertenece al proyecto original. Este fork se desarrolla
  con nombre propio, **Duna**, elegido por el dueño del proyecto y
  registrado aquí como se prometió, conservando todas las atribuciones.
  El nombre se cribó antes de su adopción y no se encontró colisión en
  educación infantil ni en software educativo; la revisión formal de
  marca queda como paso obligatorio antes de cualquier lanzamiento
  público.
