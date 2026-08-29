import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

import { STATIC_PAGES, renderHeadTags } from './src/lib/seo'

const rootDir = dirname(fileURLToPath(import.meta.url))

/**
 * Replaces the <!--seo--> marker in index.html with the home page's head.
 *
 * scripts/prerender.mjs replaces it again per route, so every canonical URL
 * ships its own metadata rather than one generic shell. This plugin makes the
 * dev server and the plain build agree with that instead of shipping an empty
 * head (the audit found the live title was literally "frontend").
 */
function seoHeadPlugin(): Plugin {
  const home = STATIC_PAGES.find((page) => page.path === '/')!
  return {
    name: 'packright-seo-head',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) =>
        html.replace('<!--seo-->', `<!--seo:start-->\n    ${renderHeadTags(home)}\n    <!--seo:end-->`),
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoHeadPlugin()],
  define: {
    /*
     * The footer used to call new Date().getFullYear() during render. The SSR
     * pass and the browser evaluate that at different moments, so on New Year's
     * Eve the prerendered HTML and the hydrated tree disagree on one text node
     * -- and, more mundanely, a page built in December keeps claiming the wrong
     * year all through January until something else triggers a rebuild.
     * Stamped once, at build time, for both the client and SSR builds.
     */
    __BUILD_YEAR__: JSON.stringify(String(new Date().getFullYear())),
  },
  server: {
    fs: {
      // data/reference-data.json lives above the Vite root.
      allow: [resolve(rootDir, '..')],
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    // Hashed filenames plus a one-year immutable cache header (see public/_headers).
    assetsDir: 'assets',
    sourcemap: false,
    rollupOptions: {
      output: {
        // Split the framework out of the app chunk so an app-only change does
        // not invalidate the vendor code on repeat visits. Rolldown requires
        // the function form.
        manualChunks(id: string) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-router')) return 'router'
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id)) return 'react'
          return undefined
        },
      },
    },
  },
})
