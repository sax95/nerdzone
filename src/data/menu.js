// Dati della barra laterale, separati dalla grafica.
// Per aggiungere o rinominare una voce modifichi solo questo file.
import {
  LuHouse,
  LuGamepad2,
  LuSparkles,
  LuClapperboard,
  LuBookOpen,
  LuCpu,
  LuStar,
  LuCalendarClock,
} from 'react-icons/lu'

// Voci principali.
// - id: identificativo unico; per le categorie coincide con il campo "category" delle notizie
// - icon: componente icona di react-icons
// - description: frase mostrata sotto il titolo nel pannello dei contenuti
export const menuItems = [
  { id: 'home', label: 'Home', icon: LuHouse, description: 'Le ultime notizie da tutto il mondo nerd.' },
  { id: 'videogiochi', label: 'Videogiochi', icon: LuGamepad2, description: 'Annunci, aggiornamenti e retroscena.' },
  { id: 'anime-manga', label: 'Anime e Manga', icon: LuSparkles, description: 'Stagioni, adattamenti e nuovi volumi.' },
  { id: 'film-serie', label: 'Film e Serie', icon: LuClapperboard, description: 'Trailer, cast e date di uscita.' },
  { id: 'fumetti', label: 'Fumetti', icon: LuBookOpen, description: 'Albi, graphic novel e autori.' },
  { id: 'tech', label: 'Tech', icon: LuCpu, description: 'Hardware, gadget e tutto ciò che si collega.' },
  { id: 'recensioni', label: 'Recensioni', icon: LuStar, description: 'Le ultime recensioni dai siti italiani.' },
  { id: 'uscite', label: 'Uscite in arrivo', icon: LuCalendarClock, description: 'Date d’uscita, rinvii e novità in arrivo.' },
]

// Piattaforme: colore del pallino. Il numero di notizie nuove (ultime 24 ore)
// viene contato automaticamente dalle notizie vere (vedi countNewByPlatform in news.js).
export const platforms = [
  { id: 'playstation', label: 'PlayStation', color: '#3b82f6' },
  { id: 'xbox', label: 'Xbox', color: '#22c55e' },
  { id: 'switch', label: 'Switch', color: '#ef4444' },
  { id: 'pc', label: 'PC', color: '#f59e0b' },
]

// Utente mostrato in fondo alla barra
export const user = {
  name: 'Marco Bianchi',
  nickname: 'PixelMarco',
  level: 12,
  points: 740, // punti attuali
  nextLevelPoints: 1000, // punti per salire al livello successivo
}
