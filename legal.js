(() => {
  "use strict";
  const store = {
    get() { try { return localStorage.getItem("jk-lang"); } catch { return null; } },
    set(v) { try { localStorage.setItem("jk-lang", v); } catch { /* private mode */ } }
  };
  const fromUrl = new URLSearchParams(location.search).get("lang");
  let lang = [fromUrl, store.get(), (navigator.language || "de").slice(0, 2)]
    .find((l) => l === "en" || l === "de") || "de";

  const apply = (l) => {
    lang = l;
    document.documentElement.lang = l;
    store.set(l);
    document.title = document.body.dataset["title" + l.charAt(0).toUpperCase() + l.slice(1)] || document.title;
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
  };
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => apply(b.dataset.lang)));
  apply(lang);
})();
