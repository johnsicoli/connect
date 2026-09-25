import browser from 'webextension-polyfill'
import Api from '~data/modules/api'
import { currentTab, getMeta } from '~target'
import { updateBadge } from './action'
import * as links from './links'
import {
    STORAGE_KEY,
    applyToolbarPopup,
    collectionIdFromConfig,
    invisibleSaveActive
} from './toolbarPopup'

const saving = new Set()

async function paint(tabId, text, color) {
    if (!tabId) return
    try {
        await browser.action.setBadgeBackgroundColor({ tabId, color })
        await browser.action.setBadgeText({ tabId, text })
        if (typeof browser.action.setBadgeTextColor == 'function')
            await browser.action.setBadgeTextColor({ tabId, color: '#FFFFFF' })
    } catch (e) {}
}

export async function saveTab(tab) {
    const current = tab?.id ? tab : await currentTab()
    const tabId = current.id
    const url = current.url || ''

    if (tabId && saving.has(tabId)) return
    if (tabId) saving.add(tabId)

    try {
        if (!/^https?:\/\//i.test(url)) {
            await paint(tabId, '!', '#E5484D')
            setTimeout(() => updateBadge().catch(()=>{}), 1600)
            return
        }

        await paint(tabId, '…', '#0087EA')

        let meta = {}
        try { meta = await getMeta(current) || {} } catch (e) { meta = {} }
        const link = meta.link || url

        let id = links.getId(link) || links.getId(url)
        if (!id) {
            try {
                const found = await Api._get('import/url/exists?url=' + encodeURIComponent(link))
                if (found?.ids?.length) id = found.ids[0]
            } catch (e) {}
        }

        if (!id) {
            let collectionId = -1
            try {
                const { user } = await Api._get('user')
                collectionId = collectionIdFromConfig(user?.config)
            } catch (e) {}

            const item = {
                link,
                title: meta.title || current.title || link,
                collectionId,
                pleaseParse: { weight: 1 }
            }
            if (meta.excerpt) item.excerpt = meta.excerpt
            if (meta.cover) item.cover = meta.cover
            if (meta.media?.length) item.media = meta.media

            let res
            try {
                res = await Api._post('raindrop', item)
            } catch (e) {
                res = await Api._post('raindrop', { ...item, collectionId: -1 })
            }
            id = res?.item?._id
            if (!id) throw new Error('save failed')
        }

        links.add(link, id)
        if (url !== link) links.add(url, id)
        try { browser.runtime.sendMessage({ type: 'BOOKMARKS_CHANGED' }) } catch (e) {}
        await updateBadge()
    } catch (e) {
        console.error(e)
        await paint(tabId, '!', '#E5484D')
        setTimeout(() => updateBadge().catch(()=>{}), 2000)
    } finally {
        if (tabId) saving.delete(tabId)
    }
}

async function onClicked(tab) {
    if (!(await invisibleSaveActive())) {
        await applyToolbarPopup()
        try { await browser.action.openPopup() } catch (e) {}
        return
    }
    await saveTab(tab)
}

function onStorage(changes, area) {
    if (area !== 'local' || !changes[STORAGE_KEY]) return
    applyToolbarPopup().catch(console.error)
}

function onMessage(message) {
    if (!message || message.type !== 'APPLY_TOOLBAR_POPUP') return
    applyToolbarPopup(message.clipper).catch(console.error)
}

export default function () {
    browser.action.onClicked.removeListener(onClicked)
    browser.action.onClicked.addListener(onClicked)

    browser.storage.onChanged.removeListener(onStorage)
    browser.storage.onChanged.addListener(onStorage)

    browser.runtime.onMessage.removeListener(onMessage)
    browser.runtime.onMessage.addListener(onMessage)

    applyToolbarPopup().catch(console.error)
}
