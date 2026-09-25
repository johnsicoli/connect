# Connect

A local copy of bookmarks saved in Raindrop, plus a modified Chrome extension that can save a page without opening a window. The official Raindrop Mac app and the Chrome Web Store extension stay installed and keep syncing with raindrop.io. This repo does not replace them.

The GitHub repo is public: https://github.com/johnsicoli/connect. The bookmark export and the local database are not in git.

## Port

This project uses **4350-4359**. The library binds `127.0.0.1:4350` only. Nothing else in this repo listens on a port. Later tools in this repo (YouTube, Reddit, X) take the next free port inside this block.

Add this row to the shared port table before starting the library:

| Project / service | Default | Reserved range | Purpose | Owner / notes |
| --- | ---: | --- | --- | --- |
| Connect | `4350` | `4350-4359` | Local bookmark library. Later saved-post tools in this repo use the next free port in this block. | Binds `127.0.0.1:4350` only. Do not bind outside `4350-4359`. `4360-4399` stays unallocated. |

## What each part does

| Path | What it is |
| --- | --- |
| `raindrop-bookmark-app/library` | Our web app. Search, tags, and highlights for a SQLite copy of the bookmarks. |
| `raindrop-bookmark-app/raindrop-chrome-extension` | Raindrop's extension source (MIT, upstream `raindropio/app` at the commit in `UPSTREAM.txt`) plus **Invisible save**. |
| `raindrop-bookmark-app/raindrop-manual-exports` | HTML exports. Present on this machine, not committed. |
| `raindrop-bookmark-app/raindrop-desktop-app` | Local checkout of the same upstream repo, for reading. Not committed, not installed, not run. The Mac app you already use is the official one. |
| `raindrop-bookmark-app/raindrop-api` | Local checkout of the Raindrop API docs. Not committed. |

The library was seeded from `raindrop-bookmark-export-26Sep26.html` (26 Sep 2026). That file had 566 bookmarks, all in Unsorted. One URL was saved twice, so the database started at 565. A later API sync added two bookmarks saved after `2026-09-25T04:30:06Z`. The database now has 567 bookmarks.

Invisible save is a Clipper setting in the local extension. With it on, the toolbar click saves the current page in the background. A check mark on the icon means it saved. An exclamation mark means it did not. It uses the same default collection as Clipper and does not create a second copy of a URL that is already saved. Right-click the icon and choose Settings to open the window again. The store extension is unchanged and still opens its window.

## Requirements

- Python 3, from the system. The library uses the standard library only.
- Node.js and npm, for the extension. The upstream pin is Node 18.16.0 (`.node-version`). `npm ci` and the Chrome production build also completed on Node 22.
- Chrome, to load the unpacked extension.
- A Raindrop account. API sync uses a test token from https://app.raindrop.io/settings/integrations.

## Bookmark library

### Install

Nothing to install. From the repo root:

```sh
cd raindrop-bookmark-app/library
```

The first time `server.py` runs, if `data/bookmarks.sqlite` is missing or empty and the HTML export is present, it imports:

`../raindrop-manual-exports/raindrop-bookmark-export-26Sep26.html`

That export and `data/bookmarks.sqlite` stay on this machine. Both are gitignored.

### Start

```sh
cd raindrop-bookmark-app/library
python3 server.py
```

Open http://127.0.0.1:4350

The process serves only that address. Leave the terminal open while you use it.

### Stop

In the terminal where it is running, press Ctrl+C.

If that terminal is gone:

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
kill <PID>
```

Confirm nothing is still listening:

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

### API sync

Sync is a one-shot command, not a server. It does not listen on a port. Run it when you want bookmarks created after the cutoff stored in the database (`sync_after`, set from the newest item in the export).

The token lives in `raindrop-bookmark-app/library/.env`:

```sh
RAINDROP_TOKEN=...
```

Copy `.env.example` if the file is missing. `.env` is gitignored. Do not commit it.

```sh
cd raindrop-bookmark-app/library
python3 sync_raindrop.py
```

Raindrop's `created:` search accepts a calendar day, not a full timestamp. The script asks for that day and then keeps only raindrops at least one second newer than the cutoff, so the bookmark that was already newest in the export is not imported again. Re-running the script updates matches already stored from the API and skips the rest.

There is no schedule. The next sync happens when you run that command again.

## Chrome extension

### Build

```sh
cd raindrop-bookmark-app/raindrop-chrome-extension
npm ci
npm run build:extension:chrome
```

`npm ci` installs dependencies and runs `patch-package`. The production build writes an unpacked extension to `dist/chrome/prod` and a zip to `chrome-prod.zip` in that project directory. `node_modules/` and `dist/` are gitignored.

The production build talks to `https://api.raindrop.io`. The dev build (`npm run local:extension:chrome`) talks to `http://localhost:3000` and is not the one to load.

The built extension name is **Raindrop.io (local)** so it can sit beside the store extension.

### Install in Chrome

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click **Load unpacked** and choose `raindrop-bookmark-app/raindrop-chrome-extension/dist/chrome/prod`.
4. Open the local extension once and sign in. It is a separate install from the store extension. Saves still go to the Raindrop account.
5. In its settings, under Clipper, turn on **Invisible save**.

After a code change, run `npm run build:extension:chrome` again and click **Reload** on the extension card.

### Stop

The extension has no background server of ours. To stop using it, open `chrome://extensions` and switch off **Raindrop.io (local)**, or click Remove. The store extension is a different install. Leave it on.

## What is not running

- The official Raindrop Mac app. Keep using the copy you already installed.
- `raindrop-desktop-app`. It is a source checkout only. `npm run build:electron` in the upstream repo builds a web bundle. It does not install a Mac app, and this project does not run it.
- `raindrop-api`. Docs only.
- Sync. It exits when the pull finishes.

## Git

From the repo root, `git status` should be clean apart from ignored data. Do not commit:

- `raindrop-bookmark-app/library/.env`
- `raindrop-bookmark-app/library/data/*.sqlite`
- `raindrop-bookmark-app/raindrop-manual-exports/*.html`
- `node_modules/` or `dist/`
