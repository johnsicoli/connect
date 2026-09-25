const state = {
  bookmarks: [],
  query: "",
  tag: "",
  syncAfter: "",
}

const q = document.querySelector("#q")
const list = document.querySelector("#list")
const tagsEl = document.querySelector("#tags")
const statsEl = document.querySelector("#stats")
const cutoffEl = document.querySelector("#cutoff")
const countEl = document.querySelector("#result-count")
const emptyEl = document.querySelector("#empty")

function formatDate(iso) {
  if (!iso) return ""
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10)
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
}

function safeUrl(url) {
  try {
    const parsed = new URL(url)
    if (parsed.protocol === "http:" || parsed.protocol === "https:") return parsed.href
  } catch (e) {}
  return ""
}

function visible() {
  const query = state.query.trim().toLowerCase()
  return state.bookmarks.filter(item => {
    if (state.tag && !item.tags.includes(state.tag)) return false
    if (!query) return true
    const haystack = [
      item.title, item.url, item.excerpt, item.note, item.domain, item.collection,
      ...item.tags, ...item.highlights,
    ].join("\n").toLowerCase()
    return haystack.includes(query)
  })
}

function renderTags() {
  const counts = new Map()
  for (const item of state.bookmarks) {
    for (const tag of item.tags) counts.set(tag, (counts.get(tag) || 0) + 1)
  }
  const tags = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  tagsEl.replaceChildren()
  if (state.tag) {
    const clear = document.createElement("button")
    clear.className = "clear"
    clear.type = "button"
    clear.textContent = "All tags"
    clear.addEventListener("click", () => { state.tag = ""; render() })
    tagsEl.append(clear)
  }
  for (const [tag, count] of tags) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "tag"
    button.textContent = `${tag} ${count}`
    button.setAttribute("aria-pressed", String(state.tag === tag))
    button.addEventListener("click", () => {
      state.tag = state.tag === tag ? "" : tag
      render()
    })
    tagsEl.append(button)
  }
  if (!tags.length) {
    const none = document.createElement("p")
    none.className = "cutoff"
    none.textContent = "No tags in this copy yet."
    tagsEl.append(none)
  }
}

function renderList() {
  const items = visible()
  countEl.textContent = `${items.length} shown`
  emptyEl.hidden = items.length > 0
  list.replaceChildren()
  for (const item of items) {
    const card = document.createElement("li")
    card.className = "card"
    const href = safeUrl(item.url)
    if (item.hero) {
      const img = document.createElement("img")
      img.className = "cover"
      img.alt = ""
      img.src = item.hero
      img.addEventListener("error", () => {
        img.remove()
        card.classList.add("no-cover")
      })
      card.append(img)
    } else {
      card.classList.add("no-cover")
    }

    const body = document.createElement("div")
    const title = document.createElement("h3")
    title.className = "title"
    title.textContent = item.title
    body.append(title)

    const meta = document.createElement("p")
    meta.className = "meta"
    const bits = [item.domain, formatDate(item.created_at), item.collection].filter(Boolean)
    meta.append(document.createTextNode(bits.join(" · ")))
    if (item.important) {
      const star = document.createElement("span")
      star.className = "star"
      star.textContent = " · Saved as favorite"
      meta.append(star)
    }
    if (href) {
      meta.append(document.createTextNode(" · "))
      const open = document.createElement("a")
      open.href = href
      open.target = "_blank"
      open.rel = "noreferrer"
      open.textContent = "Open"
      meta.append(open)
    }
    body.append(meta)

    if (item.tags.length) {
      const row = document.createElement("div")
      row.className = "row-tags"
      for (const tag of item.tags) {
        const pill = document.createElement("span")
        pill.className = "pill"
        pill.textContent = tag
        row.append(pill)
      }
      body.append(row)
    }

    const extra = [item.excerpt, item.note].filter(Boolean)
    if (extra.length || item.highlights.length) {
      const details = document.createElement("details")
      const summary = document.createElement("summary")
      summary.textContent = item.highlights.length ? "Notes and highlights" : "Notes"
      details.append(summary)
      for (const text of extra) {
        const p = document.createElement("p")
        p.className = "excerpt"
        p.textContent = text
        details.append(p)
      }
      for (const text of item.highlights) {
        const p = document.createElement("p")
        p.className = "highlight"
        p.textContent = text
        details.append(p)
      }
      body.append(details)
    }

    card.append(body)
    list.append(card)
  }
}

function render() {
  const tagged = state.bookmarks.filter(item => item.tags.length).length
  statsEl.textContent = `${state.bookmarks.length} bookmarks · ${tagged} tagged`
  cutoffEl.textContent = state.syncAfter
    ? `API updates add bookmarks saved after ${formatDate(state.syncAfter)}.`
    : ""
  renderTags()
  renderList()
}

q.addEventListener("input", () => {
  state.query = q.value
  renderList()
  countEl.textContent = `${visible().length} shown`
})

const syncButton = document.querySelector("#sync-button")
const syncStatus = document.querySelector("#sync-status")

syncButton.addEventListener("click", () => {
  syncButton.disabled = true
  syncStatus.textContent = "Asking the sync server on this Mac…"
  fetch("http://127.0.0.1:4351/sync", { method: "POST" })
    .then(response => response.json())
    .then(data => {
      if (!data.ok) throw new Error(data.error || "Sync failed")
      const added = data.downloaded && data.downloaded.added
      syncStatus.textContent = `Sync finished. ${added} new bookmark${added === 1 ? "" : "s"}. Reload this file to see them.`
    })
    .catch(() => {
      syncStatus.textContent = "The sync server is not running. Start it with the commands above, then click again."
    })
    .finally(() => {
      syncButton.disabled = false
    })
})

const library = window.LIBRARY
if (!library || !Array.isArray(library.bookmarks)) {
  statsEl.textContent = "The local bookmark file is missing."
  cutoffEl.textContent = "In Terminal, run python3 build_offline.py from raindrop-website-app, then reload this file."
} else {
  state.bookmarks = library.bookmarks
  state.syncAfter = library.syncAfter || ""
  render()
  if (library.heroes != null) {
    statsEl.textContent = `${statsEl.textContent} · ${library.heroes} hero images saved on this Mac`
  }
}
