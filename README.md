# NerdZone

Un aggregatore di notizie nerd in italiano: videogiochi, anime e manga, film e serie, fumetti e tech, raccolti in un'unica pagina dai feed RSS dei principali siti italiani.

L'interfaccia ha una barra laterale in stile "vetro" con colori neon. La barra si apre e si chiude, e la voce selezionata si collega al pannello delle notizie con una linguetta animata.

## Cosa fa

- **Notizie aggiornate** da 11 feed RSS italiani (Multiplayer.it, IGN Italia, Spaziogames, Everyeye, MangaForever, BadTaste, Fumettologica, HDblog, Tom's Hardware).
- **Sezioni**: Home, Videogiochi, Anime e Manga, Film e Serie, Fumetti, Tech, Recensioni, Uscite in arrivo.
  Le notizie finiscono anche in *Recensioni* o *Uscite in arrivo* se il titolo parla di recensioni o di date d'uscita.
- **Filtro per piattaforma** (PlayStation, Xbox, Switch, PC), con il numero di notizie uscite nelle ultime 24 ore.
- **Notizia in evidenza** in alto e griglia di card con il pulsante "Mostra altre".
- **Immagini di riserva**: se un articolo non ha immagine, la card mostra un segnaposto nei colori della sua categoria.
- **Gestione degli errori**: se un sito non risponde, le altre notizie restano visibili e compare un avviso. Se il server è spento, la pagina mostra un messaggio con il pulsante "Riprova".
- **Pulsante aggiorna** che scarica di nuovo i feed, senza usare la cache.
- **Responsive**: su mobile la barra parte chiusa e, quando si apre, si sovrappone alle notizie invece di schiacciarle.
- **Accessibile**: navigazione da tastiera, etichette per gli screen reader e rispetto dell'impostazione "riduci movimento" del sistema.

Il profilo utente (livello e punti) e il riquadro "Diventa Premium" sono per ora solo grafica, con dati di esempio.

## Tecnologie

| Parte | Strumenti |
| --- | --- |
| Sito | React 19, Vite, Tailwind CSS 4, Framer Motion, react-icons |
| Server delle notizie | Node.js, Express, rss-parser |
| Font | Chakra Petch (titoli), Instrument Sans (testo) |

## Come avviarlo

Serve [Node.js](https://nodejs.org/) (versione 20 o successiva).

```bash
git clone https://github.com/sax95/nerdzone.git
cd nerdzone
npm install
npm run dev
```

`npm run dev` avvia insieme due programmi:

- il **sito** su http://localhost:5173 (se la porta è occupata, Vite usa la successiva libera e la scrive nel terminale);
- il **server delle notizie** su http://localhost:3001/api/news.

## Come funziona

Il browser non può leggere direttamente i feed RSS di altri siti, perché lo blocca la regola CORS. Per questo c'è un piccolo server intermedio:

```
Siti italiani (RSS) ──► server/ (Express, porta 3001) ──► /api/news (JSON) ──► sito React
```

1. Il server scarica tutti i feed insieme. Un feed che non risponde entro 8 secondi viene saltato, e gli altri vanno avanti.
2. Ogni articolo viene convertito in un formato unico: titolo, riassunto, immagine, data, fonte, sezioni e piattaforme citate. Gli articoli doppi vengono scartati.
3. Il risultato resta in memoria per 10 minuti. Con `/api/news?refresh=1` il server ignora la cache e riscarica tutto.
4. Durante lo sviluppo Vite gira le richieste `/api/...` al server sulla porta 3001 (vedi `vite.config.js`).

## Struttura del progetto

```
server/
  index.js          server Express: scarica, converte e mette in cache le notizie
  feeds.js          elenco dei feed e regole per sezioni e piattaforme
src/
  App.jsx           layout generale e stato condiviso
  useNews.js        carica le notizie e gestisce caricamento ed errori
  useIsMobile.js    capisce se lo schermo è stretto
  data/menu.js      voci del menu, piattaforme e utente di esempio
  data/news.js      richiesta al server e filtri per sezione
  components/
    Sidebar.jsx       barra laterale (logo, menu, Premium, profilo)
    NavItem.jsx       singola voce della barra
    ActiveTab.jsx     linguetta animata della voce selezionata
    ContentPanel.jsx  pannello delle notizie con caricamento, errori e "Mostra altre"
    NewsCard.jsx      card della notizia, immagine e data relativa
```

## Personalizzare

- **Aggiungere un sito**: aggiungi una riga in `server/feeds.js` con `source`, `url` del feed e `category`.
- **Cambiare le voci del menu**: modifica `src/data/menu.js`.
- **Cambiare le regole di "Recensioni", "Uscite" e delle piattaforme**: modifica le espressioni regolari in `server/feeds.js`.

## Script disponibili

| Comando | Cosa fa |
| --- | --- |
| `npm run dev` | avvia sito e server delle notizie insieme |
| `npm run dev:client` | avvia solo il sito |
| `npm run dev:server` | avvia solo il server delle notizie |
| `npm run build` | crea la versione ottimizzata del sito nella cartella `dist/` |
| `npm run preview` | mostra in locale la versione creata con `build` |

La build contiene solo il sito. Per vedere le notizie deve girare anche il server delle notizie (`npm run dev:server`).
