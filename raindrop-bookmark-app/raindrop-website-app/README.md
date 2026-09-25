# Modified Raindrop clone and library

This folder holds two programs for the Raindrop source in Connect.

The offline Raindrop website is `dist/web/prod/index.html`. Open that file in a browser. It is Raindrop's own interface, with your bookmarks and hero images saved on this Mac. It does not need a web server. Add and sort by date are in that interface.

The modified Raindrop website clone is `src/`, `package.json`, and `connect-server.js`. You do not need it to browse the saved bookmarks.

The database is in `../raindrop-website-app-data`. Saved images are in `static/media/`. The page data is `static/bookmarks.js`. Images and `bookmarks.js` stay on this Mac and are not in git.

The full account of Connect and of Raindrop is in the root [README](../../README.md).

## Save bookmarks and images onto this Mac

Do this once, and again after a Terminal download of new bookmarks.

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Download Open Graph text and hero images, then write the page data

```sh
python3 build_offline.py
```

Wait until it prints a line with `bookmarks` and `heroes`. It stops by itself.

## Open the bookmark page

### Open the file

```sh
open /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app/dist/web/prod/index.html
```

No server is started. The page works while that Terminal is closed.

## Start the sync server

Only for the **Sync newest bookmarks** button. Leave it off the rest of the time. It uses port 4351. The page shows these commands too.

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Turn the sync server on

```sh
python3 server.py
```

Wait until it prints `Sync server at http://127.0.0.1:4351`. Leave the window open. Click the button on the bookmark page. When it says the sync finished, reload the file.

## Stop the sync server

### Stop it while this terminal is open

Click this terminal. Press Control and C together.

### Stop it if the terminal is gone

```sh
lsof -nP -iTCP:4351 -sTCP:LISTEN
```

If a line is printed, the second column is the PID. Run this with that number instead of `PID`:

```sh
kill PID
```

### Check that it is off

```sh
lsof -nP -iTCP:4351 -sTCP:LISTEN
```

No output means it is off. The bookmark file still opens.

## Fill the database from the HTML export

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
```

### Read the export into the database

```sh
python3 import_html.py
```

It prints how many bookmarks it read, then it stops. Then run `python3 build_offline.py` so the page and images match the database.
