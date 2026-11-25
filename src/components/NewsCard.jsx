import { useState } from 'react'
import { motion } from 'framer-motion'
import { LuExternalLink } from 'react-icons/lu'
import { menuItems, platforms } from '../data/menu.js'

// Colori di ogni categoria: servono per il segnaposto dell'immagine e per l'etichetta
const categoryColors = {
  videogiochi: ['#a855f7', '#6366f1'],
  'anime-manga': ['#ec4899', '#a855f7'],
  'film-serie': ['#f59e0b', '#ef4444'],
  fumetti: ['#ef4444', '#f97316'],
  tech: ['#22d3ee', '#3b82f6'],
  recensioni: ['#facc15', '#f97316'],
  uscite: ['#10b981', '#22d3ee'],
}

// Dati di una categoria: nome leggibile, icona e colori
export function categoryInfo(id) {
  const item = menuItems.find((m) => m.id === id)
  return { label: item?.label ?? id, icon: item?.icon, colors: categoryColors[id] ?? ['#a855f7', '#22d3ee'] }
}

// Data "umana": "12 min fa", "3 ore fa", "ieri", oppure "18 nov"
const relative = new Intl.RelativeTimeFormat('it-IT', { numeric: 'auto' })
const shortDate = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' })
export function formatDate(iso) {
  const date = new Date(iso)
  const minutes = Math.round((Date.now() - date.getTime()) / 60000)
  if (minutes < 60) return relative.format(-Math.max(minutes, 1), 'minute')
  const hours = Math.round(minutes / 60)
  if (hours < 24) return relative.format(-hours, 'hour')
  if (hours < 48) return relative.format(-1, 'day') // "ieri"
  return shortDate.format(date)
}

// ---------------------------------------------------------------------
// Immagine della notizia. Mostra la foto del sito; se non c'è, o se non
// si carica, disegna un segnaposto: gradiente nei colori della categoria,
// una griglia "da sala giochi" e l'icona della categoria in grande.
// ---------------------------------------------------------------------
export function NewsImage({ item, className = '', iconSize = 'size-12' }) {
  const [broken, setBroken] = useState(false)
  const { icon: Icon, colors } = categoryInfo(item.category)

  if (item.image && !broken) {
    return (
      <img
        src={item.image}
        alt=""
        loading="lazy" // carica l'immagine solo quando sta per entrare nello schermo
        referrerPolicy="no-referrer" // alcuni siti bloccano le immagini richieste da altri siti
        onError={() => setBroken(true)} // immagine rotta → segnaposto
        className={`h-full w-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      style={{ background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]})` }}
      aria-hidden="true"
    >
      {/* Griglia di linee sottili sopra il gradiente */}
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.35) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
      <div className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
      {Icon && <Icon className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/80 ${iconSize}`} />}
    </div>
  )
}

// Riga "meta": categoria · sito di origine · data
export function NewsMeta({ item }) {
  const { label, colors } = categoryInfo(item.category)
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/60">
      <span className="font-display font-semibold tracking-wide" style={{ color: colors[0] }}>
        {label}
      </span>
      <span className="font-medium text-white/80">{item.source}</span>
      <time dateTime={item.date} title={new Date(item.date).toLocaleString('it-IT')}>
        {formatDate(item.date)}
      </time>
    </div>
  )
}

// Pallini delle piattaforme citate nella notizia
export function PlatformDots({ item }) {
  if (!item.platforms.length) return null
  return (
    <div className="flex items-center gap-1.5">
      {item.platforms.map((id) => {
        const p = platforms.find((x) => x.id === id)
        return <span key={id} title={p?.label} className="size-2 rounded-full" style={{ backgroundColor: p?.color }} />
      })}
    </div>
  )
}

// Link all'articolo originale, in una nuova scheda.
// "after:absolute after:inset-0" allarga l'area cliccabile a tutta la card.
// rel="noopener noreferrer": la nuova scheda non può controllare la nostra (sicurezza).
export function ArticleLink({ item, children }) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="outline-none after:absolute after:inset-0 after:rounded-[inherit] focus-visible:underline focus-visible:decoration-neon-cyan"
    >
      {children}
      <span className="sr-only"> (apre {item.source} in una nuova scheda)</span>
    </a>
  )
}

// ---------------------------------------------------------------------
// Card normale della griglia
// ---------------------------------------------------------------------
export default function NewsCard({ item, index }) {
  return (
    <motion.article
      // Entrata "a cascata": ogni card arriva un attimo dopo la precedente
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3) }}
      // relative: serve al link del titolo, che si allarga a tutta la card
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] transition-colors hover:border-neon-violet/50 hover:bg-white/[0.05]"
    >
      <div className="relative aspect-video overflow-hidden">
        <NewsImage item={item} className="transition-transform duration-300 group-hover:scale-[1.04]" />
        {/* Icona "link esterno" che compare al passaggio del mouse */}
        <span className="absolute top-3 right-3 rounded-lg bg-black/60 p-1.5 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
          <LuExternalLink className="size-3.5" />
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <NewsMeta item={item} />
        <h3 className="line-clamp-3 text-[17px] leading-snug font-semibold text-white">
          <ArticleLink item={item}>{item.title}</ArticleLink>
        </h3>
        {item.excerpt && <p className="line-clamp-2 text-sm leading-relaxed text-white/65">{item.excerpt}</p>}
        <div className="mt-auto pt-1">
          <PlatformDots item={item} />
        </div>
      </div>
    </motion.article>
  )
}
