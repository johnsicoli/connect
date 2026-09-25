# Raindrop Chrome extension

This folder is the Raindrop Chrome extension inside Connect. Connect is the application for connecting to websites and sources. Raindrop is one source. The full account is in the root [README](../../README.md).

The extension is Raindrop's source plus an Invisible save setting. The built name is **Raindrop.io (local)**. A production build talks to `https://api.raindrop.io`. The store extension stays installed and is a different card in Chrome.

The rest of this file, after these steps, is Raindrop's original build notes.

## Install the pieces the build needs

### Go to this folder

```sh
cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-chrome-extension
```

### Download the build tools into node_modules

```sh
npm ci
```

Wait for the prompt to come back. `node_modules` stays on this Mac and is not in git.

## Build the extension Chrome loads

### Make the production build

```sh
npm run build:extension:chrome
```

Wait until it says the build compiled. Chrome loads this folder:

`/Users/john/dev/connect/raindrop-bookmark-app/raindrop-chrome-extension/dist/chrome/prod`

## Load it into Chrome

1. Open `chrome://extensions`.
2. Turn on Developer mode.
3. Click Load unpacked.
4. Choose the `dist/chrome/prod` folder.
5. Open **Raindrop.io (local)** and sign in.
6. In Clipper settings, turn on Invisible save.

## Turn it off

Open `chrome://extensions`, find **Raindrop.io (local)**, and switch it off or click Remove. The store extension is a different card. There is no terminal server to stop.

## Reload it after you build again

### Build again

```sh
npm run build:extension:chrome
```

Then click Reload on the **Raindrop.io (local)** card at `chrome://extensions`.

# Raindrop.io 5.0
Mono repo for Raindrop.io web app, browser extension and desktop app

## Build
Be sure to run `npm i` before calling any commands below
| target   | command | notes |
|----------|---------|-------|
| web      | `npm run build` |
| electron | `npm run build:electron` |
| chrome   | `npm run build:extension:chrome` |
| edge     | `npm run build:extension:edge` |
| firefox   | `npm run build:extension:firefox` | Saved to `dist/firefox/prod`
| opera    | `npm run build:extension:opera` |
| safari   | `npm run build:extension:safari` | Then open **build/xcode** project

## Development
| target   | command | notes |
|----------|---------|-------|
| web      | `npm run local` |
| chrome   | `npm run local:extension:chrome` | Turn off `same-site-by-default-cookies` in Chrome browser flags

### Reset Safari extension state (dev purpose only)
Danger removes all safari settings!!!

```sh
rm -rf ~/Library/Containers/com.apple.Safari/Data/Library/Safari/*
rm -rf ~/Library/Containers/com.apple.Safari/Data/Library/WebKit/*
rm -rf ~/Library/Developer/Xcode/DerivedData/Save_to_Raindrop.io-*(N)
defaults delete com.apple.Safari 2>/dev/null
```

## Supported browsers
- Chrome >= 67 - older versions not support SameSite cookie
- Safari >= 11 (OS X 10.11) - older version not support JS Rest in objects
- Firefox >= 55 - older version not support JS Rest in objects
- Edge >= 80 - earlies Blink version