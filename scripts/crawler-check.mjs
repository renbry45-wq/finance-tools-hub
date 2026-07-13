#!/usr/bin/env node
// Crawler accessibility check — rules 1 & 2 of SEO/GEO Guardrails (2026-07-12)
// Run: node scripts/crawler-check.mjs
// Fails if any UA gets non-200 (429=pass), body variance >10%, content <1000 chars,
// or live robots.txt blocks an AI retrieval bot.

import { spawnSync } from 'child_process';
import { readFileSync, unlinkSync, existsSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const SITE = 'https://financetoolshub.net';
const CONTENT_PAGE = `${SITE}/articles/183-day-rule-remote-workers`;

const UAS = [
  { name: 'Mozilla',       ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36' },
  { name: 'Googlebot',     ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
  { name: 'GPTBot',        ua: 'GPTBot/1.0 (+https://openai.com/gptbot)' },
  { name: 'ClaudeBot',     ua: 'ClaudeBot/1.0 (+https://www.anthropic.com/claude-bot)' },
  { name: 'PerplexityBot', ua: 'PerplexityBot/1.0 (+https://perplexity.ai/bot)' },
  { name: 'OAI-SearchBot', ua: 'OAI-SearchBot/1.0 (+https://openai.com/searchbot)' },
];

const AI_CRAWLERS = [
  'GPTBot', 'OAI-SearchBot', 'ChatGPT-User',
  'ClaudeBot', 'Claude-User', 'PerplexityBot', 'Google-Extended',
];

let failures = 0;

// Single curl invocation: body → tmpFile, status → stdout.
// Using spawnSync (no shell) so %{http_code} is never interpreted by cmd.exe.
function fetchWithCurl(url, ua) {
  const nodeFile = join(tmpdir(), `fth-cc-${process.pid}-${Date.now()}.html`);
  const curlFile = nodeFile.replace(/\\/g, '/');
  const SEP = '---HTTPSTATUS---';

  const result = spawnSync(
    'curl',
    ['-sL', '--max-time', '30', '-A', ua, '-o', curlFile, '-w', `${SEP}%{http_code}`, url],
    { encoding: 'utf8' }
  );

  const out = result.stdout || '';
  const idx = out.lastIndexOf(SEP);
  const code = idx >= 0 ? parseInt(out.slice(idx + SEP.length).trim(), 10) : 0;
  const body = existsSync(nodeFile) ? readFileSync(nodeFile, 'utf8') : '';
  try { unlinkSync(nodeFile); } catch { /* ignore */ }
  return { status: isNaN(code) ? 0 : code, body };
}

function stripHtml(html) {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '')
             .replace(/<style[\s\S]*?<\/style>/gi, '')
             .replace(/<[^>]+>/g, ' ')
             .replace(/\s+/g, ' ')
             .trim();
}

function checkUrl(label, url, minChars) {
  console.log(`\nTesting ${label}: ${url}`);
  const collected = [];

  for (const { name, ua } of UAS) {
    const { status, body } = fetchWithCurl(url, ua);
    const text = stripHtml(body);
    collected.push({ name, status, len: text.length });

    const statusOk = status === 200 || status === 429;
    const sizeOk = status === 429 || minChars == null || text.length >= minChars;
    const ok = statusOk && sizeOk;
    console.log(`  ${ok ? '✓' : '✗'} ${name}: HTTP ${status || 'ERR'} (${text.length} chars)`);

    if (!statusOk) {
      console.log(`    [FAIL] Expected 200, got ${status || 'ERR'}`);
      failures++;
    } else if (status === 200 && !sizeOk) {
      console.log(`    [FAIL] Only ${text.length} chars — minimum is ${minChars}`);
      failures++;
    }
  }

  // Body variance across 200 responses only
  const live = collected.filter(r => r.status === 200);
  if (live.length > 1) {
    const lens = live.map(r => r.len);
    const max = Math.max(...lens);
    const min = Math.min(...lens);
    const variance = max > 0 ? (max - min) / max : 0;
    if (variance > 0.1) {
      console.log(`  [FAIL] Body varies ${(variance * 100).toFixed(1)}% across UAs (limit 10%)`);
      failures++;
    } else {
      console.log(`  ✓ Body variance: ${(variance * 100).toFixed(1)}% (within 10%)`);
    }
  }
}

function checkRobots() {
  console.log(`\nChecking live robots.txt: ${SITE}/robots.txt`);
  const { status, body } = fetchWithCurl(`${SITE}/robots.txt`, 'Mozilla/5.0');
  if (status !== 200) {
    console.log(`  [WARN] robots.txt returned HTTP ${status} — skipping AI-crawler check`);
    return;
  }

  // Parse into User-agent blocks
  const blocks = [];
  let agents = [];
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (/^user-agent:/i.test(line)) {
      agents.push(line.replace(/^user-agent:\s*/i, '').trim());
    } else if (/^disallow:/i.test(line)) {
      const path = line.replace(/^disallow:\s*/i, '').trim();
      if (path !== '') agents.forEach(a => blocks.push({ agent: a, disallow: path }));
    } else if (line === '') {
      agents = [];
    }
  }

  let robotsFail = false;
  for (const { agent, disallow } of blocks) {
    if (AI_CRAWLERS.some(ac => agent.toLowerCase() === ac.toLowerCase())) {
      console.log(`  [FAIL] robots.txt: "${agent}" Disallow: ${disallow}`);
      failures++;
      robotsFail = true;
    }
  }
  if (!robotsFail) console.log('  ✓ No AI retrieval bots blocked in live robots.txt');
}

// ── Run checks ───────────────────────────────────────────────────────────────

console.log('\n=== FTH Crawler Check ===');

checkUrl('homepage', SITE, null);
checkUrl('content page', CONTENT_PAGE, 1000);
checkRobots();

const result = failures === 0
  ? 'PASS'
  : `FAIL — ${failures} issue${failures !== 1 ? 's' : ''}`;

console.log(`\n=== Crawler Check: ${result} ===\n`);
if (failures > 0) process.exit(1);
