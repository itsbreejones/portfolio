/* persona.js — Home page overlay: open/close, persona selection.
   On selection we write the persona + a "just selected" flag, then go straight
   to lore.html, where the popup overlays the page while sections shuffle in. */

(function () {
  var overlay   = document.getElementById('persona-overlay');
  var openBtn   = document.getElementById('press-start');
  var closeBtn  = document.getElementById('overlay-close');
  var cards     = document.querySelectorAll('.persona-card');
  if (!overlay || !openBtn) return;

  var personas = (window.BREE && window.BREE.personas) || {};

  function openOverlay() {
    overlay.classList.add('is-open');
    if (window.gsap) {
      gsap.fromTo(overlay.querySelector('.mac-window'),
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.6)' });
    }
  }

  function closeOverlay() {
    overlay.classList.remove('is-open');
  }

  function selectPersona(key) {
    if (!personas[key]) return;
    // Pass via URL so it always survives the navigation; ?p=... also signals
    // "fresh selection" so lore.js plays the reveal animation.
    sessionStorage.setItem('persona', key);
    window.location.href = 'lore.html?p=' + encodeURIComponent(key);
  }

  openBtn.addEventListener('click', openOverlay);
  closeBtn.addEventListener('click', closeOverlay);
  overlay.addEventListener('click', function (e) {
    if (e.target === overlay) closeOverlay();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeOverlay();
  });

  cards.forEach(function (card) {
    card.addEventListener('click', function () {
      selectPersona(card.getAttribute('data-persona'));
    });
  });
})();
