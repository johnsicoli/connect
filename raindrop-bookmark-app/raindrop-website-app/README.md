# Modified Raindrop clone and library

This folder holds two programs.

The modified clone is Raindrop's website, changed so it runs on this Mac. Its files are `src/`, `package.json`, `connect-server.js`, and `dist/`. It opens at http://127.0.0.1:4350.

The library is the local bookmark viewer. Its files are `server.py`, `db.py`, `import_html.py`, and `static/`. It opens at http://127.0.0.1:4351. The database is not in this folder. It is in `../raindrop-website-app-data`.

Raindrop's original short build list is in `UPSTREAM-README.md`. The whole project is explained in [../../README.md](../../README.md).

## Install the modified clone

Do this once, or again after the dependencies change.

### Go to this folder

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

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Make the files the browser will open

```sh
npm run build
```

Wait until it says the build compiled. The files land in `dist/web/prod`.

## Start the modified clone

The build must already be done. Leave the terminal open. This uses port 4350.

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the modified clone on

```sh
npm start
```

Wait until it prints `Raindrop website at http://127.0.0.1:4350`. Then it sits there. Sitting there means it is on.

### Open the modified clone

In Chrome or Safari, go to http://127.0.0.1:4350 and sign in. Sign-in goes through this address to raindrop.io.

## Stop the modified clone

### Stop it while this terminal is open

Click the terminal where `npm start` is running. Press Control and C together. The prompt comes back. Port 4350 is free.

### Stop it if the terminal is gone

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

If a line is printed, the second column is the PID. Run this with that number instead of `PID`:

```sh
kill PID
```

### Check that the modified clone is off

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

No output means it is off.

## Start the library

This is the local bookmark viewer. It does not need `npm`. Leave the terminal open. This uses port 4351.

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the library on

```sh
python3 server.py
```

Wait until it prints `Connect library at http://127.0.0.1:4351`. The first time the database is empty, this also reads the HTML export.

### Open the library

In Chrome or Safari, go to http://127.0.0.1:4351

## Stop the library

### Stop it while this terminal is open

Click the terminal where `python3 server.py` is running. Press Control and C together.

### Stop it if the terminal is gone

```sh
lsof -nP -iTCP:4351 -sTCP:LISTEN
```

If a line is printed, the second column is the PID. Run this with that number instead of `PID`:

```sh
kill PID
```

### Check that the library is off

```sh
lsof -nP -iTCP:4351 -sTCP:LISTEN
```

No output means it is off.

## Fill the library database from the HTML export

Starting `python3 server.py` with an empty database does this for you. Use this command only if you want to load the export yourself.

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Read the export into the database

```sh
python3 import_html.py
```

It prints how many bookmarks it read, then it stops. The database file is `../raindrop-website-app-data/bookmarks.sqlite`.
