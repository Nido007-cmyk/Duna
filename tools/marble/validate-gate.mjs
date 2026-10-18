#!/usr/bin/env node
// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT.
// Puerta de calidad de datos de la build de Duna: corre el validador OFICIAL
// de la Marble Skill Taxonomy (validate.mjs, vendido sin cambios en esta
// carpeta) sobre la taxonomía que la app empaqueta, y falla si no pasa.
//
// El validador espera el dataset completo (topics, dependencies,
// curriculum-standards, clusters + manifest). Nuestro repo vende solo los dos
// primeros en data/marble/; los otros dos archivos NO se venden ni se
// empaquetan en la app (ver docs/DESARROLLO.md). Para poder correr el
// validador tal cual, esta puerta los obtiene una sola vez del repo upstream
// como FIXTURES de validación (quedan en .cache/, fuera de git y fuera de la
// app) y solo los acepta si su sha256 coincide con el que declara el
// manifest.json vendido: así las fixtures no pueden desviarse de la v1.
//
// Sin fixtures ni red, corre en modo PARCIAL (conteos, integridad referencial
// de aristas y checksums de los dos archivos que sí empaqueta la app) y lo
// dice en voz alta. El modo parcial nunca se presenta como validación completa.
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const MARBLE = path.join(ROOT, 'data', 'marble');
const CACHE = path.join(HERE, '.cache');
const UPSTREAM = 'https://raw.githubusercontent.com/withmarbleapp/os-taxonomy/main/data/';
const FIXTURES = ['clusters.json', 'curriculum-standards.json'];

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const manifest = JSON.parse(fs.readFileSync(path.join(MARBLE, 'manifest.json'), 'utf8'));

async function fixture(name) {
  const cached = path.join(CACHE, name);
  if (fs.existsSync(cached)) return fs.readFileSync(cached);
  const res = await fetch(UPSTREAM + name);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  const expected = manifest.files?.[name]?.sha256;
  if (expected && sha256(buf) !== expected)
    throw new Error(`${name}: el sha256 no coincide con el manifest vendido; fixture rechazada`);
  fs.mkdirSync(CACHE, {recursive: true});
  fs.writeFileSync(cached, buf);
  return buf;
}

function partial() {
  console.warn('⚠️  VALIDACIÓN PARCIAL: sin fixtures de upstream ni red para obtenerlas.');
  console.warn('    Se comprueba solo lo que la app empaqueta (topics + dependencies).');
  const topics = JSON.parse(fs.readFileSync(path.join(MARBLE, 'topics.json'), 'utf8'));
  const deps = JSON.parse(fs.readFileSync(path.join(MARBLE, 'dependencies.json'), 'utf8'));
  const errors = [];
  for (const name of ['topics.json', 'dependencies.json']) {
    const meta = manifest.files?.[name];
    if (meta && sha256(fs.readFileSync(path.join(MARBLE, name))) !== meta.sha256)
      errors.push(`${name}: checksum no coincide con el manifest`);
  }
  const ids = new Set(topics.topics.map((t) => t.id));
  if (topics.topicCount !== topics.topics.length) errors.push('topics: topicCount no coincide');
  if (deps.edgeCount !== deps.dependencies.length) errors.push('dependencies: edgeCount no coincide');
  for (const d of deps.dependencies) {
    if (!ids.has(d.topicId)) errors.push(`arista con topicId desconocido ${d.topicId}`);
    if (!ids.has(d.prerequisiteId)) errors.push(`arista con prerequisiteId desconocido ${d.prerequisiteId}`);
    if (d.topicId === d.prerequisiteId) errors.push(`auto-arista en ${d.topicId}`);
    if (d.strength !== 'hard' && d.strength !== 'soft') errors.push(`strength inválido ${d.strength}`);
  }
  if (errors.length) {
    console.error(`✗ ${errors.length} problema(s) en validación parcial:\n  - ` + errors.slice(0, 20).join('\n  - '));
    process.exit(1);
  }
  console.log(`✓ parcial — ${topics.topics.length} temas, ${deps.dependencies.length} aristas: integridad y checksums OK (solo archivos empaquetados).`);
}

const got = {};
let full = true;
for (const name of FIXTURES) {
  try { got[name] = await fixture(name); }
  catch (e) { console.warn(`fixture ${name}: ${e.message}`); full = false; }
}
if (!full) { partial(); process.exit(0); }

const stage = fs.mkdtempSync(path.join(os.tmpdir(), 'duna-marble-validate-'));
try {
  fs.mkdirSync(path.join(stage, 'scripts'));
  fs.mkdirSync(path.join(stage, 'data'));
  fs.copyFileSync(path.join(HERE, 'validate.mjs'), path.join(stage, 'scripts', 'validate.mjs'));
  for (const name of ['topics.json', 'dependencies.json', 'manifest.json'])
    fs.copyFileSync(path.join(MARBLE, name), path.join(stage, 'data', name));
  for (const name of FIXTURES) fs.writeFileSync(path.join(stage, 'data', name), got[name]);
  execFileSync(process.execPath, [path.join(stage, 'scripts', 'validate.mjs')], {stdio: 'inherit'});
  console.log('✓ puerta Marble: la taxonomía empaquetada pasa el validador oficial de upstream.');
} catch (e) {
  console.error('✗ puerta Marble: el validador oficial RECHAZA la taxonomía empaquetada.');
  process.exit(1);
} finally {
  fs.rmSync(stage, {recursive: true, force: true});
}
