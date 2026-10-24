"""Фирменные картинки сайта из букв логотипа DISORDER (те же, что в заставке GameShelf).

Запуск — Python с PySide6 (например, из окружения GameShelf):
    G:\\D\\Новая папка\\GameShelf\\.venv\\Scripts\\python.exe tools\\brand.py
Создаёт docs/assets/logo-disorder.svg, favicon.svg, PNG-иконки и белый логотип для картинок соцсетей.
"""
import os
import sys
from pathlib import Path

os.environ.setdefault("QT_QPA_PLATFORM", "offscreen")
ROOT = Path(__file__).resolve().parent.parent
GAMESHELF = Path(r"G:\D\Новая папка\GameShelf")
sys.path.insert(0, str(GAMESHELF))

from PySide6.QtCore import QPointF, QRectF, Qt  # noqa: E402
from PySide6.QtGui import (QColor, QGuiApplication, QImage, QLinearGradient, QPainter, QPainterPath,  # noqa: E402
                           QTransform)

app = QGuiApplication([])
from gameshelf.ui import logotype  # noqa: E402

ASSETS = ROOT / "docs" / "assets"
BRAND = ROOT / "assets-src" / "brand"
ASSETS.mkdir(parents=True, exist_ok=True)
BRAND.mkdir(parents=True, exist_ok=True)
VIOLET, MAGENTA = "#8b5cf6", "#d946ef"


def path_d(path: QPainterPath) -> str:
    out, i, n = [], 0, path.elementCount()
    while i < n:
        e = path.elementAt(i)
        if e.type == QPainterPath.ElementType.MoveToElement:
            if out:
                out.append("Z")
            out.append(f"M{e.x:.1f} {e.y:.1f}")
        elif e.type == QPainterPath.ElementType.LineToElement:
            out.append(f"L{e.x:.1f} {e.y:.1f}")
        elif e.type == QPainterPath.ElementType.CurveToElement:
            c2, end = path.elementAt(i + 1), path.elementAt(i + 2)
            out.append(f"C{e.x:.1f} {e.y:.1f} {c2.x:.1f} {c2.y:.1f} {end.x:.1f} {end.y:.1f}")
            i += 2
        i += 1
    out.append("Z")
    return "".join(out)


def disorder_paths(height: float, chaos: bool, pad: float) -> tuple[list[QPainterPath], float, float]:
    """Буквы слова со сдвигами и наклонами «беспорядка» (как в заставке), уже на своих местах."""
    paths = []
    for index, (_letter, path, x, width) in enumerate(logotype.word("DISORDER", height)):
        dy, angle = logotype.DISORDER_JITTER[index] if chaos else (0, 0.0)
        t = QTransform()
        t.translate(pad + x + width / 2, pad + dy * height / 100 + height / 2)
        t.rotate(angle)
        t.translate(-width / 2, -height / 2)
        paths.append(t.map(path))
    return paths, logotype.word_width("DISORDER", height) + pad * 2, height + pad * 2


# --- логотип для шапки сайта: currentColor, чтобы цвет задавал CSS
paths, w, h = disorder_paths(100, True, 8)
(ASSETS / "logo-disorder.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" role="img" aria-label="Disorder">'
    f'<path fill="currentColor" d="{" ".join(path_d(p) for p in paths)}"/></svg>\n', encoding="utf-8")

# --- белый логотип с цветным «сбоем» (для картинок соцсетей), около 2500 px шириной
S = 6
paths, w, h = disorder_paths(100, True, 8)
image = QImage(int(w * S), int(h * S), QImage.Format.Format_ARGB32_Premultiplied)
image.fill(Qt.GlobalColor.transparent)
p = QPainter(image)
p.setRenderHint(QPainter.RenderHint.Antialiasing)
p.scale(S, S)
for dx, color in ((-2.2, QColor(217, 70, 239, 200)), (2.2, QColor(34, 211, 238, 170))):
    p.save()
    p.translate(dx, 0)
    for path in paths:
        p.fillPath(path, color)
    p.restore()
for path in paths:
    p.fillPath(path, QColor("#ffffff"))
p.end()
image.save(str(BRAND / "logo-disorder-white.png"))

# --- значок сайта: буква D на фиолетово-розовом квадрате
d_path, d_width = logotype.glyph("D")
size = 64
scale = 40 / logotype.CAP
t = QTransform()
t.translate((size - d_width * scale) / 2, (size - logotype.CAP * scale) / 2)
t.scale(scale, scale)
d_mapped = t.map(d_path)
(ASSETS / "favicon.svg").write_text(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {size} {size}">'
    f'<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="{VIOLET}"/>'
    f'<stop offset="1" stop-color="{MAGENTA}"/></linearGradient></defs>'
    f'<rect width="{size}" height="{size}" rx="14" fill="url(#g)"/>'
    f'<path fill="#fff" d="{path_d(d_mapped)}"/></svg>\n', encoding="utf-8")


def icon_png(px: int, name: str, radius_ratio: float = 14 / 64) -> None:
    img = QImage(px, px, QImage.Format.Format_ARGB32_Premultiplied)
    img.fill(Qt.GlobalColor.transparent)
    q = QPainter(img)
    q.setRenderHint(QPainter.RenderHint.Antialiasing)
    gradient = QLinearGradient(QPointF(0, 0), QPointF(px, px))
    gradient.setColorAt(0, QColor(VIOLET))
    gradient.setColorAt(1, QColor(MAGENTA))
    rect = QPainterPath()
    rect.addRoundedRect(QRectF(0, 0, px, px), px * radius_ratio, px * radius_ratio)
    q.fillPath(rect, gradient)
    q.scale(px / size, px / size)
    q.fillPath(d_mapped, QColor("#ffffff"))
    q.end()
    img.save(str(ASSETS / name))


icon_png(32, "favicon-32.png")
icon_png(180, "apple-touch-icon.png", 0)   # iOS сам скругляет углы
icon_png(192, "icon-192.png")
icon_png(512, "icon-512.png")
print("готово:", sorted(p.name for p in ASSETS.iterdir()), (BRAND / "logo-disorder-white.png").name)
