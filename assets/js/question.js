// Landing page: the trail in the hero marks the scene in view. Everything is readable without this script.
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  var scenes = Array.prototype.slice.call(document.querySelectorAll('.scene'));
  var trail = Array.prototype.slice.call(document.querySelectorAll('.q-trail a'));
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      trail.forEach(function (a) { if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  scenes.forEach(function (s) { spy.observe(s); });
})();
