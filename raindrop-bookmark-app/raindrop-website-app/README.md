# Bookmark website

This folder is the website that shows the local copy of your Raindrop bookmarks. Open it in a browser on this Mac. It reads the database in the folder next door, `raindrop-website-app-data`. It does not contain that database.

Raindrop's original website source is in this same folder (`src/`, `package.json`, and `UPSTREAM-README.md`). That is their code from https://github.com/raindropio/app. The local bookmarks site is the Python files here (`server.py`, `db.py`, `import_html.py`, and `static/`).

The full project explanation is in [../../README.md](../../README.md).

## Start the bookmark website

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the website on

```sh
python3 server.py
```

Leave this terminal open. It prints `Connect library at http://127.0.0.1:4350` and then waits. Waiting means the website is on. Port 4350 is reserved for Connect.

### Open it

In Chrome or Safari, go to http://127.0.0.1:4350

## Stop the bookmark website

### Stop it while this terminal is open

Click this terminal. Press Control and C together. You get a prompt back. The website is off.

### Stop it if the terminal is gone

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

If a line is printed, copy the PID (the number in the second column) and run:

```sh
kill PID
```

### Check that it is off

```sh
lsof -nP -iTCP:4350 -sTCP:LISTEN
```

No output means it is off.

## Fill the database from the HTML export

You only do this yourself if the database was deleted. Starting `server.py` with an empty database does this for you.

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Read the export into the database

```sh
python3 import_html.py
```

It prints how many bookmarks it read, then it stops. The database file is `../raindrop-website-app-data/bookmarks.sqlite`. The export it reads is `../raindrop-manual-exports/raindrop-bookmark-export-26Sep26.html`.
