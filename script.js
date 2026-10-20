// ===== WORK SAMPLES: add your own img (img: "img/file.jpg") and edit the texts =====
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
const U = (p) => (window.DATA && window.DATA[p]) || p;
const PAL = [
  ["#101820", "#2b4a6b", "#7fd8ff"],
  ["#ff7a59", "#ffd166", "#1a1a1a"],
  ["#f4f1ea", "#d6d0c4", "#d62828"],
  ["#1b1b1f", "#3a3a44", "#c8ff3d"],
  ["#ffffff", "#e4e7ec", "#5b5bd6"],
  ["#0f3d3e", "#1f7a6d", "#f2e9d0"],
];
const TW = 1280,
  TH = 840;
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
  g.fillStyle = "#fff";
  g.textAlign = "left";
  g.font = `600 ${20 * s}px Helvetica,Arial`;
  g.fillText(WORKS[i].t.toUpperCase(), 28 * s, h - 26 * s);
}
const IMGS = WORKS.map((w, n) => {
  if (!w.img) return null;
  const i = new Image();
  i.onload = () => {
    try {
      drawArt(CACHE[n], TW, TH, n);
      D.done = -1;
    } catch (e) {}
  };
  i.src = U(w.img);
  return i;
});
const CACHE = WORKS.map((_, i) => {
  const c = document.createElement("canvas");
  c.width = TW;
  c.height = TH;
  drawArt(c, TW, TH, i);
  return c;
});

// ===== Video frames (reach: 0..R, hold loop: R+1..) =====
const W0 = 1280,
  H0 = 720,
  FPS = 24,
  R = 24,
  HN = 20,
  NF = R + 1 + HN;
const ANCH = [
  [856, 507],
  [859, 505],
  [864, 502],
  [869, 500],
  [875, 497],
  [881, 495],
  [886, 491],
  [893, 486],
  [898, 480],
  [903, 474],
  [1032, 554],
  [1110, 558],
  [1170, 550],
  [1183, 510],
  [1190, 469],
  [1195, 428],
  [1196, 393],
  [1196, 362],
  [1196, 334],
  [1195, 311],
  [1195, 293],
  [1195, 280],
  [1196, 270],
  [1198, 264],
  [1201, 261],
  [1207, 260],
  [1212, 263],
  [1218, 266],
  [1222, 271],
  [1226, 273],
  [1230, 275],
  [1233, 278],
  [1237, 280],
  [1240, 282],
  [1242, 284],
  [1244, 285],
  [1246, 284],
  [1246, 286],
  [1247, 286],
  [1248, 285],
  [1248, 286],
  [1249, 285],
  [1249, 286],
  [1250, 285],
  [1250, 286],
];
const HA = [0, 1].map((k) => ANCH.slice(R + 1).reduce((t, p) => t + p[k], 0) / HN);
const fr = [];
let loaded = 0;
for (let i = 0; i < NF; i++) {
  const im = new Image();
  im.onload = () => loaded++;
  im.src = U("frames/f" + String(i).padStart(3, "0") + ".jpg");
  fr.push(im);
}

const cv = document.getElementById("gl"),
  g = cv.getContext("2d");
const fx = document.getElementById("fx"),
  fg = fx.getContext("2d");
const disp = document.getElementById("disp"),
  dctx = disp.querySelector("canvas").getContext("2d");
const D = { ctx: dctx, i: -1, flick: 0, done: -1 };
let vw, vh, dW, dH, offX, offY;
function size() {
  vw = innerWidth;
  vh = innerHeight;
  const dpr = Math.min(devicePixelRatio, 2);
  for (const c of [cv, fx]) {
    c.width = vw * dpr;
    c.height = vh * dpr;
  }
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  fg.setTransform(dpr, 0, 0, dpr, 0, 0);
}
addEventListener("resize", size);
size();

// ===== Scroll / state =====
const N = WORKS.length,
  SEC = N + 2;
const cap = document.getElementById("cap"),
  hero = document.getElementById("hero"),
  sc = document.getElementById("sc"),
  dots = document.getElementById("dots");
for (let i = 0; i < SEC; i++) dots.appendChild(document.createElement("i"));
let idx = -1,
  side = -1,
  tSide = -1,
  tExt = false,
  tProj = -1,
  pos = 0,
  holdT = 0,
  show = 0,
  dx = 0,
  dy = 0,
  dw = 300,
  dh = 200;
function setIdx(n) {
  if (n === idx) return;
  idx = n;
  const p = n - 1;
  [...dots.children].forEach((d, i) => d.classList.toggle("a", i === n));
  hero.style.opacity = sc.style.opacity = n === 0 ? 1 : 0;
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
    tExt = true;
    tProj = p;
    tSide = -1;
  } else {
    tExt = false;
  }
}
addEventListener("scroll", () => setIdx(Math.max(0, Math.min(SEC - 1, Math.round(scrollY / innerHeight)))), {
  passive: true,
});

const toScreen = (u, v) => {
  const xs = offX + u * dW;
  return [side < 0 ? vw - xs : xs, offY + v * dH];
};

// ===== Display painting (flicker) =====
function paint(a) {
  const c = a.ctx;
  c.fillStyle = "#05070a";
  c.fillRect(0, 0, TW, TH);
  if (a.flick > 0) {
    const k = a.flick;
    if (Math.random() > k * 0.7) c.drawImage(CACHE[a.i], (Math.random() - 0.5) * 60 * k, 0);
    else
      for (let n = 0; n < 260; n++) {
        const v = (Math.random() * 255) | 0;
        c.fillStyle = `rgb(${v},${v},${v})`;
        c.fillRect(Math.random() * TW, Math.random() * TH, 48, 6);
      }
    c.fillStyle = "rgba(57,255,136,.35)";
    c.fillRect(0, Math.random() * TH, TW, 12 + Math.random() * 40);
  } else c.drawImage(CACHE[a.i], 0, 0);
  c.fillStyle = "rgba(0,0,0,.1)";
  for (let y = 0; y < TH; y += 6) c.fillRect(0, y, TW, 2);
  a.done = a.flick > 0 ? -1 : a.i;
}

// ===== Invisible barrier: pixel squares =====
const PX = [];
let mx = -999,
  my = -999,
  pmx = -999,
  pmy = -999;
const gs = () => Math.random() + Math.random() + Math.random() - 1.5;
const COL = ["#15171b", "#15171b", "#8a929c", "#2bd66f"];
function shapes() {
  const c = toScreen(0.49, 0.52),
    out = [{ e: 1, cx: c[0], cy: c[1], rx: 0.2 * dW, ry: 0.64 * dH }];
  if (pos > R * 0.4) {
    const a = toScreen(0.79, 0.5);
    out.push({ cx: a[0], cy: a[1], hw: 0.19 * dW, hh: 0.19 * dH });
  }
  if (show > 0.5) out.push({ cx: dx, cy: dy, hw: dw / 2 + 14, hh: dh / 2 + 14 });
  return out;
}
function sdf(sh, x, y) {
  let mn = 1e9;
  for (const s of sh) {
    let d;
    if (s.e) {
      const ddx = x - s.cx,
        ddy = y - s.cy,
        k = Math.hypot(ddx / s.rx, ddy / s.ry) || 1e-6,
        gg = Math.hypot(ddx / (s.rx * s.rx), ddy / (s.ry * s.ry)) / k;
      d = (k - 1) / (gg || 1e-6);
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
const modal = document.getElementById("m");
addEventListener("pointermove", (e) => {
  pmx = mx;
  pmy = my;
  mx = e.clientX;
  my = e.clientY;
  if (pmx < -900 || modal.classList.contains("on") || !dW) return;
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
      if (Math.random() < w * 0.85) burst(sh, x, y, d, 45, 1 + (w > 0.55 ? 1 : 0) + (sp > 40 ? 1 : 0));
    }
    prev = d;
  }
});
function fxDraw(dt) {
  fg.clearRect(0, 0, vw, vh);
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

// ===== Main loop =====
let last = performance.now();
const ld = document.getElementById("ld");
function loop(now) {
  requestAnimationFrame(loop);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (loaded < NF) {
    ld.textContent = "Loading " + Math.round((loaded / NF) * 100) + "%";
    return;
  }
  ld.style.opacity = 0;
  // animation state: retract -> flip -> reach -> hold
  if (pos > 0 && (!tExt || side !== tSide)) pos = Math.max(0, pos - dt * FPS * 1.15);
  else if (tExt && side === tSide) pos = Math.min(R, pos + dt * FPS);
  if (pos === 0 && tExt) side = tSide;
  const holding = tExt && side === tSide && pos >= R - 0.01;
  let fi = Math.floor(pos);
  if (holding) {
    holdT += dt;
    const k = (holdT * FPS * 0.8) % (2 * (HN - 1));
    fi = R + 1 + Math.min(HN - 1, Math.round(k < HN ? k : 2 * (HN - 1) - k));
  } else holdT = 0;
  // draw video frame (cover, mirrored for the left hand)
  const t = now / 1000,
    a = vw / vh,
    s = (a >= 1.2 ? Math.max(vw / W0, vh / H0) : (vw * 1.95) / W0) * (1 + 0.004 * Math.sin(t * 1.2));
  dW = W0 * s;
  dH = H0 * s;
  const cu = Math.min(Math.max(0.93 - vw / (2 * dW), 0.5), 1 - vw / (2 * dW));
  offX = vw / 2 - cu * dW;
  offY = dH >= vh ? (vh - dH) / 2 : vh - dH;
  const im = fr[fi];
  g.save();
  if (side < 0) {
    g.translate(vw, 0);
    g.scale(-1, 1);
  }
  g.drawImage(im, offX, offY, dW, dH);
  if (offY > 0) g.drawImage(im, 0, 0, W0, 2, offX, 0, dW, offY + 1);
  g.restore();
  // display above the palm
  show += ((holding ? 1 : 0) - show) * 0.12;
  if (holding && D.i !== tProj) {
    D.i = tProj;
    D.flick = 1.2;
    D.done = -1;
  }
  dw = Math.min(520, Math.max(230, dW * 0.27));
  dh = dw / (TW / TH);
  const an = holding ? HA : ANCH[fi],
    P = toScreen(an[0] / W0, an[1] / H0),
    dir = side > 0 ? -1 : 1;
  let tx = P[0] + dir * 110 * s,
    ty = P[1] + 34 * s - dh / 2;
  tx = Math.min(Math.max(tx, dw / 2 + 20), vw - dw / 2 - 36);
  ty = Math.max(ty, 76 + dh / 2);
  if (show < 0.05) {
    dx = tx;
    dy = ty;
  } else {
    dx += (tx - dx) * 0.2;
    dy += (ty - dy) * 0.2;
  }
  disp.style.width = dw + "px";
  disp.style.left = dx + "px";
  disp.style.top = dy + "px";
  disp.style.opacity = show;
  disp.style.pointerEvents = show > 0.85 ? "auto" : "none";
  disp.style.transform = `translate(-50%,-50%) perspective(900px) rotateY(${side > 0 ? -12 : 12}deg) rotateX(3deg) scale(${0.85 + 0.15 * show})`;
  if (show > 0.02 && D.i >= 0) {
    if (D.flick > 0) D.flick -= dt;
    if (D.flick > 0 || D.done !== D.i) paint(D);
  }
  fxDraw(dt);
}
requestAnimationFrame(loop);

// ===== Click on display =====
disp.addEventListener("click", () => {
  if (D.i < 0) return;
  const mc = document.getElementById("mc"),
    im = IMGS[D.i];
  mc.height =
    im && im.naturalWidth ? Math.min(1000, Math.round((1200 * im.naturalHeight) / im.naturalWidth)) : 800;
  drawArt(mc, 1200, mc.height, D.i);
  modal.querySelector("h3").textContent = WORKS[D.i].t;
  modal.querySelector("p").textContent = WORKS[D.i].d;
  modal.classList.add("on");
});
const close = () => modal.classList.remove("on");
document.getElementById("x").onclick = close;
modal.addEventListener("click", (e) => {
  if (e.target === modal) close();
});
addEventListener("keydown", (e) => {
  if (e.key === "Escape") close();
});
setIdx(0);
