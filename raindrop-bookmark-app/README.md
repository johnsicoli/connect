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

The modified website uses port 4350. The library uses port 4351. Both are inside the Connect block `4350-4359`.

## Start the modified website

Build it first if `dist/web/prod` is missing. The build command is in `raindrop-website-app/README.md`.

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the website on

```sh
npm start
```

Open http://127.0.0.1:4350

## Stop the modified website

### Stop it while the terminal is open

Click that terminal. Press Control and C together.

### Stop it if the terminal is gone

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

The second column is the PID. Replace `PID` below with that number.

```sh
kill PID
```

## Start the library

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the library on

```sh
python3 server.py
```

Open http://127.0.0.1:4351

## Stop the library

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
