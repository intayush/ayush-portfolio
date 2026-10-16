/* strings.js — six guitar strings; pointer/touch crossing plucks them. Optional Karplus-Strong sound. */
(function () {
  'use strict';
  var cv = document.getElementById('stringsCanvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var WARM = '242,184,128';
  var LABELS = ['e', 'B', 'G', 'D', 'A', 'E'];          /* top -> bottom */
  var FREQ = [329.63, 246.94, 196.0, 146.83, 110.0, 82.41];
  var GAUGE = [1, 1.4, 1.9, 2.6, 3.2, 4];
  var S = LABELS.map(function () { return { amp: 0, t: 0, px: 0.5, dir: 1 }; });
  var w = 0, h = 0, dpr = 1, x0 = 44, raf = 0, last = null, visible = true;

  function ys(i) { return 22 + i * ((h - 44) / 5); }

  function size() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2); w = r.width; h = r.height;
    x0 = w < 600 ? 34 : 56;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw(performance.now());
  }

  function draw(now) {
    ctx.clearRect(0, 0, w, h);
    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace'; ctx.textBaseline = 'middle';
    for (var i = 0; i < 6; i++) {
      var s = S[i], y = ys(i), el = (now - s.t) / 1000;
      var d = s.amp * Math.exp(-el * 5.2) * Math.cos(el * 2 * Math.PI * (7 + i * 1.5)) * s.dir;
      var glow = Math.max(0, Math.min(1, s.amp * Math.exp(-el * 4) / 10));
      if (Math.abs(d) < .05 && glow < .02) d = 0;
      ctx.fillStyle = 'rgba(' + WARM + ',' + (.55 + glow * .45) + ')';
      ctx.fillText(LABELS[i], Math.max(12, x0 - 26), y);
      ctx.lineWidth = GAUGE[i];
      ctx.strokeStyle = 'rgba(' + (glow > .02 ? WARM : '237,237,233') + ',' + (.28 + glow * .72) + ')';
      if (glow > .05) { ctx.shadowColor = 'rgba(' + WARM + ',.9)'; ctx.shadowBlur = 14 * glow; }
      ctx.beginPath(); ctx.moveTo(x0, y);
      if (d) {
        var px = x0 + s.px * (w - x0), span = w - x0;
        for (var k = 1; k <= 48; k++) {
          var x = x0 + span * k / 48, f = x < px ? (x - x0) / (px - x0) : (w - x) / (w - px);
          ctx.lineTo(x, y + d * Math.sin(f * Math.PI / 2));
        }
      } else ctx.lineTo(w, y);
      ctx.stroke(); ctx.shadowBlur = 0;
    }
  }

  function active(now) { return S.some(function (s) { return s.amp * Math.exp(-(now - s.t) / 1000 * 4) > .05; }); }
  function loop(now) { raf = 0; draw(now); if (visible && active(now)) raf = requestAnimationFrame(loop); }
  function kick() { if (!raf && !reduce) raf = requestAnimationFrame(loop); }

  function pluck(i, x, speed) {
    var s = S[i];
    s.amp = Math.max(4, Math.min(14, speed * .5 + 4)); s.t = performance.now();
    s.px = Math.max(.1, Math.min(.9, (x - x0) / (w - x0))); s.dir = Math.random() < .5 ? -1 : 1;
    kick(); sound(i);
  }

  /* pointer: crossing a string between two moves plucks it; touch tap plucks nearest */
  var prev = null;
  function local(e) { var r = cv.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  function cross(a, b) {
    for (var i = 0; i < 6; i++) {
      var y = ys(i);
      if ((a.y - y) * (b.y - y) < 0 || (a.y !== b.y && (b.y === y))) { pluck(i, b.x, Math.abs(b.y - a.y)); }
    }
  }
  cv.addEventListener('pointerdown', function (e) {
    var p = local(e); prev = p;
    if (e.pointerType !== 'mouse') {
      var best = -1, bd = 24;
      for (var i = 0; i < 6; i++) { var d = Math.abs(ys(i) - p.y); if (d < bd) { bd = d; best = i; } }
      if (best >= 0 && p.x > x0 - 10) pluck(best, p.x, 6);
    }
  });
  cv.addEventListener('pointermove', function (e) {
    var p = local(e);
    if (prev && p.x > x0 - 10 && (e.pointerType === 'mouse' || e.buttons || e.pressure)) cross(prev, p);
    else if (e.pointerType === 'mouse' && prev && p.x > x0 - 10) cross(prev, p);
    prev = p;
  });
  cv.addEventListener('pointerleave', function () { prev = null; });
  cv.addEventListener('pointerup', function () { prev = null; });
  cv.addEventListener('pointercancel', function () { prev = null; });

  /* optional sound: AudioContext created only after the user turns it on */
  var btn = document.getElementById('soundBtn'), ac = null, on = false, cache = {};
  function buffer(i) {
    if (cache[i]) return cache[i];
    var sr = ac.sampleRate, n = Math.round(sr / FREQ[i]), len = Math.floor(sr * 1.8), b = ac.createBuffer(1, len, sr), d = b.getChannelData(0);
    for (var k = 0; k < n; k++) d[k] = Math.random() * 2 - 1;
    for (k = n; k < len; k++) d[k] = .5 * (d[k - n] + d[k - n + 1]) * .997;
    return (cache[i] = b);
  }
  function sound(i) {
    if (!on || !ac) return;
    var src = ac.createBufferSource(), g = ac.createGain();
    src.buffer = buffer(i); g.gain.value = .35; src.connect(g); g.connect(ac.destination); src.start();
  }
  if (btn) btn.addEventListener('click', function () {
    on = !on;
    if (on && !ac) { var AC = window.AudioContext || window.webkitAudioContext; if (AC) ac = new AC(); else on = false; }
    if (on && ac && ac.state === 'suspended') ac.resume();
    btn.setAttribute('aria-pressed', on); btn.textContent = '♪ sound: ' + (on ? 'on' : 'off');
    if (on) sound(4);
  });

  if ('ResizeObserver' in window) new ResizeObserver(size).observe(cv); else window.addEventListener('resize', size);
  size();

  /* one gentle visual ripple the first time the strings scroll into view */
  if ('IntersectionObserver' in window) {
    var once = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible && !reduce && once.done !== true) {
        once.done = true;
        for (var i = 0; i < 6; i++) (function (i) { setTimeout(function () { var s = S[i]; s.amp = 5; s.t = performance.now(); s.px = .35 + i * .06; s.dir = 1; kick(); }, 150 + i * 120); })(i);
      }
      if (visible) kick();
    }, { threshold: 0.4 });
    once.observe(cv);
  }
})();
