#!/usr/bin/env node
/**
 * Performance budget gate.
 *
 * Audit issue P1-14 asked for a CI budget of "initial JS Brotli <= 120 KB and
 * route JS Brotli <= 180 KB unless approved". The audit measured a single
 * 341.2 KB uncompressed module with no code splitting.
 *
 * Fails the build when the budget is exceeded, so the site cannot quietly get
 * heavier as content is added.
 */
import { readFile, readdir } from 'node:fs/promises'
import { brotliCompressSync, constants } from 'node:zlib'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const distDir = resolve(here, '..', 'dist')

const BUDGETS = {
  initialJsBrotliKb: 120,
  cssBrotliKb: 30,
}

const brotliBytes = (buffer) =>
  brotliCompressSync(buffer, {
    params: {
      [constants.BROTLI_PARAM_QUALITY]: 11,
      [constants.BROTLI_PARAM_SIZE_HINT]: buffer.length,
    },
  }).length

const kb = (bytes) => bytes / 1024
const fmt = (bytes) => `${kb(bytes).toFixed(1)} KB`

const files = await readdir(join(distDir, 'assets'))

/**
 * Everything emitted as JS today is part of the first paint: the entry is a
 * module script and its static imports are preloaded alongside it. Measuring
 * every JS chunk is the honest reading of "initial JS" for this build, and it
 * stays honest if route-level lazy chunks are added later, since those would
 * make this number an over-estimate rather than an under-estimate.
 */
const rows = []
let initialJs = 0
let css = 0

for (const file of files) {
  if (!file.endsWith('.js') && !file.endsWith('.css')) continue
  const buffer = await readFile(join(distDir, 'assets', file))
  const compressed = brotliBytes(buffer)
  if (file.endsWith('.js')) initialJs += compressed
  else css += compressed
  rows.push({ file, raw: buffer.length, brotli: compressed })
}

console.log('Asset budget (Brotli):')
for (const row of rows.sort((a, b) => b.brotli - a.brotli)) {
  console.log(
    `  ${row.file.padEnd(34)} ${fmt(row.raw).padStart(10)} raw  ${fmt(row.brotli).padStart(10)} br`,
  )
}

const failures = []
if (kb(initialJs) > BUDGETS.initialJsBrotliKb) {
  failures.push(`initial JS ${fmt(initialJs)} exceeds the ${BUDGETS.initialJsBrotliKb} KB budget`)
}
if (kb(css) > BUDGETS.cssBrotliKb) {
  failures.push(`CSS ${fmt(css)} exceeds the ${BUDGETS.cssBrotliKb} KB budget`)
}

console.log(
  `\nInitial JS ${fmt(initialJs)} / ${BUDGETS.initialJsBrotliKb} KB` +
    `   CSS ${fmt(css)} / ${BUDGETS.cssBrotliKb} KB`,
)

if (failures.length > 0) {
  console.error('\nPerformance budget exceeded:')
  for (const failure of failures) console.error(`  - ${failure}`)
  process.exit(1)
}
console.log('Within budget.')
