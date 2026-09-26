import normalizeURL from './url'
import { RENDER_URL, WORKERS_BASE_URL, LEGACY_WORKERS_BASE_URL } from '../../constants/app'

export default function(url='') {
    if (process.env.CONNECT_LOCAL == '1' && url && !/^https?:/i.test(url)) {
        try { return new URL(url, window.location.href).href } catch (e) { return url }
    }

    let finalURL = normalizeURL(url)
    if (!finalURL)
        return ''

    if (finalURL.includes(WORKERS_BASE_URL) ||
        finalURL.includes(LEGACY_WORKERS_BASE_URL))
        return finalURL.replace(/width=\d+/, 'a')

    return RENDER_URL+'/'+encodeURIComponent(finalURL)
}