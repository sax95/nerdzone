import { useState } from 'react'
import { motion } from 'framer-motion'
import { LuFlame, LuRefreshCw, LuWifiOff, LuTriangleAlert, LuX } from 'react-icons/lu'
import NewsCard, { ArticleLink, NewsImage, NewsMeta, PlatformDots } from './NewsCard.jsx'
import { menuItems, platforms } from '../data/menu.js'
import { getNewsFor, splitFeatured } from '../data/news.js'

// Quante card mostrare alla volta (poi c'è il pulsante "Mostra altre")
const PAGE = 24

// Titolo e descrizione della sezione scelta (voce del menu oppure piattaforma)
function sectionInfo(id) {
  const item = menuItems.find((m) => m.id === id)
  if (item) return { title: item.label, description: item.description }
  const p = platforms.find((x) => x.id === id)
  return { title: p?.label ?? '', description: `Le notizie che citano ${p?.label}.`, color: p?.color }
}

// ---------------------------------------------------------------------
// Notizia in evidenza: più grande, con immagine e testo affiancati su desktop
// ---------------------------------------------------------------------
function FeaturedNews({ item }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative grid overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition-colors hover:border-neon-violet/50 lg:grid-cols-5"
    >
      {/* Immagine: su desktop occupa 3 colonne su 5 */}
      <div className="relative aspect-video overflow-hidden lg:col-span-3 lg:aspect-auto lg:min-h-80">
        <NewsImage item={item} iconSize="size-20" className="transition-transform duration-500 group-hover:scale-[1.03]" />
        <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 font-display text-xs font-semibold tracking-wide text-white backdrop-blur">
          <LuFlame className="size-3.5 text-orange-400" />
          In evidenza
        </span>
      </div>

      <div className="flex flex-col justify-center gap-4 p-6 lg:col-span-2 lg:p-8">
        <NewsMeta item={item} />
        <h2 className="font-display text-2xl leading-tight font-bold text-white md:text-3xl">
          <ArticleLink item={item}>{item.title}</ArticleLink>
        </h2>
        {item.excerpt && <p className="line-clamp-4 leading-relaxed text-white/70">{item.excerpt}</p>}
        <PlatformDots item={item} />
      </div>
    </motion.article>
  )
}

// ---------------------------------------------------------------------
// Animazione di caricamento: "scheletri" grigi a forma di card che pulsano,
// con una luce che li attraversa (shimmer), finché le notizie non arrivano.
// ---------------------------------------------------------------------
function Shimmer({ className }) {
  return (
    <div className={`relative overflow-hidden bg-white/[0.06] ${className}`}>
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-transparent via-white/10 to-transparent"
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 1.3, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

function LoadingState() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Caricamento delle notizie…</span>
      {/* Scheletro della notizia in evidenza */}
      <div className="grid overflow-hidden rounded-3xl border border-white/8 lg:grid-cols-5">
        <Shimmer className="aspect-video lg:col-span-3 lg:aspect-auto lg:min-h-80" />
        <div className="space-y-4 p-6 lg:col-span-2 lg:p-8">
          <Shimmer className="h-3 w-1/2 rounded-full" />
          <Shimmer className="h-7 w-full rounded-lg" />
          <Shimmer className="h-7 w-4/5 rounded-lg" />
          <Shimmer className="h-3 w-full rounded-full" />
          <Shimmer className="h-3 w-2/3 rounded-full" />
        </div>
      </div>
      {/* Scheletri delle card */}
      <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-white/8">
            <Shimmer className="aspect-video" />
            <div className="space-y-3 p-4">
              <Shimmer className="h-3 w-1/2 rounded-full" />
              <Shimmer className="h-4 w-full rounded-md" />
              <Shimmer className="h-4 w-3/4 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Errore: il server delle notizie non risponde (o nessun sito ha risposto)
// ---------------------------------------------------------------------
function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-3xl border border-rose-400/30 bg-rose-500/[0.07] px-6 py-14 text-center">
      <LuWifiOff className="mx-auto size-10 text-rose-300" />
      <h2 className="mt-4 font-display text-xl font-bold text-white">Le notizie non arrivano</h2>
      <p className="mx-auto mt-2 max-w-md text-white/70">
        Il server delle notizie non risponde. Controlla che sia acceso (lo avvia <code className="text-neon-cyan">npm run dev</code>)
        e riprova.
      </p>
      {error && <p className="mt-2 text-xs text-white/45">Dettaglio: {error}</p>}
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex h-11 items-center gap-2 rounded-xl bg-linear-to-r from-neon-violet to-neon-cyan px-5 text-sm font-semibold text-white transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-[0.98]"
      >
        <LuRefreshCw className="size-4" />
        Riprova
      </button>
    </div>
  )
}

// Avviso piccolo quando ALCUNI siti non hanno risposto (gli altri si vedono)
function PartialWarning({ sources }) {
  const [closed, setClosed] = useState(false)
  if (!sources.length || closed) return null
  return (
    <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-300/30 bg-amber-400/[0.08] px-4 py-3 text-sm text-amber-100">
      <LuTriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-300" />
      <p className="flex-1">
        Questi siti non hanno risposto e mancano dall’elenco: <strong>{sources.join(', ')}</strong>.
      </p>
      <button type="button" onClick={() => setClosed(true)} aria-label="Chiudi avviso" className="text-amber-200/70 hover:text-white">
        <LuX className="size-4" />
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------
// Elenco delle notizie di una sezione, con "Mostra altre".
// Ha la sua "key" per sezione, così il conteggio riparte da capo quando cambi voce.
// ---------------------------------------------------------------------
function NewsList({ list }) {
  const [visible, setVisible] = useState(PAGE)
  const { featured, rest } = splitFeatured(list)
  const shown = rest.slice(0, visible)

  return (
    <>
      <FeaturedNews item={featured} />
      {shown.length > 0 && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((item, i) => (
            // index "relativo alla pagina": le nuove card fanno la cascata anche dopo "Mostra altre"
            <NewsCard key={item.id} item={item} index={i % PAGE} />
          ))}
        </div>
      )}
      {visible < rest.length && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE)}
            className="h-11 rounded-xl border border-white/15 bg-white/[0.05] px-6 text-sm font-semibold text-white transition hover:border-neon-violet/60 hover:bg-white/[0.08] focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:outline-none active:scale-[0.98]"
          >
            Mostra altre ({rest.length - visible})
          </button>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------
// Pannello dei contenuti (a destra). Il bordo sinistro è dritto perché
// è lì che si aggancia la linguetta della voce selezionata.
// ---------------------------------------------------------------------
export default function ContentPanel({ active, news, style }) {
  const { title, description, color } = sectionInfo(active)
  const { status, items, failedSources, error, reload } = news
  const list = getNewsFor(items, active)

  return (
    <main
      style={style}
      className="thin-scrollbar h-full min-w-0 flex-1 overflow-y-auto rounded-r-[28px] bg-panel py-7 pr-5 pl-9 md:px-10 md:py-9"
    >
      <div className="mx-auto max-w-6xl">
        {/* Intestazione della sezione */}
        <header className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-3 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              {/* Per le piattaforme ripetiamo il pallino colorato accanto al titolo */}
              {color && <span className="size-3 rounded-full" style={{ backgroundColor: color, boxShadow: `0 0 14px ${color}` }} />}
              {title}
            </h1>
            <p className="mt-1.5 text-white/65">{description}</p>
          </div>

          <div className="flex items-center gap-3 text-sm text-white/55">
            {status === 'ready' && (
              <span className="tabular-nums">
                {list.length} {list.length === 1 ? 'notizia' : 'notizie'}
              </span>
            )}
            {/* Pulsante aggiorna: l'icona gira mentre carica */}
            <button
              type="button"
              onClick={reload}
              disabled={status === 'loading'}
              aria-label="Aggiorna le notizie"
              title="Aggiorna le notizie"
              className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-white/70 transition hover:border-neon-cyan/50 hover:text-white focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:outline-none disabled:cursor-wait"
            >
              <LuRefreshCw className={`size-4 ${status === 'loading' ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {status === 'ready' && <PartialWarning sources={failedSources} />}

        {/*
          Il contenuto entra con una dissolvenza quando cambia stato (caricamento → errore o notizie)
          o sezione. La "key" fa ricreare il blocco a ogni cambio; non aspettiamo un'animazione
          d'uscita, così le notizie compaiono appena arrivano.
        */}
        <motion.div
          key={`${status}-${active}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
            {status === 'loading' && <LoadingState />}
            {status === 'error' && <ErrorState error={error} onRetry={reload} />}
            {status === 'ready' &&
              (list.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-white/15 px-6 py-16 text-center text-white/60">
                  Al momento non ci sono notizie per questa sezione.
                </div>
              ) : (
                <NewsList key={active} list={list} />
              ))}
        </motion.div>
      </div>
    </main>
  )
}
