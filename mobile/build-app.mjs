#!/usr/bin/env node
// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT (ver ./LICENSE).
// Build de la app Android de Duna. Pasos, en orden, y la build FALLA si
// cualquiera falla:
//   1. Puerta Marble: el validador oficial de upstream valida la taxonomía
//      que se va a empaquetar (tools/marble/validate-gate.mjs).
//   2. Build original (build.mjs): genera tax.json, glossary.json, gen.js
//      y el bundle de vendor con sus licencias.
//   3. www/ = copia de public/ ya compilada.
//   4. El paquete de fábrica que la app siembra pasa el validador ORIGINAL
//      de paquetes (publish-lessons.mjs --dry-run): nada entra sin validar.
//   5. El runtime de Duna (runtime/boot.mjs + el worker original) se
//      empaqueta con esbuild en www/runtime.js, minificado.
//   6. La copia empaquetada NO pide nada a la red: se retira el <link> de
//      fuentes externas de Google Fonts (la app cae a las fuentes del
//      sistema, como ya hacía sin conexión) y se inyecta runtime.js.
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import * as esbuild from 'esbuild';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const WWW = path.join(HERE, 'www');
const run = (args, opts = {}) =>
  execFileSync(process.execPath, args, {stdio: 'inherit', ...opts});

console.log('— 1/6 puerta de validación Marble');
run([path.join(ROOT, 'tools', 'marble', 'validate-gate.mjs')], {cwd: ROOT});

console.log('— 2/6 build original (taxonomía, glosario, generadores, vendor)');
run([path.join(ROOT, 'build.mjs')], {cwd: ROOT});

console.log('— 3/6 www/ desde public/');
fs.rmSync(WWW, {recursive: true, force: true});
fs.cpSync(path.join(ROOT, 'public'), WWW, {recursive: true});

console.log('— 4/6 el paquete de fábrica pasa el validador original de paquetes');
{
  const tmpData = fs.mkdtempSync(path.join(os.tmpdir(), 'duna-validate-pack-'));
  try {
    run(
      [path.join(ROOT, 'publish-lessons.mjs'), path.join(ROOT, 'packs', 'examples', 'example-quest.json'), '--dry-run'],
      {cwd: ROOT, env: {...process.env, STORAGE: 'file', DATA_DIR: tmpData}}
    );
  } finally {
    fs.rmSync(tmpData, {recursive: true, force: true});
  }
}

console.log('— 5/6 runtime de Duna → www/runtime.js');
await esbuild.build({
  entryPoints: [path.join(HERE, 'runtime', 'boot.mjs')],
  bundle: true,
  format: 'esm',
  platform: 'browser',
  target: 'es2020',
  minify: true,
  outfile: path.join(WWW, 'runtime.js'),
  logLevel: 'info',
});

console.log('— 6/6 copia sin dependencias de red + inyección del runtime');
{
  const indexPath = path.join(WWW, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = html.replace(/<link[^>]*fonts\.googleapis[^>]*>\s*/g, '');
  if (!html.includes('</head>')) throw new Error('www/index.html sin </head>: no se puede inyectar el runtime');
  html = html.replace('</head>', '<script type="module" src="/runtime.js"></script></head>');
  fs.writeFileSync(indexPath, html);
}

const size = (p) => fs.statSync(p).size;
let total = 0;
for (const f of fs.readdirSync(WWW, {recursive: true})) {
  const p = path.join(WWW, String(f));
  if (fs.existsSync(p) && fs.statSync(p).isFile()) total += fs.statSync(p).size;
}
console.log(
  `✓ www listo: ${(total / 1024).toFixed(0)} KB en total · tax.json ${(size(path.join(WWW, 'tax.json')) / 1024).toFixed(0)} KB · runtime.js ${(size(path.join(WWW, 'runtime.js')) / 1024).toFixed(0)} KB`
);
