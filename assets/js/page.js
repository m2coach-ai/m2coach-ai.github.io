// Inner pages: small progressive enhancements. Every page works without this script.
// Loaded in the <head> (it is tiny) so the first part can run before the page is first shown.
(function () {
  'use strict';

  // 0. Arriving from the book: the homepage leaves a note in sessionStorage when it hands its paper layer over.
  //    Tag the view transition so the page replaces the desk at once, under the paper layer, instead of letting
  //    the darkened desk show through while the page fades in (see page.css).
  addEventListener('pagereveal', function (e) {
    try {
      if (e.viewTransition && e.viewTransition.types && sessionStorage.getItem('book-handoff')) {
        e.viewTransition.types.add('handoff');
        sessionStorage.removeItem('book-handoff');
      }
    } catch (_) { /* storage or types unavailable: the normal cross-fade is used */ }
  });

  // 3. Tables that are wider than the screen say so (runs first, so it works even without IntersectionObserver).
  function tableHints() {
    Array.prototype.slice.call(document.querySelectorAll('.table-wrap')).forEach(function (wrap) {
      var hint = null;
      var check = function () {
        var wide = wrap.scrollWidth > wrap.clientWidth + 1;
        if (wide && !hint) {
          hint = document.createElement('p'); hint.className = 'scroll-hint'; hint.textContent = 'This table scrolls sideways.';
          wrap.insertAdjacentElement('afterend', hint);
        } else if (!wide && hint) { hint.remove(); hint = null; }
      };
      check(); addEventListener('resize', check);
    });
  }

  // 4. A way back on long pages: the section list carries "back" links, and narrow screens get a floating Top button.
  function wayBack() {
    var sheet = document.querySelector('.sheet'); if (!sheet) return;
    var pills = document.querySelectorAll('.site-actions a.pill'), hub = pills[pills.length - 1];
    var rail = sheet.querySelector('.rail');
    if (!rail) {
      rail = document.createElement('nav'); rail.className = 'rail'; rail.setAttribute('aria-label', 'Page navigation');
      sheet.insertBefore(rail, sheet.firstChild);
    }
    var box = document.createElement('div'); box.className = 'rail-back';
    if (hub) { var a = document.createElement('a'); a.href = hub.getAttribute('href'); a.textContent = '\u2190 ' + (/hub/i.test(hub.textContent) ? 'Back to module hub' : hub.textContent.trim()); box.appendChild(a); }
    var up = document.createElement('a'); up.href = '#main'; up.textContent = '\u2191 Back to top';
    up.addEventListener('click', function (e) { e.preventDefault(); window.scrollTo({ top: 0 }); var m = document.getElementById('main'); if (m) { m.setAttribute('tabindex', '-1'); m.focus({ preventScroll: true }); } });
    box.appendChild(up); rail.insertBefore(box, rail.firstChild);
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'to-top'; btn.textContent = '\u2191 Top'; btn.setAttribute('aria-label', 'Back to top');
    btn.addEventListener('click', function () { window.scrollTo({ top: 0 }); });
    document.body.appendChild(btn);
    var tick = function () { btn.classList.toggle('on', window.scrollY > 700); };
    addEventListener('scroll', tick, { passive: true }); tick();
  }

  // 5. Modules menu: mark the module being read, and close the menu on Escape or a click elsewhere.
  function modulesMenu() {
    var menu = document.querySelector('.pill-menu'); if (!menu) return;
    Array.prototype.slice.call(menu.querySelectorAll('a')).forEach(function (a) {
      if (location.pathname.indexOf(new URL(a.href, location.href).pathname) === 0) a.setAttribute('aria-current', 'page');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary').focus(); } });
    document.addEventListener('click', function (e) { if (menu.open && !menu.contains(e.target)) menu.open = false; });
  }

  function enhance() {
    tableHints();
    wayBack();
    modulesMenu();
    if (!('IntersectionObserver' in window)) return;

    // 1. The optional section list marks the section in view (aria-current).
    var links = Array.prototype.slice.call(document.querySelectorAll('.rail a[href^="#"]'));
    if (links.length) {
      var visible = {};
      var mark = function () {
        var current = null;
        links.forEach(function (a) { if (current === null && visible[a.getAttribute('href').slice(1)]) current = a; });
        links.forEach(function (a) { if (a === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
      };
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting; });
        mark();
      }, { rootMargin: '-20% 0px -55% 0px' });
      links.forEach(function (a) { var el = document.getElementById(a.getAttribute('href').slice(1)); if (el) spy.observe(el); });
    }

    // 2. Evidence blocks used to fade in on scroll. Turned off so quotes, figures and tables are always visible
    //    (screenshots, printing and fast scrolling caught them blank). The code below is kept but never runs.
    return;
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var blocks = Array.prototype.slice.call(document.querySelectorAll('.block'));
    if (!blocks.length) return;
    document.documentElement.classList.add('reveal-ready');
    var show = function (el) { el.classList.add('seen'); };
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { show(e.target); reveal.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    blocks.forEach(function (b) { reveal.observe(b); });
    setTimeout(function () { blocks.forEach(show); }, 6000);   // nothing stays hidden, whatever happens
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', enhance); else enhance();
})();
