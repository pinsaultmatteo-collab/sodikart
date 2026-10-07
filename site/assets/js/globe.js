/* SODIKART — globe 3D du réseau mondial (Three.js, géométrie procédurale) */
/* global THREE */

const stage = document.getElementById('globe-stage');
if (stage && window.LAND_DOTS) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const R = 1;
  const toVec = (lat, lng, r = R) => {
    const phi = (90 - lat) * Math.PI / 180, theta = (lng + 180) * Math.PI / 180;
    return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
  };
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, .1, 100); camera.position.set(0, .3, 4.5);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  stage.prepend(renderer.domElement);
  const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  resize(); window.addEventListener('resize', resize);

  const world = new THREE.Group(); scene.add(world);
  world.rotation.y = -0.6; world.rotation.x = 0.25;

  // Sphère de fond
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(R * .985, 64, 64), new THREE.MeshBasicMaterial({ color: 0x0b0b0f, transparent: true, opacity: .92 }));
  world.add(sphere);
  // Halo
  const halo = new THREE.Mesh(new THREE.SphereGeometry(R * 1.02, 64, 64), new THREE.ShaderMaterial({
    transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false,
    uniforms: { c: { value: new THREE.Color(0xff5220) } },
    vertexShader: 'varying vec3 vN; void main(){ vN = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: 'uniform vec3 c; varying vec3 vN; void main(){ float i = pow(0.62 - dot(vN, vec3(0,0,1.0)), 3.0); gl_FragColor = vec4(c, 1.0) * i * 0.9; }'
  }));
  halo.scale.setScalar(1.18); world.add(halo);

  // Points de terre
  const land = window.LAND_DOTS; const pos = new Float32Array(land.length * 3);
  land.forEach((p, i) => { const v = toVec(p[0], p[1]); pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z; });
  const landGeo = new THREE.BufferGeometry(); landGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dotTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.35, 'rgba(255,255,255,1)'); g.addColorStop(.5, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  const landPts = new THREE.Points(landGeo, new THREE.PointsMaterial({ color: 0xb8b8c4, size: .038, map: dotTex, transparent: true, alphaTest: .1, sizeAttenuation: true }));
  world.add(landPts);

  // Données réseau (approx. lat/lng)
  const HQ = [47.21, -1.65];
  const SITES = [[26.53, -80.09], [26.27, -80.27], [19.43, -99.13], [52.5, -1.9], [13.75, 100.5], [25.2, 55.27], [-37.8, 144.96]];
  const DEALERS = [[48.85, 2.35], [43.3, 5.37], [45.76, 4.84], [50.63, 3.06], [44.84, -0.58], [43.6, 1.44], [48.58, 7.75], [47.75, -3.37], [4.92, -52.33], [-21.1, 55.5],
    [51.5, -0.12], [53.48, -2.24], [52.52, 13.4], [48.14, 11.58], [45.46, 9.19], [41.9, 12.5], [59.33, 18.07], [57.7, 11.97], [38.72, -9.14], [41.15, -8.61], [48.2, 16.37], [55.68, 12.57], [40.42, -3.7], [37.98, 23.73], [49.45, -2.54], [47.5, 19.04], [56.95, 24.1], [49.61, 6.13], [59.91, 10.75], [52.37, 4.9], [52.23, 21.01], [50.08, 14.44], [55.75, 37.62], [46.95, 7.45],
    [13.75, 100.5], [35.68, 139.69], [37.57, 126.98], [25.03, 121.56], [14.6, 120.98], [10.82, 106.63], [19.08, 72.88], [25.2, 55.27], [33.89, 35.5],
    [40.71, -74.0], [34.05, -118.24], [19.43, -99.13], [25.67, -100.31], [43.65, -79.38], [18.47, -69.9], [-33.45, -70.67], [4.71, -74.07], [-0.18, -78.47], [-12.05, -77.04],
    [-26.2, 28.05], [-33.92, 18.42], [36.75, 3.06], [-22.56, 17.08], [5.36, -4.0],
    [-33.87, 151.21], [-37.81, 144.96], [-27.47, 153.02], [-36.85, 174.76], [-22.27, 166.45]];
  // 760 pistes SWS : nuages de points autour de pôles pondérés
  const SWS_POLES = [[46.6, 2.3, 170], [51.5, -1.5, 60], [51.2, 10.4, 55], [42.5, 12.5, 50], [40.2, -3.5, 45], [52.2, 5.3, 28], [50.6, 4.5, 22], [46.8, 8.2, 18], [39.5, -8, 14], [60, 15, 20], [52, 20, 18], [48, 17, 14], [45, 25, 10], [56, 10, 10],
    [38, -95, 55], [45, -79, 14], [23, -102, 14], [-23, -46, 18], [-34, -64, 8], [4.7, -74, 6],
    [36, 138, 14], [13, 101, 10], [1.3, 103.8, 6], [25, 55, 10], [31, 35, 6], [20, 77, 8], [35, 127, 6], [-25, 134, 24], [-41, 174, 6], [-26, 28, 10], [36, 3, 4], [-18, 31, 3], [48, 68, 3], [7, 80, 3], [24, 121, 4]];
  const swsPts = [];
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  SWS_POLES.forEach(([la, lo, n]) => { for (let i = 0; i < n; i++) { const a = rnd() * Math.PI * 2, d = Math.pow(rnd(), .7) * (n > 40 ? 4.5 : 3.2); swsPts.push([la + Math.sin(a) * d, lo + Math.cos(a) * d * 1.4]); } });

  const mkPoints = (list, color, size, r = R * 1.005) => {
    const arr = new Float32Array(list.length * 3); list.forEach((p, i) => { const v = toVec(p[0], p[1], r); arr[i * 3] = v.x; arr[i * 3 + 1] = v.y; arr[i * 3 + 2] = v.z; });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color, size, map: dotTex, transparent: true, alphaTest: .1, blending: THREE.AdditiveBlending, depthWrite: false }));
  };
  const dealerPts = mkPoints(DEALERS, 0xffb59e, .045); world.add(dealerPts);
  const swsCloud = mkPoints(swsPts, 0x3ab8b8, .03, R * 1.004); swsCloud.visible = false; world.add(swsCloud);

  // Implantations : marqueurs pulsants
  const markers = new THREE.Group(); world.add(markers);
  const mkMarker = (lat, lng, color, s) => {
    const v = toVec(lat, lng, R * 1.01);
    const g = new THREE.Group(); g.position.copy(v); g.lookAt(v.clone().multiplyScalar(2));
    const core = new THREE.Mesh(new THREE.CircleGeometry(s, 24), new THREE.MeshBasicMaterial({ color })); g.add(core);
    const ring = new THREE.Mesh(new THREE.RingGeometry(s * 1.4, s * 1.9, 32), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .8, side: THREE.DoubleSide })); g.add(ring); g.userData.ring = ring; g.userData.t = Math.random() * 6;
    markers.add(g); return g;
  };
  mkMarker(HQ[0], HQ[1], 0xffffff, .028);
  SITES.forEach(s => mkMarker(s[0], s[1], 0xff5220, .02));

  // Arcs depuis Saint-Herblain
  const arcs = new THREE.Group(); world.add(arcs);
  SITES.forEach(s => {
    const a = toVec(HQ[0], HQ[1], R * 1.01), b = toVec(s[0], s[1], R * 1.01);
    const mid = a.clone().add(b).multiplyScalar(.5); const d = a.distanceTo(b); mid.normalize().multiplyScalar(R * (1.08 + d * .32));
    const curve = new THREE.QuadraticBezierCurve3(a, mid, b); const pts = curve.getPoints(64);
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineDashedMaterial({ color: 0xff7a4d, transparent: true, opacity: .75, dashSize: .06, gapSize: .035 });
    const line = new THREE.Line(geo, mat); line.computeLineDistances(); arcs.add(line);
  });

  // Mode
  const toggle = document.getElementById('globe-toggle');
  if (toggle) toggle.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    toggle.querySelectorAll('button').forEach(x => x.classList.remove('is-active')); b.classList.add('is-active');
    const sws = b.dataset.mode === 'sws';
    swsCloud.visible = sws; dealerPts.visible = !sws; arcs.visible = !sws; markers.visible = true;
    halo.material.uniforms.c.value.set(sws ? 0x3ab8b8 : 0xff5220);
  }));

  // Interaction : rotation à la souris (glisser) + auto-rotation
  let dragging = false, px = 0, py = 0, vel = 0, targetX = world.rotation.x;
  const down = (e) => { dragging = true; px = e.clientX; py = e.clientY; };
  const move = (e) => { if (!dragging) return; const dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY; world.rotation.y += dx * .005; vel = dx * .005; targetX = THREE.MathUtils.clamp(targetX + dy * .003, -.6, .8); };
  const up = () => { dragging = false; };
  stage.addEventListener('pointerdown', down); window.addEventListener('pointermove', move); window.addEventListener('pointerup', up);

  let visible = true;
  if ('IntersectionObserver' in window) new IntersectionObserver(es => es.forEach(x => visible = x.isIntersecting), { threshold: .02 }).observe(stage);
  const clock = new THREE.Clock();
  const loop = () => {
    requestAnimationFrame(loop); if (!visible) return;
    const t = clock.getElapsedTime();
    if (!dragging) { world.rotation.y += reduced ? 0 : (.0022 + vel); vel *= .94; }
    world.rotation.x += (targetX - world.rotation.x) * .06;
    markers.children.forEach(m => { const r = m.userData.ring; const k = (Math.sin(t * 2.2 + m.userData.t) + 1) / 2; r.scale.setScalar(1 + k * .9); r.material.opacity = .85 - k * .8; });
    arcs.children.forEach((l, i) => { l.material.dashSize = .06; l.material.gapSize = .035; l.material.opacity = .45 + .4 * ((Math.sin(t * 1.5 + i) + 1) / 2); });
    renderer.render(scene, camera);
  };
  loop();
}
