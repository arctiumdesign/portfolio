(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const I18N = window.I18N || { en: {} };

  /* ------------------------------------------------------------
     Language (EN / DE)
     Priority: ?lang=de in the URL, then saved choice, then browser.
     ------------------------------------------------------------ */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } }
  };
  const fromUrl = new URLSearchParams(location.search).get("lang");
  let lang = [fromUrl, store.get("jk-lang"), (navigator.language || "en").slice(0, 2)]
    .find((l) => l === "en" || l === "de") || "en";

  const t = (key) => (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;

  let openProject = null;
  const tip = $(".tip");
  let activeTool = null;

  const applyLang = (next) => {
    lang = next;
    document.documentElement.lang = lang;
    store.set("jk-lang", lang);

    $$("[data-i18n]").forEach((el) => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach((el) => { el.innerHTML = t(el.dataset.i18nHtml); });
    $$("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
      });
    });

    document.title = t("meta.title");
    const meta = $('meta[name="description"]');
    if (meta) meta.setAttribute("content", t("meta.desc"));

    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));

    if (tip) tip.textContent = activeTool ? t(activeTool.dataset.tipKey) : t("tools.default");
    if (openProject) renderProject(openProject);
    paintFlip();
    setupWork();
    update();
  };

  $$("[data-lang]").forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));

  /* ------------------------------------------------------------
     Light source: follows the pointer softly
     ------------------------------------------------------------ */
  const root = document.documentElement;
  let tx = 6, ty = -4, cx = 6, cy = -4;
  if (!reduce.matches) {
    window.addEventListener("pointermove", (e) => {
      tx = (e.clientX / window.innerWidth) * 60;
      ty = -4 + (e.clientY / window.innerHeight) * 24;
    }, { passive: true });
    const glide = () => {
      cx += (tx - cx) * 0.05;
      cy += (ty - cy) * 0.05;
      root.style.setProperty("--lx", cx.toFixed(2) + "%");
      root.style.setProperty("--ly", cy.toFixed(2) + "%");
      requestAnimationFrame(glide);
    };
    requestAnimationFrame(glide);
  }

  /* ------------------------------------------------------------
     Photo: appears when hovering the name (img/jk-bild.webp).
     Until the file exists, the initials are shown instead.
     ------------------------------------------------------------ */
  const brand = $(".brand");
  const photoImg = $(".photo img");
  if (photoImg && photoImg.dataset.src) {
    const probe = new Image();
    probe.onload = () => {
      photoImg.src = photoImg.dataset.src;
      photoImg.alt = "Jennifer Klette";
      photoImg.hidden = false;
    };
    probe.src = photoImg.dataset.src;
  }
  let photoTimer;
  if (brand) brand.addEventListener("click", () => {
    brand.classList.add("show");
    clearTimeout(photoTimer);
    photoTimer = setTimeout(() => brand.classList.remove("show"), 2400);
  });

  /* ------------------------------------------------------------
     Scroll-linked pieces, one rAF loop
     ------------------------------------------------------------ */
  const hero = $(".hero");
  const path = $(".path");
  const stops = $$(".stop");
  const work = $(".work");
  const rail = $("[data-rail]");
  const cards = $$(".card", rail || document.createElement("div"));

  let pinned = false;
  let railDist = 0;
  let cardStep = 320;

  function setupWork() {
    if (!work || !rail) return;
    if (cards.length > 1) {
      cardStep = Math.max(1, cards[1].offsetLeft - cards[0].offsetLeft);
    } else if (cards.length === 1) {
      cardStep = cards[0].offsetWidth;
    }
    const wide = window.innerWidth >= 900 && !reduce.matches;
    if (wide) {
      work.classList.add("is-pinned");
      pinned = true;
      rail.scrollLeft = 0;
      railDist = Math.max(0, rail.scrollWidth - window.innerWidth + 80);
      // 0.8 keeps the section from becoming endlessly tall with many cards
      work.style.height = Math.round(railDist * 0.8 + window.innerHeight) + "px";
    } else {
      work.classList.remove("is-pinned");
      work.style.height = "";
      rail.style.removeProperty("--x");
      pinned = false;
    }
  }

  /* work navigation under the rail */
  const workFill = $("[data-work-fill]");
  const workCount = $("[data-work-count]");
  const workBtns = $$("[data-work]");

  function workProgress() {
    if (!rail) return 0;
    if (pinned) {
      const range = work.offsetHeight - window.innerHeight;
      return clamp(-work.getBoundingClientRect().top / Math.max(1, range));
    }
    return clamp(rail.scrollLeft / Math.max(1, rail.scrollWidth - rail.clientWidth));
  }

  function paintWork(p) {
    if (!rail || !cards.length) return;
    const travel = pinned ? railDist : rail.scrollWidth - rail.clientWidth;
    const index = clamp(Math.round((p * travel) / cardStep), 0, cards.length - 1);
    if (workFill) {
      const view = clamp((pinned ? window.innerWidth : rail.clientWidth) / Math.max(1, rail.scrollWidth), 0.08, 1);
      workFill.style.width = (view * 100).toFixed(2) + "%";
      workFill.style.marginLeft = (p * (1 - view) * 100).toFixed(2) + "%";
    }
    if (workCount) workCount.textContent = (index + 1) + " / " + cards.length;
    workBtns.forEach((b) => {
      const dir = Number(b.dataset.work);
      b.disabled = dir < 0 ? p <= 0.001 : p >= 0.999;
    });
  }

  workBtns.forEach((b) => b.addEventListener("click", () => {
    if (!rail || !cards.length) return;
    const dir = Number(b.dataset.work);
    if (pinned) {
      const travel = Math.max(1, railDist);
      const p = workProgress();
      const index = clamp(Math.round((p * travel) / cardStep) + dir, 0, cards.length - 1);
      const range = work.offsetHeight - window.innerHeight;
      const target = work.offsetTop + clamp((index * cardStep) / travel) * range;
      window.scrollTo({ top: target, behavior: reduce.matches ? "auto" : "smooth" });
    } else {
      rail.scrollBy({ left: dir * cardStep, behavior: reduce.matches ? "auto" : "smooth" });
    }
  }));

  if (rail) rail.addEventListener("scroll", () => { if (!pinned) paintWork(workProgress()); }, { passive: true });

  function update() {
    const vh = window.innerHeight;

    // header gets a solid backing once content scrolls underneath it
    const topBar = document.querySelector(".top");
    if (topBar) topBar.classList.toggle("is-scrolled", window.scrollY > 8);

    // hero: open the colour fan
    if (hero) {
      const total = hero.offsetHeight - vh;
      const p = clamp(window.scrollY / Math.max(1, total));
      hero.style.setProperty("--p", reduce.matches ? 0 : p.toFixed(4));
    }

    // journey: fill the line, light the stops
    if (path) {
      const r = path.getBoundingClientRect();
      const mid = vh * 0.55;
      path.style.setProperty("--prog", clamp((mid - r.top) / r.height).toFixed(4));
      stops.forEach((s) => s.classList.toggle("on", s.getBoundingClientRect().top < mid));
    }

    // work: horizontal travel while pinned
    if (pinned && rail) {
      const p = workProgress();
      rail.style.setProperty("--x", (-p * railDist).toFixed(1) + "px");
      paintWork(p);
    }
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", () => { setupWork(); update(); sizeBook(); });

  /* ------------------------------------------------------------
     Card images: the real file replaces the placeholder gradient
     once it is there. Missing files simply stay a colour field.
     ------------------------------------------------------------ */
  $$(".rail img[data-src]").forEach((img) => {
    const probe = new Image();
    probe.onload = () => {
      img.src = img.dataset.src;
      const name = img.closest(".card") && img.closest(".card").querySelector(".card-meta b");
      if (name) img.alt = name.textContent;
      img.hidden = false;
      setupWork();
      update();
    };
    probe.src = img.dataset.src;
  });

  /* ------------------------------------------------------------
     Numbers: count up once
     ------------------------------------------------------------ */
  const counters = $$("[data-count]");
  if (counters.length && "IntersectionObserver" in window && !reduce.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target;
        const end = Number(el.dataset.count);
        const suffix = el.dataset.suffix || "";
        const t0 = performance.now();
        const tick = (now) => {
          const k = clamp((now - t0) / 1400);
          el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))) + suffix;
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.6 });
    counters.forEach((c) => io.observe(c));
  }

  /* ------------------------------------------------------------
     Detail dialog. Texts live in i18n.js (keys p.<id>.*).
     ------------------------------------------------------------ */
  const dialog = $(".detail");
  const dTitle = $("[data-detail-title]");
  const dWhen = $("[data-detail-when]");
  const dText = $("[data-detail-text]");
  const dVisual = $("[data-detail-visual]");
  let lastCard = null;

  function renderProject(id) {
    if (!dTitle || !dWhen || !dText) return;
    dTitle.textContent = t(`p.${id}.title`);
    dWhen.textContent = t(`p.${id}.when`);
    dText.innerHTML = "";
    for (let i = 1; i < 6; i++) {
      const key = `p.${id}.t${i}`;
      if (!(I18N.en && I18N.en[key])) break;
      const p = document.createElement("p");
      p.textContent = t(key);
      dText.appendChild(p);
    }
  }

  $$("[data-open]").forEach((card) => {
    card.addEventListener("click", () => {
      lastCard = card;
      if (card.hasAttribute("data-flipbook")) { openFlip(); return; }
      if (!dialog) return;
      openProject = card.dataset.open;
      renderProject(openProject);

      const cover = $(".cover", card);
      dVisual.className = "detail-visual " + cover.className.replace("cover", "").trim();
      dVisual.innerHTML = "";
      const device = $(".device", cover);
      const img = $("img", cover);
      if (card.dataset.gallery) {
        const grid = document.createElement("div");
        grid.className = "gallery";
        card.dataset.gallery.split(",").forEach((src) => {
          const g = document.createElement("img");
          g.src = src.trim();
          g.alt = "";
          g.loading = "lazy";
          grid.appendChild(g);
        });
        dVisual.appendChild(grid);
      } else if (device) {
        const clone = device.cloneNode(true);
        dVisual.appendChild(clone);
        const v = $("video", clone);
        if (v) { v.muted = true; v.play().catch(() => {}); }
      } else if (img && !img.hidden) {
        const clone = document.createElement("img");
        clone.src = img.src;
        clone.alt = t(`p.${openProject}.title`);
        dVisual.appendChild(clone);
      }
      dialog.showModal();
    });
  });

  if (dialog) {
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener("close", () => {
      openProject = null;
      if (lastCard) lastCard.focus();
    });
  }

  /* ------------------------------------------------------------
     Flipbook — the SuitePad brochure.
     Pages: img/brochure/p-01.webp … p-19.webp
     Spreads follow the print layout: 1+2, 3+4, 5+6 … page 1 stays
     on the left, every sheet carries two pages (front and back).
     The page-turn sound is generated in the browser, so there is
     no audio file to ship. Volume: SOUND_LEVEL below.
     ------------------------------------------------------------ */
  const PAGES = 19;
  const RATIO = 1200 / 846;          // one page: width / height
  const SOUND_LEVEL = 0.22;
  const flipDlg = $(".flip");
  const bookEl = $("[data-book]");
  const dotsEl = $("[data-flip-dots]");
  const countEl = $("[data-flip-count]");
  const sndBtn = $("[data-sound]");

  const pageImgs = new Map();
  let sheets = [];
  let turn = 0;                      // sheets already flipped (0 … 9)
  let page = 1;                      // current page in single-page mode
  let single = false;
  let zTimer = 0;
  let soundOn = store.get("jk-sound") !== "off";
  if (sndBtn) sndBtn.setAttribute("aria-pressed", String(soundOn));

  /* page-turn sound: filtered noise, no audio file needed */
  let actx = null;
  function pageSound() {
    if (!soundOn) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      actx = actx || new AC();
      if (actx.state === "suspended") actx.resume();
      const dur = 0.4, n = Math.floor(actx.sampleRate * dur);
      const buf = actx.createBuffer(1, n, actx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < n; i++) {
        const k = i / n;
        d[i] = (Math.random() * 2 - 1) * Math.pow(1 - k, 2.2) * (0.3 + 0.7 * Math.sin(Math.PI * k));
      }
      const src = actx.createBufferSource(); src.buffer = buf;
      const bp = actx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 0.8;
      const now = actx.currentTime;
      bp.frequency.setValueAtTime(800, now);
      bp.frequency.exponentialRampToValueAtTime(3000, now + 0.16);
      bp.frequency.exponentialRampToValueAtTime(600, now + dur);
      const g = actx.createGain(); g.gain.value = SOUND_LEVEL;
      src.connect(bp); bp.connect(g); g.connect(actx.destination);
      src.start();
    } catch { /* no audio available */ }
  }

  if (sndBtn) sndBtn.addEventListener("click", () => {
    soundOn = !soundOn;
    sndBtn.setAttribute("aria-pressed", String(soundOn));
    store.set("jk-sound", soundOn ? "on" : "off");
    if (soundOn) pageSound();
  });

  const elm = (tag, cls) => { const e = document.createElement(tag); if (cls) e.className = cls; return e; };

  function pageImg(n) {
    const im = elm("img");
    im.alt = "";
    im.decoding = "async";
    pageImgs.set(n, im);
    return im;
  }

  function hydrate(centre) {
    for (let n = centre - 2; n <= centre + 4; n++) {
      const im = pageImgs.get(n);
      if (im && !im.getAttribute("src")) im.src = "img/brochure/p-" + String(n).padStart(2, "0") + ".webp";
    }
  }

  function sizeBook() {
    if (!bookEl || !flipDlg || !flipDlg.open) return;
    const stage = bookEl.parentElement;
    const cs = getComputedStyle(stage);
    const gap = parseFloat(cs.columnGap || cs.gap) || 0;
    const padX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    const padY = parseFloat(cs.paddingTop) + parseFloat(cs.paddingBottom);
    const bar = $(".flip-bar", flipDlg);
    const foot = $(".flip-foot", flipDlg);

    // measured against the viewport, not the stage: the stage only gets
    // its height once the book has one, which would be circular
    const chrome = (bar ? bar.offsetHeight : 0) + (foot ? foot.offsetHeight : 0) + padY + 6;
    const wantSingle = window.innerWidth < 760;
    let availW = Math.min(1480, window.innerWidth * 0.96) - padX - 4;
    // on phones the arrows sit on top of the page, so they cost no width
    if (!wantSingle) $$(".flip-arrow", stage).forEach((a) => { availW -= a.offsetWidth + gap; });
    const availH = window.innerHeight * 0.94 - chrome;

    if (wantSingle !== single) {
      page = single ? page : (turn === 0 ? 1 : 2 * turn + 1);
      turn = single ? Math.floor((page - 1) / 2) : turn;
      single = wantSingle;
      buildBook();
      paintFlip();
    }
    const cols = single ? 1 : 2;
    const pw = Math.max(120, Math.floor(Math.min(availW / cols, availH * RATIO)));
    bookEl.style.setProperty("--pw", pw + "px");
    bookEl.style.setProperty("--ph", Math.round(pw / RATIO) + "px");
    bookEl.classList.toggle("single", single);
  }

  function buildBook() {
    if (!bookEl) return;
    bookEl.innerHTML = "";
    pageImgs.clear();
    sheets = [];

    if (single) {
      const pg = elm("div", "pg page-fixed");
      pg.appendChild(pageImg(page));
      bookEl.appendChild(pg);
      return;
    }

    const fixed = elm("div", "pg page-fixed");
    fixed.appendChild(pageImg(1));
    bookEl.appendChild(fixed);

    for (let s = 0; s * 2 + 2 <= PAGES; s++) {
      const sh = elm("div", "sheet");
      const front = elm("div", "face f");
      front.appendChild(pageImg(s * 2 + 2));
      sh.appendChild(front);
      const backNo = s * 2 + 3;
      const back = elm("div", "face b");
      if (backNo <= PAGES) back.appendChild(pageImg(backNo));
      sh.appendChild(back);
      bookEl.appendChild(sh);
      sheets.push(sh);
    }
    layoutSheets();
  }

  function layoutSheets() {
    sheets.forEach((sh, s) => {
      const flipped = s < turn;
      sh.classList.toggle("flipped", flipped);
      sh.style.zIndex = String(flipped ? s + 1 : sheets.length * 2 - s);
    });
  }

  function paintFlip() {
    if (!flipDlg) return;
    const maxTurn = sheets.length || Math.floor((PAGES - 1) / 2);

    if (dotsEl && dotsEl.childElementCount !== maxTurn + 1) {
      dotsEl.innerHTML = "";
      for (let i = 0; i <= maxTurn; i++) {
        const b = elm("button");
        b.type = "button";
        b.dataset.goto = String(i);
        dotsEl.appendChild(b);
      }
    }
    if (dotsEl) $$("button", dotsEl).forEach((b, i) => b.setAttribute("aria-current", String(i === turn)));

    if (countEl) {
      if (single) {
        countEl.textContent = t("flip.page") + " " + page + " / " + PAGES;
      } else {
        const left = turn === 0 ? 1 : 2 * turn + 1;
        const right = turn * 2 + 2;
        countEl.textContent = (right <= PAGES ? left + "–" + right : String(left)) + " / " + PAGES;
      }
    }
    $$("[data-flip]").forEach((b) => {
      const dir = Number(b.dataset.flip);
      b.disabled = single
        ? (dir < 0 ? page <= 1 : page >= PAGES)
        : (dir < 0 ? turn <= 0 : turn >= maxTurn);
    });
    hydrate(single ? page : 2 * turn + 2);
  }

  function goFlip(dir) {
    if (single) {
      const next = clamp(page + dir, 1, PAGES);
      if (next === page) return;
      page = next;
      const im = $("img", bookEl);
      if (im) {
        im.style.opacity = "0";
        setTimeout(() => {
          im.src = "img/brochure/p-" + String(page).padStart(2, "0") + ".webp";
          im.style.opacity = "1";
        }, 140);
      }
      pageSound();
      paintFlip();
      return;
    }
    const maxTurn = sheets.length;
    const next = clamp(turn + dir, 0, maxTurn);
    if (next === turn) return;
    const moving = dir > 0 ? sheets[turn] : sheets[next];
    turn = next;
    layoutSheets();
    if (moving) {
      moving.style.zIndex = "999";
      clearTimeout(zTimer);
      zTimer = setTimeout(() => { moving.style.zIndex = ""; layoutSheets(); }, 820);
    }
    pageSound();
    paintFlip();
  }

  function gotoSpread(i) {
    if (single) {
      const target = clamp(i * 2 + 1, 1, PAGES);
      goFlip(target - page);
      return;
    }
    const target = clamp(i, 0, sheets.length);
    if (target === turn) return;
    turn = target;
    layoutSheets();
    pageSound();
    paintFlip();
  }

  function openFlip() {
    if (!flipDlg) return;
    single = window.innerWidth < 760;
    turn = 0;
    page = 1;
    buildBook();
    flipDlg.showModal();
    requestAnimationFrame(() => { sizeBook(); paintFlip(); });
  }

  if (flipDlg) {
    $$("[data-flip]").forEach((b) => b.addEventListener("click", () => goFlip(Number(b.dataset.flip))));
    if (dotsEl) dotsEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-goto]");
      if (b) gotoSpread(Number(b.dataset.goto));
    });
    const closeBtn = $("[data-flip-close]", flipDlg);
    if (closeBtn) closeBtn.addEventListener("click", () => flipDlg.close());
    flipDlg.addEventListener("click", (e) => { if (e.target === flipDlg) flipDlg.close(); });
    flipDlg.addEventListener("close", () => { if (lastCard) lastCard.focus(); });
    flipDlg.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goFlip(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goFlip(-1); }
    });
    if (bookEl) bookEl.addEventListener("click", (e) => {
      const r = bookEl.getBoundingClientRect();
      goFlip(single || e.clientX - r.left > r.width / 2 ? 1 : -1);
    });
  }

  /* ------------------------------------------------------------
     Toolkit tips
     ------------------------------------------------------------ */
  const toolButtons = $$(".tools button");
  const showTool = (b) => {
    toolButtons.forEach((x) => x.removeAttribute("aria-pressed"));
    b.setAttribute("aria-pressed", "true");
    activeTool = b;
    if (tip) tip.textContent = t(b.dataset.tipKey);
  };
  toolButtons.forEach((b) => {
    b.addEventListener("mouseenter", () => showTool(b));
    b.addEventListener("focus", () => showTool(b));
    b.addEventListener("click", () => showTool(b));
  });
  const tools = $(".tools");
  if (tools) tools.addEventListener("mouseleave", () => {
    if (tools.contains(document.activeElement)) return;
    toolButtons.forEach((x) => x.removeAttribute("aria-pressed"));
    activeTool = null;
    if (tip) tip.textContent = t("tools.default");
  });

  /* ------------------------------------------------------------
     Contact helpers
     ------------------------------------------------------------ */
  const copy = $("[data-copy]");
  if (copy) copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copy.dataset.copy);
      copy.textContent = t("contact.copied");
    } catch {
      copy.textContent = copy.dataset.copy;
    }
    setTimeout(() => { copy.textContent = t("contact.copy"); }, 2000);
  });

  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  /* init: each step on its own, so one failing step cannot blank the page */
  const safe = (fn) => { try { fn(); } catch (e) { console.error(e); } };
  safe(() => applyLang(lang));
  safe(setupWork);
  safe(update);
  window.addEventListener("load", () => { safe(setupWork); safe(update); });
})();
