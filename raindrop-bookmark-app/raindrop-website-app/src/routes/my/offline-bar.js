import React, { useState } from 'react'
import Button from '~co/common/button'

export default function OfflineBar() {
	const [status, setStatus] = useState('The sync server is off until you start it. Browsing does not need it.')
	const [busy, setBusy] = useState(false)

	function sync() {
		setBusy(true)
		setStatus('Asking the sync server on this Mac…')
		fetch('http://127.0.0.1:4351/sync', { method: 'POST' })
			.then(response => response.json())
			.then(data => {
				if (!data.ok) throw new Error(data.error || 'failed')
				const added = data.downloaded ? data.downloaded.added : 0
				setStatus(`Sync finished. ${added} new. Reload this file to see them.`)
			})
			.catch(() => {
				setStatus('The sync server is not running. Start it with the commands below, then click again.')
			})
			.finally(() => setBusy(false))
	}

	return (
		<div style={{
			padding: '10px 16px',
			borderBottom: '1px solid var(--border-color, #ddd)',
			fontSize: 13
		}}>
			<Button variant='primary' disabled={busy} onClick={sync}>Sync newest bookmarks</Button>
			<p style={{ margin: '8px 0 0' }}>{status}</p>
			<pre style={{ margin: '8px 0 0', whiteSpace: 'pre-wrap' }}>{`cd /Users/john/dev/connect/raindrop-bookmark-app/raindrop-website-app
python3 server.py`}</pre>
		</div>
	)
}
