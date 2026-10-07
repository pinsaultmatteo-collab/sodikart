/* SODIKART — comportements partagés (preloader, nav, smooth scroll, reveals, compteurs, parallax) */
(function () {
  'use strict';
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = typeof gsap !== 'undefined';
  if (hasGSAP && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* ---------- Preloader : feux de départ ---------- */
  const loader = document.querySelector('.loader');
  const startSite = () => {
    document.documentElement.classList.add('site-ready');
    if (loader) loader.classList.add('is-done');
    document.dispatchEvent(new CustomEvent('site:ready'));
    setTimeout(() => loader && loader.remove(), 1200);
  };
  if (loader) {
    const lights = loader.querySelectorAll('.loader__light');
    const label = loader.querySelector('.loader__label');
    const seen = sessionStorage.getItem('sodi-loaded');
    if (seen || prefersReduced) {
      requestAnimationFrame(() => setTimeout(startSite, 150));
    } else {
      sessionStorage.setItem('sodi-loaded', '1');
      lights.forEach((l, i) => setTimeout(() => { l.classList.add('on'); if (label) label.textContent = 'Grille de départ · ' + (i + 1) + ' / 5'; }, 260 + i * 240));
      setTimeout(() => { lights.forEach(l => { l.classList.remove('on'); l.classList.add('go'); }); if (label) label.textContent = 'GO'; }, 260 + 5 * 240 + 420);
      setTimeout(startSite, 260 + 5 * 240 + 920);
    }
  } else {
    requestAnimationFrame(startSite);
  }

  /* ---------- Smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (typeof Lenis !== 'undefined' && !prefersReduced) {
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1, smoothWheel: true });
    if (hasGSAP) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => { lenis.raf(t); requestAnimationFrame(raf); };
      requestAnimationFrame(raf);
    }
    window.__lenis = lenis;
  }
  // Ancre présente dans l'URL : y aller une fois le site prêt (Lenis repart de 0 au chargement)
  document.addEventListener('site:ready', () => {
    if (location.hash.length > 1) { const t = document.querySelector(location.hash); if (t) setTimeout(() => lenis ? lenis.scrollTo(t, { offset: -70, duration: 1.2 }) : t.scrollIntoView(), 350); }
  }, { once: true });
  // Ancres internes
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -70, duration: 1.4 });
      else target.scrollIntoView({ behavior: 'smooth' });
    });
  });

  /* ---------- Navigation ---------- */
  const nav = document.querySelector('.nav');
  const mobile = document.querySelector('.mobile-menu');
  const burger = document.querySelector('.burger');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    if (!nav) return;
    nav.classList.toggle('nav--scrolled', y > 40);
    if (y > 500 && y > lastY + 6 && !nav.classList.contains('nav--open')) nav.classList.add('nav--hidden');
    else if (y < lastY - 6 || y < 200) nav.classList.remove('nav--hidden');
    lastY = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (burger && nav) {
    burger.addEventListener('click', () => {
      const open = nav.classList.toggle('nav--open');
      burger.setAttribute('aria-expanded', open);
      if (mobile) mobile.classList.toggle('is-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
      if (lenis) open ? lenis.stop() : lenis.start();
    });
  }
  // Mega menu : accessible au clavier / tactile
  document.querySelectorAll('.has-mega > .nav__link').forEach(link => {
    link.addEventListener('click', (e) => {
      if (window.matchMedia('(hover: none)').matches) {
        e.preventDefault();
        const li = link.parentElement;
        const open = li.classList.toggle('is-open');
        document.querySelectorAll('.has-mega').forEach(o => { if (o !== li) o.classList.remove('is-open'); });
      }
    });
  });
  // Lien actif
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__link[href]').forEach(a => { if (a.getAttribute('href') === path) a.classList.add('is-active'); });

  /* ---------- Reveal au scroll ---------- */
  const revealInit = () => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!hasGSAP || prefersReduced) { els.forEach(el => el.classList.add('is-in')); return; }
    els.forEach(el => {
      const type = el.dataset.reveal || 'up';
      const delay = parseFloat(el.dataset.delay || 0);
      const from = { opacity: 0, duration: 1.1, ease: 'power3.out', delay };
      if (type === 'up') Object.assign(from, { y: 48 });
      if (type === 'left') Object.assign(from, { x: -60 });
      if (type === 'right') Object.assign(from, { x: 60 });
      if (type === 'scale') Object.assign(from, { scale: .92 });
      if (type === 'clip') Object.assign(from, { clipPath: 'inset(0 0 100% 0)', y: 0, opacity: 1 });
      gsap.from(el, { ...from, scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
    });
    // Stagger de groupes
    document.querySelectorAll('[data-stagger]').forEach(group => {
      const items = group.children;
      gsap.from(items, { opacity: 0, y: 40, duration: .9, ease: 'power3.out', stagger: parseFloat(group.dataset.stagger) || .1, scrollTrigger: { trigger: group, start: 'top 85%', once: true } });
    });
    // Titres : révélation ligne par ligne
    document.querySelectorAll('[data-lines]').forEach(h => {
      const lines = h.querySelectorAll('.line > span');
      if (!lines.length) return;
      gsap.to(lines, { y: 0, duration: 1.1, ease: 'power4.out', stagger: .09, scrollTrigger: { trigger: h, start: 'top 85%', once: true } });
    });
  };

  /* ---------- Compteurs ---------- */
  const fmt = (n, dec) => {
    const s = n.toFixed(dec);
    const [int, d] = s.split('.');
    const withSpaces = int.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return d ? withSpaces + ',' + d : withSpaces;
  };
  const countInit = () => {
    document.querySelectorAll('[data-count]').forEach(el => {
      const end = parseFloat(el.dataset.count);
      const dec = parseInt(el.dataset.dec || 0, 10);
      const prefix = el.dataset.prefix || '';
      const suffix = el.dataset.suffix || '';
      const run = () => {
        const obj = { v: 0 };
        if (!hasGSAP || prefersReduced) { el.textContent = prefix + fmt(end, dec) + suffix; return; }
        gsap.to(obj, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.textContent = prefix + fmt(obj.v, dec) + suffix; } });
      };
      if (hasGSAP) ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: run });
      else run();
    });
  };

  /* ---------- Parallax léger ---------- */
  const parallaxInit = () => {
    if (!hasGSAP || prefersReduced) return;
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const amt = parseFloat(el.dataset.parallax) || 12;
      gsap.fromTo(el, { yPercent: -amt }, { yPercent: amt, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
  };

  /* ---------- Onglets / filtres génériques ---------- */
  document.querySelectorAll('[data-filters]').forEach(bar => {
    const targetSel = bar.dataset.filters;
    const items = document.querySelectorAll(targetSel);
    bar.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        bar.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const f = btn.dataset.filter;
        items.forEach(it => {
          const tags = (it.dataset.tags || '').split(' ');
          const show = f === 'all' || tags.includes(f);
          it.classList.toggle('is-hidden', !show);
        });
        if (hasGSAP) {
          gsap.fromTo(targetSel + ':not(.is-hidden)', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, stagger: .05, ease: 'power2.out', overwrite: true });
          ScrollTrigger.refresh();
        }
      });
    });
  });

  /* ---------- Accordéons ---------- */
  document.querySelectorAll('[data-accordion]').forEach(acc => {
    acc.querySelectorAll('.acc__head').forEach(head => {
      head.addEventListener('click', () => {
        const item = head.parentElement;
        const open = item.classList.contains('is-open');
        acc.querySelectorAll('.acc__item').forEach(i => i.classList.remove('is-open'));
        if (!open) item.classList.add('is-open');
        setTimeout(() => hasGSAP && ScrollTrigger.refresh(), 450);
      });
    });
  });

  /* ---------- Année ---------- */
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const init = () => { revealInit(); countInit(); parallaxInit(); if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 600); };
  if (document.documentElement.classList.contains('site-ready')) init();
  else document.addEventListener('site:ready', init, { once: true });
  window.addEventListener('load', () => hasGSAP && ScrollTrigger.refresh());
})();
