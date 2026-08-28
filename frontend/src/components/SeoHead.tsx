import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { OG_IMAGE, SITE_NAME, SITE_URL, resolvePageMeta } from '../lib/seo'

const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
  let el = document.head.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

/**
 * Keeps the document head in step with client-side navigation.
 *
 * The prerendered HTML already carries the correct head for a page's first load;
 * this only has to update it when the router moves between routes without a
 * document request.
 */
export default function SeoHead() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = resolvePageMeta(pathname)
    const canonical = `${SITE_URL}${meta.path}`

    document.title = meta.title
    setMeta('meta[name="description"]', 'name', 'description', meta.description)
    setMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      meta.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large',
    )
    setMeta('meta[property="og:title"]', 'property', 'og:title', meta.title)
    setMeta('meta[property="og:description"]', 'property', 'og:description', meta.description)
    setMeta('meta[property="og:url"]', 'property', 'og:url', canonical)
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME)
    setMeta('meta[property="og:image"]', 'property', 'og:image', OG_IMAGE)
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title)
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description)

    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
    if (!link) {
      link = document.createElement('link')
      link.rel = 'canonical'
      document.head.appendChild(link)
    }
    link.href = canonical

    // Replace any prerendered JSON-LD so a client-side route change does not
    // leave the previous page's structured data behind.
    document.head
      .querySelectorAll('script[type="application/ld+json"][data-packright]')
      .forEach((node) => node.remove())
    for (const block of meta.jsonLd ?? []) {
      const script = document.createElement('script')
      script.type = 'application/ld+json'
      script.dataset.packright = 'true'
      script.textContent = JSON.stringify(block)
      document.head.appendChild(script)
    }
  }, [pathname])

  return null
}
