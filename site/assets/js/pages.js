/* SODIKART — interactions des pages intérieures */
(function () {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));
  const hasGSAP = typeof gsap !== 'undefined';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fmt = (n) => Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

  /* ---------- Sous-navigation : lien actif ---------- */
  const subnav = () => {
    const bar = $('[data-subnav]'); if (!bar) return;
    const links = $$('a', bar); const map = new Map();
    links.forEach(a => { const t = document.querySelector(a.getAttribute('href')); if (t) map.set(t, a); });
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { links.forEach(l => l.classList.remove('is-active')); map.get(e.target).classList.add('is-active'); } }), { rootMargin: '-40% 0px -55% 0px' });
    map.forEach((a, t) => io.observe(t));
  };

  /* ---------- Galerie de fiche ---------- */
  $$('[data-fiche]').forEach(g => {
    const main = g.parentElement.querySelector('.fiche__main img');
    $$('button', g).forEach(b => b.addEventListener('click', () => {
      $$('button', g).forEach(x => x.classList.remove('is-active')); b.classList.add('is-active');
      main.style.opacity = 0; setTimeout(() => { main.src = b.dataset.src; main.classList.toggle('cutout', !!b.dataset.cut); main.style.opacity = 1; }, 220);
    }));
  });

  /* ---------- Comparateur ---------- */
  const KARTS = {
    'SR6': { img: 'sr6', seg: 'Location · nouvelle génération', moteur: 'Honda GX200 · 270 · 390', pilotes: '1,40 m à 2,10 m', poids: '157 à 172 kg', usage: 'Indoor & outdoor', energie: 'Thermique 4 temps', signature: 'ERGOMAX®, EASY DRIVE®, HEAD SYSTEM®', autonomie: '—' },
    'RT10': { img: 'rt10', seg: 'Location · prestige', moteur: 'Honda GX200 · 270 · 390', pilotes: 'Adultes', poids: 'Selon moteur', usage: 'Indoor & outdoor', energie: 'Thermique 4 temps', signature: 'Proslide®, volant et nez type F1, pédalier 2D', autonomie: '—' },
    'Sport': { img: 'sport', seg: 'Location · performance', moteur: 'Honda GX270/390, SwissAuto 250, Rotax 125', pilotes: 'Pilotes aguerris', poids: 'Selon moteur', usage: 'Outdoor · performance', energie: 'Thermique · 5 motorisations', signature: 'Proflex, frein hydraulique 4 pistons', autonomie: '—' },
    'SR5': { img: 'sr5', seg: 'Location · sport', moteur: 'Honda GX · versions GPL', pilotes: 'Adultes', poids: 'Selon moteur', usage: 'Indoor & outdoor', energie: 'Thermique · GPL', signature: 'EMS, plancher intégral, pédalier 3 positions', autonomie: '—' },
    'SR4': { img: 'sr4', seg: 'Location · sport', moteur: 'Honda GX · versions GPL', pilotes: 'Adultes', poids: 'Selon moteur', usage: 'Indoor & outdoor', energie: 'Thermique · GPL', signature: 'EMS, pédalier 3 positions', autonomie: '—' },
    'RSX2': { img: 'rsx2', seg: 'Location · électrique', moteur: 'Synchrone lithium ENGEC', pilotes: 'Adultes', poids: '186 kg', usage: 'Indoor · pistes électriques', energie: '100 % électrique', signature: 'Charge & verrouillage, SODISCAN, APS', autonomie: '≈ 1 h' },
    'LR6': { img: 'lr6', seg: 'Location · junior', moteur: 'Honda GX160 · 200', pilotes: '7 à 15 ans', poids: 'Selon moteur', usage: 'Indoor & outdoor', energie: 'Thermique 4 temps', signature: 'Proline® 360, Head System®, option Game of Karts', autonomie: '—' },
    'LRX2': { img: 'lrx2', seg: 'Location · junior électrique', moteur: 'ENGEC brushless lithium', pilotes: '7 à 15 ans', poids: '—', usage: 'Indoor', energie: '100 % électrique', signature: 'Proline® 360, Head System®', autonomie: 'E-Finals SWS' },
    'KidRacer': { img: 'kidracer', seg: 'Location · baby électrique', moteur: 'ENGEC 600 W · 24 V', pilotes: '3 à 6 ans', poids: '—', usage: 'Indoor · sans personnel dédié', energie: '100 % électrique', signature: 'Driving School, bouton parent, monnayeur', autonomie: 'Une journée' },
    '2Drive': { img: '2drive', seg: 'Location · biplace', moteur: 'Honda GX390', pilotes: '2 places · PMR', poids: '—', usage: 'Familles, apprentissage', energie: 'Thermique 4 temps', signature: 'Volant passager breveté 2 positions, ceinture', autonomie: '—' },
    'X2Drive': { img: 'x2drive', seg: 'Location · biplace électrique', moteur: 'ENGEC lithium', pilotes: '2 places · PMR', poids: '—', usage: 'Indoor, familles', energie: '100 % électrique', signature: 'SODISCAN, Easy Drive®', autonomie: '≈ 1 h' }
  };
  const ROWS = [['energie', 'Énergie'], ['moteur', 'Motorisation'], ['pilotes', 'Pilotes'], ['usage', 'Usage'], ['poids', 'Poids'], ['autonomie', 'Autonomie'], ['signature', 'Signature technologique']];
  const compare = () => {
    const root = $('#compare'); if (!root) return;
    const sels = $$('select[data-cmp]', root); const rows = $('#compare-rows');
    const defaults = ['SR6', 'RT10', 'RSX2'];
    sels.forEach((s, i) => { s.innerHTML = Object.keys(KARTS).map(k => `<option ${k === defaults[i] ? 'selected' : ''}>${k}</option>`).join(''); s.addEventListener('change', render); });
    function render() {
      const picks = sels.map(s => KARTS[s.value]);
      sels.forEach((s, i) => { const img = s.parentElement.querySelector('img'); img.src = 'assets/img/karts/' + picks[i].img + '.webp'; img.alt = s.value; });
      rows.innerHTML = ROWS.map(([k, label]) => `<div class="compare__row"><div>${label}</div>${picks.map(p => `<div>${p[k]}</div>`).join('')}</div>`).join('');
    }
    render();
  };

  /* ---------- My Studio ---------- */
  const studio = () => {
    const st = $('#studio-stage'); const sw = $('#swatches'); if (!st || !sw) return;
    $$('.swatch', sw).forEach(b => b.addEventListener('click', () => {
      $$('.swatch', sw).forEach(x => x.classList.remove('is-active')); b.classList.add('is-active');
      st.style.setProperty('--hue', b.dataset.hue + 'deg'); st.style.setProperty('--sat', b.dataset.sat || 1); st.style.setProperty('--studio', b.dataset.glow);
    }));
  };

  /* ---------- Simulateur de rentabilité ---------- */
  const sim = () => {
    const root = $('#sim'); if (!root) return;
    const ids = ['karts', 'prix', 'sess', 'jours', 'taux']; let mode = 'th';
    const upd = () => {
      const v = {}; ids.forEach(k => { const i = $('#i-' + k); v[k] = parseFloat(i.value); i.style.setProperty('--v', ((i.value - i.min) / (i.max - i.min) * 100) + '%'); });
      $('#o-karts').textContent = v.karts; $('#o-prix').textContent = v.prix + ' €'; $('#o-sess').textContent = v.sess; $('#o-jours').textContent = v.jours; $('#o-taux').textContent = v.taux + ' %';
      const sessions = v.karts * v.sess * v.jours * (v.taux / 100);
      const ca = sessions * v.prix;
      $('#sim-ca').textContent = fmt(ca); $('#sim-sessions').textContent = fmt(sessions); $('#sim-parkart').textContent = fmt(ca / v.karts) + ' €'; $('#sim-heures').textContent = fmt(v.sess * v.jours * (v.taux / 100) / 6) + ' h';
      const unit = mode === 'el' ? [9, 14] : [6, 10];
      $('#sim-flotte').textContent = fmt(v.karts * unit[0]) + ' – ' + fmt(v.karts * unit[1]) + ' k€';
      $('#sim-modetxt').textContent = mode === 'el' ? 'Électrique RSX2 · ≈ 1 h par charge' : 'Thermique Honda GX · GPL possible';
    };
    ids.forEach(k => $('#i-' + k).addEventListener('input', upd));
    $$('#sim-mode button').forEach(b => b.addEventListener('click', () => { $$('#sim-mode button').forEach(x => x.classList.remove('is-active')); b.classList.add('is-active'); mode = b.dataset.mode; upd(); }));
    upd();
  };

  /* ---------- Frise horizontale ---------- */
  const timeline = () => {
    const pin = $('#tl-pin'), track = $('#tl-track'), prog = $('#tl-progress'); if (!pin || !hasGSAP || reduced || window.innerWidth < 900) return;
    const dist = () => track.scrollWidth - window.innerWidth + 80;
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: pin, start: 'top top', end: () => '+=' + dist(), pin: true, scrub: .6, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => { if (prog) prog.style.width = (s.progress * 100) + '%'; } } });
  };

  /* ---------- Arbre de marques ---------- */
  const tree = () => {
    const t = $('#brand-tree'); const tip = $('#brand-tip span'); if (!t || !tip) return;
    $$('.node', t).forEach(n => { const show = () => { tip.textContent = n.dataset.tip; }; n.addEventListener('mouseenter', show); n.addEventListener('click', show); });
  };

  /* ---------- Échelle d'âge ---------- */
  const ladder = () => {
    const l = $('#ladder'); if (!l) return;
    const steps = $$('.ladder__step', l);
    const run = () => steps.forEach((s, i) => setTimeout(() => s.style.setProperty('--p', 1), i * 220));
    if (hasGSAP) ScrollTrigger.create({ trigger: l, start: 'top 80%', once: true, onEnter: run }); else run();
  };

  /* ---------- Carte 2D des pistes ---------- */
  const map2d = () => {
    const svg = $('#map-svg'); if (!svg || !window.LAND_DOTS) return;
    const W = 1000, H = 480, TOP = 84, BOT = -58;
    const px = (lat, lng) => [((lng + 180) / 360) * W, ((TOP - lat) / (TOP - BOT)) * H];
    const NS = 'http://www.w3.org/2000/svg';
    const g = (cls) => { const e = document.createElementNS(NS, 'g'); e.setAttribute('class', cls); svg.appendChild(e); return e; };
    const land = g('land'); window.LAND_DOTS.forEach(([la, lo]) => { const [x, y] = px(la, lo); const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', 1.9); c.setAttribute('fill', '#2e2e36'); land.appendChild(c); });
    const POLES = [['France', 46.6, 2.3, 170], ['Royaume-Uni', 52.5, -1.5, 60], ['Allemagne', 51.2, 10.4, 55], ['Italie', 42.5, 12.5, 50], ['Espagne', 40.2, -3.5, 45], ['Pays-Bas', 52.2, 5.3, 28], ['Belgique', 50.6, 4.5, 22], ['Suisse', 46.8, 8.2, 18], ['Portugal', 39.5, -8, 14], ['Suède', 60, 15, 20], ['Pologne', 52, 20, 18], ['Autriche', 47.5, 14, 14], ['Roumanie', 45, 25, 10], ['Danemark', 56, 10, 10], ['États-Unis', 38, -95, 55], ['Canada', 45, -79, 14], ['Mexique', 23, -102, 14], ['Brésil', -23, -46, 18], ['Argentine', -34, -64, 8], ['Colombie', 4.7, -74, 6], ['Japon', 36, 138, 14], ['Thaïlande', 13, 101, 10], ['Singapour', 1.3, 103.8, 6], ['Émirats · Dubaï', 25, 55, 10], ['Israël', 31, 35, 6], ['Inde', 20, 77, 8], ['Corée du Sud', 35, 127, 6], ['Australie', -25, 134, 24], ['Nouvelle-Zélande', -41, 174, 6], ['Afrique du Sud', -26, 28, 10], ['Algérie', 36, 3, 4], ['Zimbabwe', -18, 31, 3], ['Kazakhstan', 48, 68, 3], ['Sri Lanka', 7, 80, 3], ['Taïwan', 24, 121, 4], ['Luxembourg', 49.6, 6.1, 3], ['Floride', 27, -81, 8], ['Bangkok', 13.75, 100.5, 4]];
    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const pistes = g('pistes'); const dots = [];
    POLES.forEach(([name, la, lo, n]) => { for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), .7) * (n > 40 ? 4.5 : 3); const [x, y] = px(la + Math.sin(a) * d, lo + Math.cos(a) * d * 1.4); const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x.toFixed(1)); c.setAttribute('cy', y.toFixed(1)); c.setAttribute('r', 2.2); c.setAttribute('fill', '#3ab8b8'); c.setAttribute('opacity', '.85'); c.dataset.name = name; pistes.appendChild(c); dots.push({ c, name: name.toLowerCase(), x, y }); } });
    const SITES = [['Saint-Herblain · siège & usine', 47.21, -1.65, true], ['SODI USA · Floride', 26.53, -80.09], ['Sodi Racing USA · Floride', 26.27, -80.27], ['SODIKART LATAM · Mexique', 19.43, -99.13], ['SODI UK', 52.5, -1.9], ['SODIKART ASEAN · Bangkok', 13.75, 100.5], ['Bureau de Dubaï', 25.2, 55.27], ['SODI Australasia', -37.8, 144.96]];
    const sites = g('sites');
    SITES.forEach(([name, la, lo, hq]) => { const [x, y] = px(la, lo); const ring = document.createElementNS(NS, 'circle'); ring.setAttribute('cx', x); ring.setAttribute('cy', y); ring.setAttribute('r', 9); ring.setAttribute('fill', 'none'); ring.setAttribute('stroke', hq ? '#fff' : '#ff5220'); ring.setAttribute('opacity', '.6'); ring.innerHTML = '<animate attributeName="r" values="5;14" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values=".8;0" dur="2s" repeatCount="indefinite"/>'; sites.appendChild(ring); const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', hq ? 5 : 4); c.setAttribute('fill', hq ? '#fff' : '#ff5220'); c.dataset.name = name; sites.appendChild(c); dots.push({ c, name: name.toLowerCase(), x, y, site: true }); });
    const tip = $('#map-tip'); const box = svg.getBoundingClientRect();
    svg.addEventListener('mousemove', (e) => {
      const t = e.target; if (t.dataset && t.dataset.name) { const r = svg.getBoundingClientRect(); const sx = r.width / W; tip.textContent = t.dataset.name; tip.style.left = (parseFloat(t.getAttribute('cx')) * sx + 20) + 'px'; tip.style.top = (parseFloat(t.getAttribute('cy')) * sx + 76) + 'px'; tip.classList.add('is-on'); } else tip.classList.remove('is-on');
    });
    svg.addEventListener('mouseleave', () => tip.classList.remove('is-on'));
    const search = () => {
      const q = ($('#map-search').value || '').trim().toLowerCase();
      dots.forEach(d => { const hit = !q || d.name.includes(q); d.c.setAttribute('opacity', hit ? (d.site ? 1 : .85) : .12); d.c.setAttribute('r', hit && q ? (d.site ? 6 : 3.2) : (d.site ? 4 : 2.2)); });
    };
    $('#map-search').addEventListener('input', search); $('#map-go').addEventListener('click', search);
  };

  /* ---------- Formulaire de devis en 3 étapes ---------- */
  const devis = () => {
    const form = $('#devis-form'); if (!form) return;
    const steps = $$('.f-step', form); const stepper = $$('.stepper div'); const next = $('#devis-next'), prev = $('#devis-prev'), hint = $('#devis-hint');
    let i = 0;
    const params = new URLSearchParams(location.search);
    if (params.get('profil')) { const r = form.querySelector(`input[name=profil][value="${params.get('profil')}"]`); if (r) { r.checked = true; r.closest('.choice').classList.add('is-on'); } }
    if (params.get('kart')) { form.querySelector('[name=kart]').value = params.get('kart'); const cb = form.querySelector('input[value="Flotte de karts de location"]'); if (cb) { cb.checked = true; cb.closest('.choice').classList.add('is-on'); } }
    if (params.get('rappel')) { const cb = form.querySelector('[name=rappel]'); cb.checked = true; cb.closest('.choice').classList.add('is-on'); }
    $$('.choice input', form).forEach(inp => inp.addEventListener('change', () => {
      if (inp.type === 'radio') $$(`input[name=${inp.name}]`, form).forEach(r => r.closest('.choice').classList.toggle('is-on', r.checked));
      else inp.closest('.choice').classList.toggle('is-on', inp.checked);
    }));
    const show = () => {
      steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
      stepper.forEach((s, k) => { s.classList.toggle('is-on', k === i); s.classList.toggle('is-done', k < i); });
      prev.style.visibility = i === 0 ? 'hidden' : 'visible'; hint.textContent = `Étape ${i + 1} sur 3`;
      next.innerHTML = i === 2 ? 'Envoyer ma demande <svg class="btn__arrow"><use href="#i-arrow"/></svg>' : 'Continuer <svg class="btn__arrow"><use href="#i-arrow"/></svg>';
      if (i === 2) {
        const fd = new FormData(form); const besoins = fd.getAll('besoin');
        $('#devis-summary').innerHTML = `<b>Profil :</b> ${fd.get('profil') || 'non précisé'} · <b>Pays :</b> ${fd.get('pays')} · <b>Besoins :</b> ${besoins.length ? besoins.join(', ') : 'à préciser'}${fd.get('kart') ? ' · <b>Modèles :</b> ' + fd.get('kart') : ''}${fd.get('nb') ? ' · <b>Karts :</b> ' + fd.get('nb') : ''}`;
      }
      if (window.__lenis) window.__lenis.scrollTo($('#devis'), { offset: -110 });
    };
    next.addEventListener('click', () => {
      if (i === 2) {
        const ok = form.querySelector('[name=nom]').value.trim() && /@/.test(form.querySelector('[name=email]').value);
        if (!ok) { form.querySelector('[name=nom]').focus(); return; }
        form.hidden = true; $('.stepper').hidden = true; $('#devis-success').hidden = false; return;
      }
      i++; show();
    });
    prev.addEventListener('click', () => { i = Math.max(0, i - 1); show(); });
    show();
  };

  /* ---------- Formulaires de démonstration ---------- */
  $$('[data-demo-form]').forEach(f => f.addEventListener('submit', (e) => { e.preventDefault(); f.hidden = true; const s = f.parentElement.querySelector('.success'); if (s) s.hidden = false; }));

  const init = () => { subnav(); compare(); studio(); sim(); timeline(); tree(); ladder(); map2d(); devis(); if (hasGSAP) setTimeout(() => ScrollTrigger.refresh(), 700); };
  if (document.documentElement.classList.contains('site-ready')) init();
  else document.addEventListener('site:ready', init, { once: true });
})();
