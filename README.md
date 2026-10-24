# Сайт Disorder Game Studio

Статичный сайт студии со всеми проектами, на русском (`/`) и английском (`/en/`). Готовые страницы лежат
в `docs/` и публикуются через GitHub Pages.

## Как обновить

1. Тексты, ссылки и картинки проектов — в [`content/data.py`](content/data.py).
2. Картинки и видео: `python tools/media.py` (нужны Pillow и ffmpeg).
3. Страницы: `python tools/build.py`.
4. Посмотреть у себя: `python -m http.server 8765 --directory docs` → http://localhost:8765.

Логотип и значки (`docs/assets`) рисует `tools/brand.py` — его запускают Python с PySide6
(например, из окружения GameShelf).

## Адрес и поисковики

- Адрес сайта задаётся в `SITE_URL` (`content/data.py`): от него строятся canonical, hreflang, sitemap и
  картинки для соцсетей. Для своего домена укажите его там — `build.py` сам создаст файл `CNAME`.
- Коды подтверждения Яндекс.Вебмастера и Google Search Console — в `YANDEX_VERIFICATION` и `GOOGLE_VERIFICATION`.
