// =====================================================================
//  SERVER INTERMEDIARIO DELLE NOTIZIE
//
//  Il browser non può leggere direttamente i feed degli altri siti
//  (blocco CORS). Questo piccolo server lo fa al posto suo:
//    1. scarica i feed RSS elencati in feeds.js
//    2. li converte in un unico elenco JSON, già diviso per sezioni
//    3. lo espone su  http://localhost:3001/api/news
//  Il sito (Vite) gira la richiesta /api/news a questo server: vedi vite.config.js
// =====================================================================

import express from 'express'
import Parser from 'rss-parser'
import { createHash } from 'node:crypto'
import { FEEDS, REVIEW_RE, RELEASE_RE, PLATFORM_RULES } from './feeds.js'

const PORT = 3001
const CACHE_MS = 10 * 60 * 1000 // teniamo le notizie in memoria per 10 minuti
const TIMEOUT_MS = 8000 // un feed che non risponde entro 8 secondi viene saltato

// Il parser RSS. Gli diciamo di leggere anche i campi delle immagini
// che non fanno parte dello standard RSS di base (media:content, media:thumbnail).
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
})

// ---------------------------------------------------------------------
//  Funzioni di aiuto
// ---------------------------------------------------------------------

// Trova l'immagine della notizia provando, in ordine, i posti dove i siti la mettono
function findImage(item) {
  if (item.enclosure?.url && /image/.test(item.enclosure.type ?? 'image')) return item.enclosure.url
  const media = item.mediaContent?.find((m) => m?.$?.url)
  if (media) return media.$.url
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url
  // Ultima possibilità: il primo <img> dentro il testo HTML dell'articolo
  const html = item.contentEncoded || item.content || item.summary || ''
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  return match?.[1] ?? null
}

// Toglie i tag HTML e accorcia il testo per il riassunto
function makeExcerpt(item) {
  const raw = item.contentSnippet || item.summary || item.content || ''
  const text = raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return text.length > 220 ? `${text.slice(0, 217).trimEnd()}…` : text
}

// Decide in quali sezioni del menu va la notizia
function findSections(feed, title) {
  const sections = new Set([feed.category])
  if (REVIEW_RE.test(title)) sections.add('recensioni')
  if (RELEASE_RE.test(title)) sections.add('uscite')
  return [...sections]
}

// Trova le piattaforme citate (PlayStation, Xbox, Switch, PC)
function findPlatforms(text) {
  return Object.entries(PLATFORM_RULES)
    .filter(([, re]) => re.test(text))
    .map(([id]) => id)
}

// Converte una notizia del feed nel formato che usa il sito
function normalize(feed, item) {
  const title = (item.title ?? '').trim()
  const excerpt = makeExcerpt(item)
  const date = new Date(item.isoDate || item.pubDate || Date.now())
  return {
    id: createHash('md5').update(item.link ?? title).digest('hex').slice(0, 12),
    title,
    excerpt,
    link: item.link,
    image: findImage(item),
    date: Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString(),
    source: feed.source,
    category: feed.category, // sezione principale
    sections: findSections(feed, title), // tutte le sezioni in cui compare
    platforms: findPlatforms(`${title} ${excerpt}`),
  }
}

// Scarica e legge un singolo feed (con limite di tempo)
async function loadFeed(feed) {
  const res = await fetch(feed.url, {
    headers: { 'User-Agent': 'NerdZone RSS reader' },
    signal: AbortSignal.timeout(TIMEOUT_MS),
  })
  if (!res.ok) throw new Error(`risposta HTTP ${res.status}`)
  const parsed = await parser.parseString(await res.text())
  return parsed.items.filter((i) => i.link && i.title).map((i) => normalize(feed, i))
}

// ---------------------------------------------------------------------
//  Scarica tutti i feed insieme, con una piccola "memoria" (cache)
// ---------------------------------------------------------------------
let cache = null // { data, time }

async function loadAll() {
  // Promise.allSettled: se un feed fallisce, gli altri vanno avanti lo stesso
  const results = await Promise.allSettled(FEEDS.map(loadFeed))

  const items = []
  const errors = []
  const seen = new Set() // per non mostrare due volte lo stesso articolo

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      const reason = r.reason?.name === 'TimeoutError' ? 'non ha risposto in tempo' : r.reason?.message
      errors.push({ source: FEEDS[i].source, message: reason })
      console.warn(`⚠ ${FEEDS[i].source}: ${reason}`)
      return
    }
    for (const item of r.value) {
      if (seen.has(item.link)) continue
      seen.add(item.link)
      items.push(item)
    }
  })

  // Dalla più recente alla più vecchia
  items.sort((a, b) => b.date.localeCompare(a.date))

  return { items, errors, updatedAt: new Date().toISOString() }
}

// ---------------------------------------------------------------------
//  Il server Express
// ---------------------------------------------------------------------
const app = express()

// GET /api/news  → tutte le notizie. Aggiungi ?refresh=1 per ignorare la cache.
app.get('/api/news', async (req, res) => {
  try {
    const fresh = cache && Date.now() - cache.time < CACHE_MS
    if (!fresh || req.query.refresh) {
      cache = { data: await loadAll(), time: Date.now() }
    }
    res.json(cache.data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Errore interno nel leggere i feed' })
  }
})

app.listen(PORT, () => {
  console.log(`📰 Server delle notizie attivo su http://localhost:${PORT}/api/news`)
})
