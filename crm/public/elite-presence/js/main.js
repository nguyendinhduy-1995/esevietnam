document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initRevealAnimations();
  initLightbox();
  initForm();
  initSmoothScroll();
  initTracking();
  initCosmos();
  initCursorGlow();
  initParallax();
  initMagneticButtons();
  initTiltCards();
  initTypingEffect();
});

/* ====== NAVBAR SCROLL ====== */
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

/* ====== COSMOS EFFECT ====== */
function initCosmos() {
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

  // Stars
  var starCount = isMobile ? 80 : 200;
  var stars = [];
  for (var i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.015 + 0.003,
      twinklePhase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.05,
      driftY: (Math.random() - 0.5) * 0.03
    });
  }

  // Shooting stars
  var shootingStars = [];
  var shootingTimer = 0;
  var shootingInterval = isMobile ? 300 : 180;

  function spawnShootingStar() {
    var startX = Math.random() * canvas.width * 0.8;
    var startY = Math.random() * canvas.height * 0.5;
    var angle = Math.PI / 6 + Math.random() * Math.PI / 6;
    var speed = 3 + Math.random() * 4;
    shootingStars.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      decay: 0.012 + Math.random() * 0.008,
      length: 40 + Math.random() * 60,
      size: 1 + Math.random() * 1.2
    });
  }

  // Nebula blobs (slow-moving soft color clouds)
  var nebulae = [];
  var nebulaCount = isMobile ? 2 : 4;
  for (var n = 0; n < nebulaCount; n++) {
    var hue = Math.random() > 0.5 ? 38 : 280;
    nebulae.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: 100 + Math.random() * 200,
      hue: hue,
      opacity: 0.015 + Math.random() * 0.015,
      driftX: (Math.random() - 0.5) * 0.15,
      driftY: (Math.random() - 0.5) * 0.1,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.003 + Math.random() * 0.003
    });
  }

  // Constellation lines
  var constellationStars = [];
  var constellationCount = isMobile ? 4 : 8;
  for (var c = 0; c < constellationCount; c++) {
    constellationStars.push({
      x: 100 + Math.random() * (canvas.width - 200),
      y: 80 + Math.random() * (canvas.height - 200),
      size: 1.5 + Math.random() * 1,
      opacity: 0.3 + Math.random() * 0.3
    });
  }

  function drawConstellations() {
    if (constellationStars.length < 2) return;
    ctx.strokeStyle = 'rgba(201, 169, 110, 0.04)';
    ctx.lineWidth = 0.5;
    for (var i = 0; i < constellationStars.length; i++) {
      for (var j = i + 1; j < constellationStars.length; j++) {
        var dx = constellationStars[i].x - constellationStars[j].x;
        var dy = constellationStars[i].y - constellationStars[j].y;
        var dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 250) {
          var lineOpacity = (1 - dist / 250) * 0.06;
          ctx.strokeStyle = 'rgba(201, 169, 110, ' + lineOpacity + ')';
          ctx.beginPath();
          ctx.moveTo(constellationStars[i].x, constellationStars[i].y);
          ctx.lineTo(constellationStars[j].x, constellationStars[j].y);
          ctx.stroke();
        }
      }
    }
    // Draw constellation star points
    constellationStars.forEach(function(s) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(201, 169, 110, ' + s.opacity + ')';
      ctx.fill();
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw nebulae
    nebulae.forEach(function(neb) {
      neb.x += neb.driftX;
      neb.y += neb.driftY;
      neb.pulse += neb.pulseSpeed;
      var currentOpacity = neb.opacity * (0.7 + 0.3 * Math.sin(neb.pulse));

      if (neb.x < -neb.radius) neb.x = canvas.width + neb.radius;
      if (neb.x > canvas.width + neb.radius) neb.x = -neb.radius;
      if (neb.y < -neb.radius) neb.y = canvas.height + neb.radius;
      if (neb.y > canvas.height + neb.radius) neb.y = -neb.radius;

      var grad = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius);
      grad.addColorStop(0, 'hsla(' + neb.hue + ', 50%, 50%, ' + currentOpacity + ')');
      grad.addColorStop(0.5, 'hsla(' + neb.hue + ', 40%, 30%, ' + (currentOpacity * 0.4) + ')');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.fillRect(neb.x - neb.radius, neb.y - neb.radius, neb.radius * 2, neb.radius * 2);
    });

    // Draw constellation lines
    drawConstellations();

    // Draw stars
    stars.forEach(function (s) {
      s.x += s.driftX;
      s.y += s.driftY;
      s.twinklePhase += s.twinkleSpeed;
      var twinkle = 0.4 + 0.6 * Math.sin(s.twinklePhase);
      var currentOpacity = s.opacity * twinkle;

      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      if (s.y < 0) s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;

      // Star core
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(245, 230, 200, ' + currentOpacity + ')';
      ctx.fill();

      // Star glow
      if (s.size > 1) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201, 169, 110, ' + (currentOpacity * 0.1) + ')';
        ctx.fill();
      }

      // Cross sparkle for bright stars
      if (s.size > 1.2 && twinkle > 0.8) {
        ctx.strokeStyle = 'rgba(245, 230, 200, ' + (currentOpacity * 0.3) + ')';
        ctx.lineWidth = 0.5;
        var sparkLen = s.size * 4;
        ctx.beginPath();
        ctx.moveTo(s.x - sparkLen, s.y);
        ctx.lineTo(s.x + sparkLen, s.y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - sparkLen);
        ctx.lineTo(s.x, s.y + sparkLen);
        ctx.stroke();
      }
    });

    // Shooting stars
    shootingTimer++;
    if (shootingTimer > shootingInterval) {
      shootingTimer = 0;
      shootingInterval = (isMobile ? 250 : 130) + Math.random() * 150;
      spawnShootingStar();
    }

    for (var si = shootingStars.length - 1; si >= 0; si--) {
      var ss = shootingStars[si];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life -= ss.decay;

      if (ss.life <= 0) {
        shootingStars.splice(si, 1);
        continue;
      }

      var tailX = ss.x - (ss.vx / Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy)) * ss.length * ss.life;
      var tailY = ss.y - (ss.vy / Math.sqrt(ss.vx * ss.vx + ss.vy * ss.vy)) * ss.length * ss.life;

      var grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
      grad.addColorStop(0, 'rgba(201, 169, 110, 0)');
      grad.addColorStop(0.6, 'rgba(245, 230, 200, ' + (ss.life * 0.4) + ')');
      grad.addColorStop(1, 'rgba(255, 255, 255, ' + (ss.life * 0.8) + ')');

      ctx.strokeStyle = grad;
      ctx.lineWidth = ss.size;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(ss.x, ss.y);
      ctx.stroke();

      // Head glow
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, ss.size * 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + (ss.life * 0.3) + ')';
      ctx.fill();
    }

    requestAnimationFrame(animate);
  }
  animate();
}

/* ====== CURSOR GLOW (desktop) ====== */
function initCursorGlow() {
  if (window.innerWidth <= 768) return;
  var glow = document.querySelector('.cursor-glow');
  if (!glow) return;
  var mx = 0, my = 0, gx = 0, gy = 0;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    glow.classList.add('active');
  });

  document.addEventListener('mouseleave', function () {
    glow.classList.remove('active');
  });

  function update() {
    gx += (mx - gx) * 0.08;
    gy += (my - gy) * 0.08;
    glow.style.left = gx + 'px';
    glow.style.top = gy + 'px';
    requestAnimationFrame(update);
  }
  update();
}

/* ====== PARALLAX ====== */
function initParallax() {
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (!parallaxEls.length) return;
  window.addEventListener('scroll', function () {
    var scrollY = window.scrollY;
    parallaxEls.forEach(function (el) {
      var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
      var rect = el.getBoundingClientRect();
      var offset = (rect.top + scrollY - window.innerHeight / 2) * speed;
      el.style.transform = 'translateY(' + offset + 'px)';
    });
  }, { passive: true });
}

/* ====== MAGNETIC BUTTONS ====== */
function initMagneticButtons() {
  if (window.innerWidth <= 768) return;
  var buttons = document.querySelectorAll('.btn-primary, .btn-outline');
  buttons.forEach(function (btn) {
    btn.addEventListener('mousemove', function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = 'translate(' + (x * 0.15) + 'px, ' + (y * 0.15) + 'px)';
    });
    btn.addEventListener('mouseleave', function () {
      btn.style.transform = '';
    });
  });
}

/* ====== TILT CARDS ====== */
function initTiltCards() {
  if (window.innerWidth <= 768) return;
  var cards = document.querySelectorAll('.glass-card');
  cards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = (e.clientX - rect.left) / rect.width;
      var y = (e.clientY - rect.top) / rect.height;
      var tiltX = (0.5 - y) * 6;
      var tiltY = (x - 0.5) * 6;
      card.style.transform = 'perspective(800px) rotateX(' + tiltX + 'deg) rotateY(' + tiltY + 'deg) translateY(-6px)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.23,1,0.32,1)';
    });
    card.addEventListener('mouseenter', function () {
      card.style.transition = 'transform 0.15s ease';
    });
  });
}

/* ====== TYPING EFFECT for hero quote ====== */
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
      el.querySelectorAll('span').forEach(function (span) {
        span.style.opacity = '1';
        span.style.transform = 'translateY(0)';
      });
    });
  }, 2200);
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
      showError(phone, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0');
      valid = false;
    }

    if (!valid) return;

    var submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Đang gửi...'; }

    var formData = {
      name: name.value.trim(),
      phone: phoneVal,
      package: form.querySelector('#form-package') ? form.querySelector('#form-package').value : '',
      message: form.querySelector('#form-message') ? form.querySelector('#form-message').value.trim() : '',
      source: window.__esePage || 'elite_presence',
      sessionId: sessionStorage.getItem('ese_session_id') || '',
      utmSource: getUTM('utm_source'),
      utmMedium: getUTM('utm_medium'),
      utmCampaign: getUTM('utm_campaign')
    };

    // Also get child fields if present
    var childNameInput = form.querySelector('#form-child-name');
    var childAgeInput = form.querySelector('#form-child-age');
    if (childNameInput && childNameInput.value) formData.childName = childNameInput.value.trim();
    if (childAgeInput && childAgeInput.value) formData.childAge = childAgeInput.value;

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
      // Fallback: still show success even if CRM is down
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
  input.style.borderColor = '#e74c3c';
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

  var timePulses = [10, 30, 60];
  timePulses.forEach(function (sec) {
    setTimeout(function () {
      trackEvent('TIME_ON_PAGE', { seconds: sec });
    }, sec * 1000);
  });
}

function trackEvent(eventName, data) {
  var crmUrl = window.__eseCrmUrl || 'http://localhost:3000';
  var payload = {
    sessionId: sessionStorage.getItem('ese_session_id') || '',
    page: window.__esePage || 'elite_presence',
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
