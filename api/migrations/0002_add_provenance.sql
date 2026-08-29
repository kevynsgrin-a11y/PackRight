-- Migration 0002: add data provenance and governance columns.
-- Addresses audit issue P0-07 (airline fee data has no public provenance or
-- change governance) and P0-08 (benefit types were not separated).
--
-- Almost every statement is additive: existing rows keep their values and the
-- new columns are backfilled by seed.sql, generated from data/reference-data.json.
--
-- The one exception is `benefits`, which must be rebuilt. The original table
-- carries a legacy `type TEXT NOT NULL` column with no default. The new seed
-- writes `benefit_type` and never sets `type`, so a REPLACE INTO would trip the
-- NOT NULL constraint and every benefit row would fail to insert, silently
-- leaving the table without provenance. SQLite cannot drop a NOT NULL
-- constraint in place, so the table is rebuilt with the correct shape and its
-- rows copied across. This was caught by rehearsing the migration against a
-- replica of the production schema before applying it.
--
-- Apply once, in order:
--   wrangler d1 execute packright-db --remote --file=./migrations/0002_add_provenance.sql
--   wrangler d1 execute packright-db --remote --file=./schema.sql   (creates the new tables)
--   wrangler d1 execute packright-db --remote --file=./seed.sql     (backfills every column)
--
-- SQLite ADD COLUMN is not idempotent; running this twice errors on the first
-- duplicate column, which is safe to ignore if the migration already ran.

ALTER TABLE airlines ADD COLUMN slug TEXT;
ALTER TABLE airlines ADD COLUMN source_url TEXT;
ALTER TABLE airlines ADD COLUMN source_title TEXT;
ALTER TABLE airlines ADD COLUMN effective_date TEXT;
ALTER TABLE airlines ADD COLUMN verified_at TEXT;
ALTER TABLE airlines ADD COLUMN verified_by TEXT;
ALTER TABLE airlines ADD COLUMN scope TEXT;
ALTER TABLE airlines ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE airlines ADD COLUMN status TEXT NOT NULL DEFAULT 'unverified';
ALTER TABLE airlines ADD COLUMN change_note TEXT;
ALTER TABLE airlines ADD COLUMN updated_at TEXT;

ALTER TABLE fare_families ADD COLUMN third_plus_checked_fee REAL;
ALTER TABLE fare_families ADD COLUMN carry_on_fee REAL;
ALTER TABLE fare_families ADD COLUMN source_url TEXT;
ALTER TABLE fare_families ADD COLUMN source_title TEXT;
ALTER TABLE fare_families ADD COLUMN effective_date TEXT;
ALTER TABLE fare_families ADD COLUMN verified_at TEXT;
ALTER TABLE fare_families ADD COLUMN verified_by TEXT;
ALTER TABLE fare_families ADD COLUMN scope TEXT;
ALTER TABLE fare_families ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE fare_families ADD COLUMN status TEXT NOT NULL DEFAULT 'unverified';
ALTER TABLE fare_families ADD COLUMN change_note TEXT;
ALTER TABLE fare_families ADD COLUMN created_at TEXT;
ALTER TABLE fare_families ADD COLUMN updated_at TEXT;

-- Rebuild `benefits` (see the note at the top of this file). Existing rows are
-- preserved, with the legacy `type` value carried into `benefit_type`.
CREATE TABLE benefits_v2 (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  airline_id TEXT NOT NULL,
  benefit_type TEXT NOT NULL DEFAULT 'CREDIT_CARD',
  tier TEXT,
  waives_first_checked INTEGER NOT NULL DEFAULT 0,
  waives_second_checked INTEGER NOT NULL DEFAULT 0,
  waives_carry_on INTEGER NOT NULL DEFAULT 0,
  companion_limit INTEGER NOT NULL DEFAULT 0,
  source_url TEXT,
  source_title TEXT,
  effective_date TEXT,
  verified_at TEXT,
  verified_by TEXT,
  scope TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL DEFAULT 'unverified',
  change_note TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (airline_id) REFERENCES airlines(id)
);

INSERT INTO benefits_v2 (
  id, name, airline_id, benefit_type,
  waives_first_checked, waives_second_checked, waives_carry_on, companion_limit
)
SELECT
  id, name, airline_id, COALESCE(type, 'CREDIT_CARD'),
  COALESCE(waives_first_checked, 0), COALESCE(waives_second_checked, 0),
  COALESCE(waives_carry_on, 0), COALESCE(companion_limit, 0)
FROM benefits;

DROP TABLE benefits;

ALTER TABLE benefits_v2 RENAME TO benefits;

ALTER TABLE tsa_rules ADD COLUMN source_url TEXT;
ALTER TABLE tsa_rules ADD COLUMN source_title TEXT;
ALTER TABLE tsa_rules ADD COLUMN verified_at TEXT;
ALTER TABLE tsa_rules ADD COLUMN verified_by TEXT;
ALTER TABLE tsa_rules ADD COLUMN status TEXT NOT NULL DEFAULT 'unverified';
ALTER TABLE tsa_rules ADD COLUMN change_note TEXT;
ALTER TABLE tsa_rules ADD COLUMN created_at TEXT;
ALTER TABLE tsa_rules ADD COLUMN updated_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_airlines_slug ON airlines(slug);
CREATE INDEX IF NOT EXISTS idx_fare_families_airline ON fare_families(airline_id);
CREATE INDEX IF NOT EXISTS idx_benefits_airline ON benefits(airline_id);
CREATE INDEX IF NOT EXISTS idx_benefits_type ON benefits(benefit_type);
