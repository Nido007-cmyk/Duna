// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT.
// Convierte el crudo es-419 (archivos enteros espejo de upstream) a
// NUESTRO formato overlay por id y escribe el manifiesto de la base.
// La base queda ADOPTADA COMO BASE de la fase ES con revisión pendiente:
// el manifiesto nace con importable=false y así se queda hasta que la
// revisión bilingüe completa de la casa la firme (ver EVALUACION.md).
import fs from 'node:fs';
import path from 'node:path';
import {buildManifest, edgeKey, loadSource, validateOverlay} from '../../overlay.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', '..');
const DIR = path.dirname(new URL(import.meta.url).pathname);
const CRUDO = path.join(DIR, 'crudo');
const source = loadSource(ROOT);

const topicsDoc = JSON.parse(fs.readFileSync(path.join(CRUDO, 'topics.json'), 'utf8'));
const depsDoc = JSON.parse(fs.readFileSync(path.join(CRUDO, 'dependencies.json'), 'utf8'));

const overlay = {topics: {}, dependencies: {}};
const evidence = {};
for (const t of topicsDoc.topics) {
  overlay.topics[t.id] = {name: t.name, description: t.description};
  if (t.evidence) evidence[t.id] = t.evidence;
}
for (const d of depsDoc.dependencies) overlay.dependencies[edgeKey(d)] = {reason: d.reason};

const v = validateOverlay(source, overlay);
if (!v.ok) { console.error('la conversión no valida:', v.errors.slice(0, 5)); process.exit(1); }

fs.writeFileSync(path.join(DIR, 'topics.json'), JSON.stringify(overlay.topics, null, 1) + '\n');
fs.writeFileSync(path.join(DIR, 'dependencies.json'), JSON.stringify(overlay.dependencies, null, 1) + '\n');
fs.writeFileSync(path.join(DIR, 'evidence.json'), JSON.stringify(evidence, null, 1) + '\n');

const m = buildManifest(ROOT, DIR, overlay, {
  locale: 'es-419',
  method: 'Base candidata adoptada: traducción derivada es-419 de Tropicalrambler/os-taxonomy (head e510d9bd7ae64ae148fa0a418c15e13ba24d5c60), bajo ODbL 1.0 / CC BY-SA 4.0 con atribución a Marble. Evaluación estructural de la casa aprobada (ver EVALUACION.md); revisión bilingüe completa pendiente.',
});
fs.writeFileSync(path.join(DIR, 'manifest.json'), JSON.stringify(m, null, 2) + '\n');
console.log('overlay escrito:', Object.keys(overlay.topics).length, 'temas,', Object.keys(overlay.dependencies).length, 'aristas,', Object.keys(evidence).length, 'evidencias');
console.log('manifiesto: importable =', m.importable, '| review =', m.review.status);
