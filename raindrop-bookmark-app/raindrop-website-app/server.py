"""Optional sync server. Off unless you start it.

Browsing does not use this. Open dist/web/prod/index.html as a file.
This listens on 127.0.0.1:4351 so the Sync button can download new
Raindrop bookmarks and refresh that file.
"""

import json
import sys
import threading
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from build_offline import build

API_DIR = Path(__file__).resolve().parent.parent / "raindrop-api"
sys.path.insert(0, str(API_DIR))

HOST = "127.0.0.1"
PORT = 4351

state = {
    "running": False,
    "message": "Idle",
    "result": None,
    "error": None,
}
lock = threading.Lock()


def set_status(**updates):
    with lock:
        state.update(updates)


def snapshot():
    with lock:
        return dict(state)


def job():
    set_status(running=True, error=None, result=None, message="Asking Raindrop for new bookmarks…")
    try:
        from sync_raindrop import sync
        downloaded = sync()
        added = downloaded.get("added", 0)
        set_status(message=f"Raindrop returned {added} new. Saving images…")
        library = build(on_progress=lambda message: set_status(message=message))
        set_status(
            running=False,
            result={"downloaded": downloaded, "library": library},
            message=f"Finished. {added} new bookmarks.",
        )
    except Exception as error:
        traceback.print_exc()
        set_status(running=False, error=str(error), message=str(error))


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("%s %s" % (self.address_string(), fmt % args))

    def cors(self):
        origin = self.headers.get("Origin")
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        else:
            self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Private-Network", "true")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")

    def end_json(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.cors()
        self.end_headers()
        if code != 204:
            self.wfile.write(body)

    def do_OPTIONS(self):
        self.end_json(204, {})

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/status":
            self.end_json(200, {"ok": True, **snapshot()})
            return
        if path == "/health":
            self.end_json(200, {"ok": True})
            return
        self.end_json(404, {"ok": False})

    def do_POST(self):
        if self.path.split("?")[0] != "/sync":
            self.end_json(404, {"ok": False})
            return
        current = snapshot()
        if not current["running"]:
            set_status(running=True, error=None, result=None, message="Starting…")
            threading.Thread(target=job, daemon=True).start()
        self.end_json(200, {"ok": True, "started": not current["running"]})


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Sync server at http://{HOST}:{PORT}")
    print("Leave this running, then click Sync on the bookmark page.")
    print("Press Control-C to stop it.")
    server.serve_forever()


if __name__ == "__main__":
    main()
