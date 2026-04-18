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
  var mobileToggle = document.querySelector('.navbar-toggle');
  var navMenu = document.querySelector('.navbar-nav');
  
  if (!navbar) return;
  var scrollThreshold = 80;

  function onScroll() {
    if (window.scrollY > scrollThreshold) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', function() {
      // Very simple mobile toggle inline handling for now
      if (navMenu.style.display === 'flex') {
        navMenu.style.display = 'none';
      } else {
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.background = '#FAF7F2';
        navMenu.style.padding = '20px';
        navMenu.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
        navMenu.style.gap = '20px';
        navbar.classList.add('scrolled');
      }
    });

    // Close menu on click
    var links = navMenu.querySelectorAll('a');
    links.forEach(function(l) {
      l.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
          navMenu.style.display = 'none';
        }
      });
    });
  }
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
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  
  reveals.forEach(function (el) { observer.observe(el); });
}

/* ====== COUNT UP ANIMATION ====== */
function initCountUp() {
  var statNums = document.querySelectorAll('.hero-stat-num[data-count]');
  if (!statNums.length) return;

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var target = el.getAttribute('data-count');
        var suffix = el.getAttribute('data-suffix') || '';
        var numericTarget = parseInt(target);
        var duration = 2500;
        var startTime = null;

        function animate(timestamp) {
          if (!startTime) startTime = timestamp;
          var progress = Math.min((timestamp - startTime) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 4); // easeOutQuart
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
  }, { threshold: 0.4 });

  statNums.forEach(function (el) { observer.observe(el); });
}

/* ====== LIGHTBOX ====== */
function initLightbox() {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  if (!lightbox || !lightboxImg) return;
  
  var galleryItems = document.querySelectorAll('.gallery-cell img, .intro-image img, .about-image img, .instructor-portrait img');
  
  galleryItems.forEach(function (img) {
    img.style.cursor = 'zoom-in';
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

/* ====== FORM VALIDATION ====== */
function initForm() {
  var form = document.getElementById('registrationForm');
  if (!form) return;
  
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    clearErrors();

    var name = form.querySelector('#form-name');
    var phone = form.querySelector('#form-phone');

    if (!name.value.trim()) {
      showError(name, 'Vui lòng nhập họ tên');
      valid = false;
    }
    var phoneVal = phone.value.trim().replace(/\s/g, '');
    if (!phoneVal || !/^0\d{9}$/.test(phoneVal)) {
      showError(phone, 'Số điện thoại hợp lệ cần có 10 chữ số và bắt đầu bằng số 0');
      valid = false;
    }

    if (!valid) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang xử lý...'; }

    var formData = {
      name: name.value.trim(),
      phone: phoneVal,
      package: form.querySelector('#form-package') ? form.querySelector('#form-package').value : '',
      message: form.querySelector('#form-message') ? form.querySelector('#form-message').value.trim() : '',
      source: window.__esePage || 'elite_presence_v3',
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
      if (data.success || data.id) {
        form.style.display = 'none';
        var success = document.getElementById('form-success');
        if (success) success.classList.add('active');
        trackEvent('FORM_SUBMIT_SUCCESS');
      } else {
        alert(data.error || 'Có lỗi xảy ra trong quá trình ghi nhận thông tin, vui lòng thử lại.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Gửi Đăng Ký'; }
      }
    }).catch(function() {
      // Fallback on network error to success view for UX
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
}

function showError(input, message) {
  var group = input.closest('.form-group');
  var error = group.querySelector('.form-error');
  if (error) {
    error.textContent = message;
    error.style.display = 'block';
  }
  input.style.borderColor = '#B44040';
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
        var offset = 90;
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
    sessionStorage.setItem('ese_session_id', 'ese_v3_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));
  }
  trackEvent('PAGE_VIEW');

  var firedDepths = new Set();
  window.addEventListener('scroll', function () {
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((scrollTop / docHeight) * 100);
    [25, 50, 75, 90].forEach(function (threshold) {
      if (pct >= threshold && !firedDepths.has(threshold)) {
        firedDepths.add(threshold);
        trackEvent('SCROLL_DEPTH', { depth: threshold });
      }
    });
  }, { passive: true });
}

function trackEvent(eventName, data) {
  var crmUrl = window.__eseCrmUrl || 'http://localhost:3000';
  var payload = {
    sessionId: sessionStorage.getItem('ese_session_id') || '',
    page: window.__esePage || 'elite_presence_v3',
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
  } catch(e) { }
}

function getUTM(param) {
  try {
    return new URLSearchParams(window.location.search).get(param) || '';
  } catch (e) {
    return '';
  }
}
