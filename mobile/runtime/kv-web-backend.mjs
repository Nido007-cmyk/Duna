// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT (ver ../LICENSE).
// Backend de reserva para desarrollo en un navegador de escritorio (sin
// Capacitor): localStorage. En el dispositivo manda kv-fs-backend.mjs.
const PREFIX = 'duna-kv:';
export function createWebBackend(storage = globalThis.localStorage) {
  return {
    async read(key) {
      try { return storage.getItem(PREFIX + key); } catch { return null; }
    },
    async write(key, text) {
      storage.setItem(PREFIX + key, text);
    },
    async remove(key) {
      try { storage.removeItem(PREFIX + key); } catch {}
    },
    async list() {
      const out = [];
      try {
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k && k.startsWith(PREFIX)) out.push(k.slice(PREFIX.length));
        }
      } catch {}
      return out;
    },
  };
}
