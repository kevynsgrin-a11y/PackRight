import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import App from './App'
import { NOT_FOUND_META, SITE_URL, allPageMeta, renderHeadTags, resolvePageMeta } from './lib/seo'
import type { PageMeta } from './lib/seo'

export interface RenderResult {
  html: string
  head: string
}

/** Renders one route to static HTML for the build-time prerenderer. */
export function render(url: string): RenderResult {
  const html = renderToString(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
  )
  return { html, head: renderHeadTags(resolvePageMeta(url)) }
}

/** Every canonical route, for the prerenderer and the sitemap. */
export function routes(): PageMeta[] {
  return allPageMeta()
}

export const notFoundMeta: PageMeta = NOT_FOUND_META
export const siteUrl: string = SITE_URL
