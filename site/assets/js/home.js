/* SODIKART — animations de la page d'accueil */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof gsap !== 'undefined';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Hero : intro ---------- */
  const heroIntro = () => {
    const lines = $$('#hero-title .line > span');
    if (!hasGSAP || reduced) { lines.forEach(l => l.style.transform = 'none'); $('#hero-sub').style.opacity = 1; $('#hero-ctas').style.opacity = 1; return; }
    const tl = gsap.timeline({ delay: .15 });
    tl.to(lines, { y: 0, duration: 1.3, ease: 'power4.out', stagger: .11 })
      .to('#hero-sub', { opacity: 1, y: 0, duration: .9, ease: 'power3.out' }, '-=.7')
      .fromTo('#hero-ctas', { y: 20 }, { opacity: 1, y: 0, duration: .9, ease: 'power3.out' }, '-=.6')
      .from('.hero__stats .stat', { y: 30, opacity: 0, duration: .8, stagger: .08, ease: 'power3.out' }, '-=.5')
      .from('.hero__eyebrow > *', { y: -12, opacity: 0, duration: .7, stagger: .1 }, 0.2);
    // Parallaxe douce du fond
    gsap.to('.hero__bg img', { yPercent: 14, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__content', { yPercent: -10, opacity: .2, ease: 'none', scrollTrigger: { trigger: '.hero', start: '40% top', end: 'bottom top', scrub: true } });
  };

  /* ---------- Speedlines (SVG) ---------- */
  const speedlines = () => {
    const svg = $('#speedlines'); if (!svg || reduced) return;
    const N = 18; const lines = [];
    for (let i = 0; i < N; i++) {
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const y = 80 + Math.random() * 740; const len = 120 + Math.random() * 380;
      l.setAttribute('x1', -len); l.setAttribute('x2', 0); l.setAttribute('y1', y); l.setAttribute('y2', y);
      l.style.opacity = (.15 + Math.random() * .5).toFixed(2);
      svg.appendChild(l); lines.push({ el: l, y, len, speed: 3 + Math.random() * 5, delay: Math.random() * 6 });
    }
    lines.forEach(o => {
      const run = () => {
        if (!hasGSAP) return;
        gsap.fromTo(o.el, { x: 0 }, { x: 1600 + o.len, duration: o.speed, ease: 'power1.in', delay: o.delay, onComplete: () => { o.delay = Math.random() * 5; o.el.setAttribute('y1', 80 + Math.random() * 740); o.el.setAttribute('y2', o.el.getAttribute('y1')); run(); } });
      };
      run();
    });
  };

  /* ---------- Chaîne de valeur ---------- */
  const chain = () => {
    const kart = $('#chain-kart'); const root = $('#chain'); if (!kart || !root) return;
    const sectors = $$('.chain__sector'); const labels = $$('.chain__label'); const panels = $$('.chain__panel'); const sl = $('#chain-sector-label');
    const names = ['S1 · CONSTRUIRE', 'S2 · DISTRIBUER', 'S3 · ACCOMPAGNER', 'S4 · ANIMER'];
    // bornes des secteurs en fraction du tour (longueurs approximatives du tracé)
    const bounds = [0, .33, .58, .78, 1];
    let current = -1; let hovered = null;
    const setActive = (i) => {
      if (i === current) return; current = i;
      sectors.forEach((s, k) => s.classList.toggle('is-active', k === i));
      labels.forEach((l, k) => l.classList.toggle('is-active', k === i));
      panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
      if (sl) sl.textContent = names[i];
    };
    const anim = kart.getAnimations ? kart.getAnimations()[0] : null;
    const tick = () => {
      if (hovered === null && anim) {
        const t = ((anim.currentTime || 0) % 16000) / 16000;
        let i = 0; for (let k = 0; k < 4; k++) if (t >= bounds[k] && t < bounds[k + 1]) i = k;
        setActive(i);
      }
      requestAnimationFrame(tick);
    };
    if (anim && !reduced) requestAnimationFrame(tick); else setActive(0);
    panels.forEach((p, i) => {
      p.addEventListener('mouseenter', () => { hovered = i; root.classList.add('chain--paused'); if (anim) anim.pause(); setActive(i); });
      p.addEventListener('mouseleave', () => { hovered = null; root.classList.remove('chain--paused'); if (anim) anim.play(); });
      p.addEventListener('click', () => setActive(i));
    });
    labels.forEach((l, i) => { l.addEventListener('mouseenter', () => { hovered = i; if (anim) anim.pause(); setActive(i); }); l.addEventListener('mouseleave', () => { hovered = null; if (anim) anim.play(); }); });
  };

  /* ---------- Technologies : hotspots + tilt 3D ---------- */
  const tech = () => {
    const stage = $('#tech'); if (!stage) return;
    const hs = $$('.hotspot'); const cards = $$('.tech__card'); const navs = $$('#tech-nav button'); const kart = $('#tech-kart');
    let idx = 0; let auto = true; let timer;
    const go = (i) => {
      idx = i;
      hs.forEach((h, k) => h.classList.toggle('is-active', k === i));
      cards.forEach((c, k) => c.classList.toggle('is-active', k === i));
      navs.forEach((n, k) => n.classList.toggle('is-active', k === i));
      const h = hs[i]; if (h && kart) {
        const x = parseFloat(h.style.left), y = parseFloat(h.style.top);
        kart.style.setProperty('--ry', (((x - 50) / 50) * 10).toFixed(1) + 'deg');
        kart.style.setProperty('--rx', (((50 - y) / 50) * 6).toFixed(1) + 'deg');
      }
    };
    const stopAuto = () => { auto = false; clearInterval(timer); };
    hs.forEach((h, i) => { h.addEventListener('mouseenter', () => { stopAuto(); go(i); }); h.addEventListener('click', () => { stopAuto(); go(i); }); h.addEventListener('focus', () => { stopAuto(); go(i); }); });
    navs.forEach((n, i) => n.addEventListener('click', () => { stopAuto(); go(i); }));
    if (!reduced) timer = setInterval(() => { if (auto) go((idx + 1) % hs.length); }, 3600);
    go(0);
  };

  /* ---------- Électrique : jauge + SODISCAN ---------- */
  const elec = () => {
    const g = $('#gauge-val'); const rows = $$('#sodiscan .sodiscan__bar i');
    const run = () => {
      if (g) { if (hasGSAP && !reduced) gsap.to(g, { strokeDashoffset: .1, duration: 2.2, ease: 'power3.out' }); else g.style.strokeDashoffset = .1; }
      rows.forEach((r, i) => setTimeout(() => r.style.width = r.dataset.w + '%', 200 + i * 120));
    };
    if (hasGSAP) ScrollTrigger.create({ trigger: '#electrique', start: 'top 70%', once: true, onEnter: run }); else run();
    // fluctuation du kart en charge
    const ch = $('#sodiscan .is-charging i'); if (ch && !reduced) setInterval(() => { const w = Math.min(100, parseFloat(ch.dataset.w) + 1); ch.dataset.w = w; ch.style.width = w + '%'; }, 1800);
  };

  /* ---------- Gamme : défilement horizontal épinglé ---------- */
  const range = () => {
    const pin = $('#range-pin'), track = $('#range-track'), prog = $('#range-progress'); if (!pin || !track || !hasGSAP) return;
    let st;
    const build = () => {
      if (st) { st.kill(); gsap.set(track, { x: 0 }); }
      if (window.innerWidth < 900 || reduced) return;
      const dist = () => track.scrollWidth - window.innerWidth;
      st = gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: (s) => { if (prog) prog.style.width = (s.progress * 100) + '%'; } } }).scrollTrigger;
    };
    build();
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { build(); ScrollTrigger.refresh(); }, 250); });
    $$('.filters .filter').forEach(b => b.addEventListener('click', () => setTimeout(() => { build(); ScrollTrigger.refresh(); }, 60)));
  };

  /* ---------- SWS : ticker vivant ---------- */
  const ticker = () => {
    const times = $$('#ticker .ticker__time'); if (!times.length || reduced) return;
    setInterval(() => {
      times.forEach(t => { const base = parseFloat(t.dataset.t); const v = base + (Math.random() - .5) * .12; t.textContent = v.toFixed(3); t.classList.remove('is-fast'); });
      const f = times[Math.floor(Math.random() * times.length)]; f.classList.add('is-fast');
    }, 2400);
  };

  /* ---------- Étapes : progression ---------- */
  const steps = () => {
    const wrap = $('#steps'); const bar = $('#steps-progress'); const items = $$('#steps .step'); if (!wrap || !hasGSAP) return;
    ScrollTrigger.create({ trigger: wrap, start: 'top 75%', once: true, onEnter: () => {
      if (bar) gsap.to(bar, { width: '100%', duration: 2.4, ease: 'power2.inOut' });
      items.forEach((s, i) => setTimeout(() => s.classList.add('is-on'), 200 + i * 480));
    } });
  };

  /* ---------- Vidéo : lecture forcée (autoplay silencieux) ---------- */
  const video = () => {
    document.querySelectorAll('video[autoplay]').forEach(v => {
      v.muted = true; v.defaultMuted = true; v.playsInline = true;
      const tryPlay = () => { const p = v.play(); if (p && p.catch) p.catch(() => {}); };
      tryPlay();
      if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(x => x.isIntersecting ? tryPlay() : v.pause()), { threshold: .1 }).observe(v);
      document.addEventListener('click', tryPlay, { once: true });
    });
  };

  /* ---------- Marquee : duplication ---------- */
  const marquee = () => { const m = $('#marquee'); if (m) m.innerHTML += m.innerHTML; };

  const init = () => { marquee(); video(); heroIntro(); speedlines(); chain(); tech(); elec(); range(); ticker(); steps(); };
  if (document.documentElement.classList.contains('site-ready')) init();
  else document.addEventListener('site:ready', init, { once: true });
})();
