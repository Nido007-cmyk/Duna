// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT.
// Pruebas del andamiaje i18n (tools/i18n/overlay.mjs). Sin contenido de
// ningún fork: el overlay de prueba se genera desde la propia fuente en
// inglés (identidad) y se corrompe a propósito para el control negativo.
// Correr: node --test tools/i18n/overlay.test.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {buildManifest, edgeKey, loadOverlay, loadSource, sha256, validateOverlay} from './overlay.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const source = loadSource(ROOT);

function identityOverlay() {
  const topics = {};
  for (const t of source.topics) topics[t.id] = {name: t.name, description: t.description};
  const dependencies = {};
  for (const d of source.dependencies) dependencies[edgeKey(d)] = {reason: d.reason};
  return {topics, dependencies};
}

test('la fuente carga completa: 1590 temas y 3221 aristas', () => {
  assert.equal(source.topics.length, 1590);
  assert.equal(source.dependencies.length, 3221);
});

test('un overlay completo y bien formado valida (con avisos de identidad)', () => {
  const r = validateOverlay(source, identityOverlay());
  assert.equal(r.ok, true, r.errors.slice(0, 3).join(' | '));
  assert.ok(r.warnings.length > 0, 'la identidad avisa: nombres sin traducir');
});

test('control negativo: id inventado, hueco y texto vacío se detectan', () => {
  const o = identityOverlay();
  const first = source.topics[0].id;
  delete o.topics[first];
  o.topics['mt_no_existe'] = {name: 'X', description: 'Y'};
  const second = source.topics[1].id;
  o.topics[second] = {name: ' ', description: ''};
  const r = validateOverlay(source, o);
  assert.equal(r.ok, false);
  assert.ok(r.errors.some((e) => e.includes('desconocido')), 'id inventado');
  assert.ok(r.errors.some((e) => e.includes(`falta ${first}`)), 'hueco');
  assert.ok(r.errors.some((e) => e.includes('vacío') || e.includes('vacía')), 'texto vacío');
});

test('el manifiesto ata hashes reales y nace NO importable sin revisión', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'duna-i18n-'));
  const o = identityOverlay();
  fs.writeFileSync(path.join(dir, 'topics.json'), JSON.stringify(o.topics));
  fs.writeFileSync(path.join(dir, 'dependencies.json'), JSON.stringify(o.dependencies));
  const loaded = loadOverlay(dir);
  const m = buildManifest(ROOT, dir, loaded, {locale: 'es-419', method: 'prueba de identidad'});
  assert.equal(m.importable, false);
  assert.equal(m.review.status, 'draft');
  assert.equal(m.files['topics.json'].entries, 1590);
  assert.equal(m.files['topics.json'].sha256, sha256(fs.readFileSync(path.join(dir, 'topics.json'))));
  assert.equal(m.source.topicsSha256, sha256(fs.readFileSync(path.join(ROOT, 'data/marble/topics.json'))));
  const m2 = buildManifest(ROOT, dir, loaded, {locale: 'es-419', method: 'x', reviewStatus: 'reviewed', reviewedBy: 'revisión de la casa'});
  assert.equal(m2.importable, true, 'solo con revisión registrada el overlay sería importable');
});
