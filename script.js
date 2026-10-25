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
    get() { try { return localStorage.getItem("jk-lang"); } catch { return null; } },
    set(v) { try { localStorage.setItem("jk-lang", v); } catch { /* private mode */ } }
  };
  const fromUrl = new URLSearchParams(location.search).get("lang");
  let lang = [fromUrl, store.get(), (navigator.language || "en").slice(0, 2)]
    .find((l) => l === "en" || l === "de") || "en";

  const t = (key) => (I18N[lang] && I18N[lang][key]) || (I18N.en && I18N.en[key]) || key;

  let openProject = null;
  const tip = $(".tip");
  let activeTool = null;

  const applyLang = (next) => {
    lang = next;
    document.documentElement.lang = lang;
    store.set(lang);

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

    // tool tip text follows the language too
    if (tip) tip.textContent = activeTool ? t(activeTool.dataset.tipKey) : t("tools.default");

    if (openProject) renderProject(openProject);
    // text length changes the rail width
    if (typeof setupWork === "function") { setupWork(); update(); }
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
     Photo: appears when hovering the name. Put your portrait at
     assets/jennifer.jpg (portrait format, about 600 x 840 px).
     Until the file exists, the initials are shown instead.
     ------------------------------------------------------------ */
  const brand = $(".brand");
  const photoImg = $(".photo img");
  if (photoImg) {
    const probe = new Image();
    probe.onload = () => {
      photoImg.src = photoImg.dataset.src;
      photoImg.alt = "Jennifer Klette";
      photoImg.hidden = false;
    };
    probe.src = photoImg.dataset.src;
  }
  // touch devices have no hover: a tap shows the photo briefly
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

  let pinned = false;
  let railDist = 0;

  function setupWork() {
    if (!work || !rail) return;
    const wide = window.innerWidth >= 900 && !reduce.matches;
    if (wide) {
      work.classList.add("is-pinned");
      pinned = true;
      rail.scrollLeft = 0;
      railDist = Math.max(0, rail.scrollWidth - window.innerWidth + 80);
      work.style.height = (railDist + window.innerHeight) + "px";
    } else {
      work.classList.remove("is-pinned");
      work.style.height = "";
      rail.style.removeProperty("--x");
      pinned = false;
    }
  }

  function update() {
    const vh = window.innerHeight;

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
    if (pinned) {
      const top = work.getBoundingClientRect().top;
      const p = clamp(-top / Math.max(1, work.offsetHeight - vh));
      rail.style.setProperty("--x", (-p * railDist).toFixed(1) + "px");
    }
  }

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener("resize", () => { setupWork(); update(); });

  /* ------------------------------------------------------------
     Real images replace the placeholder art when the file exists
     ------------------------------------------------------------ */
  $$(".rail img[data-src]").forEach((img) => {
    const probe = new Image();
    probe.onload = () => {
      img.src = img.dataset.src;
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
  const dialog = $(".detail") || { addEventListener() {}, showModal() {}, close() {} };
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
      openProject = card.dataset.open;
      lastCard = card;
      renderProject(openProject);

      const cover = $(".cover", card);
      dVisual.className = "detail-visual " + cover.className.replace("cover", "").trim();
      dVisual.innerHTML = "";
      const img = $("img", cover);
      if (img && !img.hidden) {
        const clone = document.createElement("img");
        clone.src = img.src;
        clone.alt = t(`p.${openProject}.title`);
        dVisual.appendChild(clone);
      }
      dialog.showModal();
    });
  });

  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  dialog.addEventListener("close", () => {
    openProject = null;
    if (lastCard) lastCard.focus();
  });

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
