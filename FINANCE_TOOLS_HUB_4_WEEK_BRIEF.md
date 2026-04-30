# FinanceToolsHub — 4-Week Decision Platform Build

A specification for Claude Code to execute over four weeks, transforming FinanceToolsHub from a calculator directory into a workflow-driven financial decision platform.

---

## How to use this document

Each week below has the same structure: **Goal → Concrete Tasks → File-Level Changes → Acceptance Criteria → Out of Scope.**

Work week-by-week. After finishing each week, run `npm run build`, verify the acceptance criteria, and commit before moving on.

If anything in this brief conflicts with the codebase, follow the codebase. If anything is genuinely ambiguous, stop and ask before inventing a default. Do not invent tax thresholds, decision-state numbers, copy phrases, or schema fields that aren't specified here.

---

# Project Context (read this first)

## Stack and structure

This is an Eleventy 3.x static site. Source lives in `src/`, build output in `dist/`. Eleventy is configured in `.eleventy.js` to read templates from `src/` with `_data/` for data and `_includes/` for layouts and partials.

```
src/
├── _data/                          ← drives nav, calculators, articles, lead magnets
├── _includes/
│   ├── layouts/  (base.njk, calculator.njk, trust.njk)
│   └── partials/ (header-nav, footer, footer-slim, related-calculators, ...)
├── assets/css/site.css             ← shared styles
├── assets/js/site.js               ← shared JS (share, PDF, email, SW reg)
├── static/                         ← passthrough copies (favicon, manifest, sw.js, robots.txt)
├── calculators/*.njk               ← 11 calculator pages
├── index.njk, about.njk, methodology.njk, author-renato-bryant.njk
└── sitemap.njk                     ← auto-generated from _data
dist/                                ← BUILD OUTPUT — do NOT hand-edit
```

## Critical operating rules

1. **Never edit files in `dist/` directly.** Edit `src/`, run `npm run build`, commit both.
2. **Calculator content lives in frontmatter, not body markup.** Each calculator `.njk` puts its hero, calculator UI HTML, supporting copy HTML, and JS into YAML frontmatter fields (`hero`, `calcBody`, `bodyHtml`, `calcScript`). The `calculator.njk` layout reads these fields and assembles the page.
3. **Layouts cascade.** A page → `calculator.njk` (or `trust.njk`) → `base.njk`. Don't break the chain.
4. **Nav, footer, GA, Tailwind, and jsPDF are owned by `base.njk`.** Don't add `<head>` content, GA tags, or footer markup to individual pages.
5. **Preserve URLs.** All current pages end in `.html`. Don't switch to extensionless URLs.
6. **Preserve YMYL trust architecture.** Every calculator must keep its sources/methodology section, "Created by Renato Bryant" trust box, and links to `/about.html`, `/methodology.html`, `/author-renato-bryant.html`.
7. **Use the data layer for shared lists.** New calculators go in `_data/calculators.json`. New articles go in `_data/articles.json` (Week 3). Lead magnets go in `_data/lead-magnets.json` (Week 4). The homepage and sitemap should auto-pick these up.
8. **Build before committing.** Run `npm run build` and check that 16+ files write to `dist/` with no errors.

## Important YMYL note

This site covers tax, retirement, debt, and relocation topics. **Decision-state thresholds, copy that interprets a result, and any numbers you display are editorial decisions, not just engineering decisions.** This brief gives you specific thresholds. Use them exactly. If a calculator's logic doesn't have an input that maps cleanly to a threshold here, stop and ask — do not approximate.

All decision-state output must include a hedging line: *"This is an educational estimate. Real outcomes depend on your full situation. Talk to a qualified professional before making major decisions."* Use this exact line, do not paraphrase.

## How to ask for clarification

If something is genuinely ambiguous, stop and post a single question with: (a) the file you're on, (b) the specific decision, (c) two or three concrete options. Do not pick a default and proceed.

---

# Week 1 — Homepage and workflow architecture

## Goal

Reposition the homepage so a first-time visitor immediately understands FinanceToolsHub as a decision platform organized around three workflows, not a calculator list.

## Concrete tasks

### 1.1 Define the three workflows in data

Create `src/_data/workflows.json` with this exact content (do not modify keys, do not edit copy):

```json
[
  {
    "key": "income-reality",
    "title": "Income Reality",
    "tagline": "What you actually take home, what the IRS takes, and whether you're saving enough.",
    "audience": "Employees, salaried workers, anyone comparing job offers or planning a paycheck-driven budget.",
    "calculatorKeys": ["take-home-pay", "tax-bracket", "retirement-savings"],
    "primaryCta": { "label": "Start with Take-Home Pay", "url": "/take-home-pay-calculator.html" }
  },
  {
    "key": "freelance-gig",
    "title": "Freelance & Gig Money",
    "tagline": "Estimate your real income after self-employment tax, and reserve enough for quarterly payments.",
    "audience": "Freelancers, contractors, rideshare and delivery drivers, creators, and side-income earners.",
    "calculatorKeys": ["gig-tax-optimizer", "tax-bracket", "take-home-pay", "retirement-savings"],
    "primaryCta": { "label": "Start with Gig Tax Optimizer", "url": "/gig-tax-optimizer.html" }
  },
  {
    "key": "move-abroad",
    "title": "Move Abroad Economics",
    "tagline": "Run the numbers on relocation: monthly costs, break-even, tax residency, and insurance.",
    "audience": "Remote workers, digital nomads, and anyone considering an international move.",
    "calculatorKeys": ["digital-nomad", "cost-of-living", "break-even", "tax-residency", "nomad-insurance"],
    "primaryCta": { "label": "Start with Digital Nomad Calculator", "url": "/digital-nomad-calculator.html" }
  }
]
```

### 1.2 Define "Start Here" entry points in data

Create `src/_data/startHere.json`:

```json
[
  { "label": "Compare two job offers",        "url": "/take-home-pay-calculator.html",   "icon": "briefcase" },
  { "label": "Plan freelance taxes",          "url": "/gig-tax-optimizer.html",          "icon": "calculator" },
  { "label": "Evaluate a move abroad",        "url": "/digital-nomad-calculator.html",   "icon": "globe" },
  { "label": "Pay off debt faster",           "url": "/credit-card-payoff-calculator.html", "icon": "card" },
  { "label": "Check your retirement track",   "url": "/retirement-savings-calculator.html", "icon": "trending-up" }
]
```

The `icon` field is a hint — render with inline SVG icons (do not load Lucide or Heroicons). Use simple 24×24 emerald-700 stroke icons. If you can't render a clean inline SVG, render a small emerald-50 circle with the first letter of the label.

### 1.3 Rewrite the homepage

Edit `src/index.njk` and replace the current body content with this new structure (in this order, top to bottom):

1. **Hero section.** Use the existing emerald gradient. Replace current hero copy with:
   - Eyebrow: `Free Financial Decision Tools`
   - H1: `Finance Tools Hub` (drop "2026" from the H1; keep it in `<title>`)
   - Sub-headline (one sentence): `A workflow-driven set of free calculators for income, taxes, debt, retirement, and relocation decisions.`
   - Two buttons: `Browse the workflows` (anchors to `#workflows`), `See all calculators` (anchors to `#all-tools`).

2. **"Start Here" section.** ID `start-here`. Heading: `Start Here`. Sub-line: `Pick the question you're trying to answer.` Render the 5 entries from `startHere.json` as a 5-column responsive grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-5`). Each card: icon, label, arrow.

3. **Three workflow blocks.** Section ID `workflows`. Heading: `Three workflows that cover most money decisions.` For each entry in `workflows.json`, render a card with:
   - Workflow title (h3)
   - Tagline (one short paragraph)
   - "Who it's for:" line followed by the audience text
   - Numbered list of the calculators in that workflow (rendered from `calculatorKeys`, each linked to its slug, with the calculator's `label` from `calculators.json`)
   - Primary CTA button with the `primaryCta.label` and `primaryCta.url`

   Use a 1-column layout on mobile, 3-column on `lg:` and up. Background of each card: `bg-white border border-slate-200 rounded-3xl p-8 card-shadow`.

4. **All calculators section.** ID `all-tools`. Heading: `All calculators`. Render the existing 11-card grid from `calculators.json` as it currently does. Keep the structure but change the heading from "Popular Calculators" to "All calculators".

5. **Trust strip.** A horizontal band, emerald-50 background, with three columns: Methodology, About, Author. Each column: short one-line description, a "Read more →" link. Pull copy from this:
   - **Methodology** — `How calculator formulas, assumptions, and update policies are chosen.` → `/methodology.html`
   - **About** — `Why this site exists, who it serves, and what it does not do.` → `/about.html`
   - **Author** — `Maintained by Renato Bryant — 30 years of management, budgeting, and compliance experience.` → `/author-renato-bryant.html`

6. **FAQ.** Keep the existing 6 `<details>` items as-is. No changes.

7. **Remove from homepage:** the current "Most used in 2026" sidebar block, the current "Blog & Guides" section (it will return in Week 3 once articles exist), and the current "Trust & Methodology" two-column block (replaced by the trust strip above).

### 1.4 Update homepage `<title>` and `description`

Keep the existing `<title>` (`Finance Tools Hub 2026 | …`) but **change the meta description** to:
> `Workflow-driven free calculators for take-home pay, freelance taxes, debt, retirement, and moving abroad. Practical decisions, transparent assumptions.`

### 1.5 Verify and commit

Run `npm run build`. Open `dist/index.html` in a browser. Check on viewports 375px (mobile), 768px (tablet), 1280px (desktop).

## File-level changes (Week 1)

| File | Action |
| --- | --- |
| `src/_data/workflows.json` | **Create** with the exact JSON above |
| `src/_data/startHere.json` | **Create** with the exact JSON above |
| `src/index.njk` | **Rewrite body content** per section order above; keep frontmatter |
| `src/_includes/partials/start-here.njk` | **Create** — renders the 5-card "Start Here" grid from data |
| `src/_includes/partials/workflow-card.njk` | **Create** — renders one workflow block; called 3× from index |
| `src/_includes/partials/trust-strip.njk` | **Create** — renders the 3-column trust band |

Do not modify `_data/calculators.json`, `_data/nav.json`, `_data/site.json`, layouts, or any calculator pages this week.

## Acceptance criteria (Week 1)

- [ ] `dist/index.html` builds without errors.
- [ ] Homepage hero H1 reads exactly `Finance Tools Hub` (no "2026").
- [ ] Homepage contains an element with `id="start-here"` and renders 5 entry-point cards.
- [ ] Homepage contains an element with `id="workflows"` and renders exactly 3 workflow cards.
- [ ] Each workflow card lists at least 3 calculators by label, each linked to a `/<slug>.html` URL that resolves in `dist/`.
- [ ] Homepage contains an element with `id="all-tools"` and renders 11 calculator cards.
- [ ] Trust strip renders three links to `/methodology.html`, `/about.html`, `/author-renato-bryant.html`.
- [ ] `dist/index.html` does NOT contain the strings "Most used in 2026" or "Planning articles for 2026 money decisions".
- [ ] Mobile viewport (375px): hero, Start Here, workflow cards, all-tools grid, trust strip, and FAQ all render without horizontal scroll.
- [ ] All 14 calculator/trust pages still build and link from the homepage.
- [ ] `dist/sitemap.xml` still contains 15 URLs.
- [ ] No broken internal links: every `href="/...html"` on the homepage resolves to a file in `dist/`.

## Out of scope (Week 1)

- Do not add decision-state UX yet (Week 2).
- Do not create article pages or any blog index (Week 3).
- Do not add lead-magnet CTAs yet (Week 4).
- Do not change calculator pages.
- Do not change Tailwind setup, layouts, or `base.njk`.
- Do not change the visual theme.

---

# Week 2 — Decision-state UX and result interpretation

## Goal

Add a "decision state" output to 5 calculators so the result is interpreted, not just shown. Each calculator gets a state label, an explanation of what the state means, a "what to do next" block, and links to the next calculator in its workflow.

## The 5 calculators in scope

1. `take-home-pay-calculator`
2. `gig-tax-optimizer`
3. `digital-nomad-calculator`
4. `break-even-savings-calculator`
5. `tax-residency-checker`

**Do not modify the other 6 calculators this week.**

## Decision-state thresholds

These thresholds are editorial. Use them exactly as stated. If you find a calculator whose existing logic doesn't expose the variable named here, **stop and ask** — do not invent a substitute.

### Take-Home Pay Calculator

Compute `netRatio = net / gross` (per the calculator's existing logic, after federal, state, FICA, 401k, and health deductions).

| State | Threshold | Color | Body | Next step |
| --- | --- | --- | --- | --- |
| `strong-cash-flow` | `netRatio >= 0.70` | emerald | "Your take-home is on the higher end of typical for your inputs. You're keeping a solid share of gross pay after taxes and benefits." | "Consider whether your retirement contribution rate is high enough — try the Retirement Savings Calculator." → link to `/retirement-savings-calculator.html` |
| `typical-cash-flow` | `0.60 <= netRatio < 0.70` | slate | "Your take-home is roughly typical for the inputs you provided. Most US W-2 workers fall in this band." | "If you have side income, model self-employment tax separately with the Gig Tax Optimizer." → link to `/gig-tax-optimizer.html` |
| `lower-take-home` | `netRatio < 0.60` | amber | "Your take-home is on the lower end relative to gross pay. High deductions, high tax rate, or expensive benefits could be the cause." | "Use the Tax Bracket Calculator to see how much of this is federal tax versus other deductions." → link to `/tax-bracket-calculator.html` |

### Gig Tax Optimizer

Compute `reserveRatio = (recommendedReserve / netSelfEmploymentIncome)`. The calculator already produces a recommended reserve amount; use that as `recommendedReserve` and the post-expense net income as `netSelfEmploymentIncome`.

| State | Threshold | Color | Body | Next step |
| --- | --- | --- | --- | --- |
| `reasonably-prepared` | `reserveRatio >= 0.25` | emerald | "Your tax reserve looks reasonable for typical self-employment scenarios. This is an estimate — confirm with a tax professional, especially if your income changed recently." | "Use the Take-Home Pay Calculator if you also have W-2 income to combine." → link to `/take-home-pay-calculator.html` |
| `reserve-may-be-light` | `0.15 <= reserveRatio < 0.25` | amber | "Your reserve is below the typical 25–30% range many self-employed workers target. A surprise tax bill is possible if income or deductions shift." | "Use the Tax Bracket Calculator to estimate federal income tax separately from self-employment tax." → link to `/tax-bracket-calculator.html` |
| `underreserved` | `reserveRatio < 0.15` | red | "Your reserve is well below typical self-employment guidance. Many freelancers face quarterly payment penalties at this level. This is not advice — talk to a CPA or EA." | "Use the Tax Bracket Calculator to estimate federal income tax exposure on this income." → link to `/tax-bracket-calculator.html` |

### Digital Nomad Calculator

Compute `monthlyAbroad` (total monthly cost abroad from the calculator's output). Compute `monthlyHome` from a new optional input the user can fill in: "Your current monthly cost at home (USD)". If the user leaves it blank, **do not show a decision state** — show only the existing total cost output and a note: "Enter your current home cost above to see how this compares."

If filled in, compute `pctDelta = (monthlyAbroad - monthlyHome) / monthlyHome`. (Positive means abroad is more expensive; negative means abroad is cheaper.) Guard against `monthlyHome <= 0` — if the user enters zero or a non-positive number, treat the comparison as blank and show no decision state.

| State | Threshold | Color | Body | Next step |
| --- | --- | --- | --- | --- |
| `materially-cheaper-abroad` | `pctDelta <= -0.20` | emerald | "Your modeled monthly cost abroad is at least 20% lower than your current home cost. The lifestyle and tax implications matter too — see the Tax Residency Checker." | "Use the Break-Even Savings Calculator to estimate how long it takes to recover relocation costs." → link to `/break-even-savings-calculator.html` |
| `meaningfully-cheaper-abroad` | `-0.20 < pctDelta <= -0.10` | emerald | "Your modeled monthly cost abroad is roughly 10–20% lower than your current home cost. There's a real cost gap, but make sure to factor in insurance, taxes, and one-time setup before deciding." | "Use the Break-Even Savings Calculator to estimate how long it takes to recover relocation costs." → link to `/break-even-savings-calculator.html` |
| `roughly-comparable` | `-0.10 < pctDelta < 0.10` | slate | "Your modeled monthly cost abroad is within about 10% of your current home cost. The decision likely depends on lifestyle, taxes, and insurance — not headline cost." | "Compare specific cities with the Cost of Living Comparison." → link to `/cost-of-living-comparison.html` |
| `meaningfully-more-expensive-abroad` | `0.10 <= pctDelta < 0.20` | amber | "Your modeled monthly cost abroad is roughly 10–20% higher than your current home cost. The move can still make sense for non-financial reasons, but the headline cost is not in your favor." | "Try the Cost of Living Comparison to see if a different destination changes the math." → link to `/cost-of-living-comparison.html` |
| `materially-more-expensive-abroad` | `pctDelta >= 0.20` | amber | "Your modeled monthly cost abroad is at least 20% higher than your current home cost. Lifestyle, taxes, or visa benefits would need to outweigh a meaningful cost gap." | "Try the Cost of Living Comparison to see if a different destination changes the math." → link to `/cost-of-living-comparison.html` |

### Break-Even Savings Calculator

Compute `breakEvenMonths` as the calculator's existing primary output.

| State | Threshold | Color | Body | Next step |
| --- | --- | --- | --- | --- |
| `fast-payback` | `breakEvenMonths <= 12` | emerald | "Your modeled relocation pays back in a year or less. That's a strong financial case, assuming the inputs hold." | "Check tax residency exposure with the Tax Residency Checker before committing." → link to `/tax-residency-checker.html` |
| `reasonable-payback` | `12 < breakEvenMonths <= 24` | slate | "Your modeled relocation pays back in roughly 1–2 years. That's a reasonable but not aggressive case." | "Sanity-check your monthly cost abroad with the Cost of Living Comparison." → link to `/cost-of-living-comparison.html` |
| `slow-payback` | `breakEvenMonths > 24` | amber | "Your modeled relocation takes more than 2 years to pay back. The non-financial reasons for moving may matter more than the math." | "Try lowering your destination cost using the Cost of Living Comparison." → link to `/cost-of-living-comparison.html` |
| `no-clear-payback` | `breakEvenMonths` is infinite or negative (savings ≤ 0) | red | "Your inputs show no clear break-even — monthly costs abroad don't yield positive savings. The financial case for moving is weak with these numbers." | "Compare destinations with the Cost of Living Comparison to see if the math improves elsewhere." → link to `/cost-of-living-comparison.html` |

### Tax Residency Checker

The existing checker has a set of yes/no questions that produce a risk indicator. Map its output to:

| State | Threshold | Color | Body | Next step |
| --- | --- | --- | --- | --- |
| `lower-watch` | 0–1 risk flags | emerald | "Your answers suggest a lower watch on accidentally triggering tax residency in another country. This is general guidance — official rules vary by country and treaty." | "If you're planning a move, model the cost with the Digital Nomad Calculator." → link to `/digital-nomad-calculator.html` |
| `review-recommended` | 2 risk flags | amber | "Your answers suggest some tax residency risk worth reviewing. The 183-day rule is one of several tests — consult a cross-border tax professional." | "Read more on the 183-day rule article." → link to `/articles/183-day-rule-remote-workers.html` (this article exists after Week 3 — until then, link to `/methodology.html`) |
| `higher-residency-risk` | 3+ risk flags | red | "Your answers suggest a higher risk of triggering tax residency in another country. Specific rules vary — this is not a substitute for professional cross-border tax advice." | "Read more on the 183-day rule article." → link to `/articles/183-day-rule-remote-workers.html` (until that exists, link to `/methodology.html`) |

If the existing tax residency checker doesn't already produce a "risk flag count" output, stop and ask — do not invent the count logic.

## Implementation pattern

Each of the 5 calculators needs a new HTML block that the existing `calculate()` function populates. Add this block immediately below the existing `#result` div in each calculator's `calcBody`:

```html
<div id="decision-state" class="mt-6" hidden>
  <div class="rounded-2xl border p-6" data-decision-state>
    <p class="text-xs uppercase tracking-wide font-semibold" data-state-eyebrow></p>
    <h3 class="mt-2 text-xl font-bold" data-state-label></h3>
    <p class="mt-3 text-slate-700" data-state-body></p>
    <div class="mt-4 rounded-xl bg-white border border-slate-200 p-4">
      <p class="text-sm font-semibold text-slate-900">Recommended next step</p>
      <p class="mt-1 text-sm text-slate-700" data-next-step-text></p>
      <a class="inline-block mt-2 text-emerald-700 font-medium" data-next-step-link>Open the next calculator →</a>
    </div>
    <p class="mt-4 text-xs text-slate-500">This is an educational estimate. Real outcomes depend on your full situation. Talk to a qualified professional before making major decisions.</p>
  </div>
</div>
```

Color treatment is applied by toggling a class on the `[data-decision-state]` element:
- `emerald` → `bg-emerald-50 border-emerald-200`
- `slate`   → `bg-slate-50 border-slate-200`
- `amber`   → `bg-amber-50 border-amber-200`
- `red`     → `bg-red-50 border-red-200`

The existing calculator JS gets a new function appended at the end:

```js
function setDecisionState(stateKey, color, label, body, nextText, nextHref) {
  const wrap = document.getElementById('decision-state');
  if (!wrap) return;
  const card = wrap.querySelector('[data-decision-state]');
  card.className = 'rounded-2xl border p-6';
  const colorMap = {
    emerald: 'bg-emerald-50 border-emerald-200',
    slate:   'bg-slate-50 border-slate-200',
    amber:   'bg-amber-50 border-amber-200',
    red:     'bg-red-50 border-red-200'
  };
  card.classList.add(...colorMap[color].split(' '));
  card.dataset.state = stateKey;
  card.querySelector('[data-state-eyebrow]').textContent = 'Decision state';
  card.querySelector('[data-state-label]').textContent = label;
  card.querySelector('[data-state-body]').textContent = body;
  card.querySelector('[data-next-step-text]').textContent = nextText;
  const link = card.querySelector('[data-next-step-link]');
  link.href = nextHref;
  wrap.hidden = false;
}
```

At the end of each calculator's existing `calculate()` function, add a block that picks the right state based on the thresholds above and calls `setDecisionState(...)`. Do not change any of the existing result-card output.

## File-level changes (Week 2)

| File | Action |
| --- | --- |
| `src/calculators/take-home-pay-calculator.njk` | Append decision-state block to `calcBody`; append state logic to `calcScript` |
| `src/calculators/gig-tax-optimizer.njk` | Same |
| `src/calculators/digital-nomad-calculator.njk` | Same; **also** add a "monthly home cost (USD)" optional input to the form |
| `src/calculators/break-even-savings-calculator.njk` | Same |
| `src/calculators/tax-residency-checker.njk` | Same |
| `src/_includes/partials/decision-state.njk` | **Create** — emits the decision-state HTML block (so each calculator includes it consistently) |

Do not modify the other 6 calculators. Do not modify layouts, data files, or the homepage this week.

## Acceptance criteria (Week 2)

- [ ] All 5 modified calculators build cleanly.
- [ ] On each of the 5 modified pages, after pressing Calculate with the default inputs, the page shows a decision-state card with: an eyebrow ("Decision state"), a label, a body paragraph, a "Recommended next step" sub-card, a link to the next calculator, and the educational-estimate hedging line.
- [ ] The decision-state card uses the exact color (emerald/slate/amber/red) prescribed for the threshold the default inputs fall into. Document which state default inputs trigger for each of the 5 calculators in a comment at the top of the calcScript.
- [ ] On the digital nomad page, leaving the new "monthly home cost" input empty (or entering 0 or a negative number) hides the decision-state card and shows the prompt "Enter your current home cost above to see how this compares."
- [ ] All 5 modified pages still produce the original result-card output above the decision-state card (no regression).
- [ ] All 5 modified pages still have working PDF export, email, and social share.
- [ ] The hedging line "This is an educational estimate. Real outcomes depend on your full situation. Talk to a qualified professional before making major decisions." appears verbatim in all 5 decision-state cards.
- [ ] No JavaScript errors on calculate. Test in Chrome DevTools console with default inputs.
- [ ] The unmodified 6 calculators still render and function identically to Week 1.

## Out of scope (Week 2)

- Do not add decision-state UX to the other 6 calculators.
- Do not add the article-link target for tax-residency yet (Week 3 creates that article; until then link to `/methodology.html` as fallback as noted).
- Do not add tracking events yet (Week 4).
- Do not change thresholds without explicit approval.

---

# Week 3 — Content engine: 5 articles + article infrastructure

## Goal

Add a proper article system to the site (layout, data registry, schema, blog index) and publish 5 SEO-targeted decision articles that link into the workflows.

## Article infrastructure first

Before writing any article content, build the infrastructure.

### 3.1 Article data registry

Create `src/_data/articles.json` with these 5 entries (do not change slugs, dates, or titles):

```json
[
  {
    "slug": "compare-job-offers-take-home-pay",
    "title": "How to Compare Two Job Offers Using Take-Home Pay",
    "description": "Headline salary doesn't tell the full story. Use take-home pay, taxes, and benefits to compare two job offers fairly in 2026.",
    "h1": "How to compare two job offers using take-home pay",
    "publishedDate": "2026-05-05",
    "lastUpdated": "2026-05-05",
    "readingMinutes": 7,
    "workflowKey": "income-reality",
    "primaryCalculatorKey": "take-home-pay",
    "relatedCalculatorKeys": ["take-home-pay", "tax-bracket", "retirement-savings"],
    "tags": ["salary", "job-offers", "take-home-pay"]
  },
  {
    "slug": "freelancer-tax-reserve-2026",
    "title": "How Much Freelancers Should Reserve for Taxes in 2026",
    "description": "A practical guide to setting aside the right share of freelance income for federal, state, and self-employment tax in 2026.",
    "h1": "How much freelancers should reserve for taxes in 2026",
    "publishedDate": "2026-05-08",
    "lastUpdated": "2026-05-08",
    "readingMinutes": 8,
    "workflowKey": "freelance-gig",
    "primaryCalculatorKey": "gig-tax-optimizer",
    "relatedCalculatorKeys": ["gig-tax-optimizer", "tax-bracket", "take-home-pay"],
    "tags": ["freelance", "self-employment-tax", "quarterly-taxes"]
  },
  {
    "slug": "is-moving-abroad-cheaper",
    "title": "Is Moving Abroad Actually Cheaper After Insurance and Taxes?",
    "description": "The headline cost-of-living number isn't the full picture. Run the real math on rent, insurance, taxes, and visa costs before relocating.",
    "h1": "Is moving abroad actually cheaper after insurance and taxes?",
    "publishedDate": "2026-05-12",
    "lastUpdated": "2026-05-12",
    "readingMinutes": 9,
    "workflowKey": "move-abroad",
    "primaryCalculatorKey": "digital-nomad",
    "relatedCalculatorKeys": ["digital-nomad", "cost-of-living", "nomad-insurance"],
    "tags": ["digital-nomad", "relocation", "cost-of-living"]
  },
  {
    "slug": "relocation-break-even-guide",
    "title": "How to Know Whether a Relocation Will Really Break Even",
    "description": "A simple framework for estimating relocation payback time, including one-time costs, monthly savings, and what often gets missed.",
    "h1": "How to know whether a relocation will really break even",
    "publishedDate": "2026-05-15",
    "lastUpdated": "2026-05-15",
    "readingMinutes": 7,
    "workflowKey": "move-abroad",
    "primaryCalculatorKey": "break-even",
    "relatedCalculatorKeys": ["break-even", "cost-of-living", "digital-nomad"],
    "tags": ["relocation", "break-even", "savings"]
  },
  {
    "slug": "183-day-rule-remote-workers",
    "title": "What the 183-Day Rule Means for Remote Workers",
    "description": "The 183-day rule is the most-cited test for tax residency, but it's not the only one. Here's what remote workers should actually watch for.",
    "h1": "What the 183-day rule means for remote workers",
    "publishedDate": "2026-05-19",
    "lastUpdated": "2026-05-19",
    "readingMinutes": 8,
    "workflowKey": "move-abroad",
    "primaryCalculatorKey": "tax-residency",
    "relatedCalculatorKeys": ["tax-residency", "digital-nomad", "cost-of-living"],
    "tags": ["tax-residency", "183-day-rule", "remote-work"]
  }
]
```

### 3.2 Article layout

Create `src/_includes/layouts/article.njk`. Frontmatter `layout: layouts/base.njk`. Render order:

1. **Article hero** — light emerald gradient. Eyebrow: `Article` plus the article's primary workflow title (read from `workflows.json`). H1 from frontmatter `h1`. Sub-line: `By Renato Bryant · Published [publishedDate, formatted as "May 5, 2026"] · [readingMinutes] min read`.
2. **Lead callout** (optional, frontmatter `lead`) — single paragraph in slate-700, bordered emerald-100 left border, used for the article's TL;DR.
3. **Article body** — frontmatter `body` (raw HTML, prose styling). Use `prose max-w-3xl mx-auto` Tailwind utility on the wrapper, plus the existing `.prose p`, `.prose ul`, `.prose li` rules in `site.css`. Add new rules to `site.css` for `.prose h2 { @apply text-2xl font-bold mt-10 mb-4; }` and `.prose h3 { @apply text-xl font-semibold mt-8 mb-3; }` and `.prose a { @apply text-emerald-700 font-medium; }`.
4. **Primary CTA card** — links to the article's `primaryCalculatorKey` calculator. Heading: `Ready to run your numbers?`. Sub: pulled from the calculator's blurb. Button: `Open the [calculator label] →`.
5. **Related calculators** — 2–3 cards from `relatedCalculatorKeys`, identical visual style to the existing related-calculators partial on calculator pages. Reuse `partials/related-calculators.njk` if possible.
6. **Author + trust strip** — small block: "Written and maintained by Renato Bryant. Read the [methodology](/methodology.html) and the [about](/about.html) page for how content is reviewed."
7. **JSON-LD `Article` schema** in head (via `schemaBlocks` frontmatter). Include `@context`, `@type: Article`, `headline` (=h1), `datePublished`, `dateModified`, `author` (Person), `publisher` (Organization), `mainEntityOfPage` (WebPage with the canonical URL).

Each article file lives at `src/articles/<slug>.njk` and uses `permalink: /articles/<slug>.html`.

### 3.3 Article index page

Create `src/articles.njk` with `permalink: /articles.html`. Heading: `Articles`. Sub-line: `Decision-focused guides on income, taxes, debt, retirement, and relocation.` Render the 5 articles from `articles.json` as cards (date, title, description, "Read article →" link) sorted by `publishedDate` descending. Add a link from the homepage trust strip to `/articles.html`? No — instead add it in the new homepage "Articles" block (next).

### 3.4 Re-add the homepage articles section

In `src/index.njk`, add a new section between the "all-tools" section and the trust strip. Section ID `articles`. Heading: `Decision guides`. Render the latest 3 articles from `articles.json`, sorted by `publishedDate` descending. End with a link: `Read all articles →` to `/articles.html`.

### 3.5 Calculator → article back-links

For each article, add a one-line link from its `primaryCalculatorKey` calculator's `bodyHtml` (in the supporting copy, near the existing "Sources and methodology" section). Format:

> **Related reading:** [article title](/articles/<slug>.html)

This affects 4 calculator pages (take-home-pay, gig-tax-optimizer, digital-nomad-calculator, break-even-savings-calculator, tax-residency-checker — note that 5 articles map to 5 different primary calculators). Confirm with the data: which calculator is the primary for each article comes from `articles.json[].primaryCalculatorKey`.

### 3.6 Sitemap update

Update `src/sitemap.njk` to include:
- `/articles.html` (the index)
- All 5 article URLs from `articles.json`

After this change, sitemap should contain **21 URLs** (1 home + 3 trust + 11 calculators + 1 article index + 5 articles + sitemap excluded).

### 3.7 Write the articles

Each article must:
- Be 900–1,500 words of original prose.
- Have at least 4 H2 sub-sections.
- Reference at least 2 calculators by name with inline links to their pages.
- Include a clearly marked "What this won't tell you" or "Limitations" sub-section near the end.
- Include the standard hedging phrase: `This is an educational guide, not personalized financial, tax, or legal advice.`
- **Not** make specific tax claims about specific countries or dollar amounts that the calculators don't support. (The 183-day rule article should describe the rule conceptually and link to the calculator, not give country-specific filing thresholds.)
- Avoid superlatives ("the best", "guaranteed", "always"). Use "often", "typically", "in most cases".

**Article content notes:**

- **Compare two job offers** — Walk through net-pay difference, benefit value (health, 401k match, PTO), commute cost, geographic tax differences. Use a worked example with two illustrative offers. Link to take-home-pay-calculator at the start and the retirement-savings-calculator at the end (in case the 401k match differs).
- **Freelancer tax reserve** — Cover federal income tax, SE tax (15.3%), state tax, and the 25–30% reserve heuristic. Talk about quarterly estimated payments and the safe-harbor rules conceptually (do not give specific dollar thresholds — they vary by year and situation).
- **Moving abroad cheaper** — Cover four hidden costs: international health insurance, US tax filing obligations for citizens, currency exchange/banking, and one-time setup. Use a directional example (don't pick a specific country and quote specific rent prices — instead use ranges).
- **Relocation break-even** — Frame it as a 4-step framework: list all one-time costs, estimate monthly savings honestly, model risk to monthly savings, decide what break-even period is acceptable. Reference the break-even-savings-calculator.
- **183-day rule** — Explain what the rule is, why "183 days in one country" isn't the only test (tax home, center of vital interests, ties to home country), and what remote workers commonly miss. Strongly emphasize "talk to a cross-border tax professional".

**Voice:** Direct, plain English, no jargon without defining it. Match the existing site copy tone (similar to about.html and methodology.html).

## File-level changes (Week 3)

| File | Action |
| --- | --- |
| `src/_data/articles.json` | **Create** with the exact JSON above |
| `src/_includes/layouts/article.njk` | **Create** new layout |
| `src/articles.njk` | **Create** article index page |
| `src/articles/compare-job-offers-take-home-pay.njk` | **Create** article |
| `src/articles/freelancer-tax-reserve-2026.njk` | **Create** article |
| `src/articles/is-moving-abroad-cheaper.njk` | **Create** article |
| `src/articles/relocation-break-even-guide.njk` | **Create** article |
| `src/articles/183-day-rule-remote-workers.njk` | **Create** article |
| `src/sitemap.njk` | **Update** to include article index + 5 article URLs |
| `src/index.njk` | **Add** the "Decision guides" section between all-tools and trust strip |
| `src/calculators/take-home-pay-calculator.njk` | Add "Related reading" link to its primary article |
| `src/calculators/gig-tax-optimizer.njk` | Same |
| `src/calculators/digital-nomad-calculator.njk` | Same |
| `src/calculators/break-even-savings-calculator.njk` | Same |
| `src/calculators/tax-residency-checker.njk` | Same (also: now that the 183-day article exists, the Week 2 fallback link to `/methodology.html` becomes the article link) |
| `src/assets/css/site.css` | Add new `.prose h2`, `.prose h3`, `.prose a` rules (note: Tailwind CDN doesn't process `@apply`; either inline the equivalent CSS values or use a plain CSS rule) |

**Important on CSS:** Because the site uses the Tailwind CDN (no build step for Tailwind), `@apply` does not work. Write the article-prose styles as plain CSS rules in `site.css`:

```css
.prose h2 { font-size: 1.5rem; line-height: 2rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1rem; }
.prose h3 { font-size: 1.25rem; line-height: 1.75rem; font-weight: 600; margin-top: 2rem; margin-bottom: 0.75rem; }
.prose a  { color: #047857; font-weight: 500; }
.prose a:hover { color: #065f46; }
.prose blockquote { border-left: 4px solid #d1fae5; padding-left: 1rem; color: #475569; font-style: italic; margin: 1.25rem 0; }
```

## Acceptance criteria (Week 3)

- [ ] `dist/articles.html` (the index) renders with 5 article cards.
- [ ] All 5 article pages exist in `dist/articles/<slug>.html` and render with hero, body, primary CTA, related calculators, and author/trust strip.
- [ ] Each article contains its `Article` JSON-LD schema in `<head>`.
- [ ] Each article body is at least 900 words and has at least 4 H2 sub-sections.
- [ ] Each article contains at least 2 inline `<a>` tags linking to a `/<slug>-calculator.html` URL.
- [ ] Each article contains the exact hedging phrase: `This is an educational guide, not personalized financial, tax, or legal advice.`
- [ ] Homepage `index.html` contains `id="articles"` section with 3 article cards plus a "Read all articles" link to `/articles.html`.
- [ ] Each of the 5 calculators that has a primary article shows a "Related reading" link to that article on its page.
- [ ] `dist/sitemap.xml` contains 21 URLs (homepage + 3 trust + 11 calculators + 1 articles index + 5 articles).
- [ ] Article URLs follow the pattern `/articles/<slug>.html` (note the `articles/` subdirectory).
- [ ] No article makes country-specific tax claims with specific dollar thresholds.
- [ ] No broken internal links anywhere.
- [ ] Mobile viewport (375px): article hero, body, CTA, and related cards all render without horizontal scroll.

## Out of scope (Week 3)

- Do not add lead-magnet CTAs (Week 4).
- Do not add event tracking (Week 4).
- Do not write a 6th article. If you finish the 5 with time to spare, run the build, verify acceptance, and stop.
- Do not change calculator decision-state thresholds.

---

# Week 4 — Conversion layer + monetization readiness

## Goal

Set up a single lead magnet (Digital Nomad Move Decision Pack) with proper landing copy and CTA placements, instrument the site with GA4 events for the actions that matter, and produce a monetization placement document for future review. **No live affiliate links ship this week** — only structure and a doc.

## 4.1 Lead magnet — Digital Nomad Move Decision Pack

### What it is

A single downloadable PDF (filename `nomad-move-decision-pack.pdf`) with the following sections:
1. **One-page move decision checklist** — 15 yes/no questions covering monthly cost, break-even, tax residency, insurance, visa, banking, and exit strategy.
2. **Cost worksheet** — a fillable table for one-time costs (flights, deposits, visa, shipping) and monthly costs (rent, food, internet, coworking, transport, insurance).
3. **Break-even formula sheet** — the formula used by the calculator, written out, with one worked example.
4. **Tax residency self-check** — a 6-question yes/no list mirroring the on-site checker's logic, with explanations.
5. **Resources page** — links back to the 5 nomad-cluster calculators and 2 articles.

For Week 4, **the actual PDF does not need to be authored**. Create a placeholder PDF at `src/static/downloads/nomad-move-decision-pack.pdf` that says "Coming soon" with a brief description, OR if Claude Code is unable to generate a PDF, create a placeholder Markdown file at `src/static/downloads/nomad-move-decision-pack.md` with the same content. Either is fine — what matters is the link target exists.

Document in a comment in the lead magnet partial: *"Placeholder file. Author the real PDF before launching the email capture flow in a future sprint."*

### Lead magnet data file

Create `src/_data/leadMagnets.json`:

```json
[
  {
    "key": "nomad-move-pack",
    "title": "Digital Nomad Move Decision Pack",
    "shortTitle": "Nomad Move Decision Pack",
    "tagline": "A 5-section worksheet for deciding whether moving abroad makes financial sense.",
    "bullets": [
      "Move decision checklist (15 questions)",
      "Cost worksheet template",
      "Break-even formula and worked example",
      "Tax residency self-check",
      "Curated calculator and article links"
    ],
    "downloadUrl": "/downloads/nomad-move-decision-pack.pdf",
    "ctaButton": "Get the Decision Pack",
    "appliesToCalculatorKeys": ["digital-nomad", "cost-of-living", "break-even", "tax-residency", "nomad-insurance"]
  }
]
```

### Lead magnet landing block

Create `src/_includes/partials/lead-magnet.njk`. It takes a `leadMagnetKey` parameter and renders a card with:
- Eyebrow: `Free download`
- Title: `leadMagnet.title`
- Tagline
- Bullet list of contents
- Big CTA button — for now, a `<a download>` link pointing to `leadMagnet.downloadUrl`. (No email capture form yet.)
- Below the button, in small text: `No email required for now. Future versions may include a download confirmation step.`

Add `data-lead-magnet="<key>"` to the CTA button so analytics can pick it up (Week 4 tracking).

### CTA placement

Insert `{% include "partials/lead-magnet.njk" %}` (with `set leadMagnetKey = "nomad-move-pack"`) on each of these 5 calculator pages. Place it in `bodyHtml`, **between the existing "Sources and methodology" section and the existing author trust box** (i.e., the lead magnet is the second-to-last element on the page before the "Created by Renato Bryant" box).

The 5 pages: `digital-nomad-calculator`, `cost-of-living-comparison`, `break-even-savings-calculator`, `tax-residency-checker`, `nomad-health-insurance-estimator`.

Also add the lead-magnet block to the homepage, **only inside the move-abroad workflow card** (a small "Get the move decision pack" link beneath the existing primary CTA).

## 4.2 GA4 event tracking

### Event taxonomy

Use these exact event names (snake_case, lowercase, GA4-compliant, prefixed with `fth_` to distinguish from auto-collected events):

| Event name | Fires when | Parameters |
| --- | --- | --- |
| `fth_calculate_click` | User clicks any calculator's main "Calculate" button | `calculator_slug` (string), `decision_state` (string, optional — only if a state is rendered) |
| `fth_next_tool_click` | User clicks the "Recommended next step" link in any decision-state card | `from_calculator` (string), `to_calculator` (string), `from_state` (string) |
| `fth_lead_magnet_click` | User clicks the lead-magnet CTA button | `lead_magnet_key` (string), `placement` (string — e.g., "digital-nomad-calculator", "homepage-workflow") |
| `fth_pdf_download` | User clicks the "Download PDF" button on a calculator | `calculator_slug` (string) |
| `fth_email_send` | User clicks the "Send by Email" button on a calculator | `calculator_slug` (string) |
| `fth_share_click` | User clicks any social share button (X, Facebook, LinkedIn, WhatsApp) | `calculator_slug` (string), `platform` (string) |
| `fth_workflow_card_click` | User clicks a homepage workflow card's primary CTA | `workflow_key` (string) |
| `fth_start_here_click` | User clicks any of the 5 Start Here cards on the homepage | `entry_label` (string) |
| `fth_article_calc_link_click` | User clicks an inline calculator link inside an article | `article_slug` (string), `to_calculator` (string) |

### Implementation

Add a new file `src/assets/js/tracking.js` that defines a single helper:

```js
function fthTrack(name, params) {
  if (typeof gtag !== 'function') return;
  try { gtag('event', name, params || {}); } catch (e) { /* silent */ }
}
window.fthTrack = fthTrack;
```

Load it from `base.njk` AFTER `site.js`. Order matters: GA loads in head, `site.js` loads at end of body, then `tracking.js`.

Wire up the events:

- **`fth_calculate_click`** — In each calculator's `calcScript`, at the very top of `calculate()`, add `fthTrack('fth_calculate_click', { calculator_slug: '<slug>' });`. After the decision-state is rendered (if applicable), fire a second event with `decision_state` set. To keep it simple: fire one event with both `calculator_slug` and (optionally) `decision_state` at the END of `calculate()`, after `setDecisionState()` is called.
- **`fth_next_tool_click`** — Add an `onclick` to the `[data-next-step-link]` anchor in `partials/decision-state.njk` (or attach via JS in `site.js` using event delegation). Read `from_calculator` from a `data-` attribute on the calculator section, `to_calculator` from the link's href, `from_state` from `data-state` on the decision card.
- **`fth_lead_magnet_click`** — Attach via event delegation in `site.js` to clicks on `[data-lead-magnet]`. `placement` = the value of `data-lead-magnet-placement` on the same button (set per page).
- **`fth_pdf_download`**, **`fth_email_send`**, **`fth_share_click`** — Modify `downloadResultPDF()`, `emailResult()`, and `shareUrl()` in `site.js` to fire their event before doing their action. Each function already gets the calculator title/result; you can pass the calculator slug as a parameter from the calculator's onclick handler, or read `document.body.dataset.calculatorSlug` (set this attribute via `base.njk` from frontmatter).
- **`fth_workflow_card_click`**, **`fth_start_here_click`** — Add `onclick` to the cards in their respective partials.
- **`fth_article_calc_link_click`** — Use event delegation in `tracking.js`: on every page, listen for clicks on `a[href^="/"][href$="-calculator.html"]` inside `<article>` or `[data-article-body]`. Wrap the article body in `<div data-article-body data-article-slug="...">` in `article.njk`.

### Set body data attribute for calculator pages

In `base.njk`, change `<body class="...">` to `<body class="..." {% if activeKey %}data-calculator-slug="{{ activeKey }}"{% endif %}>`. This gives `site.js` a way to know which calculator page it's on without parsing the URL.

## 4.3 Monetization placement document

Create `src/MONETIZATION_PLACEMENTS.md` (yes, in `src/` — but exclude it from the build by adding `.eleventyignore` if needed; or place it at the repo root as `MONETIZATION_PLACEMENTS.md`).

Contents:

```markdown
# Monetization Placement Plan (DRAFT — not yet shipped)

This document describes WHERE on the site future affiliate or monetization placements should go and WHAT category of partner fits each placement. **No affiliate links are live as of Week 4.** This is a planning artifact for owner review.

## Placement strategy principles

1. Affiliate placements only on pages where the user is actively considering a purchase decision.
2. Maximum one affiliate placement per page.
3. Affiliate placements must be visually distinct from editorial content (a labeled "Sponsored" or "Partner" badge).
4. Trust copy ("Created by Renato Bryant", methodology, sources) must always sit above any affiliate placement on the page.
5. No affiliate placements on About, Methodology, or Author pages.

## Per-page recommendations

### Tax-related pages

**Page:** `gig-tax-optimizer.html`
**Slot location:** Between "Sources and methodology" and the lead-magnet block.
**Partner category:** Tax software for self-employed (e.g., providers serving Schedule C filers, quarterly estimated tax automation).
**Editorial framing:** "Many freelancers use tax software designed for Schedule C filers to automate quarterly payments and deductions. [Partner name] is one option."
**Why this slot:** User has just seen their tax exposure and is highest-intent for a solution.

**Page:** `tax-bracket-calculator.html`
**Slot location:** Same.
**Partner category:** General-purpose tax filing software.
**Editorial framing:** "If you want to file your own taxes with this estimate as a starting point, [Partner] is a commonly used option."

### Insurance pages

**Page:** `nomad-health-insurance-estimator.html`
**Slot location:** Between "Sources and methodology" and the lead-magnet block.
**Partner category:** International health insurance for nomads (e.g., providers offering global plans, expat coverage).
**Editorial framing:** "International health insurance varies widely by carrier, country, age, and coverage. [Partner] is one provider commonly used by long-term remote workers."

### Retirement pages

**Page:** `retirement-savings-calculator.html`
**Slot location:** Between the "Common scenarios" section and "Sources and methodology".
**Partner category:** Brokerages or robo-advisors with low-fee index investing.
**Editorial framing:** "Most retirement projections assume you're investing the contributions in a diversified, low-cost portfolio. [Partner] is one platform for self-directed retirement investing."

### Pages with NO affiliate placement (recommended)

- `index.html` (homepage) — keep clean for first-impression trust.
- `about.html`, `methodology.html`, `author-renato-bryant.html` — trust pages.
- `articles/*.html` — articles maintain editorial integrity; recommend only contextual links to calculators, not partners.
- `take-home-pay-calculator.html`, `mortgage-overpayment-calculator.html`, `credit-card-payoff-calculator.html` — these tools have weaker partner alignment in 2026; revisit later.
- `digital-nomad-calculator.html`, `cost-of-living-comparison.html`, `break-even-savings-calculator.html`, `tax-residency-checker.html` — these get the lead magnet instead. Revisit affiliate fit only if the lead-magnet conversion rate underperforms.

## Disclosure language template

For any page with an affiliate link, add a one-line disclosure block above the placement:

> _Affiliate disclosure: This section may include affiliate links. Finance Tools Hub may earn a commission if you sign up via these links. Editorial content is not influenced by affiliate relationships._

## Next steps for the owner

1. Identify candidate partners in each category.
2. Sign up for affiliate programs and obtain tracking links.
3. Review FTC disclosure requirements for the user's geography.
4. Update this document with chosen partners and live links.
5. A/B test placement performance against the lead-magnet performance.
```

## 4.4 Other "next step" CTAs

Audit the remaining 6 calculators (the ones NOT touched in Week 2):
- `mortgage-overpayment-calculator`
- `credit-card-payoff-calculator`
- `tax-bracket-calculator`
- `retirement-savings-calculator`
- `cost-of-living-comparison`
- `nomad-health-insurance-estimator`

For each, check that the existing "Related calculators" section already lists 3 plausible next steps. If any of them have fewer than 3 related calculators, add up to 3 from the same workflow. Do NOT add decision-state UX to these calculators (out of scope).

## File-level changes (Week 4)

| File | Action |
| --- | --- |
| `src/_data/leadMagnets.json` | **Create** |
| `src/_includes/partials/lead-magnet.njk` | **Create** |
| `src/static/downloads/nomad-move-decision-pack.pdf` (or `.md`) | **Create** placeholder |
| `src/assets/js/tracking.js` | **Create** |
| `src/_includes/layouts/base.njk` | Add `data-calculator-slug` to body; load `tracking.js` after `site.js` |
| `src/assets/js/site.js` | Wire `fthTrack()` calls into `shareUrl`, `downloadResultPDF`, `emailResult`; add event delegation for `[data-lead-magnet]` and `[data-next-step-link]` |
| `src/calculators/digital-nomad-calculator.njk` | Insert lead-magnet partial in `bodyHtml`; add `fth_calculate_click` event |
| `src/calculators/cost-of-living-comparison.njk` | Same |
| `src/calculators/break-even-savings-calculator.njk` | Same |
| `src/calculators/tax-residency-checker.njk` | Same |
| `src/calculators/nomad-health-insurance-estimator.njk` | Insert lead-magnet partial; add `fth_calculate_click` event |
| `src/calculators/take-home-pay-calculator.njk` | Add `fth_calculate_click` event |
| `src/calculators/gig-tax-optimizer.njk` | Same |
| (6 other calculators) | Add `fth_calculate_click` event only — no lead magnet, no decision state |
| `src/index.njk` | Add lead-magnet link inside the move-abroad workflow card; add `fth_workflow_card_click` and `fth_start_here_click` handlers |
| `src/_includes/partials/workflow-card.njk` | Add `data-workflow-key` and onclick for tracking |
| `src/_includes/partials/start-here.njk` | Add `data-entry-label` and onclick for tracking |
| `MONETIZATION_PLACEMENTS.md` (repo root) | **Create** with the doc above |
| `.eleventyignore` | **Create** if needed; include `MONETIZATION_PLACEMENTS.md`, `README.md` |
| `src/sitemap.njk` | No change — lead magnet PDF and monetization doc don't get sitemap entries |

## Acceptance criteria (Week 4)

- [ ] All 5 nomad-cluster calculator pages render the lead-magnet block between Sources and the author box.
- [ ] Lead-magnet block CTA links to `/downloads/nomad-move-decision-pack.pdf` (or `.md`) and the file exists in `dist/downloads/`.
- [ ] Homepage move-abroad workflow card contains a "Get the Nomad Move Decision Pack" secondary link.
- [ ] All 11 calculators fire `fth_calculate_click` on Calculate button click. Verify at least 3 in DevTools Network tab (look for the `gtag` collect request) by clicking Calculate.
- [ ] Decision-state pages (the 5 from Week 2) fire `fth_next_tool_click` when their next-step link is clicked.
- [ ] All 11 calculators fire `fth_pdf_download`, `fth_email_send`, `fth_share_click` from their respective buttons.
- [ ] Homepage workflow CTAs fire `fth_workflow_card_click`. Start Here cards fire `fth_start_here_click`.
- [ ] All 5 article pages fire `fth_article_calc_link_click` when an inline calculator link is clicked from inside the article body.
- [ ] Lead-magnet CTA fires `fth_lead_magnet_click` with both `lead_magnet_key` and `placement`.
- [ ] No JavaScript errors on any page in DevTools console with default inputs and a representative click sequence.
- [ ] `MONETIZATION_PLACEMENTS.md` exists at repo root, exactly per the template in §4.3.
- [ ] `MONETIZATION_PLACEMENTS.md` is excluded from the Eleventy build (does not appear in `dist/`).
- [ ] No live affiliate links anywhere in `dist/`. Search `dist/` for typical affiliate domains and confirm zero matches: `grep -ri "amzn.to\|impact.com\|tradedoubler\|cj.com\|rakuten\|shareasale" dist/` returns empty.
- [ ] All Week 1, 2, 3 acceptance criteria still pass (no regressions).

## Out of scope (Week 4)

- Do not author the actual Decision Pack PDF content. A placeholder is fine.
- Do not implement an email-capture form. The lead magnet is a direct download for now.
- Do not add affiliate links — only the planning document.
- Do not add tracking for scroll depth, time-on-page, or other engagement signals — those are auto-collected by GA4 enhanced measurement and don't need code.
- Do not add decision-state UX to the other 6 calculators.

---

# Final deliverables (end of Week 4)

After all four weeks, produce the following summary as a markdown file at the repo root: `EXECUTION_SUMMARY.md`.

It must contain:

1. **What changed each week** — one short paragraph per week, factual, no marketing language.
2. **Full list of files modified** — grouped by week.
3. **Full list of files created** — grouped by week.
4. **Sitemap changes** — before/after URL count and the URLs added.
5. **Recommended next priorities for the following 30 days** — 5 to 8 specific items, each with: priority level (high/medium/low), estimated effort (S/M/L), and expected impact in one line.

The "next priorities" section should think about: authoring the actual Decision Pack PDF, adding the email-capture form behind it, expanding decision-state UX to the other 6 calculators, adding more articles, addressing any technical debt observed during the four weeks (such as moving Tailwind off the CDN to a local build), and proposing the first specific affiliate partners.

---

# Universal rules across all four weeks

1. **Always run `npm run build` before declaring a week complete.** Verify dist/ files render correctly in a browser at three viewports: 375px, 768px, 1280px.
2. **Never edit `dist/` directly.** Only edit `src/`.
3. **Don't break URLs.** All current calculator and trust-page URLs must continue to resolve at the same paths.
4. **Don't change the visual theme.** Keep emerald-700/emerald-50 + slate accents. No new colors. No new fonts.
5. **Don't add JS frameworks.** No React, no Vue, no Alpine. Plain JS only.
6. **Don't change the Tailwind setup.** It stays on the CDN. (Migrating to a local Tailwind build is a future-30-days item, not now.)
7. **Use the data layer for shared content.** Anything that appears on more than one page should live in `_data/`.
8. **Keep all hedging and trust language verbatim** as specified in this brief.
9. **Don't invent thresholds, dollar amounts, or country-specific tax rules** beyond what's in this document. If unspecified, ask.
10. **Each week's commit should reference this brief.** Use commit messages like `Week 1: homepage workflow architecture`, `Week 2: decision-state UX (5 calculators)`, etc.

---

# Glossary

- **Workflow** — One of the three high-level user journeys: Income Reality, Freelance & Gig Money, Move Abroad Economics.
- **Decision state** — A labeled interpretation of a calculator's output (e.g., "lower take-home", "underreserved").
- **Lead magnet** — A free downloadable resource offered in exchange for (eventually) an email address. The Decision Pack is the only one in scope.
- **YMYL** — "Your Money or Your Life" — Google's term for content categories where accuracy and trust matter most. Tax, finance, and health all qualify.
- **Hedging line** — The exact phrase: "This is an educational estimate. Real outcomes depend on your full situation. Talk to a qualified professional before making major decisions."

---

End of brief.
