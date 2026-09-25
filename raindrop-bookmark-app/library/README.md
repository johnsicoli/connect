# Connect library

The bookmark web app. What it does, how to build the extension, and how to start and stop everything is in the repo README: [../../README.md](../../README.md).

```sh
python3 server.py
```

Open http://127.0.0.1:4350. Stop it with Ctrl+C in this terminal.

```sh
python3 sync_raindrop.py
```

Sync reads `RAINDROP_TOKEN` from `.env` and exits when it finishes. It does not listen on a port.
