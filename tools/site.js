// Галерея скриншотов: открывает картинку крупно, листается стрелками, закрывается Esc или щелчком по фону.
// Без JavaScript ссылки просто открывают картинку целиком.
(() => {
  const ru = document.documentElement.lang === "ru";
  const t = ru ? { title: "Скриншот", prev: "Назад", next: "Вперёд", close: "Закрыть" }
               : { title: "Screenshot", prev: "Previous", next: "Next", close: "Close" };

  // Зацикленные ролики не запускаем сами, если в системе включено «уменьшить движение»
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll("video[data-autoplay]").forEach((video) => {
      video.removeAttribute("autoplay");
      video.pause();
    });
  }

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
