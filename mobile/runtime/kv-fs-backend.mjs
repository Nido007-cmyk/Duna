// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT (ver ../LICENSE).
// Backend principal en el dispositivo: un archivo JSON por clave dentro del
// almacenamiento propio de la app (Directory.Data de Capacitor), con el MISMO
// esquema de nombres que server/file-kv.mjs (clave percent-encoded, '.' como
// %2E, sufijo .json): el almacén en el teléfono se puede inspeccionar con las
// mismas ideas que el del servidor Node.
import {Filesystem, Directory, Encoding} from '@capacitor/filesystem';

const DIR = 'duna-kv';
const enc = (key) => encodeURIComponent(key).replace(/\./g, '%2E') + '.json';
const dec = (name) => decodeURIComponent(name.slice(0, -'.json'.length).replace(/%2E/gi, '.'));

export function createFilesystemBackend() {
  let dirReady = null;
  const ensure = () =>
    (dirReady ??= Filesystem.mkdir({path: DIR, directory: Directory.Data, recursive: true}).catch(() => {}));
  return {
    async read(key) {
      await ensure();
      try {
        const r = await Filesystem.readFile({
          path: `${DIR}/${enc(key)}`,
          directory: Directory.Data,
          encoding: Encoding.UTF8,
        });
        return typeof r.data === 'string' ? r.data : null;
      } catch {
        return null;
      }
    },
    async write(key, text) {
      await ensure();
      await Filesystem.writeFile({
        path: `${DIR}/${enc(key)}`,
        data: text,
        directory: Directory.Data,
        encoding: Encoding.UTF8,
      });
    },
    async remove(key) {
      try {
        await Filesystem.deleteFile({path: `${DIR}/${enc(key)}`, directory: Directory.Data});
      } catch {}
    },
    async list() {
      await ensure();
      try {
        const r = await Filesystem.readdir({path: DIR, directory: Directory.Data});
        return (r.files || [])
          .map((f) => (typeof f === 'string' ? f : f.name))
          .filter((n) => n.endsWith('.json'))
          .map(dec);
      } catch {
        return [];
      }
    },
  };
}
