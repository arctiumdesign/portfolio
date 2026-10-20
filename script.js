// ===== WORK SAMPLES: add your own images (img: "img/file.jpg") and edit the texts =====
const WORKS = [
  {
    t: "ITB Booth SuitePad - 2023",
    d: "Development of wall graphics for ITB in Berlin.",
    img: "img/itb-booth.jpg",
  },
  {
    t: "Magazine CityInfo Recklinghausen",
    d: "Design of print brochure",
    img: "img/city-info.jpg",
  },
  { t: "Product Brochure", d: "A5 brochure for SuitePad", img: "img/product-brochure.jpg" },
  {
    t: "Textile Print",
    d: "Artwork for T-shirts and textiles – optimised for print, colour-matched and production-ready.",
    img: "img/textile-print.jpg",
  },
  {
    t: "Whitepaper Design",
    d: "Report completely set-up in Adobe Indesign",
    img: "img/whitepaper.jpg",
  },
  {
    t: "Hotel Set-ups",
    d: "A few of more than 200 hotels i implemented in the SuitePad's",
    img: "img/hotel-setups.jpg",
  },
];
const PAL = [
  ["#101820", "#2b4a6b", "#7fd8ff"],
  ["#ff7a59", "#ffd166", "#1a1a1a"],
  ["#f4f1ea", "#d6d0c4", "#d62828"],
  ["#1b1b1f", "#3a3a44", "#c8ff3d"],
  ["#ffffff", "#e4e7ec", "#5b5bd6"],
  ["#0f3d3e", "#1f7a6d", "#f2e9d0"],
];
const IMGS = WORKS.map((w, n) => {
  if (!w.img) return null;
  const i = new Image();
  i.onload = () => {
    try {
      drawArt(CACHE[n], TW, TH, n);
      arms[-1].done = arms[1].done = -1;
    } catch (e) {}
  };
  i.src = w.img;
  return i;
});

function drawArt(c, w, h, i) {
  const g = c.getContext("2d"),
    P = PAL[i],
    s = h / 420;
  const gr = g.createLinearGradient(0, 0, w, h);
  gr.addColorStop(0, P[0]);
  gr.addColorStop(1, P[1]);
  g.fillStyle = gr;
  g.fillRect(0, 0, w, h);
  const im = IMGS[i];
  if (im && im.complete && im.naturalWidth) {
    const r = Math.max(w / im.naturalWidth, h / im.naturalHeight);
    g.drawImage(
      im,
      (w - im.naturalWidth * r) / 2,
      (h - im.naturalHeight * r) / 2,
      im.naturalWidth * r,
      im.naturalHeight * r,
    );
    return;
  }
  g.fillStyle = P[2];
  g.strokeStyle = P[2];
  g.lineWidth = 14 * s;
  const cx = w / 2,
    cy = h / 2;
  if (i == 0) {
    g.beginPath();
    g.arc(cx, cy - 10 * s, 95 * s, 0, 7);
    g.stroke();
    g.beginPath();
    g.moveTo(cx, cy - 80 * s);
    g.lineTo(cx + 60 * s, cy + 40 * s);
    g.lineTo(cx - 60 * s, cy + 40 * s);
    g.closePath();
    g.fill();
  }
  if (i == 1) {
    for (let k = 0; k < 7; k++) {
      g.globalAlpha = 0.25 + k * 0.1;
      g.fillRect(-40 * s + k * 110 * s, 0, 50 * s, h);
    }
    g.globalAlpha = 1;
    g.fillStyle = "#fff";
    g.fillRect(60 * s, 230 * s, w * 0.5, 10 * s);
    g.fillRect(60 * s, 260 * s, w * 0.35, 10 * s);
  }
  if (i == 2) {
    g.beginPath();
    g.arc(cx, cy + 30 * s, 150 * s, 0, 7);
    g.fill();
    g.fillStyle = P[0];
    g.font = `900 ${110 * s}px Helvetica,Arial`;
    g.textAlign = "center";
    g.fillText("POSTER", cx, cy + 75 * s);
  }
  if (i == 3) {
    g.beginPath();
    g.moveTo(cx - 60 * s, 50 * s);
    g.lineTo(cx - 150 * s, 120 * s);
    g.lineTo(cx - 110 * s, 170 * s);
    g.lineTo(cx - 80 * s, 150 * s);
    g.lineTo(cx - 80 * s, 370 * s);
    g.lineTo(cx + 80 * s, 370 * s);
    g.lineTo(cx + 80 * s, 150 * s);
    g.lineTo(cx + 110 * s, 170 * s);
    g.lineTo(cx + 150 * s, 120 * s);
    g.lineTo(cx + 60 * s, 50 * s);
    g.quadraticCurveTo(cx, 100 * s, cx - 60 * s, 50 * s);
    g.fillStyle = "#fff";
    g.fill();
    g.fillStyle = P[2];
    g.beginPath();
    g.arc(cx, 230 * s, 40 * s, 0, 7);
    g.fill();
  }
  if (i == 4) {
    ["#5b5bd6", "#15171b", "#ff7a59", "#c8ff3d"].forEach((k, n) => {
      g.fillStyle = k;
      g.fillRect(50 * s + n * 70 * s, 50 * s, 60 * s, 60 * s);
    });
    g.fillStyle = "#15171b";
    g.font = `200 ${190 * s}px Helvetica,Arial`;
    g.textAlign = "left";
    g.fillText("Aa", 50 * s, 310 * s);
  }
  if (i == 5) {
    for (let k = 0; k < 4; k++) {
      g.globalAlpha = 0.3 + k * 0.2;
      g.fillRect(70 * s + k * 130 * s, 300 * s - k * 50 * s, 100 * s, 100 * s + k * 50 * s);
    }
    g.globalAlpha = 1;
  }
  g.fillStyle = i == 1 || i == 2 || i == 4 ? "#15171b" : "#fff";
  g.textAlign = "left";
  g.font = `600 ${20 * s}px Helvetica,Arial`;
  g.fillText(WORKS[i].t.toUpperCase(), 28 * s, h - 26 * s);
}
const TW = 1280,
  TH = 840;
const CACHE = WORKS.map((_, i) => {
  const c = document.createElement("canvas");
  c.width = TW;
  c.height = TH;
  drawArt(c, TW, TH, i);
  return c;
});

// ===== Three.js =====
const cv = document.getElementById("gl"),
  R = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
R.setPixelRatio(Math.min(devicePixelRatio, 2));
R.shadowMap.enabled = true;
R.shadowMap.type = THREE.PCFSoftShadowMap;
R.toneMapping = THREE.ACESFilmicToneMapping;
R.toneMappingExposure = 1.05;
const S = new THREE.Scene();
S.background = new THREE.Color(0xeef0f3);
S.fog = new THREE.Fog(0xeef0f3, 12, 30);
const cam = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
{
  const e = new THREE.Scene();
  e.background = new THREE.Color(0xc9ced6);
  const b = (x, y, z, w, h, d, c) => {
    const m = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshBasicMaterial({ color: c }),
    );
    m.position.set(x, y, z);
    e.add(m);
  };
  b(0, 9, 0, 14, 0.5, 14, 0xffffff);
  b(-9, 3, 2, 0.5, 8, 8, 0xffffff);
  b(9, 3, 2, 0.5, 8, 8, 0xf0f4ff);
  b(0, 3, 9, 10, 6, 0.5, 0xffffff);
  b(0, 0.5, -9, 14, 1, 0.5, 0x222831);
  b(4, 5, 6, 2, 0.3, 6, 0xffffff);
  S.environment = new THREE.PMREMGenerator(R).fromScene(e).texture;
}
S.add(new THREE.HemisphereLight(0xffffff, 0xdde1e7, 0.5));
const key = new THREE.DirectionalLight(0xffffff, 0.8);
key.position.set(3, 7, 5);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.radius = 6;
key.shadow.camera.left = -6;
key.shadow.camera.right = 6;
key.shadow.camera.top = 6;
key.shadow.camera.bottom = -3;
S.add(key);
const rim = new THREE.DirectionalLight(0xdfe8ff, 0.5);
rim.position.set(-4, 3, -4);
S.add(rim);
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.ShadowMaterial({ opacity: 0.16 }),
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
S.add(floor);
const fb = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshBasicMaterial({ color: 0xeef0f3 }),
);
fb.rotation.x = -Math.PI / 2;
fb.position.y = -0.002;
S.add(fb);

const W = new THREE.MeshPhysicalMaterial({
  color: 0xffffff,
  roughness: 0.26,
  clearcoat: 1,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.1,
});
const D = new THREE.MeshPhysicalMaterial({
  color: 0x101216,
  roughness: 0.35,
  metalness: 0.5,
  clearcoat: 0.6,
});
const G = new THREE.MeshStandardMaterial({ color: 0xcfd4db, roughness: 0.3, metalness: 0.85 });
const V = new THREE.MeshPhysicalMaterial({
  color: 0x050607,
  roughness: 0.04,
  metalness: 0.9,
  clearcoat: 1,
});
const E = new THREE.MeshBasicMaterial({ color: 0x39ff88 });
const EH = new THREE.MeshBasicMaterial({
  color: 0x39ff88,
  transparent: true,
  opacity: 0.22,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const sph = new THREE.SphereGeometry(1, 48, 32),
  cyl = new THREE.CylinderGeometry(1, 1, 1, 40),
  cone = new THREE.CylinderGeometry(1, 0.8, 1, 40),
  tor = new THREE.TorusGeometry(1, 0.2, 16, 48);
function M(geo, mat, p, sc, par) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(...p);
  m.scale.set(...sc);
  m.castShadow = mat !== EH;
  (par || robot).add(m);
  return m;
}
const robot = new THREE.Group();
robot.scale.setScalar(1.15);
S.add(robot);
// pelvis, abdomen, torso
M(sph, W, [0, 0.98, 0], [0.5, 0.28, 0.37]);
for (const y of [1.14, 1.22, 1.3]) M(cyl, D, [0, y, 0], [0.3, 0.03, 0.23]);
M(sph, W, [0, 1.75, 0], [0.62, 0.7, 0.46]);
M(sph, D, [0, 1.95, 0.36], [0.34, 0.26, 0.12]);
M(sph, E, [0, 1.95, 0.485], [0.05, 0.05, 0.02]);
M(tor, G, [0, 2.38, 0], [0.2, 0.2, 0.2]).rotation.x = Math.PI / 2;
M(cyl, D, [0, 2.46, 0], [0.11, 0.08, 0.11]);
// legs
for (const s of [-1, 1]) {
  M(sph, D, [s * 0.27, 0.9, 0], [0.17, 0.17, 0.17]);
  M(cone, W, [s * 0.27, 0.66, 0], [0.16, 0.24, 0.16]);
  M(sph, D, [s * 0.27, 0.42, 0], [0.14, 0.14, 0.14]);
  M(cone, W, [s * 0.27, 0.26, 0], [0.14, 0.16, 0.14]);
  M(cyl, G, [s * 0.27, 0.17, 0], [0.145, 0.02, 0.145]);
  M(sph, W, [s * 0.27, 0.09, 0.1], [0.22, 0.11, 0.38]);
}
// head
const head = new THREE.Group();
head.position.y = 2.8;
robot.add(head);
M(sph, W, [0, 0, 0], [0.46, 0.4, 0.42], head);
M(sph, V, [0, 0, 0.27], [0.4, 0.23, 0.2], head);
for (const s of [-1, 1]) {
  M(sph, E, [s * 0.15, 0.02, 0.455], [0.055, 0.075, 0.02], head);
  M(sph, EH, [s * 0.15, 0.02, 0.45], [0.1, 0.12, 0.04], head);
  M(cyl, D, [s * 0.47, 0, 0], [0.12, 0.06, 0.12], head).rotation.z = Math.PI / 2;
  M(cyl, G, [s * 0.5, 0, 0], [0.07, 0.05, 0.07], head).rotation.z = Math.PI / 2;
}
// arms
const bm = new THREE.MeshBasicMaterial({
  color: 0x39ff88,
  transparent: true,
  opacity: 0.07,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const arms = {};
for (const s of [-1, 1]) {
  const sh = new THREE.Group();
  sh.position.set(s * 0.82, 2.05, 0);
  sh.rotation.order = "YXZ";
  robot.add(sh);
  M(sph, D, [0, 0, 0], [0.17, 0.17, 0.17], sh);
  M(sph, W, [s * 0.04, 0.03, 0], [0.2, 0.19, 0.2], sh);
  M(cone, W, [0, -0.3, 0], [0.1, 0.3, 0.1], sh);
  M(cyl, G, [0, -0.5, 0], [0.105, 0.012, 0.105], sh);
  const el = new THREE.Group();
  el.position.y = -0.6;
  sh.add(el);
  M(sph, D, [0, 0, 0], [0.115, 0.115, 0.115], el);
  M(cone, W, [0, -0.3, 0], [0.095, 0.3, 0.095], el);
  M(cyl, G, [0, -0.57, 0], [0.085, 0.02, 0.085], el);
  const hd = new THREE.Group();
  hd.position.y = -0.64;
  el.add(hd);
  M(sph, W, [0, -0.1, 0], [0.13, 0.15, 0.05], hd);
  M(tor, E, [0, -0.1, 0.04], [0.09, 0.09, 0.09], hd).scale.z = 0.05;
  M(cyl, bm, [0, -0.1, 0.3], [0.09, 0.3, 0.09], hd).rotation.x = Math.PI / 2;
  for (let k = -1.5; k <= 1.5; k++) {
    const f = new THREE.Group();
    f.position.set(k * 0.07, -0.22, 0.01);
    f.rotation.x = -0.3;
    hd.add(f);
    M(cyl, W, [0, -0.07, 0], [0.026, 0.07, 0.026], f);
    const j = new THREE.Group();
    j.position.y = -0.14;
    j.rotation.x = -0.5;
    f.add(j);
    M(cyl, W, [0, -0.06, 0], [0.022, 0.06, 0.022], j);
    M(sph, W, [0, -0.12, 0], [0.024, 0.024, 0.024], j);
  }
  const th = new THREE.Group();
  th.position.set(-s * 0.12, -0.05, 0);
  th.rotation.z = -s * 0.7;
  hd.add(th);
  M(cyl, W, [0, -0.08, 0], [0.03, 0.08, 0.03], th);
  M(sph, W, [0, -0.16, 0], [0.03, 0.03, 0.03], th);
  // display
  const dg = new THREE.Group();
  S.add(dg);
  const bez = new THREE.Mesh(new THREE.BoxGeometry(2.56, 1.72, 0.07), D);
  bez.castShadow = true;
  dg.add(bez);
  const c = document.createElement("canvas");
  c.width = TW;
  c.height = TH;
  const tex = new THREE.CanvasTexture(c);
  tex.encoding = THREE.sRGBEncoding;
  const scr = new THREE.Mesh(
    new THREE.PlaneGeometry(2.44, 1.6),
    new THREE.MeshBasicMaterial({ map: tex }),
  );
  scr.position.z = 0.04;
  dg.add(scr);
  arms[s] = { sh, el, hd, dg, scr, ctx: c.getContext("2d"), tex, ext: 0, tgt: 0, i: -1, flick: 0 };
}
function paint(a) {
  const g = a.ctx;
  g.fillStyle = "#05070a";
  g.fillRect(0, 0, TW, TH);
  if (a.flick > 0) {
    const k = a.flick;
    if (Math.random() > k * 0.7) g.drawImage(CACHE[a.i], (Math.random() - 0.5) * 60 * k, 0);
    else
      for (let n = 0; n < 260; n++) {
        const v = (Math.random() * 255) | 0;
        g.fillStyle = `rgb(${v},${v},${v})`;
        g.fillRect(Math.random() * TW, Math.random() * TH, 48, 6);
      }
    g.fillStyle = "rgba(57,255,136,.35)";
    g.fillRect(0, Math.random() * TH, TW, 12 + Math.random() * 40);
  } else g.drawImage(CACHE[a.i], 0, 0);
  g.fillStyle = "rgba(0,0,0,.1)";
  for (let y = 0; y < TH; y += 6) g.fillRect(0, y, TW, 2);
  a.tex.needsUpdate = true;
  a.done = a.flick > 0 ? -1 : a.i;
}

// ===== Scroll / state =====
const N = WORKS.length,
  SEC = N + 2;
const cap = document.getElementById("cap"),
  hero = document.getElementById("hero"),
  sc = document.getElementById("sc"),
  dots = document.getElementById("dots");
for (let i = 0; i < SEC; i++) dots.appendChild(document.createElement("i"));
let idx = -1;
function setIdx(n) {
  if (n === idx) return;
  idx = n;
  const p = n - 1;
  [...dots.children].forEach((d, i) => d.classList.toggle("a", i === n));
  hero.style.opacity = sc.style.opacity = n === 0 ? 1 : 0;
  for (const s of [-1, 1]) arms[s].tgt = 0;
  cap.classList.add("o");
  setTimeout(() => {
    const q = cap.children;
    if (p >= 0 && p < N) {
      q[0].textContent = String(p + 1).padStart(2, "0") + " / " + String(N).padStart(2, "0");
      q[1].textContent = WORKS[p].t;
      q[2].textContent = "Tap or click the display.";
      cap.classList.remove("o");
    } else if (p >= N) {
      q[0].textContent = "Contact";
      q[1].textContent = "Arctium Design";
      q[2].textContent = "info@arctiumdesign.de";
      cap.classList.remove("o");
    }
  }, 300);
  if (p >= 0 && p < N) {
    const s = p % 2 === 0 ? 1 : -1,
      a = arms[s];
    a.tgt = 1;
    a.i = p;
    a.flick = 1.2;
  }
  if (p >= N) {
    arms[-1].tgt = arms[1].tgt = 0.3;
  }
}
addEventListener(
  "scroll",
  () => setIdx(Math.max(0, Math.min(SEC - 1, Math.round(scrollY / innerHeight)))),
  { passive: true },
);
const fx = document.getElementById("fx"),
  fg = fx.getContext("2d");
function size() {
  const w = innerWidth,
    h = innerHeight,
    dpr = Math.min(devicePixelRatio, 2);
  R.setSize(w, h, false);
  fx.width = w * dpr;
  fx.height = h * dpr;
  fg.setTransform(dpr, 0, 0, dpr, 0, 0);
  cam.aspect = w / h;
  cam.position.set(0, 2.3, Math.min(22, Math.max(6.5, 1.4 + 3.5 / (Math.tan(0.1527) * (w / h)))));
  cam.lookAt(0, 1.85, 0);
  cam.updateProjectionMatrix();
  cam.updateMatrixWorld();
}
addEventListener("resize", size);
size();

// ===== Invisible barrier: pixel squares =====
const PX = [];
let mx = -999,
  my = -999,
  pmx = -999,
  pmy = -999;
const pr = (x, y, z) => {
  const v = new THREE.Vector3(x, y, z).project(cam);
  return [(v.x * 0.5 + 0.5) * innerWidth, (-v.y * 0.5 + 0.5) * innerHeight];
};
const gs = () => Math.random() + Math.random() + Math.random() - 1.5;
const COL = ["#15171b", "#15171b", "#8a929c", "#2bd66f"];
function shapes() {
  const c = pr(0, 2.1, 0),
    r = pr(1.45, 2.1, 0),
    t = pr(0, 4.35, 0),
    out = [{ e: 1, cx: c[0], cy: c[1], rx: Math.abs(r[0] - c[0]), ry: Math.abs(c[1] - t[1]) }];
  for (const s of [-1, 1]) {
    const a = arms[s];
    if (a.dg.visible && a.ext > 0.6) {
      const p = a.dg.position,
        u = pr(p.x - 1.45, p.y + 1, p.z),
        l = pr(p.x + 1.45, p.y - 1, p.z);
      out.push({
        cx: (u[0] + l[0]) / 2,
        cy: (u[1] + l[1]) / 2,
        hw: Math.abs(l[0] - u[0]) / 2,
        hh: Math.abs(l[1] - u[1]) / 2,
      });
    }
  }
  return out;
}
function sdf(sh, x, y) {
  let mn = 1e9;
  for (const s of sh) {
    let d;
    if (s.e) {
      const dx = x - s.cx,
        dy = y - s.cy,
        k = Math.hypot(dx / s.rx, dy / s.ry) || 1e-6,
        g = Math.hypot(dx / (s.rx * s.rx), dy / (s.ry * s.ry)) / k;
      d = (k - 1) / (g || 1e-6);
    } else {
      const qx = Math.abs(x - s.cx) - s.hw,
        qy = Math.abs(y - s.cy) - s.hh;
      d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0);
    }
    if (d < mn) mn = d;
  }
  return mn;
}
function burst(sh, x, y, d, spread, n) {
  const e = 1.5,
    gx = sdf(sh, x + e, y) - sdf(sh, x - e, y),
    gy = sdf(sh, x, y + e) - sdf(sh, x, y - e),
    gl = Math.hypot(gx, gy) || 1,
    nx = gx / gl,
    ny = gy / gl;
  const bx = x - nx * d,
    by = y - ny * d;
  for (let i = 0; i < n; i++) {
    const tj = gs() * spread,
      o = Math.random() < 0.74 ? Math.abs(gs()) * 55 : -Math.abs(gs()) * 18;
    const px = bx + -ny * tj + nx * o,
      py = by + nx * tj + ny * o,
      sz = Math.random() < 0.7 ? 6 : Math.random() < 0.7 ? 12 : 18,
      life = 0.5 + Math.random() * 1.1;
    PX.push({
      x: Math.round(px / 6) * 6,
      y: Math.round(py / 6) * 6,
      s: sz,
      l: life,
      m: life,
      c: COL[(Math.random() * 4) | 0],
      o: Math.random() < 0.25,
    });
  }
  if (PX.length > 1200) PX.splice(0, PX.length - 1200);
}
addEventListener("pointermove", (e) => {
  pmx = mx;
  pmy = my;
  mx = e.clientX;
  my = e.clientY;
  if (pmx < -900 || document.getElementById("m").classList.contains("on")) return;
  const sp = Math.hypot(mx - pmx, my - pmy);
  if (sp < 0.5) return;
  const sh = shapes(),
    steps = Math.min(60, Math.ceil(sp / 8));
  let prev = sdf(sh, pmx, pmy);
  for (let i = 1; i <= steps; i++) {
    const x = pmx + ((mx - pmx) * i) / steps,
      y = pmy + ((my - pmy) * i) / steps,
      d = sdf(sh, x, y);
    if (prev < 0 !== d < 0) burst(sh, x, y, d, 70, 14);
    else if (d > -30 && d < 100) {
      const w = d >= 0 ? 1 - d / 100 : 1 + d / 30;
      if (Math.random() < w * 0.85)
        burst(sh, x, y, d, 45, 1 + (w > 0.55 ? 1 : 0) + (sp > 40 ? 1 : 0));
    }
    prev = d;
  }
});
function fxDraw(dt) {
  fg.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = PX.length - 1; i >= 0; i--) {
    const p = PX[i];
    p.l -= dt;
    if (p.l <= 0) {
      PX.splice(i, 1);
      continue;
    }
    const k = p.l / p.m;
    fg.globalAlpha = k * k * 0.85;
    if (p.o) {
      fg.strokeStyle = p.c;
      fg.lineWidth = 1;
      fg.strokeRect(p.x + 0.5, p.y + 0.5, p.s - 1, p.s - 1);
    } else {
      fg.fillStyle = p.c;
      fg.fillRect(p.x, p.y, p.s, p.s);
    }
  }
  fg.globalAlpha = 1;
}

const clock = new THREE.Clock(),
  L = (a, b, k) => a + (b - a) * k;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.05),
    t = clock.elapsedTime;
  let side = 0;
  const v = new THREE.Vector3();
  for (const s of [-1, 1]) {
    const a = arms[s];
    a.ext = L(a.ext, a.tgt, 0.06);
    a.sh.rotation.x = -1.2 * a.ext + Math.sin(t * 1.4 + s) * 0.02 * a.ext;
    a.sh.rotation.y = s * 0.8 * a.ext;
    a.el.rotation.x = -0.5 * a.ext;
    if (a.tgt === 1) side = s;
    a.dg.visible = a.ext > 0.4;
    a.dg.scale.setScalar(Math.max(0.001, Math.min(1, (a.ext - 0.35) / 0.65)));
    if (a.dg.visible) {
      robot.updateMatrixWorld(true);
      a.hd.getWorldPosition(v);
      a.dg.position.set(v.x + s * 0.25, v.y + 0.95 + Math.sin(t * 1.8) * 0.03, v.z + 0.1);
      a.dg.lookAt(cam.position.x * 0.3, cam.position.y, cam.position.z);
      if (a.flick > 0) a.flick -= dt;
      if (a.i >= 0 && a.ext > 0.5 && (a.flick > 0 || a.done !== a.i)) paint(a);
    }
  }
  head.rotation.y = L(head.rotation.y, side * 0.5, 0.07);
  head.rotation.x = L(head.rotation.x, side ? 0.08 : 0, 0.07);
  robot.rotation.y = L(robot.rotation.y, side * 0.14, 0.05);
  robot.position.y = Math.sin(t * 1.2) * 0.02;
  R.render(S, cam);
  fxDraw(dt);
}
loop();

// ===== Click on display =====
const ray = new THREE.Raycaster(),
  mv = new THREE.Vector2(),
  m = document.getElementById("m");
function pick(e) {
  mv.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
  ray.setFromCamera(mv, cam);
  for (const s of [-1, 1]) {
    const a = arms[s];
    if (a.tgt === 1 && a.ext > 0.85 && ray.intersectObject(a.scr).length) return a;
  }
  return null;
}
cv.addEventListener("pointermove", (e) => {
  cv.style.cursor = pick(e) ? "pointer" : "default";
});
cv.addEventListener("click", (e) => {
  const a = pick(e);
  if (!a) return;
  const mc = document.getElementById("mc"),
    im = IMGS[a.i];
  mc.height =
    im && im.naturalWidth
      ? Math.min(1000, Math.round((1200 * im.naturalHeight) / im.naturalWidth))
      : 800;
  drawArt(mc, 1200, mc.height, a.i);
  m.querySelector("h3").textContent = WORKS[a.i].t;
  m.querySelector("p").textContent = WORKS[a.i].d;
  m.classList.add("on");
});
const close = () => m.classList.remove("on");
document.getElementById("x").onclick = close;
m.addEventListener("click", (e) => {
  if (e.target === m) close();
});
addEventListener("keydown", (e) => {
  if (e.key === "Escape") close();
});
setIdx(0);
