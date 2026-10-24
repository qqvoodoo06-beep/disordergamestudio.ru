"""Проверка собранного сайта (docs/): внутренние ссылки, JSON-LD, заголовки, hreflang, длины title/description.

Запуск: python tools/check.py   (0 — всё в порядке, 1 — есть проблемы; печатает список)
"""
from __future__ import annotations

import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse

sys.stdout.reconfigure(encoding="utf-8")
DOCS = Path(__file__).resolve().parent.parent / "docs"


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.h1, self.title, self.desc, self.ld, self.alts = [], 0, "", "", [], {}
        self.canonical, self._in_title, self._in_ld, self.imgs_no_alt = "", False, False, 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == "a" and a.get("href"):
            self.links.append(a["href"])
        if tag in ("img", "source", "script", "link", "video") and (a.get("src") or (tag == "link" and a.get("href"))):
            self.links.append(a.get("src") or a.get("href"))
        if tag == "img" and "alt" not in a:
            self.imgs_no_alt += 1
        if tag == "img" and a.get("srcset"):
            self.links += [part.strip().split(" ")[0] for part in a["srcset"].split(",")]
        if tag == "h1":
            self.h1 += 1
        if tag == "title":
            self._in_title = True
        if tag == "meta" and a.get("name") == "description":
            self.desc = a.get("content", "")
        if tag == "link" and a.get("rel") == "canonical":
            self.canonical = a["href"]
        if tag == "link" and a.get("rel") == "alternate" and a.get("hreflang"):
            self.alts[a["hreflang"]] = a["href"]
        if tag == "script" and a.get("type") == "application/ld+json":
            self._in_ld = True

    def handle_endtag(self, tag):
        self._in_title = False if tag == "title" else self._in_title
        self._in_ld = False if tag == "script" else self._in_ld

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_ld:
            self.ld.append(data)


def main() -> int:
    problems, pages = [], {}
    for path in sorted(DOCS.rglob("*.html")):
        rel = path.relative_to(DOCS).as_posix()
        page = Page()
        page.feed(path.read_text(encoding="utf-8"))
        pages[rel] = page
        base = "https://site.test/" + rel
        for link in page.links:
            if link.startswith(("http://", "https://", "mailto:", "#")) or link.startswith("data:"):
                continue
            target = urlparse(urljoin(base, link)).path.lstrip("/")
            file = DOCS / target
            if target.endswith("/") or target == "":
                file = file / "index.html"
            if not file.exists():
                problems.append(f"{rel}: битая ссылка {link}")
        if rel == "404.html":
            continue
        if page.h1 != 1:
            problems.append(f"{rel}: h1 — {page.h1} шт.")
        if page.imgs_no_alt:
            problems.append(f"{rel}: картинок без alt — {page.imgs_no_alt}")
        if not 20 <= len(page.title) <= 70:
            problems.append(f"{rel}: длина title {len(page.title)}: {page.title}")
        if not 70 <= len(page.desc) <= 165:
            problems.append(f"{rel}: длина description {len(page.desc)}")
        for block in page.ld:
            try:
                json.loads(block)
            except ValueError as error:
                problems.append(f"{rel}: JSON-LD не читается: {error}")
        if set(page.alts) != {"ru", "en", "x-default"}:
            problems.append(f"{rel}: hreflang {sorted(page.alts)}")
    # hreflang взаимные: страница на другом языке ссылается обратно
    by_canonical = {p.canonical: (rel, p) for rel, p in pages.items() if p.canonical}
    for rel, page in pages.items():
        for lang, href in page.alts.items():
            if lang == "x-default":
                continue
            other = by_canonical.get(href)
            if other is None:
                problems.append(f"{rel}: hreflang {lang} ведёт на страницу, которой нет: {href}")
            elif other[1].alts.get(lang) != href or page.canonical not in other[1].alts.values():
                problems.append(f"{rel}: hreflang {lang} не взаимный")
    titles = {}
    for rel, page in pages.items():
        if rel != "404.html":
            titles.setdefault(page.title, []).append(rel)
    problems += [f"одинаковый title у {', '.join(v)}" for v in titles.values() if len(v) > 1]
    for line in problems:
        print(line)
    print(f"ИТОГ: страниц {len(pages)}, проблем {len(problems)}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
