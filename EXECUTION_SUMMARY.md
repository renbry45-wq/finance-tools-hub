# Finance Tools Hub — 4-Week Execution Summary

This document summarizes the work performed during the four-week build that took FinanceToolsHub from a calculator directory to a workflow-driven decision platform. It is the final deliverable of the brief at [`FINANCE_TOOLS_HUB_4_WEEK_BRIEF.md`](./FINANCE_TOOLS_HUB_4_WEEK_BRIEF.md).

## What changed each week

**Week 1 — Homepage and workflow architecture.** Replaced the homepage's calculator-list framing with three workflow cards (Income Reality, Freelance & Gig Money, Move Abroad Economics), a five-card "Start Here" entry-point grid, an "All calculators" grid, and a three-column trust strip linking to methodology, about, and author pages. Added two data files (`workflows.json`, `startHere.json`) and three partials (`start-here.njk`, `workflow-card.njk`, `trust-strip.njk`). The hero `<h1>` was rewritten from "Finance Tools Hub 2026" to "Finance Tools Hub", and the meta description was updated to the workflow-focused copy. No calculator pages or layouts were modified.

**Week 2 — Decision-state UX on five calculators.** Added an interpreted-result block (state label, color band, body paragraph, "recommended next step" link, hedging line) to take-home-pay, gig-tax-optimizer, digital-nomad, break-even-savings, and tax-residency-checker. Each calculator's `calcScript` got a `setDecisionState()` helper and a threshold block that picks the right state from the calculator's existing intermediate values. Implementation choices: gig-tax-optimizer treats total tax owed as `recommendedReserve` (option A), tax-residency-checker maps its existing Low/Moderate/High tier directly to `lower-watch`/`review-recommended`/`higher-residency-risk`. Defaults adjusted: take-home-pay annual=$75,000, retirement=4%, health=$80 (lands typical-cash-flow); tax-residency days=90 (lands lower-watch). Two follow-up commits fixed a Tailwind-CDN safelist gap and bumped the decision-state color intensity from -50/-200 to -100/-300 for visibility.

**Week 3 — Article engine and five decision articles.** Built an article system from scratch: `articles.json` data registry, `layouts/article.njk` intermediate layout, `articles/index.njk` index page (at `/articles/index.html` per directive), JSON-LD `Article` schema in each article's `<head>`, and plain-CSS prose styles in `site.css` (no `@apply`, since Tailwind runs from the CDN). Authored five articles totaling ~5,000 words: compare job offers using take-home pay, freelancer tax reserve 2026, is moving abroad actually cheaper, relocation break-even guide, and 183-day rule for remote workers. Each article has 6–7 H2 sub-sections, 2–5 inline calculator links, and the verbatim educational-guide hedging phrase. Sitemap grew from 15 to 21 URLs. Five calculators got "Related reading" callouts pointing to their primary article; tax-residency-checker's Week-2 fallback link to `/methodology.html` was switched to the now-existing 183-day-rule article URL. Added a `longDate` Eleventy filter for "May 5, 2026"-style date rendering.

**Week 4 — Lead magnet, GA4 events, and monetization plan.** Created the Digital Nomad Move Decision Pack as a placeholder Markdown file at `/downloads/nomad-move-decision-pack.md`, with `_data/leadMagnets.json`, an Eleventy passthrough rule for `src/static/downloads/`, and a canonical lead-magnet partial. The lead-magnet block was inlined into the five nomad-cluster calculator pages (digital-nomad, cost-of-living, break-even, tax-residency, nomad-insurance), and a smaller secondary link added to the homepage move-abroad workflow card. Wired nine GA4 events through a new `tracking.js` helper and additions to `site.js`. The brief's narrow `a[href$="-calculator.html"]` selector was widened in `tracking.js` to match all 11 calculator slugs (four don't end in `-calculator`). Authored `MONETIZATION_PLACEMENTS.md` at repo root, verbatim per the brief's template — no live affiliate links shipped. The `.eleventy.js` passthrough for `src/static/downloads/` was added in this week per the user-flagged note from the audit.

## Files created (by week)

**Week 1:**
- `src/_data/workflows.json`
- `src/_data/startHere.json`
- `src/_includes/partials/start-here.njk`
- `src/_includes/partials/workflow-card.njk`
- `src/_includes/partials/trust-strip.njk`

**Week 2:**
- `src/_includes/partials/decision-state.njk` (canonical reference; not `{% include %}`-d by Eleventy because frontmatter strings aren't processed as templates)

**Week 3:**
- `src/_data/articles.json`
- `src/_includes/layouts/article.njk`
- `src/articles/index.njk`
- `src/articles/compare-job-offers-take-home-pay.njk`
- `src/articles/freelancer-tax-reserve-2026.njk`
- `src/articles/is-moving-abroad-cheaper.njk`
- `src/articles/relocation-break-even-guide.njk`
- `src/articles/183-day-rule-remote-workers.njk`

**Week 4:**
- `src/_data/leadMagnets.json`
- `src/_includes/partials/lead-magnet.njk` (canonical reference; same constraint as decision-state.njk)
- `src/static/downloads/nomad-move-decision-pack.md` (placeholder)
- `src/assets/js/tracking.js`
- `MONETIZATION_PLACEMENTS.md` (repo root, excluded from build)

## Files modified (by week)

**Week 1:**
- `src/index.njk` — body content rewritten into hero + Start Here + Workflows + All calculators + Trust strip + FAQ; meta description updated.

**Week 2:**
- `src/calculators/take-home-pay-calculator.njk` — defaults retirement 6→4 and health 120→80, decision-state HTML inline at end of `calcBody`, threshold logic and `setDecisionState()` helper appended to `calcScript`, header comment.
- `src/calculators/gig-tax-optimizer.njk` — same pattern (option-A reserve mapping using existing `total` as `recommendedReserve`).
- `src/calculators/digital-nomad-calculator.njk` — same plus a new `monthly-home` optional input and a `home-cost-note` element with null-input gating.
- `src/calculators/break-even-savings-calculator.njk` — same.
- `src/calculators/tax-residency-checker.njk` — same plus default days 120→90.

**Bug fixes (between Week 2 and Week 3):**
- `src/_includes/layouts/base.njk` — added Tailwind Play CDN safelist for the four runtime-added decision-state class pairs.
- 5 calculator files — color intensity bumped from `bg-*-50 border-*-200` to `bg-*-100 border-*-300` for visibility.

**Week 2 follow-up:**
- `src/calculators/take-home-pay-calculator.njk` — annual default 65k→75k so first-load demo lands on `typical-cash-flow` (slate) instead of `lower-take-home` (amber).

**Week 3:**
- `.eleventy.js` — added `longDate` filter for hero dates like "May 5, 2026".
- `src/sitemap.njk` — added `/articles/` index entry plus a loop over `articles` (15 → 21 URLs).
- `src/index.njk` — added `id="articles"` "Decision guides" section between all-tools and trust strip.
- `src/assets/css/site.css` — appended plain CSS for `.prose h2`, `.prose h3`, `.prose a`, `.prose a:hover`, `.prose blockquote`, `.prose ol`.
- 5 calculator files — added "Related reading" callout block before Sources/limitations.
- `src/calculators/tax-residency-checker.njk` — Week-2 fallback `/methodology.html` switched to `/articles/183-day-rule-remote-workers.html` in both `setDecisionState()` calls; comment updated.

**Week 4:**
- `.eleventy.js` — added passthrough rule for `src/static/downloads/` → `dist/downloads/`.
- `src/_data/workflows.json` — added `secondaryCta` field on the move-abroad workflow.
- `src/_includes/layouts/base.njk` — added `data-calculator-slug` to `<body>` (looked up from `activeKey`), and a `<script src="/assets/js/tracking.js">` tag after `site.js`.
- `src/_includes/layouts/article.njk` — added `data-article-body` and `data-article-slug` to the `<article>` wrapper.
- `src/_includes/partials/start-here.njk` — added `data-entry-label` to each card link.
- `src/_includes/partials/workflow-card.njk` — added `data-workflow-key` to the primary CTA, conditional secondary link rendering with `data-lead-magnet` and `data-lead-magnet-placement="homepage-workflow"`.
- `src/assets/js/site.js` — added `fth_pdf_download`, `fth_email_send`, `fth_share_click` calls in `downloadResultPDF`, `emailResult`, `shareUrl` respectively, all reading the calculator slug from `document.body.dataset.calculatorSlug`.
- 11 calculator files — `fth_calculate_click` appended to each `calculate()`; the 5 with decision-state include the `decision_state` parameter from `[data-decision-state]`'s `dataset.state`. Digital-nomad fires the event in both the post-threshold and the early-return branches.
- 5 nomad-cluster calculators — lead-magnet block inlined at end of `bodyHtml` with placement matching the calculator slug.

## Sitemap changes

**Before Week 1:** 15 URLs (homepage + 3 trust pages + 11 calculators).

**After Week 4:** 21 URLs (homepage + 3 trust + 11 calculators + 1 articles index + 5 articles).

Six URLs added during Week 3:

- `https://financetoolshub.net/articles/`
- `https://financetoolshub.net/articles/compare-job-offers-take-home-pay.html`
- `https://financetoolshub.net/articles/freelancer-tax-reserve-2026.html`
- `https://financetoolshub.net/articles/is-moving-abroad-cheaper.html`
- `https://financetoolshub.net/articles/relocation-break-even-guide.html`
- `https://financetoolshub.net/articles/183-day-rule-remote-workers.html`

Week 4 added no sitemap entries — the lead-magnet placeholder file and the monetization doc are intentionally excluded.

## Recommended next priorities (next 30 days)

| # | Priority | Effort | Item | Expected impact |
|---|---|---|---|---|
| 1 | **High** | S | **Document the local testing workflow (`npm run serve`) in `README.md`.** Future contributors testing dist/ via `file://` will hit a 404 on `/assets/js/site.js` and assume buttons are broken. The fix is a paragraph in the README, not a code change. | Saves the next contributor a confused diagnostic session. Uncovered when manual-testing surfaced absolute-path resolution under `file://`. |
| 2 | **High** | M | **Author the actual Decision Pack PDF** and replace the placeholder Markdown at `src/static/downloads/nomad-move-decision-pack.md`. The lead-magnet CTA currently leads users to a placeholder file. | Turns a visible CTA into actual user value. Required before any meaningful conversion-rate measurement of the lead magnet. |
| 3 | **Medium** | M | **Email-capture form behind the lead magnet.** The current download is direct (no email required). A capture form turns the magnet into a lead-collection mechanism without changing the on-page UX much. | Enables the email list that the brief assumed would gate the download. Without it, the lead magnet generates analytics events but no contact list. |
| 4 | **Medium** | L | **Expand decision-state UX to the other 6 calculators** (mortgage-overpayment, credit-card-payoff, tax-bracket, retirement-savings, cost-of-living, nomad-insurance). Define thresholds per calculator before implementing. | Completes the YMYL-interpretation pattern across the whole calculator set. Largest single content-design task remaining. |
| 5 | **Medium** | L | **Migrate Tailwind from the Play CDN to a local build.** The CDN prints a "should not be used in production" warning in DevTools, classes added at runtime require a `safelist` workaround, and the JIT regex misses some patterns. Local Tailwind also gives `@apply` access. | Removes the production warning, eliminates the safelist hack, enables `@apply` in `site.css`, modest perf improvement (no CDN round-trip + smaller CSS payload). |
| 6 | **Medium** | M | **Refactor the calculator layout to render `calcBody` through Nunjucks** (or move calcBody content out of frontmatter into the page body). Currently `calculator.njk` uses `{{ calcBody | safe }}`, so `{% include %}` inside the frontmatter string isn't processed. This is why the decision-state HTML and the lead-magnet HTML had to be inlined into 5 calculator pages each instead of included once via the corresponding partials. | Reduces 5-place edits to 1-place edits for any future change to the decision-state or lead-magnet markup. The two reference partials (`partials/decision-state.njk`, `partials/lead-magnet.njk`) become live `{% include %}` targets. |
| 7 | **Low** | M | **Expand tax-residency-checker form to 5–6 questions for a true flag-count system** (0–1 / 2 / 3+ flags) replacing the Week-2 option-A direct tier mapping. The brief's original threshold table assumed flag counts; option A was used because the existing form has only 3 inputs and the days-bucketed tiers don't cleanly map to a count. | Improves YMYL defensibility for the most regulation-sensitive calculator on the site. Requires editorial work to define the additional flag questions and explanations. |
| 8 | **Low** | L | **Identify and onboard first affiliate partners** per `MONETIZATION_PLACEMENTS.md`. Start with one category (most likely tax software for the gig-tax page or international health insurance for nomad-insurance) and ship a single placement with disclosure copy. | Activates the monetization plan that Week 4 only documented. Worth gating on lead-magnet conversion data first, per the placement strategy in the doc. |

## Other technical debt observed during the four weeks

These are smaller items that didn't make the list above but are worth flagging:

- **`npm run clean` script uses `rm -rf`,** which only works in bash/Git Bash on Windows. A cross-platform replacement (e.g., `rimraf`) would let the script work in PowerShell and cmd.
- **CRLF/LF line endings** generate warnings on every git operation under Windows. A `.gitattributes` file specifying line endings would silence these without affecting behavior.
- **Frontmatter strings aren't template-processed,** so the canonical partials for decision-state and lead-magnet exist as reference docs only. Captured as item 6 above.
- **Tax-residency Week-2 fallback** `/methodology.html` was a temporary marker that was cleaned up in Week 3. No remaining stale references in the codebase, but a similar fallback pattern in the future should ship with a tracked TODO.

---

End of summary.
