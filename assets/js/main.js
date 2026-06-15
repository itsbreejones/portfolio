/* main.js — shared utilities across all pages.
   Persona copy lives here so home (popup) and lore (welcome) stay in sync. */

window.BREE = window.BREE || {};

window.BREE.personas = {
  scout: {
    name: 'The Scout',
    popup: "Your view has been organized around what matters most for hiring: technical scope, program depth, and track record first.",
    welcome: "No fluff up top. The technical work is front and center. Everything else is a scroll away when you're ready."
  },
  ally: {
    name: 'The Ally',
    popup: "We're leading with the human side. Who I am, what I care about, what I'm curious about. The work comes after.",
    welcome: "Starting with who I am before what I've shipped. All the work is here, just a little further down."
  },
  wanderer: {
    name: 'The Wanderer',
    popup: "You get the full, unfiltered version. No special sort, no curation. Start wherever you want.",
    welcome: "No agenda, no curation. You've got the full version. Start wherever."
  },
  default: {
    name: 'The Scout',
    welcome: "No fluff up top. The technical work is front and center. Everything else is a scroll away when you're ready."
  }
};

/* Day/night toggle. The current mode = explicit data-theme if set, else system. */
(function () {
  function currentTheme() {
    var attr = document.documentElement.getAttribute('data-theme');
    if (attr) return attr;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }
  function init() {
    var btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      setTheme(currentTheme() === 'dark' ? 'light' : 'dark');
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* CRT effect: barrel/curve warp on the grid layer + mouse parallax.
   Skipped entirely for prefers-reduced-motion. */
(function () {
  function initCRT() {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Inject the warp filter (referencing a missing filter id can blank the
    // element, so we only add the class after the filter exists).
    var ns = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;pointer-events:none';
    svg.innerHTML =
      '<filter id="crt-warp" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.0011 0.0016" numOctaves="2" seed="6" result="noise"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="noise" scale="52" xChannelSelector="R" yChannelSelector="G"/>' +
      '</filter>';
    document.body.appendChild(svg);
    document.body.classList.add('crt-warp');

    // Mouse parallax — shift the grid layer slightly opposite the cursor.
    var raf = null, tx = 0, ty = 0;
    function apply() {
      raf = null;
      document.body.style.setProperty('--grid-x', tx.toFixed(1) + 'px');
      document.body.style.setProperty('--grid-y', ty.toFixed(1) + 'px');
    }
    window.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * -16;   // up to ~8px each way
      ty = (e.clientY / window.innerHeight - 0.5) * -16;
      if (!raf) raf = requestAnimationFrame(apply);
    }, { passive: true });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCRT);
  } else {
    initCRT();
  }
})();
