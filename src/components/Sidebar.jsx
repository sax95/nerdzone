import { AnimatePresence, motion } from 'framer-motion'
import { LuChevronLeft, LuCrown } from 'react-icons/lu'
import NavItem, { FadeLabel } from './NavItem.jsx'
import { menuItems, platforms, user } from '../data/menu.js'

// Larghezze della barra (in pixel) da chiusa e da aperta
export const COLLAPSED = 88
const EXPANDED = 288

// Molla usata per l'apertura/chiusura: veloce ma morbida
const spring = { type: 'spring', stiffness: 260, damping: 30 }

// Anello di focus (tasto Tab) comune ai pulsanti della barra
const focusRing = 'outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan'

// Titoletto di sezione ("Sezioni", "Piattaforme").
// A barra chiusa diventa una lineetta. Altezza fissa (h-8): lascia lo spazio
// per l'angolo arrotondato che sporge sopra la linguetta.
function SectionTitle({ expanded, children }) {
  return (
    <div className="flex h-8 items-center pl-[22px]">
      {expanded ? (
        <FadeLabel show className="font-display text-xs font-semibold tracking-wider text-white/55">
          {children}
        </FadeLabel>
      ) : (
        <span className="h-px w-5 bg-white/20" />
      )}
    </div>
  )
}

// newCounts: numero di notizie nuove per piattaforma, calcolato in App dalle notizie vere
export default function Sidebar({ expanded, setExpanded, active, setActive, overlay = false, newCounts = {} }) {
  // Percentuale della barra dei punti
  const progress = Math.round((user.points / user.nextLevelPoints) * 100)

  // Su mobile la barra aperta copre il pannello scuro: il vetro diventerebbe quasi
  // invisibile, quindi usiamo un viola notte quasi pieno.
  const surface = overlay && expanded ? 'bg-[#1a1240]/95' : 'bg-white/[0.06]'

  return (
    // Contenitore "relative" per posizionare il pulsante apri/chiudi sul bordo
    <div className="relative z-10 h-full shrink-0">
      {/*
        La barra vera e propria. Framer Motion anima la larghezza.
        Effetto vetro: sfondo bianco molto trasparente + backdrop-blur (sfoca ciò che c'è dietro)
        + bordo sottile chiaro. Nessun bordo a destra: lì si attacca il pannello dei contenuti.
      */}
      <motion.aside
        initial={false}
        animate={{ width: expanded ? EXPANDED : COLLAPSED }}
        transition={spring}
        className={`flex h-full flex-col overflow-hidden rounded-l-[28px] border border-r-0 border-white/12 shadow-[inset_1px_1px_0_rgba(255,255,255,0.1)] backdrop-blur-2xl transition-colors duration-200 ${surface}`}
      >
        {/* ================= LOGO ================= */}
        <div className="px-6 pt-6 pb-3">
          <div className="flex h-10 items-center gap-3">
            {/* Logo: quadrato con gradiente neon e iniziali */}
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-neon-violet to-neon-cyan font-display text-sm font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.45)]">
              NZ
            </div>
            <FadeLabel show={expanded} className="font-display text-xl font-bold tracking-wide text-white">
              Nerd<span className="text-neon-cyan">Zone</span>
            </FadeLabel>
          </div>
        </div>

        {/* ================= MENU E PIATTAFORME (scorrevole) ================= */}
        {/* pl-3: margine a sinistra; a destra niente margine, così la linguetta tocca il bordo */}
        <nav aria-label="Sezioni del sito" className="no-scrollbar flex-1 overflow-x-hidden overflow-y-auto pb-6 pl-3">
          <SectionTitle expanded={expanded}>Sezioni</SectionTitle>
          <ul className="space-y-0.5">
            {menuItems.map((item) => (
              <li key={item.id}>
                <NavItem
                  label={item.label}
                  icon={item.icon}
                  expanded={expanded}
                  active={active === item.id}
                  onClick={() => setActive(item.id)}
                />
              </li>
            ))}
          </ul>

          <div className="mt-4">
            <SectionTitle expanded={expanded}>Piattaforme</SectionTitle>
          </div>
          <ul className="space-y-0.5">
            {platforms.map((p) => (
              <li key={p.id}>
                <NavItem
                  label={p.label}
                  dotColor={p.color}
                  count={newCounts[p.id] ?? 0}
                  expanded={expanded}
                  active={active === p.id}
                  onClick={() => setActive(p.id)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* ================= PREMIUM + PROFILO ================= */}
        <div className="space-y-3 px-6 pt-2 pb-6">
          <AnimatePresence mode="wait" initial={false}>
            {expanded ? (
              // Riquadro "Diventa Premium" (barra aperta)
              <motion.div
                key="premium-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
                className="relative w-[240px] overflow-hidden rounded-2xl border border-white/12 bg-white/[0.05] p-4"
              >
                {/* Aloni neon decorativi agli angoli */}
                <div className="pointer-events-none absolute -top-10 -right-8 size-28 rounded-full bg-neon-violet/40 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-8 size-24 rounded-full bg-neon-cyan/25 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 font-display text-sm font-semibold text-white">
                    <LuCrown className="size-4 text-amber-300" />
                    Diventa Premium
                  </div>
                  <p className="mt-1 text-[13px] leading-snug text-white/70">
                    Niente pubblicità, anteprime in esclusiva e punti doppi.
                  </p>
                  <button
                    type="button"
                    className="mt-3 h-10 w-full rounded-xl bg-linear-to-r from-neon-violet to-neon-cyan text-sm font-semibold text-white shadow-[0_0_18px_rgba(168,85,247,0.4)] transition hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none active:scale-[0.98]"
                  >
                    Scopri Premium
                  </button>
                </div>
              </motion.div>
            ) : (
              // Solo icona (barra chiusa): cliccandola si apre la barra
              <motion.button
                key="premium-icon"
                type="button"
                title="Diventa Premium"
                aria-label="Diventa Premium"
                onClick={() => setExpanded(true)}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className={`flex size-10 items-center justify-center rounded-xl border border-white/12 bg-neon-violet/20 text-amber-300 ${focusRing}`}
              >
                <LuCrown className="size-4" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Profilo utente */}
          <div className="flex items-center gap-3 border-t border-white/10 pt-4">
            {/* Avatar con iniziali + numero del livello in un piccolo badge */}
            <div className="relative size-10 shrink-0" title={!expanded ? `${user.nickname} · Livello ${user.level}` : undefined}>
              <div className="flex size-10 items-center justify-center rounded-full bg-linear-to-br from-fuchsia-500 to-orange-400 text-sm font-semibold text-white">
                {user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <span className="absolute -right-1 -bottom-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#1a1240] bg-neon-cyan px-0.5 font-display text-[9px] font-bold text-panel">
                {user.level}
              </span>
            </div>

            {/* Nome, livello e barra dei punti (solo barra aperta) */}
            <FadeLabel show={expanded} className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-semibold text-white">{user.nickname}</span>
                <span className="shrink-0 font-display text-xs font-semibold text-neon-cyan">Lv. {user.level}</span>
              </span>
              {/* Barra dei punti: la parte piena è larga quanto la percentuale raggiunta */}
              <span
                className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-white/10"
                role="progressbar"
                aria-label="Punti verso il livello successivo"
                aria-valuenow={user.points}
                aria-valuemin={0}
                aria-valuemax={user.nextLevelPoints}
              >
                <motion.span
                  className="block h-full rounded-full bg-linear-to-r from-neon-violet to-neon-cyan"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
              </span>
              <span className="mt-1 block text-[11px] text-white/55 tabular-nums">
                {user.points} / {user.nextLevelPoints} punti
              </span>
            </FadeLabel>
          </div>
        </div>
      </motion.aside>

      {/*
        Pulsante apri/chiudi, a cavallo tra la barra e il pannello.
        Il disegno è di 32px, ma lo pseudo-elemento "before" allarga l'area cliccabile a 48px.
      */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-label={expanded ? 'Chiudi barra laterale' : 'Apri barra laterale'}
        aria-expanded={expanded}
        className="absolute top-8 -right-4 z-20 flex size-8 items-center justify-center rounded-full bg-linear-to-br from-neon-violet to-neon-cyan text-white shadow-[0_0_14px_rgba(168,85,247,0.6)] ring-4 ring-panel transition outline-none before:absolute before:-inset-2 before:content-[''] hover:brightness-110 focus-visible:ring-white active:scale-95"
      >
        {/* La freccia ruota di 180° quando la barra è chiusa */}
        <motion.span animate={{ rotate: expanded ? 0 : 180 }} transition={spring} className="block">
          <LuChevronLeft className="size-4" />
        </motion.span>
      </button>
    </div>
  )
}
