// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT (ver ../LICENSE).
// Sustituto del binding ASSETS de Cloudflare dentro de la app: el worker pide
// los estáticos (empezando por tax.json) con URLs de assets.local; aquí se
// resuelven contra el origen local que Capacitor sirve desde www/.
// Nada sale a la red: el origen es el propio paquete de la app.
export function createAssets(nativeFetch) {
  return {
    async fetch(input) {
      const raw = typeof input === 'string' ? input : input.url;
      const u = new URL(raw, 'https://assets.local');
      return nativeFetch(u.pathname + u.search);
    },
  };
}
