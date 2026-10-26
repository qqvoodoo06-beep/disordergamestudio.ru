"""Сообщает Яндексу о новых, изменённых и удалённых страницах сайта по протоколу IndexNow — не дожидаясь,
пока робот сам их обойдёт. По протоколу эти адреса получают и другие поисковики IndexNow (Bing и другие).

Запуск: python tools/indexnow.py             — после git push, когда GitHub Pages уже обновил сайт
        python tools/indexnow.py --dry-run   — только показать, что ушло бы
        python tools/indexnow.py --all       — отправить заново все страницы из sitemap.xml

Что изменилось, видно по content/lastmod.json (его ведёт build.py), что уже отправлено — по content/indexnow.json.
Перед отправкой скрипт сверяет страницы на самом сайте с собранными: если GitHub Pages ещё не обновился, робот
пришёл бы за старыми версиями, поэтому тогда скрипт ничего не отправляет и просит подождать.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import json
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")
ROOT = Path(__file__).resolve().parent.parent
DOCS = ROOT / "docs"
LASTMOD_FILE = ROOT / "content" / "lastmod.json"
SENT_FILE = ROOT / "content" / "indexnow.json"
ENDPOINT = "https://yandex.com/indexnow"

spec = importlib.util.spec_from_file_location("data", ROOT / "content" / "data.py")
data = importlib.util.module_from_spec(spec)
spec.loader.exec_module(data)
SITE = data.SITE_URL.rstrip("/")
KEY = data.INDEXNOW_KEY

# Что значат ответы Яндекса: https://yandex.ru/support/webmaster/ru/indexnow/reference.md
ERRORS = {
    400: "в запросе неверные параметры",
    403: "Яндекс не смог скачать файл ключа или ключ в нём не тот",
    422: "адреса не с этого сайта или ключ неправильного вида",
    429: "слишком много запросов — повторите позже",
}


def page_hash(text: str) -> str:
    """Тот же отпечаток, что у write_page в build.py: без ?v= у файлов стилей, чтобы правка CSS не считалась правкой страницы."""
    return hashlib.sha1(re.sub(r"\?v=\w+", "", text).encode()).hexdigest()


def fetch(url: str) -> tuple[int, bytes]:
    try:
        with urllib.request.urlopen(url, timeout=30) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, b""
    except urllib.error.URLError:  # нет сети или сайт не ответил
        return 0, b""


def current_pages() -> list[str]:
    """Пути страниц из собранного sitemap.xml: "" — главная, "en/gameshelf/" — проект на английском."""
    sitemap = (DOCS / "sitemap.xml").read_text(encoding="utf-8")
    return [loc[len(SITE) + 1:] for loc in re.findall(r"<loc>([^<]+)</loc>", sitemap)]


def not_live(changed: dict[str, str], deleted: list[str]) -> list[str]:
    """Страницы, которые на сайте ещё старые (или удалённые ещё открываются) — плюс файл ключа, если его нет."""
    problems = []
    status, body = fetch(f"{SITE}/{KEY}.txt")
    if status != 200 or body.decode("utf-8", "replace").strip() != KEY:
        problems.append(f"{SITE}/{KEY}.txt — файла ключа ещё нет на сайте")
    for path, digest in changed.items():
        status, body = fetch(f"{SITE}/{path}")
        if status != 200 or page_hash(body.decode("utf-8").replace("\r\n", "\n")) != digest:
            problems.append(f"{SITE}/{path} — на сайте ещё старая версия")
    for path in deleted:
        if fetch(f"{SITE}/{path}")[0] == 200:
            problems.append(f"{SITE}/{path} — удалена, но ещё открывается")
    return problems


def submit(paths: list[str]) -> int:
    body = json.dumps({"host": SITE.split("://", 1)[1], "key": KEY,
                       "urlList": [f"{SITE}/{path}" for path in paths]}).encode()
    request = urllib.request.Request(ENDPOINT, data=body, method="POST",
                                     headers={"Content-Type": "application/json; charset=utf-8"})
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            return response.status
    except urllib.error.HTTPError as error:
        print(f"Яндекс ответил {error.code}: {ERRORS.get(error.code, 'неизвестная ошибка')}")
        print(error.read().decode("utf-8", "replace")[:500])
        return error.code


def main() -> int:
    parser = argparse.ArgumentParser(description="Отправить новые и изменённые страницы в Яндекс по IndexNow")
    parser.add_argument("--dry-run", action="store_true", help="только показать, что ушло бы")
    parser.add_argument("--all", action="store_true", help="отправить все страницы, даже уже отправленные")
    args = parser.parse_args()
    if not KEY:
        raise SystemExit("В content/data.py не задан INDEXNOW_KEY")

    lastmod = json.loads(LASTMOD_FILE.read_text(encoding="utf-8"))
    sent = {} if args.all or not SENT_FILE.exists() else json.loads(SENT_FILE.read_text(encoding="utf-8"))
    pages = current_pages()
    changed = {path: lastmod[path]["hash"] for path in pages if sent.get(path) != lastmod[path]["hash"]}
    deleted = [path for path in sent if path not in pages]
    if not changed and not deleted:
        print("Нечего отправлять: все страницы уже отправлены в Яндекс")
        return 0

    for path in changed:
        print(f"  {'изменена' if path in sent else 'новая   '}  {SITE}/{path}")
    for path in deleted:
        print(f"  удалена   {SITE}/{path}")
    problems = not_live(changed, deleted)
    if problems:
        print("Сайт ещё не обновился, ничего не отправлено. Подождите несколько минут и запустите снова:")
        print("\n".join(f"  {line}" for line in problems))
        return 1
    if args.dry_run:
        print(f"Проверка без отправки: на сайте всё свежее, ушло бы страниц: {len(changed) + len(deleted)}")
        return 0

    status = submit(list(changed) + deleted)
    if status == 202:
        print("Яндекс получил адреса, но ключ у него ещё на проверке. Запустите скрипт снова минут через 10–15")
        return 1
    if status != 200:
        return 1
    if not args.all:
        sent = {path: digest for path, digest in sent.items() if path not in deleted}
    sent.update(changed)
    SENT_FILE.write_text(json.dumps(sent, ensure_ascii=False, indent=1, sort_keys=True), encoding="utf-8")
    print(f"Готово: Яндекс принял адреса ({len(changed) + len(deleted)} шт.). Закоммитьте content/indexnow.json")
    return 0


if __name__ == "__main__":
    sys.exit(main())
