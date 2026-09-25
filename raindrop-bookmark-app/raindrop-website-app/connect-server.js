// Serves the built Raindrop website on 127.0.0.1:4350.
// /v1 is forwarded to https://api.raindrop.io so sign-in works from this Mac.
const fs = require('fs')
const http = require('http')
const https = require('https')
const path = require('path')

const HOST = '127.0.0.1'
const PORT = 4350
const ROOT = path.join(__dirname, 'dist', 'web', 'prod')
const API_HOST = 'api.raindrop.io'

const TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon',
    '.webp': 'image/webp',
    '.txt': 'text/plain; charset=utf-8',
    '.webmanifest': 'application/manifest+json',
}

function localCookie(cookie) {
    return cookie
        .replace(/;\s*Domain=[^;]*/ig, '')
        .replace(/;\s*Secure/ig, '')
        .replace(/;\s*SameSite=None/ig, '; SameSite=Lax')
}

function localLocation(location) {
    if (!location) return location
    if (location.startsWith('https://api.raindrop.io'))
        return location.slice('https://api.raindrop.io'.length) || '/'
    if (location.startsWith('https://app.raindrop.io'))
        return location.slice('https://app.raindrop.io'.length) || '/'
    return location
}

function sendFile(res, filePath) {
    const body = fs.readFileSync(filePath)
    res.writeHead(200, {
        'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream',
        'Content-Length': body.length,
    })
    res.end(body)
}

function proxyApi(req, res) {
    const headers = { ...req.headers, host: API_HOST }
    delete headers.origin
    delete headers.referer
    const upstream = https.request({
        hostname: API_HOST,
        path: req.url,
        method: req.method,
        headers,
    }, (up) => {
        const out = { ...up.headers }
        if (out['set-cookie'])
            out['set-cookie'] = [].concat(out['set-cookie']).map(localCookie)
        if (out.location)
            out.location = localLocation(out.location)
        delete out['content-length']
        res.writeHead(up.statusCode, out)
        up.pipe(res)
    })
    upstream.on('error', (error) => {
        res.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' })
        res.end(error.message)
    })
    req.pipe(upstream)
}

const server = http.createServer((req, res) => {
    if (req.url.startsWith('/v1/') || req.url === '/v1')
        return proxyApi(req, res)

    const urlPath = decodeURIComponent(req.url.split('?')[0])
    const filePath = path.normalize(path.join(ROOT, urlPath))
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403)
        res.end('Forbidden')
        return
    }
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile())
        return sendFile(res, filePath)
    sendFile(res, path.join(ROOT, 'index.html'))
})

server.listen(PORT, HOST, () => {
    console.log(`Raindrop website at http://${HOST}:${PORT}`)
})
