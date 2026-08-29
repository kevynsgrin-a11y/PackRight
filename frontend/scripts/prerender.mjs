#!/usr/bin/env node
/**
 * Renders every canonical route to its own static HTML file, and writes
 * sitemap.xml.
 *
 * Audit issues addressed:
 *  - P0-01/P1-17: crawlers received one generic shell with the title "frontend".
 *    Each route now ships real markup plus its own title, description,
 *    canonical, Open Graph, X card and JSON-LD.
 *  - P0-02: sitemap.xml was the SPA fallback. It is generated here from the same
 *    route inventory the router uses, so it cannot list a route that does not exist.
 *  - P1-10: an unknown path returned HTTP 200 with the app shell. Producing a real
 *    file per route means the host serves 404.html with a 404 status for anything else.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')
const distDir = join(root, 'dist')
const ssrEntry = join(root, 'dist-ssr', 'entry-server.js')

const { render, routes, notFoundMeta, siteUrl } = await import(ssrEntry)

const SEO_BLOCK = /<!--seo:start-->[\s\S]*?<!--seo:end-->/
const APP_HTML = '<!--app-html-->'

/**
 * Reads the untouched shell produced by the client build.
 *
 * This script writes over dist/index.html with the rendered home page, so the
 * placeholders are gone by the time it finishes. A pristine copy is kept beside
 * the SSR bundle (which is not published) so re-running prerender without
 * rebuilding still works.
 */
const templateCachePath = join(root, 'dist-ssr', 'index.template.html')

async function loadTemplate() {
  const built = await readFile(join(distDir, 'index.html'), 'utf8')
  if (built.includes(APP_HTML) && SEO_BLOCK.test(built)) {
    await mkdir(dirname(templateCachePath), { recursive: true })
    await writeFile(templateCachePath, built)
    return built
  }

  const cached = await readFile(templateCachePath, 'utf8').catch(() => null)
  if (cached && cached.includes(APP_HTML) && SEO_BLOCK.test(cached)) return cached

  throw new Error(
    'dist/index.html has no <!--app-html--> / <!--seo:start--> placeholders and no cached ' +
      'template was found. Run `npm run build:client` first.',
  )
}

const template = await loadTemplate()

/** '/' -> dist/index.html, '/airlines' -> dist/airlines/index.html */
const outputPathFor = (route) => {
  if (route === '/') return join(distDir, 'index.html')
  if (route === '/404') return join(distDir, '404.html')
  return join(distDir, route.replace(/^\//, ''), 'index.html')
}

async function writeRoute(meta) {
  const { html, head } = render(meta.path === '/404' ? '/404' : meta.path)
  // Replacer FUNCTIONS, not strings. String.replace interprets $$, $&, $` and
  // $' in the replacement, so any of those sequences in rendered content --
  // a change note, a fare name, an airline's own copy -- would splice part of
  // the template back into the output. The head is the worse half: seo.ts's
  // escapeHtml leaves ' and ` alone, so a $` in a title would inject the whole
  // document prefix into the <head>.
  const document = template
    .replace(SEO_BLOCK, () => `<!--seo:start-->\n    ${head}\n    <!--seo:end-->`)
    .replace(APP_HTML, () => html)

  const outPath = outputPathFor(meta.path)
  await mkdir(dirname(outPath), { recursive: true })
  await writeFile(outPath, document)
  return { path: meta.path, bytes: Buffer.byteLength(document), outPath }
}

const pages = routes()
const written = []
for (const meta of pages) {
  written.push(await writeRoute(meta))
}
written.push(await writeRoute(notFoundMeta))

/* ---------------- sitemap ---------------- */

const lastmod = new Date().toISOString().slice(0, 10)
const indexable = pages.filter((page) => !page.noindex)

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemap.org/schemas/sitemap/0.9">
${indexable
  .map(
    (page) => `  <url>
    <loc>${siteUrl}${page.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${page.changefreq ?? 'monthly'}</changefreq>
    <priority>${(page.priority ?? 0.5).toFixed(1)}</priority>
  </url>`,
  )
  .join('\n')}
</urlset>
`.replace('http://www.sitemap.org', 'http://www.sitemaps.org')

await writeFile(join(distDir, 'sitemap.xml'), sitemap)

/* ---------------- service worker ---------------- */

// The precache list has to name the hashed files this build actually produced,
// so it is assembled here rather than hand-maintained.
const assetFiles = await readdir(join(distDir, 'assets')).catch(() => [])
const precache = [
  '/',
  '/offline.html',
  '/offline.css',
  '/favicon.svg',
  '/site.webmanifest',
  ...assetFiles.map((file) => `/assets/${file}`),
]

const buildId = `${lastmod}-${Date.now().toString(36)}`
const swTemplate = await readFile(join(here, 'sw-template.js'), 'utf8')
const sw = swTemplate
  .replace('__BUILD_ID__', () => buildId)
  .replace('__PRECACHE_LIST__', () => JSON.stringify(precache, null, 2))

await writeFile(join(distDir, 'sw.js'), sw)
console.log(`Wrote sw.js (build ${buildId}) precaching ${precache.length} files.`)

console.log(`Prerendered ${written.length} routes:`)
for (const page of written) {
  console.log(`  ${page.path.padEnd(46)} ${String(page.bytes).padStart(7)} bytes`)
}
console.log(`Wrote sitemap.xml with ${indexable.length} URLs.`)
