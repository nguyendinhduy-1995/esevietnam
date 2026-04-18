document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initRevealAnimations();
  initForm();
  initSmoothScroll();
  initTracking();
});

function initNavbar() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;
  var scrollThreshold = 60;
  function onScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function initRevealAnimations() {
  var reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  if (!reveals.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(function (el) { observer.observe(el); });
}

function initForm() {
  var form = document.querySelector('#kidiquetteForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang xử lý...'; }

    var formData = {
      name: document.getElementById('p-name').value.trim(),
      phone: document.getElementById('p-phone').value.trim(),
      package: document.getElementById('p-pack').value,
      source: window.__esePage || 'teen_etiquette_v3',
      sessionId: sessionStorage.getItem('ese_session_id') || '',
      utmSource: getUTM('utm_source'),
      utmMedium: getUTM('utm_medium'),
      utmCampaign: getUTM('utm_campaign')
    };

    fetch((window.__eseCrmUrl || '') + '/api/landing/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(function(res) { return res.json(); }).then(function(data) {
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
      trackEvent('FORM_SUBMIT_SUCCESS');
    }).catch(function() {
      form.style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    });
  });
}

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var t = document.querySelector(href);
      if (t) {
        e.preventDefault();
        window.scrollTo({ top: t.getBoundingClientRect().top + window.pageYOffset - 90, behavior: 'smooth' });
        trackEvent('CTA_CLICK', { target: href });
      }
    });
  });
}

function initTracking() {
  if (!sessionStorage.getItem('ese_session_id')) {
    sessionStorage.setItem('ese_session_id', 'ese_kidi_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8));
  }
  trackEvent('PAGE_VIEW');
}

function trackEvent(eventName, data) {
  var crmUrl = window.__eseCrmUrl || 'http://localhost:3000';
  var payload = {
    sessionId: sessionStorage.getItem('ese_session_id') || '',
    page: window.__esePage || 'kidiquette_v2',
    event: eventName,
    data: data || null,
    referrer: document.referrer || null,
    utmSource: getUTM('utm_source'),
    utmCampaign: getUTM('utm_campaign')
  };
  try {
    if (navigator.sendBeacon) navigator.sendBeacon(crmUrl + '/api/track', JSON.stringify(payload));
    else fetch(crmUrl + '/api/track', { method: 'POST', body: JSON.stringify(payload), keepalive: true }).catch(function(){});
  } catch(e) {}
}

function getUTM(param) {
  try { return new URLSearchParams(window.location.search).get(param) || ''; } catch (e) { return ''; }
}
