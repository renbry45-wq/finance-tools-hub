# Finance Tools Hub

Static site for [financetoolshub.net](https://financetoolshub.net), built with Eleventy (11ty). Source lives in `src/`, build output in `dist/`.

---

## What this is

A multi-page static site of free financial calculators (take-home pay, mortgage overpayment, retirement savings, digital nomad tools, and more), three trust pages (About / Methodology / Author), and a homepage hub. The site is calculator-led, SEO-focused, and designed for educational planning — not personalized financial advice.

The build produces plain HTML/CSS/JS deployable to any static host (Cloudflare Pages, Netlify, GitHub Pages, S3+CloudFront). No server runtime, no database, no client-side router.

---

## Quick reference

| Task                            | Command                          |
| ------------------------------- | -------------------------------- |
| Install once after cloning      | `npm install`                    |
| Build the site to `dist/`       | `npm run build`                  |
| Build + watch (rebuild on save) | `npm run watch`                  |
| Local dev server with reload    | `npm run serve`                  |
| Wipe the build output           | `npm run clean`                  |

After `npm run build`, commit the changes (including `dist/`) and push. Cloudflare Pages serves from `dist/`.

---

## How the structure works

```
src/
├── _data/
│   ├── site.json          ← site name, base URL, GA ID, author
│   ├── nav.json           ← every nav link, footer link list
│   └── calculators.json   ← catalog of all 11 calculators
├── _includes/
│   ├── layouts/
│   │   ├── base.njk         ← html/head/scripts/header/footer wrapper
│   │   ├── calculator.njk   ← hero + calc UI + body + author trust box
│   │   └── trust.njk        ← hero + trust body (about/methodology/author)
│   └── partials/
│       ├── header-nav.njk          ← desktop sticky + mobile horizontal nav
│       ├── footer.njk              ← rich 3-col footer (homepage + calculators)
│       ├── footer-slim.njk         ← slim footer (trust pages)
│       ├── related-calculators.njk ← row of 3 related-tool links
│       └── trust-cta.njk           ← (reserved, currently unused)
├── assets/
│   ├── css/site.css       ← shared styles, extracted from per-page <style>
│   └── js/site.js         ← shared share/PDF/email/SW helpers
├── static/                ← passthrough copies (favicon, icons, manifest, sw.js, robots.txt)
├── calculators/           ← one .njk per calculator (11 files)
├── index.njk              ← homepage
├── about.njk              ← About page
├── methodology.njk        ← Methodology page
├── author-renato-bryant.njk
└── sitemap.njk            ← auto-generated from calculators.json + trust pages

dist/                       ← BUILD OUTPUT (commit this; deploy this)
.eleventy.js                ← Eleventy config
package.json
README.md
```

### How layouts cascade

A page page.njk with `layout: layouts/calculator.njk` renders into `calculator.njk`'s body. `calculator.njk` itself has `layout: layouts/base.njk`, so its rendered content cascades up into `base.njk`'s `{{ content }}` slot. This means:

- A new calculator only describes the unique parts (hero, form, supporting copy, schema).
- Header, footer, GA, jsPDF loading, and JSON-LD are all handled centrally.
- A change to the nav, footer, or GA ID is one edit instead of fifteen.

### Where shared elements live

| Element                          | Owner file                                     |
| -------------------------------- | ---------------------------------------------- |
| Header nav (desktop + mobile)    | `_includes/partials/header-nav.njk`            |
| Rich footer                      | `_includes/partials/footer.njk`                |
| Slim footer (trust pages)        | `_includes/partials/footer-slim.njk`           |
| `<style>` block                  | `assets/css/site.css`                          |
| Share / PDF / email helpers      | `assets/js/site.js`                            |
| Service worker registration      | `assets/js/site.js` (top of file)              |
| GA tag and ID                    | `_includes/layouts/base.njk` (reads `site.json`) |
| Site-wide WebSite JSON-LD        | `_includes/layouts/base.njk`                   |
| Per-page JSON-LD                 | Frontmatter `schemaBlocks: [...]`              |
| Author trust box                 | `_includes/layouts/calculator.njk`             |
| Sitemap entries                  | `_data/calculators.json` + 3 trust pages       |
| Footer link lists                | `_data/nav.json` (`footerPopular`, `footerMore`) |

---

## How to update an existing calculator page

Open `src/calculators/<slug>.njk`. The frontmatter looks like this:

```yaml
---
layout: layouts/calculator.njk
title: "Take-Home Pay Calculator 2026 | ..."
description: "..."
canonical: "https://financetoolshub.net/take-home-pay-calculator.html"
permalink: /take-home-pay-calculator.html
activeKey: "take-home-pay"           # matches an entry in nav.json
needsPdf: true                        # loads jsPDF in <head>
relatedKeys: ["tax-bracket", "gig-tax-optimizer", "retirement-savings"]
hero:
  h1: "Take-Home Pay Calculator 2026"
  leadIn: "..."
  leadOut: "..."
  badges: ["Salary and hourly modes", "Net pay planning", "Educational estimate only"]
authorBoxText: "..."                  # optional, custom text for "Created by" box
schemaBlocks:
  - '{"@context":"https://schema.org", ...}'   # raw JSON-LD strings
calcBody: |                            # raw HTML for the form + result section
  <section class="...">
    ...
  </section>
bodyHtml: |                            # raw HTML for the supporting-copy sections
  <section ...>Why this tool matters in 2026</section>
  <section ...>What this calculator does</section>
  ...
calcScript: |                          # raw JS for the calculator logic
  function calculate() { ... }
---
```

Common edits:

- **Change the page title or description** → edit `title` / `description` in frontmatter.
- **Update the calculator logic** → edit the `calcScript` block.
- **Update the form fields or labels** → edit the `calcBody` block.
- **Update supporting copy / FAQ / scenarios** → edit the `bodyHtml` block.
- **Change the related-tools row at the top** → edit `relatedKeys`.
- **Update "last updated" date** → add `lastUpdated: "May 2026"` to frontmatter.

Run `npm run build` and the `dist/<slug>.html` file is regenerated. Commit and push.

---

## How to add a new calculator

1. **Add a catalog entry** in `src/_data/calculators.json`:
   ```json
   {
     "key": "roth-conversion",
     "slug": "roth-conversion-calculator",
     "label": "Roth Conversion",
     "fullName": "Roth Conversion Calculator",
     "category": "tax",
     "blurb": "Open the Roth conversion calculator to model 2026 conversion scenarios.",
     "blogTitle": "Should You Convert to a Roth in 2026?",
     "blogDate": "May 1, 2026",
     "blogExcerpt": "Compare lifetime tax outcomes of a traditional-to-Roth conversion."
   }
   ```

2. **Add a nav entry** in `src/_data/nav.json` under `primary` and (optionally) `footerMore`:
   ```json
   { "label": "Roth Conversion", "url": "/roth-conversion-calculator.html", "key": "roth-conversion" }
   ```

3. **Create the calculator file** `src/calculators/roth-conversion-calculator.njk` using an existing calculator (e.g. `take-home-pay-calculator.njk`) as a template. Set `activeKey: "roth-conversion"` to match the nav key.

4. **Run `npm run build`.** The featured-tools grid, blog cards, sitemap, and nav all update automatically.

That's it. No 15-file edit cascade.

---

## How to update site-wide elements

| You want to change…                  | Edit this file                                             |
| ------------------------------------ | ---------------------------------------------------------- |
| The header navigation links/order    | `src/_data/nav.json` (`primary`)                           |
| Footer "Popular Calculators" list    | `src/_data/nav.json` (`footerPopular`)                     |
| Footer "More Tools" list             | `src/_data/nav.json` (`footerMore`)                        |
| Site name, base URL, tagline         | `src/_data/site.json`                                      |
| Google Analytics ID                  | `src/_data/site.json` (`gaId`)                             |
| Site-wide disclaimer in footer       | `src/_data/site.json` (`disclaimer`)                       |
| The "last updated" default text      | `src/_data/site.json` (`lastUpdated`)                      |
| Shared `<style>` rules               | `src/assets/css/site.css`                                  |
| Share / PDF / email logic            | `src/assets/js/site.js`                                    |
| Header nav markup                    | `src/_includes/partials/header-nav.njk`                    |
| Rich footer markup                   | `src/_includes/partials/footer.njk`                        |
| Slim footer (trust pages) markup     | `src/_includes/partials/footer-slim.njk`                   |

After any of these, run `npm run build` and commit `dist/`.

---

## How to regenerate the deployable files

```bash
npm install            # only the first time
npm run clean          # optional, wipes dist/
npm run build          # rebuilds dist/ from src/
git add dist/ src/ ... # stage what changed
git commit -m "..."
git push               # Cloudflare Pages serves the new dist/
```

The build is fast — typically under one second for the full site.

---

## Cloudflare Pages deployment

This project is set up to commit `dist/` to the repo and have Cloudflare Pages serve it. In the Cloudflare Pages project settings:

- **Build command:** *(leave blank)*
- **Build output directory:** `dist`
- **Root directory:** `/`

If you'd rather have Cloudflare run the build, set:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 18 or newer (Eleventy 3.x requires it)

Either way works. The committed-`dist/` approach is simpler and avoids surprise build failures on push.

---

## What was preserved from the legacy site

- All 11 calculator URLs (`*.html` extensions kept — no SEO regressions).
- All 11 calculator JavaScript blocks (verbatim).
- All hero copy, supporting copy, FAQ, scenarios, sources sections.
- The "Created by Renato Bryant" trust box on every calculator (per-page custom text preserved).
- Per-page JSON-LD schema (SoftwareApplication, AboutPage, ProfilePage, etc.).
- PWA: `manifest.json`, `sw.js`, service-worker registration.
- Google Analytics (G-Y8BZLBG7V5).
- jsPDF-powered PDF export, email sharing (mailto:), and social-share buttons.
- The emerald/teal/slate visual language and `glass` / `card-shadow` styles.

## What changed

- Homepage canonical: `/index.html` → `/` (matches sitemap, fixes a small SEO inconsistency).
- Sitemap: now auto-generated from `_data/calculators.json` + the three trust pages.
- The boilerplate `<style>` block and the share/PDF/email/SW JS are now in `/assets/css/site.css` and `/assets/js/site.js` — cached cross-page, smaller HTML.
- Local href patterns (`foo.html`) normalized to absolute paths (`/foo.html`).
- jsPDF now only loads on calculator pages (where it's needed), not on homepage or trust pages.

---

## Development notes

- **Templating language:** Nunjucks (`.njk`). Reads like HTML with `{% ... %}` tags. Eleventy 3.x ships with it — no extra dependency.
- **Frontmatter:** YAML between `---` markers. Multi-line HTML uses YAML's `|` block scalar.
- **Layouts cascade:** A page → calculator/trust layout → base layout → final HTML. Each layer renders into the next layer's `{{ content }}`.
- **Tailwind:** loaded via CDN (matches the legacy site). If you want to compile Tailwind locally for production performance, that's a future enhancement.
- **No build pipeline beyond Eleventy.** No bundler, no PostCSS, no transform. The build is `eleventy` and that's it.

