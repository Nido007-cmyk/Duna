// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT (ver ../LICENSE).
// Backend en memoria: solo para las pruebas del runtime (test/).
export function createMemoryBackend() {
  const map = new Map();
  return {
    async read(key) { return map.has(key) ? map.get(key) : null; },
    async write(key, text) { map.set(key, text); },
    async remove(key) { map.delete(key); },
    async list() { return [...map.keys()]; },
  };
}
