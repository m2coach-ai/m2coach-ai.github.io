// Demonstration for scene 3 (Module 3, Numerical Analysis): the row that did not add up.
//
// SOURCE: modules/numerical-analysis/entries/brown-table-ii-figure-and-discussion.html
//         modules/numerical-analysis/entries/reflection-from-output-to-judgment.html
//   Row 8 ("Attitudes of fellow partners") as printed in Brown (1994), Table II:
//     counts sum to 490; surrounding rows sit near 545; printed percentages sum to 90%.
//     disagree 178 (33%), no opinion 109 (20%), agree 37%.
//   Agree count: 203. This is worked out as 490 - 178 - 109; the page states the three facts it comes from.
//   Reconstructed no-opinion value: about 164 (not the printed 109), which brings the row to about 545.
//   On 545: 178 = 33%, 164 = 30%, 203 = 37%, which add to 100.
// If the artefact's reasoning changes, change these numbers and the starting values in index.html together.
(function () {
  'use strict';
  var root = document.querySelector('[data-demo="row8"]'); if (!root) return;
  var el = function (k) { return root.querySelector('[data-row8="' + k + '"]'); };
  var STATES = {
    printed: { mid: 109, gap: 55, total: '490', pct: '90%', miss: true,
      label: 'Row 8 as printed: 178 disagree, 109 no opinion, 203 agree, total 490.',
      note: 'As printed, the row is about 55 responses short of the rows around it and its percentages stop at 90.' },
    rebuilt: { mid: 164, gap: 0, total: 'about 545', pct: '100%', miss: false,
      label: 'Row 8 reconstructed: 178 disagree, about 164 no opinion, 203 agree, total about 545.',
      note: 'With the no-opinion cell at about 164, the row matches its neighbours and the percentages reach 100. The figure marks this cell as reconstructed.' }
  };
  function show(name) {
    var s = STATES[name]; if (!s) return;
    el('mid').style.flexGrow = s.mid; el('gap').style.flexGrow = s.gap;
    el('midn').textContent = (name === 'rebuilt' ? 'about ' : '') + s.mid;
    el('mid').classList.toggle('is-rebuilt', name === 'rebuilt');
    el('total').textContent = s.total; el('pct').textContent = s.pct;
    el('pctbox').classList.toggle('is-miss', s.miss);
    el('bar').setAttribute('aria-label', s.label); el('note').textContent = s.note;
  }
  root.addEventListener('change', function (e) { if (e.target.name === 'row8') show(e.target.value); });
})();
