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
    'rgba(245,166,35,0.12)',
    'rgba(255,140,66,0.09)',
    'rgba(79,195,247,0.08)',
    'rgba(102,187,106,0.07)',
    'rgba(255,213,79,0.1)',
    'rgba(244,143,177,0.07)',
    'rgba(179,157,219,0.06)'
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
    img.addEventListener('click', function () { lightboxImg.src = this.src; lightboxImg.alt = this.alt; lightbox.classList.add('active'); document.body.style.overflow = 'hidden'; });
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
