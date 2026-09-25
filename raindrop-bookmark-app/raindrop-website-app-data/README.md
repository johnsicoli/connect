# Raindrop library data

This folder holds the library database and nothing else. The programs that read and write it live in `../raindrop-website-app` and `../raindrop-api`.

The file is `bookmarks.sqlite`. Git does not store it, because the Connect repo on GitHub is public. A fresh library start creates it from the HTML export in `../raindrop-manual-exports` when the file is missing.

There is no server to start in this folder. Do not put program code here.

## See that the database file is here

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app-data
```

### List the files

```sh
ls -lh
```

You should see `bookmarks.sqlite` after the library has been started once, or after `python3 import_html.py` has been run from `../raindrop-website-app`.
