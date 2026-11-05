/* Miles Caton — a fan record. One script for every page; each feature only runs if its markup is present. */
(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return [].slice.call((c || document).querySelectorAll(s)); };
  var root = document.documentElement;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasG = !!(window.gsap && window.ScrollTrigger);
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var sstore = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  if (reduce) root.classList.add('rm');
  if (hasG) gsap.registerPlugin(ScrollTrigger);

  /* ---------- smooth scroll ---------- */
  var lenis = null;
  if (hasG && !reduce && window.Lenis) {
    lenis = new Lenis({ lerp: 0.085 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function scrollToEl(t) {
    if (lenis) lenis.scrollTo(t, { duration: 1.4 });
    else if (t === 0) window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    else t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href'); if (id.length < 2) return;
      var t = id === '#main' ? 0 : $(id); if (t === null) return;
      e.preventDefault(); scrollToEl(t);
      if (id === '#main') { var m = $('#main'); m && m.focus({ preventScroll: true }); }
    });
  });


  /* ---------- header: solid after the first screen, tucks away on scroll down ---------- */
  var hdr = $('#hdr'), lastY = 0;
  function onScrollHdr(y) {
    if (!hdr) return;
    hdr.classList.toggle('solid', y > 60);
    var down = y > lastY + 4, up = y < lastY - 4;
    if (down && y > innerHeight * 0.6 && !root.classList.contains('menu-open') && !hdr.contains(document.activeElement)) hdr.classList.add('away');
    else if (up || y < 60) hdr.classList.remove('away');
    lastY = y;
  }
  if (lenis) lenis.on('scroll', function (e) { onScrollHdr(e.scroll); });
  else addEventListener('scroll', function () { onScrollHdr(scrollY); }, { passive: true });
  if (hdr) hdr.addEventListener('focusin', function () { hdr.classList.remove('away'); });

  /* ---------- theme follows the section under the header ---------- */
  function setTheme(t) { document.body.dataset.theme = t; }
  if (hasG) {
    $$('[data-theme]').forEach(function (s) {
      if (s === document.body) return;
      ScrollTrigger.create({ trigger: s, start: 'top 40px', end: 'bottom 40px', onToggle: function (st) { if (st.isActive) setTheme(s.dataset.theme); } });
    });
  }

  /* ---------- custom cursor (mouse only) ---------- */
  var dot = $('#cdot'), ring = $('#cring'), clabel = $('#clabel');
  var mx = innerWidth / 2, my = innerHeight / 2, pmx = mx, rx = mx, ry = my, hasPointer = false;
  addEventListener('pointermove', function (e) {
    mx = e.clientX; my = e.clientY;
    if (e.pointerType === 'mouse' && finePointer && !hasPointer) { hasPointer = true; root.classList.add('cursor-on'); }
  }, { passive: true });
  addEventListener('keydown', function (e) { if (e.key === 'Tab') root.classList.remove('cursor-on'); });
  addEventListener('mousedown', function () { if (finePointer) root.classList.add('cursor-on'); });
  function cursorLabel(t) { if (t) { clabel.textContent = t; ring.classList.add('big'); } else ring.classList.remove('big'); }
  document.addEventListener('pointerover', function (e) { var el = e.target.closest && e.target.closest('[data-cursor]'); if (el) cursorLabel(el.dataset.cursor); });
  document.addEventListener('pointerout', function (e) { var el = e.target.closest && e.target.closest('[data-cursor]'); if (el && !el.contains(e.relatedTarget)) cursorLabel(null); });

  /* ---------- mobile menu ---------- */
  var menuBtn = $('#menuBtn'), menu = $('#menu');
  function setMenu(open) {
    if (!menu) return;
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.querySelector('.mb-l').textContent = open ? 'Close' : 'Menu';
    if (open) { menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('open'); }); root.classList.add('menu-open'); lenis && lenis.stop(); var f = $('.mi', menu); f && f.focus(); }
    else { menu.classList.remove('open'); root.classList.remove('menu-open'); lenis && lenis.start(); setTimeout(function () { if (!menu.classList.contains('open')) menu.hidden = true; }, 700); }
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
      if (e.key === 'Tab' && menu && menu.classList.contains('open')) {
        var f = [menuBtn].concat($$('a', menu)), i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
  }

  /* ---------- page transitions ---------- */
  var cw = $('#curtainWord');
  function internal(a) {
    if (!a || a.target === '_blank' || a.hasAttribute('download')) return false;
    var u; try { u = new URL(a.href, location.href); } catch (e) { return false; }
    if (u.origin !== location.origin || u.pathname.indexOf('/admin') === 0) return false;
    if (u.pathname === location.pathname && u.hash) return false;
    return u;
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a'); var u = internal(a); if (!u) return;
    e.preventDefault();
    if (reduce) { location.href = u.href; return; }
    var label = (a.querySelector('.ch-a,.next-a,.mi-t') || a).textContent.trim();
    if (cw) cw.textContent = label.length < 28 ? label : '';
    if (menu && menu.classList.contains('open')) setMenu(false);
    root.classList.add('leaving');
    setTimeout(function () { location.href = u.href; }, 620);
  });
  addEventListener('pageshow', function (e) { if (e.persisted) root.classList.remove('leaving', 'arriving'); });
  if (!reduce && sstore.get('mc_nav')) {
    root.classList.add('arriving');
    requestAnimationFrame(function () { requestAnimationFrame(function () { root.classList.add('arrived'); setTimeout(function () { root.classList.remove('arriving', 'arrived'); }, 900); }); });
  }
  sstore.set('mc_nav', '1');

  /* ---------- worn-type erosion (Redaction 35 / 70 / 100) ---------- */
  function erode(el, seq, ms) {
    if (!el || el._er || reduce) return; el._er = 1; var i = 0;
    (function step() { el.dataset.e = seq[i]; i++; if (i < seq.length) setTimeout(step, ms || 70); else { el.removeAttribute('data-e'); el._er = 0; } })();
  }
  var RESTORE = ['3', '3', '2', '3', '2', '1', '2', '1', '1'], FLICK = ['1', '2', '3', '2', '3', '1', '2', '1'];
  var erodeEls = $$('[data-erode]');
  erodeEls.forEach(function (el) { el.addEventListener('pointerenter', function () { erode(el, FLICK, 60); }); });
  if ('IntersectionObserver' in window) {
    var eio = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { erode(e.target, RESTORE, 85); eio.unobserve(e.target); } }); }, { threshold: 0.5 });
    erodeEls.forEach(function (el) { if (el.id !== 'caton') eio.observe(el); });
  }

  /* ---------- YouTube embeds: nothing loads until someone presses play ---------- */
  function ytSrc(id, list) {
    var p = 'autoplay=1&rel=0&modestbranding=1&playsinline=1';
    return list ? 'https://www.youtube-nocookie.com/embed/videoseries?list=' + encodeURIComponent(list) + '&' + p
                : 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?' + p;
  }
  function makeFrame(id, list, title) {
    var f = document.createElement('iframe');
    f.src = ytSrc(id, list); f.title = title || 'YouTube video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true; f.loading = 'lazy'; f.referrerPolicy = 'strict-origin-when-cross-origin';
    return f;
  }
  function playFacade(box) {
    if (!box || box.classList.contains('playing')) return;
    box.appendChild(makeFrame(box.dataset.yt, box.dataset.list, box.dataset.title));
    box.classList.add('playing');
    var f = box.querySelector('iframe'); f && setTimeout(function () { f.focus(); }, 300);
  }
  function stopFacade(box) { if (!box) return; var f = box.querySelector('iframe'); f && f.remove(); box.classList.remove('playing'); }
  $$('.yt .yt-play').forEach(function (b) { b.addEventListener('click', function () { playFacade(b.closest('.yt')); }); });

  /* ---------- sound (Karplus–Strong guitar) ---------- */
  var freqs = [73.42, 110, 146.83, 185, 220, 293.66];
  var actx = null, bufs = [], soundOn = false, master = null;
  function ks(f) { var sr = actx.sampleRate, len = Math.floor(sr * 3), N = Math.max(2, Math.round(sr / f)), b = actx.createBuffer(1, len, sr), d = b.getChannelData(0), r = new Float32Array(N), p = 0; for (var i = 0; i < N; i++) r[i] = (Math.random() * 2 - 1) * (i < N / 2 ? 1 : 0.6); for (var j = 0; j < len; j++) { var n = (p + 1) % N, v = r[p]; d[j] = v; r[p] = 0.4982 * (v + r[n]); p = n; } return b; }
  function initAudio() { if (actx) return; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return; actx = new AC(); master = actx.createGain(); master.gain.value = 0.5; var pk = actx.createBiquadFilter(); pk.type = 'peaking'; pk.frequency.value = 1400; pk.Q.value = 2.2; pk.gain.value = 7; var lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200; master.connect(pk); pk.connect(lp); lp.connect(actx.destination); bufs = freqs.map(ks); }
  function play(i, v) { if (!soundOn || !actx) return; var s = actx.createBufferSource(); s.buffer = bufs[i]; var g = actx.createGain(); g.gain.value = 0.25 + 0.55 * v; s.connect(g); g.connect(master); s.start(); }
  var snd = $('#snd'), sndt = $('#sndt');
  function setSound(on) { soundOn = on && !!actx; snd.classList.toggle('on', soundOn); snd.setAttribute('aria-pressed', soundOn); sndt.textContent = soundOn ? 'Sound on' : 'Sound off'; store.set('mc_sound', soundOn ? '1' : '0'); }
  if (snd) {
    snd.addEventListener('click', function () { try { initAudio(); if (actx && actx.state === 'suspended') actx.resume(); } catch (e) {} setSound(!soundOn); if (soundOn && S) S.forEach(function (s, i) { setTimeout(function () { pluck(s, 0.5, 0.5); }, i * 70); }); });
    // Browsers need a click before audio, so a saved "on" preference is re-armed on the first interaction.
    if (store.get('mc_sound') === '1') addEventListener('pointerdown', function arm() { removeEventListener('pointerdown', arm); try { initAudio(); actx && actx.resume(); } catch (e) {} setSound(true); }, { once: true });
  }

  /* ---------- HOME: hero ---------- */
  var hero = $('#top.hero'), hname = $('#hname'), letters = hname ? $$('.L', hname) : [];
  var cv = $('#strings'), cx = cv ? cv.getContext('2d') : null, W = 0, H = 0, S = null, heroVisible = !!hero;
  var caton = $('#caton'), hph = $('#hphoto'), lastEr = 0, litT = 0;
  function spanW(els) { var a = els[0].getBoundingClientRect(), b = els[els.length - 1].getBoundingClientRect(); return Math.max(1, b.right - a.left); }
  function fitHero() {
    if (!hname) return;
    letters.forEach(function (l) { l.style.fontVariationSettings = '"wdth" 85, "wght" 650'; });
    root.style.setProperty('--fit', '100px');
    var w = spanW($$('.mask', hname)), target = innerWidth * (innerWidth < 820 ? 0.8 : 0.84);
    root.style.setProperty('--fit', (100 * target / w) + 'px');
  }
  function fitFooter() {
    var fw = $('#ftword'), fi = fw && fw.querySelector('span'); if (!fi) return;
    var prev = fw.style.fontVariationSettings;
    fw.style.setProperty('--ffit', '100px'); fw.style.fontVariationSettings = '"wdth" 150, "wght" 900';
    var w2 = fi.getBoundingClientRect().width || 1, padL = parseFloat(getComputedStyle($('.ft')).paddingLeft) || 20;
    fw.style.setProperty('--ffit', (100 * (innerWidth - 2 * padL) / w2) + 'px'); fw.style.fontVariationSettings = prev;
  }
  function catonFlick() { var n = performance.now(); if (n - lastEr > 420) { lastEr = n; erode(caton, ['1', '2', '3', '1'], 55); } if (hph) { hph.classList.add('lit'); clearTimeout(litT); litT = setTimeout(function () { hph.classList.remove('lit'); }, 650); } }
  var ys = [0.33, 0.43, 0.53, 0.63, 0.73, 0.83], thick = [2.4, 2, 1.7, 1.35, 1.1, 0.85], names = ['D', 'A', 'D', 'F♯', 'A', 'D'];
  function sizeStrings() { if (!cv) return; var r = hero.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); }
  function pluck(s, px, v) { s.a = Math.max(s.a, (10 + 18 * v) * (1 - s.i * 0.06)); s.t = 0; s.px = Math.min(0.92, Math.max(0.08, px)); play(s.i, v); catonFlick(); }
  if (cv) {
    S = ys.map(function (y, i) { return { y: y, a: 0, t: 0, px: 0.5, i: i }; });
    var nut = $('#nut'); nut.innerHTML = names.map(function (n, i) { return '<span style="top:' + (ys[i] * 100) + '%">' + n + '</span>'; }).join(''); nut.style.top = '0'; nut.style.bottom = '0';
    sizeStrings();
    var lastPY = null;
    var local = function (e) { var r = hero.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
    hero.addEventListener('pointermove', function (e) { var p = local(e); if (lastPY !== null) S.forEach(function (s) { var sy = s.y * H; if ((lastPY - sy) * (p.y - sy) < 0) pluck(s, p.x / W, Math.min(1, Math.abs(p.y - lastPY) / 40 + 0.25)); }); lastPY = p.y; });
    hero.addEventListener('pointerleave', function () { lastPY = null; });
    hero.addEventListener('pointerdown', function (e) { var p = local(e), best = null, bd = 1e9; S.forEach(function (s) { var d = Math.abs(s.y * H - p.y); if (d < bd) { bd = d; best = s; } }); if (bd < 40) pluck(best, p.x / W, 0.8); lastPY = p.y; });
  }
  function drawStrings(dt) {
    if (!cx) return; cx.clearRect(0, 0, W, H);
    S.forEach(function (s) {
      s.t += dt; var amp = s.a * Math.exp(-s.t * 2.4); if (amp < 0.05) amp = 0;
      var y0 = s.y * H, om = 14 + s.i * 5; cx.beginPath();
      for (var k = 0; k <= 80; k++) { var u = k / 80, env = u < s.px ? u / s.px : (1 - u) / (1 - s.px), yy = y0 + amp * env * Math.sin(s.t * om); if (k === 0) cx.moveTo(0, yy); else cx.lineTo(u * W, yy); }
      cx.lineWidth = thick[s.i]; cx.strokeStyle = 'rgba(241,231,208,' + (0.42 + Math.min(0.5, amp / 30)) + ')'; cx.stroke();
      if (amp > 0) { cx.lineWidth = thick[s.i] + 5; cx.strokeStyle = 'rgba(240,162,58,' + Math.min(0.22, amp / 90) + ')'; cx.stroke(); }
    });
  }
  var LS = letters.map(function () { return { w: 85, g: 650 }; });
  function letterLoop(time) {
    if (reduce) return;
    letters.forEach(function (l, i) {
      var r = l.getBoundingClientRect(), t;
      if (!hasPointer) t = (Math.sin(time / 900 - i * 0.8) + 1) / 2 * 0.22;
      else { var d = Math.hypot(mx - (r.left + r.width / 2), (my - (r.top + r.height / 2)) * 1.3); t = Math.max(0, 1 - d / (Math.max(innerWidth, 700) * 0.3)); t = t * t * (3 - 2 * t); }
      LS[i].w += (85 + 65 * t - LS[i].w) * 0.12; LS[i].g += (650 + 250 * t - LS[i].g) * 0.12;
      l.style.fontVariationSettings = '"wdth" ' + LS[i].w.toFixed(1) + ', "wght" ' + LS[i].g.toFixed(0);
    });
  }
  if (hero && 'IntersectionObserver' in window) new IntersectionObserver(function (es) { heroVisible = es[0].isIntersecting; }).observe(hero);

  /* ---------- HOME: chapter index hover photo ---------- */
  var chFloat = $('#chFloat'), chFigs = chFloat ? $$('figure', chFloat) : [], chS = 0, chT = 0, chX = mx, chY = my, chR = 0;
  $$('.ch-row').forEach(function (r) {
    r.addEventListener('pointerenter', function () { chT = 1; chFigs.forEach(function (f) { f.classList.toggle('on', f.dataset.i === r.dataset.i); }); });
    r.addEventListener('pointerleave', function () { chT = 0; });
  });

  /* ---------- MUSIC: singles open an inline player ---------- */
  var fv = null, fvt = null, fvx = mx, fvy = my, fvs = 0, fvT = 0, fvr = 0;
  var sbRows = $$('button.sb-row');
  if (sbRows.length) {
    fv = document.createElement('div'); fv.className = 'fv'; fv.setAttribute('aria-hidden', 'true'); fv.innerHTML = '<div class="lbl"><span></span></div>'; document.body.appendChild(fv); fvt = fv.querySelector('span');
    sbRows.forEach(function (r) {
      r.addEventListener('pointerenter', function () { fvT = r.getAttribute('aria-expanded') === 'true' ? 0 : 1; fv.style.setProperty('--c', r.dataset.c); fvt.textContent = r.dataset.name; fvt.style.color = r.dataset.ink ? '#0b0908' : '#f1e7d0'; cursorLabel(r.getAttribute('aria-expanded') === 'true' ? 'Close' : 'Play'); });
      r.addEventListener('pointerleave', function () { fvT = 0; cursorLabel(null); });
      r.addEventListener('click', function () {
        var open = r.getAttribute('aria-expanded') !== 'true', panel = document.getElementById(r.getAttribute('aria-controls'));
        sbRows.forEach(function (o) { if (o !== r && o.getAttribute('aria-expanded') === 'true') { o.setAttribute('aria-expanded', 'false'); var p = document.getElementById(o.getAttribute('aria-controls')); stopFacade($('.yt', p)); p.hidden = true; } });
        r.setAttribute('aria-expanded', open); panel.hidden = !open; fvT = 0; cursorLabel(open ? 'Close' : 'Play');
        if (open) { playFacade($('.yt', panel)); if (hasG) ScrollTrigger.refresh(); }
        else stopFacade($('.yt', panel));
      });
    });
  }

  /* ---------- WATCH: projector with a real player ---------- */
  var scrEl = $('#screenEl'), reelBtns = $$('.reel-b'), screenVisible = false, tcStart = performance.now();
  var nc = $('#sNoise'), nx = nc ? nc.getContext('2d') : null, nimg = null, tcEl = $('#sTc');
  if (scrEl) {
    var sT = $('#sTitle'), sS = $('#sSub'), sM = $('#sMeta'), sI = $('#sIdx'), sOut = $('#sOut'), sFrame = $('#sFrame'), sPlay = $('#sPlay');
    var cue = function (b) {
      reelBtns.forEach(function (x) { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
      var i = reelBtns.indexOf(b) + 1;
      scrEl.dataset.yt = b.dataset.yt; sT.textContent = b.dataset.t; sS.textContent = b.dataset.s; sM.textContent = b.dataset.m;
      sI.textContent = 'Reel ' + String(i).padStart(2, '0') + ' / ' + String(reelBtns.length).padStart(2, '0');
      sPlay.setAttribute('aria-label', 'Play ' + b.dataset.t);
      scrEl.style.setProperty('--tc', b.dataset.c); scrEl.style.setProperty('--tc2', b.dataset.c2);
      sOut.href = 'https://www.youtube.com/watch?v=' + b.dataset.yt; erode(sT, RESTORE, 55);
    };
    var playScreen = function () { sFrame.innerHTML = ''; sFrame.appendChild(makeFrame(scrEl.dataset.yt, '', sT.textContent)); scrEl.classList.add('playing'); };
    sPlay.addEventListener('click', playScreen);
    reelBtns.forEach(function (b) {
      b.addEventListener('pointerenter', function () { if (!scrEl.classList.contains('playing')) cue(b); });
      b.addEventListener('click', function () { cue(b); playScreen(); if (innerWidth < 900) scrollToEl(scrEl); });
    });
    if (nc) { nc.width = 160; nc.height = 100; nimg = nx.createImageData(160, 100); }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { screenVisible = es[0].isIntersecting; }).observe(scrEl);
  }
  function screenTick(now) {
    if (!screenVisible || !nimg || scrEl.classList.contains('playing')) return;
    var d = nimg.data; for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } nx.putImageData(nimg, 0, 0);
    var f = Math.floor((now - tcStart) / 1000 * 24); tcEl.textContent = '00:' + String(Math.floor(f / 1440) % 60).padStart(2, '0') + ':' + String(Math.floor(f / 24) % 60).padStart(2, '0') + ':' + String(f % 24).padStart(2, '0');
  }

  /* ---------- PORTRAITS: lightbox ---------- */
  var lb = $('#lb');
  if (lb) {
    var lbF = $$('.lb-f', lb), lbI = 0, lbOpener = null;
    var show = function (i) { lbI = (i + lbF.length) % lbF.length; lbF.forEach(function (f, k) { f.hidden = k !== lbI; }); };
    var openLb = function (i, opener) { lbOpener = opener; show(i); if (lb.showModal) lb.showModal(); else lb.setAttribute('open', ''); lenis && lenis.stop(); $('#lbClose').focus(); };
    var closeLb = function () { if (lb.close) lb.close(); else lb.removeAttribute('open'); };
    lb.addEventListener('close', function () { lenis && lenis.start(); lbOpener && lbOpener.focus(); });
    $$('.g-b').forEach(function (b) { b.addEventListener('click', function () { openLb(+b.dataset.i, b); }); });
    $('#lbClose').addEventListener('click', closeLb);
    $('#lbPrev').addEventListener('click', function () { show(lbI - 1); });
    $('#lbNext').addEventListener('click', function () { show(lbI + 1); });
    lb.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') show(lbI - 1); if (e.key === 'ArrowRight') show(lbI + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.id === 'lbStage') closeLb(); });
    var tx = null; lb.addEventListener('touchstart', function (e) { tx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) { if (tx === null) return; var dx = e.changedTouches[0].clientX - tx; if (Math.abs(dx) > 50) show(lbI + (dx < 0 ? 1 : -1)); tx = null; });
  }


  /* ---------- PRESS: filter by type ---------- */
  var chips = $$('.pr-chip'), prItems = $$('#prList .pr-item'), prYears = $$('#prList .pr-year'), prEmpty = $('#prEmpty');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var k = c.dataset.k;
      chips.forEach(function (x) { x.setAttribute('aria-pressed', x === c); });
      var shown = 0;
      prItems.forEach(function (li) { var on = k === 'all' || li.dataset.k === k; li.hidden = !on; if (on) shown++; });
      prYears.forEach(function (y) { var n = y.nextElementSibling, any = false; while (n && !n.classList.contains('pr-year')) { if (!n.hidden) any = true; n = n.nextElementSibling; } y.hidden = !any; });
      if (prEmpty) prEmpty.hidden = shown > 0;
      if (hasG) ScrollTrigger.refresh();
    });
  });

  /* ---------- corrections form (Netlify Forms, no page reload) ---------- */
  var fix = $('#fixForm');
  if (fix) fix.addEventListener('submit', function (e) {
    e.preventDefault(); var done = $('.fix-done', fix), btn = $('.fix-b', fix); btn.disabled = true; done.textContent = 'Sending…';
    fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(new FormData(fix)).toString() })
      .then(function (r) { if (!r.ok) throw 0; fix.reset(); done.textContent = 'Thank you. We’ll check it and update the page.'; })
      .catch(function () { done.textContent = 'That didn’t go through. Please try again in a moment.'; })
      .then(function () { btn.disabled = false; });
  });

  /* ---------- one animation loop ---------- */
  var last = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (heroVisible && hero) { if (cv) drawStrings(dt); letterLoop(now); }
    screenTick(now);
    if (hasPointer) {
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      if (fv) { fvs += (fvT - fvs) * 0.12; fvx += (mx - fvx) * 0.1; fvy += (my - fvy) * 0.1; fvr += ((mx - pmx) * 0.6 - fvr) * 0.1; fv.style.transform = 'translate(' + fvx + 'px,' + fvy + 'px) scale(' + fvs.toFixed(3) + ') rotate(' + fvr.toFixed(1) + 'deg)'; }
      if (chFloat) { chS += (chT - chS) * 0.12; chX += (mx - chX) * 0.12; chY += (my - chY) * 0.12; chR += ((mx - pmx) * 0.3 - chR) * 0.1; chFloat.style.transform = 'translate(' + chX + 'px,' + chY + 'px) scale(' + chS.toFixed(3) + ') rotate(' + chR.toFixed(1) + 'deg)'; }
    }
    pmx = mx; requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  /* ---------- scroll choreography ---------- */
  function choreo() {
    if (!hasG) return;
    var ov = $('#ovtext');
    if (ov && !reduce) {
      (function split(node) {
        [].slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) { var frag = document.createDocumentFragment(); n.textContent.split(/(\s+)/).forEach(function (w) { if (!w) return; if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(w)); else { var s = document.createElement('span'); s.className = 'w'; s.textContent = w; frag.appendChild(s); } }); node.replaceChild(frag, n); }
          else if (n.nodeType === 1) { if (n.tagName === 'STRONG' || n.classList.contains('pic')) n.classList.add('w'); else split(n); }
        });
      })(ov);
      gsap.to($$('.w', ov), { opacity: 1, stagger: 0.1, ease: 'none', scrollTrigger: { trigger: '#overture', start: 'top top', end: '+=120%', pin: true, scrub: 0.6 } });
    }
    var track = $('#track'), bar = $('#hsbar');
    if (track && !reduce) {
      var dist = function () { return Math.max(0, track.scrollWidth - innerWidth); };
      gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: '#record', start: 'top top', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.8, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: function (s) { bar.style.transform = 'scaleX(' + s.progress + ')'; } } });
    }
    if ($('.sm-title .rise') && !reduce) gsap.from($$('.sm-title .rise'), { yPercent: 105, duration: 1.3, ease: 'expo.out', stagger: 0.12, delay: 0.2 });
    if ($('#dusk') && !reduce) {
      gsap.timeline({ scrollTrigger: { trigger: '#dusk', start: 'top top', end: '+=105%', pin: true, scrub: 0.8 } })
        .to('#sun', { yPercent: 118, ease: 'none', duration: 1 }, 0)
        .to('#reflect', { scaleY: 0.2, opacity: 0, transformOrigin: 'top', ease: 'none', duration: 1 }, 0)
        .to('#skydark', { opacity: 0.72, ease: 'none', duration: 1 }, 0)
        .to('#d1', { opacity: 0.12, y: -20, duration: 0.3 }, 0.45)
        .to('#d2', { opacity: 1, duration: 0.3 }, 0.62)
        .from('#d2 h3', { y: 60, duration: 0.35 }, 0.62);
    }
    if (!reduce) {
      $$('.rv').forEach(function (el) { gsap.from(el, { y: 70, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }); });
      $$('.ost-row,.sb-row,.ch-row,.reel-b,.pr-row').forEach(function (el) { var t = el.querySelector('.t,.ch-a,.tt,.pr-t'); if (t) gsap.from(t, { yPercent: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 94%' } }); });
      if ($('#sbimg')) gsap.to('#sbimg', { yPercent: 10, ease: 'none', scrollTrigger: { trigger: '.sb-photo', start: 'top bottom', end: 'bottom top', scrub: true } });
      $$('.g-b img').forEach(function (im, i) { gsap.from(im.closest('li'), { y: 60, opacity: 0, duration: 1.1, delay: (i % 4) * 0.06, ease: 'expo.out', scrollTrigger: { trigger: im, start: 'top 95%' } }); });
    }
    var strip = $('#strip');
    if (strip) {
      var develop = function () { var mid = innerWidth * 0.62; $$('.fr', strip).forEach(function (f) { if (f.classList.contains('dev')) return; var r = f.getBoundingClientRect(); if (r.left < mid && r.right > 0) f.classList.add('dev'); }); };
      if (!reduce) gsap.fromTo(strip, { x: function () { return innerWidth * 0.15; } }, { x: function () { return -(strip.scrollWidth / 2) + innerWidth * 0.2; }, ease: 'none', scrollTrigger: { trigger: '#contact', start: 'top bottom', end: 'center top', scrub: 0.8, invalidateOnRefresh: true, onUpdate: develop } });
      else $$('.fr', strip).forEach(function (f) { f.classList.add('dev'); });
    }
    var hn = $('#honN');
    if (hn && !reduce) { var o = { v: 0 }, tot = +hn.dataset.count; gsap.to(o, { v: tot, duration: 1.6, ease: 'power3.out', delay: 0.3, onUpdate: function () { hn.textContent = String(Math.round(o.v)).padStart(2, '0'); } }); }
    var mqs = $$('.mq-in').map(function (el) { el.innerHTML += el.innerHTML; return { el: el, x: 0, dir: +el.dataset.dir }; });
    if (mqs.length && !reduce) {
      var vel = 0;
      mqs.forEach(function (m) { if (m.dir > 0) m.x = -m.el.scrollWidth / 2; });
      gsap.ticker.add(function () { var v = lenis ? lenis.velocity || 0 : 0; vel += (v - vel) * 0.1; mqs.forEach(function (m) { var half = m.el.scrollWidth / 2; m.x += m.dir * (0.6 + Math.abs(vel) * 0.35); if (m.x < -half) m.x += half; if (m.x > 0) m.x -= half; m.el.style.transform = 'translateX(' + m.x + 'px) skewX(' + (-vel * 0.25 * m.dir).toFixed(2) + 'deg)'; }); });
    }
    if ($('#ftword') && !reduce) gsap.fromTo('#ftword', { fontVariationSettings: '"wdth" 68, "wght" 900' }, { fontVariationSettings: '"wdth" 150, "wght" 900', ease: 'none', scrollTrigger: { trigger: '.ft-word', start: 'top bottom', end: 'bottom 85%', scrub: 0.6 } });
  }

  /* ---------- intro: full loader on the first visit to the homepage only ---------- */
  function heroIn() {
    if (!hasG || !hero || reduce) return;
    gsap.from(letters, { yPercent: 110, duration: 1.4, ease: 'expo.out', stagger: 0.07 });
    gsap.from('.h-cat .mask>span', { yPercent: 110, duration: 1.5, ease: 'expo.out', delay: 0.35 });
    if (hph) gsap.from('.h-photo img', { yPercent: 100, duration: 1.6, ease: 'expo.out', delay: 0.5 });
    setTimeout(function () { erode(caton, RESTORE.concat(['2', '1']), 90); }, 350);
    gsap.from('.h-meta > *', { opacity: 0, y: 16, duration: 1, stagger: 0.1, delay: 0.6 });
    if (S) S.forEach(function (s, i) { setTimeout(function () { s.a = 14; s.t = 0; s.px = 0.5; }, 700 + i * 90); });
  }
  function intro() {
    var loader = $('#loader');
    var finish = function () { root.classList.remove('is-loading', 'first-visit'); if (loader) loader.classList.add('done'); lenis && lenis.start(); hasG && ScrollTrigger.refresh(); };
    if (!root.classList.contains('first-visit') || !hasG || reduce) { finish(); heroIn(); return; }
    sstore.set('mc_seen', '1');
    root.classList.add('is-loading'); lenis && lenis.stop();
    var cnt = $('#lcount'), notes = $$('#lnotes span'), line = $('#lline'), o = { v: 0 };
    var tl = gsap.timeline({ paused: true });
    tl.to(o, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: function () { var v = Math.round(o.v); cnt.textContent = String(v).padStart(3, '0'); line.style.transform = 'scaleX(' + v / 100 + ')'; notes.forEach(function (n, i) { n.classList.toggle('on', v >= (i + 1) * 16); }); } })
      .to('#loader .inner', { opacity: 0, duration: 0.3 }, '+=.1')
      .to('#loader .pane.t', { yPercent: -100, duration: 1, ease: 'expo.inOut' }, '<.05')
      .to('#loader .pane.b', { yPercent: 100, duration: 1, ease: 'expo.inOut' }, '<')
      .add(heroIn, '<.3').add(finish);
    $('#lskip').addEventListener('click', function () { tl.progress(1); });
    ((document.fonts && document.fonts.ready) || Promise.resolve()).then(function () { fitHero(); fitFooter(); tl.play(); });
  }

  fitHero(); fitFooter();
  choreo();
  intro();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { fitHero(); fitFooter(); hasG && ScrollTrigger.refresh(); });
  var rT = 0; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(function () { sizeStrings(); fitHero(); fitFooter(); hasG && ScrollTrigger.refresh(); }, 150); });
})();
