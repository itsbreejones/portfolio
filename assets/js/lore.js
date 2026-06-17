/* lore.js — persona-driven section ordering with a visible reveal:
   brief message popup -> collapsed containers switch positions (Flip) ->
   staggered expand. Plus tab container, collapsible sections, timeline
   tooltips, and the tools grid. */

(function () {
  var personas = (window.BREE && window.BREE.personas) || {};

  // GSAP Flip must be registered with gsap before use, or Flip.from throws.
  if (window.gsap && window.Flip) { try { gsap.registerPlugin(Flip); } catch (e) {} }

  // persona comes from the URL on a fresh selection (survives navigation),
  // else from sessionStorage (refresh / cross-page), else default.
  var params = new URLSearchParams(location.search);
  var fromParam = params.get('p');
  var persona = fromParam || sessionStorage.getItem('persona') || 'default';
  if (!personas[persona]) persona = 'default';
  try { sessionStorage.setItem('persona', persona); } catch (e) {}
  var justSelected = !!fromParam;
  if (fromParam) { try { history.replaceState(null, '', 'lore.html'); } catch (e) {} }

  function byId(id) { return document.getElementById(id); }
  function topSections() { return Array.prototype.slice.call(document.querySelectorAll('#lore-sections > .section')); }

  /* ---- welcome message ---- */
  var welcome = byId('welcome-msg');
  if (welcome) welcome.textContent = (personas[persona] || personas.default).welcome || '';

  /* ---- persona section orders ---- */
  var ALL = ['who-i-am', 'timeline', 'tab-container', 'outside-job', 'tools',
             'career-curiosities', 'contact-cta', 'side-quests'];
  var orders = {
    default:  ['who-i-am', 'timeline', 'tab-container', 'outside-job', 'tools', 'side-quests'],
    scout:    ['who-i-am', 'timeline', 'tab-container', 'outside-job', 'tools', 'side-quests'],
    ally:     ['who-i-am', 'outside-job', 'timeline', 'tab-container', 'side-quests'],
    wanderer: ['who-i-am', 'outside-job', 'contact-cta', 'career-curiosities', 'timeline', 'tab-container', 'tools']
  };
  var sideQuestsContents = {
    default:  ['career-curiosities'],
    scout:    ['career-curiosities'],
    ally:     ['tools', 'career-curiosities'],
    wanderer: []
  };

  function setCollapsed(section, collapsed) {
    if (!section) return;
    section.classList.toggle('collapsed', collapsed);
    var hdr = section.querySelector('.section__header');
    var arrow = section.querySelector('.section__arrow');
    if (hdr) hdr.setAttribute('aria-expanded', String(!collapsed));
    if (arrow) arrow.textContent = collapsed ? '▼' : '▲';
  }

  // Move sections into this persona's order + set visibility (no animation).
  function positionSections() {
    var order = orders[persona] || orders.default;
    var sq = sideQuestsContents[persona] || [];
    var container = byId('lore-sections');
    var sqBody = byId('side-quests-body');
    sq.forEach(function (id) { sqBody.appendChild(byId(id)); });
    order.forEach(function (id) { container.appendChild(byId(id)); });
    ALL.forEach(function (id) {
      byId(id).hidden = (order.indexOf(id) === -1 && sq.indexOf(id) === -1);
    });
    // sections nested inside Side Quests should be expanded (the wrapper holds them)
    Array.prototype.slice.call(sqBody.children).forEach(function (s) {
      if (s.classList && s.classList.contains('section')) setCollapsed(s, false);
    });
  }

  // Which sections stay collapsed after the reveal.
  function staysCollapsed(id) {
    return id === 'side-quests' || (persona === 'wanderer' && id === 'tab-container');
  }

  // Expand visible sections one at a time; calls done() after the last.
  function expandSequential(done) {
    var vis = topSections().filter(function (s) { return !s.hidden && !staysCollapsed(s.id); });
    var STEP = 520; // ms between sections -> each finishes (~0.4s) before the next starts
    vis.forEach(function (s, i) {
      setTimeout(function () {
        setCollapsed(s, false);
        if (window.gsap) {
          gsap.from(s.querySelector('.section__body'),
            { height: 0, opacity: 0, duration: 0.4, ease: 'power2.out', clearProps: 'height' });
        }
      }, i * STEP);
    });
    if (done) setTimeout(done, vis.length * STEP + 250);
  }

  // Expand everything instantly — safety net so the page is never stuck collapsed.
  function expandAllNow() {
    topSections().forEach(function (s) {
      if (!s.hidden) setCollapsed(s, staysCollapsed(s.id));
    });
  }

  /* ---- reveal message (stays up while the animation plays beneath it) ---- */
  function showRevealMessage() {
    var p = personas[persona];
    var popup = byId('persona-popup');
    if (!p || !p.popup || !popup) return null;
    byId('popup-title').textContent = "You're " + p.name + ". Here's your order.";
    byId('popup-msg').textContent = p.popup;
    popup.classList.add('is-open');
    if (window.gsap) {
      gsap.fromTo(popup.querySelector('.persona-window'),
        { scale: 0.92, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }
    return popup;
  }
  function hideMessage(popup) {
    if (!popup || !popup.classList.contains('is-open')) return;
    if (window.gsap) {
      gsap.to(popup, { opacity: 0, duration: 0.35, onComplete: function () {
        popup.classList.remove('is-open'); popup.style.opacity = '';
      } });
    } else { popup.classList.remove('is-open'); }
  }

  // Full reveal: compact bars -> message appears -> deliberate shuffle ->
  // sections expand one at a time -> message fades. All visible together.
  function reveal() {
    topSections().forEach(function (s) { setCollapsed(s, true); });   // start as compact bars
    var popup = showRevealMessage();
    if (popup) popup.addEventListener('click', function () { hideMessage(popup); }, { once: true });

    var safety = setTimeout(function () { expandAllNow(); hideMessage(popup); }, 9000);

    setTimeout(function () {                          // small beat so the message lands first
      var state = null;
      if (window.Flip) { try { state = Flip.getState('#lore-sections > .section'); } catch (e) { state = null; } }
      positionSections();                            // reorder (still collapsed)
      var switched = false;
      var afterSwitch = function () {
        if (switched) return; switched = true;
        expandSequential(function () { clearTimeout(safety); hideMessage(popup); });
      };
      if (state) {
        try {
          Flip.from(state, { duration: 1.1, ease: 'power3.inOut', absolute: true, onComplete: afterSwitch });
          setTimeout(afterSwitch, 1300);             // fallback if onComplete never fires
        } catch (e) { afterSwitch(); }
      } else {
        afterSwitch();
      }
    }, 650);
  }

  /* ---- collapsible sections (event delegation) ---- */
  byId('lore-sections').addEventListener('click', function (e) {
    var hdr = e.target.closest('.section__header');
    if (!hdr) return;
    var section = hdr.closest('.section');
    setCollapsed(section, !section.classList.contains('collapsed'));
  });

  /* ---- tab container ---- */
  var tabs = document.querySelectorAll('.tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var key = tab.getAttribute('data-tab');
      tabs.forEach(function (t) { t.classList.toggle('is-active', t === tab); });
      document.querySelectorAll('.tab-panel').forEach(function (panel) {
        var active = panel.id === 'panel-' + key;
        panel.classList.toggle('is-active', active);
        panel.hidden = !active;
      });
    });
  });

  /* ---- timeline tooltip ---- */
  var tip = byId('timeline-tooltip');
  document.querySelectorAll('.timeline__seg').forEach(function (seg) {
    seg.addEventListener('mouseenter', function () {
      tip.innerHTML = '<strong>' + seg.querySelector('.seg__company').textContent + '</strong>' +
        '<span>' + seg.dataset.dates + '</span>' +
        '<span class="tip-note">' + seg.dataset.note + '</span>';
      tip.hidden = false;
    });
    seg.addEventListener('mousemove', function (e) {
      var pad = 8;
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var x = e.clientX, y = e.clientY + 18;
      if (x + tw > window.innerWidth - pad) x = window.innerWidth - tw - pad;  // keep on-screen right
      if (x < pad) x = pad;                                                     // and left
      if (y + th > window.innerHeight - pad) y = e.clientY - th - 12;           // flip above near bottom
      if (y < pad) y = pad;
      tip.style.left = x + 'px';
      tip.style.top = y + 'px';
    });
    seg.addEventListener('mouseleave', function () { tip.hidden = true; });
  });

  /* ---- "explore another area" -> scroll back up to the switcher ---- */
  var backToAreas = byId('back-to-areas');
  if (backToAreas) {
    backToAreas.addEventListener('click', function () {
      var anchor = document.querySelector('.work-prompt') || document.querySelector('.tabs');
      if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }


  /* ---- tools grid ---- */
  var tools = [
    { n: 'Appen', s: 'appen' }, { n: 'Labelbox', s: 'labelbox' }, { n: 'Braintrust', s: 'braintrust' },
    { n: 'LangChain', s: 'langchain' }, { n: 'Retool', s: 'retool' },
    { n: 'Notion', s: 'notion' }, { n: 'Coda', s: 'coda' }, { n: 'Lovable', s: 'lovable' },
    { n: 'Tableau', s: 'tableau' }, { n: 'BigQuery', s: 'googlebigquery' },
    { n: 'Google Sheets', s: 'googlesheets' }, { n: 'Excel', s: 'excel' },
    { n: 'Jira', s: 'jira' }, { n: 'Confluence', s: 'confluence' },
    { n: 'Asana', s: 'asana' }, { n: 'Linear', s: 'linear' }, { n: 'Slack', s: 'slack' },
    { n: 'Zoom', s: 'zoom' }, { n: 'Loom', s: 'loom' }, { n: 'Python', s: 'python' },
    { n: 'SQL', s: 'sql' }, { n: 'HTML5', s: 'html5' }, { n: 'CSS3', s: 'css' },
    { n: 'JavaScript', s: 'javascript' }, { n: 'GitHub', s: 'github' },
    { n: 'Cursor', s: 'cursor' }, { n: 'Claude', s: 'claude' },
    { n: 'ChatGPT', s: 'openai' }, { n: 'Gemini', s: 'googlegemini' },
    { n: 'Hugging Face', s: 'huggingface' }, { n: 'Intellum', s: 'intellum' }, { n: 'Articulate 360', s: 'articulate' }
  ];
  var grid = byId('tools-grid');
  if (grid) {
    tools.forEach(function (tool) {
      var cell = document.createElement('div');
      cell.className = 'tool';
      cell.title = tool.n;
      if (tool.s) {
        var img = document.createElement('img');
        img.className = 'tool-logo';
        img.src = 'assets/images/tools/' + tool.s + '.svg';
        img.alt = tool.n;
        img.loading = 'lazy';
        img.onerror = function () { cell.classList.add('tool--text'); cell.textContent = tool.n; };
        cell.appendChild(img);
      } else {
        cell.classList.add('tool--text');
        cell.textContent = tool.n;
      }
      grid.appendChild(cell);
    });
  }

  /* ---- run ---- */
  if (justSelected) {
    reveal();
  } else {
    positionSections();
    if (persona === 'wanderer') setCollapsed(byId('tab-container'), true);
  }
})();
