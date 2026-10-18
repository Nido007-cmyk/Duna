// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT (ver ../LICENSE).
// Contenido de fábrica: el diseño original arranca vacío y espera a que el
// ciclo nocturno publique la primera misión; una app recién instalada no
// tendría misión que enseñar. Duna siembra la misión de ejemplo del propio
// repo (packs/examples/, CC BY-SA 4.0, validada en la build con el
// publish-lessons.mjs original) con la fecha de hoy, para que el bucle
// completo de misiones funcione desde el primer minuto y sin red.
// La siembra ocurre una sola vez (marca duna:seed:v1 en el propio almacén).
export const ptDate = (ms = Date.now()) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(ms));

export async function seedContent(KV, examplePack, now = Date.now()) {
  if (await KV.get('duna:seed:v1')) return false;
  const pack = JSON.parse(JSON.stringify(examplePack));
  pack.date = ptDate(now);
  await KV.put('lessons:' + pack.date, JSON.stringify(pack));
  await KV.put('duna:seed:v1', '1');
  return true;
}
