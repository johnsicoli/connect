import browser from 'webextension-polyfill'
import Api from '~data/modules/api'
import { STORAGE_KEY } from '../invisibleSaveKey'

export { STORAGE_KEY }

// Local to this browser. Not part of the Raindrop account config, so the
// official servers never have to know about it.
const MODE_KEY = 'browser_extension_mode'

export async function invisibleSaveEnabled() {
    try {
        const stored = await browser.storage.local.get(STORAGE_KEY)
        return stored[STORAGE_KEY] === true
    } catch (e) {
        return false
    }
}

// Clipper is the only mode where the toolbar click should save instead of
// opening a window. Mini app keeps the normal popup.
async function clipperMode(explicit) {
    if (typeof explicit === 'boolean') return explicit

    try {
        const session = await browser.storage.session.get(MODE_KEY)
        if (session[MODE_KEY])
            return session[MODE_KEY] !== 'mini_app'
    } catch (e) {}

    try {
        const { user } = await Api._get('user')
        return user?.config?.browser_extension_mode !== 'mini_app'
    } catch (e) {
        return true
    }
}

export async function invisibleSaveActive(explicitClipper) {
    if (!(await invisibleSaveEnabled())) return false
    return clipperMode(explicitClipper)
}

// Chrome fires action.onClicked only when the toolbar popup is empty.
// A configured popup always opens a window and swallows the click.
export async function applyToolbarPopup(explicitClipper) {
    const { default_popup } = browser.runtime.getManifest().action
    const hide = await invisibleSaveActive(explicitClipper)
    await browser.action.setPopup({ popup: hide ? '' : default_popup })
}

export function collectionIdFromConfig(config = {}) {
    const id = config.add_default_collection || config.last_collection
    return id || -1
}
