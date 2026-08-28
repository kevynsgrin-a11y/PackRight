import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Returns focus and scroll position to the top of the document on navigation. */
export default function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}
