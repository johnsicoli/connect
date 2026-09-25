# Raindrop website, on this Mac

This folder is Raindrop's website code. Starting it shows their website at http://127.0.0.1:4350 and loads bookmarks from your Raindrop account. The Mac App Store app is separate and stays installed.

Raindrop's own short build list is in `UPSTREAM-README.md`. The commands below are the ones to use for Connect. The whole project is explained in [../../README.md](../../README.md).

The website listens only on port **4350**.

## Install the website

Do this once, or again after the dependencies change.

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Download the pieces the website needs

```sh
npm ci
```

Wait until the prompt comes back. This creates `node_modules`. That folder stays on this Mac and is not in git.

## Build the website

Do this before the first start, and again after the code in this folder changes.

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Make the files the browser will open

```sh
npm run build
```

Wait until it says the build compiled. The files land in `dist/web/prod`. This build talks to `https://api.raindrop.io`.

## Start the website

The build must already be done. Leave the terminal open.

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the website on

```sh
npm start
```

Wait until it prints `Raindrop website at http://127.0.0.1:4350`. Then it sits there. Sitting there means it is on. Sign-in and bookmark requests go through this address to raindrop.io.

### Open it

In Chrome or Safari, go to http://127.0.0.1:4350 and sign in.

## Stop the website

### Stop it while this terminal is open

Click this terminal. Press Control and C together. The prompt comes back. The website is off.

### Stop it if the terminal is gone

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

If a line is printed, the second column is the PID. Run this with that number instead of `PID`:

```sh
kill PID
```

### Check that it is off

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

No output means it is off.
