import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
DB_PATH = DATA / "bookmarks.sqlite"
EXPORT_PATH = ROOT.parent / "raindrop-manual-exports" / "raindrop-bookmark-export-26Sep26.html"

SCHEMA = """
CREATE TABLE IF NOT EXISTS meta (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookmarks (
    id INTEGER PRIMARY KEY,
    url TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    note TEXT NOT NULL DEFAULT '',
    cover TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    highlights TEXT NOT NULL DEFAULT '[]',
    important INTEGER NOT NULL DEFAULT 0,
    collection TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT '',
    raindrop_id INTEGER UNIQUE,
    source TEXT NOT NULL DEFAULT 'export',
    domain TEXT NOT NULL DEFAULT '',
    type TEXT NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS bookmarks_created ON bookmarks(created_at);
"""


def connect():
    DATA.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(DB_PATH)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    db.executescript(SCHEMA)
    return db


def get_meta(db, key, default=None):
    row = db.execute("SELECT value FROM meta WHERE key = ?", (key,)).fetchone()
    return row["value"] if row else default


def set_meta(db, key, value):
    db.execute(
        "INSERT INTO meta(key, value) VALUES(?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
        (key, value),
    )
