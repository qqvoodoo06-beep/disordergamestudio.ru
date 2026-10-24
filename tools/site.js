// Интерактив сайта Disorder Game Studio. Всё — украшения поверх готовой страницы: без JavaScript сайт работает
// так же, а при системной настройке «уменьшить движение» анимации выключаются.
(() => {
  const ru = document.documentElement.lang === "ru";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = window.matchMedia("(pointer: fine)").matches;
  const store = {
    get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* приватный режим */ } },
  };
  const rand = (items) => items[Math.floor(Math.random() * items.length)];

  // ---------------------------------------------------------------- зацикленные ролики и «уменьшить движение»
  if (reduce) {
    document.querySelectorAll("video[data-autoplay]").forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause();
    });
  }

  // ---------------------------------------------------------------- пиксели за курсором
  const COLORS = ["#8b5cf6", "#d946ef", "#22d3ee", "#c4b5fd", "#a78bfa", "#f0abfc"];
  const pixels = { canvas: null, ctx: null, list: [], running: false, dpr: 1 };
  const setupPixels = () => {
    const canvas = document.createElement("canvas");
    canvas.className = "pixel-fx";
    canvas.setAttribute("aria-hidden", "true");
    document.body.append(canvas);
    pixels.canvas = canvas;
    pixels.ctx = canvas.getContext("2d");
    const resize = () => {
      pixels.dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = innerWidth * pixels.dpr;
      canvas.height = innerHeight * pixels.dpr;
    };
    resize();
    addEventListener("resize", resize);
  };
  const tick = () => {
    const { ctx, dpr } = pixels;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    pixels.list = pixels.list.filter((p) => ++p.life < p.max);
    for (const p of pixels.list) {
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.93;
      p.vy = p.vy * 0.93 + 0.035;  // чуть оседают вниз
      if (Math.random() < 0.015) p.x += (Math.random() - 0.5) * 18;  // «сбой»: пиксель перескакивает вбок
      const k = 1 - p.life / p.max;
      ctx.globalAlpha = Math.min(1, k * 1.4);
      ctx.fillStyle = p.color;
      const size = Math.max(1, Math.round(p.size * (0.4 + 0.6 * k)));
      ctx.fillRect(Math.round(p.x / 3) * 3, Math.round(p.y / 3) * 3, size, size);  // сетка 3 px — «пиксельно»
    }
    if (pixels.list.length) {
      requestAnimationFrame(tick);
    } else {
      pixels.running = false;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }
  };
  const spawn = (x, y, count, spread, speed, life = 46) => {
    if (!pixels.canvas) return;
    for (let i = 0; i < count; i += 1) {
      if (pixels.list.length > 320) pixels.list.shift();
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.3 + Math.random() * 0.7);
      pixels.list.push({
        x: x + (Math.random() - 0.5) * spread, y: y + (Math.random() - 0.5) * spread,
        vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity,
        size: rand([3, 4, 4, 5, 6, 8]), life: 0, max: life + Math.random() * 30, color: rand(COLORS),
      });
    }
    if (!pixels.running) {
      pixels.running = true;
      requestAnimationFrame(tick);
    }
  };

  let travelled = 0;
  if (!reduce && mouse) {
    setupPixels();
    let last = null;
    addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const { clientX: x, clientY: y } = event;
      if (last) {
        const distance = Math.hypot(x - last.x, y - last.y);
        travelled += distance;
        const steps = Math.min(5, Math.ceil(distance / 10));  // быстрый росчерк — сплошной след без дыр
        for (let i = 1; i <= steps; i += 1) {
          spawn(last.x + (x - last.x) * (i / steps), last.y + (y - last.y) * (i / steps), 2, 9, 0.8);
        }
        if (travelled > 60000) unlock("pixel");
      }
      last = { x, y };
    }, { passive: true });
    addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse") spawn(event.clientX, event.clientY, 26, 4, 4.5, 40);
    });
    document.addEventListener("mouseleave", () => { last = null; });
  }

  // ---------------------------------------------------------------- буквы DISORDER разбегаются от курсора
  const heroLogo = document.querySelector(".hero-logo svg");
  if (heroLogo && !reduce && mouse) {
    const letters = [...heroLogo.querySelectorAll(".l")].map((el) => ({
      el, x: 0, y: 0, r: 0, tx: 0, ty: 0, tr: 0, spin: Math.random() < 0.5 ? -1 : 1,
    }));
    let animating = false;
    const animate = () => {
      let moving = false;
      for (const l of letters) {
        l.x += (l.tx - l.x) * 0.16;
        l.y += (l.ty - l.y) * 0.16;
        l.r += (l.tr - l.r) * 0.16;
        if (Math.abs(l.tx - l.x) + Math.abs(l.ty - l.y) + Math.abs(l.tr - l.r) > 0.05) moving = true;
        l.el.style.transform = `translate(${l.x.toFixed(2)}px, ${l.y.toFixed(2)}px) rotate(${l.r.toFixed(2)}deg)`;
      }
      animating = moving;
      if (moving) requestAnimationFrame(animate);
    };
    const kick = () => { if (!animating) { animating = true; requestAnimationFrame(animate); } };
    const zone = heroLogo.closest(".hero") || heroLogo;
    zone.addEventListener("pointermove", (event) => {
      const scale = heroLogo.viewBox.baseVal.width / heroLogo.getBoundingClientRect().width;
      for (const l of letters) {
        const box = l.el.getBoundingClientRect();
        const dx = box.left + box.width / 2 - event.clientX;
        const dy = box.top + box.height / 2 - event.clientY;
        const distance = Math.hypot(dx, dy) || 1;
        const force = Math.max(0, 1 - distance / 240);
        l.tx = (dx / distance) * force * 26 * scale;
        l.ty = (dy / distance) * force * 26 * scale;
        l.tr = force * 12 * l.spin;
      }
      kick();
    });
    zone.addEventListener("pointerleave", () => {
      letters.forEach((l) => { l.tx = 0; l.ty = 0; l.tr = 0; });
      kick();
    });
  }

  // Буквы маленького логотипа в шапке дрожат, пока на нём курсор
  const brandLogo = document.querySelector(".brand svg");
  if (brandLogo && !reduce) {
    let timer = null;
    const letters = [...brandLogo.querySelectorAll(".l")];
    brandLogo.closest(".brand").addEventListener("pointerenter", () => {
      timer = setInterval(() => letters.forEach((el) => {
        el.style.transform = Math.random() < 0.45
          ? `translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 12}px) rotate(${(Math.random() - 0.5) * 14}deg)`
          : "";
      }), 90);
    });
    brandLogo.closest(".brand").addEventListener("pointerleave", () => {
      clearInterval(timer);
      letters.forEach((el) => { el.style.transform = ""; });
    });
  }

  // Пять быстрых щелчков по большому логотипу — сбой и достижение
  if (heroLogo) {
    let clicks = [];
    heroLogo.closest(".hero-logo").addEventListener("click", () => {
      const now = Date.now();
      clicks = clicks.filter((t) => now - t < 2500).concat(now);
      if (!reduce) {
        heroLogo.classList.remove("burst");
        void heroLogo.getBoundingClientRect();  // перезапуск анимации
        heroLogo.classList.add("burst");
        const box = heroLogo.getBoundingClientRect();
        spawn(box.left + box.width / 2, box.top + box.height / 2, 40, box.width * 0.6, 5, 50);
      }
      if (clicks.length >= 5) {
        clicks = [];
        unlock("chaos");
      }
    });
  }

  // ---------------------------------------------------------------- карточки наклоняются вслед за мышью
  if (!reduce && mouse) {
    document.querySelectorAll(".card, .spotlight").forEach((el) => {
      el.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;
        const box = el.getBoundingClientRect();
        const px = (event.clientX - box.left) / box.width;
        const py = (event.clientY - box.top) / box.height;
        const strength = el.classList.contains("spotlight") ? 3 : 7;
        el.style.setProperty("--rx", `${((0.5 - py) * strength).toFixed(2)}deg`);
        el.style.setProperty("--ry", `${((px - 0.5) * strength * 1.3).toFixed(2)}deg`);
        el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
        el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
        el.classList.add("tilt");
      });
      el.addEventListener("pointerleave", () => el.classList.remove("tilt"));
    });
  }

  // ---------------------------------------------------------------- заголовки «расшифровываются» и блоки появляются
  if (!reduce && "IntersectionObserver" in window) {
    const GLYPHS = "▓▒░█<>/\\#*+=01ДИСОРДЕР";
    const scramble = (el) => {
      const final = el.textContent;
      let frame = 0;
      const total = 20;
      const timer = setInterval(() => {
        frame += 1;
        const shown = Math.floor((final.length * frame) / total);
        el.textContent = final.slice(0, shown)
          + [...final.slice(shown)].map((ch) => (ch === " " ? " " : rand(GLYPHS))).join("");
        if (frame >= total) {
          clearInterval(timer);
          el.textContent = final;
        }
      }, 34);
    };
    const titles = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        titles.unobserve(entry.target);
        scramble(entry.target);
      }
    }), { threshold: 0.6 });
    document.querySelectorAll("main h2").forEach((h2) => titles.observe(h2));

    const appear = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        appear.unobserve(entry.target);
        entry.target.classList.add("in");
      }
    }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    const blocks = ".card, .fact, .social, .features li, .gallery figure, .video, .side";
    document.querySelectorAll(blocks).forEach((el, i) => {
      el.classList.add("reveal");
      el.style.setProperty("--d", `${(i % 6) * 70}ms`);
      appear.observe(el);
    });
  }

  // ---------------------------------------------------------------- секретные достижения (как в GameShelf)
  const ACHIEVEMENTS = {
    konami: { ru: ["Читер!", "Вы ввели код Konami. Уважаем классику."],
              en: ["Cheater!", "You entered the Konami code. Respect for the classics."] },
    chaos: { ru: ["Хаос под контролем", "Пять щелчков по логотипу — и всё пошло вразнос."],
             en: ["Chaos under control", "Five clicks on the logo, and everything fell apart."] },
    collector: { ru: ["Коллекционер", "Вы заглянули на страницы всех проектов студии."],
                 en: ["Collector", "You visited every project page."] },
    pixel: { ru: ["Пиксельный художник", "Нарисовали курсором целую картину."],
             en: ["Pixel artist", "You painted a whole picture with your cursor."] },
  };
  const ids = Object.keys(ACHIEVEMENTS);
  let audio = null;
  const chime = () => {  // тот же короткий «дзинь» из двух нот, что у плашки GameShelf
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      [[0, 1046.5], [0.09, 1568]].forEach(([start, freq]) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        const t = audio.currentTime + start;
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(0.07, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.6);
        osc.connect(gain).connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.65);
      });
    } catch { /* без звука */ }
  };
  const toast = (id) => {
    const [name, text] = ACHIEVEMENTS[id][ru ? "ru" : "en"];
    const got = ids.filter((key) => store.get(`dgs-ach-${key}`)).length;
    const box = document.createElement("div");
    box.className = "ach-toast";
    box.setAttribute("role", "status");
    box.innerHTML = `<div class="ach-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1.5A3 3 0 0 0 8 10.5M16 6h3.5v1.5A3 3 0 0 1 16 10.5M12 13v4M8.5 20h7M10 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div><small>${ru ? "Достижение получено" : "Achievement unlocked"} · ${got}/${ids.length}</small><b></b><span></span></div>`;
    box.querySelector("b").textContent = name;
    box.querySelector("span").textContent = text;
    document.body.append(box);
    requestAnimationFrame(() => box.classList.add("show"));
    setTimeout(() => { box.classList.remove("show"); setTimeout(() => box.remove(), 600); }, 5200);
  };
  function unlock(id) {
    if (store.get(`dgs-ach-${id}`)) return;
    store.set(`dgs-ach-${id}`, "1");
    toast(id);
    chime();
  }

  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let typed = [];
  addEventListener("keydown", (event) => {
    typed = typed.concat(event.key.length === 1 ? event.key.toLowerCase() : event.key).slice(-KONAMI.length);
    if (typed.join() === KONAMI.join()) {
      typed = [];
      if (!reduce) {
        document.body.classList.add("screen-glitch");
        setTimeout(() => document.body.classList.remove("screen-glitch"), 900);
        spawn(innerWidth / 2, innerHeight / 2, 120, innerWidth * 0.5, 7, 60);
      }
      unlock("konami");
    }
  });

  // Страницы проектов, которые человек уже открыл: все — «Коллекционер»
  const project = document.querySelector("main[data-project]")?.dataset.project;
  if (project) {
    const total = document.querySelectorAll(".site-footer nav:first-of-type a").length;
    let seen = [];
    try { seen = JSON.parse(store.get("dgs-seen") || "[]"); } catch { seen = []; }
    if (!seen.includes(project)) seen.push(project);
    store.set("dgs-seen", JSON.stringify(seen));
    if (total && seen.length >= total) setTimeout(() => unlock("collector"), 900);
  }

  // ---------------------------------------------------------------- просмотр скриншотов
  const t = ru ? { title: "Скриншот", prev: "Назад", next: "Вперёд", close: "Закрыть" }
               : { title: "Screenshot", prev: "Previous", next: "Next", close: "Close" };
  const items = [...document.querySelectorAll("[data-lightbox]")];
  if (!items.length || typeof HTMLDialogElement === "undefined") return;
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-label", t.title);
  dialog.innerHTML = `<img alt=""><p aria-live="polite"></p>
    <button class="prev" type="button" aria-label="${t.prev}">‹</button>
    <button class="next" type="button" aria-label="${t.next}">›</button>
    <button class="close" type="button" aria-label="${t.close}">✕</button>`;
  document.body.append(dialog);
  const img = dialog.querySelector("img");
  const caption = dialog.querySelector("p");
  let index = 0;
  const show = (i) => {
    index = (i + items.length) % items.length;
    const link = items[index];
    img.src = link.href;
    img.alt = link.querySelector("img")?.alt || "";
    caption.textContent = link.dataset.caption || "";
  };
  items.forEach((link, i) => link.addEventListener("click", (event) => {
    event.preventDefault();
    show(i);
    dialog.showModal();
    document.body.style.overflow = "hidden";  // страница под окном не прокручивается
  }));
  dialog.addEventListener("close", () => { document.body.style.overflow = ""; });
  dialog.querySelector(".prev").addEventListener("click", () => show(index - 1));
  dialog.querySelector(".next").addEventListener("click", () => show(index + 1));
  dialog.querySelector(".close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(index - 1);
    if (event.key === "ArrowRight") show(index + 1);
  });
})();
