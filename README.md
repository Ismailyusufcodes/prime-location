# Prime Location

**Live site:** https://ismailyusufcodes.github.io/prime-location/

A single-page marketing site for **Prime Location**, a Lagos real-estate company.
Built as a static site — plain HTML, CSS and JavaScript with no build step — so it
can be hosted for free on GitHub Pages and opened on any phone, tablet or desktop.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Main site (hero, properties, neighbourhoods, about, news, contact) |
| `credits.html` | Photo credits and licences (noindex) |
| `assets/css/style.css` | All styling, responsive breakpoints and animation |
| `assets/js/main.js` | Navigation, reveals, sliders and scroll interactions |
| `assets/img/` | Locally hosted, optimised photography |
| `assets/fonts/` | Self-hosted General Sans and Playfair Display |

## Run locally

Because the site uses no build tools, you can open `index.html` directly. For the
most accurate result, serve the folder over HTTP:

```bash
python -m http.server 8000
```

Then visit <http://localhost:8000>.

## Deploying

The site is published with **GitHub Pages** from the `main` branch root. Every push
to `main` redeploys automatically. No Jekyll processing is used (`.nojekyll`).

## Notes

- All images and fonts are self-hosted; the page has no third-party runtime dependencies.
- Photography is credited in `credits.html` and licensed under the licences listed there.
- The 12 MB screenshot and 19 MB screen recording in the original working folder are
  development references only and are ignored by Git.
