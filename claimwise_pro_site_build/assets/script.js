document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });
  }

  const money = (value) => new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD', maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);

  const number = (value) => new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0
  }).format(Number.isFinite(value) ? value : 0);

  const read = (formEl, name) => parseFloat(formEl.querySelector(`[name="${name}"]`)?.value || '0');

  const calculators = document.querySelectorAll('[data-calculator]');
  calculators.forEach((formEl) => {
    const type = formEl.getAttribute('data-calculator');
    const output = document.querySelector(`[data-calculator-output="${type}"]`);
    if (!output) return;

    const render = () => {
      let html = '';

      if (type === 'revenue-leakage') {
        const claims = read(formEl, 'claimsVolume');
        const avg = read(formEl, 'avgClaim');
        const rejectPct = read(formEl, 'rejectPct') / 100;
        const neverCollectedPct = read(formEl, 'neverCollectedPct') / 100;
        const annualBilling = claims * avg;
        const rejectedClaims = claims * rejectPct;
        const rejectedValue = annualBilling * rejectPct;
        const uncollected = rejectedValue * neverCollectedPct;
        const outsourcedRejectPct = 0.01;
        const outsourcedNeverCollectedPct = 0.03;
        const outsourcedLost = annualBilling * outsourcedRejectPct * outsourcedNeverCollectedPct;
        const improvement = Math.max(0, uncollected - outsourcedLost);
        html = `
          <h4>Estimated Results</h4>
          <ul class="result-list">
            <li><span>Estimated annual claims value</span><strong>${money(annualBilling)}</strong></li>
            <li><span>Estimated rejected claims</span><strong>${number(rejectedClaims)}</strong></li>
            <li><span>Estimated rejected claim value</span><strong>${money(rejectedValue)}</strong></li>
            <li><span>Estimated uncollected revenue today</span><strong>${money(uncollected)}</strong></li>
            <li><span>Illustrative annual revenue improvement</span><strong>${money(improvement)}</strong></li>
          </ul>
          <div class="calc-note">Illustrative benchmark compares your current assumptions to a modeled outsourced-state benchmark of 1% rejected claims and 3% unrecovered rejected-claim value.</div>`;
      }

      if (type === 'patient-payment') {
        const accts = read(formEl, 'outstandingAccounts');
        const avgBal = read(formEl, 'avgBalance');
        const neverRecoveredPct = read(formEl, 'neverRecoveredPct') / 100;
        const paymentPlanPct = read(formEl, 'paymentPlanPct') / 100;
        const avgNewPatientBill = read(formEl, 'avgNewPatientBill');
        const lostRevenue = accts * avgBal * neverRecoveredPct;
        const recoveryModelPct = 0.97;
        const recoveredRevenue = accts * avgBal * recoveryModelPct;
        const creditRiskRevenue = accts * paymentPlanPct * avgNewPatientBill;
        const addedIncome = Math.max(0, (recoveredRevenue - lostRevenue) + creditRiskRevenue);
        html = `
          <h4>Estimated Results</h4>
          <ul class="result-list">
            <li><span>Estimated lost revenue today</span><strong>${money(lostRevenue)}</strong></li>
            <li><span>Illustrative revenue recoverable with structured payment options</span><strong>${money(recoveredRevenue)}</strong></li>
            <li><span>Potential revenue from payment-plan qualified patients</span><strong>${money(creditRiskRevenue)}</strong></li>
            <li><span>Total illustrative annual income opportunity</span><strong>${money(addedIncome)}</strong></li>
          </ul>
          <div class="calc-note">Illustrative benchmark uses a modeled 97% recovery rate for balances supported by stronger payment structures.</div>`;
      }

      if (type === 'ar-recovery') {
        const pastDue = read(formEl, 'pastDueAccounts');
        const avgBalance = read(formEl, 'avgBalance');
        const recoveryPct = read(formEl, 'recoveryPct') / 100;
        const collectionCostPct = read(formEl, 'collectionCostPct') / 100;
        const annualCollected = pastDue * avgBalance * recoveryPct;
        const annualCost = annualCollected * collectionCostPct;
        const modeledRecoveryPct = 0.45;
        const revenueRecovered = (pastDue * avgBalance * modeledRecoveryPct) - annualCost;
        html = `
          <h4>Estimated Results</h4>
          <ul class="result-list">
            <li><span>Estimated annual revenue collected today</span><strong>${money(annualCollected)}</strong></li>
            <li><span>Estimated annual cost to collect</span><strong>${money(annualCost)}</strong></li>
            <li><span>Illustrative annual net recovery opportunity</span><strong>${money(revenueRecovered)}</strong></li>
          </ul>
          <div class="calc-note">Illustrative benchmark compares current-state recovery to a modeled 45% recovery scenario.</div>`;
      }

      if (type === 'telehealth') {
        const providers = read(formEl, 'providers');
        const visitsPerDay = read(formEl, 'visitsPerDay');
        const billPerVisit = read(formEl, 'billPerVisit');
        const workDays = 260;
        const annualRevenue = providers * visitsPerDay * billPerVisit * workDays;
        const annualPerProvider = providers > 0 ? annualRevenue / providers : 0;
        html = `
          <h4>Estimated Results</h4>
          <ul class="result-list">
            <li><span>Estimated annual telehealth revenue</span><strong>${money(annualRevenue)}</strong></li>
            <li><span>Estimated annual revenue per provider</span><strong>${money(annualPerProvider)}</strong></li>
          </ul>
          <div class="calc-note">Estimate assumes 260 working days per year. Adjust inputs to model conservative or aggressive utilization.</div>`;
      }

      output.innerHTML = html;
    };

    formEl.addEventListener('input', render);
    render();
  });
});
