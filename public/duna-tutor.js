// Duna · creación propia. © 2026 Nido007-cmyk. Licencia MIT.
// La tutora VIVA: máquina de estados sobre el SVG por capas de
// public/tutora-duna.svg (investigación 2026-10-18, apartado 4).
// - Capas: respiración (#t-all), parpadeo y mirada (#t-eyes), ojos cerrados
//   (#t-eyes-closed), bocas por expresión y casco de batalla (#t-casco).
// - Movimiento con WAAPI y SOLO transform/opacity; resortes de la casa:
//   firme 520/30, suave 320/24, fiesta 380/15 (la vibración y el sonido los
//   pone fx.js en el mismo evento cuando celebra).
// - Se pausa con la app en segundo plano (visibilitychange) y se apaga con
//   movimiento reducido (prefers-reduced-motion o el ajuste de fx.js).
// - Sin este script, el avatar sigue siendo la imagen de saludo: nada se
//   rompe. Ella celebra y anima; jamás presiona ni se entristece.
(function () {
  'use strict';
  var EXPR = {
    saludo:    {eyes: 'open',   mouth: 't-mouth-saludo',  helmet: false},
    pensando:  {eyes: 'open',   mouth: 't-mouth-piensa',  helmet: false},
    celebrando:{eyes: 'closed', mouth: 't-mouth-celebra', helmet: false},
    animo:     {eyes: 'open',   mouth: 't-mouth-animo',   helmet: false},
    batalla:   {eyes: 'open',   mouth: 't-mouth-batalla', helmet: true},
    repaso:    {eyes: 'closed', mouth: 't-mouth-animo',   helmet: false},
  };
  var MOUTHS = ['t-mouth-saludo', 't-mouth-celebra', 't-mouth-piensa', 't-mouth-animo', 't-mouth-batalla'];
  var current = 'saludo';
  var root = null, eyes = null, timerBlink = null, timerGaze = null, breathe = null;

  function reduced() {
    try { return (window.FX && FX.reduced && FX.reduced()) || matchMedia('(prefers-reduced-motion: reduce)').matches; }
    catch (e) { return false; }
  }
  function $(id) { return root ? root.querySelector('#' + id) : null; }

  function setExpression(name) {
    if (!root || !EXPR[name]) return;
    var cfg = EXPR[name];
    current = name;
    var eo = $('t-eyes'), ec = $('t-eyes-closed'), helm = $('t-casco');
    if (eo) eo.style.display = cfg.eyes === 'open' ? '' : 'none';
    if (ec) ec.style.display = cfg.eyes === 'closed' ? '' : 'none';
    if (helm) helm.style.display = cfg.helmet ? '' : 'none';
    MOUTHS.forEach(function (m) { var el = $(m); if (el) el.style.display = m === cfg.mouth ? '' : 'none'; });
    if (!reduced()) {
      var all = $('t-all');
      if (all && all.animate) all.animate(
        [{transform: 'scale(1,1)'}, {transform: 'scale(1.03,0.94)'}, {transform: 'scale(1,1)'}],
        {duration: 240, easing: 'cubic-bezier(0.2, 0, 0, 1)'});
    }
  }

  function blink() {
    if (!eyes || document.hidden || reduced() || current === 'repaso' || EXPR[current].eyes !== 'open') return;
    eyes.animate(
      [{transform: 'scaleY(1)'}, {transform: 'scaleY(0.08)'}, {transform: 'scaleY(1)'}],
      {duration: 150, easing: 'cubic-bezier(0.2, 0, 0, 1)'});
  }
  function gaze() {
    if (!eyes || document.hidden || reduced() || EXPR[current].eyes !== 'open') return;
    var dx = (Math.random() * 4 - 2).toFixed(1), dy = current === 'pensando' ? -2 : (Math.random() * 2 - 1).toFixed(1);
    eyes.animate(
      [{transform: 'translate(0px,0px)'}, {transform: 'translate(' + dx + 'px,' + dy + 'px)'}, {transform: 'translate(0px,0px)'}],
      {duration: 900, easing: 'cubic-bezier(0.2, 0, 0, 1)'});
  }
  function startLife() {
    stopLife();
    if (reduced()) return;
    var all = $('t-all');
    if (all && all.animate) breathe = all.animate(
      [{transform: 'scale(1,1)'}, {transform: 'scale(1.012,1.02)'}],
      {duration: 1700, direction: 'alternate', iterations: Infinity, easing: 'ease-in-out'});
    timerBlink = setInterval(blink, 3400);
    timerGaze = setInterval(gaze, 5200);
  }
  function stopLife() {
    if (breathe) { breathe.cancel(); breathe = null; }
    if (timerBlink) clearInterval(timerBlink);
    if (timerGaze) clearInterval(timerGaze);
    timerBlink = timerGaze = null;
  }

  function stateFromCard() {
    var pc = document.getElementById('pcard');
    if (!pc) return 'saludo';
    if (pc.classList.contains('boss')) return 'batalla';
    if (pc.classList.contains('review')) return 'repaso';
    if (pc.classList.contains('busy')) return 'pensando';
    return 'saludo';
  }
  function watch() {
    var pc = document.getElementById('pcard');
    if (pc) new MutationObserver(function () { setExpression(stateFromCard()); })
      .observe(pc, {attributes: true, attributeFilter: ['class']});
    new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) for (var j = 0; j < muts[i].addedNodes.length; j++) {
        var n = muts[i].addedNodes[j];
        if (n.nodeType === 1 && (n.classList.contains('reveal') || n.classList.contains('banner'))) {
          setExpression('celebrando');
          setTimeout(function () { setExpression(stateFromCard()); }, 2400);
        }
      }
    }).observe(document.body, {childList: true});
    document.addEventListener('visibilitychange', function () { document.hidden ? stopLife() : startLife(); });
    // fx.js celebra y anima con sonido y vibración en el mismo evento:
    // la tutora se suma sin sustituir nada.
    if (window.FX) {
      if (FX.good) { var g = FX.good; FX.good = function () { setExpression('celebrando'); setTimeout(function () { setExpression(stateFromCard()); }, 1600); return g.apply(this, arguments); }; }
      if (FX.bad) { var b = FX.bad; FX.bad = function () { setExpression('animo'); setTimeout(function () { setExpression(stateFromCard()); }, 1600); return b.apply(this, arguments); }; }
    }
  }

  function init() {
    var avatar = document.querySelector('.avatar');
    var img = avatar && avatar.querySelector('img');
    if (!avatar || !img) return;
    fetch('/tutora-duna.svg').then(function (r) { return r.text(); }).then(function (svg) {
      var box = document.createElement('div');
      box.innerHTML = svg;
      root = box.querySelector('svg');
      if (!root) return;
      root.setAttribute('role', 'img');
      root.setAttribute('aria-label', 'Duna, your guide');
      root.style.width = '100%'; root.style.height = '100%'; root.style.display = 'block';
      avatar.replaceChild(root, img);
      avatar.classList.add('duna-live');
      eyes = $('t-eyes');
      setExpression('saludo');
      startLife();
      watch();
    }).catch(function () { /* sin máquina: queda la imagen de saludo */ });
  }

  window.DunaTutor = {set: setExpression, get: function () { return current; }};
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
