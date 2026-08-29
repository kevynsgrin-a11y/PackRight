/**
 * PackRight service worker.
 *
 * Generated at build time by scripts/prerender.mjs, which substitutes the build
 * id and the precache list. Do not edit dist/sw.js; edit this template.
 *
 * Audit issue P1-15 asked for a service-worker strategy and an offline state,
 * with one constraint that shapes the whole design: never present an offline
 * calculation as current. So:
 *
 *  - API requests are never cached or served from cache. Offline means no
 *    estimate, not a stale estimate that looks live.
 *  - Documents are network-first, so a deploy is picked up on the next visit.
 *  - Hashed assets under /assets/ are cache-first, because the filename changes
 *    whenever the content does.
 */
const VERSION = '__BUILD_ID__'
const SHELL_CACHE = `packright-shell-${VERSION}`
const PAGE_CACHE = `packright-pages-${VERSION}`
const PRECACHE = __PRECACHE_LIST__
const OFFLINE_URL = '/offline.html'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== SHELL_CACHE && key !== PAGE_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  )
})

/** Newest-first cap on the runtime page cache. */
const MAX_PAGE_ENTRIES = 40

/**
 * Stores a document under its pathname alone.
 *
 * Keying on the Request meant '/methodology', '/methodology?utm_source=x' and
 * '/methodology?ref=y' were three entries for one document, so a share link
 * with tracking parameters grew the cache without bound. The trim keeps the
 * store to a size a phone will actually retain.
 */
function cachePage(pathname, response) {
  return caches
    .open(PAGE_CACHE)
    .then((cache) =>
      cache.put(new Request(pathname), response).then(() =>
        cache.keys().then((keys) => {
          const excess = keys.length - MAX_PAGE_ENTRIES
          return excess > 0
            ? Promise.all(keys.slice(0, excess).map((key) => cache.delete(key)))
            : undefined
        }),
      ),
    )
    .catch(() => {})
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Anything cross-origin, including the calculation API, goes straight to the
  // network and is never cached.
  if (url.origin !== self.location.origin) return

  // Reference and calculation responses must not be replayed from a cache.
  if (url.pathname.startsWith('/api/')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only successful documents are stored. Caching unconditionally meant
          // one 404 or 502 shadowed the offline page for that URL until the
          // next deploy: the offline branch below prefers a cached response,
          // and an error page IS a cached response.
          if (response.ok) {
            const copy = response.clone()
            event.waitUntil(cachePage(url.pathname, copy))
          }
          return response
        })
        .catch(() =>
          caches
            .match(new Request(url.pathname))
            .then((cached) => cached || caches.match(OFFLINE_URL))
            .then((cached) => cached || Response.error()),
        ),
    )
    return
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            // Asset URLs are content-hashed and served cache-first, so pinning
            // a transient 404 against one would persist for the life of the
            // build with no way for the page to recover.
            if (response.ok) {
              const copy = response.clone()
              event.waitUntil(
                caches
                  .open(SHELL_CACHE)
                  .then((cache) => cache.put(request, copy))
                  .catch(() => {}),
              )
            }
            return response
          }),
      ),
    )
    return
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)))
})
