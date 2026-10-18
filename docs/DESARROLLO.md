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
2. **Local first, internet optional.** The app starts and its complete
   learning experience (engine, map, available lessons, progress) works
   with no connection, always. Only features that genuinely need the
   network may use it (downloading new content packages is the natural
   example). Those are optional improvements: offline they wait quietly
   or say so honestly when tapped, they never block the app, and anything
   downloaded is stored on the device and works offline afterwards. No
   accounts and no collection of children's personal data over the
   network; any future feature that needed either is a pending owner
   decision (COPPA), not something we build on our own.
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

## Doctrine: inherited principles, our own creation

The original's principles are the floor and they stay: no live AI in the
app, content validated before it is served, an honest adaptive engine
(mastery is never faked), the placement question never shown raw to the
child, and the quality bar of its test suite. Beyond that floor,
everything new is our own creation, built from zero by us: code, texts,
screens, tools and art. What cannot be copied as-is is created from zero
or documented here as our pending piece, with its reason (the standing
example: `curriculum-standards.json`, whose sources keep their own
licensing; Common Core is not packaged into a commercial app without
review).

Licensing follows authorship, and the line is sharp:

- What derives from Marble (the taxonomy and its text) keeps ODbL 1.0 /
  CC BY-SA 4.0 and its attribution. That is law and does not change.
- The code inherited from Jane is MIT, copyright Kent Langley and Landon.
- Code we create is ours: MIT, copyright Nido007-cmyk.

## Charging principle (decided; implementation pending its phase)

The learning core is and stays free and complete: no paywall, no
subscription, no lock on learning, ever. The app is fully usable without
paying. Money, when its phase comes, will come only from optional extras
(new content packages, tutor cosmetics, deeper parent reports) bought by
parents from the parents' surface, never from a charge prompt inside a
child's lesson. Nothing in the architecture may tie progress or base
content to an account or a license server.

## Never (permanent design restrictions)

No advertising. No gambling mechanics (loot boxes, purchasable coins,
paying to skip or to answer). No fabricated time pressure. No emotional
blackmail by the tutor: she celebrates and encourages, she never
pressures. No rankings or social comparison between children. No live AI
chat. No notifications that chase the child outside the app.

## Phase 1 status (Android, branch `android`) — real state

Built and verified in this repository:

- **Capacitor shell** (`mobile/`): appId `com.nido007.duna`
  (provisional). The original worker runs inside the app
  (`mobile/runtime/boot.mjs`) with the engine untouched; `/api/*` and
  `/parent` are answered on the device. The packaged web bundle
  (~2.2 MB) references no network resource at all.
- **Local storage with the original KV interface** (get/put/list),
  serialized, one JSON file per key on the device. It is born
  partitioned per learner profile (`perfil/<id>/` prefix, invisible to
  the engine); the profile picker screen arrives in a later phase.
- **Marble quality gate in the build**: the official os-taxonomy
  validator (vendored unmodified in `tools/marble/`) must pass over the
  packaged taxonomy or the build fails. Factory content (the example
  quest) is validated with the original package validator before it is
  seeded, once.
- **Interface**: the adopted design system (scaling unit from the short
  side with a tablet cap, reading floors that never shrink, touch
  targets 48/56 px, own palette, bundled OFL font, fully offline). On
  top of it: the motion token system (durations 90 to 640 ms, three
  springs, transform/opacity only), the living tutor (our layered SVG
  with a WAAPI state machine: blink, breathing, gaze, six expressions),
  our own icon set, a listen button that reads the question aloud with
  the system TTS, and an honest offline notice that never blocks.
- **Tests**: the upstream smoke suite passes (4/4) and the mobile
  runtime suite passes (4/4), including profile isolation.

Not done, stated plainly:

- **Debug APK: not built in our build sandbox.** The Gradle
  client-daemon protocol uses TCP sockets on 127.0.0.1, and in that
  sandbox the JVM's localhost connections are intercepted by a third
  party (minimal Java repro: the intended server never accepts; the
  client first receives byte 109, "m"; Gradle dies with "Unexpected
  type tag 109"). The project is synced and ready; on any normal
  machine the build is:
  `cd mobile && npm ci && npm run build && npx cap sync android &&
  cd android && ./gradlew assembleDebug` with `ANDROID_HOME` set,
  producing `app/build/outputs/apk/debug/app-debug.apk`.
- **Physical test on the owner's tablet** (including airplane mode:
  start and main flow with the network off) is the owner's gate, as
  with NIDO. Headless captures are mockups, not device proof.
- Release signing, the formal trademark review and any store decision
  are pending their own steps.

## Data QA notes (recorded, not fixed in this phase)

Upstream data warnings stay on our QA list: os-taxonomy issues #5 (a few
edges possibly inverted or age-inconsistent), #11 (some topic names at
odds with their descriptions or standards) and #25 (Science cluster
entries without topics in `clusters.json`). We do not edit the taxonomy
in this phase. The name fixes proposed in upstream PR #17 join the QA
list: candidates only, applied case by case and only after the upstream
validator passes on the result. `curriculum-standards.json` is NOT
packaged in the app (per-source licensing; see Doctrine). The cluster
summaries, the `reason` of each edge and per-topic standard codes are
raw material for a future parent report, not app data today.

Spanish bases (premise corrected by a second ecosystem sweep on
2026-10-18): two community translations of the taxonomy DO exist, both
drafts with no declared human review. The es-419 base
(Tropicalrambler/os-taxonomy) was evaluated with our own protocol and
ADOPTED AS THE BASE of the Spanish phase: it may save the start of the
translation, never the review, and no line of it reaches the app until
our complete bilingual review signs its manifest (it is stored, not
importable, in `tools/i18n/bases/es-419/`). The es-MX base
(davidmedel/marble-taxonomy-mx) is not adopted as text (its own
manifest declares machine translation, DRAFT_ONLY, publication
blocked); its scaffolding pattern (overlay by id, hashed manifest,
validators, QA contract) is adopted in our own writing in
`tools/i18n/`. Jane's kid layer (kid-prompts, glossary) is translated in
no fork: that translation is our own work either way, under CC BY-SA
4.0 like the rest of the derived text.

## Backlog (decided, future phases)

- **Interactive experiments in the lesson visual slot.** The engine
  already serves a visual for each item (today: generated fraction
  visuals and `scene`, an inline SVG that passes a sanitizer which
  strips scripts and handlers — that safety property stays). In its
  phase, playable simulations (light the stove, watch the water boil,
  with temperature and slow motion) will hang off this same slot: the
  scene stays declarative data with a simulation id, and the interactive
  behaviour lives in our own runtime modules shipped with the app.
  First set: hero topics in science and mathematics. Our creation from
  zero: the presentation material that inspired this (a Marble team
  video) is not in the open repositories and is not copied.
- **Constellation view of learning.** An evolution of My World and of
  the parent report: the prerequisite graph drawn as a constellation
  whose stars light up with what the child has mastered. Same rule:
  our own creation from zero, in its phase.

## Interface debt (recorded, not hidden)

The parent report keeps its inherited stylesheet (the app strips its
remote fonts when opening it); dynamic header chips are still drawn by
the original code with emoji; the island map and the medals keep the
inherited art (solid, pending a redraw in the adopted visual language);
the full Settings surface of the adopted spec is not built yet (we do
not fake controls that do not work); the Android splash is the
Capacitor template. The original's vendored effects bundle stays in use
through `fx.js` for now; retiring it and replacing it with our own code
is decided for the next phase.

## Phases

- **Phase 1: Android first.** (In progress, see status above.)
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
2. **Local primero, internet opcional.** La app arranca y su experiencia
   completa de aprendizaje (motor, mapa, lecciones disponibles, progreso)
   funciona sin conexión, siempre. Solo las funciones que de verdad lo
   necesiten pueden usar internet (descargar paquetes de contenido nuevo
   es el ejemplo natural). Son mejoras opcionales: sin conexión esperan en
   silencio o lo dicen con honestidad si se tocan, jamás bloquean la app,
   y lo descargado queda guardado en el dispositivo y funciona sin red.
   Nada de cuentas ni recogida de datos personales de niños por la red:
   cualquier función futura que los necesitara es una decisión pendiente
   del dueño (COPPA), no algo que construyamos por nuestra cuenta.
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

## Doctrina: principios heredados, creación propia

Los principios del original son el suelo y se quedan: sin IA en vivo en
la app, contenido validado antes de servirse, motor adaptativo honesto
(el dominio nunca se finge), la pregunta de colocación nunca se enseña
cruda al niño, y la vara de calidad de su suite de pruebas. A partir de
ese suelo, todo lo nuevo es creación nuestra, construida desde cero:
código, textos, pantallas, herramientas y arte. Lo que no se puede
copiar tal cual se crea desde cero o se documenta aquí como pieza
nuestra pendiente, con su porqué (el ejemplo permanente:
`curriculum-standards.json`, cuyas fuentes conservan sus propias
licencias; Common Core no se empaqueta en una app comercial sin
revisión).

Las licencias siguen a la autoría, y la línea es nítida:

- Lo que deriva de Marble (la taxonomía y su texto) conserva ODbL 1.0 /
  CC BY-SA 4.0 y su atribución. Eso es ley y no cambia.
- El código heredado de Jane es MIT, copyright de Kent Langley y Landon.
- El código que creamos es nuestro: MIT, copyright Nido007-cmyk.

## Principio de cobro (decidido; implementación pendiente de su fase)

El núcleo de aprendizaje es y será gratis y completo: ningún paywall,
ninguna suscripción, ningún candado sobre aprender, nunca. La app se usa
entera sin pagar. El dinero, cuando llegue su fase, vendrá solo de
extras opcionales (paquetes de contenido nuevo, cosméticos de la tutora,
informes de padres con más profundidad) comprados por los padres desde
su superficie, jamás con un aviso de cobro en mitad de la lección del
niño. Nada en la arquitectura puede atar el progreso ni el contenido
base a una cuenta ni a un servidor de licencias.

## Jamás (restricciones permanentes de diseño)

Nada de publicidad. Nada de mecánicas de azar (cajas sorpresa, monedas
comprables, pagar por saltar o por responder). Nada de presión de tiempo
fabricada. Nada de chantaje emocional de la tutora: ella celebra y
anima, jamás presiona. Nada de rankings ni comparación social entre
niños. Nada de chat con IA en vivo. Nada de notificaciones que persigan
al niño fuera de la app.

## Estado de la Fase 1 (Android, rama `android`) — estado real

Construido y verificado en este repositorio:

- **Cáscara Capacitor** (`mobile/`): appId `com.nido007.duna`
  (provisional). El worker original corre dentro de la app
  (`mobile/runtime/boot.mjs`) con el motor intacto; `/api/*` y `/parent`
  se responden en el dispositivo. El paquete web empaquetado (~2,2 MB)
  no referencia ningún recurso de red.
- **Almacenamiento local con la interfaz KV original** (get/put/list),
  serializado, un archivo JSON por clave en el dispositivo. Nace
  particionado por perfil de alumno (prefijo `perfil/<id>/`, invisible
  para el motor); la pantalla de perfiles llega en una fase posterior.
- **Puerta de calidad Marble en la build**: el validador oficial de
  os-taxonomy (vendido sin modificar en `tools/marble/`) debe pasar
  sobre la taxonomía empaquetada o la build se cae. El contenido de
  fábrica (la misión de ejemplo) se valida con el validador original de
  paquetes antes de sembrarse, una sola vez.
- **Interfaz**: el sistema de diseño adoptado (unidad de escalado desde
  el lado corto con tope en tabletas, suelos de lectura que nunca bajan,
  objetivos táctiles de 48/56 px, paleta propia, fuente OFL empaquetada,
  todo sin red). Encima: el sistema de tokens de movimiento (duraciones
  de 90 a 640 ms, tres resortes, solo transform/opacity), la tutora viva
  (nuestro SVG por capas con máquina de estados WAAPI: parpadeo,
  respiración, mirada, seis expresiones), nuestro set de iconos, un
  botón de escuchar que lee la pregunta en voz alta con el TTS del
  sistema, y un aviso sin conexión honesto que nunca bloquea.
- **Pruebas**: la suite de humo original pasa (4/4) y la suite del
  runtime móvil pasa (4/4), incluido el aislamiento entre perfiles.

Lo que NO está hecho, dicho sin rodeos:

- **APK debug: no construido en nuestro sandbox de build.** El protocolo
  cliente-daemon de Gradle usa sockets TCP en 127.0.0.1, y en ese
  sandbox las conexiones localhost de la JVM las intercepta un tercero
  (repro mínimo en Java: el servidor previsto nunca acepta; el cliente
  recibe primero el byte 109, «m»; Gradle muere con «Unexpected type
  tag 109»). El proyecto está sincronizado y listo; en cualquier
  máquina normal la build es:
  `cd mobile && npm ci && npm run build && npx cap sync android &&
  cd android && ./gradlew assembleDebug` con `ANDROID_HOME` definido,
  y produce `app/build/outputs/apk/debug/app-debug.apk`.
- **La prueba física en la tablet del dueño** (incluido el modo avión:
  arranque y flujo principal sin red) es la puerta del dueño, como con
  NIDO. Las capturas headless son maquetas, no prueba de dispositivo.
- La firma de release, la revisión formal de marca y cualquier decisión
  de tienda quedan pendientes de sus propios pasos.

## Notas de QA de datos (registradas, no corregidas en esta fase)

Los avisos de datos de upstream quedan en nuestra lista de QA: issues
#5 de os-taxonomy (algunas aristas posiblemente invertidas o con edades
incoherentes), #11 (algunos nombres de temas contradicen su descripción
o sus estándares) y #25 (entradas de clusters de Science sin temas en
`clusters.json`). En esta fase no editamos la taxonomía. Las
correcciones de nombres propuestas en el PR #17 de upstream entran en
la lista QA: solo candidatas, aplicadas caso a caso y únicamente con
el validador oficial pasando sobre el resultado.
`curriculum-standards.json` NO se empaqueta en la app (licencias por
fuente; ver Doctrina). Los resúmenes de clusters, el `reason` de cada
arista y los códigos de estándares por tema son materia prima de un
futuro informe de padres, no datos de la app hoy.

Bases en español (premisa corregida por la segunda barrida del
ecosistema, 2026-10-18): SÍ existen dos traducciones comunitarias de
la taxonomía, ambas borradores sin revisión humana declarada. La base
es-419 (Tropicalrambler/os-taxonomy) quedó evaluada con nuestro
protocolo y ADOPTADA COMO BASE de la fase en español: puede ahorrar el
arranque de la traducción, nunca la revisión, y ninguna línea suya
llega a la app hasta que nuestra revisión bilingüe completa firme su
manifiesto (queda guardada, no importable, en
`tools/i18n/bases/es-419/`). La base es-MX (davidmedel/
marble-taxonomy-mx) no se adopta como texto (su propio manifiesto la
declara traducción automática, DRAFT_ONLY, publicación bloqueada); su
patrón de andamiaje (overlay por id, manifiesto con hashes,
validadores, contrato QA) sí se adopta, escrito por nosotros en
`tools/i18n/`. La capa infantil de Jane (kid-prompts, glosario) no está
traducida en ningún fork: esa traducción es trabajo propio pase lo que
pase, bajo CC BY-SA 4.0 como el resto del texto derivado.

## Backlog (decidido, fases futuras)

- **Experimentos interactivos en el hueco visual de la lección.** El
  motor ya sirve un visual por ítem (hoy: visuales de fracciones
  generados y `scene`, un SVG en línea que pasa un sanitizador que
  retira scripts y manejadores: esa propiedad de seguridad se queda).
  En su fase, las simulaciones jugables (encender la estufa, ver hervir
  el agua, con temperatura y cámara lenta) colgarán de este mismo
  hueco: la escena se queda como dato declarativo con un id de
  simulación, y el comportamiento interactivo vive en módulos de runtime
  nuestros que viajan con la app. Primer set: temas héroe de ciencias y
  matemáticas. Creación nuestra desde cero: el material de presentación
  que lo inspiró (un video del equipo de Marble) no está en los
  repositorios abiertos y no se copia.
- **Vista de constelación del aprendizaje.** Una evolución de My World
  y del informe de padres: el grafo de prerrequisitos dibujado como una
  constelación cuyas estrellas se encienden con lo que el niño domina.
  Misma regla: creación nuestra desde cero, en su fase.

## Deuda de interfaz (registrada, no escondida)

El informe de padres conserva su hoja de estilos heredada (la app retira
sus fuentes remotas al abrirlo); los chips dinámicos de la cabecera los
sigue pintando el código original con emoji; el mapa de islas y las
medallas conservan el arte heredado (sólido, pendiente de redibujo en el
lenguaje visual adoptado); la superficie completa de Ajustes de la
especificación adoptada aún no está construida (no fingimos controles
que no funcionan); el splash de Android es la plantilla de Capacitor.
El bundle de efectos vendored del original sigue en uso vía `fx.js` por
ahora; retirarlo y sustituirlo por código propio está decidido para la
fase siguiente.

## Fases

- **Fase 1: Android primero.** (En curso, ver el estado de arriba.)
  Distribución por APK directo, como publica NIDO, con Play Store como
  opción documentada bajo sus políticas para familias.
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
