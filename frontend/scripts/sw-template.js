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
          const copy = response.clone()
          caches.open(PAGE_CACHE).then((cache) => cache.put(request, copy))
          return response
        })
        .catch(() =>
          caches
            .match(request)
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
            const copy = response.clone()
            caches.open(SHELL_CACHE).then((cache) => cache.put(request, copy))
            return response
          }),
      ),
    )
    return
  }

  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)))
})
