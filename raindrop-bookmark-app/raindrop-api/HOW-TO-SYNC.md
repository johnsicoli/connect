# Download new bookmarks

This folder holds the program that asks Raindrop for bookmarks saved after the 26 Sep 2026 export. It also holds Raindrop's own API notes. Those notes start in `README.md`.

The program writes into `../raindrop-website-app-data/bookmarks.sqlite`. It does not start a website and it does not use a port. When the command finishes, it has stopped.

Your token is the file `.env` in this folder. One line: `RAINDROP_TOKEN=...`. That file stays on this Mac. Git does not store it. If `.env` is missing, copy `.env.example` to `.env` and paste the test token from https://app.raindrop.io/settings/integrations.

## Download the new bookmarks

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-api
```

### Run the download

```sh
python3 sync_raindrop.py
```

Wait until it prints a line like `{'added': 2, ...}` and the prompt comes back. Added is how many new bookmarks it stored. Then it is done. You do not press Control-C.

If the bookmark website is already on, reload http://127.0.0.1:4350. If it is off, start it from `raindrop-website-app` with `python3 server.py` before you open that address.

Running this again does not duplicate bookmarks it already stored.
