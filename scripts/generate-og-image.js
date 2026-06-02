// Generate 1200x630 og:image for FinanceToolsHub
// Run: node scripts/generate-og-image.js

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const W = 1200, H = 630;
const OUT = join(__dirname, '../src/assets/images/og-default.png');

// Helper: rounded rect (quadratic bezier compat)
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Helper: letter-spacing workaround
function drawSpacedText(ctx, text, x, y, spacing) {
  let cx = x;
  for (const ch of text) {
    ctx.fillText(ch, cx, y);
    cx += ctx.measureText(ch).width + spacing;
  }
}

const canvas = createCanvas(W, H);
const ctx = canvas.getContext('2d');

// ─── BACKGROUND ─────────────────────────────────────────────────────────────
ctx.fillStyle = '#f8fafc';
ctx.fillRect(0, 0, W, H);

// Subtle grid
ctx.save();
ctx.globalAlpha = 0.6;
ctx.strokeStyle = '#e2e8f0';
ctx.lineWidth = 0.8;
for (let x = 0; x <= W; x += 56) {
  ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
}
for (let y = 0; y <= H; y += 56) {
  ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
}
ctx.restore();

// Right tinted block
ctx.save();
ctx.globalAlpha = 0.07;
ctx.fillStyle = '#059669';
ctx.fillRect(870, 0, 330, H);
ctx.restore();

// ─── LEFT ACCENT BAR ────────────────────────────────────────────────────────
ctx.fillStyle = '#059669';
ctx.fillRect(0, 0, 10, H);

// ─── DECORATIVE CIRCLES ─────────────────────────────────────────────────────
ctx.save();
ctx.globalAlpha = 0.2;
ctx.strokeStyle = '#059669';
ctx.lineWidth = 1.2;
ctx.beginPath(); ctx.arc(1040, 315, 230, 0, Math.PI * 2); ctx.stroke();
ctx.restore();

ctx.save();
ctx.globalAlpha = 0.15;
ctx.strokeStyle = '#059669';
ctx.lineWidth = 0.8;
ctx.beginPath(); ctx.arc(1040, 315, 170, 0, Math.PI * 2); ctx.stroke();
ctx.restore();

// ─── LOGO MARK ──────────────────────────────────────────────────────────────
ctx.fillStyle = '#059669';
roundRect(ctx, 72, 72, 84, 84, 18);
ctx.fill();

ctx.fillStyle = '#ffffff';
ctx.fillRect(90,  118, 11, 28);
ctx.fillRect(107, 106, 11, 40);
ctx.fillRect(124, 96,  11, 50);

// ─── BRAND NAME ─────────────────────────────────────────────────────────────
ctx.textBaseline = 'alphabetic';
ctx.textAlign = 'left';

ctx.fillStyle = '#0f172a';
ctx.font = 'bold 32px Georgia, serif';
ctx.fillText('FinanceTools', 174, 118);

ctx.fillStyle = '#059669';
ctx.font = 'bold 32px Georgia, serif';
ctx.fillText('Hub.net', 174, 152);

ctx.fillStyle = '#64748b';
ctx.font = '18px sans-serif';
drawSpacedText(ctx, 'CLEAR · ACCURATE · ACTIONABLE', 174, 176, 3);

// ─── DIVIDER LINE ───────────────────────────────────────────────────────────
ctx.strokeStyle = '#e2e8f0';
ctx.lineWidth = 1.2;
ctx.beginPath();
ctx.moveTo(72, 210);
ctx.lineTo(800, 210);
ctx.stroke();

// ─── MAIN HEADLINE ──────────────────────────────────────────────────────────
ctx.fillStyle = '#0f172a';
ctx.font = 'bold 60px Georgia, serif';
ctx.textBaseline = 'alphabetic';
ctx.textAlign = 'left';
ctx.fillText('Free Financial Calculators', 72, 286);
ctx.fillText("for Life's Big Decisions.", 72, 356);

// ─── SUBHEADING ─────────────────────────────────────────────────────────────
ctx.fillStyle = '#475569';
ctx.font = '26px sans-serif';
ctx.fillText('Income · Tax · Relocation · Retirement · Gig Work', 72, 408);

// ─── STAT PILLS ─────────────────────────────────────────────────────────────
const pills = [
  { x: 72,  y: 450, w: 190, h: 56, label: '11 Calculators', tx: 167, ty: 484 },
  { x: 278, y: 450, w: 168, h: 56, label: '10 Guides',      tx: 362, ty: 484 },
  { x: 462, y: 450, w: 190, h: 56, label: '100% Free',      tx: 557, ty: 484 },
];

for (const p of pills) {
  ctx.fillStyle = '#d1fae5';
  roundRect(ctx, p.x, p.y, p.w, p.h, 10);
  ctx.fill();

  ctx.fillStyle = '#065f46';
  ctx.font = '600 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(p.label, p.tx, p.ty);
}

// ─── URL WATERMARK ──────────────────────────────────────────────────────────
ctx.fillStyle = '#94a3b8';
ctx.font = '22px sans-serif';
ctx.textAlign = 'right';
ctx.textBaseline = 'alphabetic';
ctx.fillText('financetoolshub.net', 1128, 600);

// ─── SAVE ───────────────────────────────────────────────────────────────────
const buf = canvas.toBuffer('image/png');
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, buf);
console.log('✅ og:image saved to src/assets/images/og-default.png');
console.log(`   Size: ${(buf.length / 1024).toFixed(1)} KB  |  ${W}×${H}px`);
