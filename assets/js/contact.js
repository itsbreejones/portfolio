/* contact.js — submit the contact form via fetch (no page redirect).
   On success, replace the form with a thank-you message. Falls back to a
   normal POST if JavaScript is unavailable (the form keeps its action). */

(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var btn = form.querySelector('button[type="submit"]');
    var originalLabel = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
    clearError();

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data && data.success) {
          showSuccess();
        } else {
          showError((data && data.message) || 'Something went wrong. Please try again.', btn, originalLabel);
        }
      })
      .catch(function () {
        showError('Network error. Please try again, or reach out on LinkedIn.', btn, originalLabel);
      });
  });

  function showSuccess() {
    var intro = document.querySelector('.contact-intro');
    if (intro) intro.style.display = 'none';   // drop the "form below…" line
    var msg = document.createElement('div');
    msg.className = 'contact-success';
    msg.setAttribute('role', 'status');
    msg.innerHTML =
      '<p class="contact-success__title">Thanks for reaching out!</p>' +
      '<p class="contact-success__body">I\'ll be in touch.</p>';
    form.replaceWith(msg);
  }

  function showError(text, btn, label) {
    if (btn) { btn.disabled = false; btn.textContent = label || 'Send Message'; }
    var note = form.querySelector('.contact-error');
    if (!note) {
      note = document.createElement('p');
      note.className = 'contact-error';
      note.setAttribute('role', 'alert');
      form.appendChild(note);
    }
    note.textContent = text;
  }

  function clearError() {
    var note = form.querySelector('.contact-error');
    if (note) note.remove();
  }
})();
