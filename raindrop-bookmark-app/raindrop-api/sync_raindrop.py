"""Pull raindrops created after the export cutoff into the local database.

Run when asked: `python3 sync_raindrop.py` from this directory.
The token is read from the environment or from .env as RAINDROP_TOKEN.
"""

import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import urlparse

API_DIR = Path(__file__).resolve().parent
WEBSITE_DIR = API_DIR.parent / "raindrop-website-app"
sys.path.insert(0, str(WEBSITE_DIR))

from db import connect, get_meta, set_meta

API = "https://api.raindrop.io/rest/v1/raindrops/0"
PER_PAGE = 50


def load_token():
    token = os.environ.get("RAINDROP_TOKEN", "").strip()
    if token:
        return token
    env_path = API_DIR / ".env"
    if not env_path.exists():
        return ""
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        if key.strip() == "RAINDROP_TOKEN":
            return value.strip().strip('"').strip("'")
    return ""


def domain_of(url):
    try:
        host = urlparse(url).hostname or ""
    except ValueError:
        return ""
    return host.lower().removeprefix("www.")


def api_get(token, page, search):
    query = urllib.parse.urlencode({
        "page": page,
        "perpage": PER_PAGE,
        "sort": "created",
        "search": search,
    })
    request = urllib.request.Request(
        f"{API}?{query}",
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/json",
        },
    )
    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def collection_name(item):
    collection = item.get("collection") or {}
    cid = collection.get("$id")
    if cid in (-1, None):
        return "Unsorted"
    title = collection.get("title")
    return title or str(cid)


def upsert_item(db, item):
    link = (item.get("link") or "").strip()
    if not link:
        return "skipped"
    highlights = []
    for highlight in item.get("highlights") or []:
        text = (highlight.get("text") or "").strip()
        if text:
            highlights.append(text)
    created = item.get("created") or ""
    updated = item.get("lastUpdate") or created
    values = (
        link,
        item.get("title") or link,
        item.get("excerpt") or "",
        item.get("note") or "",
        item.get("cover") or "",
        json.dumps(item.get("tags") or []),
        json.dumps(highlights),
        1 if item.get("important") else 0,
        collection_name(item),
        created,
        updated,
        item.get("_id"),
        domain_of(link),
        item.get("type") or "",
    )
    existing = db.execute("SELECT id, source FROM bookmarks WHERE url = ?", (link,)).fetchone()
    if existing:
        db.execute(
            """
            UPDATE bookmarks SET
                title = ?, excerpt = ?, note = ?, cover = ?, tags = ?, highlights = ?,
                important = ?, collection = ?, created_at = ?, updated_at = ?,
                raindrop_id = ?, domain = ?, type = ?, source = 'api'
            WHERE url = ?
            """,
            (*values[1:], link),
        )
        return "updated"
    db.execute(
        """
        INSERT INTO bookmarks (
            url, title, excerpt, note, cover, tags, highlights, important,
            collection, created_at, updated_at, raindrop_id, source, domain, type
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'api', ?, ?)
        """,
        values,
    )
    return "added"


def parse_time(value):
    if not value:
        return None
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def is_newer(created, cutoff):
    created_at = parse_time(created)
    cutoff_at = parse_time(cutoff)
    if not created_at or not cutoff_at:
        return False
    # The HTML export stores whole seconds. Raindrop returns that same
    # bookmark with milliseconds, so anything inside that second is not new.
    return created_at >= cutoff_at + timedelta(seconds=1)


def sync(db=None):
    token = load_token()
    if not token:
        raise RuntimeError("RAINDROP_TOKEN is not set. Put it in raindrop-api/.env")
    own = db is None
    db = db or connect()
    cutoff = get_meta(db, "sync_after", "")
    if not cutoff:
        raise RuntimeError("No sync cutoff is stored. Import the HTML export first.")
    # The created: search accepts a calendar day. A full timestamp matches nothing.
    search = f"created:>{cutoff[:10]}"
    added = updated = skipped = pages = 0
    page = 0
    while True:
        payload = api_get(token, page, search)
        items = payload.get("items") or []
        pages += 1
        if not items:
            break
        for item in items:
            created = item.get("created") or ""
            if not is_newer(created, cutoff):
                skipped += 1
                continue
            result = upsert_item(db, item)
            if result == "added":
                added += 1
            elif result == "updated":
                updated += 1
            else:
                skipped += 1
        if len(items) < PER_PAGE:
            break
        page += 1
        if page > 100:
            break
    from datetime import datetime, timezone
    set_meta(db, "last_sync", datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"))
    db.commit()
    if own:
        db.close()
    return {"added": added, "updated": updated, "skipped": skipped, "pages": pages, "cutoff": cutoff}


if __name__ == "__main__":
    try:
        print(sync())
    except urllib.error.HTTPError as error:
        body = error.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Raindrop API {error.code}: {body}") from error
