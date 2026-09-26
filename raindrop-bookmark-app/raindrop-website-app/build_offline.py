"""Save every bookmark, its Open Graph fields, and its hero image on disk.

Writes static/bookmarks.js and static/media/. Open static/index.html in a
browser. No web server is required to browse.
"""

import json
import mimetypes
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

from db import ROOT, connect

STATIC = ROOT / "static"
MEDIA = STATIC / "media"
BOOKMARKS_JS = STATIC / "bookmarks.js"
UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
EXTRA_COLUMNS = {
    "og_title": "TEXT NOT NULL DEFAULT ''",
    "og_description": "TEXT NOT NULL DEFAULT ''",
    "og_image": "TEXT NOT NULL DEFAULT ''",
    "hero_source": "TEXT NOT NULL DEFAULT ''",
    "hero_file": "TEXT NOT NULL DEFAULT ''",
    "og_image_file": "TEXT NOT NULL DEFAULT ''",
    "og_checked": "INTEGER NOT NULL DEFAULT 0",
}


class OgParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.found = {}

    def handle_starttag(self, tag, attrs):
        if tag.lower() != "meta":
            return
        data = {key.lower(): value or "" for key, value in attrs}
        prop = (data.get("property") or data.get("name") or "").lower()
        if prop in ("og:title", "og:description", "og:image", "og:image:url"):
            content = data.get("content", "").strip()
            if content and prop not in self.found:
                self.found["og:image" if prop.startswith("og:image") else prop] = content


def ensure_columns(db):
    have = {row[1] for row in db.execute("PRAGMA table_info(bookmarks)")}
    for name, decl in EXTRA_COLUMNS.items():
        if name not in have:
            db.execute(f"ALTER TABLE bookmarks ADD COLUMN {name} {decl}")
    db.commit()


def http_get(url, limit, referer=None):
    headers = {"User-Agent": UA, "Accept": "image/avif,image/webp,image/apng,image/*,*/*;q=0.8"}
    if referer:
        headers["Referer"] = referer
    request = Request(url, headers=headers)
    with urlopen(request, timeout=12) as response:
        content_type = response.headers.get("Content-Type", "")
        chunks = []
        size = 0
        while size < limit:
            block = response.read(min(65536, limit - size))
            if not block:
                break
            chunks.append(block)
            size += len(block)
        return b"".join(chunks), content_type


def extension_for(url, content_type, body):
    if body[:8] == b"\x89PNG\r\n\x1a\n":
        return ".png"
    if body[:3] == b"\xff\xd8\xff":
        return ".jpg"
    if body[:6] in (b"GIF87a", b"GIF89a"):
        return ".gif"
    if body[:4] == b"RIFF" and body[8:12] == b"WEBP":
        return ".webp"
    guessed = mimetypes.guess_extension(content_type.split(";")[0].strip()) or ""
    if guessed in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"):
        return ".jpg" if guessed == ".jpeg" else guessed
    path = urlparse(url).path.lower()
    for ext in (".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"):
        if path.endswith(ext):
            return ".jpg" if ext == ".jpeg" else ext
    return ".img"


def download_image(url, dest_stem, referer=None):
    if not url or not url.startswith(("http://", "https://")):
        return ""
    body, content_type = http_get(url, 8_000_000, referer=referer)
    if len(body) < 32:
        return ""
    ext = extension_for(url, content_type, body)
    relative = f"media/{dest_stem}{ext}"
    target = STATIC / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(body)
    return relative


def fetch_og(page_url):
    if not page_url.startswith(("http://", "https://")):
        return {}
    body, _ = http_get(page_url, 400_000)
    parser = OgParser()
    parser.feed(body.decode("utf-8", errors="replace"))
    image = parser.found.get("og:image", "")
    if image:
        image = urljoin(page_url, image)
    return {
        "og_title": parser.found.get("og:title", "")[:1000],
        "og_description": parser.found.get("og:description", "")[:10000],
        "og_image": image,
    }


def process(row):
    item = dict(row)
    changed = {}
    hero_source = item.get("cover") or ""
    if hero_source and (item.get("hero_source") != hero_source or not (item.get("hero_file") and (STATIC / item["hero_file"]).exists())):
        try:
            local = download_image(hero_source, f"{item['id']}-hero", referer=item["url"])
        except Exception:
            local = ""
        changed["hero_source"] = hero_source
        changed["hero_file"] = local
        item.update(changed)
    if not item.get("og_checked"):
        try:
            og = fetch_og(item["url"])
        except Exception:
            og = {}
        changed["og_title"] = og.get("og_title", "")
        changed["og_description"] = og.get("og_description", "")
        changed["og_image"] = og.get("og_image", "")
        changed["og_checked"] = 1
        og_image = changed["og_image"]
        if og_image and og_image != hero_source:
            try:
                changed["og_image_file"] = download_image(og_image, f"{item['id']}-og", referer=item["url"])
            except Exception:
                changed["og_image_file"] = ""
        item.update(changed)
    return item["id"], changed


def write_library(db):
    rows = db.execute("SELECT * FROM bookmarks ORDER BY created_at DESC, id DESC").fetchall()
    bookmarks = []
    heroes = 0
    graphs = 0
    for row in rows:
        item = dict(row)
        hero = item.get("hero_file") or item.get("og_image_file") or ""
        if hero:
            heroes += 1
        if item.get("og_title") or item.get("og_description") or item.get("og_image_file"):
            graphs += 1
        bookmarks.append({
            "id": item["id"],
            "url": item["url"],
            "title": item["og_title"] or item["title"],
            "pageTitle": item["title"],
            "excerpt": item["og_description"] or item["excerpt"],
            "note": item["note"],
            "hero": hero,
            "ogImage": item.get("og_image_file") or "",
            "tags": json.loads(item["tags"] or "[]"),
            "highlights": json.loads(item["highlights"] or "[]"),
            "important": bool(item["important"]),
            "collection": item["collection"],
            "created_at": item["created_at"],
            "domain": item["domain"],
            "source": item["source"],
        })
    payload = {
        "bookmarks": bookmarks,
        "syncAfter": db.execute("SELECT value FROM meta WHERE key = 'sync_after'").fetchone(),
        "heroes": heroes,
        "graphs": graphs,
    }
    sync_after = payload["syncAfter"][0] if payload["syncAfter"] else ""
    payload["syncAfter"] = sync_after
    text = "window.LIBRARY = " + json.dumps(payload, ensure_ascii=False) + ";\n"
    text = text.replace("</", "<\\/")
    BOOKMARKS_JS.write_text(text, encoding="utf-8")
    return {"bookmarks": len(bookmarks), "heroes": heroes, "graphs": graphs}


def build():
    MEDIA.mkdir(parents=True, exist_ok=True)
    db = connect()
    ensure_columns(db)
    rows = db.execute("SELECT * FROM bookmarks").fetchall()
    done = 0
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = [pool.submit(process, row) for row in rows]
        for future in as_completed(futures):
            bookmark_id, changed = future.result()
            if changed:
                sets = ", ".join(f"{key} = ?" for key in changed)
                db.execute(
                    f"UPDATE bookmarks SET {sets} WHERE id = ?",
                    (*changed.values(), bookmark_id),
                )
            done += 1
            if done % 25 == 0 or done == len(rows):
                db.commit()
                print(f"saved {done}/{len(rows)}", flush=True)
    db.commit()
    summary = write_library(db)
    db.close()
    copy_into_dist()
    print(summary, flush=True)
    return summary


def copy_into_dist():
    import shutil
    dest = ROOT / "dist" / "web" / "prod"
    if not dest.exists() or not BOOKMARKS_JS.exists():
        return
    shutil.copy2(BOOKMARKS_JS, dest / "bookmarks.js")
    if MEDIA.exists():
        shutil.copytree(MEDIA, dest / "media", dirs_exist_ok=True)


if __name__ == "__main__":
    build()
