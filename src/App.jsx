import { useMemo, useState } from 'react'
import { LayoutGroup, MotionConfig } from 'framer-motion'
import Sidebar, { COLLAPSED } from './components/Sidebar.jsx'
import ContentPanel from './components/ContentPanel.jsx'
import useIsMobile, { MOBILE_QUERY } from './useIsMobile.js'
import useNews from './useNews.js'
import { countNewByPlatform } from './data/news.js'

export default function App() {
  const isMobile = useIsMobile()

  // Stato condiviso: la barra è aperta? quale sezione è selezionata?
  // Su schermi stretti la barra parte chiusa, altrimenti coprirebbe le notizie.
  const [expanded, setExpanded] = useState(() => !window.matchMedia(MOBILE_QUERY).matches)
  const [active, setActive] = useState('home')

  // Notizie vere, caricate dal server intermediario (vedi useNews.js)
  const news = useNews()
  // Numero di notizie nuove (ultime 24 ore) per piattaforma, ricalcolato solo quando arrivano notizie
  const newCounts = useMemo(() => countNewByPlatform(news.items), [news.items])

  // Scelta di una sezione: su mobile richiudiamo la barra per mostrare le notizie
  function select(id) {
    setActive(id)
    if (isMobile) setExpanded(false)
  }

  return (
    // MotionConfig reducedMotion="user": se nel sistema è attivo "riduci movimento",
    // Framer Motion salta gli spostamenti (restano solo le dissolvenze).
    <MotionConfig reducedMotion="user">
      {/* Sfondo scuro a tutta pagina */}
      <div className="relative h-full overflow-hidden bg-linear-to-br from-[#0d0826] via-[#090620] to-[#04030f] p-3 md:p-5">
        {/*
          Sfumature neon viola e azzurre sullo sfondo.
          Rendono visibile l'effetto vetro: la barra le sfoca quando ci passano dietro.
        */}
        <div className="pointer-events-none absolute -top-40 -left-32 size-[480px] rounded-full bg-neon-violet/45 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/2 left-20 size-[320px] rounded-full bg-neon-cyan/30 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-[360px] rounded-full bg-fuchsia-600/30 blur-[120px]" />
        <div className="pointer-events-none absolute -top-40 -right-40 size-[460px] rounded-full bg-neon-cyan/15 blur-[130px]" />

        {/* LayoutGroup: permette alla linguetta (layoutId) di spostarsi tra le due liste */}
        <LayoutGroup>
          <div className="relative flex h-full">
            {/*
              Su mobile la barra "galleggia" sopra il pannello (position absolute),
              così aprendola non schiaccia le notizie. Su desktop sta accanto.
            */}
            <div className={isMobile ? 'absolute inset-y-0 left-0 z-20' : 'contents'}>
              <Sidebar
                expanded={expanded}
                setExpanded={setExpanded}
                active={active}
                setActive={select}
                overlay={isMobile}
                newCounts={newCounts}
              />
            </div>
            <ContentPanel active={active} news={news} style={{ marginLeft: isMobile ? COLLAPSED : 0 }} />
          </div>
        </LayoutGroup>
      </div>
    </MotionConfig>
  )
}
