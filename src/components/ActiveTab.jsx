import { motion } from 'framer-motion'

// Raggio degli angoli "al contrario" (in pixel)
const R = 20

// Colore della linguetta: è lo STESSO del pannello dei contenuti (definito in index.css),
// così la linguetta e il pannello sembrano un unico pezzo.
const PANEL = 'var(--color-panel)'

// ActiveTab è la linguetta che sta dietro la voce selezionata.
//
// Il trucco dell'animazione: tutte le linguette hanno lo stesso layoutId ("active-tab").
// Quando la voce selezionata cambia, Framer Motion capisce che è "la stessa" linguetta
// che si è spostata e la fa scorrere dalla vecchia posizione alla nuova.
export default function ActiveTab() {
  return (
    <motion.div
      layoutId="active-tab"
      className="absolute inset-0"
      // Il border-radius va nello "style" così Framer Motion lo mantiene corretto
      // anche mentre la linguetta si deforma durante lo spostamento.
      style={{ background: PANEL, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 }}
      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
    >
      {/* Trattino neon sul lato sinistro: il "segno" della voce attiva */}
      <span className="absolute top-1/2 left-0 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-linear-to-b from-neon-violet to-neon-cyan shadow-[0_0_12px_rgba(34,211,238,0.8)]" />

      {/*
        Angolo arrotondato "al contrario" SOPRA la linguetta.
        È un quadratino attaccato al bordo destro: con un gradiente radiale "scaviamo"
        un cerchio trasparente partendo dall'angolo in alto a sinistra. Resta colorata
        solo la parte in basso a destra → una curva concava che raccorda la linguetta al pannello.
      */}
      <span
        className="pointer-events-none absolute right-0 bottom-full"
        style={{
          width: R,
          height: R,
          background: `radial-gradient(circle at 0 0, transparent ${R}px, ${PANEL} ${R + 0.5}px)`,
        }}
      />
      {/* Stesso trucco SOTTO la linguetta, con il cerchio centrato in basso a sinistra */}
      <span
        className="pointer-events-none absolute right-0 top-full"
        style={{
          width: R,
          height: R,
          background: `radial-gradient(circle at 0 100%, transparent ${R}px, ${PANEL} ${R + 0.5}px)`,
        }}
      />
    </motion.div>
  )
}
