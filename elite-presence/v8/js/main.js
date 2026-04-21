/**
 * ÉLITE PRESENCE V8 — THE DEFINITIVE EDITION (REDESIGNED)
 * Main JavaScript: navbar, reveal, parallax, lightbox, form, FAQ, tracking, cursor glow, mobile bar, hamburger
 */
document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initHamburgerMenu();
  initRevealAnimations();
  initLightbox();
  initForm();
  initSmoothScroll();
  initTracking();
  initFAQ();
  initParallaxElements();
  initCursorGlow();
  initMobileBar();
  initHeroParticles();
});

/* ====== NAVBAR ====== */
function initNavbar() {
  var navbar = document.getElementById('navbar');
  if (!navbar) return;
  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 80);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ====== HAMBURGER MENU ====== */
function initHamburgerMenu() {
  var toggle = document.getElementById('navbar-toggle');
  var overlay = document.getElementById('mobile-nav-overlay');
  if (!toggle || !overlay) return;

  toggle.addEventListener('click', function () {
    toggle.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
  });

  overlay.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () {
      toggle.classList.remove('active');
      overlay.classList.remove('active');
      document.body.style.overflow = '';
    });
  });
}

/* ====== REVEAL ON SCROLL ====== */
function initRevealAnimations() {
  var els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!els.length) return;
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -60px 0px' });
  els.forEach(function (el) { observer.observe(el); });
}

/* ====== PARALLAX HERO ====== */
function initParallaxElements() {
  var hero = document.querySelector('.hero-bg');
  if (!hero) return;
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        var scroll = window.scrollY;
        if (scroll < window.innerHeight * 1.5) {
          hero.style.transform = 'scale(' + (1.08 + scroll * 0.00003) + ') translateY(' + (scroll * 0.1) + 'px)';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

/* ====== CURSOR GLOW (Desktop only) ====== */
function initCursorGlow() {
  if (window.innerWidth < 1024) return;
  var glow = document.getElementById('cursor-glow');
  if (!glow) return;

  var mouseX = 0, mouseY = 0;
  var glowX = 0, glowY = 0;

  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    glow.style.opacity = '1';
  });

  document.addEventListener('mouseleave', function () {
    glow.style.opacity = '0';
  });

  function animateGlow() {
    glowX += (mouseX - glowX) * 0.08;
    glowY += (mouseY - glowY) * 0.08;
    glow.style.left = glowX + 'px';
    glow.style.top = glowY + 'px';
    requestAnimationFrame(animateGlow);
  }
  animateGlow();

  /* Pricing card glow */
  var cards = document.querySelectorAll('.price-card');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var inner = card.querySelector('.price-card-inner');
      if (inner) {
        inner.style.background = 'radial-gradient(600px circle at ' + x + 'px ' + y + 'px, rgba(196,162,101,0.06), transparent 40%)';
      }
    });
    card.addEventListener('mouseleave', function () {
      var inner = card.querySelector('.price-card-inner');
      if (!inner) return;
      if (card.classList.contains('featured')) {
        inner.style.background = 'linear-gradient(180deg, rgba(196,162,101,0.05), #0a0a0a)';
      } else {
        inner.style.background = '#0a0a0a';
      }
    });
  });
}

/* ====== HERO PARTICLES ====== */
function initHeroParticles() {
  var container = document.getElementById('hero-particles');
  if (!container || window.innerWidth < 768) return;

  for (var i = 0; i < 20; i++) {
    var particle = document.createElement('div');
    var size = Math.random() * 2 + 1;
    particle.style.cssText =
      'position:absolute;' +
      'width:' + size + 'px;height:' + size + 'px;' +
      'border-radius:50%;' +
      'background:rgba(196,162,101,' + (Math.random() * 0.15 + 0.05) + ');' +
      'left:' + (Math.random() * 100) + '%;' +
      'top:' + (Math.random() * 100) + '%;' +
      'animation:particleFloat ' + (Math.random() * 8 + 6) + 's ease-in-out infinite ' + (Math.random() * 4) + 's;';
    container.appendChild(particle);
  }

  var style = document.createElement('style');
  style.textContent = '@keyframes particleFloat{0%,100%{transform:translateY(0) translateX(0);opacity:0.3;}25%{transform:translateY(-20px) translateX(10px);opacity:0.7;}50%{transform:translateY(-40px) translateX(-5px);opacity:0.4;}75%{transform:translateY(-20px) translateX(15px);opacity:0.6;}}';
  document.head.appendChild(style);
}

/* ====== FAQ ACCORDION ====== */
function initFAQ() {
  var items = document.querySelectorAll('.faq-item');
  items.forEach(function (item) {
    var btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var isActive = item.classList.contains('active');
      items.forEach(function (i) { i.classList.remove('active'); });
      if (!isActive) item.classList.add('active');
    });
  });
}

/* ====== LIGHTBOX ====== */
function initLightbox() {
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  if (!lightbox || !lightboxImg) return;
  document.querySelectorAll('.gallery-item img').forEach(function (img) {
    img.addEventListener('click', function () {
      lightboxImg.src = this.src;
      lightboxImg.alt = this.alt;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* ====== MOBILE BOTTOM BAR ====== */
function initMobileBar() {
  var bar = document.getElementById('mobile-bar');
  if (!bar) return;
  var heroHeight = window.innerHeight;
  window.addEventListener('scroll', function () {
    var currentScroll = window.scrollY;
    if (currentScroll > heroHeight * 0.8) {
      bar.classList.add('visible');
    } else {
      bar.classList.remove('visible');
    }
  }, { passive: true });
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
    var need = form.querySelector('#form-need');

    if (!name.value.trim()) { showError(name, 'Vui lòng nhập họ tên'); valid = false; }
    var pv = phone.value.trim().replace(/\s/g, '');
    if (!pv || !/^0\d{9}$/.test(pv)) { showError(phone, 'Số điện thoại phải có 10 chữ số, bắt đầu bằng 0'); valid = false; }
    if (!valid) return;

    var btn = form.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Đang gửi...'; }

    var data = {
      name: name.value.trim(),
      phone: pv,
      email: '',
      interest_service: 'Élite Presence',
      message: need ? need.value : '',
      source: window.__esePage || 'elite_presence_v8',
      sessionId: sessionStorage.getItem('ese_session_id') || '',
      utmSource: getUTM('utm_source'),
      utmMedium: getUTM('utm_medium'),
      utmCampaign: getUTM('utm_campaign')
    };

    fetch((window.__eseCrmUrl || '') + '/api/landing/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(function(r) { return r.json(); }).then(function(d) {
      if (d.success) {
        form.style.display = 'none';
        var s = document.getElementById('form-success');
        if (s) s.classList.add('active');
        trackEvent('FORM_SUBMIT', { status: 'success' });
      } else {
        alert(d.error || 'Có lỗi xảy ra, vui lòng thử lại.');
        if (btn) { btn.disabled = false; btn.textContent = 'ĐĂNG KÝ NGAY'; }
      }
    }).catch(function() {
      form.style.display = 'none';
      var s = document.getElementById('form-success');
      if (s) s.classList.add('active');
    });
  });

  var pi = form.querySelector('#form-phone');
  if (pi) pi.addEventListener('focus', function () { trackEvent('PHONE_INPUT'); });
  var fi = form.querySelector('input');
  if (fi) fi.addEventListener('focus', function () { trackEvent('FORM_START'); }, { once: true });
}

function showError(input, msg) {
  var g = input.closest('.form-group');
  var e = g.querySelector('.form-error');
  if (e) { e.textContent = msg; e.style.display = 'block'; }
  input.style.borderColor = '#c0392b';
}
function clearErrors() {
  document.querySelectorAll('.form-error').forEach(function (e) { e.style.display = 'none'; });
  document.querySelectorAll('.form-group input, .form-group textarea, .form-group select').forEach(function (e) { e.style.borderColor = ''; });
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
        var top = target.getBoundingClientRect().top + window.pageYOffset - 80;
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

  var fired = {};
  window.addEventListener('scroll', function () {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((window.scrollY / docHeight) * 100);
    [25, 50, 75, 90].forEach(function (t) {
      if (pct >= t && !fired[t]) { fired[t] = true; trackEvent('SCROLL_DEPTH', { depth: t }); }
    });
  }, { passive: true });

  [10, 30, 60, 120].forEach(function (s) {
    setTimeout(function () { trackEvent('TIME_ON_PAGE', { seconds: s }); }, s * 1000);
  });
}

function trackEvent(name, data) {
  var url = window.__eseCrmUrl || '';
  if (!url) return;
  var p = {
    sessionId: sessionStorage.getItem('ese_session_id') || '',
    page: window.__esePage || 'elite_presence_v8',
    event: name,
    data: data || null,
    referrer: document.referrer || null,
    utmSource: getUTM('utm_source'),
    utmMedium: getUTM('utm_medium'),
    utmCampaign: getUTM('utm_campaign')
  };
  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url + '/api/track', JSON.stringify(p));
    } else {
      fetch(url + '/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p), keepalive: true }).catch(function() {});
    }
  } catch(e) { /* silent */ }
}

function getUTM(p) {
  try { return new URLSearchParams(window.location.search).get(p) || ''; } catch(e) { return ''; }
}
