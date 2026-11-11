// Demonstration for scene 1 (Module 1, Launch into Computing): the silent logic error.
//
// SOURCE: modules/launch-into-computing/entries/part-a1-silent-logic-error.html
//   Test list:        ["Alice", "bob", "alice", "Charlie", "BOB", "dave", "Eve", "charlie"]
//   Original output:  ['Alice', 'BOB', 'Charlie', 'Eve', 'alice', 'bob', 'charlie', 'dave']   (8 entries)
//   Modified output:  ['Alice', 'Bob', 'Charlie', 'Dave', 'Eve']                              (5 entries)
// The two functions below do what the two Python scripts on that page do. If the artefact changes, change
// these and the default text in index.html together, and check both outputs still match the figures above.
//
// The page shows the artefact's results without this script. The script only lets a reader try other names.
(function () {
  'use strict';
  var root = document.querySelector('[data-demo="names"]'); if (!root) return;
  var input = root.querySelector('textarea');
  var out = function (k) { return root.querySelector('[data-names-out="' + k + '"]'); };
  var count = function (k) { return root.querySelector('[data-names-count="' + k + '"]'); };
  var verdict = root.querySelector('[data-names-verdict="original"]');

  // Original script: list(set(names)), then sort(). Case-sensitive, and capitals sort before lower case.
  function original(names) {
    var seen = {}, unique = [];
    names.forEach(function (n) { if (!Object.prototype.hasOwnProperty.call(seen, n)) { seen[n] = true; unique.push(n); } });
    return unique.sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
  }
  // Modified script: lower-case key, Title Case value, sorted.
  function title(s) { return s.toLowerCase().replace(/(^|[^a-z])([a-z])/g, function (m, p, c) { return p + c.toUpperCase(); }); }
  function modified(names) {
    var seen = {};
    names.forEach(function (n) { var key = n.toLowerCase(); if (!Object.prototype.hasOwnProperty.call(seen, key)) seen[key] = title(n); });
    return Object.keys(seen).map(function (k) { return seen[k]; }).sort(function (a, b) { return a < b ? -1 : a > b ? 1 : 0; });
  }
  var plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : many); };

  function run() {
    var names = input.value.split(/[,\n]/).map(function (s) { return s.trim(); }).filter(Boolean);
    var a = original(names), b = modified(names), extra = a.length - b.length;
    // the duplicated names are underlined: any name whose lower-case form appears more than once in the output
    var seenLower = {}; a.forEach(function (x) { var k = x.toLowerCase(); seenLower[k] = (seenLower[k] || 0) + 1; });
    var box = out('original'); box.textContent = '';
    a.forEach(function (x, i) {
      if (i) box.appendChild(document.createTextNode(', '));
      if (seenLower[x.toLowerCase()] > 1) { var m = document.createElement('mark'); m.textContent = x; box.appendChild(m); }
      else box.appendChild(document.createTextNode(x));
    });
    count('original').textContent = plural(a.length, 'entry', 'entries');
    out('modified').textContent = b.join(', '); count('modified').textContent = plural(b.length, 'entry', 'entries');
    verdict.textContent = extra > 0 ? 'No error. ' + plural(extra, 'entry is a duplicate', 'entries are duplicates') + ' the script did not catch, underlined above.'
      : 'No duplicates slipped through this time.';
    root.classList.toggle('is-clean', extra === 0);
  }
  input.addEventListener('input', run);
})();
