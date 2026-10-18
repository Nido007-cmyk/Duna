// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT.
// Botón «Escuchar»: lee la pregunta (y las opciones visibles) con la voz
// del PROPIO sistema (TTS de Android vía speechSynthesis). Sin archivos,
// sin red, sin datos: si el aparato no tiene voz, el botón no aparece
// (investigación 2026-10-18: lectura en voz alta, ADOPTAR).
(function () {
  'use strict';
  if (!('speechSynthesis' in window)) return;

  function questionText() {
    var q = document.getElementById('q');
    if (!q) return '';
    var text = (q.textContent || '').trim();
    var opts = [];
    document.querySelectorAll('#mc button, #f .choices button, .choices button').forEach(function (b) {
      var t = (b.textContent || '').trim();
      if (t) opts.push(t);
    });
    if (opts.length) text += '. ' + opts.join('. ');
    return text;
  }

  function speak() {
    var text = questionText();
    if (!text) return;
    try {
      speechSynthesis.cancel();
      var u = new SpeechSynthesisUtterance(text);
      u.lang = document.documentElement.lang || 'en-US';
      u.rate = 0.95;
      speechSynthesis.speak(u);
    } catch (e) { /* sin voz utilizable: el botón no estorba */ }
  }

  function init() {
    var pc = document.getElementById('pcard');
    if (!pc || document.getElementById('duna-listen')) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'duna-listen';
    btn.className = 'duna-listen';
    btn.setAttribute('aria-label', 'Escuchar la pregunta en voz alta');
    btn.innerHTML = '<img src="/icons/sound-on.svg" alt="" width="24" height="24"><span>Escuchar</span>';
    btn.addEventListener('click', speak);
    var frame = document.getElementById('frame');
    if (frame && frame.parentNode === pc) pc.insertBefore(btn, frame.nextSibling);
    else pc.insertBefore(btn, pc.firstChild);
    // Al cambiar de vista se calla: nadie deja una voz hablando sola.
    document.querySelectorAll('.tab').forEach(function (t) {
      t.addEventListener('click', function () { try { speechSynthesis.cancel(); } catch (e) {} });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
