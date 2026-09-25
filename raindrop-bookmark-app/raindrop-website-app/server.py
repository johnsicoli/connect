"""Local bookmark library. Serves http://127.0.0.1:4351

The modified Raindrop website uses 4350. This library uses 4351.
Both are inside the Connect block 4350-4359.
"""

import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from db import DB_PATH, EXPORT_PATH, connect, get_meta
from import_html import import_export

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
HOST = "127.0.0.1"
PORT = 4351


def row_to_item(row):
    return {
        "id": row["id"],
        "url": row["url"],
        "title": row["title"],
        "excerpt": row["excerpt"],
        "note": row["note"],
        "cover": row["cover"],
        "tags": json.loads(row["tags"] or "[]"),
        "highlights": json.loads(row["highlights"] or "[]"),
        "important": bool(row["important"]),
        "collection": row["collection"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "raindrop_id": row["raindrop_id"],
        "source": row["source"],
        "domain": row["domain"],
        "type": row["type"],
    }


def ensure_seeded():
    db = connect()
    count = db.execute("SELECT COUNT(*) AS n FROM bookmarks").fetchone()["n"]
    if count == 0 and EXPORT_PATH.exists():
        import_export(EXPORT_PATH, db)
    db.close()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("%s %s" % (self.address_string(), fmt % args))

    def do_GET(self):
        path = urlparse(self.path).path
        if path == "/api/library":
            return self.send_library()
        if path == "/":
            path = "/index.html"
        file_path = (STATIC / path.lstrip("/")).resolve()
        if not str(file_path).startswith(str(STATIC)) or not file_path.is_file():
            self.send_error(404)
            return
        kind = {
            ".html": "text/html; charset=utf-8",
            ".css": "text/css; charset=utf-8",
            ".js": "text/javascript; charset=utf-8",
        }.get(file_path.suffix, "application/octet-stream")
        body = file_path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", kind)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_library(self):
        db = connect()
        rows = db.execute(
            "SELECT * FROM bookmarks ORDER BY created_at DESC, id DESC"
        ).fetchall()
        payload = {
            "bookmarks": [row_to_item(row) for row in rows],
            "sync_after": get_meta(db, "sync_after", ""),
            "last_sync": get_meta(db, "last_sync", ""),
            "database": str(DB_PATH),
        }
        db.close()
        body = json.dumps(payload).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    ensure_seeded()
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Connect library at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    main()
