"""Optional sync server. Off unless you start it.

Browsing does not use this. Open static/index.html as a file.
This listens on 127.0.0.1:4351 only so the Sync button on that page can
download new Raindrop bookmarks and refresh the local files.
"""

import json
import sys
import traceback
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from build_offline import build

API_DIR = Path(__file__).resolve().parent.parent / "raindrop-api"
sys.path.insert(0, str(API_DIR))

HOST = "127.0.0.1"
PORT = 4351


class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args):
        print("%s %s" % (self.address_string(), fmt % args))

    def end_ok(self, code, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self.end_ok(204, {})

    def do_GET(self):
        if self.path.split("?")[0] == "/health":
            self.end_ok(200, {"ok": True})
            return
        self.end_ok(404, {"ok": False})

    def do_POST(self):
        if self.path.split("?")[0] != "/sync":
            self.end_ok(404, {"ok": False})
            return
        try:
            from sync_raindrop import sync
            downloaded = sync()
            library = build()
            self.end_ok(200, {"ok": True, "downloaded": downloaded, "library": library})
        except Exception as error:
            traceback.print_exc()
            self.end_ok(500, {"ok": False, "error": str(error)})


def main():
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Sync server at http://{HOST}:{PORT}")
    print("Leave this running, then click Sync on the bookmark page.")
    print("Press Control-C to stop it.")
    server.serve_forever()


if __name__ == "__main__":
    main()
