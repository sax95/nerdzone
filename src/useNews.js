import { useCallback, useEffect, useState } from 'react'
import { fetchNews } from './data/news.js'

// "Hook" che carica le notizie dal server e tiene traccia dello stato:
// - status: 'loading' (sto caricando), 'ready' (fatto), 'error' (il server non risponde)
// - items:  le notizie
// - failedSources: siti che questa volta non hanno risposto (gli altri si vedono comunque)
// - reload(): riprova a caricare, saltando la cache del server
export default function useNews() {
  const [status, setStatus] = useState('loading')
  const [items, setItems] = useState([])
  const [failedSources, setFailedSources] = useState([])
  const [error, setError] = useState(null)

  const load = useCallback(async ({ refresh = false, signal } = {}) => {
    setStatus('loading')
    setError(null)
    try {
      const data = await fetchNews({ refresh, signal })
      setItems(data.items)
      setFailedSources(data.errors.map((e) => e.source))
      // Se nessun sito ha risposto, è un errore anche se il server è acceso
      setStatus(data.items.length ? 'ready' : 'error')
      if (!data.items.length) setError('Nessun sito ha risposto in questo momento.')
    } catch (err) {
      if (err.name === 'AbortError') return // il componente è stato chiuso: ignoriamo
      setError(err.message)
      setStatus('error')
    }
  }, [])

  // Primo caricamento all'apertura del sito.
  // AbortController annulla la richiesta se il componente viene smontato.
  useEffect(() => {
    const ctrl = new AbortController()
    load({ signal: ctrl.signal })
    return () => ctrl.abort()
  }, [load])

  return { status, items, failedSources, error, reload: () => load({ refresh: true }) }
}
