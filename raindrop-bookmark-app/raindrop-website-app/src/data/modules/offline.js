// Answers Raindrop's own API calls from the bookmark file saved on this Mac.
// Loaded by static/bookmarks.js as window.LIBRARY before the app starts.

const PER_PAGE = 40

function library() {
	const data = (typeof window !== 'undefined' && window.LIBRARY) || {}
	if (!library.items) {
		library.items = (data.bookmarks || []).map(toRaindrop)
	}
	return library.items
}

function toRaindrop(item) {
	const id = parseInt(item.id, 10)
	const cover = item.hero || item.ogImage || ''
	return {
		_id: id,
		title: item.title || item.pageTitle || item.url || '',
		excerpt: item.excerpt || '',
		note: item.note || '',
		cover,
		domain: item.domain || '',
		link: item.url || '',
		type: 'link',
		created: item.created_at || null,
		lastUpdate: item.created_at || null,
		important: !!item.important,
		tags: item.tags || [],
		highlights: (item.highlights || []).map((text, index) => ({ _id: `${id}-${index}`, text })),
		media: cover ? [{ link: cover, type: 'image' }] : [],
		collection: { $id: -1 },
		collectionId: -1
	}
}

function queryOf(url) {
	const [, search = ''] = url.split('?')
	return Object.fromEntries(new URLSearchParams(search))
}

function pathOf(url) {
	return url.split('?')[0]
}

function compare(sort) {
	const desc = String(sort || '').startsWith('-')
	const key = String(sort || 'created').replace(/^-/, '')
	return (a, b) => {
		const av = valueOf(a, key)
		const bv = valueOf(b, key)
		if (av < bv) return desc ? 1 : -1
		if (av > bv) return desc ? -1 : 1
		return 0
	}
}

function valueOf(item, key) {
	if (key === 'title') return (item.title || '').toLowerCase()
	if (key === 'domain') return item.domain || ''
	return item.created || ''
}

function matching(items, search) {
	const needle = (search || '').trim().toLowerCase()
	if (!needle) return items
	return items.filter(item => [
		item.title, item.excerpt, item.note, item.link, item.domain, ...(item.tags || [])
	].join('\n').toLowerCase().includes(needle))
}

function raindrops(url) {
	const path = pathOf(url)
	const id = parseInt(path.split('/')[1], 10)
	const query = queryOf(url)
	let items = library()
	if (id !== 0 && id !== -1)
		items = []
	items = matching(items, query.search).slice().sort(compare(query.sort || '-created'))
	const page = parseInt(query.page || '0', 10) || 0
	const slice = items.slice(page * PER_PAGE, (page + 1) * PER_PAGE)
	return { result: true, items: slice, count: items.length }
}

function tags() {
	const counts = new Map()
	for (const item of library())
		for (const tag of item.tags || [])
			counts.set(tag, (counts.get(tag) || 0) + 1)
	return [...counts.entries()]
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
		.map(([tag, count]) => ({ _id: tag, count }))
}

function user() {
	return {
		result: true,
		user: {
			_id: 1,
			name: 'John Sicoli',
			email: 'john.sicoli@gmail.com',
			password: true,
			emailConfirmed: true,
			groups: [],
			config: { default_collection_view: 'list' }
		}
	}
}

export function offlineAnswer(url, options = {}) {
	const method = String(options.method || 'GET').toUpperCase()
	const path = pathOf(url)

	if (method === 'POST' && path === 'raindrop') {
		let body = {}
		try { body = JSON.parse(options.body || '{}') } catch (e) {}
		const item = toRaindrop({
			id: Date.now(),
			title: body.title || body.link || 'Untitled',
			url: body.link || '',
			excerpt: body.excerpt || '',
			note: body.note || '',
			tags: body.tags || [],
			created_at: new Date().toISOString(),
			domain: ''
		})
		item.collectionId = body.collectionId || -1
		library().unshift(item)
		return { result: true, item }
	}

	if (method !== 'GET')
		return { result: true }

	if (path === 'user')
		return user()
	if (path === 'collections/all')
		return { result: true, items: [] }
	if (path === 'user/stats') {
		const count = library().length
		return { result: true, items: [{ _id: 0, count }, { _id: -1, count }] }
	}
	if (/^collection\/-?\d+\/lastAction$/.test(path))
		return { result: true, lastAction: 'local', version: 'offline' }
	if (/^collection\/-?\d+$/.test(path)) {
		const id = parseInt(path.split('/')[1], 10)
		return { result: true, item: { _id: id, title: id === -1 ? 'Unsorted' : 'All', access: { level: 4 } } }
	}
	if (path.startsWith('raindrops/'))
		return raindrops(url)
	if (path.startsWith('raindrop/')) {
		const id = parseInt(path.split('/')[1], 10)
		const item = library().find(entry => entry._id === id) || null
		return { result: true, item: item || {} }
	}
	if (path.startsWith('filters/'))
		return { result: true, tags: tags() }
	if (path.startsWith('import/url/exists'))
		return { result: true, ids: [] }

	return { result: true, items: [] }
}

export function fakeResponse(json) {
	const body = JSON.stringify(json)
	return {
		status: 200,
		headers: {
			get(name) {
				return String(name).toLowerCase() === 'content-type' ? 'application/json' : ''
			}
		},
		json: () => Promise.resolve(json),
		text: () => Promise.resolve(body)
	}
}
