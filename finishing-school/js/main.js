document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initRevealAnimations();
  initLightbox();
  initForm();
  initSmoothScroll();
  initTracking();
  initTiltCards();
  initTypingEffect();
});

/* ====== NAVBAR SCROLL ====== */
function initNavbar() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;
  function onScroll() {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ====== REVEAL ON SCROLL ====== */
function initRevealAnimations() {
  var reveals = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!reveals.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(function (el) { observer.observe(el); });
}

/* ====== TILT CARDS ====== */
function initTiltCards() {
  if (window.innerWidth <= 768) return;
  document.querySelectorAll('.glass-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      card.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 4) + 'deg) rotateY(' + ((x - 0.5) * 4) + 'deg) translateY(-6px)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)'; });
    card.addEventListener('mouseenter', function () { card.style.transition = 'transform 0.15s ease'; });
  });
}

/* ====== TYPING EFFECT ====== */
function initTypingEffect() {
  var el = document.querySelector('.hero-quote');
  if (!el) return;
  var textContent = el.textContent.trim();
  setTimeout(function () {
    var words = textContent.split(/\s+/);
    var html = '';
    words.forEach(function (word, i) {
      html += '<span style="opacity:0;display:inline-block;transition:opacity 0.4s ease ' + (i * 60) + 'ms, transform 0.4s ease ' + (i * 60) + 'ms;transform:translateY(5px)">' + word + '</span> ';
    });
    el.innerHTML = html;
    requestAnimationFrame(function () {
      el.querySelectorAll('span').forEach(function (span) { span.style.opacity = '1'; span.style.transform = 'translateY(0)'; });
    });
  }, 1800);
}

/* ====== LIGHTBOX ====== */
function initLightbox() {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  if (!lightbox || !lightboxImg) return;
  document.querySelectorAll('.gallery-item img').forEach(function (img) {
    img.addEventListener('click', function () {
      lightboxImg.src = this.src; lightboxImg.alt = this.alt;
      lightbox.classList.add('active'); document.body.style.overflow = 'hidden';
    });
  });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      lightbox.classList.remove('active'); document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active'); document.body.style.overflow = '';
    }
  });
}

/* ====== FORM ====== */
function initForm() {
  var form = document.getElementById('registrationForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    clearErrors();
    var name = form.querySelector('#form-name');
    var phone = form.querySelector('#form-phone');
    if (!name.value.trim()) { showError(name, 'Vui lòng nhập họ tên'); valid = false; }
    var phoneVal = phone.value.trim().replace(/\s/g, '');
    if (!phoneVal || !/^0\d{9}$/.test(phoneVal)) { showError(phone, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'); valid = false; }
    if (!valid) return;
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi...'; }
    var formData = {
      name: name.value.trim(),
      phone: phoneVal,
      package: form.querySelector('#form-package') ? form.querySelector('#form-package').value : '',
      message: form.querySelector('#form-message') ? form.querySelector('#form-message').value.trim() : '',
      source: window.__esePage || 'finishing_school',
      sessionId: sessionStorage.getItem('ese_session_id') || '',
      utmSource: getUTM('utm_source'), utmMedium: getUTM('utm_medium'), utmCampaign: getUTM('utm_campaign')
    };
    fetch((window.__eseCrmUrl || '') + '/api/landing/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    }).then(function(res) { return res.json(); }).then(function(data) {
      if (data.success) {
        form.style.display = 'none';
        var success = document.getElementById('form-success');
        if (success) success.classList.add('active');
      } else {
        alert(data.error || 'Có lỗi xảy ra, vui lòng thử lại.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Gửi Đăng Ký'; }
      }
    }).catch(function() {
      form.style.display = 'none';
      var success = document.getElementById('form-success');
      if (success) success.classList.add('active');
    });
  });
}
function showError(input, message) {
  var group = input.closest('.form-group');
  var error = group.querySelector('.form-error');
  if (error) { error.textContent = message; error.style.display = 'block'; }
  input.style.borderColor = '#c0392b';
}
function clearErrors() {
  document.querySelectorAll('.form-error').forEach(function (el) { el.style.display = 'none'; });
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(function (el) { el.style.borderColor = ''; });
}

/* ====== SMOOTH SCROLL ====== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
        trackEvent('CTA_CLICK', { target: href });
      }
    });
  });
}

/* ====== TRACKING ====== */
function initTracking() {
  if (!sessionStorage.getItem('ese_session_id')) {
    sessionStorage.setItem('ese_session_id', 'ese_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));
  }
  trackEvent('PAGE_VIEW');
  var firedDepths = new Set();
  window.addEventListener('scroll', function () {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((window.scrollY / docHeight) * 100);
    [25, 50, 75, 90].forEach(function (t) {
      if (pct >= t && !firedDepths.has(t)) { firedDepths.add(t); trackEvent('SCROLL_DEPTH', { depth: t }); }
    });
  }, { passive: true });
}
function trackEvent(eventName, data) {
  var crmUrl = window.__eseCrmUrl || 'http://localhost:3000';
  var payload = {
    sessionId: sessionStorage.getItem('ese_session_id') || '',
    page: window.__esePage || 'finishing_school',
    event: eventName, data: data || null,
    referrer: document.referrer || null,
    utmSource: getUTM('utm_source'), utmMedium: getUTM('utm_medium'), utmCampaign: getUTM('utm_campaign')
  };
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(crmUrl + '/api/track', JSON.stringify(payload));
    } else {
      fetch(crmUrl + '/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(function() {});
    }
  } catch(e) {}
}
function getUTM(param) { try { return new URLSearchParams(window.location.search).get(param) || ''; } catch(e) { return ''; } }
