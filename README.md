# Connect

Connect is the application for keeping a local copy of things you save on other websites. Each website or source gets its own place in this repo. You can open that copy here, change how it is shown, and later add tools that sort it, research it, or turn it into posts.

Raindrop is the first source. YouTube, Reddit, and X are later sources. They are not built yet.

The public copy of this repo is https://github.com/johnsicoli/connect. Saved items and tokens stay on this Mac. They are not in the public copy.

The Mac App Store Raindrop app and the Chrome Web Store Raindrop extension stay installed. Connect does not replace them.

## Sources

| Source | Folder | What it is today |
| --- | --- | --- |
| Raindrop | `raindrop-bookmark-app` | A modified copy of Raindrop's website, a local library of your bookmarks, a downloader for new bookmarks, and a changed Chrome extension. |
| YouTube | not started | Saved videos, later. |
| Reddit | not started | Saved posts, later. |
| X | not started | Saved posts, later. |

## Raindrop

Raindrop is the bookmark service at raindrop.io. The account this copy uses is john.sicoli@gmail.com. Connect keeps three Raindrop pieces:

- A modified clone of Raindrop's website, running on this Mac, still signed into raindrop.io.
- A library that shows a database of bookmarks seeded from the 26 Sep 2026 HTML export, then updated when you ask.
- A Chrome extension named **Raindrop.io (local)** that can save the current page without opening a window.

All of that code lives under `raindrop-bookmark-app`. Each folder there has its own README with the commands for that folder. The steps below are the full set.

### The Raindrop folders

| Folder | README | What is inside |
| --- | --- | --- |
| `raindrop-bookmark-app` | `raindrop-bookmark-app/README.md` | The Raindrop source as a whole. |
| `raindrop-website-app` | `raindrop-bookmark-app/raindrop-website-app/README.md` | The modified clone and the library code. |
| `raindrop-website-app-data` | `raindrop-bookmark-app/raindrop-website-app-data/README.md` | The library database. No program code. |
| `raindrop-api` | `raindrop-bookmark-app/raindrop-api/README.md` | The downloader for new bookmarks, plus Raindrop's API notes. |
| `raindrop-chrome-extension` | `raindrop-bookmark-app/raindrop-chrome-extension/README.md` | The changed Chrome extension. |
| `raindrop-manual-exports` | `raindrop-bookmark-app/raindrop-manual-exports/README.md` | The HTML export from 26 Sep 2026. |

There is no `library` folder and no `raindrop-desktop-app` folder.

The export had 566 bookmarks, all in Unsorted. One URL was saved twice, so the database holds 565 from that file. A later download added bookmarks saved after `2026-09-25T04:30:06Z`.

### The Raindrop port

The modified website uses **4350**. The library uses **4351**. Nothing else in Connect listens on a port. Both are inside one reserved block.

Add this row to the ports documentation:

| Project / service | Default | Reserved range | Purpose | Owner / notes |
| --- | ---: | --- | --- | --- |
| Connect | `4350` | `4350-4359` | Local bookmark library. Later saved-post tools in this repo use the next free port in this block. | `4350` is the modified Raindrop website. `4351` is the library in the same folder. Do not bind outside `4350-4359`. `4360-4399` stays unallocated. |

### Install the modified Raindrop website

You need Node.js and npm. Do this once, or again after the dependencies change.

#### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

#### Download the pieces the website needs

```sh
npm ci
```

Wait until the prompt comes back. This creates `node_modules`. That folder stays on this Mac and is not in git.

### Build the modified Raindrop website

Do this before the first start, and again after the website code changes.

#### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

#### Make the files the browser will open

```sh
npm run build
```

Wait until it says the build compiled. The files land in `dist/web/prod` inside that same folder.

### Start the modified Raindrop website

The build must already be done. Leave the terminal open. This uses port 4350.

#### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

#### Turn the website on

```sh
npm start
```

Wait until it prints `Raindrop website at http://127.0.0.1:4350`. Then it sits there. Sitting there means it is on. Sign-in goes through this address to raindrop.io.

#### Open the website

In Chrome or Safari, go to http://127.0.0.1:4350 and sign in with the Raindrop account.

### Stop the modified Raindrop website

#### Stop it while the terminal is still open

Click the terminal where `npm start` is running. Press Control and C together.

#### Stop it if you already closed the terminal

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

If a line appears, the number in the second column is the PID. Then run this, with that number instead of `PID`:

```sh
kill PID
```

#### Check that the website is off

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

No lines means it is stopped.

### Start the Raindrop library

The library is the other program in `raindrop-website-app`. It shows the local database. It uses port 4351. Leave the terminal open. It does not need npm.

#### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

#### Turn the library on

```sh
python3 server.py
```

Wait until it prints `Connect library at http://127.0.0.1:4351`. The first time the database is empty, this reads the HTML export.

#### Open the library

In Chrome or Safari, go to http://127.0.0.1:4351

### Stop the Raindrop library

#### Stop it while the terminal is still open

Click the terminal where `python3 server.py` is running. Press Control and C together.

#### Stop it if you already closed the terminal

```sh
lsof -nP -iTCP:4351 -sTCP:LISTEN
```

If a line appears, the number in the second column is the PID. Then run this, with that number instead of `PID`:

```sh
kill PID
```

#### Check that the library is off

```sh
lsof -nP -iTCP:4351 -sTCP:LISTEN
```

No lines means it is stopped.

### Download new Raindrop bookmarks

This writes into `raindrop-bookmark-app/raindrop-website-app-data/bookmarks.sqlite` and then stops. It does not use a port. It only keeps bookmarks saved at least one second after the newest bookmark in the 26 Sep export. Running it again does not make a second copy.

The token file is `raindrop-bookmark-app/raindrop-api/.env` with one line, `RAINDROP_TOKEN=...`. That file is not in git. If it is missing, copy `.env.example` to `.env` in that same folder and paste the test token from https://app.raindrop.io/settings/integrations.

#### Go to the API folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-api
```

#### Download the new bookmarks

```sh
python3 sync_raindrop.py
```

Wait until it prints a line with `added` and the prompt comes back. That means it stopped by itself. Reload http://127.0.0.1:4351 if the library is on.

### Build the Raindrop Chrome extension

The extension in this repo is named **Raindrop.io (local)**. A production build talks to `https://api.raindrop.io`.

#### Go to the extension folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-chrome-extension
```

#### Download the pieces the build needs

```sh
npm ci
```

Wait for the prompt. You only need this again after the extension dependencies change.

#### Build the extension

```sh
npm run build:extension:chrome
```

Wait until it says the build compiled. Chrome loads this folder:

`/Users/john/dev/connect/raindrop-bookmark-app/raindrop-chrome-extension/dist/chrome/prod`

Do not use `npm run local:extension:chrome` for everyday use. That command looks for a Raindrop API on your Mac, and Connect does not run one.

### Install the Raindrop extension into Chrome

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Choose `dist/chrome/prod` from the path above.
6. Open **Raindrop.io (local)** and sign in. It is a different install from the store extension. Saves still go to the Raindrop account.
7. In its settings, under Clipper, turn on **Invisible save**.

Clicking that icon then saves the page without opening a window. A check mark means it saved. An exclamation mark means it did not. Right-click the icon and choose Settings when you want the window.

#### Reload the extension after a new build

```sh
npm run build:extension:chrome
```

Then on `chrome://extensions`, click **Reload** on the **Raindrop.io (local)** card.

### Turn the Raindrop extension off

1. Open `chrome://extensions`.
2. Find **Raindrop.io (local)**.
3. Switch it off, or click Remove.

The store extension is a different card. Leave that one as it is. The extension has no terminal server to stop.

### The HTML export

`raindrop-bookmark-app/raindrop-manual-exports/raindrop-bookmark-export-26Sep26.html` is the bookmark file exported from Raindrop on 26 Sep 2026. There is no program to start in that folder. The library reads it when the database is empty. The file is not in git, because this GitHub repo is public.
