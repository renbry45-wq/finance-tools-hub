# FinanceToolsHub.net — CLAUDE.md
# Permanent rules for all Claude Code sessions on this repo

## Stack
- Eleventy 3.1.5 static site generator (Nunjucks templates)
- Tailwind via Play CDN only — no PostCSS, no local Tailwind build
- No npm dependencies beyond @11ty/eleventy
- Cloudflare Pages deployment — auto-deploys on push to main
- Node 22, build command: npm run build, output: dist/

## Pre-deploy gate (mandatory)
Run before EVERY push — no exceptions:

```
npm run build      # must show 30+ files, 0 errors
npm run seo:validate  # must show 12/12 checks pass, 0 warnings
```

The pre-push git hook runs seo:validate automatically.
If it fails, the push is blocked. Fix the issue before retrying.

## What the validator checks (12 checks)
1. No future publishedDate in articles
2. No duplicate slugs
3. Every slug has a matching .njk file
4. All required frontmatter fields present
5. No heroImage referencing missing files
6. FAQ keys are q/a (not question/answer)
7. Internal calculator links use valid slugs
8. Layout field is layouts/article.njk
9. GA4 measurement ID G-Y8BZLBG7V5 present in base.njk
10. All page titles ≤70 chars total (Bing limit)
11. No circular redirects or Cloudflare Pretty-URLs conflicts in _redirects
12. No native npm packages (canvas, sharp, node-gyp etc) in package.json

## SEO / GEO / EEAT — PERMANENT RULES (added Jun 25 2026)

### NEVER do these without explicit approval:
- Change or add redirect rules in src/_redirects
  (Cloudflare Pretty-URLs strips .html — always use 200 rewrites,
  never 301/302 pointing to .html URLs — Check 11 enforces this)
- Modify meta tag implementation in base.njk
- Add, remove, or restructure URL routes or permalinks
- Change sitemap generation logic (auto-updates via articles loop)
- Remove or alter structured data (JSON-LD schemas)
- Add noindex to any page
- Change canonical tag logic
- Modify or remove the GA4 tag (ID: G-Y8BZLBG7V5)
- Add native npm packages to package.json
  (Cloudflare Pages runs npm ci — lock file must stay in sync)
  (Check 12 blocks: canvas, sharp, node-gyp, bcrypt, sqlite3, etc.)
- Change the Tailwind setup (Play CDN only — no PostCSS, no build step)

### ALWAYS do these before deploying:
- Run npm run build + npm run seo:validate (12/12, 0 warnings)
- Verify new articles have today's date or earlier as publishedDate
  (future dates cause Bing to skip indexing — Check 1 blocks this)
- Verify any new article .njk uses layout: layouts/article.njk
  (not article.njk — Check 8 blocks wrong layout)
- Verify all new article titles are ≤52 chars base
  (adds 18-char suffix = ≤70 total — Check 10 warns on violation)
- Verify internal links use correct calculator slugs
  (e.g. break-even-savings-calculator not break-even-savings — Check 7)
- Confirm Cloudflare Pages deploy is green after push

### GEO (Generative Engine Optimization) rules:
- Every calculator page must have: WebApplication JSON-LD schema + FAQPage
- Every article page must have: Article JSON-LD schema + FAQPage
- Homepage has: Organization + WebSite schema
- Author entity: Renato Bryant, Panama City — must appear in Article schema
- No AI-generated content published without human review
- Internal linking must be intentional — never remove existing internal links
- Every page must have a unique, descriptive title (enforced by Check 10)

### EEAT (Experience, Expertise, Authoritativeness, Trustworthiness):
- All articles must have: author (Renato Bryant), publishedDate, lastUpdated
- No dateless or authorless content
- Calculator descriptions must be accurate — no thin/copied descriptions
- Voice: direct, plain English, educational not advisory, appropriately hedged
- No specific dollar thresholds that go stale annually
- No country-specific tax rules with exact numbers — hedge with "typically",
  "check with your local tax authority", "may vary"
- Trust pages (about, methodology, author) must remain live and linked

### Bing WMT specific:
- New pages must be submitted to IndexNow within 24h of deploy
  (Cloudflare Crawler Hints handles this automatically on deploy)
- Bing WMT IndexNow key file: /e6f1bb9f54094705b1096031c59edc33.txt
  (committed to repo, served at site root)
- Never block Bingbot in robots.txt
- 2 Bing crawl errors were persistent — resolved Jun 15 2026 via date
  fixes and _redirects correction. Monitor Bing WMT weekly.

### GSC specific:
- If impressions drop >20% week-over-week, investigate before next deploy
- sitemap lastmod updates automatically via Eleventy build
- Each page must have a unique <title> — Check 10 enforces this
- All 30 page URLs submitted to GSC — resubmit when new pages are added

### Known recurring errors (all now blocked by validator):
- Future publishedDate → Bing skips indexing (Check 1)
- Wrong FAQ keys question/answer → schema fails (Check 6)
- Wrong layout path → article renders broken (Check 8)
- Native npm packages → Cloudflare build fails (Check 12)
- 301 to .html URL → redirect loop with Cloudflare Pretty-URLs (Check 11)
- Titles >70 chars → Bing truncates in SERPs (Check 10)

## Article frontmatter required fields
layout, title, description, slug, permalink, canonical, publishedDate,
articleDatePublished, articleDateModified, lastUpdated, author, h1,
articleHeadline, lead, readingMinutes, workflowKey, primaryCalculatorKey,
relatedCalculatorKeys, tags, articleKeywords, faqs, body

## Key file locations
- Templates: src/_includes/layouts/
- Articles: src/articles/
- Calculators: src/*.njk (root level)
- Data: src/_data/ (articles.json, calculators.json, workflows.json)
- Validator: scripts/seo-validate.cjs
- og:image generator (one-time): scripts/generate-og-image.js
- Static assets: src/assets/ (passthrough copied to dist/)
- Redirects: src/_redirects
- IndexNow key: src/e6f1bb9f54094705b1096031c59edc33.txt

## Cloudflare Pages notes
- Pretty URLs is ENABLED — Cloudflare strips .html from all URLs
- Never use 301/302 redirects to .html destinations (creates loops)
- Always use 200 rewrites in _redirects for non-html → html mappings
- Build environment: Node 22, npm ci (requires lock file in sync)
- Auto-deploys on push to main branch

## Site structure (as of Jun 25 2026)
- 12 calculators
- 11 articles
- 7 trust/core pages (homepage, about, methodology, author, articles index,
  calculators index, sitemap)
- 30 total pages
- og:image: src/assets/images/og-default.png (1200×630px)
- www redirect: Cloudflare CNAME + redirect rule (active)
- IndexNow: Cloudflare Crawler Hints + Bing WMT key file
