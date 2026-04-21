document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initRevealAnimations();
  initLightbox();
  initFAQ();
  initSmoothScroll();
  initTracking();
  initGeometricParticles();
  initCursorGlow();
  initMagneticButtons();
  initTiltCards();
  initForm();
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

/* ====== GEOMETRIC FLOATING PARTICLES (Light teen theme) ====== */
function initGeometricParticles() {
  var canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var isMobile = window.innerWidth <= 768;

  function resize() {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  var shapes = [];
  var shapeCount = isMobile ? 12 : 25;
  var colors = [
    'rgba(67,97,238,0.08)',
    'rgba(124,58,237,0.06)',
    'rgba(244,114,182,0.06)',
    'rgba(6,182,212,0.05)',
    'rgba(16,185,129,0.05)',
    'rgba(251,191,36,0.04)'
  ];

  for (var i = 0; i < shapeCount; i++) {
    shapes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 20 + Math.random() * 60,
      type: Math.floor(Math.random() * 3),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.005,
      vx: (Math.random() - 0.5) * 0.15,
      vy: (Math.random() - 0.5) * 0.1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.005 + Math.random() * 0.008
    });
  }

  var dots = [];
  var dotCount = isMobile ? 30 : 60;
  for (var d = 0; d < dotCount; d++) {
    dots.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 1 + Math.random() * 2,
      opacity: 0.08 + Math.random() * 0.15,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.01,
      vy: -0.05 - Math.random() * 0.1
    });
  }

  function drawCircle(x, y, size, color) {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function drawSquare(x, y, size, rotation, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.fillRect(-size / 2, -size / 2, size, size);
    ctx.restore();
  }

  function drawTriangle(x, y, size, rotation, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    ctx.beginPath();
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(size / 2, size / 2);
    ctx.lineTo(-size / 2, size / 2);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(function (dot) {
      dot.y += dot.vy;
      dot.pulse += dot.pulseSpeed;
      var curOp = dot.opacity * (0.5 + 0.5 * Math.sin(dot.pulse));
      if (dot.y < -10) { dot.y = canvas.height + 10; dot.x = Math.random() * canvas.width; }
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(67,97,238,' + curOp + ')';
      ctx.fill();
    });

    shapes.forEach(function (s) {
      s.x += s.vx;
      s.y += s.vy;
      s.rotation += s.rotSpeed;
      s.pulse += s.pulseSpeed;
      var scale = 0.8 + 0.2 * Math.sin(s.pulse);
      var drawSize = s.size * scale;

      if (s.x < -s.size) s.x = canvas.width + s.size;
      if (s.x > canvas.width + s.size) s.x = -s.size;
      if (s.y < -s.size) s.y = canvas.height + s.size;
      if (s.y > canvas.height + s.size) s.y = -s.size;

      if (s.type === 0) drawCircle(s.x, s.y, drawSize, s.color);
      else if (s.type === 1) drawSquare(s.x, s.y, drawSize * 0.7, s.rotation, s.color);
      else drawTriangle(s.x, s.y, drawSize * 0.8, s.rotation, s.color);
    });

    requestAnimationFrame(animate);
  }
  animate();
}

/* ====== CURSOR GLOW ====== */
function initCursorGlow() {
  if (window.innerWidth <= 768) return;
  var glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  var mx = 0, my = 0, gx = 0, gy = 0;
  document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; glow.classList.add('active'); });
  document.addEventListener('mouseleave', function () { glow.classList.remove('active'); });
  function update() {
    gx += (mx - gx) * 0.08; gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px'; glow.style.top = gy + 'px';
    requestAnimationFrame(update);
  }
  update();
}

/* ====== MAGNETIC BUTTONS ====== */
function initMagneticButtons() {
  if (window.innerWidth <= 768) return;
  document.querySelectorAll('.btn-primary, .btn-outline, .btn-zalo').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + ((e.clientX - rect.left - rect.width / 2) * 0.1) + 'px, ' + ((e.clientY - rect.top - rect.height / 2) * 0.1) + 'px)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });
}

/* ====== TILT CARDS ====== */
function initTiltCards() {
  if (window.innerWidth <= 768) return;
  document.querySelectorAll('.glass-card, .pain-card, .solution-card .glass-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      card.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 4) + 'deg) rotateY(' + ((x - 0.5) * 4) + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', function () { card.style.transform = ''; card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)'; });
    card.addEventListener('mouseenter', function () { card.style.transition = 'transform 0.15s ease'; });
  });
}

/* ====== FAQ ACCORDION ====== */
function initFAQ() {
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var answer = this.nextElementSibling;
      var isActive = this.classList.contains('active');
      document.querySelectorAll('.faq-question').forEach(function (q) { q.classList.remove('active'); });
      document.querySelectorAll('.faq-answer').forEach(function (a) { a.classList.remove('active'); });
      if (!isActive) {
        this.classList.add('active');
        answer.classList.add('active');
      }
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
    if (e.key === 'Escape' && lightbox.classList.contains('active')) { lightbox.classList.remove('active'); document.body.style.overflow = ''; }
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
        window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' });
        trackEvent('CTA_CLICK', { target: href });
      }
    });
  });
}

/* ====== REGISTRATION FORM ====== */
function initForm() {
  var form = document.getElementById('registrationForm');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var valid = true;
    clearErrors();
    var parent = form.querySelector('#form-parent');
    var child = form.querySelector('#form-child');
    var phone = form.querySelector('#form-phone');
    if (!parent.value.trim()) { showError(parent, 'Vui lòng nhập họ tên phụ huynh'); valid = false; }
    if (!child.value.trim()) { showError(child, 'Vui lòng nhập tên con'); valid = false; }
    var phoneVal = phone.value.trim().replace(/\s/g, '');
    if (!phoneVal || !/^0\d{9}$/.test(phoneVal)) { showError(phone, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'); valid = false; }
    if (!valid) return;
    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi...'; }
    var formData = {
      name: parent.value.trim(), phone: phoneVal, childName: child.value.trim(),
      childAge: (form.querySelector('#form-age') || {}).value || '',
      package: form.querySelector('#form-package') ? form.querySelector('#form-package').value : '',
      message: form.querySelector('#form-message') ? form.querySelector('#form-message').value.trim() : '',
      source: window.__esePage || 'teen_etiquette_summer',
      sessionId: sessionStorage.getItem('ese_session_id') || '',
      utmSource: getUTM('utm_source'), utmMedium: getUTM('utm_medium'), utmCampaign: getUTM('utm_campaign')
    };
    fetch((window.__eseCrmUrl || '') + '/api/landing/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData)
    }).then(function(res) { return res.json(); }).then(function(data) {
      if (data.success) { showSuccess(); } else {
        alert(data.error || 'Có lỗi xảy ra, vui lòng thử lại.');
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = 'Gửi Đăng Ký'; }
      }
    }).catch(function() { showSuccess(); });
    function showSuccess() {
      form.style.display = 'none';
      var success = document.getElementById('form-success');
      if (success) success.classList.add('active');
      trackEvent('FORM_SUBMIT', formData);
    }
  });
}
function showError(input, message) {
  var group = input.closest('.form-group');
  var error = group.querySelector('.form-error');
  if (error) { error.textContent = message; error.style.display = 'block'; }
  input.style.borderColor = '#ef4444';
}
function clearErrors() {
  document.querySelectorAll('.form-error').forEach(function (el) { el.style.display = 'none'; });
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(function (el) { el.style.borderColor = ''; });
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
  var crmUrl = window.__eseCrmUrl || 'https://crm.esevietnam.vn';
  var payload = {
    sessionId: sessionStorage.getItem('ese_session_id') || '',
    page: window.__esePage || 'teen_etiquette_summer',
    event: eventName,
    data: data || null,
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
function getUTM(param) { try { return new URLSearchParams(window.location.search).get(param) || ''; } catch (e) { return ''; } }
