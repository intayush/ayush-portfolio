# Asset manifest

## Images
| Path | Source | Notes |
|---|---|---|
| img/portrait-800.webp | /Users/ayushsingh/spikes/display-picture.jpg | 800x800, greyscale, cwebp q78 (~66KB) |
| img/portrait-1600.webp | same | 1600x1600, q78 (~321KB) |
| img/portrait-800.jpg | same | 800x800, Pillow q80 progressive (fallback) |
| img/og.jpg | generated (Pillow) | 1200x630; Georgia + Helvetica Neue, vermilion bar |

## Résumé
| resume/Ayush-Singh-Resume.pdf | /tmp/resume_v2/Ayush Singh Resume v2.pdf | 2 pages (pdfinfo) |

## Tech logos (logos/tech/<slug>.svg)
All from Simple Icons via https://cdn.jsdelivr.net/npm/simple-icons@latest/icons/<slug>.svg, with `fill="#EDEDE9"` added and `<title>` removed, except:
- restate.svg: from https://restate.dev/byoc-assets/restate-logo-small.svg, recoloured to #EDEDE9 (no opacity).
- kuzu.svg: SKIPPED. Not in Simple Icons. The only official mark found (GitHub avatar of kuzudb, 145px JPEG) is an abstract set of slivers that is unreadable at 20px; site should use a text label.

Slugs delivered: anthropic, langchain, nodedotjs, nestjs, spring, python, restate, apachekafka, rabbitmq, redis, postgresql, mongodb, typescript, javascript, react, nextdotjs, jest, keycloak, docker, kubernetes, helm, grafana.

## Company logos (logos/company/<slug>.svg), recoloured to #EDEDE9
| File | Source | Notes |
|---|---|---|
| thoughtworks.svg | https://www.thoughtworks.com/etc.clientlibs/thoughtworks/clientlibs/clientlib-site/resources/images/thoughtworks-logo.svg | Official header SVG, viewBox 408.81x65.49 (wide wordmark incl. slash) |
| newgen.svg | https://newgensoft.com/wp-content/uploads/2026/05/logo-white.svg | Official white header SVG; orange mark recoloured; wide, 140x36 |
| safe-security.svg | inline header SVG on https://safe.security/ | Square mark + SAFE wordmark, viewBox 152x40 |
| greyamp.svg | https://www.greyamp.com/greyamp-logo.png (132x134 raster) | Only a raster exists; converted to alpha-only off-white PNG wrapped in SVG. Spiral mark only (no wordmark). Includes the logo's faint golden-ratio box; slightly soft at larger sizes. |
