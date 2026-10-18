// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT (ver ../LICENSE).
// Prueba de extremo a extremo del runtime de Duna SIN RED y sin servidor:
// corre el worker original dentro de Node con el env de la app (ASSETS desde
// disco, JANE_KV = nuestro almacén local con backend en memoria) y recorre
// el camino completo: primera pregunta, siembra de la misión de fábrica,
// misión nueva, informe de padres. Es la contrapartida de test/server.test.mjs
// para el anfitrión nuevo, con la misma vara.
// Run: npm test (en mobile/)
import {test, before} from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..', '..');
const MIME = {'.json': 'application/json', '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css'};

let KV, worker, call;

before(async () => {
  if (!fs.existsSync(path.join(ROOT, 'public', 'tax.json')) || !fs.existsSync(path.join(ROOT, 'src', 'gen.js')))
    execFileSync(process.execPath, ['build.mjs'], {cwd: ROOT, stdio: 'ignore'});
  const {createKV} = await import('../runtime/kv-core.mjs');
  const {createMemoryBackend} = await import('../runtime/kv-memory-backend.mjs');
  worker = (await import('../../src/worker.js')).default;
  const ASSETS = {
    async fetch(input) {
      const u = new URL(typeof input === 'string' ? input : input.url, 'https://assets.local');
      let p = decodeURIComponent(u.pathname);
      if (p === '/') p = '/index.html';
      const f = path.join(ROOT, 'public', p);
      if (!fs.existsSync(f)) return new Response('not found', {status: 404});
      return new Response(fs.readFileSync(f), {
        headers: {'content-type': MIME[path.extname(f)] || 'application/octet-stream'},
      });
    },
  };
  KV = createKV(createMemoryBackend());
  const env = {ASSETS, JANE_KV: KV, LEARNER_NAME: 'Sam', LEARNER_AGE: '10', LEARNER_GRADE: '5th grade'};
  call = async (p, body) => {
    const req = new Request(
      'https://duna.local' + p,
      body === undefined
        ? {}
        : {method: 'POST', headers: {'content-type': 'application/json'}, body: JSON.stringify(body)}
    );
    return worker.fetch(req, env);
  };
});

const api = async (p, body) => {
  const r = await call(p, body);
  assert.equal(r.status, 200, p);
  return r.json();
};

test('flujo pizza en el dispositivo: primera pregunta, un fallo, 3/8 correcto', async () => {
  const s = await api('/api/state');
  assert.equal(s.name, 'Sam');
  assert.match(s.item.q, /pizza/i);
  const miss = await api('/api/answer', {answer: '5/8'});
  assert.equal(miss.correct, false);
  const ok = await api('/api/answer', {answer: '3/8'});
  assert.equal(ok.correct, true);
  const progress = await KV.get('progress', 'json');
  assert.ok(progress && progress.points > 0, 'el progreso vive en el almacén local');
  const logs = await KV.list({prefix: 'log:'});
  assert.equal(logs.keys.length, 1, 'el log del día vive en el almacén local');
});

test('la misión de fábrica se siembra una vez y aparece como misión nueva', async () => {
  const {seedContent, ptDate} = await import('../runtime/seed.mjs');
  const pack = JSON.parse(fs.readFileSync(path.join(ROOT, 'packs', 'examples', 'example-quest.json'), 'utf8'));
  assert.equal(await seedContent(KV, pack), true, 'primera siembra');
  assert.equal(await seedContent(KV, pack), false, 'la siembra no se repite');
  const lessons = await KV.list({prefix: 'lessons:'});
  assert.deepEqual(lessons.keys.map((k) => k.name), ['lessons:' + ptDate()]);
  const s = await api('/api/state');
  assert.equal(s.newQuest, true);
  assert.match(s.quest.title, /Captain Comet/);
  const started = await api('/api/quest/start', {date: ptDate()});
  assert.ok(started.quest?.title);
});

test('el informe de padres se renderiza desde el almacén local', async () => {
  const r = await call('/parent');
  assert.equal(r.status, 200);
  const h = await r.text();
  assert.match(h, /Sam/);
});

test('los perfiles viven aislados en el mismo backend (espacio de nombres)', async () => {
  const {createKV} = await import('../runtime/kv-core.mjs');
  const {createMemoryBackend} = await import('../runtime/kv-memory-backend.mjs');
  const backend = createMemoryBackend();
  const ana = createKV(backend, 'ana');
  const luis = createKV(backend, 'luis');
  await ana.put('progress', '{"coins":10}');
  assert.equal(await luis.get('progress'), null, 'luis no ve el progreso de ana');
  await luis.put('progress', '{"coins":99}');
  assert.equal(await ana.get('progress', 'json').then((p) => p.coins), 10);
  const names = await backend.list();
  assert.ok(names.some((n) => n.startsWith('perfil/ana/')), 'las claves nacen particionadas');
  const listed = await ana.list({prefix: 'prog'});
  assert.deepEqual(listed.keys.map((k) => k.name), ['progress'], 'list devuelve claves sin prefijo');
});
