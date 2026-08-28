-- Migration 0002: add data provenance and governance columns.
-- Addresses audit issue P0-07 (airline fee data has no public provenance or
-- change governance) and P0-08 (benefit types were not separated).
--
-- Non-destructive: every statement is additive. Existing rows keep their values
-- and the new columns are backfilled by seed.sql, which is generated from
-- data/reference-data.json.
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

ALTER TABLE benefits ADD COLUMN benefit_type TEXT NOT NULL DEFAULT 'CREDIT_CARD';
ALTER TABLE benefits ADD COLUMN tier TEXT;
ALTER TABLE benefits ADD COLUMN source_url TEXT;
ALTER TABLE benefits ADD COLUMN source_title TEXT;
ALTER TABLE benefits ADD COLUMN effective_date TEXT;
ALTER TABLE benefits ADD COLUMN verified_at TEXT;
ALTER TABLE benefits ADD COLUMN verified_by TEXT;
ALTER TABLE benefits ADD COLUMN scope TEXT;
ALTER TABLE benefits ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
ALTER TABLE benefits ADD COLUMN status TEXT NOT NULL DEFAULT 'unverified';
ALTER TABLE benefits ADD COLUMN change_note TEXT;
ALTER TABLE benefits ADD COLUMN created_at TEXT;
ALTER TABLE benefits ADD COLUMN updated_at TEXT;

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
