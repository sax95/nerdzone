import { AnimatePresence, motion } from 'framer-motion'
import ActiveTab from './ActiveTab.jsx'

// Scritta che compare/sparisce quando la barra si apre o si chiude
// (dissolvenza + leggero scorrimento verso sinistra).
export function FadeLabel({ show, children, className = '' }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <motion.span
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -8 }}
          transition={{ duration: 0.18 }}
          className={`whitespace-nowrap ${className}`}
        >
          {children}
        </motion.span>
      )}
    </AnimatePresence>
  )
}

// NavItem = una riga cliccabile della barra (voce del menu o piattaforma).
//
// La riga arriva fino al bordo destro della barra: così, quando è selezionata,
// la linguetta tocca il pannello dei contenuti e sembrano un unico pezzo.
export default function NavItem({
  label,
  icon: Icon, // icona (voci del menu)
  dotColor, // colore del pallino (piattaforme)
  count, // numero di notizie nuove (piattaforme)
  active, // è la voce selezionata?
  expanded, // la barra è aperta?
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      // A barra chiusa la scritta non c'è: title (al passaggio del mouse) e aria-label
      // (per gli screen reader) dicono comunque il nome della voce
      title={!expanded ? label : undefined}
      aria-label={!expanded ? label : undefined}
      aria-current={active ? 'page' : undefined}
      className={`relative flex h-10 w-full items-center gap-3 rounded-l-2xl pr-4 text-left text-[15px] font-medium transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-inset active:opacity-80 ${
        active ? 'text-white' : 'text-white/70 hover:bg-white/[0.06] hover:text-white'
      }`}
      // padding sinistro di 22px: con la barra chiusa (88px) l'icona risulta perfettamente centrata
      style={{ paddingLeft: 22 }}
    >
      {/* La linguetta viene disegnata solo dietro la voce attiva */}
      {active && <ActiveTab />}

      {/* z-10: il contenuto sta SOPRA la linguetta */}
      <span className="relative z-10 flex size-5 shrink-0 items-center justify-center">
        {/* Icona: diventa azzurro neon quando la voce è attiva */}
        {Icon && <Icon className={`size-5 transition-colors ${active ? 'text-neon-cyan' : ''}`} />}

        {/* Pallino colorato delle piattaforme, con un leggero alone */}
        {dotColor && (
          <span className="size-2.5 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 10px ${dotColor}` }} />
        )}

        {/* A barra chiusa il numero diventa un mini badge sopra il pallino */}
        <AnimatePresence>
          {count > 0 && !expanded && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-2 -right-2.5 flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-bold text-panel tabular-nums"
            >
              {count}
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {/* Etichetta testuale (solo a barra aperta) */}
      <FadeLabel show={expanded} className="relative z-10 flex-1">
        {label}
      </FadeLabel>

      {/* Numero di notizie nuove a destra, a barra aperta */}
      {count > 0 && (
        <FadeLabel
          show={expanded}
          className={`relative z-10 rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
            active ? 'bg-neon-cyan/15 text-neon-cyan' : 'bg-white/10 text-white/80'
          }`}
        >
          {count} nuove
        </FadeLabel>
      )}
    </button>
  )
}
