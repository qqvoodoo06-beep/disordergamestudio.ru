"""Собирает сайт Disorder Game Studio в docs/ (для GitHub Pages): страницы на русском (/) и английском (/en/),
разметку для поисковиков (schema.org, Open Graph, hreflang), sitemap.xml, robots.txt и 404.html.

Запуск: python tools/build.py   (сначала tools/media.py — он готовит картинки и content/media.json)
"""
from __future__ import annotations

import hashlib
import html
import importlib.util
import json
import re
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
TOOLS = ROOT / "tools"

spec = importlib.util.spec_from_file_location("data", ROOT / "content" / "data.py")
data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(data)
MEDIA = json.loads((ROOT / "content" / "media.json").read_text(encoding="utf-8"))
SITE = data.SITE_URL.rstrip("/")
STUDIO = data.STUDIO
TODAY = date.today().isoformat()
LANGS = ("ru", "en")
LOCALE = {"ru": "ru_RU", "en": "en_US"}

T = {
    "ru": {
        "projects": "Проекты", "about": "О студии", "community": "Сообщество", "home": "Главная",
        "switch": "EN", "switch_label": "English version", "skip": "Перейти к содержимому",
        "home_title": "Disorder Game Studio — инди-студия: игры и программы для геймеров",
        "home_desc": "Disorder Game Studio — инди-студия из России: HoITS, «Бог бюрократии», GameShelf, "
                     "«Музыкальное лото» и другие игры и программы. Многое бесплатно.",
        "hero_h1": "<strong>Disorder Game Studio</strong> — инди-студия, где геймеры делают игры и программы для геймеров",
        "hero_lead": "Сюжетные игры, стратегии, головоломки, игры для компании и удобные программы. "
                     "Почти всё можно попробовать бесплатно.",
        "see_projects": "Наши проекты", "spotlight": "Главный проект", "all_projects": "Ещё проекты",
        "projects_lead": "Игры и программы, которые мы сделали. Нажмите на карточку, чтобы узнать больше.",
        "more": "Подробнее", "about_title": "О студии", "community_title": "Сообщество",
        "community_lead": "Новости, анонсы и живое общение с командой.",
        "facts": [("{n}", "проектов"), ("{free}", "можно попробовать бесплатно"),
                  ("{browser}", "играются прямо в браузере"), ("2026", "год основания")],
        "about_game": "Об игре", "about_app": "О программе", "features": "Особенности", "video": "Видео",
        "screens": "Скриншоты", "details": "Коротко", "genre": "Жанр", "platforms": "Платформы",
        "engine": "Сделано на", "langs": "Языки", "price": "Цена", "status": "Статус", "developer": "Разработчик",
        "links": "Ссылки", "other": "Другие проекты студии", "free": "Бесплатно", "tba": "Объявим к релизу",
        "games": "Игры", "badge": {"soon": "Скоро в Steam", "play": "Играть в браузере", "free": "Скачать бесплатно"},
        "kind": {"game": "Игра", "app": "Программа"},
        "platform": {"Browser": "браузер", "Desktop browser": "браузер на компьютере", "Windows": "Windows",
                     "Mobile": "телефон"},
        "menu": "Главное меню", "crumbs": "Навигационная цепочка",
        "lang_name": {"ru": "русский", "en": "английский", "es": "испанский"},
        "footer": "Сделано геймерами для геймеров", "rights": "© {year} Disorder Game Studio",
        "nf_title": "Страница не найдена", "nf_text": "Такой страницы нет. Зато есть наши проекты:",
    },
    "en": {
        "projects": "Projects", "about": "About", "community": "Community", "home": "Home",
        "switch": "RU", "switch_label": "Русская версия", "skip": "Skip to content",
        "home_title": "Disorder Game Studio — indie games and apps for gamers",
        "home_desc": "Disorder Game Studio is an indie studio from Russia behind HoITS, The God of Bureaucracy, "
                     "GameShelf and Music Lotto. Many games are free in your browser.",
        "hero_h1": "<strong>Disorder Game Studio</strong>: indie games and apps made by gamers, for gamers",
        "hero_lead": "Story-driven games, strategy, puzzles, party games and handy apps. Almost everything is free "
                     "to try.",
        "see_projects": "Our projects", "spotlight": "Featured", "all_projects": "More projects",
        "projects_lead": "Games and apps we've made. Pick a card to learn more.",
        "more": "Learn more", "about_title": "About the studio", "community_title": "Community",
        "community_lead": "News, announcements and a direct line to the team.",
        "facts": [("{n}", "projects"), ("{free}", "free to try"), ("{browser}", "play right in your browser"),
                  ("2026", "year founded")],
        "about_game": "About the game", "about_app": "About the app", "features": "Features", "video": "Video",
        "screens": "Screenshots", "details": "At a glance", "genre": "Genre", "platforms": "Platforms",
        "engine": "Built with", "langs": "Languages", "price": "Price", "status": "Status", "developer": "Developer",
        "links": "Links", "other": "More from the studio", "free": "Free", "tba": "To be announced",
        "games": "Games", "badge": {"soon": "Coming to Steam", "play": "Play in browser", "free": "Free download"},
        "kind": {"game": "Game", "app": "App"},
        "platform": {"Browser": "browser", "Desktop browser": "desktop browser", "Windows": "Windows",
                     "Mobile": "mobile"},
        "menu": "Main menu", "crumbs": "Breadcrumbs",
        "lang_name": {"ru": "Russian", "en": "English", "es": "Spanish"},
        "footer": "Made by gamers, for gamers", "rights": "© {year} Disorder Game Studio",
        "nf_title": "Page not found", "nf_text": "This page doesn't exist. Our games do, though:",
    },
}

ICONS = {
    "telegram": '<path d="M21.5 3.5 2.8 10.7c-1 .4-1 1.8.1 2.1l4.6 1.4 1.8 5.6c.3.9 1.4 1.1 2 .4l2.6-2.6 4.6 3.4c.8.6 1.9.2 2.1-.8l3-15.1c.2-1.1-.9-2-2.1-1.6ZM9.6 14.1l8.5-7.4-6.7 8.6-.3 3.2-1.5-4.4Z" fill="currentColor"/>',
    "discord": '<path d="M7 5.5c1.4-.6 2.9-1 4.4-1.1l.4.9a14 14 0 0 1 .4 0l.4-.9c1.5.1 3 .5 4.4 1.1 2.4 3.6 3 7 2.7 10.5a12 12 0 0 1-3.8 1.9l-.9-1.4c.6-.2 1.1-.5 1.6-.8l-.4-.3a9.4 9.4 0 0 1-8.4 0l-.4.3c.5.3 1 .6 1.6.8l-.9 1.4A12 12 0 0 1 4.3 16c-.4-3.5.3-6.9 2.7-10.5Zm2.3 8.2c.8 0 1.4-.8 1.4-1.7s-.6-1.7-1.4-1.7-1.4.8-1.4 1.7.6 1.7 1.4 1.7Zm5.4 0c.8 0 1.4-.8 1.4-1.7s-.6-1.7-1.4-1.7-1.4.8-1.4 1.7.6 1.7 1.4 1.7Z" fill="currentColor"/>',
    "itch": '<path d="M4 6.5 6 4h12l2 2.5v2a2.5 2.5 0 0 1-4 2 2.5 2.5 0 0 1-4 0 2.5 2.5 0 0 1-4 0 2.5 2.5 0 0 1-4-2v-2Zm1.5 5.3V19c0 .6.4 1 1 1h11c.6 0 1-.4 1-1v-7.2a3.9 3.9 0 0 1-2.5-.4 4 4 0 0 1-4 .4 4 4 0 0 1-4-.4 3.9 3.9 0 0 1-2.5.4Zm4.5 2.7h4v4h-4v-4Z" fill="currentColor"/>',
    "github": '<path d="M8.5 7 3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    "dtf": '<path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 4v2h8V8H8Zm0 4v2h8v-2H8Zm0 4v1h5v-1H8Z" fill="currentColor"/>',
    "download": '<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
    "play": '<path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.8l-10-6.5A1 1 0 0 0 8 5.5Z" fill="currentColor"/>',
    "host": '<path d="M4 5h16v10H4zM9 19h6M12 15v4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    "devlog": '<path d="M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 4v2h8V8H8Zm0 4v2h8v-2H8Z" fill="currentColor"/>',
}


def esc(text) -> str:
    return html.escape(str(text), quote=True)


def icon(name: str) -> str:
    return f'<svg viewBox="0 0 24 24" aria-hidden="true">{ICONS.get(name, ICONS["play"])}</svg>'


def page_path(lang: str, slug: str = "") -> str:
    """Путь страницы от корня сайта, с завершающим слешем: "", "en/", "hoits/", "en/hoits/"."""
    return ("en/" if lang == "en" else "") + (f"{slug}/" if slug else "")


def url(path: str) -> str:
    return f"{SITE}/{path}"


def rel(from_path: str, to: str) -> str:
    """Относительная ссылка: сайт работает и на github.io, и на своём домене, и с диска через локальный сервер."""
    depth = from_path.count("/")
    return "../" * depth + to


LOGO_SVG = (DOCS / "assets" / "logo-disorder.svg").read_text(encoding="utf-8").strip()
LOGO_INLINE = re.sub(r'role="img" aria-label="Disorder"', 'aria-hidden="true" focusable="false"', LOGO_SVG)


def img_tag(sources: list[dict], alt: str, here: str, sizes: str, lazy: bool = True, cls: str = "",
            priority: bool = False) -> str:
    """<img> с srcset из готовых размеров WebP (одинаковые ширины не повторяем — так требует HTML)."""
    unique = list({s["w"]: s for s in sources}.values())
    srcset = ", ".join(f'{rel(here, s["src"])} {s["w"]}w' for s in unique)
    best = unique[-1]
    loading = ' loading="lazy" decoding="async"' if lazy else (' fetchpriority="high"' if priority else "")
    cls_attr = f' class="{cls}"' if cls else ""
    return (f'<img src="{rel(here, best["src"])}" srcset="{srcset}" sizes="{sizes}" width="{best["w"]}" '
            f'height="{best["h"]}" alt="{esc(alt)}"{loading}{cls_attr}>')


def org_ld() -> dict:
    return {
        "@type": "Organization", "@id": f"{SITE}/#organization", "name": STUDIO["name"],
        "alternateName": STUDIO["short"], "url": f"{SITE}/", "logo": url("assets/icon-512.png"),
        "foundingDate": STUDIO["founded"], "slogan": STUDIO["en"]["tagline"],
        "sameAs": [link["url"] for link in STUDIO["links"]],
    }


def head(lang: str, here: str, title: str, description: str, og: dict, ld: list[dict], og_type: str = "website",
         preload: str = "", noindex: bool = False) -> str:
    other = "en" if lang == "ru" else "ru"
    alt_path = re.sub(r"^en/", "", here) if lang == "en" else "en/" + here
    links = [
        f'<link rel="canonical" href="{url(here)}">',
        f'<link rel="alternate" hreflang="{lang}" href="{url(here)}">',
        f'<link rel="alternate" hreflang="{other}" href="{url(alt_path)}">',
        f'<link rel="alternate" hreflang="x-default" href="{url(here if lang == "en" else alt_path)}">',
    ] if not noindex else []
    verify = ""
    if data.YANDEX_VERIFICATION:
        verify += f'<meta name="yandex-verification" content="{esc(data.YANDEX_VERIFICATION)}">\n'
    if data.GOOGLE_VERIFICATION:
        verify += f'<meta name="google-site-verification" content="{esc(data.GOOGLE_VERIFICATION)}">\n'
    graph = json.dumps({"@context": "https://schema.org", "@graph": ld}, ensure_ascii=False, separators=(",", ":"))
    og_url = url(og["src"])
    return f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(title)}</title>
<meta name="description" content="{esc(description)}">
{'<meta name="robots" content="noindex">' if noindex else '<meta name="robots" content="index, follow, max-image-preview:large">'}
{chr(10).join(links)}
<meta name="theme-color" content="#0b0814">
<meta name="color-scheme" content="dark">
{verify}<meta property="og:type" content="{og_type}">
<meta property="og:site_name" content="{STUDIO['name']}">
<meta property="og:title" content="{esc(title)}">
<meta property="og:description" content="{esc(description)}">
<meta property="og:url" content="{url(here)}">
<meta property="og:image" content="{og_url}">
<meta property="og:image:width" content="{og['w']}">
<meta property="og:image:height" content="{og['h']}">
<meta property="og:locale" content="{LOCALE[lang]}">
<meta property="og:locale:alternate" content="{LOCALE[other]}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{esc(title)}">
<meta name="twitter:description" content="{esc(description)}">
<meta name="twitter:image" content="{og_url}">
<link rel="icon" href="{rel(here, 'assets/favicon.svg')}" type="image/svg+xml">
<link rel="icon" href="{rel(here, 'assets/favicon-32.png')}" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="{rel(here, 'assets/apple-touch-icon.png')}">
<link rel="manifest" href="{rel(here, 'site.webmanifest')}">
{preload}<link rel="stylesheet" href="{rel(here, 'assets/site.css')}?v={CSS_VERSION}">
<script type="application/ld+json">{graph}</script>
</head>"""


def header(lang: str, here: str) -> str:
    t = T[lang]
    home = rel(here, page_path(lang)) or "./"
    alt_path = re.sub(r"^en/", "", here) if lang == "en" else "en/" + here
    other = "en" if lang == "ru" else "ru"
    return f"""<body>
<a class="skip" href="#main">{t['skip']}</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="{home}" aria-label="Disorder Game Studio — {t['home']}">{LOGO_INLINE}<span>GAME STUDIO</span></a>
    <nav class="nav" aria-label="{t['menu']}">
      <a href="{home}#projects">{t['projects']}</a>
      <a class="more-link" href="{home}#about">{t['about']}</a>
      <a class="more-link" href="{home}#community">{t['community']}</a>
      <a class="lang" href="{rel(here, alt_path) or './'}" hreflang="{other}" lang="{other}" title="{t['switch_label']}">{t['switch']}</a>
    </nav>
  </div>
</header>"""


def footer(lang: str, here: str) -> str:
    t = T[lang]
    links = " ".join(f'<a href="{esc(l["url"])}" rel="noopener">{esc(l["label"])}</a>' for l in STUDIO["links"])
    # Ссылки на все проекты в подвале: каждая страница проекта получает ссылку с каждой страницы сайта
    projects = " ".join(f'<a href="{rel(here, page_path(lang, p["slug"]))}">{esc(p[lang]["short_title"])}</a>'
                        for p in data.PROJECTS)
    return f"""<footer class="site-footer">
  <div class="wrap">
    <div><span class="motto">{t['footer']}</span><br>{t['rights'].format(year=date.today().year)}</div>
    <nav aria-label="{t['projects']}">{projects}</nav>
    <nav aria-label="{t['community']}">{links}</nav>
  </div>
</footer>
<script src="{rel(here, 'assets/site.js')}?v={CSS_VERSION}" defer></script>
</body>
</html>
"""


def platforms_text(project: dict, lang: str) -> str:
    text = ", ".join(T[lang]["platform"].get(p, p) for p in project["platforms"])
    return text[:1].upper() + text[1:]


def fx_attrs(project: dict, here: str, big: bool = False) -> str:
    """Данные для эффекта карточки в site.js: какой проект и (для HoITS) кадры «до» и «после» реткона.
    big — ещё и крупные кадры для широкого блока (site.js выберет по размеру блока и плотности экрана)."""
    attrs = f' data-fx="{project["slug"]}"'
    if project["slug"] == "hoits":
        shots = MEDIA["projects"]["hoits"]["shots"]
        attrs += f' data-fx-a="{rel(here, shots[0]["thumb"]["src"])}" data-fx-b="{rel(here, shots[1]["thumb"]["src"])}"'
        if big:
            attrs += (f' data-fx-a2="{rel(here, shots[0]["full"]["src"])}"'
                      f' data-fx-b2="{rel(here, shots[1]["full"]["src"])}"')
    return attrs


def card(project: dict, lang: str, here: str) -> str:
    t, text = T[lang], project[lang]
    cover = MEDIA["projects"][project["slug"]]["cover"][lang]
    href = rel(here, page_path(lang, project["slug"]))
    return f"""<a class="card" href="{href}"{fx_attrs(project, here)} style="--accent:{project['accent']}">
  <div class="thumb">{img_tag(cover, '', here, '(max-width: 700px) 92vw, 380px')}</div>
  <div class="body">
    <div><span class="pill {project['badge']}">{t['badge'][project['badge']]}</span></div>
    <h3>{esc(text['title'])}</h3>
    <p>{esc(text['tagline'])}</p>
    <div class="meta">{t['kind'][project['kind']]} · {esc(platforms_text(project, lang))}</div>
  </div>
</a>"""


def social_links(lang: str) -> str:
    notes = {
        "ru": {"telegram": "новости и анонсы", "discord": "общение с командой", "itch": "наши игры",
               "github": "открытый код", "dtf": "блог студии"},
        "en": {"telegram": "news and announcements", "discord": "chat with the team", "itch": "our games",
               "github": "open source", "dtf": "studio blog (in Russian)"},
    }[lang]
    return "\n".join(
        f'<a class="social" href="{esc(l["url"])}" rel="noopener">{icon(l["id"])}'
        f'<span>{esc(l["label"])}<small>{notes[l["id"]]}</small></span></a>' for l in STUDIO["links"])


# --------------------------------------------------------------------------- главная

def home_page(lang: str) -> str:
    t, here = T[lang], page_path(lang)
    projects = data.PROJECTS
    featured = projects[0]
    f_text = featured[lang]
    f_media = MEDIA["projects"][featured["slug"]]
    counts = {"n": len(projects), "free": sum(p["price"] == "free" for p in projects),
              "browser": sum(any("rowser" in x for x in p["platforms"]) for p in projects)}
    facts = "".join(f'<div class="fact"><b>{value.format(**counts)}</b><span>{label}</span></div>'
                    for value, label in t["facts"])
    ld = [
        org_ld(),
        {"@type": "WebSite", "@id": f"{SITE}/#website", "url": f"{SITE}/", "name": STUDIO["name"],
         "inLanguage": ["ru", "en"], "publisher": {"@id": f"{SITE}/#organization"}},
        {"@type": "ItemList", "name": t["all_projects"], "itemListElement": [
            {"@type": "ListItem", "position": i, "url": url(page_path(lang, p["slug"])), "name": p[lang]["title"]}
            for i, p in enumerate(projects, 1)]},
    ]
    body = f"""
<main id="main">
<section class="hero">
  <div class="wrap">
    <div class="hero-logo">{LOGO_INLINE}</div>
    <div class="hero-sub" aria-hidden="true">GAME STUDIO</div>
    <h1>{t['hero_h1']}</h1>
    <p class="lead">{t['hero_lead']}</p>
    <div class="buttons">
      <a class="btn primary" href="#projects">{t['see_projects']}</a>
      <a class="btn" href="https://t.me/disordergamestudio" rel="noopener">{icon('telegram')}Telegram</a>
      <a class="btn" href="https://discord.gg/vTBJJTzXx" rel="noopener">{icon('discord')}Discord</a>
    </div>
  </div>
</section>

<section class="section" id="projects" aria-labelledby="projects-title">
  <div class="wrap">
    <div class="eyebrow">{t['spotlight']}</div>
    <a class="spotlight" href="{rel(here, page_path(lang, featured['slug']))}"{fx_attrs(featured, here, big=True)} style="--accent:{featured['accent']}">
      <div class="art">{img_tag(f_media['hero'], '', here, '(max-width: 860px) 100vw, 640px', lazy=False)}</div>
      <div class="body">
        <div><span class="pill {featured['badge']}">{esc(f_text['status'])}</span></div>
        <h2 class="spot-title">{esc(f_text['title'])}</h2>
        <p>{esc(f_text['tagline'])}</p>
        <span class="more">{t['more']} →</span>
      </div>
    </a>
    <div class="section-head" style="margin-top:56px">
      <h2 id="projects-title">{t['all_projects']}</h2>
      <p>{t['projects_lead']}</p>
    </div>
    <div class="grid">
{chr(10).join(card(p, lang, here) for p in projects if p is not featured)}
    </div>
  </div>
</section>

<section class="section" id="about" aria-labelledby="about-title">
  <div class="wrap about">
    <div>
      <h2 id="about-title">{t['about_title']}</h2>
      {''.join(f'<p>{esc(p)}</p>' for p in STUDIO[lang]['bio'])}
    </div>
    <div class="facts">{facts}</div>
  </div>
</section>

<section class="section" id="community" aria-labelledby="community-title">
  <div class="wrap">
    <div class="section-head"><h2 id="community-title">{t['community_title']}</h2><p>{t['community_lead']}</p></div>
    <div class="community">
{social_links(lang)}
    </div>
  </div>
</section>
</main>"""
    return head(lang, here, t["home_title"], t["home_desc"], MEDIA["og"][lang], ld) + header(lang, here) + body + footer(lang, here)


# --------------------------------------------------------------------------- страница проекта

def project_ld(project: dict, lang: str, here: str) -> list[dict]:
    text, other = project[lang], project["en" if lang == "ru" else "ru"]
    media = MEDIA["projects"][project["slug"]]
    base = {
        "@id": url(here) + "#product", "name": text["title"], "description": text["seo_description"],
        "url": url(here), "image": [url(media["cover"][lang][-1]["src"]), url(media["og"][lang]["src"])],
        "inLanguage": project["languages"], "author": {"@id": f"{SITE}/#organization"},
        "publisher": {"@id": f"{SITE}/#organization"}, "genre": text["genre"], "keywords": ", ".join(text["keywords"]),
    }
    # Страницы этого же проекта на других сайтах (не ссылки на скачивание)
    same = [l["url"] for l in project["links"]
            if ("itch.io" in l["url"] or "github.com" in l["url"]) and "/releases" not in l["url"] and "/devlog" not in l["url"]]
    if same:
        base["sameAs"] = same
    if other["title"] != text["title"]:
        base["alternateName"] = other["title"]
    if project["price"] == "free":
        base["offers"] = {"@type": "Offer", "price": "0", "priceCurrency": "USD",
                          "availability": "https://schema.org/InStock",
                          "url": next(l["url"] for l in project["links"] if l.get("primary"))}
    if project["kind"] == "app":
        base.update({"@type": "SoftwareApplication", "applicationCategory": "UtilitiesApplication",
                     "operatingSystem": "Windows 10, Windows 11", "softwareVersion": project.get("version", ""),
                     "downloadUrl": next(l["url"] for l in project["links"] if l["id"] == "download"),
                     "license": "https://opensource.org/licenses/MIT"})
    else:
        platforms = {"Browser": "Web browser", "Desktop browser": "Web browser", "Windows": "PC (Windows)",
                     "Mobile": "Mobile browser"}
        base.update({"@type": "VideoGame", "applicationCategory": "GameApplication",
                     "gamePlatform": [platforms.get(p, p) for p in project["platforms"]],
                     "playMode": "MultiPlayer" if project["slug"] == "music-lotto" else "SinglePlayer"})
        if "Windows" in project["platforms"]:
            base["operatingSystem"] = "Windows"
    if media.get("video") and not media["video"]["loop"]:
        v = media["video"]
        base["trailer"] = {"@type": "VideoObject", "name": v[lang], "description": text["tagline"],
                           "thumbnailUrl": url(v["poster"]), "contentUrl": url(v["src"]),
                           "uploadDate": project["media"]["video"].get("upload_date", TODAY)}
        if v.get("duration"):
            base["trailer"]["duration"] = f"PT{round(v['duration'])}S"
    crumbs = {"@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": STUDIO["name"], "item": url(page_path(lang))},
        {"@type": "ListItem", "position": 2, "name": text["title"], "item": url(here)},
    ]}
    return [org_ld(), base, crumbs]


def project_page(project: dict, lang: str) -> str:
    t, text = T[lang], project[lang]
    slug = project["slug"]
    here = page_path(lang, slug)
    media = MEDIA["projects"][slug]
    home = rel(here, page_path(lang))
    buttons = []
    for link in project["links"]:
        cls = "btn primary" if link.get("primary") else "btn"
        buttons.append(f'<a class="{cls}" href="{esc(link["url"])}" rel="noopener">{icon(link["id"])}{esc(link[lang])}</a>')
    note = f'<p class="note">{esc(project["note"][lang])}</p>' if project.get("note") else ""
    # Фон под заголовком размыт и затемнён — хватает версии 960 px, крупная только тратила бы трафик
    hero_img = media["hero"][:1]
    preload = f'<link rel="preload" as="image" href="{rel(here, hero_img[0]["src"])}" fetchpriority="high">\n'
    shots = [s for s in media["shots"] if s["lang"] in (None, lang)]
    portrait = all(s["portrait"] for s in shots)
    gallery = "\n".join(
        f'<figure><a href="{rel(here, s["full"]["src"])}" data-lightbox data-caption="{esc(s[lang])}">'
        f'<img src="{rel(here, s["thumb"]["src"])}" '
        f'srcset="{rel(here, s["thumb"]["src"])} {s["thumb"]["w"]}w, {rel(here, s["full"]["src"])} {s["full"]["w"]}w" '
        f'sizes="{"(max-width: 700px) 46vw, 220px" if s["portrait"] else "(max-width: 700px) 92vw, 380px"}" '
        f'width="{s["thumb"]["w"]}" height="{s["thumb"]["h"]}" '
        f'alt="{esc(s[lang] + " (" + text["short_title"] + ")")}" loading="lazy" decoding="async"></a>'
        f'<figcaption>{esc(s[lang])}</figcaption></figure>' for s in shots)
    video = ""
    if media.get("video"):
        v = media["video"]
        # У зацикленного ролика тоже есть кнопки — его можно остановить (и он не стартует при «уменьшить движение»)
        attrs = "autoplay muted loop playsinline controls data-autoplay" if v["loop"] else 'controls preload="none"'
        video = f"""<section class="block" aria-labelledby="video-title">
      <h2 id="video-title">{t['video']}</h2>
      <figure class="video" style="margin:0"><video {attrs} poster="{rel(here, v['poster'])}" width="{v['w']}" height="{v['h']}">
        <source src="{rel(here, v['src'])}" type="video/mp4"></video>
        <figcaption style="padding:10px 14px">{esc(v[lang])}</figcaption></figure>
    </section>"""
    price = t["free"] if project["price"] == "free" else t["tba"]
    langs = ", ".join(t["lang_name"][l] for l in project["languages"])
    langs = langs[:1].upper() + langs[1:]
    side_links = "".join(f'<a href="{esc(l["url"])}" rel="noopener">{esc(l[lang])} ↗</a>' for l in project["links"])
    # «Другие проекты» — по кругу три следующих: так на каждый проект ведут ссылки с трёх страниц
    order = [p["slug"] for p in data.PROJECTS]
    start = order.index(slug)
    others = [data.PROJECTS[(start + k) % len(order)] for k in range(1, 4)]
    about_title = t["about_app"] if project["kind"] == "app" else t["about_game"]
    body = f"""
<main id="main" data-project="{slug}" style="--accent:{project['accent']}">
<nav class="crumbs wrap" aria-label="{t['crumbs']}"><ol>
  <li><a href="{home}">{STUDIO['name']}</a></li><li><a href="{home}#projects">{t['projects']}</a></li>
  <li aria-current="page">{esc(text['short_title'])}</li></ol></nav>
<section class="p-hero">
  <div class="bg">{img_tag(hero_img, '', here, '100vw', lazy=False, priority=True)}</div>
  <div class="wrap">
    <div>
      <div class="eyebrow">{t['kind'][project['kind']]} · {esc(text['genre'])}</div>
      <h1>{esc(text['title'])}</h1>
      <p class="tagline">{esc(text['tagline'])}</p>
      <span class="pill {project['badge']}">{esc(text['status'])}</span>
      <div class="buttons">{''.join(buttons)}</div>
      {note}
    </div>
    <div class="cover">{img_tag(media['cover'][lang], text['title'], here, '(max-width: 860px) 90vw, 440px', lazy=False)}</div>
  </div>
</section>
<div class="wrap p-body">
  <aside class="side" aria-labelledby="side-title">
    <h2 id="side-title">{t['details']}</h2>
    <dl>
      <div><dt>{t['genre']}</dt><dd>{esc(text['genre'])}</dd></div>
      <div><dt>{t['platforms']}</dt><dd>{esc(platforms_text(project, lang))}</dd></div>
      <div><dt>{t['status']}</dt><dd>{esc(text['status'])}</dd></div>
      <div><dt>{t['price']}</dt><dd>{price}</dd></div>
      <div><dt>{t['langs']}</dt><dd>{langs}</dd></div>
      <div><dt>{t['engine']}</dt><dd>{esc(project['engine'])}</dd></div>
      <div><dt>{t['developer']}</dt><dd><a href="{home}">{STUDIO['name']}</a></dd></div>
    </dl>
    <div class="links">{side_links}</div>
  </aside>
  <article>
    <section aria-labelledby="about-title">
      <h2 id="about-title">{about_title}</h2>
      {''.join(f'<p>{esc(p)}</p>' for p in text['description'])}
    </section>
    <section class="block" aria-labelledby="features-title">
      <h2 id="features-title">{t['features']}</h2>
      <ul class="features">{''.join(f'<li>{esc(f)}</li>' for f in text['features'])}</ul>
    </section>
    {video}
    <section class="block" aria-labelledby="shots-title">
      <h2 id="shots-title">{t['screens']}</h2>
      <div class="gallery{' portrait' if portrait else ''}">{gallery}</div>
    </section>
  </article>
</div>
<section class="section" aria-labelledby="other-title">
  <div class="wrap">
    <h2 id="other-title">{t['other']}</h2>
    <div class="grid">{''.join(card(p, lang, here) for p in others)}</div>
  </div>
</section>
</main>"""
    return (head(lang, here, text["seo_title"], text["seo_description"], media["og"][lang],
                 project_ld(project, lang, here), og_type="website", preload=preload)
            + header(lang, here) + body + footer(lang, here))


# --------------------------------------------------------------------------- служебные файлы

def not_found_page() -> str:
    """404 отдаётся по любому адресу, поэтому ссылки — от корня сайта."""
    items = "".join(f'<li><a href="/{page_path("ru", p["slug"])}">{esc(p["ru"]["title"])}</a></li>' for p in data.PROJECTS)
    return f"""<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Страница не найдена · Page not found — Disorder Game Studio</title><meta name="robots" content="noindex">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="/assets/site.css?v={CSS_VERSION}"></head>
<body><main class="hero"><div class="wrap">
<a href="/" class="hero-logo" style="max-width:420px;display:block" aria-label="Disorder Game Studio">{LOGO_INLINE}</a>
<h1>404 · {T['ru']['nf_title']} · <span lang="en">{T['en']['nf_title']}</span></h1>
<p class="lead">{T['ru']['nf_text']}</p>
<ul style="list-style:none;padding:0;line-height:2">{items}</ul>
<p class="lead" lang="en">{T['en']['nf_text']} <a href="/en/">English version →</a></p>
<div class="buttons"><a class="btn primary" href="/">{T['ru']['home']}</a> <a class="btn" href="/en/" lang="en">{T['en']['home']}</a></div>
</div></main></body></html>
"""


def sitemap() -> str:
    pages = [""] + [p["slug"] for p in data.PROJECTS]
    entries = []
    for slug in pages:
        for lang in LANGS:
            here = page_path(lang, slug)
            alts = "".join(f'<xhtml:link rel="alternate" hreflang="{l}" href="{url(page_path(l, slug))}"/>'
                           for l in LANGS)
            alts += f'<xhtml:link rel="alternate" hreflang="x-default" href="{url(page_path("en", slug))}"/>'
            entries.append(f"<url><loc>{url(here)}</loc><lastmod>{LASTMOD.get(here, TODAY)}</lastmod>{alts}</url>")
    return ('<?xml version="1.0" encoding="UTF-8"?>\n'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
            + "\n".join(entries) + "\n</urlset>\n")


def english_typography(page: str) -> str:
    """Апострофы в английском тексте — типографские (We’re, doesn’t), как и кавычки “ ”."""
    return re.sub(r"(?<=[A-Za-z])'(?=[A-Za-z])", "’", page)


def write(path: str, content: str) -> None:
    target = DOCS / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(content, encoding="utf-8")


def write_page(path: str, content: str) -> None:
    """Страница + дата изменения для sitemap: меняется, только когда меняется сама страница."""
    write(path + "index.html", content)
    digest = hashlib.sha1(re.sub(r"\?v=\w+", "", content).encode()).hexdigest()
    old = LASTMOD_DB.get(path)
    if not old or old["hash"] != digest:
        LASTMOD_DB[path] = {"hash": digest, "date": TODAY}
    LASTMOD[path] = LASTMOD_DB[path]["date"]


def main() -> None:
    global CSS_VERSION
    # Ссылки canonical/hreflang/sitemap строятся от корня адреса: сайт должен открываться с корня домена
    if urlparse(SITE).path not in ("", "/"):
        raise SystemExit("SITE_URL должен быть корнем домена: репозиторий <ник>.github.io или свой домен")
    css, js = (TOOLS / "site.css").read_text(encoding="utf-8"), (TOOLS / "site.js").read_text(encoding="utf-8")
    CSS_VERSION = hashlib.sha1((css + js).encode()).hexdigest()[:8]
    write("assets/site.css", css)
    write("assets/site.js", js)
    if LASTMOD_FILE.exists():
        LASTMOD_DB.update(json.loads(LASTMOD_FILE.read_text(encoding="utf-8")))
    for lang in LANGS:
        fix = english_typography if lang == "en" else (lambda page: page)
        write_page(page_path(lang), fix(home_page(lang)))
        for project in data.PROJECTS:
            write_page(page_path(lang, project["slug"]), fix(project_page(project, lang)))
    LASTMOD_FILE.write_text(json.dumps(LASTMOD_DB, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")
    write("404.html", not_found_page())
    write("sitemap.xml", sitemap())
    write("robots.txt", f"User-agent: *\nAllow: /\n\nSitemap: {SITE}/sitemap.xml\n")
    write("site.webmanifest", json.dumps({
        "name": STUDIO["name"], "short_name": "Disorder", "start_url": "/", "display": "browser",
        "background_color": "#0b0814", "theme_color": "#0b0814",
        "icons": [{"src": "assets/icon-192.png", "sizes": "192x192", "type": "image/png"},
                  {"src": "assets/icon-512.png", "sizes": "512x512", "type": "image/png"}],
    }, ensure_ascii=False, indent=1))
    write(".nojekyll", "")
    domain = re.sub(r"^https?://", "", SITE)
    if not domain.endswith("github.io"):
        write("CNAME", domain + "\n")
    elif (DOCS / "CNAME").exists():
        (DOCS / "CNAME").unlink()
    pages = len(list(DOCS.rglob("index.html")))
    print(f"готово: {pages} страниц, адрес {SITE}")


CSS_VERSION = "dev"
LASTMOD_FILE = ROOT / "content" / "lastmod.json"
LASTMOD_DB: dict = {}
LASTMOD: dict = {}

if __name__ == "__main__":
    main()
