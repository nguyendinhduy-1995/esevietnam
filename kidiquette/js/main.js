document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initRevealAnimations();
  initLightbox();
  initForm();
  initSmoothScroll();
  initTracking();
  initFireflies();
  initCursorGlow();
  initMagneticButtons();
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

/* ====== FIREFLIES (Warm theme — playful for kids) ====== */
function initFireflies() {
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

  // Warm twinkling stars
  var starCount = isMobile ? 60 : 140;
  var stars = [];
  for (var i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.3 + 0.3,
      opacity: Math.random() * 0.4 + 0.15,
      twinkleSpeed: Math.random() * 0.015 + 0.004,
      twinklePhase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.04,
      driftY: (Math.random() - 0.5) * 0.02
    });
  }

  // Fireflies — warm glowing orbs floating gently
  var fireflyCount = isMobile ? 8 : 18;
  var fireflies = [];
  for (var f = 0; f < fireflyCount; f++) {
    fireflies.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: 2 + Math.random() * 3,
      opacity: 0.1 + Math.random() * 0.3,
      glowRadius: 15 + Math.random() * 25,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.3,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.01 + Math.random() * 0.015,
      hue: 30 + Math.random() * 20 // warm amber range
    });
  }

  // Warm nebula clouds
  var nebulae = [];
  var nebulaCount = isMobile ? 2 : 3;
  for (var n = 0; n < nebulaCount; n++) {
    nebulae.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 120 + Math.random() * 180,
      hue: 25 + Math.random() * 20,
      opacity: 0.012 + Math.random() * 0.012,
      driftX: (Math.random() - 0.5) * 0.12,
      driftY: (Math.random() - 0.5) * 0.08,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.003 + Math.random() * 0.003
    });
  }

  // Shooting stars
  var shootingStars = [];
  var shootingTimer = 0;
  var shootingInterval = isMobile ? 350 : 220;

  function spawnShootingStar() {
    var startX = Math.random() * canvas.width * 0.7;
    var startY = Math.random() * canvas.height * 0.4;
    var angle = Math.PI / 5 + Math.random() * Math.PI / 5;
    var speed = 3 + Math.random() * 3;
    shootingStars.push({
      x: startX, y: startY,
      vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      life: 1, decay: 0.014 + Math.random() * 0.008,
      length: 35 + Math.random() * 50, size: 0.8 + Math.random() * 1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Nebulae
    nebulae.forEach(function (neb) {
      neb.x += neb.driftX; neb.y += neb.driftY; neb.pulse += neb.pulseSpeed;
      var curOp = neb.opacity * (0.7 + 0.3 * Math.sin(neb.pulse));
      if (neb.x < -neb.radius) neb.x = canvas.width + neb.radius;
      if (neb.x > canvas.width + neb.radius) neb.x = -neb.radius;
      if (neb.y < -neb.radius) neb.y = canvas.height + neb.radius;
      if (neb.y > canvas.height + neb.radius) neb.y = -neb.radius;
      var grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
      grad.addColorStop(0, 'hsla(' + neb.hue + ', 80%, 55%, ' + curOp + ')');
      grad.addColorStop(0.5, 'hsla(' + neb.hue + ', 60%, 35%, ' + (curOp * 0.4) + ')');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(neb.x - neb.radius, neb.y - neb.radius, neb.radius * 2, neb.radius * 2);
    });

    // Stars
    stars.forEach(function (s) {
      s.x += s.driftX; s.y += s.driftY; s.twinklePhase += s.twinkleSpeed;
      var twinkle = 0.4 + 0.6 * Math.sin(s.twinklePhase);
      var curOp = s.opacity * twinkle;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      if (s.y < 0) s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 230, 190, ' + curOp + ')';
      ctx.fill();
      if (s.size > 1) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(245, 158, 66, ' + (curOp * 0.08) + ')';
        ctx.fill();
      }
    });

    // Fireflies
    fireflies.forEach(function (ff) {
      ff.x += ff.vx; ff.y += ff.vy; ff.pulse += ff.pulseSpeed;
      var pulseFactor = 0.5 + 0.5 * Math.sin(ff.pulse);
      var curOp = ff.opacity * pulseFactor;

      // Bounce off edges softly
      if (ff.x < 20 || ff.x > canvas.width - 20) ff.vx *= -1;
      if (ff.y < 20 || ff.y > canvas.height - 20) ff.vy *= -1;

      // Add slight random drift
      ff.vx += (Math.random() - 0.5) * 0.02;
      ff.vy += (Math.random() - 0.5) * 0.02;
      ff.vx = Math.max(-0.6, Math.min(0.6, ff.vx));
      ff.vy = Math.max(-0.5, Math.min(0.5, ff.vy));

      // Outer glow
      var grad = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, ff.glowRadius * pulseFactor);
      grad.addColorStop(0, 'hsla(' + ff.hue + ', 90%, 65%, ' + (curOp * 0.5) + ')');
      grad.addColorStop(0.4, 'hsla(' + ff.hue + ', 70%, 50%, ' + (curOp * 0.15) + ')');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.glowRadius * pulseFactor, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.size * pulseFactor, 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + ff.hue + ', 95%, 75%, ' + curOp + ')';
      ctx.fill();
    });

    // Shooting stars
    shootingTimer++;
    if (shootingTimer > shootingInterval) {
      shootingTimer = 0;
      shootingInterval = (isMobile ? 300 : 170) + Math.random() * 180;
      spawnShootingStar();
    }
    for (var si = shootingStars.length - 1; si >= 0; si--) {
      var ss = shootingStars[si];
      ss.x += ss.vx; ss.y += ss.vy; ss.life -= ss.decay;
      if (ss.life <= 0) { shootingStars.splice(si, 1); continue; }
      var mag = Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy);
      var tailX = ss.x - (ss.vx / mag) * ss.length * ss.life;
      var tailY = ss.y - (ss.vy / mag) * ss.length * ss.life;
      var grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, 'rgba(245, 158, 66, 0)');
      grad.addColorStop(0.6, 'rgba(255, 230, 190, ' + (ss.life * 0.4) + ')');
      grad.addColorStop(1, 'rgba(255, 255, 255, ' + (ss.life * 0.7) + ')');
      ctx.strokeStyle = grad; ctx.lineWidth = ss.size; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(ss.x, ss.y); ctx.stroke();
      ctx.beginPath(); ctx.arc(ss.x, ss.y, ss.size * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (ss.life * 0.3) + ')';
      ctx.fill();
    }

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
  document.querySelectorAll('.btn-primary, .btn-outline').forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      btn.style.transform = 'translate(' + ((e.clientX - rect.left - rect.width / 2) * 0.15) + 'px, ' + ((e.clientY - rect.top - rect.height / 2) * 0.15) + 'px)';
    });
    btn.addEventListener('mouseleave', function () { btn.style.transform = ''; });
  });
}

/* ====== TILT CARDS ====== */
function initTiltCards() {
  if (window.innerWidth <= 768) return;
  document.querySelectorAll('.glass-card').forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      card.style.transform = 'perspective(800px) rotateX(' + ((0.5 - y) * 6) + 'deg) rotateY(' + ((x - 0.5) * 6) + 'deg) translateY(-6px)';
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
  }, 2200);
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

/* ====== FORM ====== */
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
      name: parent.value.trim(),
      phone: phoneVal,
      childName: child.value.trim(),
      childAge: (form.querySelector('#form-age') || {}).value || '',
      package: form.querySelector('#form-package') ? form.querySelector('#form-package').value : '',
      message: form.querySelector('#form-message') ? form.querySelector('#form-message').value.trim() : '',
      source: window.__esePage || 'kidiquette',
      sessionId: sessionStorage.getItem('ese_session_id') || '',
      utmSource: getUTM('utm_source'), utmMedium: getUTM('utm_medium'), utmCampaign: getUTM('utm_campaign')
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
  input.style.borderColor = '#e74c3c';
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
    page: window.__esePage || 'kidiquette',
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
