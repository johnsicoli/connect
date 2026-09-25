const fs = require('fs')
const path = require('path')

const root = __dirname
const dest = path.join(root, 'dist', 'web', 'prod')
const bookmarks = path.join(root, 'static', 'bookmarks.js')
const media = path.join(root, 'static', 'media')

fs.mkdirSync(dest, { recursive: true })
if (fs.existsSync(bookmarks))
	fs.copyFileSync(bookmarks, path.join(dest, 'bookmarks.js'))
if (fs.existsSync(media))
	fs.cpSync(media, path.join(dest, 'media'), { recursive: true })
console.log('Copied local bookmarks and images into dist/web/prod')
