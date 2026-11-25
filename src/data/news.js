// =====================================================================
//  NOTIZIE VERE
//  Non sono più scritte qui: arrivano dal server intermediario
//  (cartella server/), che legge i feed RSS dei siti italiani.
//  Questo file contiene solo le funzioni per caricarle e filtrarle.
// =====================================================================
//
// Ogni notizia ricevuta dal server ha questi campi:
// - id:        identificativo unico
// - title:     titolo
// - excerpt:   riassunto (testo semplice)
// - link:      indirizzo dell'articolo originale
// - image:     URL dell'immagine, oppure null
// - date:      data di pubblicazione (formato ISO)
// - source:    nome del sito di origine
// - category:  sezione principale (es. "videogiochi")
// - sections:  tutte le sezioni in cui compare (es. ["videogiochi", "uscite"])
// - platforms: piattaforme citate (playstation, xbox, switch, pc)

// Scarica le notizie dal server. Con refresh=true chiede di ignorare la cache.
export async function fetchNews({ refresh = false, signal } = {}) {
  const res = await fetch(`/api/news${refresh ? '?refresh=1' : ''}`, { signal })
  if (!res.ok) throw new Error(`Il server ha risposto con errore ${res.status}`)
  return res.json() // { items, errors, updatedAt }
}

// Le piattaforme sono voci del menu ma non categorie: le riconosciamo così
const PLATFORM_IDS = ['playstation', 'xbox', 'switch', 'pc']

// Notizie di una sezione (voce del menu oppure piattaforma)
export function getNewsFor(items, sectionId) {
  if (sectionId === 'home') return items
  if (PLATFORM_IDS.includes(sectionId)) return items.filter((n) => n.platforms.includes(sectionId))
  return items.filter((n) => n.sections.includes(sectionId))
}

// Divide la lista in: una notizia in evidenza (la più recente con immagine) + le altre
export function splitFeatured(list) {
  const featured = list.find((n) => n.image) ?? list[0]
  return { featured, rest: list.filter((n) => n !== featured) }
}

// Una notizia è "nuova" se è stata pubblicata nelle ultime 24 ore
const DAY_MS = 24 * 60 * 60 * 1000
export function isNew(item) {
  return Date.now() - new Date(item.date).getTime() < DAY_MS
}

// Quante notizie nuove ha ogni piattaforma → { playstation: 3, xbox: 2, ... }
export function countNewByPlatform(items) {
  const counts = {}
  for (const n of items) {
    if (!isNew(n)) continue
    for (const p of n.platforms) counts[p] = (counts[p] ?? 0) + 1
  }
  return counts
}
