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
    indie: { ru: ["Интерес к инди-студиям", "Вы перешли по карточке проекта, чтобы узнать о нём больше."],
             en: ["Into indie studios", "You opened a project card to learn more."] },
    dgs: { ru: ["Интерес именно к DGS!", "Вы посмотрели все проекты Disorder Game Studio."],
           en: ["Into DGS specifically!", "You checked out every Disorder Game Studio project."] },
    pixel: { ru: ["Пиксельный художник", "Нарисовали курсором целую картину."],
             en: ["Pixel artist", "You painted a whole picture with your cursor."] },
    heart: { ru: ["С любовью", "Самолётик из Telegram нарисовал вам сердечко."],
             en: ["With love", "The Telegram plane drew you a heart."] },
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
  const toast = (id) => {
    const [name, text] = ACHIEVEMENTS[id][ru ? "ru" : "en"];
    const got = ids.filter((key) => unlocked.has(key) || store.get(`dgs-ach-${key}`)).length;
    const box = document.createElement("div");
    box.className = "ach-toast";
    box.setAttribute("role", "status");
    box.innerHTML = `<div class="ach-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H4.5v1.5A3 3 0 0 0 8 10.5M16 6h3.5v1.5A3 3 0 0 1 16 10.5M12 13v4M8.5 20h7M10 17h4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div><small>${ru ? "Достижение получено" : "Achievement unlocked"} · ${got}/${ids.length}</small><b></b><span></span></div>`;
    box.querySelector("b").textContent = name;
    box.querySelector("span").textContent = text;
    // Несколько плашек сразу — стопкой в общем контейнере: новая сверху, ушедшая освобождает место
    let stack = document.querySelector(".ach-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "ach-stack";
      document.body.append(stack);
    }
    stack.prepend(box);
    requestAnimationFrame(() => requestAnimationFrame(() => box.classList.add("show")));
    setTimeout(() => { box.classList.remove("show"); setTimeout(() => box.remove(), 600); }, 5200);
  };
  function unlock(id) {
    if (unlocked.has(id)) return;
    unlocked.add(id);  // и уже полученные раньше — дальше без чтения localStorage
    if (store.get(`dgs-ach-${id}`)) return;
    store.set(`dgs-ach-${id}`, "1");
    toast(id);
    chime();
  }
  // Плашку показываем, только когда вкладку видно: проект, открытый в фоновой вкладке, поздравит при переходе в неё
  const whenVisible = (ms, fn) => {
    if (!document.hidden) {
      later(ms, fn);
      return;
    }
    const onShow = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onShow);
      later(ms, fn);
    };
    document.addEventListener("visibilitychange", onShow);
  };

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
