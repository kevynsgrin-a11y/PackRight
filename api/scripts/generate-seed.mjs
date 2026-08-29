#!/usr/bin/env node
// Generates api/seed.sql from the canonical dataset at data/reference-data.json.
// Run: npm run generate:seed  (from api/)
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const here = dirname(fileURLToPath(import.meta.url))
const dataPath = resolve(here, '../../data/reference-data.json')
const outPath = resolve(here, '../seed.sql')

const data = JSON.parse(readFileSync(dataPath, 'utf8'))

const q = (v) => {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? '1' : '0'
  return `'${String(v).replace(/'/g, "''")}'`
}

const row = (values) => `  (${values.map(q).join(', ')})`

const sections = []

sections.push(`-- GENERATED FILE. Do not edit by hand.
-- Source: data/reference-data.json
-- Regenerate: cd api && npm run generate:seed
-- Apply:      wrangler d1 execute packright-db --remote --file=./schema.sql
--             wrangler d1 execute packright-db --remote --file=./seed.sql
--
-- Dataset version ${data.meta.version}. Records marked 'unverified' have a source
-- URL recorded but have NOT been confirmed against that source by a data steward.
-- The application surfaces those as "Review pending" and suppresses savings claims.`)

sections.push(`REPLACE INTO airlines (
  id, slug, name, iata_code,
  personal_item_length, personal_item_width, personal_item_height,
  carry_on_length, carry_on_width, carry_on_height, carry_on_weight,
  checked_bag_weight, checked_bag_linear_dim,
  source_url, source_title, effective_date, verified_at, verified_by,
  scope, currency, status, change_note, updated_at
) VALUES
${data.airlines.map((a) => row([
  a.id, a.slug, a.name, a.iata_code,
  a.personal_item.length, a.personal_item.width, a.personal_item.height,
  a.carry_on.length, a.carry_on.width, a.carry_on.height, a.carry_on.weight,
  a.checked.weight, a.checked.linear_dim,
  a.source_url, a.source_title, a.effective_date, a.verified_at, a.verified_by,
  a.scope, a.currency, a.status, a.change_note, "datetime('now')_RAW",
])).join(',\n')};`)

sections.push(`REPLACE INTO fare_families (
  id, airline_id, name, includes_personal_item, includes_carry_on,
  first_checked_fee, second_checked_fee, third_plus_checked_fee, carry_on_fee,
  source_url, source_title, effective_date, verified_at, verified_by,
  scope, currency, status, change_note, updated_at
) VALUES
${data.fareFamilies.map((f) => row([
  f.id, f.airline_id, f.name, f.includes_personal_item, f.includes_carry_on,
  f.first_checked_fee, f.second_checked_fee, f.third_plus_checked_fee, f.carry_on_fee,
  f.source_url, f.source_title, f.effective_date, f.verified_at, f.verified_by,
  f.scope, f.currency, f.status, f.change_note, "datetime('now')_RAW",
])).join(',\n')};`)

sections.push(`REPLACE INTO benefits (
  id, name, airline_id, benefit_type, tier,
  waives_first_checked, waives_second_checked, waives_carry_on, companion_limit,
  source_url, source_title, effective_date, verified_at, verified_by,
  scope, currency, status, change_note, updated_at
) VALUES
${data.benefits.map((b) => row([
  b.id, b.name, b.airline_id, b.benefit_type, b.tier,
  b.waives_first_checked, b.waives_second_checked, b.waives_carry_on, b.companion_limit,
  b.source_url, b.source_title, b.effective_date, b.verified_at, b.verified_by,
  b.scope, b.currency, b.status, b.change_note, "datetime('now')_RAW",
])).join(',\n')};`)

sections.push(`REPLACE INTO tsa_rules (
  id, item_name, category, allowed_carry_on, allowed_checked, notes,
  source_url, source_title, verified_at, verified_by, status, change_note, updated_at
) VALUES
${data.tsaRules.map((t) => row([
  t.id, t.item_name, t.category, t.allowed_carry_on, t.allowed_checked, t.notes,
  t.source_url, t.source_title, t.verified_at, t.verified_by, t.status, t.change_note,
  "datetime('now')_RAW",
])).join(',\n')};`)

sections.push(`REPLACE INTO fee_assumptions (
  id, label, amount, currency, status, verified_at, verified_by, change_note, updated_at
) VALUES
${data.assumptions.map((a) => row([
  a.id, a.label, a.amount, data.meta.currency, a.status, a.verified_at, a.verified_by,
  a.change_note, "datetime('now')_RAW",
])).join(',\n')};`)

// Replace the sentinel with a raw SQL expression (not a quoted string).
const sql = sections.join('\n\n').replace(/'datetime\(''now''\)_RAW'/g, "datetime('now')") + '\n'

writeFileSync(outPath, sql)
console.log(`Wrote ${outPath} (${sql.split('\n').length} lines) from dataset v${data.meta.version}`)
