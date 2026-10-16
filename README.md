# Ayush Singh — portfolio

Static site: plain HTML, CSS and vanilla JS. No framework, no build step. Works from `file://`.

## Run locally
Open `index.html` directly, or serve the folder:

    python3 -m http.server 8765

then visit http://localhost:8765.

## Layout
- `index.html`, `css/styles.css`
- `js/main.js` nav, reveals, count-ups; `trace.js`, `graph.js`, `strings.js` demos; `music.js` + `videos.js` (`window.VIDEOS = [{ id, title }]`) lite YouTube cards
- `assets/` images, logos, résumé (see `assets/MANIFEST.md`)

## Deploy
GitHub Pages from the repo root (`.nojekyll` included). All paths are relative because the site is served from `/ayush-portfolio/`.
