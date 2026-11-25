// =====================================================================
//  ELENCO DEI FEED RSS
//  Tutti verificati il 25/11/2026: rispondono e contengono notizie.
//  Per aggiungere un sito basta aggiungere una riga qui sotto.
// =====================================================================
//
// - source:   nome del sito, mostrato sulla card
// - url:      indirizzo del feed RSS (o Atom: il parser li legge entrambi)
// - category: sezione del menu a cui appartengono le sue notizie
//             (videogiochi, anime-manga, film-serie, fumetti, tech, recensioni)

export const FEEDS = [
  // ---- Videogiochi ----
  { source: 'Multiplayer.it', url: 'https://multiplayer.it/feed/rss/homepage/', category: 'videogiochi' },
  { source: 'IGN Italia', url: 'https://it.ign.com/feed.xml', category: 'videogiochi' },
  { source: 'Spaziogames', url: 'https://www.spaziogames.it/feed', category: 'videogiochi' },

  // ---- Recensioni (feed dedicato di Multiplayer.it) ----
  { source: 'Multiplayer.it', url: 'https://multiplayer.it/feed/rss/recensioni/', category: 'recensioni' },

  // ---- Anime e Manga ----
  { source: 'Everyeye Anime', url: 'https://anime.everyeye.it/feed_news_rss.asp', category: 'anime-manga' },
  { source: 'MangaForever', url: 'https://www.mangaforever.net/feed', category: 'anime-manga' },

  // ---- Film e Serie ----
  { source: 'Everyeye Cinema', url: 'https://cinema.everyeye.it/feed_news_rss.asp', category: 'film-serie' },
  { source: 'BadTaste', url: 'https://www.badtaste.it/feed/', category: 'film-serie' },

  // ---- Fumetti ----
  { source: 'Fumettologica', url: 'https://www.fumettologica.it/feed/', category: 'fumetti' },

  // ---- Tech ----
  { source: 'HDblog', url: 'https://www.hdblog.it/feed/', category: 'tech' },
  { source: "Tom's Hardware", url: 'https://www.tomshw.it/feed', category: 'tech' },
]

// ---------------------------------------------------------------------
//  Regole per assegnare sezioni extra in base al titolo
// ---------------------------------------------------------------------

// Una notizia che parla di "recensione" finisce anche in Recensioni
export const REVIEW_RE = /\brecension[ei]\b|\breview\b|\bprovato\b/i

// Una notizia che parla di date d'uscita finisce anche in "Uscite in arrivo"
export const RELEASE_RE =
  /data d[i']\s?uscita|\buscit[ae]\b|\busciranno\b|\buscirà\b|\besce il\b|\bin arrivo\b|\bdisponibile dal\b|\bdebutta\b/i

// Parole chiave per riconoscere le piattaforme citate nel titolo o nel riassunto
export const PLATFORM_RULES = {
  playstation: /playstation|\bps[45]\b|\bps plus\b|\bps vr ?2\b/i,
  xbox: /\bxbox\b|game pass/i,
  switch: /\bswitch\b|nintendo/i,
  pc: /\bpc\b|\bsteam\b|epic games/i,
}
