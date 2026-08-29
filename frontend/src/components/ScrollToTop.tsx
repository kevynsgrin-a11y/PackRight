import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Returns focus and scroll position to the top of the document on navigation.
 *
 * Moving the scrollbar alone was not enough: a keyboard user who followed a
 * footer link kept focus on <body>'s previous position, so the next Tab landed
 * on the link *after* the one they activated, in the old page's footer, rather
 * than in the new page's content. `main` already carries tabIndex={-1} for
 * exactly this.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  // The component mounts under hydrateRoot, so without this the first render
  // would steal focus on initial load and clobber a hash deep-link.
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    document.getElementById('main-content')?.focus({ preventScroll: true })
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])

  return null
}
