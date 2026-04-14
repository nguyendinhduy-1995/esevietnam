/**
 * ESE Vietnam — Landing Page Analytics Tracker
 * Tự động track: page view, scroll depth, CTA clicks, form interactions, time on page
 * Deploy: Thêm <script src="/tracking.js" data-page="elite_presence" data-api="http://localhost:3000"></script>
 */
(function () {
  'use strict';

  var script = document.currentScript;
  var PAGE = script ? script.getAttribute('data-page') : 'elite_presence';
  var API_BASE = script ? script.getAttribute('data-api') : 'http://localhost:3000';
  var TRACK_URL = API_BASE + '/api/track';

  // Session ID
  var SESSION_KEY = 'ese_session_id';
  var sessionId = sessionStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = 'ls_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 8);
    sessionStorage.setItem(SESSION_KEY, sessionId);
  }

  // UTM params
  var params = new URLSearchParams(window.location.search);
  var utm = {
    utmSource: params.get('utm_source') || null,
    utmMedium: params.get('utm_medium') || null,
    utmCampaign: params.get('utm_campaign') || null,
  };

  function track(event, data) {
    try {
      var payload = {
        sessionId: sessionId,
        page: PAGE,
        event: event,
        data: data || null,
        referrer: document.referrer || null,
        utmSource: utm.utmSource,
        utmMedium: utm.utmMedium,
        utmCampaign: utm.utmCampaign,
      };

      if (navigator.sendBeacon) {
        navigator.sendBeacon(TRACK_URL, JSON.stringify(payload));
      } else {
        fetch(TRACK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(function () {});
      }
    } catch (e) { /* silent */ }
  }

  // 1. PAGE_VIEW
  track('PAGE_VIEW', { url: window.location.href, title: document.title });

  // 2. SCROLL_DEPTH
  var scrollFired = {};
  var thresholds = [25, 50, 75, 90];
  window.addEventListener('scroll', function () {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((scrollTop / docHeight) * 100);
    for (var i = 0; i < thresholds.length; i++) {
      if (pct >= thresholds[i] && !scrollFired[thresholds[i]]) {
        scrollFired[thresholds[i]] = true;
        track('SCROLL_DEPTH', { depth: thresholds[i] });
      }
    }
  }, { passive: true });

  // 3. TIME_ON_PAGE
  var timeIntervals = [10, 30, 60, 120, 300];
  var timeFired = {};
  timeIntervals.forEach(function (sec) {
    setTimeout(function () {
      if (!timeFired[sec]) {
        timeFired[sec] = true;
        track('TIME_ON_PAGE', { seconds: sec });
      }
    }, sec * 1000);
  });

  // 4. CTA_CLICK
  document.addEventListener('click', function (e) {
    var el = e.target;
    while (el && el !== document.body) {
      if (el.tagName === 'A' || el.tagName === 'BUTTON') {
        var text = (el.textContent || '').trim().substring(0, 50);
        var href = el.getAttribute('href') || '';

        // Track Zalo
        if (href.indexOf('zalo.me') !== -1) {
          track('CTA_CLICK', { type: 'zalo', text: text, href: href });
          return;
        }
        // Track Hotline
        if (href.indexOf('tel:') === 0) {
          track('CTA_CLICK', { type: 'hotline', text: text, href: href });
          return;
        }
        // Track Register scroll
        if (href.indexOf('#register') !== -1 || href.indexOf('#dang-ky') !== -1) {
          track('CTA_CLICK', { type: 'register_scroll', text: text });
          return;
        }
        // General CTA button
        if (el.classList.contains('btn-primary') || el.classList.contains('btn-cta')) {
          track('CTA_CLICK', { type: 'button', text: text, id: el.id || null });
          return;
        }
        break;
      }
      el = el.parentElement;
    }
  });

  // 5. FORM_START & FORM_SUBMIT
  var formStarted = false;
  document.addEventListener('focusin', function (e) {
    if (formStarted) return;
    var el = e.target;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA')) {
      var form = el.closest('form');
      if (form && (form.id === 'register-form' || form.id === 'registration-form' || form.classList.contains('register-form'))) {
        formStarted = true;
        track('FORM_START', { field: el.name || el.id || el.type });
      }
    }
  });

  // Expose for form submission integration
  window.__eseTrack = track;
  window.__eseSessionId = sessionId;
})();
