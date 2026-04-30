// Lightweight GA4 helper. Calls gtag('event', name, params). Silent no-op
// when gtag is missing (ad-blockers, dev environments, consent denied).
function fthTrack(name, params) {
  if (typeof gtag !== 'function') return;
  try { gtag('event', name, params || {}); } catch (e) { /* silent */ }
}
window.fthTrack = fthTrack;

// Event delegation for events the brief calls for. Avoids requiring an
// onclick attribute on every individual element.
document.addEventListener('click', function (e) {
  // fth_next_tool_click — decision-state next-step links (5 calculators in scope).
  var nextLink = e.target.closest && e.target.closest('a[data-next-step-link]');
  if (nextLink) {
    var card = nextLink.closest('[data-decision-state]');
    var fromCalculator = (document.body.dataset && document.body.dataset.calculatorSlug) || '';
    var fromState = (card && card.dataset && card.dataset.state) || '';
    var href = nextLink.getAttribute('href') || '';
    var slugMatch = href.match(/\/([^/?#]+)\.html(?:[?#].*)?$/);
    fthTrack('fth_next_tool_click', {
      from_calculator: fromCalculator,
      to_calculator: slugMatch ? slugMatch[1] : '',
      from_state: fromState
    });
  }

  // fth_lead_magnet_click — any clickable element carrying data-lead-magnet.
  var lm = e.target.closest && e.target.closest('[data-lead-magnet]');
  if (lm) {
    fthTrack('fth_lead_magnet_click', {
      lead_magnet_key: lm.dataset.leadMagnet || '',
      placement: lm.dataset.leadMagnetPlacement || ''
    });
  }

  // fth_workflow_card_click — homepage workflow primary CTAs.
  var wf = e.target.closest && e.target.closest('[data-workflow-key]');
  if (wf) {
    fthTrack('fth_workflow_card_click', { workflow_key: wf.dataset.workflowKey || '' });
  }

  // fth_start_here_click — homepage Start Here entry-point cards.
  var sh = e.target.closest && e.target.closest('[data-entry-label]');
  if (sh) {
    fthTrack('fth_start_here_click', { entry_label: sh.dataset.entryLabel || '' });
  }

  // fth_article_calc_link_click — calculator links inside article body.
  // The brief's narrow selector misses 4 calculators whose slug doesn't end
  // in "-calculator". Match against the full calculator slug list instead.
  var articleWrap = e.target.closest && e.target.closest('[data-article-body]');
  if (articleWrap) {
    var aLink = e.target.closest('a[href]');
    if (aLink) {
      var ahref = aLink.getAttribute('href') || '';
      var am = ahref.match(/^\/([^/?#]+)\.html(?:[?#].*)?$/);
      if (am) {
        var aslug = am[1];
        var calcSlugs = ['take-home-pay-calculator', 'mortgage-overpayment-calculator', 'credit-card-payoff-calculator', 'tax-bracket-calculator', 'retirement-savings-calculator', 'gig-tax-optimizer', 'digital-nomad-calculator', 'cost-of-living-comparison', 'break-even-savings-calculator', 'tax-residency-checker', 'nomad-health-insurance-estimator'];
        if (calcSlugs.indexOf(aslug) !== -1) {
          fthTrack('fth_article_calc_link_click', {
            article_slug: articleWrap.dataset.articleSlug || '',
            to_calculator: aslug
          });
        }
      }
    }
  }
});
