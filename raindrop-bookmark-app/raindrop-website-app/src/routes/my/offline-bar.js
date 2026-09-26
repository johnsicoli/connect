import React, { useEffect, useState } from 'react'
import Button from '~co/common/button'

const listeners = new Set()
let current = null

function publish(next) {
	current = next
	listeners.forEach(listener => listener(current))
}

function useBanner() {
	const [value, setValue] = useState(current)
	useEffect(() => {
		listeners.add(setValue)
		return () => listeners.delete(setValue)
	}, [])
	return value
}

export function SyncButton() {
	const [busy, setBusy] = useState(false)

	function sync() {
		setBusy(true)
		publish({ kind: 'progress', text: 'Downloading new bookmarks and images…' })
		const controller = new AbortController()
		const timer = setTimeout(() => controller.abort(), 4000)
		fetch('http://127.0.0.1:4351/sync', { method: 'POST', signal: controller.signal })
			.then(response => response.json())
			.then(data => {
				if (!data.ok) throw new Error(data.error || 'Sync failed')
				const added = data.downloaded ? data.downloaded.added : 0
				const skipped = data.downloaded ? data.downloaded.skipped : 0
				publish({
					kind: 'ok',
					text: `Sync finished. ${added} new, ${skipped} already saved. Reloading…`
				})
				setTimeout(() => window.location.reload(), 1200)
			})
			.catch(() => {
				publish({
					kind: 'error',
					text: 'The sync server is off. Open Terminal, paste the two commands below, leave that window open, then click Sync again.\n\ncd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app\npython3 server.py'
				})
			})
			.finally(() => {
				clearTimeout(timer)
				setBusy(false)
			})
	}

	return (
		<Button disabled={busy} onClick={sync}>
			Sync
		</Button>
	)
}

export default function OfflineBanner() {
	const banner = useBanner()
	if (!banner) return null

	const background = banner.kind == 'error' ? '#7a2e2e' : '#1f6b4a'

	return (
		<div style={{
			position: 'fixed',
			top: 12,
			left: '50%',
			transform: 'translateX(-50%)',
			zIndex: 50,
			maxWidth: 560,
			width: 'calc(100% - 32px)',
			background,
			color: 'white',
			borderRadius: 12,
			padding: '12px 40px 12px 14px',
			whiteSpace: 'pre-wrap',
			boxShadow: '0 8px 24px rgba(0,0,0,.35)'
		}}>
			{banner.text}
			<button
				type='button'
				aria-label='Close'
				onClick={() => publish(null)}
				style={{
					position: 'absolute',
					top: 8,
					right: 8,
					border: 0,
					background: 'transparent',
					color: 'white',
					fontSize: 18,
					cursor: 'pointer'
				}}>
				×
			</button>
		</div>
	)
}
