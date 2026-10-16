/* music.js — lite YouTube cards from window.VIDEOS (tolerates it being undefined) */
(function () {
  'use strict';
  var host = document.getElementById('videos');
  var list = window.VIDEOS;
  if (!host || !Array.isArray(list) || !list.length) return;

  var shortsRow = null;
  list.forEach(function (v) {
    if (!v || !v.id) return;
    var title = v.title || 'Video';
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'video video-card' + (v.short ? ' video--short' : ''); b.setAttribute('aria-label', 'Play video: ' + title);
    var f = document.createElement('span'); f.className = 'video__frame';
    var img = document.createElement('img');
    img.src = 'https://i.ytimg.com/vi/' + encodeURIComponent(v.id) + '/hqdefault.jpg'; img.alt = ''; img.loading = 'lazy'; img.width = 480; img.height = 360;
    var pl = document.createElement('span'); pl.className = 'video__play'; pl.setAttribute('aria-hidden', 'true');
    f.appendChild(img); f.appendChild(pl);
    var t = document.createElement('span'); t.className = 'video__title'; t.textContent = title;
    b.appendChild(f); b.appendChild(t);
    b.addEventListener('click', function () {
      var ifr = document.createElement('iframe');
      ifr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(v.id) + '?autoplay=1';
      ifr.title = title; ifr.allow = 'autoplay; encrypted-media; picture-in-picture'; ifr.allowFullscreen = true;
      f.innerHTML = ''; f.appendChild(ifr);
      var d = document.createElement('div'); d.className = 'video video-card video-card--playing' + (v.short ? ' video--short' : '');
      d.appendChild(f); d.appendChild(t); b.replaceWith(d);
    });
    if (v.short) {
      if (!shortsRow) { shortsRow = document.createElement('div'); shortsRow.className = 'videos__shorts'; }
      shortsRow.appendChild(b);
    } else host.appendChild(b);
  });
  if (shortsRow) host.appendChild(shortsRow);
})();
