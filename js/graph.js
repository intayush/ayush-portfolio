/* graph.js — Thinker mini system graph (canvas, DPR-aware, pauses off-screen) */
(function () {
  'use strict';
  var cv = document.getElementById('graphCanvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var info = document.getElementById('graphInfo'), cap = document.getElementById('graphCap');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ACC = '#FF5A36', TXT = '#EDEDE9';

  var N = [ /* name, x, y (0..1) */
    ['web-app', .12, .52], ['api-gateway', .32, .5], ['proposal', .52, .3], ['rules-engine', .8, .18],
    ['payments', .76, .5], ['kyc', .5, .72], ['notifications', .86, .8], ['documents', .22, .84], ['audit', .66, .9]
  ].map(function (n, i) { return { id: i, name: n[0], x: n[1], y: n[2], ph: i * 1.7 }; });
  var E = [ /* from, to, kafka? */
    [0, 1, 0], [1, 2, 0], [1, 5, 0], [1, 7, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0],
    [2, 6, 1], [4, 6, 1], [2, 8, 1], [4, 8, 1], [7, 8, 1]
  ];
  var CAPS = {
    draft: 'An LLM agent drafts the ticket analysis from the graph.',
    verify: 'A second pass checks every claim against code citations.',
    attack: 'An adversarial pass tries to break the conclusion.'
  };
  var pass = 'draft', sel = -1, w = 0, h = 0, dpr = 1, visible = false, raf = 0, t0 = performance.now();

  function size() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }
  function pos(n, t) {
    var a = reduce ? 0 : 1;
    return [n.x * w + Math.sin(t / 1900 + n.ph) * 5 * a, n.y * h + Math.cos(t / 2300 + n.ph) * 5 * a];
  }
  function near(i) { /* set of neighbours of node i */
    var s = {}; s[i] = 1;
    E.forEach(function (e) { if (e[0] === i) s[e[1]] = 1; if (e[1] === i) s[e[0]] = 1; });
    return s;
  }

  function draw(now) {
    var t = now - t0, P = N.map(function (n) { return pos(n, t); }), nb = sel >= 0 ? near(sel) : null;
    ctx.clearRect(0, 0, w, h);
    ctx.lineWidth = 1.3;
    E.forEach(function (e) {
      var a = P[e[0]], b = P[e[1]], on = !nb || (nb[e[0]] && nb[e[1]] && (e[0] === sel || e[1] === sel));
      ctx.globalAlpha = on ? (e[2] ? .95 : .55) : .1;
      ctx.strokeStyle = e[2] ? ACC : TXT;
      ctx.setLineDash(e[2] ? [5, 5] : []);
      ctx.lineDashOffset = e[2] && !reduce ? -t / 60 : 0;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    });
    ctx.setLineDash([]);
    ctx.font = '500 10px "JetBrains Mono", ui-monospace, monospace'; ctx.textAlign = 'center';
    N.forEach(function (n, i) {
      var p = P[i], on = !nb || nb[i], sl = i === sel, r = sl ? 8 : 6;
      ctx.globalAlpha = on ? 1 : .22;
      /* pass overlays */
      if (pass === 'verify') { ctx.strokeStyle = TXT; ctx.globalAlpha = on ? .6 : .15; ctx.beginPath(); ctx.arc(p[0], p[1], r + 5, 0, 6.283); ctx.stroke(); ctx.globalAlpha = on ? 1 : .22; }
      if (pass === 'attack' && (i === 3 || i === 4)) {
        var k = reduce ? .5 : (Math.sin(t / 350) + 1) / 2;
        ctx.strokeStyle = ACC; ctx.globalAlpha = (.3 + k * .6) * (on ? 1 : .3); ctx.beginPath(); ctx.arc(p[0], p[1], r + 4 + k * 5, 0, 6.283); ctx.stroke(); ctx.globalAlpha = on ? 1 : .22;
      }
      ctx.fillStyle = sl ? ACC : (on ? TXT : TXT);
      ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 6.283); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = '#141416'; ctx.lineJoin = 'round'; ctx.strokeText(n.name, p[0], p[1] + r + 14);
      ctx.fillStyle = sl ? ACC : TXT; ctx.fillText(n.name, p[0], p[1] + r + 14); ctx.lineWidth = 1.3;
    });
    ctx.globalAlpha = 1;
  }

  function loop(now) { raf = 0; if (!visible || document.hidden) return; draw(now); raf = requestAnimationFrame(loop); }
  function run() { if (!raf && !reduce && visible && !document.hidden) raf = requestAnimationFrame(loop); }

  function hit(ev) {
    var r = cv.getBoundingClientRect(), x = ev.clientX - r.left, y = ev.clientY - r.top, best = -1, bd = 34 * 34, t = performance.now() - t0;
    N.forEach(function (n, i) { var p = pos(n, t), d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function select(i) {
    sel = i;
    if (i < 0) info.textContent = 'Tap a node';
    else {
      var all = E.filter(function (e) { return e[0] === i || e[1] === i; });
      var k = all.filter(function (e) { return e[2]; }).length, l = all.length - k, parts = [N[i].name];
      if (l) parts.push(l + ' link' + (l === 1 ? '' : 's'));
      if (k) parts.push(k + ' topic' + (k === 1 ? '' : 's'));
      info.textContent = parts.join(' · ');
    }
    if (reduce || !raf) draw(performance.now());
  }
  cv.addEventListener('click', function (e) { var i = hit(e); select(i === sel ? -1 : i); });
  cv.addEventListener('pointermove', function (e) { if (e.pointerType === 'mouse') { var i = hit(e); if (i !== sel) select(i); } });
  cv.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') select(-1); });

  [].forEach.call(document.querySelectorAll('.graph__chips button'), function (b) {
    b.addEventListener('click', function () {
      pass = b.dataset.pass; cap.textContent = CAPS[pass];
      [].forEach.call(b.parentNode.children, function (c) { var on = c === b; c.classList.toggle('is-on', on); c.setAttribute('aria-pressed', on); });
      if (reduce || !raf) draw(performance.now());
    });
  });

  if ('ResizeObserver' in window) new ResizeObserver(size).observe(cv); else window.addEventListener('resize', size);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) run(); }, { rootMargin: '80px' }).observe(cv);
  } else visible = true;
  document.addEventListener('visibilitychange', run);
  size();
})();
