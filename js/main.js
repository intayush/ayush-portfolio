/* main.js — nav, mobile menu, scroll reveals, count-ups, copy-email, year */
(function () {
  'use strict';
  var doc = document;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* year */
  var y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* nav: solid background after scroll */
  var nav = $('#nav');
  function onScroll() { nav.classList.toggle('is-scrolled', window.scrollY > 24); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  /* mobile menu: full-screen overlay, focus trap, Esc closes, scroll lock */
  var btn = $('#menuBtn'), menu = $('#menu');
  function setMenu(open) {
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', open);
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    doc.body.classList.toggle('is-locked', open);
    if (open) { var f = $('a', menu); f && f.focus(); } else { btn.focus(); }
  }
  btn.addEventListener('click', function () { setMenu(menu.hidden); });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); doc.body.classList.remove('is-locked'); }
  });
  doc.addEventListener('keydown', function (e) {
    if (menu.hidden) return;
    if (e.key === 'Escape') { setMenu(false); return; }
    if (e.key === 'Tab') { /* trap focus between toggle and menu links */
      var items = [btn].concat($$('a', menu));
      var i = items.indexOf(doc.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
      else if (!e.shiftKey && i === items.length - 1) { e.preventDefault(); items[0].focus(); }
    }
  });
  window.matchMedia('(min-width: 900px)').addEventListener && window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) {
    if (m.matches && !menu.hidden) { menu.hidden = true; btn.setAttribute('aria-expanded', 'false'); doc.body.classList.remove('is-locked'); }
  });

  /* active section link */
  if ('IntersectionObserver' in window) {
    var links = {};
    $$('.nav__links a[href^="#"]').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting && links[e.target.id]) {
          Object.keys(links).forEach(function (k) { links[k].classList.toggle('is-active', k === e.target.id); });
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) { var s = doc.getElementById(id); s && so.observe(s); });
  }

  /* scroll reveal (staggered by sibling index) */
  var reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduce) {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    var ro = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); ro.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (el) {
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', Math.min(sib, 6) * 0.07 + 's');
      ro.observe(el);
    });
  }

  /* count-ups */
  var nums = $$('[data-count]');
  function fmt(el, v) { el.textContent = (el.dataset.prefix || '') + v + (el.dataset.suffix || ''); }
  if ('IntersectionObserver' in window && !reduce) {
    var co = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        co.unobserve(e.target);
        var el = e.target, end = +el.dataset.count, t0 = performance.now(), dur = 1100;
        (function tick(t) {
          var p = Math.min(1, (t - t0) / dur), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
          fmt(el, v);
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { fmt(el, 0); co.observe(el); });
  }

  /* copy email */
  var cb = $('#copyBtn');
  if (cb) cb.addEventListener('click', function () {
    var done = function () { cb.textContent = 'Copied'; cb.classList.add('is-done'); setTimeout(function () { cb.textContent = 'Copy'; cb.classList.remove('is-done'); }, 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cb.dataset.email).then(done, function () {});
    else { var r = doc.createRange(); r.selectNodeContents($('.mail')); var s = getSelection(); s.removeAllRanges(); s.addRange(r); try { doc.execCommand('copy'); done(); } catch (_) {} }
  });
})();
