# Connect

This folder is a copy of your Raindrop bookmarks that lives on this Mac, plus a changed Chrome extension that can save a page without opening a window.

The Raindrop app from the Mac App Store and the Raindrop extension from the Chrome Web Store stay installed. They still talk to raindrop.io. This project does not replace them.

The public copy of the code is https://github.com/johnsicoli/connect. Your bookmarks and your API token are not in that public copy.

## The folders

Open `raindrop-bookmark-app`. These are the only folders that belong there.

| Folder | What is inside |
| --- | --- |
| `raindrop-website-app` | The website you open in a browser to look at the local bookmarks. The code for that website stays in this folder. |
| `raindrop-website-app-data` | The database file that holds the bookmarks. No program code belongs here. |
| `raindrop-api` | The program that asks Raindrop for new bookmarks, and Raindrop's API notes. |
| `raindrop-chrome-extension` | The changed Chrome extension. |
| `raindrop-manual-exports` | The HTML file you exported from Raindrop on 26 Sep 2026. |

There is no `library` folder. There is no `raindrop-desktop-app` folder.

## The port

The website uses port **4350**. Nothing else in this project listens on a port.

Add this row to the ports documentation:

| Project / service | Default | Reserved range | Purpose | Owner / notes |
| --- | ---: | --- | --- | --- |
| Connect | `4350` | `4350-4359` | Local bookmark library. Later saved-post tools in this repo use the next free port in this block. | Binds `127.0.0.1:4350` only. Do not bind outside `4350-4359`. `4360-4399` stays unallocated. |

## Start the bookmark website

This turns the website on. Leave the terminal window open while you use it.

### Go to the website folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

You are now in the folder that holds the website code.

### Turn the website on

```sh
python3 server.py
```

The terminal prints `Connect library at http://127.0.0.1:4350` and then waits. Waiting means it is on. The first time the database is empty, this also reads the HTML export and fills the database.

### Open the website

Open Chrome or Safari and go to:

http://127.0.0.1:4350

You should see the title Bookmarks and a count of bookmarks.

## Stop the bookmark website

### Stop it while the terminal is still open

1. Click the terminal window where `python3 server.py` is running.
2. Press the Control key and the C key at the same time.

The terminal gives you a new prompt. The website address stops working. That is what stop looks like.

### Stop it if you already closed the terminal

Paste this. It prints the process number of whatever is using port 4350.

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

If a line appears, the last number in the second column is the PID. Then paste this, using that number instead of `PID`:

```sh
kill PID
```

### Check that it is really stopped

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

No lines means it is stopped. A line means it is still on. Run `kill` again with the PID from that line.

## Download new bookmarks from Raindrop

This is not a website. It runs, adds any new bookmarks, and then it is finished. It does not use a port.

The token file must already exist at `raindrop-bookmark-app/raindrop-api/.env` with one line, `RAINDROP_TOKEN=...`. That file is already on this Mac. It is not in git. If it is missing, copy `.env.example` to `.env` in that same folder and paste the test token from https://app.raindrop.io/settings/integrations.

### Go to the API folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-api
```

### Download the new bookmarks

```sh
python3 sync_raindrop.py
```

When it finishes, the terminal prints how many bookmarks were added. Then you get a prompt again. That means it stopped by itself. Open the website again (start it first if it is off) and the new bookmarks are at the top.

It only keeps bookmarks saved at least one second after the newest bookmark in the 26 Sep export. Running it again does not make a second copy of those bookmarks.

## Build the Chrome extension

Do this when you want a new copy of **Raindrop.io (local)** to load into Chrome. You need Node.js and npm.

### Go to the extension folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-chrome-extension
```

### Install the pieces the build needs

```sh
npm ci
```

Wait until it finishes and you get a prompt. This creates `node_modules`. That folder stays on this Mac and is not in git. You only need to do this again after the project dependencies change.

### Build the extension

```sh
npm run build:extension:chrome
```

Wait until it says the build compiled. The folder Chrome loads is:

`/Users/john/dev/connect/raindrop-bookmark-app/raindrop-chrome-extension/dist/chrome/prod`

This build talks to `https://api.raindrop.io`. Do not load a dev build. The dev command talks to `localhost:3000`, which is not this project.

## Install the extension into Chrome

1. Open Chrome.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Choose the folder `dist/chrome/prod` from the path above.
6. The new card is named **Raindrop.io (local)**. Click it once and sign in. It is a different install from the store extension. Saves still go to your Raindrop account.
7. Open its settings. Under Clipper, turn on **Invisible save**.

After that, clicking the local icon saves the page without opening a window. A check mark means it saved. An exclamation mark means it did not. Right-click that icon and choose Settings when you want the window.

### Reload the extension after a new build

```sh
npm run build:extension:chrome
```

Then on `chrome://extensions`, click **Reload** on the **Raindrop.io (local)** card.

## Turn the Chrome extension off

1. Open `chrome://extensions`.
2. Find **Raindrop.io (local)**.
3. Switch it off, or click Remove.

The store extension is a different card. Leave that one as it is. There is no server to stop for the extension.

## What you do not start

Raindrop's original website source is also inside `raindrop-website-app`, in `src/` and `package.json`. That is their code, kept so the folder matches what we downloaded. Starting it is `npm run local` from that folder, and it expects Raindrop's own servers. This project does not use that command to show your local bookmarks. Use `python3 server.py` instead.

`raindrop-manual-exports` is only the HTML file. There is nothing to start.
