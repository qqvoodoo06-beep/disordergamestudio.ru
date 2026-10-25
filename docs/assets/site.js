// Интерактив сайта Disorder Game Studio. Всё — украшения поверх готовой страницы: без JavaScript сайт работает
// так же, а при системной настройке «уменьшить движение» анимации выключаются.
(() => {
  // Страница 404 одна на оба языка: там язык надписей — как у браузера посетителя
  const ru = document.documentElement.hasAttribute("data-bilingual")
    ? /^ru\b/i.test(navigator.language || "") : document.documentElement.lang === "ru";
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = window.matchMedia("(pointer: fine)").matches;
  const store = {
    get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
    set: (key, value) => { try { localStorage.setItem(key, value); } catch { /* приватный режим */ } },
  };
  const rand = (items) => items[Math.floor(Math.random() * items.length)];
  const unlocked = new Set();  // выданные в этот раз достижения — даже если localStorage заблокирован

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
  const spawn = (x, y, count, spread, speed, life = 46, colors = COLORS) => {
    if (reduce) return;
    if (!pixels.canvas) setupPixels();  // на телефоне холст нужен только эффектам карточек — создаём по требованию
    for (let i = 0; i < count; i += 1) {
      if (pixels.list.length > 320) pixels.list.shift();
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.3 + Math.random() * 0.7);
      pixels.list.push({
        x: x + (Math.random() - 0.5) * spread, y: y + (Math.random() - 0.5) * spread,
        vx: Math.cos(angle) * velocity, vy: Math.sin(angle) * velocity,
        size: rand([3, 4, 4, 5, 6, 8]), life: 0, max: life + Math.random() * 30, color: rand(colors),
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
        if (travelled > 60000 && !unlocked.has("pixel")) unlock("pixel");
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

  // Логотип прокручен за экран — его постоянная анимация «сбоя» ставится на паузу
  const hero = document.querySelector(".hero");
  if (hero && heroLogo && "IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => heroLogo.classList.toggle("idle", !entry.isIntersecting)).observe(hero);
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

  // ---------------------------------------------------------------- самолётик Telegram: петля и сердечко из дыма
  if (!reduce && mouse) {
    const NS = "http://www.w3.org/2000/svg";
    let flying = false;
    const flightRoute = (flip) => {
      // Маршрут от значка (0, 0): взлёт → мёртвая петля → сердечко → выход за экран. Y вниз, как на экране.
      const points = [];
      const add = (x, y) => points.push([flip ? -x : x, y]);
      const curve = (p0, p1, p2, steps) => {
        for (let i = 1; i <= steps; i += 1) {
          const t = i / steps;
          add((1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * p1[0] + t * t * p2[0],
              (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * p1[1] + t * t * p2[1]);
        }
      };
      add(0, 0);
      const loop = { x: 80, y: -118, r: 40 };
      curve([0, 0], [6, -96], [loop.x, loop.y + loop.r], 34);
      for (let i = 1; i <= 64; i += 1) {  // петля: снизу вверх по правой стороне и обратно
        const a = (Math.PI / 2) - (Math.PI * 2 * i) / 64;
        add(loop.x + loop.r * Math.cos(a), loop.y + loop.r * Math.sin(a));
      }
      const heart = { x: 250, y: -150, k: 4.3 };
      const heartPoint = (t) => [heart.x + heart.k * 16 * Math.sin(t) ** 3,
        heart.y - heart.k * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))];
      const tip = heartPoint(Math.PI);
      curve([loop.x, loop.y + loop.r], [loop.x + 120, loop.y + loop.r + 30], tip, 30);
      // Сначала правая половинка, потом левая: к нижнему кончику самолётик приходит, двигаясь вправо-вниз,
      // и уходит дугой вниз-вправо и вверх, не перечёркивая рисунок
      for (let i = 1; i <= 150; i += 1) add(...heartPoint(Math.PI - (Math.PI * 2 * i) / 150));
      curve(tip, [tip[0] + 150, tip[1] + 80], [heart.x + 620, heart.y - 420], 44);
      return points;
    };

    const fly = (link) => {
      const icon = link.querySelector("svg");
      if (flying || !icon) return;
      flying = true;
      const box = icon.getBoundingClientRect();
      const ox = box.left + box.width / 2;
      const oy = box.top + box.height / 2;
      const points = flightRoute(ox + 420 > innerWidth);
      const lengths = [0];
      for (let i = 1; i < points.length; i += 1) {
        lengths.push(lengths[i - 1] + Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]));
      }
      const total = lengths[lengths.length - 1];
      const svg = document.createElementNS(NS, "svg");
      svg.setAttribute("class", "plane-fx");
      svg.setAttribute("aria-hidden", "true");
      const d = "M" + points.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");
      svg.innerHTML = `<defs><filter id="smoke-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3"/></filter></defs>
        <g transform="translate(${ox} ${oy})">
          <g class="smoke">
            <path d="${d}" pathLength="1000" fill="none" stroke="rgba(240,171,252,.38)" stroke-width="12"
                  stroke-linecap="round" stroke-linejoin="round" filter="url(#smoke-blur)" stroke-dasharray="1000" stroke-dashoffset="1000"/>
            <path d="${d}" pathLength="1000" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="2.5"
                  stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1000" stroke-dashoffset="1000"/>
          </g>
          <g class="plane"><path d="M15 0 -11 -9 -6 0 -11 9Z" fill="#fff"/><path d="M15 0 -6 0 -11 9Z" fill="#bfe3ff"/></g>
        </g>`;
      document.body.append(svg);
      const trails = svg.querySelectorAll(".smoke path");
      const plane = svg.querySelector(".plane");
      icon.classList.add("tg-hidden");
      const duration = 4300;
      const start = performance.now();
      let segment = 1;
      const step = (now) => {
        const u = Math.min(1, (now - start) / duration);
        const eased = u < 0.5 ? 2 * u * u : 1 - (-2 * u + 2) ** 2 / 2;
        const distance = eased * total;
        while (segment < lengths.length - 1 && lengths[segment] < distance) segment += 1;
        const [x0, y0] = points[segment - 1];
        const [x1, y1] = points[segment];
        const k = (distance - lengths[segment - 1]) / ((lengths[segment] - lengths[segment - 1]) || 1);
        const angle = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
        plane.setAttribute("transform",
          `translate(${(x0 + (x1 - x0) * k).toFixed(1)} ${(y0 + (y1 - y0) * k).toFixed(1)}) rotate(${angle.toFixed(1)}) scale(1.5)`);
        trails.forEach((path) => path.setAttribute("stroke-dashoffset", (1000 - (distance / total) * 1000).toFixed(1)));
        if (u < 1) {
          requestAnimationFrame(step);
          return;
        }
        icon.classList.remove("tg-hidden");
        svg.querySelector(".smoke").classList.add("fade");
        setTimeout(() => { svg.remove(); flying = false; }, 1500);
        unlock("heart");
      };
      requestAnimationFrame(step);
    };
    document.querySelectorAll('a[href*="t.me/"]').forEach((link) => {
      link.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") fly(link); });
    });
  }

  // ---------------------------------------------------------------- эффекты карточек проектов
  // У каждого проекта свой эффект о сути игры. Играет один раз за посещение сайта (sessionStorage),
  // чтобы не надоедать: с мышью — при наведении, на телефоне — когда карточка появилась на экране.
  const make = (tag, className, html = "") => {
    const node = document.createElement(tag);
    node.className = className;
    node.innerHTML = html;
    return node;
  };
  const later = (ms, fn) => setTimeout(fn, ms);
  const finish = (node, at) => { later(at, () => node.classList.add("fx-out")); later(at + 650, () => node.remove()); };
  const canvasIn = (box) => {
    const canvas = make("canvas", "fx-layer");
    box.append(canvas);
    const ratio = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = box.clientWidth * ratio;
    canvas.height = box.clientHeight * ratio;
    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
    return { canvas, ctx, w: box.clientWidth, h: box.clientHeight, ratio };
  };
  // Пока идёт эффект, у карточки не увеличивается картинка и не светится блик — иначе в конце всё «прыгает»
  const busy = (card, ms) => { card.classList.add("fx-busy"); later(ms, () => card.classList.remove("fx-busy")); };
  // Звук: только если человек уже что-то нажимал на сайте; между звуками аудио засыпает, чтобы не грузить процессор
  let audioNap = null;
  const sound = () => {
    if (navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      clearTimeout(audioNap);
      audioNap = later(2500, () => audio.suspend());
      return audio;
    } catch {
      return null;
    }
  };
  const run = (duration, draw, done) => {  // кадры с t от 0 до duration (мс)
    const start = performance.now();
    const frame = (now) => {
      const t = now - start;
      draw(Math.min(t, duration));
      if (t < duration) requestAnimationFrame(frame); else done();
    };
    requestAnimationFrame(frame);
  };
  const tone = (notes, gap = 0.11, volume = 0.05) => {  // короткая мелодия
    if (!sound()) return;
    try {
      notes.forEach((freq, i) => {
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        const t = audio.currentTime + i * gap;
        osc.type = "triangle";
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(volume, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
        osc.connect(gain).connect(audio.destination);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch { /* без звука */ }
  };

  const FX = {
    // Реткон: горящий шов проходит по кадру — та же квартира, но показания уже другие
    hoits(box, card) {
      // Кадры по размеру блока: большие только для широкого блока на экране с высокой плотностью
      const big = box.clientWidth * (window.devicePixelRatio || 1) > 700 && card.dataset.fxA2;
      const a = big ? card.dataset.fxA2 : card.dataset.fxA;
      const b = big ? card.dataset.fxB2 : card.dataset.fxB;
      const layer = make("div", "fx-layer fx-retcon",
        `<img src="${a}" alt=""><img class="after" src="${b}" alt=""><i></i>
         <b>${ru ? "Показания изменены" : "Testimony changed"}</b>`);
      box.append(layer);
      busy(card, 4100);
      Promise.all([...layer.querySelectorAll("img")].map((img) => img.decode().catch(() => {}))).then(() => {
        layer.classList.add("go");
        finish(layer, 3300);
      });
    },
    // Печать с размаху: «Одобрено» (чаще) или «Отказано», карточка вздрагивает, брызги чернил
    "god-of-bureaucracy"(box, card) {
      const ok = Math.random() < 0.7;
      const stamp = make("div", `fx-layer fx-stamp ${ok ? "ok" : "no"}`,
        `<span>${ok ? (ru ? "Одобрено" : "Approved") : (ru ? "Отказано" : "Denied")}</span>`);
      box.append(stamp);
      requestAnimationFrame(() => stamp.classList.add("go"));
      later(260, () => {
        card.classList.add("fx-shake");
        const r = box.getBoundingClientRect();
        spawn(r.left + r.width / 2, r.top + r.height / 2, 18, r.width * 0.35, 3, 34, ["#c4161c", "#7f1d1d", "#ef4444"]);
      });
      later(650, () => card.classList.remove("fx-shake"));
      finish(stamp, 2400);
    },
    // Картина рассыпается на кусочки пазла и собирается обратно
    "tidying-the-puzzle-gallery"(box, card) {
      busy(card, 2900);
      const img = box.querySelector("img");
      const w = box.clientWidth;
      const h = box.clientHeight;
      const cols = 5;
      const rows = 4;
      const layer = make("div", "fx-layer fx-puzzle");
      for (let r = 0; r < rows; r += 1) {
        for (let c = 0; c < cols; c += 1) {
          const piece = document.createElement("div");
          const x = (c * w) / cols;
          const y = (r * h) / rows;
          Object.assign(piece.style, {
            left: `${x}px`, top: `${y}px`, width: `${w / cols}px`, height: `${h / rows}px`,
            backgroundImage: `url("${img.currentSrc || img.src}")`, backgroundSize: `${w}px ${h}px`,
            backgroundPosition: `${-x}px ${-y}px`,
          });
          piece.style.setProperty("--dx", `${(c - (cols - 1) / 2) * 26 + (Math.random() - 0.5) * 30}px`);
          piece.style.setProperty("--dy", `${(r - (rows - 1) / 2) * 24 + (Math.random() - 0.5) * 30}px`);
          piece.style.setProperty("--rot", `${(Math.random() - 0.5) * 70}deg`);
          piece.style.setProperty("--d", `${Math.random() * 160}ms`);
          layer.append(piece);
        }
      }
      box.append(layer);
      finish(layer, 2050);  // кусочки уже на местах — слой тихо гаснет, картинка под ним та же
    },
    // Сверху падают неоновые пентамино, собирают линию — она вспыхивает и исчезает
    pentomino(box) {
      const { canvas, ctx, w, h, ratio } = canvasIn(box);
      const cols = 10;
      const cell = w / cols;
      const bottom = Math.floor(h / cell) - 1;
      const shift = h - (bottom + 1) * cell;  // сетка прижата к низу карточки: линия ложится на дно, а не висит
      const pieces = [  // [столбец, строка от низа] клеток; вместе закрывают нижнюю линию целиком
        { color: "#22d3ee", cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]] },
        { color: "#d946ef", cells: [[5, 0], [6, 0], [7, 0], [8, 0], [5, 1]] },
        { color: "#fbbf24", cells: [[9, 0], [9, 1], [9, 2], [9, 3], [9, 4]] },
      ];
      const drop = 380;
      const landed = 3 * drop + 120;
      const square = (x, y, color, alpha = 1) => {
        ctx.globalAlpha = alpha;
        ctx.fillStyle = `${color}33`;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 10 * ratio;  // размытие тени не масштабируется вместе с холстом
        ctx.fillRect(x + 2, y + 2, cell - 4, cell - 4);
        ctx.strokeRect(x + 3, y + 3, cell - 6, cell - 6);
      };
      run(landed + 1500, (t) => {
        ctx.clearRect(0, 0, w, h);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.fillStyle = "rgba(10, 8, 20, .45)";
        ctx.fillRect(0, 0, w, h);
        const cleared = t > landed + 600;
        const flash = t > landed && !cleared && Math.floor((t - landed) / 100) % 2 === 0;
        pieces.forEach((piece, i) => {
          const k = Math.min(1, Math.max(0, (t - i * drop) / drop));
          if (k <= 0) return;
          const fall = (1 - k * k) * (bottom + 6) * cell;  // падают с ускорением
          piece.cells.forEach(([cx, cy]) => {
            if (cleared && cy === 0) return;
            const row = bottom - cy + (cleared ? 1 : 0);
            const color = flash && cy === 0 ? "#ffffff" : piece.color;
            square(cx * cell, shift + row * cell - fall, color);
          });
        });
      }, () => finish(canvas, 0));
    },
    // Из карточки вылетают ноты, и (если на сайте уже что-то нажимали) звучит короткая мелодия
    "music-lotto"(box) {
      const layer = make("div", "fx-layer fx-notes");
      const colors = ["#5eead4", "#a78bfa", "#f0abfc", "#fde68a", "#93c5fd"];
      for (let i = 0; i < 18; i += 1) {
        const note = make("span", "", rand(["♪", "♫", "♬", "♩"]));
        Object.assign(note.style, { left: `${5 + Math.random() * 88}%`, fontSize: `${22 + Math.random() * 24}px`,
          color: rand(colors) });
        note.style.setProperty("--t", `${1.5 + Math.random() * 0.9}s`);
        note.style.setProperty("--d", `${Math.random() * 420}ms`);
        note.style.setProperty("--sway", `${(Math.random() - 0.5) * 60}px`);
        note.style.setProperty("--rot", `${(Math.random() - 0.5) * 50}deg`);
        note.style.setProperty("--rise", `${-box.clientHeight * (0.75 + Math.random() * 0.4)}px`);  // от высоты карточки
        layer.append(note);
      }
      box.append(layer);
      tone([523.25, 659.25, 783.99, 1046.5]);
      later(3000, () => layer.remove());
    },
    // Красные и синие пиксельные солдатики сходятся, и над полем поднимается красное знамя
    "uprising-lands-of-the-red"(box) {
      const { canvas, ctx, w, h } = canvasIn(box);
      const p = Math.max(3, Math.round(w / 85));
      const ground = Math.round(h * 0.9);
      const meet = w / 2;
      const soldier = (x, color, dark, step, alpha, facing) => {  // пиксельный копейщик со щитом
        ctx.globalAlpha = alpha;
        const y = ground - 10 * p - (step % 2) * p * 0.5;
        const px = (dx, dy, wd, ht, fill) => { ctx.fillStyle = fill; ctx.fillRect(x + dx * p, y + dy * p, wd * p, ht * p); };
        px(-1, 0, 3, 1, "#cbd5e1");                           // шлем
        px(-1, 1, 3, 2, "#f1c79e");                           // лицо
        px(-1, 3, 3, 4, color);                               // туловище в цвете армии
        px(facing > 0 ? 1 : -2, 3, 2, 3, dark);               // щит впереди
        px(step % 2 ? -1 : 0, 7, 1, 3, "#e2e8f0");            // ноги шагают
        px(step % 2 ? 1 : 0, 7, 1, 3, "#94a3b8");
        px(facing > 0 ? 3 : -3, -3, 0.5, 10, "#e2e8f0");      // копьё
        px(facing > 0 ? 2.75 : -3.25, -4, 1, 1, "#fde68a");   // наконечник
      };
      const sparks = [];
      run(3400, (t) => {
        ctx.clearRect(0, 0, w, h);
        const g = ctx.createLinearGradient(0, ground - 40, 0, h);
        g.addColorStop(0, "rgba(10, 8, 20, 0)");
        g.addColorStop(1, "rgba(10, 8, 20, .8)");
        ctx.fillStyle = g;
        ctx.globalAlpha = 1;
        ctx.fillRect(0, ground - 40, w, h);
        const march = Math.min(1, t / 1300);
        const step = Math.floor(t / 140);
        for (let i = 0; i < 4; i += 1) {
          // Передние останавливаются вплотную: копья скрещиваются ровно посередине
          const red = meet - 4 * p - i * 8 * p - (1 - march) * (meet + 40);
          const blue = meet + 4 * p + i * 8 * p + (1 - march) * (meet + 40);
          const fallen = t > 1450 ? Math.max(0, 1 - (t - 1450) / 450) : 1;
          soldier(red, "#ef4444", "#991b1b", march < 1 ? step + i : 0, 1, 1);
          soldier(blue + (1 - fallen) * 10 * p, "#3b82f6", "#1e3a8a", march < 1 ? step + i + 1 : 0, fallen, -1);
        }
        if (t > 1300 && t < 1360 && !sparks.length) {
          for (let i = 0; i < 26; i += 1) {
            sparks.push({ x: meet, y: ground - 6 * p, vx: (Math.random() - 0.5) * 6, vy: -Math.random() * 5, life: 0 });
          }
        }
        sparks.forEach((s) => {
          s.life += 1; s.x += s.vx; s.y += s.vy; s.vy += 0.25;
          ctx.globalAlpha = Math.max(0, 1 - s.life / 40);
          ctx.fillStyle = rand(["#fde68a", "#fb923c", "#ffffff"]);
          ctx.fillRect(Math.round(s.x / p) * p, Math.round(s.y / p) * p, p, p);
        });
        if (t > 1700) {  // знамя: древко растёт, полотнище развевается
          const k = Math.min(1, (t - 1700) / 600);
          const top = ground - 30 * p * k;
          ctx.globalAlpha = 1;
          ctx.fillStyle = "#d6d3e0";
          ctx.fillRect(meet - p / 2, top, p, ground - top);
          if (k > 0.6) {
            for (let i = 0; i < 12; i += 1) {
              const wave = Math.sin(t / 120 + i / 2) * p * 1.2;
              ctx.fillStyle = i % 4 === 3 ? "#b91c1c" : "#ef4444";
              ctx.fillRect(meet + p / 2 + i * p, top + wave, p, 8 * p);
            }
          }
        }
      }, () => finish(canvas, 300));
    },
    // Часы на обложке набегают, и выскакивает плашка достижения — как в самой программе
    gameshelf(box) {
      const layer = make("div", "fx-layer fx-shelf",
        `<span class="hours">🕒 <em>0</em></span>
         <div class="ach"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1.5A3 3 0 0 0 8 10.5M16 6h3.5v1.5A3 3 0 0 1 16 10.5M12 13v4M8.5 20h7M10 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
         <div><small>${ru ? "Достижение получено" : "Achievement unlocked"}</small><strong>${ru ? "Заглянул в GameShelf" : "Peeked at GameShelf"}</strong></div></div>`);
      box.append(layer);
      const counter = layer.querySelector("em");
      run(1400, (t) => {
        const hours = 46.5 * (1 - (1 - t / 1400) ** 3);
        counter.textContent = `${(Math.round(hours * 10) / 10).toFixed(1).replace(".", ru ? "," : ".")} ${ru ? "ч" : "h"}`;
      }, () => finish(layer, 1900));
    },
  };

  if (!reduce) {
    const played = new Set();
    const firstTime = (slug) => {  // true — эффект ещё не играл в это посещение (и теперь отмечен)
      if (played.has(slug)) return false;
      played.add(slug);
      try {
        if (sessionStorage.getItem(`dgs-fx-${slug}`)) return false;
        sessionStorage.setItem(`dgs-fx-${slug}`, "1");
      } catch { /* без sessionStorage — хотя бы раз на этой странице */ }
      return true;
    };
    // На телефоне — когда карточка уже проявилась и человек на ней задержался: не меньше 60% видно 0,9 с подряд.
    // При быстрой прокрутке эффекты не «сгорают» за экраном
    const timers = new Map();
    const watch = "IntersectionObserver" in window && !mouse
      ? new IntersectionObserver((entries) => entries.forEach((entry) => {
        clearTimeout(timers.get(entry.target));
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          timers.set(entry.target, later(900, () => {
            watch.unobserve(entry.target);
            entry.target.dispatchEvent(new Event("fx-play"));
          }));
        }
      }), { threshold: [0, 0.6] })
      : null;
    document.querySelectorAll("[data-fx]").forEach((card) => {
      const slug = card.dataset.fx;
      const box = card.querySelector(".thumb, .art");
      if (!FX[slug] || !box) return;
      const play = () => { if (firstTime(slug)) FX[slug](box, card); };
      card.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") play(); });
      card.addEventListener("fx-play", play);
      if (watch) watch.observe(card);
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
    document.querySelectorAll("main h2").forEach((h2) => { if (!h2.children.length) titles.observe(h2); });

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
  // [название, что сделали, подсказка для списка, пока не получено]
  const ACHIEVEMENTS = {
    indie: { ru: ["Интерес к инди-студиям", "Вы перешли по карточке проекта, чтобы узнать о нём больше.",
                  "Нажмите на карточку любого проекта"],
             en: ["Into indie studios", "You opened a project card to learn more.", "Click any project card"] },
    dgs: { ru: ["Интерес именно к DGS!", "Вы посмотрели все проекты Disorder Game Studio.",
                "Посмотрите все проекты студии"],
           en: ["Into DGS specifically!", "You checked out every Disorder Game Studio project.",
                "See every project from the studio"] },
    konami: { ru: ["Читер!", "Вы ввели код Konami. Уважаем классику.", "Вспомните старые добрые коды"],
              en: ["Cheater!", "You entered the Konami code. Respect for the classics.", "Remember the good old cheat codes"] },
    chaos: { ru: ["Хаос под контролем", "Пять щелчков по логотипу — и всё пошло вразнос.",
                  "Логотип не любит, когда в него тыкают"],
             en: ["Chaos under control", "Five clicks on the logo, and everything fell apart.",
                  "The logo doesn't like being poked"] },
    disorder: { ru: ["Полный беспорядок", "Вы набрали название студии — и сайт сошёл с ума.",
                     "Наберите на клавиатуре название студии"],
                en: ["Total disorder", "You typed the studio's name and the site went wild.", "Type the studio's name"] },
    pixel: { ru: ["Пиксельный художник", "Нарисовали курсором целую картину.", "Порисуйте курсором подольше"],
             en: ["Pixel artist", "You painted a whole picture with your cursor.", "Doodle with your cursor for a while"] },
    heart: { ru: ["С любовью", "Самолётик из Telegram нарисовал вам сердечко.", "Telegram умеет летать"],
             en: ["With love", "The Telegram plane drew you a heart.", "Telegram can fly"] },
    social: { ru: ["Душа компании", "Вы заглянули во все наши соцсети.",
                     "Наведите мышь на все наши соцсети или откройте их"],
              en: ["Social butterfly", "You checked out all our socials.", "Hover over or open all our socials"] },
    corner: { ru: ["Идеальный угол", "Логотип попал точно в угол — как в старых DVD-плеерах.",
                   "Отойдите от компьютера на минутку"],
              en: ["Perfect corner", "The logo hit the corner, just like old DVD players.", "Step away from the computer for a minute"] },
    night: { ru: ["Ночная сова", "Заглянули к нам глубокой ночью. Ещё одну партию — и спать!",
                  "Загляните к нам поздно ночью"],
             en: ["Night owl", "You dropped by in the middle of the night. One more game, then bed!",
                  "Visit us late at night"] },
    snake: { ru: ["Заблудился, но не растерялся", "Набрали 10 очков в змейке на странице, которой нет.",
                  "Попробуйте заблудиться на сайте"],
             en: ["Lost but not lost", "You scored 10 in the snake game on a page that doesn't exist.",
                  "Try getting lost on the site"] },
  };
  const ids = Object.keys(ACHIEVEMENTS);
  let audio = null;
  const chime = () => {  // тот же короткий «дзинь» из двух нот, что у плашки GameShelf
    if (!sound()) return;
    try {
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
  // Несколько плашек сразу — стопкой в общем контейнере: новая сверху, ушедшая освобождает место. Контейнер есть
  // с самого начала и объявлен областью оповещений: экранный диктор зачитывает то, что в неё добавили
  const stack = document.createElement("div");
  stack.className = "ach-stack";
  stack.setAttribute("aria-live", "polite");
  document.body.append(stack);
  const toast = (id, got) => {  // got — сколько получено на момент выдачи (плашка может показаться позже)
    // Открыто модальное окно (список достижений, скриншот) — всё остальное под его затемнением: покажем после закрытия
    const modal = document.querySelector("dialog[open]");
    if (modal) {
      modal.addEventListener("close", () => toast(id, got), { once: true });
      return;
    }
    const [name, text] = ACHIEVEMENTS[id][ru ? "ru" : "en"];
    const box = document.createElement("div");
    box.className = "ach-toast";
    box.lang = ru ? "ru" : "en";  // на двуязычной 404 текст может быть не на языке страницы
    box.innerHTML = `<div class="ach-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1.5A3 3 0 0 0 8 10.5M16 6h3.5v1.5A3 3 0 0 1 16 10.5M12 13v4M8.5 20h7M10 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div><small>${ru ? "Достижение получено" : "Achievement unlocked"} · ${got}/${ids.length}</small><b></b><span></span></div>`;
    box.querySelector("b").textContent = name;
    box.querySelector("span").textContent = text;
    stack.prepend(box);
    chime();
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add("show")));
    setTimeout(() => { box.classList.remove("show"); setTimeout(() => box.remove(), 600); }, 5200);
  };
  function unlock(id) {
    if (unlocked.has(id)) return;
    unlocked.add(id);  // и уже полученные раньше — дальше без чтения localStorage
    if (store.get(`dgs-ach-${id}`)) return;
    store.set(`dgs-ach-${id}`, "1");
    toast(id, ids.filter(isUnlocked).length);
    updateAchButton();
  }
  const isUnlocked = (id) => unlocked.has(id) || Boolean(store.get(`dgs-ach-${id}`));
  // Плашку показываем, только когда вкладку видно: проект, открытый в фоновой вкладке, поздравит при переходе в неё
  // Видимость проверяем и когда таймер сработал: вкладку могли свернуть, пока он шёл (ушли в приложение Telegram)
  const whenVisible = (ms, fn) => {
    const wait = () => {
      if (!document.hidden) {
        later(ms, () => (document.hidden ? wait() : fn()));
        return;
      }
      const onShow = () => {
        if (document.hidden) return;
        document.removeEventListener("visibilitychange", onShow);
        wait();
      };
      document.addEventListener("visibilitychange", onShow);
    };
    wait();
  };

  // Коды с клавиатуры. Буква засчитывается и по физической клавише (event.code), и по самому символу (event.key):
  // на русской раскладке B и A — это «И» и «Ф» («disorder» набирается как «вшыщквук»), а на AZERTY или Dvorak
  // те же буквы стоят на других клавишах
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "KeyB", "KeyA"];
  const DISORDER = ["KeyD", "KeyI", "KeyS", "KeyO", "KeyR", "KeyD", "KeyE", "KeyR"];
  const sameKey = (pressed, code) => pressed.code === code
    || pressed.key === (code.startsWith("Key") ? code.slice(3) : code).toLowerCase();
  let typed = [];
  addEventListener("keydown", (event) => {
    if (event.target.closest?.("input, textarea, [contenteditable]")) return;
    typed = typed.concat({ code: event.code, key: (event.key || "").toLowerCase() }).slice(-KONAMI.length);
    const tail = (code) => typed.length >= code.length
      && code.every((step, i) => sameKey(typed[typed.length - code.length + i], step));
    if (tail(KONAMI)) {
      typed = [];
      if (!reduce) {
        document.body.classList.add("screen-glitch");
        setTimeout(() => document.body.classList.remove("screen-glitch"), 900);
        spawn(innerWidth / 2, innerHeight / 2, 120, innerWidth * 0.5, 7, 60);
      }
      unlock("konami");
    } else if (tail(DISORDER)) {
      typed = [];
      chaosMode();
      unlock("disorder");
    }
  });

  // «Полный беспорядок»: на 5 секунд блоки разъезжаются и наклоняются, цвета плывут, пиксели взрываются
  let chaosOn = false;
  function chaosMode() {
    if (reduce || chaosOn) return;
    chaosOn = true;
    const shaken = [...document.querySelectorAll(".card, .spotlight, .fact, .social, .btn, main h2, .features li, .side, .gallery figure")];
    shaken.forEach((el) => {
      el.style.setProperty("--cx", `${(Math.random() - 0.5) * 40}px`);
      el.style.setProperty("--cy", `${(Math.random() - 0.5) * 30}px`);
      el.style.setProperty("--cr", `${(Math.random() - 0.5) * 14}deg`);
    });
    document.body.classList.add("chaos-mode");
    const bursts = setInterval(() => spawn(Math.random() * innerWidth, Math.random() * innerHeight, 30, 60, 5, 40), 260);
    later(5000, () => {
      clearInterval(bursts);
      document.body.classList.replace("chaos-mode", "chaos-out");
      shaken.forEach((el) => ["--cx", "--cy", "--cr"].forEach((name) => el.style.removeProperty(name)));
      later(700, () => { document.body.classList.remove("chaos-out"); chaosOn = false; });
    });
  }

  // Перешёл по карточке проекта — «Интерес к инди-студиям» (плашка — уже на странице проекта, куда он попал).
  // Отметка ставится при нажатии любой кнопкой (в т. ч. средней и с Ctrl — «открыть в новой вкладке») и живёт час
  document.querySelectorAll(".card, .spotlight").forEach((link) => {
    link.addEventListener("mousedown", (event) => { if (event.button <= 1) store.set("dgs-pending", `indie:${Date.now()}`); });
    link.addEventListener("click", () => store.set("dgs-pending", `indie:${Date.now()}`));  // клавиатура, касание
  });
  const pending = /^indie:(\d+)$/.exec(store.get("dgs-pending") || "");
  const fresh = pending && Date.now() - Number(pending[1]) < 3600 * 1000;
  // Открыл страницы всех проектов — «Интерес именно к DGS!»
  const project = document.querySelector("main[data-project]")?.dataset.project;
  if (project) {
    if (fresh) {
      whenVisible(700, () => {
        store.set("dgs-pending", "");  // отметку стираем, только когда достижение действительно выдано
        unlock("indie");
      });
    }
    const total = document.querySelectorAll(".site-footer nav:first-of-type a").length;
    let seen = [];
    try { seen = JSON.parse(store.get("dgs-seen") || "[]"); } catch { seen = []; }
    if (!seen.includes(project)) seen.push(project);
    store.set("dgs-seen", JSON.stringify(seen));
    if (total && seen.length >= total) whenVisible(1500, () => unlock("dgs"));
  } else if (pending && !fresh) {
    store.set("dgs-pending", "");  // старая отметка от прерванного перехода
  }

  // ---------------------------------------------------------------- список достижений (кнопка в подвале)
  const TROPHY = '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1.5A3 3 0 0 0 8 10.5M16 6h3.5v1.5A3 3 0 0 1 16 10.5M12 13v4M8.5 20h7M10 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
  const LOCK = '<path d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>';
  let panel = null;
  const renderPanel = () => {
    const got = ids.filter(isUnlocked).length;
    panel.innerHTML = `<div class="ach-body"><div class="ach-head"><h2>${ru ? "Достижения" : "Achievements"} <small>${got}/${ids.length}</small></h2>
      <button type="button" class="ach-close" aria-label="${ru ? "Закрыть" : "Close"}">✕</button></div>
      <p class="ach-lead">${ru ? "Секреты сайта: ищите, пробуйте, тыкайте. Подсказки — у тех, что ещё не открыты."
        : "Secrets of the site: explore, try, poke around. Locked ones come with a hint."}</p>
      <ul>${ids.map((id) => {
        const [name, text, hint] = ACHIEVEMENTS[id][ru ? "ru" : "en"];
        const open = isUnlocked(id);
        return `<li class="${open ? "open" : "locked"}"><span class="ach-ic"><svg viewBox="0 0 24 24" aria-hidden="true">${open ? TROPHY : LOCK}</svg></span>
          <span><b>${open ? name : "???"}</b><small>${open ? text : hint}</small></span></li>`;
      }).join("")}</ul></div>`;
    panel.querySelector(".ach-close").addEventListener("click", () => panel.close());
  };
  function updateAchButton() {
    const button = document.querySelector(".ach-open");
    if (!button || typeof HTMLDialogElement === "undefined") return;
    button.querySelector("b").textContent = `${ids.filter(isUnlocked).length}/${ids.length}`;
    button.hidden = false;
    if (panel && panel.open) {  // окно открыто (прочитали подсказку и сразу попробовали) — обновляем список на месте
      const { scrollTop } = panel;
      const focused = panel.contains(document.activeElement);
      renderPanel();
      panel.scrollTop = scrollTop;
      if (focused) panel.querySelector(".ach-close").focus({ preventScroll: true });  // innerHTML убрал кнопку, на которой стоял фокус
    }
  }
  const achButton = document.querySelector(".ach-open");
  if (achButton && typeof HTMLDialogElement !== "undefined") {
    panel = document.createElement("dialog");
    panel.className = "ach-panel";
    panel.setAttribute("aria-label", ru ? "Достижения" : "Achievements");
    document.body.append(panel);
    updateAchButton();
    achButton.addEventListener("click", () => {
      renderPanel();
      panel.showModal();
    });
    // Щелчок по затемнению вокруг окна закрывает его. Поля — у внутреннего блока, поэтому щелчок внутри окна
    // в сам <dialog> не попадает; выделение текста, отпущенное за краем окна, тоже не закрывает
    let pressedInside = false;
    panel.addEventListener("pointerdown", (event) => { pressedInside = event.target !== panel; });
    panel.addEventListener("click", (event) => {
      if (event.target === panel && !pressedInside) panel.close();
    });
  }

  // Вернулись кнопкой «Назад» (страница восстановлена из памяти браузера) или достижение пришло из другой вкладки
  addEventListener("pageshow", (event) => { if (event.persisted) updateAchButton(); });
  addEventListener("storage", (event) => { if (!event.key || event.key.startsWith("dgs-ach-")) updateAchButton(); });

  // ---------------------------------------------------------------- ночная сова: после 23:00 и до 5 утра
  const hour = new Date().getHours();
  let nightShown = false;
  try { nightShown = Boolean(sessionStorage.getItem("dgs-night")); } catch { nightShown = true; }  // иначе — на каждой странице
  if ((hour >= 23 || hour < 5) && !nightShown) {
    const owlRegion = document.createElement("div");  // область оповещений для экранного диктора — до появления совы
    owlRegion.setAttribute("aria-live", "polite");
    document.body.append(owlRegion);
    whenVisible(2500, () => {
      // Ушли на другую страницу раньше, а потом вернулись «Назад» — сова там уже была
      try { if (sessionStorage.getItem("dgs-night")) return; } catch { return; }
      try { sessionStorage.setItem("dgs-night", "1"); } catch { /* не страшно */ }
      const owl = make("div", "night-owl", `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" fill="currentColor"/></svg>
        <span>${ru ? "Ещё одну партию — и спать?" : "One more game, then bed?"}</span>
        <button type="button" aria-label="${ru ? "Закрыть" : "Close"}">✕</button>`);
      owl.lang = ru ? "ru" : "en";
      owl.querySelector("button").addEventListener("click", () => owl.remove());
      owlRegion.append(owl);
      requestAnimationFrame(() => requestAnimationFrame(() => owl.classList.add("show")));
      later(12000, () => { owl.classList.remove("show"); later(600, () => owl.remove()); });
      unlock("night");
    });
  }

  // ---------------------------------------------------------------- заставка как у DVD-плеера
  // Через минуту без движения логотип DISORDER отскакивает от краёв экрана и меняет цвет при каждом ударе.
  // Направление выбрано так, чтобы рано или поздно он попал точно в угол: в «развёрнутом» пространстве
  // (где отражения от стен — это просто продолжение прямой) угол экрана — это узлы сетки (k·W, m·H)
  const brandSvg = document.querySelector(".brand svg");
  if (!reduce && mouse && brandSvg) {
    const IDLE = 60000;
    let lastActive = Date.now();
    let saver = null;
    let anchor = null;  // где была мышь при последнем настоящем движении
    const noWheel = (event) => event.preventDefault();
    const stopSaver = () => {
      if (!saver) return;
      removeEventListener("wheel", noWheel, { capture: true });
      saver.stop = true;
      saver.node.remove();
      document.body.classList.remove("saver-on");
      // С попаданием в угол поздравляем, когда человек вернулся: под заставкой плашку не видно
      if (saver.corner) whenVisible(400, () => unlock("corner"));
      saver = null;
    };
    const wake = (event) => {
      if (event.type === "pointermove") {
        // Браузер может прислать «движение» без движения, когда меняется страница. Сдвиг считаем от точки
        // последнего настоящего движения, а не от прошлого события, — иначе медленное движение не заметно
        if (!anchor) {
          anchor = { x: event.clientX, y: event.clientY };
          return;
        }
        if (Math.hypot(event.clientX - anchor.x, event.clientY - anchor.y) <= 3) return;
        anchor = { x: event.clientX, y: event.clientY };
      }
      // Действие, которым будят заставку, — только чтобы разбудить: не листать страницу, не нажимать кнопку
      // в фокусе и не открывать ссылку под пальцем (щелчок касания приходит уже после того, как заставка исчезла).
      // Нажатие мыши не трогаем: его щелчка и так не будет — заставка, на которой нажали, уже удалена
      if (saver && event.type === "keydown") event.preventDefault();
      if (saver && event.type === "pointerdown" && event.pointerType !== "mouse") {
        const eat = (click) => { click.preventDefault(); click.stopPropagation(); };
        addEventListener("click", eat, { capture: true, once: true });
        later(1000, () => removeEventListener("click", eat, { capture: true }));
      }
      lastActive = Date.now();
      stopSaver();
    };
    ["pointermove", "pointerdown", "keydown", "wheel", "scroll", "touchstart", "resize"].forEach((type) => {
      addEventListener(type, wake, { passive: type !== "keydown" });  // keydown прокрутку не тормозит
    });
    document.addEventListener("visibilitychange", () => { lastActive = Date.now(); stopSaver(); });
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const fold = (v, size) => {  // точка развёрнутого пространства → место на экране
      const p = ((v % (2 * size)) + 2 * size) % (2 * size);
      return p <= size ? p : 2 * size - p;
    };
    const startSaver = () => {
      const node = make("div", "dvd-saver", `<div class="dvd-logo"></div>
        <p>${ru ? "Пошевелите мышью, чтобы вернуться" : "Move the mouse to come back"}</p>`);
      node.setAttribute("aria-hidden", "true");
      const logo = node.querySelector(".dvd-logo");
      const copy = brandSvg.cloneNode(true);
      copy.querySelectorAll("[style]").forEach((el) => el.removeAttribute("style"));  // без «дрожи» букв из шапки
      logo.append(copy);
      document.body.append(node);
      document.body.classList.add("saver-on");
      addEventListener("wheel", noWheel, { capture: true, passive: false });  // колесо будит, но не листает
      const lw = logo.offsetWidth;
      const lh = logo.offsetHeight;
      const W = node.clientWidth - lw;  // без полосы прокрутки: заставка закрывает только видимую часть окна
      const H = node.clientHeight - lh;
      const SPEED = 0.16;  // пикселей за миллисекунду — одинаково на мониторах 60 и 144 Гц
      const state = { node, stop: false, corner: false };
      saver = state;
      let x0 = W * (0.2 + Math.random() * 0.6);
      let y0 = H * (0.2 + Math.random() * 0.6);
      let hue = Math.random() * 360;
      let track;
      const aim = (fromX, fromY) => {
        // Новая цель — угол через 2–3 отскока по каждой оси. После угла старт сам стоит в узле сетки (fromX, fromY):
        // если по пути есть ещё узел (НОД смещений больше 1), логотип молча пролетел бы через угол — такие цели
        // отбрасываем
        const side = () => (2 + Math.floor(Math.random() * 2)) * (Math.random() < 0.5 ? -1 : 1);
        let kx;
        let ky;
        do {
          kx = side();
          ky = side();
        } while (fromX !== undefined && gcd(Math.abs(kx - fromX), Math.abs(ky - fromY)) !== 1);
        const tx = kx * W;
        const ty = ky * H;
        const dist = Math.hypot(tx - x0, ty - y0);
        const ux = (tx - x0) / dist;
        const uy = (ty - y0) / dist;
        // Клетку берём чуть впереди по пути: стоя ровно на границе (в углу), логотип ещё не «ударился» о стену
        track = { X: x0, Y: y0, tx, ty, ux, uy, left: dist,
          cellX: Math.floor((x0 + ux * 0.5) / W), cellY: Math.floor((y0 + uy * 0.5) / H) };
      };
      aim();
      let last = null;
      const frame = (now) => {
        if (state.stop) return;
        const dt = last === null ? 16 : Math.min(50, now - last);  // после паузы вкладки — без рывка
        last = now;
        const stepLength = Math.min(SPEED * dt, track.left);  // последний шаг — ровно до угла, без перелёта
        track.X += track.ux * stepLength;
        track.Y += track.uy * stepLength;
        track.left -= stepLength;
        const arrived = track.left < 1e-6;
        if (arrived) {
          track.X = track.tx;
          track.Y = track.ty;
        }
        // Клетка «развёртки» сменилась — был удар о стену: новый цвет. В самом углу считаем по точке чуть раньше,
        // иначе ровно на границе клетка «перескочит» и цвет сменится лишний раз
        const cellX = Math.floor((arrived ? track.X - track.ux * 0.5 : track.X) / W);
        const cellY = Math.floor((arrived ? track.Y - track.uy * 0.5 : track.Y) / H);
        if (cellX !== track.cellX || cellY !== track.cellY) {
          track.cellX = cellX;
          track.cellY = cellY;
          hue = (hue + 60 + Math.random() * 90) % 360;
        }
        const x = fold(track.X, W);
        const y = fold(track.Y, H);
        logo.style.transform = `translate(${x}px, ${y}px)`;
        logo.style.color = `hsl(${hue} 90% 66%)`;
        if (arrived) {  // точно в углу!
          hue = (hue + 120) % 360;
          node.classList.add("corner");
          later(900, () => node.classList.remove("corner"));
          spawn(x + lw / 2, y + lh / 2, 90, 40, 8, 70);
          state.corner = true;
          x0 = x;
          y0 = y;
          aim(Math.round(x / W), Math.round(y / H));
        }
        requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };
    setInterval(() => {
      if (saver || document.hidden || Date.now() - lastActive < IDLE) return;
      // Не мешаем: открыт список достижений, видео на весь экран или смотрят ролик (а не беззвучную петлю-витрину)
      const watching = [...document.querySelectorAll("video")]
        .some((video) => !video.paused && (!video.muted || !video.hasAttribute("data-autoplay")));
      if (watching || document.fullscreenElement || document.querySelector("dialog[open]")) return;
      if (innerWidth < 480 || innerHeight < 320) return;  // логотипу негде летать
      startSaver();
    }, 5000);
  }

  // ---------------------------------------------------------------- соцсети: Discord, itch.io, GitHub
  // Как самолётик Telegram: при наведении — свой маленький эффект. Все четыре увидели — «Душа компании»
  // На телефоне наведения нет — там засчитывается нажатие на ссылку, а плашка ждёт возвращения на сайт
  const SOCIALS = [["telegram", 'a[href*="t.me/"]'], ["discord", 'a[href*="discord.gg"]'],
    ["itch", '.community a[href*="itch.io"], .site-footer a[href*="itch.io"]'],
    ["github", '.community a[href*="github.com"], .site-footer a[href*="github.com"]']];
  const socialSeen = new Set();  // и в памяти: при заблокированном localStorage засчитывается хотя бы на этой странице
  function markSocial(kind) {
    let stored = [];
    try { stored = JSON.parse(store.get("dgs-social") || "[]"); } catch { stored = []; }
    if (kind) socialSeen.add(kind);
    const seen = new Set([...stored, ...socialSeen]);
    if (seen.size > stored.length) store.set("dgs-social", JSON.stringify([...seen]));
    if (!isUnlocked("social") && SOCIALS.every(([k]) => seen.has(k))) whenVisible(800, () => unlock("social"));
  }
  SOCIALS.forEach(([kind, selector]) => document.querySelectorAll(selector).forEach((link) => {
    link.addEventListener("click", () => markSocial(kind));
    link.addEventListener("pointerenter", (event) => { if (event.pointerType === "mouse") markSocial(kind); });
  }));
  if (store.get("dgs-social")) markSocial();
  const originOf = (link) => {  // центр значка и края самой ссылки — у них появляются облачка и квадратики
    const r = (link.querySelector("svg") || link).getBoundingClientRect();
    const box = link.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2, top: box.top, bottom: box.bottom };
  };
  const SOCIAL_FX = {
    discord(link) {  // над ссылкой — окошко чата, сообщения приходят одно за другим
      const { x, top, bottom } = originOf(link);
      const lines = ru ? ["го в войс?", "gg", "кто онлайн?", "ещё катку?", "ахаха", "бро, глянь"]
        : ["voice?", "gg", "who's online?", "one more game?", "lol", "bro, look"];
      const pick = [...lines].sort(() => Math.random() - 0.5).slice(0, 4);
      const box = make("div", "chat-fx");
      const below = top < 160;  // ссылка у верхнего края — облачка под ней, иначе уйдут за экран
      if (below) box.classList.add("below");
      Object.assign(box.style, { left: `${Math.max(110, Math.min(x, innerWidth - 110))}px`,
        top: `${below ? bottom + 10 : top - 10}px` });
      pick.forEach((text, i) => {
        const bubble = make("span", i % 2 ? "alt" : "", "");
        bubble.textContent = text;
        bubble.style.setProperty("--d", `${i * 320}ms`);
        box.append(bubble);
      });
      return [box, 2700];
    },
    itch(link) {  // из лавки вылетают монетки и картриджи, подпрыгивают и падают
      const { x, y } = originOf(link);
      const canvas = make("canvas", "plane-fx");
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = innerWidth * ratio;
      canvas.height = innerHeight * ratio;
      const ctx = canvas.getContext("2d");
      ctx.scale(ratio, ratio);
      const floor = y + 34;
      const items = Array.from({ length: 16 }, (_, i) => ({
        x, y, vx: (Math.random() - 0.5) * 7, vy: -5 - Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3,
        coin: i % 3 !== 0, bounced: false,
      }));
      run(1900, (t) => {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        ctx.globalAlpha = t > 1300 ? Math.max(0, 1 - (t - 1300) / 600) : 1;
        for (const it of items) {
          it.vy += 0.35;
          it.x += it.vx;
          it.y += it.vy;
          it.rot += it.vr;
          if (it.y > floor && it.vy > 0 && !it.bounced) { it.vy *= -0.45; it.vx *= 0.7; it.bounced = true; }
          ctx.save();
          ctx.translate(it.x, it.y);
          ctx.rotate(it.rot);
          if (it.coin) {  // монетка: сплющивается, будто вращается
            ctx.scale(Math.abs(Math.cos(it.rot * 2)) * 0.8 + 0.2, 1);
            ctx.fillStyle = "#fbbf24";
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = "#b45309"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.stroke();
          } else {  // картридж
            ctx.fillStyle = "#fa5c5c";
            ctx.fillRect(-8, -10, 16, 20);
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(-5, -6, 10, 7);
            ctx.fillStyle = "#7f1d1d";
            ctx.fillRect(-6, 7, 12, 3);
          }
          ctx.restore();
        }
      }, () => canvas.remove());
      return [canvas, 2000];
    },
    github(link) {  // волна зелёных квадратиков, как график коммитов
      const { x, top } = originOf(link);
      const cols = 14;
      const rows = 7;
      const box = make("div", "commits-fx");
      const width = cols * 13 + 15;  // клетки 10 px + промежутки 3 px + поля
      const height = rows * 13 + 15;
      Object.assign(box.style, { left: `${Math.max(12, Math.min(x - 20, innerWidth - width - 12))}px`,
        top: `${Math.max(12, top - height - 10)}px` });
      const greens = ["#0e4429", "#006d32", "#26a641", "#39d353", "#39d353"];
      for (let c = 0; c < cols; c += 1) {
        for (let r = 0; r < rows; r += 1) {
          const cell = document.createElement("i");
          cell.style.background = Math.random() < 0.2 ? "#1d1631" : rand(greens);
          cell.style.setProperty("--d", `${(c + r) * 28}ms`);
          box.append(cell);
        }
      }
      return [box, 2400];
    },
  };
  if (!reduce && mouse) {
    const playing = new Set();  // пока эффект идёт, повторное наведение его не перезапускает
    SOCIALS.filter(([kind]) => SOCIAL_FX[kind]).forEach(([kind, selector]) => {
      document.querySelectorAll(selector).forEach((link) => link.addEventListener("pointerenter", (event) => {
        if (event.pointerType !== "mouse" || playing.has(kind)) return;
        playing.add(kind);
        const [node, ms] = SOCIAL_FX[kind](link);
        node.setAttribute("aria-hidden", "true");
        document.body.append(node);
        later(ms, () => { node.remove(); playing.delete(kind); });
      }));
    });
  }

  // ---------------------------------------------------------------- змейка на странице 404
  const board = document.getElementById("snake");
  if (board) {
    board.closest(".snake-box").hidden = false;  // без JavaScript играть нечем — секция скрыта в разметке
    const ctx = board.getContext("2d");
    const COLS = 20;
    const ROWS = 14;
    const scoreLabel = document.getElementById("snake-score");
    let cell = 0;
    let fitted = "";
    const fit = () => {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const width = board.clientWidth;  // без рамки (у поля content-box) — буфер совпадает с видимым размером
      fitted = `${width}x${ratio}`;
      cell = width / COLS;
      board.width = Math.round(width * ratio);
      board.height = Math.round(cell * ROWS * ratio);
      board.style.height = `${cell * ROWS}px`;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    let snake;
    let dir;
    let queue = [];  // до двух поворотов про запас: быстрое «вверх-влево» между шагами не теряется
    let food;
    let score;
    let playing = false;
    let diedAt = 0;
    const again = mouse ? (ru ? "пробел или щелчок" : "space or click") : (ru ? "коснитесь поля" : "tap the board");
    let banner = mouse ? (ru ? "Змейка DISORDER\nСтрелки или WASD — начать" : "DISORDER snake\nArrows or WASD to start")
      : (ru ? "Змейка DISORDER\nКоснитесь поля — начать" : "DISORDER snake\nTap the board to start");
    let timer = null;
    const place = () => {
      if (snake.length >= COLS * ROWS) {  // всё поле занято — еде места нет
        food = [-1, -1];
        return;
      }
      do { food = [Math.floor(Math.random() * COLS), Math.floor(Math.random() * ROWS)]; }
      while (snake.some(([sx, sy]) => sx === food[0] && sy === food[1]));
    };
    const draw = (message) => {
      ctx.fillStyle = "#0d0a18";
      ctx.fillRect(0, 0, COLS * cell, ROWS * cell);
      ctx.strokeStyle = "rgba(139, 92, 246, .08)";
      for (let i = 1; i < COLS; i += 1) { ctx.beginPath(); ctx.moveTo(i * cell, 0); ctx.lineTo(i * cell, ROWS * cell); ctx.stroke(); }
      for (let i = 1; i < ROWS; i += 1) { ctx.beginPath(); ctx.moveTo(0, i * cell); ctx.lineTo(COLS * cell, i * cell); ctx.stroke(); }
      if (snake) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#d946ef";
        ctx.fillStyle = "#f0abfc";
        ctx.fillRect(food[0] * cell + 4, food[1] * cell + 4, cell - 8, cell - 8);
        snake.forEach(([sx, sy], i) => {
          const k = i / Math.max(1, snake.length - 1);
          ctx.shadowColor = ctx.fillStyle = `hsl(${265 - k * 80} 90% ${68 - k * 10}%)`;
          ctx.fillRect(sx * cell + 2, sy * cell + 2, cell - 4, cell - 4);
        });
        ctx.shadowBlur = 0;
      }
      if (message) {
        ctx.fillStyle = "rgba(11, 8, 20, .72)";
        ctx.fillRect(0, 0, COLS * cell, ROWS * cell);
        ctx.fillStyle = "#ffffff";
        ctx.font = `700 ${Math.max(14, cell * 0.8)}px "Segoe UI", system-ui, sans-serif`;
        ctx.textAlign = "center";
        message.split("\n").forEach((line, i) => ctx.fillText(line, (COLS * cell) / 2, (ROWS * cell) / 2 + (i - 0.3) * cell * 1.3));
      }
    };
    const start = (first) => {  // first — направление клавиши, которой начали
      const left = first && first[0] === -1;
      snake = left ? [[13, 7], [14, 7], [15, 7]] : [[6, 7], [5, 7], [4, 7]];  // «влево» — змейка смотрит влево
      dir = first && first[0] !== 1 && !left ? first : [left ? -1 : 1, 0];
      queue = [];
      score = 0;
      scoreLabel.textContent = "0";
      place();
      playing = true;
      board.classList.add("playing");  // во время игры свайп по полю не листает страницу
      document.body.classList.add("snake-on");  // и плашки выезжают сверху, чтобы не закрыть поле
      banner = null;
      clearTimeout(timer);
      timer = setTimeout(step, 130);
      draw();
    };
    // Сразу после проигрыша новая игра не начинается: зажатая стрелка или лишний свайп не сотрут счёт
    const canRestart = () => performance.now() - diedAt > 700;
    const step = () => {
      if (queue.length) dir = queue.shift();
      const head = [snake[0][0] + dir[0], snake[0][1] + dir[1]];
      const eating = head[0] === food[0] && head[1] === food[1];
      const body = eating ? snake : snake.slice(0, -1);  // хвост в этот же шаг уходит — в его клетку можно
      const dead = head[0] < 0 || head[1] < 0 || head[0] >= COLS || head[1] >= ROWS
        || body.some(([sx, sy]) => sx === head[0] && sy === head[1]);
      if (dead) {
        playing = false;
        board.classList.remove("playing");
        document.body.classList.remove("snake-on");
        diedAt = performance.now();
        banner = ru ? `Счёт: ${score}\nЕщё раз — ${again}` : `Score: ${score}\nAgain: ${again}`;
        draw(banner);
        return;
      }
      snake.unshift(head);
      if (eating) {
        score += 1;
        scoreLabel.textContent = String(score);
        if (score >= 10) unlock("snake");
        place();
      } else {
        snake.pop();
      }
      draw();
      timer = setTimeout(step, Math.max(70, 130 - score * 4));  // с каждым очком чуть быстрее
    };
    const turn = (dx, dy) => {
      if (!playing) return;
      const prev = queue.length ? queue[queue.length - 1] : dir;
      if ((dx === prev[0] && dy === prev[1]) || (dx === -prev[0] && dy === -prev[1])) return;  // назад в себя нельзя
      if (queue.length < 2) queue.push([dx, dy]);
    };
    const KEYS = { ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1], ArrowLeft: [-1, 0], KeyA: [-1, 0],
      ArrowRight: [1, 0], KeyD: [1, 0] };
    const inView = () => {  // поле целиком на экране (или занимает весь экран, если выше окна)
      const r = board.getBoundingClientRect();
      return Math.min(r.bottom, innerHeight) - Math.max(r.top, 0) >= Math.min(r.height, innerHeight) - 2;
    };
    addEventListener("keydown", (event) => {
      if (event.ctrlKey || event.altKey || event.metaKey) return;  // Alt+← — «назад» в браузере, не трогаем
      if (event.target.closest?.("input, textarea, [contenteditable]")) return;
      if (!playing && !inView()) return;  // поле не на экране — клавиши листают страницу (даже с фокусом на поле)
      if (KEYS[event.code]) {
        event.preventDefault();  // стрелки двигают змейку, а не страницу
        if (playing) turn(...KEYS[event.code]);
        else if (!event.repeat && canRestart()) start(KEYS[event.code]);
      } else if ((event.code === "Space" || event.code === "Enter") && [document.body, board].includes(event.target)) {
        event.preventDefault();  // Enter на ссылке или кнопке по-прежнему переходит по ней
        if (!playing && !event.repeat && canRestart()) start();
      }
    });
    document.addEventListener("visibilitychange", () => {  // ушли на другую вкладку — змейка ждёт, а не врезается
      if (!playing) return;
      clearTimeout(timer);
      if (!document.hidden) timer = setTimeout(step, 700);
    });
    board.addEventListener("click", () => { if (!playing && canRestart()) start(); });
    let touch = null;  // на телефоне — свайпы по полю
    board.addEventListener("touchstart", (event) => {  // начинает игру касание (click), а свайпы — только в игре
      touch = playing ? event.touches[0] : null;
    }, { passive: true });
    board.addEventListener("touchmove", (event) => {
      if (!touch || !playing) return;
      event.preventDefault();  // пока палец на поле, страница не прокручивается
      const t2 = event.touches[0];
      const dx = t2.clientX - touch.clientX;
      const dy = t2.clientY - touch.clientY;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
      if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0); else turn(0, Math.sign(dy));
      touch = t2;
    }, { passive: false });
    const refit = () => {  // ширина поля или плотность экрана изменились — перерисовать в новом размере
      if (`${board.clientWidth}x${Math.min(2, window.devicePixelRatio || 1)}` === fitted) return;
      fit();
      draw(banner);
    };
    fit();
    draw(banner);
    if ("ResizeObserver" in window) new ResizeObserver(refit).observe(board);
    addEventListener("resize", refit);
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
