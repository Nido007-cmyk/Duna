// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT.
// Evaluación de la base candidata es-419 (Tropicalrambler/os-taxonomy)
// contra NUESTRA fuente y NUESTRO validador, antes de adoptarla como
// base de la fase ES. No modifica nada: convierte el crudo a nuestro
// formato overlay en memoria y reporta. La adopción, si la hay, queda
// en EVALUACION.md con estos números.
import fs from 'node:fs';
import path from 'node:path';
import {edgeKey, loadSource, validateOverlay} from '../../overlay.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..', '..', '..');
const CRUDO = path.join(ROOT, 'tools/i18n/bases/es-419/crudo');
const source = loadSource(ROOT);

const topicsDoc = JSON.parse(fs.readFileSync(path.join(CRUDO, 'topics.json'), 'utf8'));
const depsDoc = JSON.parse(fs.readFileSync(path.join(CRUDO, 'dependencies.json'), 'utf8'));
const clustersDoc = JSON.parse(fs.readFileSync(path.join(CRUDO, 'clusters.json'), 'utf8'));
const labelsDoc = JSON.parse(fs.readFileSync(path.join(CRUDO, 'labels.json'), 'utf8'));

console.log('== formas ==');
console.log('topics.json claves:', Object.keys(topicsDoc).slice(0, 8).join(', '));
const tArr = topicsDoc.topics || [];
console.log('temas en la base:', tArr.length, '| fuente:', source.topics.length);
console.log('tema[0] claves:', tArr[0] ? Object.keys(tArr[0]).join(', ') : 'N/A');
const dArr = depsDoc.dependencies || [];
console.log('aristas en la base:', dArr.length, '| fuente:', source.dependencies.length);
console.log('labels.json tipo:', Array.isArray(labelsDoc) ? 'array' : typeof labelsDoc, '| claves:', Object.keys(labelsDoc).slice(0, 10).join(', '));
const cArr = clustersDoc.clusters || clustersDoc || [];
console.log('clusters en la base:', Array.isArray(cArr) ? cArr.length : 'forma distinta');

// Conversión a overlay (id -> texto) y validación completa
const overlay = {topics: {}, dependencies: {}};
for (const t of tArr) overlay.topics[t.id] = {name: t.name, description: t.description};
for (const d of dArr) overlay.dependencies[edgeKey(d)] = {reason: d.reason};
const v = validateOverlay(source, overlay);
console.log('\n== validación estructural (nuestro validador, completo) ==');
console.log('ok:', v.ok, '| errores:', v.errors.length, '| avisos:', v.warnings.length);
console.log('primeros errores:', v.errors.slice(0, 5));
console.log('primeros avisos:', v.warnings.slice(0, 5));

// Estadísticas de traducción real
let sameName = 0, sameDesc = 0, sameReason = 0, lenRatio = [];
for (const t of source.topics) {
  const o = overlay.topics[t.id];
  if (!o) continue;
  if (o.name === t.name) sameName++;
  if (o.description === t.description) sameDesc++;
  if (t.description) lenRatio.push((o.description || '').length / t.description.length);
}
for (const d of source.dependencies) {
  const o = overlay.dependencies[edgeKey(d)];
  if (o && o.reason === d.reason) sameReason++;
}
lenRatio.sort((a, b) => a - b);
const med = lenRatio[Math.floor(lenRatio.length / 2)] || 0;
console.log('\n== estadística de traducción ==');
console.log(`nombres idénticos a EN: ${sameName}/${source.topics.length} (${(100 * sameName / source.topics.length).toFixed(1)}%)`);
console.log(`descripciones idénticas a EN: ${sameDesc}/${source.topics.length}`);
console.log(`motivos idénticos a EN: ${sameReason}/${source.dependencies.length}`);
console.log(`ratio de longitud descripción ES/EN: mediana ${med.toFixed(2)}, p10 ${(lenRatio[Math.floor(lenRatio.length * 0.1)] || 0).toFixed(2)}, p90 ${(lenRatio[Math.floor(lenRatio.length * 0.9)] || 0).toFixed(2)}`);

// Clusters contra la referencia de la puerta Marble (fixture verificada por hash)
const cache = path.join(ROOT, 'tools/marble/.cache/clusters.json');
if (fs.existsSync(cache) && Array.isArray(cArr)) {
  const ref = JSON.parse(fs.readFileSync(cache, 'utf8'));
  const refArr = ref.clusters || ref;
  const refIds = new Set(refArr.map((c) => c.id));
  const baseIds = new Set(cArr.map((c) => c.id));
  const faltan = [...refIds].filter((i) => !baseIds.has(i)).length;
  const sobran = [...baseIds].filter((i) => !refIds.has(i)).length;
  console.log(`\nclusters: referencia ${refIds.size}, base ${baseIds.size}, faltan ${faltan}, sobran ${sobran}`);
  const c0 = cArr[0] || {};
  console.log('cluster[0] claves:', Object.keys(c0).join(', '));
}

// Muestras para lectura humana (deterministas: índices fijos)
console.log('\n== muestras (índices 0, 500, 1000, 1589) ==');
for (const i of [0, 500, 1000, 1589]) {
  const s = source.topics[i], o = overlay.topics[s.id];
  console.log(`-- [${i}] EN name: ${s.name}`);
  console.log(`       ES name: ${o ? o.name : 'FALTA'}`);
  console.log(`       ES desc: ${o ? (o.description || '').slice(0, 160) : ''}`);
}
const d0 = source.dependencies[700];
console.log(`-- arista 700 EN reason: ${d0.reason}`);
console.log(`              ES reason: ${(overlay.dependencies[edgeKey(d0)] || {}).reason || 'FALTA'}`);
if (Array.isArray(cArr) && cArr[0]) console.log('-- cluster[0] ES:', JSON.stringify(cArr[0]).slice(0, 300));
console.log('-- labels:', JSON.stringify(labelsDoc).slice(0, 300));
