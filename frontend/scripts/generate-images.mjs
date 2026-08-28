#!/usr/bin/env node
/**
 * Generates the social share image and the PWA icon set.
 *
 * Run manually when the branding changes; the output is committed, so the
 * normal build does not depend on a browser being available:
 *
 *   node scripts/generate-images.mjs
 *
 * Audit issues P1-15 (no manifest icons, no apple-touch-icon) and P1-17 (the
 * recommended og:image had no file behind it).
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const here = dirname(fileURLToPath(import.meta.url))
const root = resolve(here, '..')

async function loadChromium() {
  const require = createRequire(import.meta.url)
  const candidates = ['playwright', 'playwright-core', '/opt/node22/lib/node_modules/playwright']
  for (const name of candidates) {
    try {
      const mod = await import(require.resolve(name))
      // Playwright ships CommonJS, so the named export may sit on `default`.
      const chromium = mod.chromium ?? mod.default?.chromium
      if (chromium) return chromium
    } catch {
      /* try the next candidate */
    }
  }
  throw new Error(`Could not load Playwright. Tried: ${candidates.join(', ')}`)
}

const BG = '#0f1115'
const PURPLE = '#8b5cf6'
const CYAN = '#0ea5e9'

const PLANE = `<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
  <path d="M2 22h20"/>
  <path d="M6.36 17.4 4 17l-2-4 1.1-.55a2 2 0 0 1 1.8 0l.17.1a2 2 0 0 0 1.8 0L8 12 5 6l.9-.45a2 2 0 0 1 2.09.2l4.02 3a2 2 0 0 0 2.1.2l4.19-2.06a2.41 2.41 0 0 1 1.73-.17L21 7a1.4 1.4 0 0 1 .87 1.99l-2.3 4.55a4 4 0 0 1-2.09 1.91l-8.9 3.43a2 2 0 0 1-1.31.03Z"/>
</svg>`

const logoMark = (size) => `
  <div style="width:${size}px;height:${size}px;border-radius:${size * 0.26}px;
      background:linear-gradient(135deg, ${PURPLE}, ${CYAN});
      display:flex;align-items:center;justify-content:center;">
    <div style="width:${size * 0.56}px;height:${size * 0.56}px;display:flex;">${PLANE}</div>
  </div>`

const page = (body, width, height) => `<!doctype html>
<html><head><meta charset="utf-8"><style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:${width}px;height:${height}px;background:${BG};
    font-family:Inter,'Helvetica Neue',Arial,sans-serif;color:#f8fafc;overflow:hidden}
  svg{width:100%;height:100%}
</style></head><body>${body}</body></html>`

const OG_HTML = page(
  `<div style="position:relative;width:1200px;height:630px;padding:80px;display:flex;
      flex-direction:column;justify-content:space-between;overflow:hidden">
    <div style="position:absolute;top:-160px;left:-80px;width:520px;height:520px;border-radius:50%;
      background:${PURPLE};opacity:.20;filter:blur(120px)"></div>
    <div style="position:absolute;bottom:-200px;right:-60px;width:560px;height:560px;border-radius:50%;
      background:${CYAN};opacity:.20;filter:blur(120px)"></div>

    <div style="display:flex;align-items:center;gap:20px;position:relative">
      ${logoMark(72)}
      <span style="font-size:46px;font-weight:700;letter-spacing:-.02em">
        Pack<span style="color:${CYAN}">Right</span>
      </span>
    </div>

    <div style="position:relative;max-width:940px">
      <h1 style="font-size:66px;line-height:1.08;font-weight:700;letter-spacing:-.03em">
        Airline baggage fee<br>calculator
      </h1>
      <p style="margin-top:26px;font-size:29px;line-height:1.4;color:#94a3b8;max-width:800px">
        Estimate fees, compare carry-on and personal-item limits, and see the source
        behind every figure.
      </p>
    </div>

    <div style="position:relative;display:flex;align-items:center;justify-content:space-between">
      <span style="font-size:24px;color:#94a3b8">luggageliason.com</span>
      <span style="font-size:20px;color:#94a3b8;border:1px solid rgba(255,255,255,.14);
        border-radius:999px;padding:10px 22px">Estimates, not quotes</span>
    </div>
  </div>`,
  1200,
  630,
)

const iconHtml = (size, maskable) => {
  const inset = maskable ? size * 0.1 : 0
  const box = size - inset * 2
  return page(
    `<div style="width:${size}px;height:${size}px;background:${maskable ? BG : 'transparent'};
        display:flex;align-items:center;justify-content:center">
      <div style="width:${box}px;height:${box}px;border-radius:${maskable ? box * 0.5 : box * 0.22}px;
          background:linear-gradient(135deg, ${PURPLE}, ${CYAN});
          display:flex;align-items:center;justify-content:center">
        <div style="width:${box * 0.54}px;height:${box * 0.54}px;display:flex">${PLANE}</div>
      </div>
    </div>`,
    size,
    size,
  )
}

const chromium = await loadChromium()
const browser = await chromium.launch()

const shoot = async (html, width, height, outPath, omitBackground = false) => {
  const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
  const tab = await context.newPage()
  await tab.setContent(html, { waitUntil: 'load' })
  await mkdir(dirname(outPath), { recursive: true })
  await tab.screenshot({ path: outPath, omitBackground })
  await context.close()
  const { size } = await readFile(outPath).then((b) => ({ size: b.length }))
  console.log(`  ${outPath.replace(root + '/', '')}  ${width}x${height}  ${size} bytes`)
}

console.log('Generating share image and icons:')
await shoot(OG_HTML, 1200, 630, join(root, 'public/og/packright-home.png'))
await shoot(iconHtml(192, false), 192, 192, join(root, 'public/icons/icon-192.png'), true)
await shoot(iconHtml(512, false), 512, 512, join(root, 'public/icons/icon-512.png'), true)
await shoot(iconHtml(512, true), 512, 512, join(root, 'public/icons/maskable-512.png'))
await shoot(iconHtml(180, false), 180, 180, join(root, 'public/icons/apple-touch-icon.png'), true)

await browser.close()

// A tiny manifest of what was generated, so a reviewer can tell these are build
// artefacts rather than hand-drawn assets.
await writeFile(
  join(root, 'public/icons/README.md'),
  '# Generated icons\n\nProduced by `node scripts/generate-images.mjs`. Do not edit by hand; change the\nscript and regenerate so every size stays consistent.\n',
)
console.log('Done.')
