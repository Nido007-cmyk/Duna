// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT (ver ../LICENSE).
// Almacén local de Duna con la MISMA interfaz y semántica que el diseño
// original espera de Workers KV / server/file-kv.mjs:
//   get(key) -> string|null · get(key, 'json') -> objeto|null
//   put(key, value) · delete(key) · list({prefix}) -> {keys, list_complete, cursor}
// El backend decide dónde viven los bytes (archivos en el dispositivo,
// localStorage en un navegador de desarrollo, memoria en las pruebas).
// Las operaciones se serializan en una cadena: el worker hace
// lectura-modificación-escritura del progreso, igual que el servidor Node
// serializa sus peticiones; aquí la garantía vive en el propio almacén.
//
// ESPACIO DE NOMBRES POR PERFIL (decisión de la investigación 2026-10-18):
// las familias comparten tableta, así que el almacén nace particionado por
// perfil aunque la pantalla de perfiles llegue en la fase siguiente. Cada
// perfil vive bajo el prefijo `perfil/<id>/` y la partición es invisible
// para el worker: sus claves entran y salen sin prefijo. Cambiar de perfil
// mañana = construir otro KV con otro id sobre el mismo backend, sin
// migrar datos de nadie. El perfil por defecto es «default».
export function createKV(backend, profileId = 'default') {
  const ns = `perfil/${profileId}/`;
  let chain = Promise.resolve();
  const run = (fn) => {
    const p = chain.then(fn, fn);
    chain = p.then(() => {}, () => {});
    return p;
  };
  return {
    profileId,
    get(key, type) {
      return run(async () => {
        const v = await backend.read(ns + key);
        if (v == null) return null;
        return type === 'json' ? JSON.parse(v) : v;
      });
    },
    put(key, value) {
      return run(() => backend.write(ns + key, String(value)));
    },
    delete(key) {
      return run(() => backend.remove(ns + key));
    },
    list({prefix = ''} = {}) {
      return run(async () => {
        const names = await backend.list();
        return {
          keys: names
            .filter((n) => n.startsWith(ns + prefix))
            .map((name) => ({name: name.slice(ns.length)}))
            .sort((a, b) => (a.name < b.name ? -1 : 1)),
          list_complete: true,
          cursor: '',
        };
      });
    },
  };
}
