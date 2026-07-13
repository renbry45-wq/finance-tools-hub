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

## SECURITY — SKILLSPECTOR MANDATORY SCAN (added Jun 25 2026)

### Before installing ANYTHING, run this scan first:
```bash
skillspector scan  --no-llm
```

This applies to ALL of the following without exception:
- GitHub repos (any language, any org, including NVIDIA/Anthropic/Google)
- npm packages being added to package.json
- pip packages being added to requirements.txt
- Claude skills or plugins
- MCP servers
- Browser extensions or automation tools
- Any third-party CLI tool

### Risk gate — STOP/GO decision:
| Score | Action |
|---|---|
| 0–49 | ✅ SAFE — proceed with install |
| 50–79 | ⚠️ REVIEW — read findings, flag to Renato before proceeding |
| 80–99 | 🔴 HIGH — stop, do not install, report full findings to Renato |
| 100 | ⛔ CRITICAL — do not install under any circumstances. Report immediately. |

### Real examples from this portfolio:
- Agent Reach (Panniantong/Agent-Reach): Score 100/100 CRITICAL — cancelled.
  Reason: prompt injection from scraped Reddit content into shell subprocess.
  Machine had Cloudflare secrets + Supabase keys at risk.
- caveman/compress: Score 100/100 CRITICAL — kept after review.
  Reason: all findings were false positives driven by legitimate design
  (memory compressor scans creds to redact them). curl-pipe finding
  never triggered (installed via plugin system, not install.sh).

### How to scan:
```bash
# Scan a GitHub repo before cloning or installing:
skillspector scan https://github.com/owner/repo --no-llm

# Scan an already-installed local skill or plugin:
skillspector scan ~/.claude/plugins/cache/pluginname --no-llm --recursive

# Scan a local directory:
skillspector scan ./path/to/skill --no-llm
```

### SkillSpector install info:
- Version: v2.3.7
- New laptop path: C:\Users\renbr\.local\bin\skillspector.exe (covers FTH)
- Installed via: uv tool install git+https://github.com/NVIDIA/SkillSpector.git
- To update: uv tool upgrade skillspector

### FTH-specific note:
FTH has no MCP servers, pip packages, or CLI tools. The primary scenario
where this rule fires is npm package installs — which Validator Check 12
already blocks (canvas, sharp, node-gyp, etc.). This rule provides an
additional human-review gate before Check 12 even runs.

### If SkillSpector is not available on this machine:
Do NOT proceed with any install. Tell Renato that SkillSpector needs
to be installed first before continuing. Never skip the scan.

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

## SEO/GEO Guardrails (2026-07-12 — never remove)

Rules from the July 12 portfolio-wide SEO/GEO remediation. Apply to every
repo in this portfolio. Never delete or weaken these rules.

### Rule 1 — Multi-UA crawler verification
Never gate SSR behind a bot-UA allowlist — render for all UAs. Any
SEO/SSR/routing change must be curl-tested with plain Mozilla, Googlebot,
GPTBot, ClaudeBot, PerplexityBot, and OAI-SearchBot.
PASS = all UAs return 200 AND visible body text varies <10% across UAs
AND content pages return ≥1,000 chars.
`scripts/crawler-check.mjs` automates this check.

### Rule 2 — Crawler-access check (three layers)
Blocks can live in Cloudflare's managed rules, the repo robots.txt, AND
app middleware — independently. Verify the LIVE robots.txt (not the repo
file; Cloudflare can mask it) has no Disallow for:
GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User,
PerplexityBot, Google-Extended.
AI crawlers are never "scrapers" — SEO-tool blocks (Ahrefs, Semrush, MJ12)
stay; retrieval bots don't. `crawler-check.mjs` checks the live file.

### Rule 3 — Money pages are SEO pages
Homepage, pricing, /audit, /search, signup landing pages must pass the same
SSR + schema + multi-UA checks as articles. No revenue-earning page may be
a CSR shell.

### Rule 4 — Redirect verification
Any redirect created or modified: curl -sI both variants (www/apex,
http/https) and assert the Location header is a valid absolute https URL
resolving to 200. (A one-character typo — ttps:// — silently killed FTH's
www variant. Check 11 now enforces redirect rules in _redirects.)

### Rule 5 — Sitemap integrity
Never hardcode exclusion lists. The sitemap builder must derive exclusions
from the same source of truth the 410/redirect handler uses. Every sitemap
URL must return 200 (429 = pass, rate limit ≠ dead).

### Rule 6 — Traffic-collapse = P0
Any GSC/Bing impressions drop >30% week-over-week gets diagnosed within
72h, before any feature work. Never Backlog.

### Rule 7 — EEAT baseline
/about must exist (200) with a real author identity and Person JSON-LD.
Article pages need Article schema + author + dateModified. Author is a
named person, never an organization wearing a Person type ("Editorial Team"
as a Person is schema misuse).

### Rule 8 — Siloed author (standing owner rule)
No sameAs to personal social profiles. No cross-links between portfolio
sites. Named author per site, no external profile links. Do not re-ask
for LinkedIn/social URLs.

### Rule 9 — Deploy verification before polling
This is a Cloudflare Pages site — there is no Railway deploy hash to check.
Confirm the Cloudflare Pages deploy is green in the dashboard BEFORE
polling. When verifying with curl, use a Googlebot or AI-bot UA — plain
curl may be Cloudflare-challenged. All polling loops hard-timeout at 10
minutes.

### Rule 10 — A gate that isn't wired is decoration
After adding any pre-push check, verify it actually runs on a real push.
`.git/hooks/pre-push` may be a stale copy installed at postinstall —
confirm the executing hook is current and invokes the new check. Same
principle for validators: a script that exists but isn't in the gate
protects nothing.

### Rule 11 — postinstall must be environment-safe
Build containers (Cloudflare Pages, Railway, Render, CI) have no `.git`
directory. Any postinstall that writes to `.git/hooks/` will fail with a
fatal error and abort `npm ci`, breaking every deploy. Guard it:
- Shell cp pattern: `[ -d .git/hooks ] && cp ... && chmod +x ... || exit 0`
- Node inline pattern: `if(!fs.existsSync('.git/hooks')){process.exit(0)}`
Must exit 0 (not 1) in container environments. The hook is irrelevant
there — the gate only matters for developer workstations.
FTH's postinstall was updated 2026-07-13 to include this guard.

## Site structure (as of Jun 25 2026)
- 12 calculators
- 11 articles
- 7 trust/core pages (homepage, about, methodology, author, articles index,
  calculators index, sitemap)
- 30 total pages
- og:image: src/assets/images/og-default.png (1200×630px)
- www redirect: Cloudflare CNAME + redirect rule (active)
- IndexNow: Cloudflare Crawler Hints + Bing WMT key file
