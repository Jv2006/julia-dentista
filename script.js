/* =====================================================
   CONFIGURAÇÃO: WhatsApp da Julia (55 + DDD + número)
   Exemplo: '5521999999999'
   ===================================================== */
const WHATSAPP = '55XXXXXXXXXXX';

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

// ===== Loader =====
window.addEventListener('load', () => setTimeout(() => $('#loader').classList.add('done'), 1500));

// ===== WhatsApp =====
$('#waBtn').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Olá, Julia! Vim pelo seu site e gostaria de conversar.')}`;

// ===== Menu =====
const burger = $('#burger'), menu = $('#menu');
const toggleMenu = (open) => {
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', open);
  menu.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));

// ===== Progresso de leitura + linha do tempo =====
const progress = $('#progress'), timeline = $('#timeline');
const onScroll = () => {
  const h = document.documentElement;
  progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
  const r = timeline.getBoundingClientRect();
  timeline.style.setProperty('--p', clamp((innerHeight * .7 - r.top) / r.height, 0, 1));
};
addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Reveal ao rolar =====
const io = new IntersectionObserver((entries) => {
  entries.forEach((e, i) => {
    if (!e.isIntersecting) return;
    setTimeout(() => e.target.classList.add('in'), (i % 4) * 90);
    io.unobserve(e.target);
  });
}, { threshold: 0.12 });
$$('.reveal').forEach(el => io.observe(el));

// ===== Contadores (aceita prefixo e sufixo) =====
const counters = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, end = +el.dataset.count;
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    let n = 0;
    const step = () => {
      n += Math.max(.1, end / 60);
      if (n >= end) { el.textContent = pre + end + suf; return; }
      el.textContent = pre + Math.floor(n) + suf;
      requestAnimationFrame(step);
    };
    step();
    counters.unobserve(el);
  });
}, { threshold: 0.6 });
$$('[data-count]').forEach(el => counters.observe(el));

// ===== Destaque do menu (desktop) =====
(() => {
  const links = $$('#navLinks a');
  const map = new Map([...links].map(a => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(l => l.classList.remove('on'));
      const a = map.get(e.target.id);
      if (a) a.classList.add('on');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  map.forEach((_, id) => { const s = document.getElementById(id); if (s) spy.observe(s); });
})();

// ===== Brilho que acompanha o cursor nos cards =====
$$('.spot').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

// ===== Cursor em anel (só com mouse) =====
if (matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const ringEl = document.createElement('div');
  ringEl.className = 'cursor';
  document.body.appendChild(ringEl);
  let mx = -100, my = -100, px = -100, py = -100;
  addEventListener('pointermove', e => {
    mx = e.clientX; my = e.clientY;
    ringEl.classList.toggle('hover', !!e.target.closest('a,button,summary,.tooth,.card,.project'));
  });
  (function follow() {
    px += (mx - px) * .18; py += (my - py) * .18;
    ringEl.style.transform = `translate(${px}px,${py}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  })();
}

// ===== Dente 3D realista (Three.js) =====
(() => {
  const wrap = $('#heroVisual'), cv = $('#tooth3d');
  if (!window.THREE) { wrap.classList.add('nogl'); return; }
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); }
  catch (e) { wrap.classList.add('nogl'); return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(35, 1, .1, 50);
  cam.position.set(0, 0, 9.5);

  // Ambiente de estúdio (caixas de luz) para reflexos reais no esmalte
  const pm = new THREE.PMREMGenerator(renderer);
  const env = new THREE.Scene();
  env.add(new THREE.Mesh(new THREE.BoxGeometry(30, 30, 30), new THREE.MeshBasicMaterial({ color: 0x1a0a10, side: THREE.BackSide })));
  const softbox = (w, h, x, y, z, color, power) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(power), side: THREE.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); env.add(m);
  };
  softbox(14, 8, 0, 12, 6, 0xffffff, 3);
  softbox(6, 14, -12, 2, 4, 0xffd7e0, 2.2);
  softbox(6, 14, 12, 0, 3, 0xe2c6a8, 2);
  softbox(10, 5, 0, -10, 5, 0xa12d4a, 1.6);
  scene.environment = pm.fromScene(env, 0.03).texture;
  pm.dispose();

  scene.add(new THREE.AmbientLight(0xffffff, .18));
  const key = new THREE.DirectionalLight(0xffffff, .9); key.position.set(3, 5, 6); scene.add(key);
  const wine = new THREE.PointLight(0xc2365a, 1.8, 24); wine.position.set(-4, 1, 4); scene.add(wine);
  const wine2 = new THREE.PointLight(0x7b1e34, 1.6, 24); wine2.position.set(3, -4, 3); scene.add(wine2);

  // Utilidades
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const gauss = (x, z, cx, cz, s) => Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * s * s));
  const lerpv = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const toLinear = (rgb) => new THREE.Color().setRGB(rgb[0], rgb[1], rgb[2]).convertSRGBToLinear();
  const smoothNormals = (geo) => {
    geo.computeVertexNormals();
    const p = geo.attributes.position, nr = geo.attributes.normal, keys = [], sums = new Map();
    for (let i = 0; i < p.count; i++) {
      const k = p.getX(i).toFixed(4) + '|' + p.getY(i).toFixed(4) + '|' + p.getZ(i).toFixed(4);
      keys.push(k);
      const s = sums.get(k) || [0, 0, 0];
      s[0] += nr.getX(i); s[1] += nr.getY(i); s[2] += nr.getZ(i);
      sums.set(k, s);
    }
    for (let i = 0; i < p.count; i++) {
      const s = sums.get(keys[i]), l = Math.hypot(s[0], s[1], s[2]) || 1;
      nr.setXYZ(i, s[0] / l, s[1] / l, s[2] / l);
    }
  };

  const group = new THREE.Group(); scene.add(group);
  const tooth = new THREE.Group(); tooth.position.y = .5; group.add(tooth);

  // ----- Coroa de molar: 4 cúspides, fossa central e sulcos -----
  const A = 1.25, B = 1.1, H = 1.15, HL = .62;
  const seg = innerWidth < 700 ? [128, 96] : [200, 160];
  const cg = new THREE.SphereGeometry(1, seg[0], seg[1]);
  const pos = cg.attributes.position, cols = new Float32Array(pos.count * 3), v = new THREE.Vector3();
  const white = [.97, .94, .89], yellow = [.88, .77, .56], brown = [.5, .34, .22];
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const th = Math.atan2(v.z, v.x), sq = 1 + .07 * Math.cos(4 * th);
    let x, y, z, groove = 0, w = 0;
    if (v.y >= 0) {
      x = v.x * A * sq; z = v.z * B * sq;
      const cusp = .3 * (gauss(x, z, .5, .45, .42) + gauss(x, z, -.5, .45, .42) + gauss(x, z, .5, -.45, .42) + .9 * gauss(x, z, -.5, -.45, .42));
      const fossa = .16 * gauss(x, z, 0, 0, .32);
      const gx = Math.exp(-x * x / .014) * Math.exp(-z * z / .8);
      const gz = Math.exp(-z * z / .014) * Math.exp(-x * x / .9);
      groove = Math.max(gx, gz);
      w = smooth(.05, .55, v.y);
      y = v.y * H + w * (cusp - fossa - .11 * groove);
    } else {
      const k = 1 + .2 * v.y;
      x = v.x * A * sq * k; z = v.z * B * sq * k; y = v.y * HL;
    }
    pos.setXYZ(i, x, y, z);
    // cor: esmalte claro, amarelado perto do colo, sulcos levemente manchados
    const yn = clamp((y + HL) / (H + HL + .3), 0, 1);
    const cerv = 1 - smooth(0, .5, yn);
    let c = lerpv(white, yellow, cerv * .9);
    c = lerpv(c, brown, .55 * groove * w);
    const lin = toLinear(c);
    cols[i * 3] = lin.r; cols[i * 3 + 1] = lin.g; cols[i * 3 + 2] = lin.b;
  }
  cg.setAttribute('color', new THREE.BufferAttribute(cols, 3));
  smoothNormals(cg);

  const enamelMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .2, metalness: 0, clearcoat: .7, clearcoatRoughness: .22, envMapIntensity: 1.1 });
  const enamel = new THREE.Mesh(cg, enamelMat);
  enamel.renderOrder = 3;
  tooth.add(enamel);

  // ----- Raízes (afinam e se curvam) -----
  const L = 2.0;
  const rootPath = (side, t) => ({ x: side * (.42 + .42 * t + .1 * t * t), z: .06 * Math.sin(t * 3.2) });
  const makeRoot = (side) => {
    const g = new THREE.CylinderGeometry(1, 1, 1, 28, 48);
    const p = g.attributes.position, c = new Float32Array(p.count * 3);
    for (let i = 0; i < p.count; i++) {
      const ox = p.getX(i), oy = p.getY(i), oz = p.getZ(i);
      const t = clamp(.5 - oy, 0, 1);
      const R = .44 * Math.pow(1 - t, .7) + .03;
      const q = rootPath(side, t);
      p.setXYZ(i, q.x + ox * R, -t * L, q.z + oz * R * .8);
      const lin = toLinear([.91 - .08 * t, .83 - .14 * t, .68 - .2 * t]);
      c[i * 3] = lin.r; c[i * 3 + 1] = lin.g; c[i * 3 + 2] = lin.b;
    }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3));
    smoothNormals(g);
    return g;
  };
  const rootMat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: .55, clearcoat: .12, envMapIntensity: .8 });
  const roots = new THREE.Group(); roots.position.y = -.35; tooth.add(roots);
  const sides = [-1, 1];
  sides.forEach(s => { const m = new THREE.Mesh(makeRoot(s), rootMat); m.renderOrder = 3; roots.add(m); });

  // ----- Camadas internas (aparecem no modo Anatomia) -----
  const dentinMat = new THREE.MeshStandardMaterial({ color: 0xe3c88f, roughness: .6, emissive: 0x2a1a05 });
  const dentin = new THREE.Mesh(cg, dentinMat);
  dentin.scale.set(.86, .8, .86); dentin.renderOrder = 1;
  tooth.add(dentin);

  const pulpMat = new THREE.MeshStandardMaterial({ color: 0xb3263f, roughness: .4, emissive: 0x7a1022, emissiveIntensity: .6 });
  const chamber = new THREE.Mesh(new THREE.SphereGeometry(.42, 40, 32), pulpMat);
  chamber.scale.set(1, .8, .75); chamber.position.y = -.05; chamber.renderOrder = 2;
  tooth.add(chamber);
  sides.forEach(s => {
    const pts = [new THREE.Vector3(s * .05, .32, 0), new THREE.Vector3(s * .25, .08, 0)];
    for (let k = 0; k <= 10; k++) {
      const t = k / 10 * .95, q = rootPath(s, t);
      pts.push(new THREE.Vector3(q.x, -t * L, q.z));
    }
    const canal = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, .055, 8, false), pulpMat);
    canal.renderOrder = 2;
    roots.add(canal);
  });
  const inner = [dentin, chamber, ...roots.children.filter(m => m.geometry.type === 'TubeGeometry')];
  inner.forEach(m => m.visible = false);

  // ----- Anel fino e poeira discreta -----
  const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, .012, 16, 240),
    new THREE.MeshBasicMaterial({ color: 0xe2c6a8, transparent: true, opacity: .4 }));
  ring.rotation.x = 1.25;
  group.add(ring);

  const N = 90, arr = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const rad = 2.5 + Math.random() * 1.2, th = Math.random() * 6.283, ph = Math.acos(2 * Math.random() - 1);
    arr[i * 3] = rad * Math.sin(ph) * Math.cos(th);
    arr[i * 3 + 1] = rad * Math.cos(ph) * .9;
    arr[i * 3 + 2] = rad * Math.sin(ph) * Math.sin(th);
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const c2 = document.createElement('canvas'); c2.width = c2.height = 64;
  const cx2 = c2.getContext('2d'), grd = cx2.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,225,215,1)'); grd.addColorStop(.4, 'rgba(226,120,150,.5)'); grd.addColorStop(1, 'rgba(226,120,150,0)');
  cx2.fillStyle = grd; cx2.fillRect(0, 0, 64, 64);
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({
    size: .1, map: new THREE.CanvasTexture(c2), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  group.add(dust);

  const resize = () => {
    const w = cv.clientWidth, h = cv.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    cam.aspect = w / h; cam.updateProjectionMatrix();
  };
  resize(); addEventListener('resize', resize);

  // ----- Alternar Superfície / Anatomia -----
  let anat = false, mix = 0, wasT = false;
  $$('.vt').forEach(b => b.addEventListener('click', () => {
    anat = b.dataset.mode === 'anat';
    $$('.vt').forEach(o => { const on = o === b; o.classList.toggle('on', on); o.setAttribute('aria-pressed', on); });
    wrap.classList.toggle('anat', anat);
  }));

  // ----- Interação: arrastar, mouse (inclinação) e giroscópio -----
  let tx = 0, ty = 0, cxr = 0, cyr = 0;
  let spin = 0, vel = 0, auto = 0, drag = false, lastX = 0;
  addEventListener('pointermove', e => { tx = (e.clientX / innerWidth - .5) * 1.4; ty = (e.clientY / innerHeight - .5) * 1.0; });
  cv.addEventListener('pointerdown', e => { drag = true; lastX = e.clientX; try { cv.setPointerCapture(e.pointerId); } catch (_) {} });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    const dx = e.clientX - lastX; lastX = e.clientX;
    vel = dx * .012; spin += vel;
  });
  ['pointerup', 'pointercancel'].forEach(ev => cv.addEventListener(ev, () => { drag = false; }));
  addEventListener('deviceorientation', e => {
    if (e.gamma == null) return;
    tx = clamp(e.gamma / 40, -1, 1) * .8;
    ty = clamp(((e.beta || 45) - 45) / 40, -1, 1) * .6;
  });
  addEventListener('pointerdown', () => {
    if (window.DeviceOrientationEvent && typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission().catch(() => {});
    }
  }, { once: true });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(wrap);

  const clock = new THREE.Clock();
  (function loop() {
    requestAnimationFrame(loop);
    if (!visible) return;
    const t = clock.getElapsedTime();

    // transição suave entre os modos
    mix += ((anat ? 1 : 0) - mix) * .08;
    const trans = mix > .005;
    enamelMat.opacity = 1 - .84 * mix;
    rootMat.opacity = 1 - .72 * mix;
    if (trans !== wasT) { enamelMat.transparent = rootMat.transparent = trans; enamelMat.needsUpdate = rootMat.needsUpdate = true; wasT = trans; }
    enamelMat.depthWrite = rootMat.depthWrite = mix < .4;
    const showInner = mix > .02;
    inner.forEach(m => m.visible = showInner);
    pulpMat.emissiveIntensity = .55 + .35 * Math.sin(t * 2.6) * mix;

    // rotação: automática lenta + arraste com inércia + leve inclinação do mouse
    cxr += (tx - cxr) * .06; cyr += (ty - cyr) * .06;
    if (!drag) { vel *= .95; spin += vel; auto += .0035; }
    group.rotation.y = auto + spin + cxr * .4;
    group.rotation.x = cyr * .5;
    group.position.y = Math.sin(t * 1.1) * .08;
    ring.rotation.z = t * .3;
    dust.rotation.y = t * .07;
    renderer.render(scene, cam);
  })();
})();

// ===== Atlas dental interativo (numeração FDI) =====
(() => {
  const svg = $('#archSvg');
  if (!svg) return;
  const NS = 'http://www.w3.org/2000/svg';

  // Dados de referência (tipo de dente → informações)
  const INFO = {
    1: { n: 'Incisivo central', f: 'Cortar os alimentos', r: '1 raiz', e: { up: '7–8 anos', lo: '6–7 anos' } },
    2: { n: 'Incisivo lateral', f: 'Cortar os alimentos', r: '1 raiz', e: { up: '8–9 anos', lo: '7–8 anos' } },
    3: { n: 'Canino', f: 'Rasgar os alimentos', r: '1 raiz', e: { up: '11–12 anos', lo: '9–10 anos' } },
    4: { n: 'Primeiro pré-molar', f: 'Amassar e triturar', r: { up: 'geralmente 2 raízes', lo: 'geralmente 1 raiz' }, e: { up: '10–11 anos', lo: '10–12 anos' } },
    5: { n: 'Segundo pré-molar', f: 'Amassar e triturar', r: 'geralmente 1 raiz', e: { up: '10–12 anos', lo: '11–12 anos' } },
    6: { n: 'Primeiro molar', f: 'Triturar e moer', r: { up: 'geralmente 3 raízes', lo: 'geralmente 2 raízes' }, e: { up: '6–7 anos', lo: '6–7 anos' } },
    7: { n: 'Segundo molar', f: 'Triturar e moer', r: { up: 'geralmente 3 raízes', lo: 'geralmente 2 raízes' }, e: { up: '12–13 anos', lo: '11–13 anos' } },
    8: { n: 'Terceiro molar (siso)', f: 'Triturar e moer', r: 'varia bastante', e: { up: '17–21 anos', lo: '17–21 anos' } }
  };
  const WN = { 1: 26, 2: 24, 3: 24, 4: 30, 5: 30, 6: 42, 7: 40, 8: 36 };
  const SHAPES = {
    1: 'M-11,-15 Q0,-19 11,-15 Q13,0 9,14 Q0,18 -9,14 Q-13,0 -11,-15Z',
    2: 'M-10,-14 Q0,-18 10,-14 Q12,0 8,13 Q0,17 -8,13 Q-12,0 -10,-14Z',
    3: 'M0,-19 C9,-10 12,4 9,14 Q0,19 -9,14 C-12,4 -9,-10 0,-19Z',
    4: 'M-14,-10 Q0,-17 14,-10 Q16,0 12,11 Q0,17 -12,11 Q-16,0 -14,-10Z',
    5: 'M-14,-10 Q0,-17 14,-10 Q16,0 12,11 Q0,17 -12,11 Q-16,0 -14,-10Z',
    6: 'M-20,-14 Q0,-21 20,-14 Q23,0 19,15 Q0,22 -19,15 Q-23,0 -20,-14Z',
    7: 'M-19,-13 Q0,-20 19,-13 Q22,0 18,14 Q0,21 -18,14 Q-22,0 -19,-13Z',
    8: 'M-17,-12 Q0,-19 17,-12 Q20,0 16,13 Q0,19 -16,13 Q-20,0 -17,-12Z'
  };
  const UP = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
  const LO = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

  // Geometria das arcadas (elipses) e comprimento do arco
  const CX = 320, RX = 270, RY = 168, CYU = 215, CYL = 255;
  const STEPS = 800, arc = [];
  let len = 0, lx = -RX, ly = 0;
  for (let k = 0; k <= STEPS; k++) {
    const u = Math.PI * k / STEPS, x = -RX * Math.cos(u), y = RY * Math.sin(u);
    if (k) len += Math.hypot(x - lx, y - ly);
    arc.push(len); lx = x; ly = y;
  }
  const uAt = (s) => {
    let k = 1;
    while (k < arc.length && arc[k] < s) k++;
    const a = arc[k - 1], b = arc[k] ?? a;
    return Math.PI * ((k - 1) + (b > a ? (s - a) / (b - a) : 0)) / STEPS;
  };

  const el = (name, attrs = {}) => {
    const n = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  };

  // Elementos de apoio (linha do meio e legendas)
  svg.appendChild(el('line', { class: 'mid', x1: CX, y1: 24, x2: CX, y2: 446 }));
  const cap = (txt, y) => { const t = el('text', { class: 'cap', x: CX, y }); t.textContent = txt; svg.appendChild(t); };
  cap('SUPERIOR', 150); cap('INFERIOR', 322);
  const sideTxt = (txt, x, anchor) => { const t = el('text', { class: 'side', x, y: 466, 'text-anchor': anchor }); t.textContent = txt; svg.appendChild(t); };
  sideTxt('← direita do paciente', 4, 'start'); sideTxt('esquerda do paciente →', 636, 'end');

  const nodes = {};
  const build = (list, upper, cy) => {
    const w = list.map(f => WN[f % 10]), total = w.reduce((a, b) => a + b, 0);
    const k = len / total, sc = k / 1.08;
    let acc = 0;
    list.forEach((f, i) => {
      const s = (acc + w[i] / 2) * k; acc += w[i];
      const u = uAt(s);
      const x = CX - RX * Math.cos(u), y = upper ? cy - RY * Math.sin(u) : cy + RY * Math.sin(u);
      const nx = -Math.cos(u) / RX, ny = (upper ? -1 : 1) * Math.sin(u) / RY;
      const rot = Math.atan2(ny, nx) * 180 / Math.PI + 90;
      const type = f % 10;
      const g = el('g', { class: 'tooth', tabindex: 0, role: 'button', 'aria-label': `Dente ${f}`, 'data-fdi': f, transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(1)})` });
      g.appendChild(el('path', { class: 'shape', d: SHAPES[type], transform: `scale(${sc.toFixed(3)})` }));
      if (type >= 4) g.appendChild(el('path', { class: 'fis', d: 'M0,-9 L0,9 M-8,0 L8,0', transform: `scale(${sc.toFixed(3)})` }));
      const t = el('text', { transform: `rotate(${(-rot).toFixed(1)})` });
      t.textContent = f; g.appendChild(t);
      svg.appendChild(g);
      nodes[f] = g;
    });
  };
  build(UP, true, CYU);
  build(LO, false, CYL);

  const card = $('#atlasCard');
  const pick = (v, upper) => (v && typeof v === 'object') ? (upper ? v.up : v.lo) : v;
  const select = (f) => {
    Object.values(nodes).forEach(n => n.classList.remove('sel'));
    nodes[f].classList.add('sel');
    const q = Math.floor(f / 10), type = f % 10, upper = q <= 2, d = INFO[type];
    const arch = upper ? 'superior' : 'inferior', side = (q === 1 || q === 4) ? 'direito' : 'esquerdo';
    $('#aFdi').textContent = f;
    $('#aName').textContent = `${d.n} ${arch} ${side}`;
    $('#aSub').textContent = `Arcada ${arch} · lado ${side} do paciente`;
    $('#aFun').textContent = d.f;
    $('#aRoot').textContent = pick(d.r, upper);
    $('#aEr').textContent = pick(d.e, upper);
    card.classList.remove('flash'); void card.offsetWidth; card.classList.add('flash');
  };
  svg.addEventListener('click', e => { const g = e.target.closest('.tooth'); if (g) select(+g.dataset.fdi); });
  svg.addEventListener('keydown', e => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const g = e.target.closest('.tooth');
    if (g) { e.preventDefault(); select(+g.dataset.fdi); }
  });
  select(11);
})();

// ===== Ano do rodapé =====
$('#year').textContent = new Date().getFullYear();