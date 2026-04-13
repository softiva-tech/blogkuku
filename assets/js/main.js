(function () {
  var toggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-site-nav]');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    nav.classList.toggle('is-open');
    toggle.classList.toggle('is-active');
    toggle.setAttribute('aria-expanded', nav.classList.contains('is-open'));
  });
})();

(function () {
  document.querySelectorAll('[data-copy-share]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var bar = btn.closest('[data-share-url]');
      var url = bar ? bar.getAttribute('data-share-url') : '';
      if (!url) return;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(function () {
          btn.setAttribute('title', 'Copied!');
          setTimeout(function () {
            btn.removeAttribute('title');
          }, 2000);
        });
      } else {
        var ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
        } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });
})();
