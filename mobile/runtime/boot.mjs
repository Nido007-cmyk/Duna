// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT (ver ../LICENSE).
// Arranque de Duna dentro de la WebView: corre el worker ORIGINAL de la app
// (src/worker.js, con su motor intacto) dentro de la propia aplicación, con
// un env hecho a su medida:
//   ASSETS  -> los estáticos empaquetados en www/ (assets.mjs)
//   JANE_KV -> el almacén local del dispositivo (kv-core + backend)
// y parchea window.fetch ANTES de que app.js cargue: las llamadas /api/* y
// /parent se responden en el dispositivo, sin servidor y sin red. Todo lo
// demás (estáticos) lo sirve el origen local de Capacitor tal cual.
// Es la misma costura que server/index.mjs usa en Node, llevada al teléfono.
import {Capacitor} from '@capacitor/core';
import worker from '../../src/worker.js';
import exampleQuest from '../../packs/examples/example-quest.json';
import {createKV} from './kv-core.mjs';
import {createFilesystemBackend} from './kv-fs-backend.mjs';
import {createWebBackend} from './kv-web-backend.mjs';
import {createAssets} from './assets.mjs';
import {seedContent} from './seed.mjs';

// Ajustes del alumno: los mismos defectos del diseño original. El nombre
// nunca se guarda en el progreso: el worker lo sustituye al responder.
const LEARNER = {LEARNER_NAME: 'Explorer', LEARNER_AGE: '10', LEARNER_GRADE: 'upper elementary'};

const nativeFetch = window.fetch.bind(window);
const backend = Capacitor.isNativePlatform() ? createFilesystemBackend() : createWebBackend();
const KV = createKV(backend);
const env = {ASSETS: createAssets(nativeFetch), JANE_KV: KV, ...LEARNER};

// La siembra de contenido es parte del arranque: ninguna petición se atiende
// antes de que el almacén tenga su contenido de fábrica.
const ready = seedContent(KV, exampleQuest).catch(() => false);

// El worker hace lectura-modificación-escritura del progreso: las llamadas se
// serializan, como hace server/index.mjs con sus peticiones.
let chain = Promise.resolve();
function runWorker(req) {
  const p = chain.then(async () => {
    await ready;
    return worker.fetch(req, env);
  });
  chain = p.then(() => {}, () => {});
  return p;
}

// Sandbox por URL, como en la web: ?sandbox=1 deja la cookie que el worker lee.
try {
  const sbx = new URLSearchParams(location.search).get('sandbox');
  if (sbx != null)
    document.cookie = `sbx=${sbx === '1' ? 1 : 0}; Path=/; SameSite=Lax${sbx === '1' ? '; Max-Age=86400' : '; Max-Age=0'}`;
} catch {}

window.fetch = (input, init) => {
  try {
    const url = new URL(typeof input === 'string' ? input : input.url, location.origin);
    if (url.pathname.startsWith('/api/') || url.pathname === '/parent') {
      const req = new Request(url.href, input instanceof Request ? input : init);
      try {
        if (document.cookie) req.headers.set('cookie', document.cookie);
      } catch {}
      return runWorker(req);
    }
  } catch {}
  return nativeFetch(input, init);
};

// El informe de padres es una NAVEGACIÓN (enlace del pie), no un fetch: en la
// web lo sirve el servidor; aquí se pide al worker local y se abre dentro de
// la app, sin fuentes externas (la app no pide nada a la red) y con un botón
// de vuelta que el diseño original no necesitaba (usaba el navegador).
async function openParent() {
  const r = await window.fetch('/parent');
  let html = await r.text();
  html = html.replace(/<link[^>]+fonts\.googleapis[^>]*>/g, '');
  const back =
    '<a href="/" style="position:fixed;left:12px;bottom:12px;z-index:99;background:#6B4EFF;color:#fff;' +
    'padding:12px 18px;border-radius:999px;font:600 15px system-ui,sans-serif;text-decoration:none;' +
    'box-shadow:0 4px 14px rgba(0,0,0,.25)">← Back to Duna</a>';
  html = html.replace('</body>', back + '</body>');
  document.open();
  document.write(html);
  document.close();
}
document.addEventListener(
  'click',
  (e) => {
    const a = e.target && e.target.closest && e.target.closest('a[href="/parent"]');
    if (a) {
      e.preventDefault();
      openParent().catch(() => {
        location.href = '/';
      });
    }
  },
  true
);

// Aviso sin conexión (sistema de interfaz adoptado): Duna es local primero,
// así que perder la red no bloquea nada; la píldora solo lo dice con
// honestidad, discreta, sin interceptar toques, y se va al volver la red.
function offlineChip() {
  let el = document.getElementById('duna-offline');
  if (!el) {
    el = document.createElement('div');
    el.id = 'duna-offline';
    el.setAttribute('role', 'status');
    el.textContent = 'Sin conexión: todo sigue funcionando en tu aparato.';
    document.body.appendChild(el);
  }
  return el;
}
function paintNet() {
  const el = offlineChip();
  el.hidden = navigator.onLine !== false;
}
window.addEventListener('offline', paintNet);
window.addEventListener('online', paintNet);
if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', paintNet, {once: true});
else paintNet();
