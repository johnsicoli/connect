"""Read a Raindrop Netscape HTML export into the local database."""

import json
from datetime import datetime, timezone
from html.parser import HTMLParser
from urllib.parse import urlparse

from db import EXPORT_PATH, connect, set_meta


def iso_from_unix(value):
    try:
        stamp = int(value)
    except (TypeError, ValueError):
        return ""
    if stamp <= 0:
        return ""
    return datetime.fromtimestamp(stamp, timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def domain_of(url):
    try:
        host = urlparse(url).hostname or ""
    except ValueError:
        return ""
    return host.lower().removeprefix("www.")


class ExportParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.bookmarks = []
        self._stack = [""]
        self._pending_collection = None
        self._current = None
        self._capture = None
        self._buf = []

    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        attrs = {key.lower(): value for key, value in attrs}
        if tag == "dl":
            name = self._pending_collection or self._stack[-1]
            self._pending_collection = None
            self._stack.append(name or "")
            return
        if tag == "h3":
            self._capture = "h3"
            self._buf = []
            return
        if tag == "a" and attrs.get("href"):
            self._flush()
            tags = [part.strip() for part in (attrs.get("tags") or "").split(",") if part.strip()]
            self._current = {
                "url": attrs["href"].strip(),
                "title": "",
                "excerpt": "",
                "cover": (attrs.get("data-cover") or "").strip(),
                "tags": tags,
                "highlights": [],
                "important": 1 if (attrs.get("data-important") or "").lower() == "true" else 0,
                "collection": self._stack[-1] or "Unsorted",
                "created_at": iso_from_unix(attrs.get("add_date")),
                "updated_at": iso_from_unix(attrs.get("last_modified")),
            }
            self._capture = "title"
            self._buf = []
            return
        if tag == "blockquote" and self._current is not None:
            self._capture = "highlight"
            self._buf = []

    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag == "h3" and self._capture == "h3":
            self._pending_collection = "".join(self._buf).strip() or "Unsorted"
            self._capture = None
            self._buf = []
            return
        if tag == "a" and self._capture == "title" and self._current is not None:
            self._current["title"] = "".join(self._buf).strip()
            self._capture = None
            self._buf = []
            return
        if tag == "blockquote" and self._capture == "highlight" and self._current is not None:
            text = "".join(self._buf).strip()
            if text:
                self._current["highlights"].append(text)
            self._capture = None
            self._buf = []
            return
        if tag == "dl":
            self._flush()
            if len(self._stack) > 1:
                self._stack.pop()

    def handle_data(self, data):
        if self._capture:
            self._buf.append(data)

    def _flush(self):
        item = self._current
        self._current = None
        self._capture = None
        self._buf = []
        if not item or not item["url"]:
            return
        if not item["title"]:
            item["title"] = item["url"]
        self.bookmarks.append(item)

    def close(self):
        super().close()
        self._flush()


def parse_export(path):
    parser = ExportParser()
    parser.feed(path.read_text(encoding="utf-8", errors="replace"))
    parser.close()
    return parser.bookmarks


def import_export(path=EXPORT_PATH, db=None):
    own = db is None
    db = db or connect()
    items = parse_export(path)
    newest = ""
    inserted = 0
    for item in items:
        created = item["created_at"]
        if created > newest:
            newest = created
        cursor = db.execute(
            """
            INSERT INTO bookmarks (
                url, title, excerpt, cover, tags, highlights, important,
                collection, created_at, updated_at, source, domain
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'export', ?)
            ON CONFLICT(url) DO UPDATE SET
                title = excluded.title,
                cover = excluded.cover,
                tags = excluded.tags,
                highlights = excluded.highlights,
                important = excluded.important,
                collection = excluded.collection,
                created_at = excluded.created_at,
                updated_at = excluded.updated_at,
                domain = excluded.domain
            WHERE bookmarks.source = 'export' AND bookmarks.raindrop_id IS NULL
            """,
            (
                item["url"],
                item["title"],
                item["excerpt"],
                item["cover"],
                json.dumps(item["tags"]),
                json.dumps(item["highlights"]),
                item["important"],
                item["collection"],
                item["created_at"],
                item["updated_at"] or item["created_at"],
                domain_of(item["url"]),
            ),
        )
        if cursor.rowcount:
            inserted += 1
    if newest:
        set_meta(db, "sync_after", newest)
    set_meta(db, "export_path", str(path))
    set_meta(db, "imported_count", str(len(items)))
    db.commit()
    if own:
        db.close()
    return {"parsed": len(items), "written": inserted, "sync_after": newest}


if __name__ == "__main__":
    print(import_export())
