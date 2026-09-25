# Connect

`raindrop-website-app` is the modified Raindrop clone and the library code. Both live in that one folder. Nothing for that code lives outside it, except the database, which is in `raindrop-website-app-data`.

The Raindrop app from the Mac App Store and the Raindrop extension from the Chrome Web Store stay installed. This project does not replace them.

The public copy of the code is https://github.com/johnsicoli/connect. Your bookmarks and your API token are not in that public copy.

## The folders

Open `raindrop-bookmark-app`.

| Folder | What is inside |
| --- | --- |
| `raindrop-website-app` | The modified Raindrop clone (`src/`, `connect-server.js`) and the library (`server.py`, `db.py`, `import_html.py`, `static/`). |
| `raindrop-website-app-data` | The library database, `bookmarks.sqlite`. No program code. |
| `raindrop-api` | The program that downloads new bookmarks, and Raindrop's API notes. |
| `raindrop-chrome-extension` | The changed Chrome extension. |
| `raindrop-manual-exports` | The HTML file you exported from Raindrop on 26 Sep 2026. |

There is no `library` folder. There is no `raindrop-desktop-app` folder.

## The port

Add this row to the ports documentation:

| Project / service | Default | Reserved range | Purpose | Owner / notes |
| --- | ---: | --- | --- | --- |
| Connect | `4350` | `4350-4359` | Local bookmark library. Later saved-post tools in this repo use the next free port in this block. | `4350` is the modified Raindrop website. `4351` is the library in the same folder. Do not bind outside `4350-4359`. `4360-4399` stays unallocated. |

## Install the modified clone

You need Node.js and npm. Do this once, or again after the dependencies change.

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Download the pieces the clone needs

```sh
npm ci
```

Wait until the prompt comes back. This creates `node_modules`. That folder stays on this Mac and is not in git.

## Build the modified clone

Do this before the first start, and again after the clone code changes.

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Make the files the browser will open

```sh
npm run build
```

Wait until it says the build compiled. The files land in `dist/web/prod` inside that same folder.

## Start the modified clone

The build must already be done. Leave the terminal open. This uses port 4350.

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the modified clone on

```sh
npm start
```

Wait until it prints `Raindrop website at http://127.0.0.1:4350`. Then it sits there. Sitting there means it is on. Sign-in goes through this address to raindrop.io.

### Open the modified clone

In Chrome or Safari, go to http://127.0.0.1:4350 and sign in.

## Stop the modified clone

### Stop it while the terminal is still open

Click the terminal where `npm start` is running. Press Control and C together.

### Stop it if you already closed the terminal

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

If a line appears, the number in the second column is the PID. Then run this, with that number instead of `PID`:

```sh
kill PID
```

### Check that the modified clone is off

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

No lines means it is stopped.

## Start the library

The library is the other program in `raindrop-website-app`. It shows the local database. It uses port 4351. Leave the terminal open.

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the library on

```sh
python3 server.py
```

Wait until it prints `Connect library at http://127.0.0.1:4351`. The first time the database is empty, this reads the HTML export.

### Open the library

In Chrome or Safari, go to http://127.0.0.1:4351

## Stop the library

### Stop it while the terminal is still open

Click the terminal where `python3 server.py` is running. Press Control and C together.

### Stop it if you already closed the terminal

```sh
lsof -nP -iTCP:4351 -sTCP:LISTEN
```

If a line appears, the number in the second column is the PID. Then run this, with that number instead of `PID`:

```sh
kill PID
```

### Check that the library is off

```sh
lsof -nP -iTCP:4351 -sTCP:LISTEN
```

No lines means it is stopped.

## Download new bookmarks from Raindrop

This is not a website. It runs, writes into `raindrop-website-app-data`, and then it is finished. It does not use a port.

The token file must already exist at `raindrop-bookmark-app/raindrop-api/.env` with one line, `RAINDROP_TOKEN=...`. That file is not in git. If it is missing, copy `.env.example` to `.env` in that same folder and paste the test token from https://app.raindrop.io/settings/integrations.

### Go to the API folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-api
```

### Download the new bookmarks

```sh
python3 sync_raindrop.py
```

When it finishes, the terminal prints how many bookmarks were added. Then you get a prompt again. That means it stopped by itself. Reload http://127.0.0.1:4351 if the library is on.

## Build the Chrome extension

### Go to the extension folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-chrome-extension
```

### Download the pieces the build needs

```sh
npm ci
```

Wait for the prompt. You only need this again after the extension dependencies change.

### Build the extension

```sh
npm run build:extension:chrome
```

Wait until it says the build compiled. Chrome loads this folder:

`/Users/john/dev/connect/raindrop-bookmark-app/raindrop-chrome-extension/dist/chrome/prod`

This build talks to `https://api.raindrop.io`.

## Install the extension into Chrome

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Choose `dist/chrome/prod` from the path above.
6. Open **Raindrop.io (local)** and sign in.
7. In its settings, under Clipper, turn on **Invisible save**.

Clicking that icon then saves the page without opening a window. A check mark means it saved. An exclamation mark means it did not. Right-click the icon and choose Settings when you want the window.

### Reload the extension after a new build

```sh
npm run build:extension:chrome
```

Then on `chrome://extensions`, click **Reload** on the **Raindrop.io (local)** card.

## Turn the Chrome extension off

1. Open `chrome://extensions`.
2. Find **Raindrop.io (local)**.
3. Switch it off, or click Remove.

The store extension is a different card. Leave that one as it is. The extension has no terminal server to stop.
