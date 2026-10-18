# Duna for Android / Duna para Android

The Android app of the Duna fork, built with Capacitor. The learning
engine of the original project runs **inside the app**: the same
`src/worker.js` that serves the web version, with an `env` made of two
local adapters written for this fork:

- `runtime/assets.mjs` replaces the Cloudflare ASSETS binding with the
  files packaged in `www/`.
- `runtime/kv-core.mjs` + a backend replace Workers KV with on-device
  storage that keeps the **same get/put/list interface and semantics**
  as `server/file-kv.mjs` (one JSON file per key in the app's own
  storage, same filename scheme; localStorage fallback for desktop
  development; memory backend for tests). Operations are serialized,
  like the Node server serializes its API requests.

`runtime/boot.mjs` patches `window.fetch` before the kid app loads:
`/api/*` and `/parent` are answered on the device by the original
worker. No server, no account, no live AI. **Local first, internet
optional**: the app starts and the full learning experience works with
no connection at all; the packaged copy does not even request web
fonts (the build strips the external font link and falls back to
system fonts). A future content-download feature may use the network
as an optional enhancement; it must never block the app, and anything
downloaded stays on the device. No accounts and no collection of
children's personal data are built or planned without an explicit
owner decision (COPPA).

Built-in starter content: a fresh install seeds the repo's example
quest (validated at build time by the original `publish-lessons.mjs`)
dated "today", so the full quest loop works from the first minute.
The nightly authoring cycle (export → write → validate → publish)
remains the way real packs are produced; on the device, packs live in
the same local store under the same `lessons:YYYY-MM-DD` keys.

## Build

```bash
npm install
npm test          # runtime end-to-end tests (no network, no server)
npm run build     # Marble validation gate -> original build -> www/
npx cap add android   # once
npm run apk:debug     # build + sync + Gradle assembleDebug
```

The APK lands in `android/app/build/outputs/apk/debug/app-debug.apk`.

## Code ownership

Everything under `mobile/` is new code by this fork
(© 2026 Nido007-cmyk, MIT: see `LICENSE`). The app it wraps stays
© 2026 Kent Langley and Landon (MIT), and the Marble data stays
ODbL 1.0 / CC BY-SA 4.0 with its attribution. See `docs/DESARROLLO.md`.

---

# Duna para Android (resumen en español)

La app de Android del fork Duna, construida con Capacitor. El motor
del proyecto original corre **dentro de la app**: el mismo
`src/worker.js` de la versión web, con dos adaptadores locales propios
(activos empaquetados y un almacén en el dispositivo con la misma
interfaz get/put/list de `server/file-kv.mjs`). Sin servidor, sin
cuentas, sin IA en vivo. **Local primero, internet opcional**: la app
arranca y la experiencia completa funciona sin conexión; la descarga
futura de contenido será una mejora opcional que nunca bloquea, y lo
descargado quedará en el dispositivo. Al instalarse, la app siembra la
misión de ejemplo del repo (validada en la build con el validador
original) con la fecha de hoy, para que el bucle de misiones funcione
desde el primer minuto. Construcción: `npm install`, `npm test`,
`npm run build`, `npm run apk:debug`. Todo el código de `mobile/` es
creación de este fork (© 2026 Nido007-cmyk, MIT); la app envuelta y los
datos Marble conservan sus licencias y atribuciones.
