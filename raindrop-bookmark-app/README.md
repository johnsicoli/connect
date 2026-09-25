# Raindrop in Connect

This folder is the Raindrop source inside Connect. Connect is the application for connecting to websites and sources. Raindrop is one source. The full explanation of Connect and of Raindrop is in the root [README](../README.md).

## What each folder is

| Folder | What it is |
| --- | --- |
| `raindrop-website-app` | The modified Raindrop website clone and the local library code. |
| `raindrop-website-app-data` | The library database. No program code. |
| `raindrop-api` | The downloader that adds new bookmarks, and Raindrop's API notes. |
| `raindrop-chrome-extension` | The changed Chrome extension, **Raindrop.io (local)**. |
| `raindrop-manual-exports` | The HTML export from 26 Sep 2026. |

Each of those folders has its own README. Use that README when you are working in the folder.

## Ports

Browsing uses no port. The optional sync server uses port 4351 and stays off until you start it. That port is inside the Connect block `4350-4359`.

## Open the bookmark page

No server.

### Open the file

```sh
open /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app/dist/web/prod/index.html
```

If the page says the bookmark file is missing, build it first.

### Build the page and download images

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
python3 build_offline.py
```

## Start the sync server

Only when you want the Sync button to work. It uses port 4351.

### Turn it on

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
python3 server.py
```

## Stop the sync server

### Stop it while the terminal is open

Click that terminal. Press Control and C together.

### Stop it if the terminal is gone

```sh
lsof -nP -iTCP:4351 -sTCP:LISTEN
```

The second column is the PID. Replace `PID` below with that number.

```sh
kill PID
```

## Download new bookmarks

### Go to the API folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-api
```

### Run the download

```sh
python3 sync_raindrop.py
```

It prints the result and stops. It does not use a port. The token is `.env` in that folder.
