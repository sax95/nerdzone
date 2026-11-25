import { useEffect, useState } from 'react'

// Piccolo "hook" che ci dice se lo schermo è stretto (sotto i 768px, come "md" di Tailwind).
// Si aggiorna da solo quando ridimensioni la finestra.
export const MOBILE_QUERY = '(max-width: 767px)'

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia(MOBILE_QUERY).matches)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY)
    const onChange = () => setIsMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  return isMobile
}
