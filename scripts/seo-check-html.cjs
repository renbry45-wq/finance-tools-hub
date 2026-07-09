#!/usr/bin/env node
// scripts/seo-check-html.cjs
// HTML SEO validation (19-check standard) for FinanceToolsHub.
// Parses built HTML files from dist/ — run npm run build first.
// Complements seo-validate.cjs (which checks source files).
//
// Usage:
//   node scripts/seo-check-html.cjs                                  # all pages
//   node scripts/seo-check-html.cjs articles/compare-job-offers      # one page
//   node scripts/seo-check-html.cjs take-home-pay-calculator          # one page
//   node scripts/seo-check-html.cjs https://financetoolshub.net/...   # URL form

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT     = path.join(__dirname, '..');
const DIST     = path.join(ROOT, 'dist');
const BASE_URL = 'https://financetoolshub.net';
const MAX_TITLE = 70;   // Bing hard limit

// ─── HTML helpers (zero npm deps) ────────────────────────────────────────────

function getTitle(html) {
  const m = html.match(/<title>([^<]*)<\/title>/i);
  return m ? m[1].trim() : null;
}

function getCanonical(html) {
  const patterns = [
    /<link\s+rel=["']canonical["']\s+href=["']([^"']*)["'][^>]*>/i,
    /<link\s+href=["']([^"']*)["']\s+rel=["']canonical["'][^>]*>/i,
  ];
  for (const re of patterns) {
    const m = html.match(re); if (m) return m[1].trim();
  }
  return null;
}

function decodeHtml(str) {
  return str
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#8212;/g, '—')
    .replace(/&#8211;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, '’')
    .replace(/&lsquo;/g, '‘')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”');
}

function getMeta(html, nameOrProp) {
  const esc = nameOrProp.replace(':', '\\:').replace('.', '\\.');
  const patterns = [
    new RegExp(`<meta\\s+(?:name|property)=["']${esc}["']\\s+content=["']([^"']*)["'][^>]*/?>`, 'i'),
    new RegExp(`<meta\\s+content=["']([^"']*)["']\\s+(?:name|property)=["']${esc}["'][^>]*/?>`, 'i'),
  ];
  for (const re of patterns) {
    const m = html.match(re); if (m) return decodeHtml(m[1].trim());
  }
  return null;
}

function extractJsonLd(html) {
  const schemas = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    try { schemas.push(JSON.parse(m[1])); } catch (_) { /* skip malformed */ }
  }
  return schemas.flatMap(s => s['@graph'] ? s['@graph'] : [s]);
}

function countH1(html) {
  return (html.match(/<h1[\s>]/gi) || []).length;
}

function wordCount(html) {
  const bodyM = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  const raw = bodyM ? bodyM[1] : html;
  return raw
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ').trim()
    .split(/\s+/).filter(Boolean).length;
}

const AFFILIATE_RE = /href=["'][^"']*(?:amzn\.to|amazon\.[a-z]+\/.*?tag=|awin\.com|shareasale\.com|impact\.com|pepperjam\.com|cj\.com)[^"']*/i;

// Trust/index pages that don't have Article or WebApplication schemas (Check 8 n/a)
const TRUST_PATHS = new Set([
  'about.html', 'methodology.html', 'author-renato-bryant.html',
  'sitemap.html', 'articles/index.html', 'calculators/index.html',
]);

// ─── Validate one HTML file ───────────────────────────────────────────────────

function validatePage(filePath, relPath) {
  const html = fs.readFileSync(filePath, 'utf8');
  const fails = [];
  const warns = [];
  const F = (n, msg) => fails.push(`  [FAIL] Check ${String(n).padStart(2)}: ${msg}`);
  const W = (n, msg) => warns.push(`  [WARN] Check ${String(n).padStart(2)}: ${msg}`);

  // 1. <title> present and non-empty
  const title = getTitle(html);
  if (!title) {
    F(1, '<title> tag missing or empty');
  }

  // 2. Title length: 10–70 chars total (Bing max 70)
  if (title !== null) {
    if (title.length > MAX_TITLE) {
      F(2, `Title too long: ${title.length} chars (max ${MAX_TITLE}) — "${title}"`);
    } else if (title.length < 10) {
      F(2, `Title too short: ${title.length} chars (min 10) — "${title}"`);
    }
  }

  // 3. <meta name="description"> present and non-empty
  const desc = getMeta(html, 'description');
  if (!desc) {
    F(3, 'meta description missing or empty');
  }

  // 4. Meta description 50–155 chars
  if (desc !== null) {
    if (desc.length < 50)  F(4, `Meta description too short: ${desc.length} chars (min 50)`);
    if (desc.length > 155) F(4, `Meta description too long: ${desc.length} chars (max 155)`);
  }

  // 5. <link rel="canonical"> present and on-site
  const canonical = getCanonical(html);
  if (!canonical) {
    F(5, '<link rel="canonical"> missing');
  } else if (!canonical.startsWith(BASE_URL)) {
    F(5, `Canonical not on ${BASE_URL}: "${canonical}"`);
  }

  // 6. og:title present
  if (!getMeta(html, 'og:title')) F(6, 'og:title meta tag missing');

  // 7. og:description present
  if (!getMeta(html, 'og:description')) F(7, 'og:description meta tag missing');

  // 8. Content-level JSON-LD present (beyond site-wide WebSite schema)
  const schemas = extractJsonLd(html);
  const CONTENT_TYPES = new Set([
    'Article', 'BlogPosting', 'WebApplication', 'FAQPage',
    'HowTo', 'WebPage', 'Organization',
  ]);
  const hasContentSchema = schemas.some(s => CONTENT_TYPES.has(s['@type']));
  if (!hasContentSchema && !TRUST_PATHS.has(relPath)) {
    W(8, 'No content JSON-LD found (Article/WebApplication/FAQPage/etc.) — only WebSite schema present');
  }

  // Article schema (checks 9, 14, 15, 19 only apply when Article is present)
  const articleSchema = schemas.find(s => ['Article', 'BlogPosting'].includes(s['@type']));

  // 9. datePublished in Article JSON-LD
  if (articleSchema) {
    if (!articleSchema.datePublished) {
      F(9, 'Article JSON-LD: datePublished missing');
    } else if (!/^\d{4}-\d{2}-\d{2}/.test(articleSchema.datePublished)) {
      F(9, `Article JSON-LD: datePublished not ISO date: "${articleSchema.datePublished}"`);
    }
  }

  // 10. H1 exactly once (WARN — not FAIL, page structure may vary)
  const h1s = countH1(html);
  if (h1s === 0)  W(10, 'No <h1> tag found');
  if (h1s > 1)   W(10, `${h1s} <h1> tags found — expected exactly 1`);

  // 11–13. Affiliate link checks — vacuously pass on FTH (no affiliate programs)
  const hasAffiliate = AFFILIATE_RE.test(html);
  if (hasAffiliate) {
    // 11. Affiliate links need rel="sponsored"
    const unsponsoredRe = /href=["'][^"']*(?:amzn\.to|amazon\.|awin\.com|shareasale\.com)[^"']*["'](?![^>]*rel=["'][^"']*sponsored)/gi;
    const nUnspon = (html.match(unsponsoredRe) || []).length;
    if (nUnspon > 0) W(11, `${nUnspon} affiliate link(s) missing rel="sponsored"`);

    // 12. Awin mastertag required if Awin affiliate links present
    if (/awin\.com/i.test(html) && !/awin[0-9]*\.com\/cxd/i.test(html)) {
      F(12, 'Awin affiliate links detected but no Awin mastertag found');
    }

    // 13. FTC disclosure required if affiliate links present
    if (!/\b(?:disclosure|affiliate|compensation|sponsored|commission)\b/i.test(html)) {
      F(13, 'Affiliate links found but no FTC disclosure text detected');
    }
  }

  // 14. dateModified in Article JSON-LD
  if (articleSchema) {
    if (!articleSchema.dateModified) {
      F(14, 'Article JSON-LD: dateModified missing');
    } else if (!/^\d{4}-\d{2}-\d{2}/.test(articleSchema.dateModified)) {
      F(14, `Article JSON-LD: dateModified not ISO date: "${articleSchema.dateModified}"`);
    }
  }

  // 15. author present in Article JSON-LD
  if (articleSchema) {
    const author = articleSchema.author;
    if (!author) {
      F(15, 'Article JSON-LD: author missing');
    } else {
      const a = Array.isArray(author) ? author[0] : author;
      if (!a.name && !a.url) F(15, 'Article JSON-LD: author has neither name nor url');
    }
  }

  // 16. Word count ≥600 — only checked for article pages (Article JSON-LD present)
  if (articleSchema) {
    const wc = wordCount(html);
    if (wc < 600) W(16, `Word count ~${wc} — article pages should have ≥600 words`);
  }

  // 17. No noindex meta robots directive
  const robots = getMeta(html, 'robots');
  if (robots && /noindex/i.test(robots)) {
    F(17, `noindex directive found in robots meta: "${robots}"`);
  }

  // 18. At least 1 internal link (href="/..." or href="https://financetoolshub.net/...")
  const intLinks = (html.match(/href=["'](?:\/[^"'#?]|https?:\/\/financetoolshub\.net)/gi) || []).length;
  if (intLinks < 1) W(18, 'No internal links detected');

  // 19. publisher present in Article JSON-LD
  if (articleSchema) {
    const pub = articleSchema.publisher;
    if (!pub) {
      F(19, 'Article JSON-LD: publisher missing');
    } else {
      const p = Array.isArray(pub) ? pub[0] : pub;
      if (!p.name && !p.url) F(19, 'Article JSON-LD: publisher has neither name nor url');
    }
  }

  return { fails, warns };
}

// ─── File discovery ───────────────────────────────────────────────────────────

function allHtmlFiles(dir, base) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...allHtmlFiles(full, base));
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      results.push({ filePath: full, relPath: path.relative(base, full).replace(/\\/g, '/') });
    }
  }
  return results;
}

function resolveArg(arg) {
  // Accept: slug, relative path, or full URL
  const slug = arg.replace(/^https?:\/\/financetoolshub\.net\/?/, '').replace(/\/$/, '');
  const candidates = [
    path.join(DIST, slug.endsWith('.html') ? slug : slug + '.html'),
    path.join(DIST, slug),
  ];
  for (const c of candidates) {
    try {
      if (fs.statSync(c).isFile()) {
        return { filePath: c, relPath: path.relative(DIST, c).replace(/\\/g, '/') };
      }
    } catch (_) { /* not found */ }
  }
  return null;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

function main() {
  if (!fs.existsSync(DIST)) {
    console.error('❌  dist/ not found — run: npm run build');
    process.exit(1);
  }

  const arg  = process.argv[2];
  let pages;

  if (arg) {
    const target = resolveArg(arg);
    if (!target) {
      console.error(`❌  Not found in dist/: "${arg}"`);
      process.exit(1);
    }
    pages = [target];
  } else {
    pages = allHtmlFiles(DIST, DIST);
    console.log(`Checking ${pages.length} pages in dist/\n`);
  }

  let totalFails = 0;
  let totalWarns = 0;

  for (const { filePath, relPath } of pages) {
    const { fails, warns } = validatePage(filePath, relPath);
    const clean = fails.length === 0 && warns.length === 0;
    if (clean) {
      console.log(`✅ /${relPath}`);
    } else {
      console.log(`\n📄 /${relPath}`);
      for (const f of fails)  console.log(f);
      for (const w of warns)  console.log(w);
    }
    totalFails += fails.length;
    totalWarns += warns.length;
  }

  console.log('\n' + '─'.repeat(52));
  console.log(`Pages: ${pages.length}  |  Fails: ${totalFails}  |  Warns: ${totalWarns}`);

  if (totalFails > 0) {
    console.log('\n❌  seo:check-html FAILED');
    process.exit(1);
  } else if (totalWarns > 0) {
    console.log('\n⚠️   seo:check-html passed with warnings');
  } else {
    console.log('\n✅  seo:check-html all clear');
  }
}

main();
