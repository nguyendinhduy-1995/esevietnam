document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initRevealAnimations();
  initLightbox();
  initFAQ();
  initSmoothScroll();
  initTracking();
  initPlayfulParticles();
  initCursorGlow();
  initMagneticButtons();
  initBounceCards();
  initForm();
  initHero3DTilt();
  initExitPopup();
  initTypewriter();
  initScrollProgress();
  initStickyCtaDesktop();
});

/* ====== TYPEWRITER ====== */
function initTypewriter() {
  var el = document.getElementById('heroTypewriter');
  if (!el) return;
  var text = 'Con thông minh nhưng còn nhút nhát, thiếu tự tin và chưa có phong thái?';
  var i = 0;
  var speed = 45;
  function type() {
    if (i < text.length) {
      el.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    }
  }
  setTimeout(type, 800);
}

/* ====== 3D HERO TILT ====== */
function initHero3DTilt() {
  if (window.innerWidth <= 768) return;
  var card = document.querySelector('.hero-card-3d');
  var wrapper = document.getElementById('hero3d');
  if (!card || !wrapper) return;
  var shapes = document.querySelectorAll('.hero-shape');
  var targetX = 0, targetY = 0, currentX = 0, currentY = 0;
  var active = false;

  wrapper.addEventListener('mouseenter', function() { active = true; });
  wrapper.addEventListener('mouseleave', function() {
    active = false; targetX = 0; targetY = 0;
  });
  wrapper.addEventListener('mousemove', function(e) {
    if (!active) return;
    var rect = wrapper.getBoundingClientRect();
    var x = (e.clientX - rect.left) / rect.width - 0.5;
    var y = (e.clientY - rect.top) / rect.height - 0.5;
    targetX = y * -8;
    targetY = x * 8;
  });

  function animate() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    card.style.transform = 'rotateX(' + currentX + 'deg) rotateY(' + currentY + 'deg)';
    shapes.forEach(function(shape, i) {
      var factor = 1 + (i * 0.3);
      shape.style.marginLeft = (currentY * factor * 2) + 'px';
      shape.style.marginTop = (currentX * factor * -2) + 'px';
    });
    requestAnimationFrame(animate);
  }
  animate();
}

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

  /* Mobile hamburger toggle */
  var toggle = document.getElementById('navbarToggle');
  var nav = document.getElementById('navbarNav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('active');
      nav.classList.toggle('open');
    });
    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.classList.remove('active');
        nav.classList.remove('open');
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
      if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(function (el) { observer.observe(el); });
}

/* ====== PLAYFUL FLOATING PARTICLES (Stars, bubbles, hearts) ====== */
function initPlayfulParticles() {
  var canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var isMobile = window.innerWidth <= 768;

  function resize() { canvas.width = canvas.parentElement.offsetWidth; canvas.height = canvas.parentElement.offsetHeight; }
  resize();
  window.addEventListener('resize', resize);

  var particles = [];
  var count = isMobile ? 18 : 35;
  var colors = [
    'rgba(212,175,55,0.08)',
    'rgba(184,150,12,0.06)',
    'rgba(212,175,55,0.05)',
    'rgba(230,192,56,0.06)',
    'rgba(212,175,55,0.04)',
    'rgba(229,221,208,0.07)',
    'rgba(184,150,12,0.04)'
  ];

  for (var i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 3 + Math.random() * 8,
      type: Math.floor(Math.random() * 3),
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.008,
      vy: -0.1 - Math.random() * 0.15,
      vx: (Math.random() - 0.5) * 0.1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.008 + Math.random() * 0.01
    });
  }

  function drawStar(x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.beginPath();
    for (var j = 0; j < 5; j++) {
      var angle = (j * 4 * Math.PI) / 5 - Math.PI / 2;
      var method = j === 0 ? 'moveTo' : 'lineTo';
      ctx[method](Math.cos(angle) * size, Math.sin(angle) * size);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  function drawBubble(x, y, size, color) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - size * 0.25, y - size * 0.25, size * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fill();
  }

  function drawSparkle(x, y, size, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = color;
    ctx.fillRect(-size * 0.15, -size, size * 0.3, size * 2);
    ctx.fillRect(-size, -size * 0.15, size * 2, size * 0.3);
    ctx.restore();
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(function (p) {
      p.y += p.vy;
      p.x += p.vx;
      p.rotation += p.rotSpeed;
      p.pulse += p.pulseSpeed;
      var scale = 0.7 + 0.3 * Math.sin(p.pulse);
      var drawSize = p.size * scale;
      if (p.y < -20) { p.y = canvas.height + 20; p.x = Math.random() * canvas.width; }
      if (p.x < -20) p.x = canvas.width + 20;
      if (p.x > canvas.width + 20) p.x = -20;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.translate(-p.x, -p.y);
      if (p.type === 0) drawStar(p.x, p.y, drawSize, p.color);
      else if (p.type === 1) drawBubble(p.x, p.y, drawSize, p.color);
      else drawSparkle(p.x, p.y, drawSize, p.color);
      ctx.restore();
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
  function update() { gx += (mx - gx) * 0.08; gy += (my - gy) * 0.08; glow.style.left = gx + 'px'; glow.style.top = gy + 'px'; requestAnimationFrame(update); }
  update();
}

/* ====== MAGNETIC BUTTONS ====== */
function initMagneticButtons() {
  if (window.innerWidth <= 768) return;
  document.querySelectorAll('.btn-primary, .btn-outline, .btn-zalo').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + ((e.clientX - rect.left - rect.width / 2) * 0.08) + 'px, ' + ((e.clientY - rect.top - rect.height / 2) * 0.08) + 'px)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });
}

/* ====== BOUNCE CARDS ====== */
function initBounceCards() {
  if (window.innerWidth <= 768) return;
  document.querySelectorAll('.glass-card, .pain-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () { card.style.transition = 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)'; card.style.transform = 'translateY(-6px) scale(1.01)'; });
    card.addEventListener('mouseleave', function () { card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)'; card.style.transform = ''; });
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
      if (!isActive) { this.classList.add('active'); answer.classList.add('active'); }
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
      var caption = document.getElementById('lightbox-caption');
      if (caption) caption.textContent = this.alt || '';
    });
  });
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox || e.target.classList.contains('lightbox-close')) { lightbox.classList.remove('active'); document.body.style.overflow = ''; } });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lightbox.classList.contains('active')) { lightbox.classList.remove('active'); document.body.style.overflow = ''; } });
}

/* ====== SMOOTH SCROLL ====== */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (href === '#') return;
      var target = document.querySelector(href);
      if (target) { e.preventDefault(); window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - 80, behavior: 'smooth' }); trackEvent('CTA_CLICK', { target: href }); }
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
      source: window.__esePage || 'kidiquette_summer',
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
  input.style.borderColor = '#ff7979';
}
function clearErrors() {
  document.querySelectorAll('.form-error').forEach(function (el) { el.style.display = 'none'; });
  document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(function (el) { el.style.borderColor = ''; });
}

/* ====== TRACKING ====== */
function initTracking() {
  if (!sessionStorage.getItem('ese_session_id')) sessionStorage.setItem('ese_session_id', 'ese_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));
  trackEvent('PAGE_VIEW');
  var firedDepths = new Set();
  window.addEventListener('scroll', function () {
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((window.scrollY / docHeight) * 100);
    [25, 50, 75, 90].forEach(function (t) { if (pct >= t && !firedDepths.has(t)) { firedDepths.add(t); trackEvent('SCROLL_DEPTH', { depth: t }); } });
  }, { passive: true });
}
function trackEvent(eventName, data) {
  var crmUrl = window.__eseCrmUrl || 'https://crm.esevietnam.vn';
  var payload = { sessionId: sessionStorage.getItem('ese_session_id') || '', page: window.__esePage || 'kidiquette_summer', event: eventName, data: data || null, referrer: document.referrer || null, utmSource: getUTM('utm_source'), utmMedium: getUTM('utm_medium'), utmCampaign: getUTM('utm_campaign') };
  try { if (navigator.sendBeacon) navigator.sendBeacon(crmUrl + '/api/track', JSON.stringify(payload)); else fetch(crmUrl + '/api/track', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(function() {}); } catch(e) {}
}
function getUTM(param) { try { return new URLSearchParams(window.location.search).get(param) || ''; } catch (e) { return ''; } }

/* ====== EXIT INTENT POPUP ====== */
function initExitPopup() {
  if (window.innerWidth <= 768) return;
  var popup = document.getElementById('exitPopup');
  if (!popup) return;
  var shown = false;
  var armed = false;

  setTimeout(function() { armed = true; }, 10000);

  document.addEventListener('mouseout', function(e) {
    if (shown || !armed) return;
    if (e.clientY > 10) return;
    if (sessionStorage.getItem('ese_exit_shown')) return;
    shown = true;
    popup.classList.add('active');
    document.body.style.overflow = 'hidden';
    sessionStorage.setItem('ese_exit_shown', '1');
    trackEvent('EXIT_POPUP_SHOWN');
  });

  var overlay = document.getElementById('exitOverlay');
  var closeBtn = document.getElementById('exitClose');
  function closePopup() {
    popup.classList.remove('active');
    document.body.style.overflow = '';
  }
  if (overlay) overlay.addEventListener('click', closePopup);
  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && popup.classList.contains('active')) closePopup();
  });
}

/* ====== SCROLL PROGRESS BAR ====== */
function initScrollProgress() {
  var bar = document.getElementById('scrollProgress');
  if (!bar) return;
  window.addEventListener('scroll', function() {
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    if (docH <= 0) return;
    bar.style.width = Math.min((window.scrollY / docH) * 100, 100) + '%';
  }, { passive: true });
}

/* ====== STICKY CTA DESKTOP ====== */
function initStickyCtaDesktop() {
  if (window.innerWidth <= 768) return;
  var cta = document.getElementById('stickyCtaDesktop');
  if (!cta) return;
  var shown = false;
  window.addEventListener('scroll', function() {
    var shouldShow = window.scrollY > window.innerHeight;
    if (shouldShow && !shown) {
      shown = true;
      cta.classList.add('visible');
    } else if (!shouldShow && shown) {
      shown = false;
      cta.classList.remove('visible');
    }
  }, { passive: true });
}
