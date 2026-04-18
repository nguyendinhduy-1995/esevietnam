/**
 * ÉLITE PRESENCE V5 — Main JS
 * Handles: navbar, reveal animations, lightbox, form validation/submission,
 *          smooth scroll, tracking, count-up, parallax
 */
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initRevealAnimations();
  initLightbox();
  initForm();
  initSmoothScroll();
  initTracking();
  initCountUp();
});

/* ====== NAVBAR SCROLL ====== */
function initNavbar() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;
  var threshold = 80;
  function onScroll() {
    if (window.scrollY > threshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ====== REVEAL ON SCROLL ====== */
function initRevealAnimations() {
  var selectors = '.reveal, .reveal-left, .reveal-right, .reveal-scale';
  var reveals = document.querySelectorAll(selectors);
  if (!reveals.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  reveals.forEach(function (el) { observer.observe(el); });
}

/* ====== COUNT UP ====== */
function initCountUp() {
  var statNums = document.querySelectorAll('.stat-num[data-count]');
  if (!statNums.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = el.getAttribute('data-count');
        var suffix = el.getAttribute('data-suffix') || '';
        var numericTarget = parseInt(target);
        var duration = 2000;
        var startTime = null;

        function animate(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);
          var current = Math.floor(eased * numericTarget);
          el.textContent = current + suffix;
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            el.textContent = target + suffix;
          }
        }
        requestAnimationFrame(animate);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  statNums.forEach(function (el) { observer.observe(el); });
}

/* ====== LIGHTBOX ====== */
function initLightbox() {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  if (!lightbox || !lightboxImg) return;
  var galleryItems = document.querySelectorAll('.gallery-item img');
  galleryItems.forEach(function (img) {
    img.addEventListener('click', function () {
      lightboxImg.src = this.src;
      lightboxImg.alt = this.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      closeLightbox();
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
  function closeLightbox() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
  }
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
    var email = form.querySelector('#form-email');

    if (!name.value.trim()) {
      showError(name, 'Vui lòng nhập họ tên');
      valid = false;
    }
    var phoneVal = phone.value.trim().replace(/\s/g, '');
    if (!phoneVal || !/^0\d{9}$/.test(phoneVal)) {
      showError(phone, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0');
      valid = false;
    }
    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      showError(email, 'Email không hợp lệ');
      valid = false;
    }

    if (!valid) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi...'; }

    var formData = {
      name: name.value.trim(),
      phone: phoneVal,
      email: email.value.trim(),
      interest_service: 'Élite Presence',
      message: form.querySelector('#form-need') ? form.querySelector('#form-need').value.trim() : '',
      source: window.__esePage || 'elite_presence_v5',
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
      if (data.success) {
        form.style.display = 'none';
        var success = document.getElementById('form-success');
        if (success) success.classList.add('active');
        trackEvent('FORM_SUBMIT', { status: 'success' });
      } else {
        alert(data.error || 'Có lỗi xảy ra, vui lòng thử lại.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Đăng Ký Nhận Thông Tin'; }
      }
    }).catch(function() {
      form.style.display = 'none';
      var success = document.getElementById('form-success');
      if (success) success.classList.add('active');
    });
  });

  var phoneInput = form.querySelector('#form-phone');
  if (phoneInput) {
    phoneInput.addEventListener('focus', function () {
      trackEvent('PHONE_INPUT');
    });
  }
  var firstInput = form.querySelector('input');
  if (firstInput) {
    firstInput.addEventListener('focus', function () {
      trackEvent('FORM_START');
    }, { once: true });
  }
}

function showError(input, message) {
  var group = input.closest('.form-group');
  var error = group.querySelector('.form-error');
  if (error) {
    error.textContent = message;
    error.style.display = 'block';
  }
  input.style.borderColor = '#c0392b';
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(function (el) {
    el.style.display = 'none';
  });
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(function (el) {
    el.style.borderColor = '';
  });
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
        var offset = 80;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
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

  var firedDepths = {};
  window.addEventListener('scroll', function () {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((scrollTop / docHeight) * 100);
    [25, 50, 75, 90].forEach(function (threshold) {
      if (pct >= threshold && !firedDepths[threshold]) {
        firedDepths[threshold] = true;
        trackEvent('SCROLL_DEPTH', { depth: threshold });
      }
    });
  }, { passive: true });

  [10, 30, 60].forEach(function (sec) {
    setTimeout(function () {
      trackEvent('TIME_ON_PAGE', { seconds: sec });
    }, sec * 1000);
  });
}

function trackEvent(eventName, data) {
  var crmUrl = window.__eseCrmUrl || '';
  if (!crmUrl) return;
  var payload = {
    sessionId: sessionStorage.getItem('ese_session_id') || '',
    page: window.__esePage || 'elite_presence_v5',
    event: eventName,
    data: data || null,
    referrer: document.referrer || null,
    utmSource: getUTM('utm_source'),
    utmMedium: getUTM('utm_medium'),
    utmCampaign: getUTM('utm_campaign')
  };

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(crmUrl + '/api/track', JSON.stringify(payload));
    } else {
      fetch(crmUrl + '/api/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(function() {});
    }
  } catch(e) { /* silent */ }
}

function getUTM(param) {
  try {
    return new URLSearchParams(window.location.search).get(param) || '';
  } catch (e) {
    return '';
  }
}
