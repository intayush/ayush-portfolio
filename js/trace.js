/* trace.js — plays the "investigation trace" when it scrolls into view */
(function () {
  'use strict';
  var root = document.getElementById('trace');
  if (!root) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rows = [].slice.call(root.querySelectorAll('.trace__log li'));
  var pipe = [].slice.call(root.querySelectorAll('.trace__pipe li'));
  var timers = [], played = false;

  function clear() { timers.forEach(clearTimeout); timers = []; }
  function later(fn, ms) { timers.push(setTimeout(fn, ms)); }

  function showAll() {
    clear();
    rows.forEach(function (r) { r.classList.remove('is-pending', 'is-running'); r.querySelector('.g').textContent = r.classList.contains('is-gate') ? '›' : '✓'; });
    pipe.forEach(function (p) { p.classList.add('is-lit'); });
  }
  function reset() {
    clear();
    rows.forEach(function (r) { r.classList.add('is-pending'); r.classList.remove('is-running'); r.querySelector('.m').dataset.full = r.querySelector('.m').dataset.full || ''; });
    pipe.forEach(function (p) { p.classList.remove('is-lit'); });
  }

  /* type a row's message character-by-character */
  function type(row, done) {
    var m = row.querySelector('.m'), cur = m.querySelector('.cursor');
    var node = null;
    for (var i = 0; i < m.childNodes.length; i++) if (m.childNodes[i].nodeType === 3) { node = m.childNodes[i]; break; }
    if (!node) return done();
    var full = row.__full || (row.__full = node.nodeValue), n = 0;
    node.nodeValue = '';
    (function step() {
      n += 2; node.nodeValue = full.slice(0, n);
      if (n < full.length) later(step, 16); else { node.nodeValue = full; done(); }
    })();
    if (cur) cur.style.visibility = 'visible';
  }

  function play() {
    if (reduce) { showAll(); return; }
    reset();
    var i = 0;
    (function next() {
      if (i >= rows.length) return;
      var row = rows[i], key = row.dataset.step, last = i === rows.length - 1;
      row.classList.remove('is-pending'); row.classList.add('is-running');
      var g = row.querySelector('.g'); g.textContent = '›';
      pipe.forEach(function (p) { if (p.dataset.n === key) p.classList.add('is-lit'); });
      i++;
      type(row, function () {
        row.classList.remove('is-running');
        if (!last) g.textContent = '✓';
        later(next, 330);
      });
    })();
  }

  var btn = document.getElementById('traceReplay');
  if (btn) btn.addEventListener('click', function () { played = true; play(); });

  if (reduce || !('IntersectionObserver' in window)) { showAll(); return; }
  /* start hidden only once JS is sure it can play */
  reset();
  var io = new IntersectionObserver(function (es) {
    if (es[0].isIntersecting && !played) { played = true; io.disconnect(); play(); }
  }, { threshold: 0.35 });
  io.observe(root);
})();
