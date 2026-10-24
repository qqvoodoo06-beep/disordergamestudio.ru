"""Готовит картинки и видео для сайта: скачивает/читает исходники, делает WebP нужных размеров, обложки и
картинки для соцсетей (Open Graph). Результат — docs/img, docs/media и content/media.json для build.py.

Запуск: python tools/media.py   (нужны Pillow и ffmpeg; уже готовые файлы не пересоздаются, --force — заново)
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import subprocess
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
CACHE = ROOT / "assets-src" / "cache"
GENERATED = ROOT / "assets-src" / "generated"
BRAND = ROOT / "assets-src" / "brand"
FORCE = "--force" in sys.argv
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT = r"C:\Windows\Fonts\segoeui.ttf"
FONT_BLACK = r"C:\Windows\Fonts\seguibl.ttf"
BG = (14, 10, 24)

spec = importlib.util.spec_from_file_location("data", ROOT / "content" / "data.py")
data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(data)


def load(src: str) -> Image.Image:
    """Картинка по ссылке (кэшируется в assets-src/cache) или с диска."""
    if src.startswith("http"):
        CACHE.mkdir(parents=True, exist_ok=True)
        cached = CACHE / (hashlib.sha1(src.encode()).hexdigest()[:16] + Path(src.split("?")[0]).suffix.lower())
        if not cached.exists():
            request = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0 (DGS site builder)"})
            cached.write_bytes(urllib.request.urlopen(request, timeout=60).read())
        src = str(cached)
    image = Image.open(src)
    image.load()
    return image.convert("RGBA") if image.mode in ("RGBA", "LA", "P") else image.convert("RGB")


def tag(src: str) -> str:
    """Короткая метка исходника в имени файла: поменяли картинку в data.py — получится новый файл, а не старый из кэша."""
    path = Path(src)
    stamp = f"{path.stat().st_mtime_ns}" if not src.startswith(("http", "gen:")) and path.exists() else ""
    return hashlib.sha1((src + stamp).encode()).hexdigest()[:6]  # с диска — учитываем и время изменения файла


def flat(image: Image.Image) -> Image.Image:
    if image.mode == "RGBA":
        back = Image.new("RGB", image.size, BG)
        back.paste(image, mask=image.getchannel("A"))
        return back
    return image


def save_webp(image: Image.Image, path: Path, width: int, quality: int = 82) -> dict:
    """Уменьшает до width (не увеличивает) и сохраняет WebP. Возвращает путь от docs и размеры."""
    path.parent.mkdir(parents=True, exist_ok=True)
    if image.width > width:
        image = image.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
    if FORCE or not path.exists():
        flat(image).save(path, "WEBP", quality=quality, method=6)
    return {"src": path.relative_to(DOCS).as_posix(), "w": image.width, "h": image.height}


def cover_crop(image: Image.Image, width: int, height: int) -> Image.Image:
    ratio = max(width / image.width, height / image.height)
    resized = image.resize((round(image.width * ratio), round(image.height * ratio)), Image.LANCZOS)
    left, top = (resized.width - width) // 2, (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def gradient(size: tuple[int, int], top: tuple, bottom: tuple) -> Image.Image:
    w, h = size
    base = Image.new("RGB", (1, h))
    for y in range(h):
        k = y / max(1, h - 1)
        base.putpixel((0, y), tuple(round(top[i] + (bottom[i] - top[i]) * k) for i in range(3)))
    return base.resize(size)


def glow(image: Image.Image, center: tuple[int, int], radius: int, color: tuple, alpha: int) -> None:
    layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=color + (alpha,))
    layer = layer.filter(ImageFilter.GaussianBlur(radius * 0.45))
    image.alpha_composite(layer)


def wrap(draw: ImageDraw.ImageDraw, text: str, fnt, width: int) -> list[str]:
    lines, line = [], ""
    for word in text.split():
        trial = f"{line} {word}".strip()
        if draw.textlength(trial, font=fnt) <= width or not line:
            line = trial
        else:
            lines.append(line)
            line = word
    return lines + [line] if line else lines


# --------------------------------------------------------------------------- свои обложки 1260×1000

def gen_hoits_cover(lang: str) -> Image.Image:
    hero = load(r"D:\software\hoits\Steam\capsules\library_hero.png").convert("RGBA")
    canvas = cover_crop(hero, 1260, 1000).convert("RGBA")
    shade = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
    ImageDraw.Draw(shade).rectangle((0, 560, 1260, 1000), fill=(8, 6, 12, 0))
    for y in range(520, 1000):  # затемнение снизу под логотип
        ImageDraw.Draw(shade).line((0, y, 1260, y), fill=(8, 6, 12, round(230 * (y - 520) / 480)))
    canvas.alpha_composite(shade)
    logo_src = data.PROJECTS[0]["media"]["logo"][lang]
    logo = load(logo_src).convert("RGBA")
    logo = logo.resize((900, round(logo.height * 900 / logo.width)), Image.LANCZOS)
    canvas.alpha_composite(logo, ((1260 - logo.width) // 2, 1000 - logo.height - 70))
    return canvas


def gen_music_lotto_cover(lang: str) -> Image.Image:
    canvas = gradient((1260, 1000), (22, 14, 44), (8, 18, 28)).convert("RGBA")
    glow(canvas, (330, 260), 380, (124, 58, 237), 150)
    glow(canvas, (980, 760), 360, (20, 184, 166), 120)
    cells = Image.new("RGBA", canvas.size, (0, 0, 0, 0))  # полупрозрачное рисуем отдельным слоем и накладываем
    draw = ImageDraw.Draw(cells)
    # Карточка лото: 5×5 клеток, часть закрыта
    cell, gap = 104, 14
    left, top = 630 - (cell * 5 + gap * 4) // 2, 330
    marked = {(0, 0), (1, 1), (2, 2), (3, 3), (4, 4), (0, 3), (2, 4), (4, 1)}
    for r in range(5):
        for c in range(5):
            x, y = left + c * (cell + gap), top + r * (cell + gap)
            on = (r, c) in marked
            fill = (139, 92, 246, 235) if on else (255, 255, 255, 22)
            outline = (196, 181, 253, 255) if on else (255, 255, 255, 60)
            draw.rounded_rectangle((x, y, x + cell, y + cell), 18, fill=fill, outline=outline, width=3)
            if on:  # нота в закрытой клетке
                cx, cy = x + cell // 2, y + cell // 2
                draw.ellipse((cx - 22, cy + 4, cx + 2, cy + 24), fill=(255, 255, 255, 255))
                draw.rectangle((cx - 3, cy - 30, cx + 2, cy + 14), fill=(255, 255, 255, 255))
                draw.polygon([(cx - 3, cy - 30), (cx + 24, cy - 20), (cx + 24, cy - 8), (cx + 2, cy - 18)],
                             fill=(255, 255, 255, 255))
    canvas.alpha_composite(cells)
    draw = ImageDraw.Draw(canvas)
    title = "Музыкальное лото" if lang == "ru" else "Music Lotto"
    fnt = font(FONT_BLACK, 104 if lang == "ru" else 120)
    width = draw.textlength(title, font=fnt)
    draw.text(((1260 - width) / 2, 120), title, font=fnt, fill=(255, 255, 255, 255))
    sub = "угадай песню — закрой клетку" if lang == "ru" else "guess the song, mark the square"
    sfnt = font(FONT, 44)
    draw.text(((1260 - draw.textlength(sub, font=sfnt)) / 2, 248), sub, font=sfnt, fill=(167, 243, 208, 255))
    return canvas


GENERATORS = {"gen:hoits-cover": gen_hoits_cover, "gen:music-lotto-cover": gen_music_lotto_cover}


# --------------------------------------------------------------------------- картинки для соцсетей 1200×630

def og_image(path: Path, title: str, subtitle: str, cover: Image.Image | None, back: Image.Image | None,
             accent: str, collage: list[Image.Image] | None = None) -> dict:
    if not FORCE and path.exists():
        return {"src": path.relative_to(DOCS).as_posix(), "w": 1200, "h": 630}
    canvas = Image.new("RGBA", (1200, 630), BG + (255,))
    if back is not None:
        bg = cover_crop(back.convert("RGBA"), 1200, 630).filter(ImageFilter.GaussianBlur(6))
        canvas.alpha_composite(bg)
        canvas.alpha_composite(Image.new("RGBA", (1200, 630), BG + (190,)))
    rgb = tuple(int(accent[i:i + 2], 16) for i in (1, 3, 5))
    glow(canvas, (220, 120), 360, rgb, 90)
    draw = ImageDraw.Draw(canvas)
    text_width = 620 if cover is not None or collage else 1040
    for index, image in enumerate((collage or [])[:4]):  # главная: обложки проектов плиткой 2×2
        tile = cover_crop(image.convert("RGBA"), 236, 188)
        mask = Image.new("L", tile.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, tile.width, tile.height), 16, fill=255)
        canvas.paste(tile, (690 + (index % 2) * 252, 110 + (index // 2) * 204), mask)
    if cover is not None:
        c = cover.convert("RGBA")
        c = c.resize((470, round(c.height * 470 / c.width)), Image.LANCZOS)
        if c.height > 520:
            c = cover_crop(c, 470, 520)
        mask = Image.new("L", c.size, 0)
        ImageDraw.Draw(mask).rounded_rectangle((0, 0, c.width, c.height), 22, fill=255)
        shadow = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        x, y = 1200 - c.width - 60, (630 - c.height) // 2
        ImageDraw.Draw(shadow).rounded_rectangle((x + 8, y + 16, x + c.width + 8, y + c.height + 16), 22,
                                                 fill=(0, 0, 0, 150))
        canvas.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(14)))
        canvas.paste(c, (x, y), mask)
    logo = Image.open(BRAND / "logo-disorder-white.png").convert("RGBA")
    logo = logo.resize((260, round(logo.height * 260 / logo.width)), Image.LANCZOS)
    canvas.alpha_composite(logo, (60, 56))
    size = 72
    while True:  # заголовок — не больше двух строк
        tfnt = font(FONT_BOLD, size)
        lines = wrap(draw, title, tfnt, text_width)
        if len(lines) <= 2 or size <= 44:
            break
        size -= 4
    y = 196
    for line in lines[:3]:
        draw.text((60, y), line, font=tfnt, fill=(255, 255, 255, 255))
        y += round(size * 1.14)
    sfnt = font(FONT, 29)
    sub_lines = wrap(draw, subtitle, sfnt, text_width)
    if len(sub_lines) > 2:  # подзаголовок — не больше двух строк, лишнее за многоточием
        sub_lines = sub_lines[:2]
        while draw.textlength(sub_lines[1] + "…", font=sfnt) > text_width:
            sub_lines[1] = sub_lines[1].rsplit(" ", 1)[0]
        sub_lines[1] += "…"
    for line in sub_lines:
        draw.text((60, y + 12), line, font=sfnt, fill=(196, 181, 253, 255))
        y += 40
    draw.text((60, 560), "Disorder Game Studio", font=font(FONT_BOLD, 26), fill=(167, 139, 250, 255))
    path.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(path, "JPEG", quality=88, optimize=True, progressive=True)
    return {"src": path.relative_to(DOCS).as_posix(), "w": 1200, "h": 630}


# --------------------------------------------------------------------------- видео

def video(src: str, out: Path, loop: bool, poster_at: float | None = None) -> dict:
    """MP4 для сайта (H.264, 720p, без звука у зацикленных) и кадр-заставка WebP."""
    out.parent.mkdir(parents=True, exist_ok=True)
    poster = out.with_suffix(".webp")
    if FORCE or not out.exists():
        args = ["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-vf",
                "scale='min(1280,iw)':-2:flags=lanczos,format=yuv420p", "-c:v", "libx264", "-preset", "slow",
                "-crf", "26" if not loop else "28", "-movflags", "+faststart"]
        args += ["-an"] if loop else ["-c:a", "aac", "-b:a", "96k"]
        subprocess.run(args + [str(out)], check=True)
    if FORCE or not poster.exists():
        frame = out.with_suffix(".png")
        at = poster_at if poster_at is not None else (1.2 if loop else 4)
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-ss", str(at), "-i", str(out),
                        "-frames:v", "1", str(frame)], check=True)
        Image.open(frame).convert("RGB").save(poster, "WEBP", quality=80, method=6)
        frame.unlink()
    with Image.open(poster) as p:
        w, h = p.size
    probe = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(out)],
                           capture_output=True, text=True)
    duration = float(probe.stdout.strip() or 0)
    return {"src": out.relative_to(DOCS).as_posix(), "poster": poster.relative_to(DOCS).as_posix(), "w": w, "h": h,
            "size_mb": round(out.stat().st_size / 1048576, 1), "loop": loop, "duration": round(duration, 1)}


# --------------------------------------------------------------------------- всё вместе

def main() -> None:
    manifest = {"projects": {}}
    for project in data.PROJECTS:
        slug, media = project["slug"], project["media"]
        folder = DOCS / "img" / slug
        entry = {"cover": {}, "hero": None, "shots": [], "video": None, "og": {}}
        covers = {}
        for lang in ("ru", "en"):
            src = media["cover"]["src"]
            if src in GENERATORS:
                GENERATED.mkdir(parents=True, exist_ok=True)
                png = GENERATED / f"{slug}-cover-{lang}.png"
                if FORCE or not png.exists():
                    GENERATORS[src](lang).convert("RGB").save(png)
                image, suffix = load(str(png)), f"-{lang}"
            else:
                image, suffix = load(src), ""
            covers[lang] = image
            entry["cover"][lang] = [save_webp(image, folder / f"cover{suffix}-{tag(src)}-{w}.webp", w) for w in (480, 960)]
        hero = load(media["hero"]["src"])
        entry["hero"] = [save_webp(hero, folder / f"hero-{tag(media['hero']['src'])}-{w}.webp", w, 78) for w in (960, 1920)]
        for index, shot in enumerate(media["shots"], 1):
            image = load(shot["src"])
            name = f"shot-{index}-{tag(shot['src'])}"
            entry["shots"].append({
                "thumb": save_webp(image, folder / f"{name}-640.webp", 360 if shot.get("portrait") else 640),
                "full": save_webp(image, folder / f"{name}-1600.webp", 1600, 85),
                "ru": shot["ru"], "en": shot["en"], "lang": shot.get("lang"), "portrait": bool(shot.get("portrait")),
            })
        if media.get("video"):
            v = media["video"]
            entry["video"] = video(v["src"], DOCS / "media" / f"{slug}.mp4", v.get("loop", False), v.get("poster_at"))
            entry["video"].update(ru=v["ru"], en=v["en"])
        for lang in ("ru", "en"):
            text = project[lang]
            entry["og"][lang] = og_image(DOCS / "img" / "og" / f"{slug}-{lang}.jpg", text["title"], text["tagline"],
                                         covers[lang], hero, project["accent"])
        manifest["projects"][slug] = entry
        print(f"{slug}: обложка, фон, {len(entry['shots'])} скриншотов" + (", видео" if entry["video"] else ""))
    studio = data.STUDIO
    back = load(data.PROJECTS[0]["media"]["hero"]["src"])
    manifest["og"] = {}
    for lang in ("ru", "en"):
        tiles = [load(str(DOCS / manifest["projects"][p["slug"]]["cover"][lang][-1]["src"])) for p in data.PROJECTS[:4]]
        manifest["og"][lang] = og_image(DOCS / "img" / "og" / f"home-{lang}.jpg", studio["name"],
                                        studio[lang]["tagline"], None, back, "#8b5cf6", tiles)
    # favicon.ico в корне — его запрашивают напрямую старые браузеры и некоторые боты
    Image.open(DOCS / "assets" / "icon-192.png").save(DOCS / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])
    (ROOT / "content" / "media.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1), encoding="utf-8")
    total = sum(f.stat().st_size for f in (DOCS / "img").rglob("*") if f.is_file()) / 1048576
    print(f"готово: content/media.json, картинки {total:.1f} МБ")


if __name__ == "__main__":
    main()
