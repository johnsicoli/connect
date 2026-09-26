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

	async function sync() {
		setBusy(true)
		publish({ kind: 'progress', text: 'Starting sync…' })
		let started
		try {
			started = await (await fetch('http://127.0.0.1:4351/sync', { method: 'POST' })).json()
		} catch (e) {
			publish({
				kind: 'error',
				text: 'The sync server is off. Open Terminal, paste the two commands below, leave that window open, then click Sync again.\n\ncd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app\npython3 server.py'
			})
			setBusy(false)
			return
		}
		if (!started.ok) {
			publish({ kind: 'error', text: started.error || 'Sync failed.' })
			setBusy(false)
			return
		}
		while (true) {
			await new Promise(resolve => setTimeout(resolve, 800))
			let status
			try {
				status = await (await fetch('http://127.0.0.1:4351/status')).json()
			} catch (e) {
				publish({ kind: 'error', text: 'The sync server stopped while it was working. Start it again and click Sync.' })
				setBusy(false)
				return
			}
			if (status.running) {
				publish({ kind: 'progress', text: status.message || 'Working…' })
				continue
			}
			if (status.error) {
				publish({ kind: 'error', text: status.error })
				setBusy(false)
				return
			}
			const added = status.result && status.result.downloaded ? status.result.downloaded.added : 0
			publish({ kind: 'ok', text: `Sync finished. ${added} new. Reloading…` })
			setTimeout(() => window.location.reload(), 1200)
			return
		}
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
