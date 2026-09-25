# Connect library

A local copy of Raindrop bookmarks. The official Raindrop apps are unchanged. This app reads a database on this machine.

## Run

```sh
cd raindrop-bookmark-app/library
python3 server.py
```

Open http://127.0.0.1:8787

The first launch imports `../raindrop-manual-exports/raindrop-bookmark-export-26Sep26.html` into `data/bookmarks.sqlite`. That file and the database are not committed, because the GitHub repo is public.

## API update

When you want bookmarks saved after the newest item in that export:

1. Create an app at https://app.raindrop.io/settings/integrations and copy its test token.
2. Save it as `RAINDROP_TOKEN` in `library/.env` (see `.env.example`). Do not commit `.env`.
3. Run `python3 sync_raindrop.py`.

The sync asks Raindrop for raindrops with `created` after the cutoff stored during import, and skips anything at or before that time.
