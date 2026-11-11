// Demonstration for scene 2 (Module 2, Understanding Artificial Intelligence): same accuracy, different mistakes.
//
// SOURCE: modules/understanding-artificial-intelligence/entries/unit-12-instantiating-the-model.html
//   Test cases: 114 (benign 72, malignant 42).
//   Table 4 / Figures 2 and 3, threshold 0.50:
//     Logistic regression: 3 false negatives, 1 false positive  -> 110 of 114 correct = 96.5%
//     Random Forest:       4 false negatives, 0 false positives -> 110 of 114 correct = 96.5%
//   Table B1, threshold sensitivity for logistic regression on the held-out test set:
//     0.30 -> false negatives 1, false positives 1
//     0.40 -> false negatives 2, false positives 1
//     0.50 -> false negatives 3, false positives 1
// Only these three thresholds were run in the artefact, so only these three can be chosen. Do not add a slider
// or any in-between value: there is no result behind it. Accuracy is shown only for 0.50, the one the artefact states.
(function () {
  'use strict';
  var root = document.querySelector('[data-demo="threshold"]'); if (!root) return;
  var RUNS = { '0.50': { fn: 3, fp: 1 }, '0.40': { fn: 2, fp: 1 }, '0.30': { fn: 1, fp: 1 } };
  var el = function (k) { return root.querySelector('[data-th="' + k + '"]'); };
  var one = function (n, a, b) { return n + ' ' + (n === 1 ? a : b); };

  function show(t) {
    var r = RUNS[t]; if (!r) return;
    el('fn').textContent = r.fn; el('fp').textContent = r.fp;
    el('note').textContent = t === '0.50'
      ? 'At the default threshold of 0.50, logistic regression misses 3 malignant cases and raises 1 false alarm.'
      : 'At a threshold of ' + t + ', logistic regression misses ' + one(r.fn, 'malignant case', 'malignant cases') + ' and still raises ' + one(r.fp, 'false alarm', 'false alarms') + '. The artefact reports this as an exploratory analysis on the held-out test set.';
  }
  root.addEventListener('change', function (e) { if (e.target.name === 'th') show(e.target.value); });
})();
