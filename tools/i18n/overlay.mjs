// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT.
// Andamiaje i18n de Duna: NUESTRA versión del patrón que la segunda
// barrida del ecosistema Marble encontró bien resuelto en la comunidad
// (overlay por id + manifiesto con hashes + validadores + contrato QA).
// Aquí no hay ni una palabra traducida de ningún fork: las dos bases en
// español que existen (es-419 y es-MX) son candidatas a ahorrar el
// ARRANQUE de la fase en español, jamás la revisión, y ninguna entra en
// la app sin nuestra revisión bilingüe completa (ver README.md).
//
// Formato del overlay (nuestro): un directorio por locale con
//   topics.json        { "<topicId>": {"name": "...", "description": "..."} }
//   dependencies.json  { "<prerequisiteId>-><topicId>": {"reason": "..."} }
//   manifest.json      lo escribe buildManifest(); no se edita a mano
// El overlay nunca toca el grafo: solo aporta texto por id. La fuente de
// verdad de los ids es data/marble (topics.json / dependencies.json).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export const edgeKey = (d) => `${d.prerequisiteId}->${d.topicId}`;
export const sha256 = (buf) => crypto.createHash('sha256').update(buf).digest('hex');

export function loadSource(root) {
  const topicsDoc = JSON.parse(fs.readFileSync(path.join(root, 'data/marble/topics.json'), 'utf8'));
  const depsDoc = JSON.parse(fs.readFileSync(path.join(root, 'data/marble/dependencies.json'), 'utf8'));
  return {
    topics: topicsDoc.topics,
    dependencies: depsDoc.dependencies,
    topicById: new Map(topicsDoc.topics.map((t) => [t.id, t])),
    edgeKeys: new Set(depsDoc.dependencies.map(edgeKey)),
  };
}

export function loadOverlay(dir) {
  const read = (name) => {
    const p = path.join(dir, name);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
  };
  return {topics: read('topics.json'), dependencies: read('dependencies.json')};
}

const blank = (s) => typeof s !== 'string' || s.trim() === '';
const padded = (s) => typeof s === 'string' && s !== s.trim();

// Contrato QA (parte estructural; la revisión lingüística es humana y
// queda registrada en el manifiesto antes de que importable sea true):
//  1. Todo id del overlay existe en la fuente; ningún id inventado.
//  2. Si se exige completo, todo id de la fuente tiene su texto.
//  3. Ningún texto vacío, en blanco o con espacios en los bordes.
//  4. Los ejemplos de la materia English se quedan en inglés: es trabajo
//     de la revisión humana, no de este validador; aquí solo se avisa
//     cuando un nombre queda idéntico a la fuente (puede ser legítimo:
//     nombres propios; por eso es aviso y no error).
export function validateOverlay(source, overlay, {requireComplete = true} = {}) {
  const errors = [];
  const warnings = [];
  for (const [id, v] of Object.entries(overlay.topics)) {
    const src = source.topicById.get(id);
    if (!src) { errors.push(`topics: id desconocido ${id}`); continue; }
    if (blank(v.name)) errors.push(`topics ${id}: name vacío`);
    if (blank(v.description)) errors.push(`topics ${id}: description vacía`);
    if (padded(v.name) || padded(v.description)) errors.push(`topics ${id}: espacios en los bordes`);
    if (v.name === src.name) warnings.push(`topics ${id}: name idéntico a la fuente (¿sin traducir?)`);
  }
  for (const [key, v] of Object.entries(overlay.dependencies)) {
    if (!source.edgeKeys.has(key)) { errors.push(`dependencies: arista desconocida ${key}`); continue; }
    if (blank(v.reason)) errors.push(`dependencies ${key}: reason vacío`);
    if (padded(v.reason)) errors.push(`dependencies ${key}: espacios en los bordes`);
  }
  if (requireComplete) {
    for (const t of source.topics)
      if (!(t.id in overlay.topics)) errors.push(`topics: falta ${t.id}`);
    for (const d of source.dependencies)
      if (!(edgeKey(d) in overlay.dependencies)) errors.push(`dependencies: falta ${edgeKey(d)}`);
  }
  return {ok: errors.length === 0, errors, warnings};
}

// El manifiesto ata el overlay a UNA fuente exacta (hashes de los
// archivos de data/marble) y declara método y estado de revisión.
// importable nace false y solo puede pasar a true con revisión humana
// registrada: es la lección del es-MX (DRAFT_ONLY, publicación bloqueada
// por su propio autor) convertida en regla de la casa.
export function buildManifest(root, dir, overlay, {locale, method, reviewStatus = 'draft', reviewedBy = null} = {}) {
  const fileInfo = (name, obj) => {
    const p = path.join(dir, name);
    const bytes = fs.existsSync(p) ? fs.readFileSync(p) : Buffer.from('');
    return {sha256: sha256(bytes), entries: Object.keys(obj).length};
  };
  return {
    locale,
    method,
    review: {status: reviewStatus, by: reviewedBy},
    importable: reviewStatus === 'reviewed' && !!reviewedBy,
    source: {
      topicsSha256: sha256(fs.readFileSync(path.join(root, 'data/marble/topics.json'))),
      dependenciesSha256: sha256(fs.readFileSync(path.join(root, 'data/marble/dependencies.json'))),
    },
    files: {
      'topics.json': fileInfo('topics.json', overlay.topics),
      'dependencies.json': fileInfo('dependencies.json', overlay.dependencies),
    },
  };
}

// CLI: node overlay.mjs validate <dirDelOverlay> [--parcial]
//      node overlay.mjs manifest <dirDelOverlay> <locale> <método>
if (import.meta.url === `file://${process.argv[1]}`) {
  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
  const [cmd, dir, ...rest] = process.argv.slice(2);
  const source = loadSource(root);
  const overlay = loadOverlay(dir);
  if (cmd === 'validate') {
    const r = validateOverlay(source, overlay, {requireComplete: !rest.includes('--parcial')});
    for (const w of r.warnings) console.log('aviso:', w);
    for (const e of r.errors) console.log('ERROR:', e);
    console.log(r.ok ? `✓ overlay válido (${Object.keys(overlay.topics).length} temas, ${Object.keys(overlay.dependencies).length} aristas)` : `✗ overlay inválido: ${r.errors.length} errores`);
    process.exit(r.ok ? 0 : 1);
  }
  if (cmd === 'manifest') {
    const m = buildManifest(root, dir, overlay, {locale: rest[0], method: rest.slice(1).join(' ') || 'no declarado'});
    fs.writeFileSync(path.join(dir, 'manifest.json'), JSON.stringify(m, null, 2) + '\n');
    console.log('manifest.json escrito; importable =', m.importable);
  }
}
