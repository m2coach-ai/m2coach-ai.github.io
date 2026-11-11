// Landing page: scenes rise into place as they are reached, and the trail marks the scene in view.
// Everything is readable without this script. Nothing is hidden unless the script is running and motion is welcome.
(function () {
  'use strict';
  if (!('IntersectionObserver' in window)) return;
  var scenes = Array.prototype.slice.call(document.querySelectorAll('.scene'));
  var trail = Array.prototype.slice.call(document.querySelectorAll('.q-trail a'));
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('q-motion');
    var seen = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); seen.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -12% 0px' });
    scenes.forEach(function (s) { seen.observe(s); });
    setTimeout(function () { scenes.forEach(function (s) { s.classList.add('is-in'); }); }, 5000);   // nothing stays hidden, whatever happens
  }
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      trail.forEach(function (a) { if (a.getAttribute('href') === '#' + e.target.id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    });
  }, { rootMargin: '-40% 0px -50% 0px' });
  scenes.forEach(function (s) { spy.observe(s); });
})();
