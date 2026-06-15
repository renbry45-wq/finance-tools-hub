// FinanceToolsHub — Pre-Deploy SEO Validation Gate
// Run: node scripts/seo-validate.cjs
// Installed as: .git/hooks/pre-push (not committed — local only)
//
// 10 checks:
//  1. No future publishedDate in articles.json
//  2. No duplicate slugs in articles.json
//  3. Every slug has a matching .njk file
//  4. Every article .njk has all required frontmatter fields
//  5. No heroImage field unless file exists in src/assets/
//  6. FAQ keys are q/a not question/answer
//  7. Internal calculator links use valid slugs
//  8. layout field is exactly "layouts/article.njk"
//  9. GA4 measurement ID G-Y8BZLBG7V5 present in site.json + base.njk
// 10. Title length ≤ 70 chars total (Bing limit; warning only — does not block push)
// 11. No circular redirects or 301/302→.html rules in src/static/_redirects (Cloudflare Pretty-URLs)

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Paths ────────────────────────────────────────────────────────────────────
const ROOT = path.join(__dirname, '..');
const ARTICLES_JSON = path.join(ROOT, 'src/_data/articles.json');
const CALCULATORS_JSON = path.join(ROOT, 'src/_data/calculators.json');
const SITE_JSON = path.join(ROOT, 'src/_data/site.json');
const BASE_NJK = path.join(ROOT, 'src/_includes/layouts/base.njk');
const ARTICLES_DIR = path.join(ROOT, 'src/articles');
const ASSETS_DIR = path.join(ROOT, 'src/assets');

// ─── Required fields in .njk frontmatter ─────────────────────────────────────
// Note: h1, publishedDate, lastUpdated, readingMinutes, workflowKey,
// primaryCalculatorKey, relatedCalculatorKeys, tags are in articles.json
// (validated via Checks 1–3). author is hardcoded in base.njk schema.
const REQUIRED_NJK_FIELDS = [
  'layout',
  'title',
  'description',
  'slug',
  'permalink',
  'canonical',
  'lead',
  'articleHeadline',
  'articleDatePublished',
  'articleDateModified',
  'articleKeywords',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Parse YAML frontmatter between first and second --- delimiters.
 * Returns { fields: {key: value}, rawLines: string[] } or null if not found.
 * Multiline blocks (body: |) are detected and key is marked present.
 * Arrays (faqs:, articleKeywords:) are detected and key is marked present.
 */
function parseFrontmatter(content) {
  const lines = content.split('\n');
  let start = -1;
  let end = -1;

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === '---') {
      if (start === -1) {
        start = i;
      } else {
        end = i;
        break;
      }
    }
  }

  if (start === -1 || end === -1) return null;

  const fmLines = lines.slice(start + 1, end);
  const fields = {};

  let i = 0;
  while (i < fmLines.length) {
    const line = fmLines[i];
    // Match top-level YAML key (no leading whitespace)
    const m = line.match(/^([a-zA-Z][a-zA-Z0-9_]*):\s*(.*)/);
    if (m) {
      const key = m[1];
      const val = m[2].trim();

      if (val === '|' || val === '>') {
        // Multiline block scalar — key is present
        fields[key] = '__multiline__';
      } else if (val === '') {
        // Possible array or nested object — scan for indented continuation
        let j = i + 1;
        while (j < fmLines.length && /^\s/.test(fmLines[j])) {
          j++;
        }
        fields[key] = j > i + 1 ? '__array_or_object__' : '';
      } else {
        // Strip surrounding quotes for value comparison
        fields[key] = val.replace(/^["']|["']$/g, '');
      }
    }
    i++;
  }

  return { fields, rawLines: fmLines };
}

/**
 * Extract the raw YAML lines belonging to the `faqs:` block.
 * Returns lines from after `faqs:` until the next top-level key.
 */
function extractFaqsBlock(rawLines) {
  let inFaqs = false;
  const block = [];
  for (const line of rawLines) {
    if (/^faqs:/.test(line)) {
      inFaqs = true;
      continue;
    }
    if (inFaqs) {
      // Top-level key = no leading whitespace, has a colon
      if (/^[a-zA-Z]/.test(line)) break;
      block.push(line);
    }
  }
  return block.join('\n');
}

/**
 * Today as YYYY-MM-DD (UTC).
 */
function todayISO() {
  const d = new Date();
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function relPath(p) {
  return path.relative(ROOT, p).replace(/\\/g, '/');
}

// ─── Load data ────────────────────────────────────────────────────────────────
const articles = JSON.parse(fs.readFileSync(ARTICLES_JSON, 'utf8'));
const calculators = JSON.parse(fs.readFileSync(CALCULATORS_JSON, 'utf8'));

// Exclude index.njk — that's the article listing page, not an individual article
const njkFiles = fs.readdirSync(ARTICLES_DIR)
  .filter(f => f.endsWith('.njk') && f !== 'index.njk')
  .sort()
  .map(f => path.join(ARTICLES_DIR, f));

// Valid calculator URLs: /slug.html
const validCalcUrls = new Set(calculators.map(c => `/${c.slug}.html`));

const today = todayISO();
const failures = [];

console.log('🔍 FinanceToolsHub SEO Validation');
console.log('──────────────────────────────────');

// ─── Check 1: No future publishedDate ────────────────────────────────────────
{
  let pass = true;
  for (const art of articles) {
    if (art.publishedDate && art.publishedDate > today) {
      failures.push(`[FAIL] Check 1: Future publishedDate: "${art.slug}" is dated ${art.publishedDate} (today: ${today})`);
      pass = false;
    }
  }
  if (pass) console.log(`✅ Check 1: No future publishedDates (${articles.length} articles checked)`);
}

// ─── Check 2: No duplicate slugs ─────────────────────────────────────────────
{
  let pass = true;
  const counts = {};
  for (const art of articles) {
    counts[art.slug] = (counts[art.slug] || 0) + 1;
  }
  for (const [slug, n] of Object.entries(counts)) {
    if (n > 1) {
      failures.push(`[FAIL] Check 2: Duplicate slug: "${slug}" appears ${n} times`);
      pass = false;
    }
  }
  if (pass) console.log('✅ Check 2: No duplicate slugs');
}

// ─── Check 3: Every slug has a matching .njk file ────────────────────────────
{
  let pass = true;
  for (const art of articles) {
    const expected = path.join(ARTICLES_DIR, `${art.slug}.njk`);
    if (!fs.existsSync(expected)) {
      failures.push(`[FAIL] Check 3: Missing .njk file for slug: "${art.slug}"`);
      pass = false;
    }
  }
  if (pass) console.log('✅ Check 3: All slugs have matching .njk files');
}

// ─── Check 4: Required frontmatter fields in every .njk ──────────────────────
{
  let pass = true;
  for (const njkPath of njkFiles) {
    const content = fs.readFileSync(njkPath, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed) {
      failures.push(`[FAIL] Check 4: Could not parse frontmatter in: ${relPath(njkPath)}`);
      pass = false;
      continue;
    }
    for (const field of REQUIRED_NJK_FIELDS) {
      const val = parsed.fields[field];
      if (val === undefined || val === '' || val === null) {
        failures.push(`[FAIL] Check 4: Missing required field "${field}" in: ${relPath(njkPath)}`);
        pass = false;
      }
    }
  }
  if (pass) console.log('✅ Check 4: All required frontmatter fields present');
}

// ─── Check 5: No heroImage field unless file exists ──────────────────────────
{
  let pass = true;
  for (const njkPath of njkFiles) {
    const content = fs.readFileSync(njkPath, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed || !parsed.fields.heroImage) continue;

    const imgPath = parsed.fields.heroImage;
    // heroImage values are typically "/images/articles/foo.jpg" — resolve relative to src/assets
    const fullPath = path.join(ASSETS_DIR, imgPath);
    if (!fs.existsSync(fullPath)) {
      failures.push(`[FAIL] Check 5: heroImage references missing file "${imgPath}" in: ${relPath(njkPath)}`);
      pass = false;
    }
  }
  if (pass) console.log('✅ Check 5: No missing heroImage files');
}

// ─── Check 6: FAQ keys are q/a not question/answer ───────────────────────────
{
  let pass = true;
  for (const njkPath of njkFiles) {
    const content = fs.readFileSync(njkPath, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed || !parsed.fields.faqs) continue;

    const faqsBlock = extractFaqsBlock(parsed.rawLines);
    // Check for wrong key names inside the faqs block
    if (/^\s+question\s*:/m.test(faqsBlock) || /^\s+answer\s*:/m.test(faqsBlock)) {
      failures.push(`[FAIL] Check 6: FAQ uses wrong keys (question/answer) in: ${relPath(njkPath)} — use q/a instead`);
      pass = false;
    }
  }
  if (pass) console.log('✅ Check 6: All FAQ entries use q/a keys');
}

// ─── Check 7: Internal calculator links use valid slugs ──────────────────────
{
  let pass = true;
  const hrefRe = /href="(\/[^"]+\.html)"/g;

  for (const njkPath of njkFiles) {
    const content = fs.readFileSync(njkPath, 'utf8');
    let m;
    hrefRe.lastIndex = 0;

    while ((m = hrefRe.exec(content)) !== null) {
      const url = m[1];

      // Skip links with a subdirectory (articles/, calculators/, etc.)
      // Root-level links have only one slash: /slug.html
      if (url.indexOf('/', 1) !== -1) continue;

      // Check against valid calculator URLs
      if (!validCalcUrls.has(url)) {
        const slug = url.slice(1, -5); // strip leading / and .html
        const suggestion = calculators.find(c =>
          c.slug.includes(slug) || slug.includes(c.key)
        );
        const hint = suggestion ? ` (valid slug is: ${suggestion.slug})` : '';
        failures.push(`[FAIL] Check 7: Broken internal link "${url}" in: ${relPath(njkPath)}${hint}`);
        pass = false;
      }
    }
  }
  if (pass) console.log('✅ Check 7: All internal calculator links valid');
}

// ─── Check 8: Layout is exactly "layouts/article.njk" ────────────────────────
{
  let pass = true;
  for (const njkPath of njkFiles) {
    const content = fs.readFileSync(njkPath, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed) continue;

    const layout = parsed.fields.layout;
    if (!layout) {
      failures.push(`[FAIL] Check 8: Missing layout field in: ${relPath(njkPath)}`);
      pass = false;
    } else if (layout !== 'layouts/article.njk') {
      failures.push(`[FAIL] Check 8: Wrong layout "${layout}" in: ${relPath(njkPath)} — must be "layouts/article.njk"`);
      pass = false;
    }
  }
  if (pass) console.log('✅ Check 8: All layouts correct');
}

// ─── Check 9: GA4 measurement ID present ─────────────────────────────────────
{
  const EXPECTED_GA_ID = 'G-Y8BZLBG7V5';
  let pass = true;

  const siteData = JSON.parse(fs.readFileSync(SITE_JSON, 'utf8'));
  if (siteData.gaId !== EXPECTED_GA_ID) {
    failures.push(`[FAIL] Check 9: GA4 measurement ID ${EXPECTED_GA_ID} not found in site.json (found: "${siteData.gaId || 'missing'}")`);
    pass = false;
  }

  const baseContent = fs.readFileSync(BASE_NJK, 'utf8');
  if (!baseContent.includes('site.gaId')) {
    failures.push(`[FAIL] Check 9: GA4 measurement ID ${EXPECTED_GA_ID} not found in base.njk — site.gaId reference missing`);
    pass = false;
  }

  if (pass) console.log(`✅ Check 9: GA4 ID G-Y8BZLBG7V5 present in base.njk`);
}

// ─── Check 10: Title length ≤ 70 chars (Bing limit; warning only) ────────────
{
  const MAX_LEN = 70;
  const warnings10 = [];

  for (const njkPath of njkFiles) {
    const content = fs.readFileSync(njkPath, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed || !parsed.fields.title) continue;

    const title = parsed.fields.title;
    if (title.length > MAX_LEN) {
      warnings10.push(`[WARN] Check 10: Title too long (${title.length} chars) in: ${relPath(njkPath)} — shorten to ≤${MAX_LEN} chars`);
    }
  }

  const EXTRA_PAGES = [
    path.join(ROOT, 'src/about.njk'),
    path.join(ROOT, 'src/methodology.njk'),
    path.join(ROOT, 'src/index.njk'),
  ];
  for (const njkPath of EXTRA_PAGES) {
    if (!fs.existsSync(njkPath)) continue;
    const content = fs.readFileSync(njkPath, 'utf8');
    const parsed = parseFrontmatter(content);
    if (!parsed || !parsed.fields.title) continue;

    const title = parsed.fields.title;
    if (title.length > MAX_LEN) {
      warnings10.push(`[WARN] Check 10: Title too long (${title.length} chars) in: ${relPath(njkPath)} — shorten to ≤${MAX_LEN} chars`);
    }
  }

  if (warnings10.length === 0) {
    console.log(`✅ Check 10: All titles within ${MAX_LEN} chars (Bing limit)`);
  } else {
    console.log(`⚠️  Check 10: ${warnings10.length} title(s) exceed ${MAX_LEN} chars (warnings only — push not blocked)`);
    for (const w of warnings10) {
      console.log(w);
    }
  }
}

// ─── Check 11: Redirect loop detection ───────────────────────────────────────
{
  const REDIRECTS_FILE = path.join(ROOT, 'src/static/_redirects');

  if (!fs.existsSync(REDIRECTS_FILE)) {
    console.log('[WARN] Check 11: src/static/_redirects not found — skip');
  } else {
    let pass = true;
    const lines = fs.readFileSync(REDIRECTS_FILE, 'utf8').split('\n');
    const rules = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const parts = trimmed.split(/\s+/);
      if (parts.length < 2) continue;
      const source = parts[0];
      const dest = parts[1];
      const status = parts[2] ? parseInt(parts[2], 10) : 301;
      rules.push({ source, dest, status, raw: trimmed });
    }

    // Build source→dest map for circular detection
    const destMap = new Map();
    for (const r of rules) {
      destMap.set(r.source, r.dest);
    }

    for (const r of rules) {
      // Type A: circular redirect (A→B and B→A)
      if (destMap.has(r.dest) && destMap.get(r.dest) === r.source) {
        failures.push(`[FAIL] Check 11: Circular redirect detected: ${r.source} → ${r.dest} → ${r.source}`);
        pass = false;
      }

      // Type B: 301/302 redirect pointing TO a .html URL (Cloudflare Pretty-URLs conflict)
      if ((r.status === 301 || r.status === 302) && r.dest.endsWith('.html')) {
        failures.push(`[FAIL] Check 11: Redirect to .html URL with 301/302 detected: "${r.raw}" — use 200 rewrite instead (Cloudflare Pretty-URLs conflict)`);
        pass = false;
      }
    }

    if (pass) {
      const n = rules.length;
      console.log(`✅ Check 11: No circular or Cloudflare-conflicting redirects found (${n} rule${n === 1 ? '' : 's'} checked)`);
    }
  }
}

// ─── Summary ─────────────────────────────────────────────────────────────────
console.log('──────────────────────────────────');

if (failures.length === 0) {
  console.log('✅ All checks passed. Safe to deploy.');
  process.exit(0);
} else {
  console.log(`❌ ${failures.length} check(s) failed — deployment blocked.\n`);
  for (const f of failures) {
    console.log(f);
  }
  console.log('\nFix the above issues before pushing to main.');
  process.exit(1);
}
