# Connect

This folder runs Raindrop's own website on this Mac, and it has a changed Chrome extension that can save a page without opening a window.

The Raindrop app from the Mac App Store and the Raindrop extension from the Chrome Web Store stay installed. They still talk to raindrop.io. This project does not replace them.

The public copy of the code is https://github.com/johnsicoli/connect. Your bookmarks are not in that public copy. The website shows the bookmarks in your Raindrop account after you sign in.

## The folders

Open `raindrop-bookmark-app`. These are the folders that belong there.

| Folder | What is inside |
| --- | --- |
| `raindrop-website-app` | Raindrop's website code. This is the program you start. |
| `raindrop-website-app-data` | Kept for files that belong to the website but are not the program. The running website stores its signed-in copy in the browser, not in this folder. |
| `raindrop-api` | Raindrop's written notes about their API. There is nothing to start here. |
| `raindrop-chrome-extension` | The changed Chrome extension. |
| `raindrop-manual-exports` | The HTML file you exported from Raindrop on 26 Sep 2026. There is nothing to start here. |

There is no `library` folder. There is no `raindrop-desktop-app` folder. There is no separate Python website.

## The port

The website uses port **4350** on this Mac only (`127.0.0.1`). Nothing else in this project listens on a port.

Add this row to the ports documentation:

| Project / service | Default | Reserved range | Purpose | Owner / notes |
| --- | ---: | --- | --- | --- |
| Connect | `4350` | `4350-4359` | Local bookmark library. Later saved-post tools in this repo use the next free port in this block. | Binds `127.0.0.1:4350` only. Do not bind outside `4350-4359`. `4360-4399` stays unallocated. |

## Install the website

You do this once, or again after the project dependencies change. You need Node.js and npm.

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Download the pieces the website needs

```sh
npm ci
```

Wait until the prompt comes back. This creates a `node_modules` folder. That folder stays on this Mac and is not in git.

## Build the website

Do this once before the first start, and again after the website code changes.

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Make the files the browser will open

```sh
npm run build
```

Wait until it says the build compiled. The finished files are in `dist/web/prod`. This build talks to `https://api.raindrop.io`, the same place the real Raindrop website uses.

## Start the website

The build must already be done. Leave the terminal open while you use the site.

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the website on

```sh
npm start
```

The terminal prints `Raindrop website at http://127.0.0.1:4350` and then waits. Waiting means it is on. Sign-in and bookmark requests go through this same address to raindrop.io. The address is:

http://127.0.0.1:4350

### Open the website

Open Chrome or Safari and go to http://127.0.0.1:4350

Sign in with your Raindrop account. Your bookmarks load from raindrop.io into this browser.

## Stop the website

### Stop it while the terminal is still open

1. Click the terminal window where `npm start` is running.
2. Press the Control key and the C key at the same time.

You get a prompt back. The address stops opening. That means it is off.

### Stop it if you already closed the terminal

This prints the process that is using port 4350.

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

If a line appears, the number in the second column is the PID. Then run this, with that number instead of `PID`:

```sh
kill PID
```

### Check that it is really stopped

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

No lines means it is stopped. A line means it is still on. Run `kill` again with the PID from that line.

## Build the Chrome extension

Do this when you want a new copy of **Raindrop.io (local)** to load into Chrome.

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

This build talks to `https://api.raindrop.io`. Do not use `npm run local:extension:chrome` for everyday use. That command looks for a Raindrop API on your Mac, and this project does not run one.

## Install the extension into Chrome

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Choose `dist/chrome/prod` from the path above.
6. Open **Raindrop.io (local)** and sign in. It is a different install from the store extension. Saves still go to your Raindrop account.
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

## What you do not start

`raindrop-api` is notes. There is no command to run there.

`raindrop-manual-exports` is the HTML file from 26 Sep 2026. There is no command to run there.

`npm run local` inside the website folder is Raindrop's development mode. It also uses port 4350, and it looks for a private API at `http://localhost:3000`. This project does not run that API. Use `npm run build` and then `npm start` instead.
