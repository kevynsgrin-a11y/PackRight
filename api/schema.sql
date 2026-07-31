-- PackRight D1 Database Schema

-- Airlines configuration
CREATE TABLE IF NOT EXISTS airlines (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  iata_code TEXT NOT NULL,
  personal_item_length REAL,
  personal_item_width REAL,
  personal_item_height REAL,
  carry_on_length REAL,
  carry_on_width REAL,
  carry_on_height REAL,
  carry_on_weight REAL,
  checked_bag_weight REAL,
  checked_bag_linear_dim REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Fare Families (e.g. Basic Economy, Main Cabin)
CREATE TABLE IF NOT EXISTS fare_families (
  id TEXT PRIMARY KEY,
  airline_id TEXT NOT NULL,
  name TEXT NOT NULL,
  includes_personal_item BOOLEAN DEFAULT 1,
  includes_carry_on BOOLEAN DEFAULT 0,
  first_checked_fee REAL DEFAULT 0,
  second_checked_fee REAL DEFAULT 0,
  FOREIGN KEY (airline_id) REFERENCES airlines(id)
);

-- Credit Card & Status Benefits
CREATE TABLE IF NOT EXISTS benefits (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  airline_id TEXT NOT NULL,
  type TEXT NOT NULL,
  waives_first_checked BOOLEAN DEFAULT 0,
  waives_second_checked BOOLEAN DEFAULT 0,
  waives_carry_on BOOLEAN DEFAULT 0,
  companion_limit INTEGER DEFAULT 0,
  FOREIGN KEY (airline_id) REFERENCES airlines(id)
);

-- TSA Rules
CREATE TABLE IF NOT EXISTS tsa_rules (
  id TEXT PRIMARY KEY,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  allowed_carry_on BOOLEAN,
  allowed_checked BOOLEAN,
  notes TEXT
);

-- Seed basic data (using REPLACE to allow re-running)
REPLACE INTO airlines (id, name, iata_code, personal_item_length, personal_item_width, personal_item_height, carry_on_length, carry_on_width, carry_on_height, carry_on_weight, checked_bag_weight, checked_bag_linear_dim)
VALUES 
  ('aa', 'American Airlines', 'AA', 18, 14, 8, 22, 14, 9, NULL, 50, 62),
  ('dl', 'Delta Air Lines', 'DL', 18, 14, 8, 22, 14, 9, NULL, 50, 62),
  ('ua', 'United Airlines', 'UA', 17, 10, 9, 22, 14, 9, NULL, 50, 62),
  ('nk', 'Spirit Airlines', 'NK', 18, 14, 8, 22, 18, 10, 40, 40, 62),
  ('f9', 'Frontier Airlines', 'F9', 14, 18, 8, 24, 16, 10, 35, 40, 62),
  ('wn', 'Southwest Airlines', 'WN', 16, 13.5, 8.5, 24, 16, 10, NULL, 50, 62),
  ('as', 'Alaska Airlines', 'AS', 14, 11, 9, 22, 14, 9, NULL, 50, 62),
  ('b6', 'JetBlue Airways', 'B6', 17, 13, 8, 22, 14, 9, NULL, 50, 62);

REPLACE INTO fare_families (id, airline_id, name, includes_personal_item, includes_carry_on, first_checked_fee, second_checked_fee)
VALUES
  ('aa-basic', 'aa', 'Basic Economy', 1, 1, 40, 45),
  ('aa-main', 'aa', 'Main Cabin', 1, 1, 40, 45),
  ('dl-basic', 'dl', 'Basic Economy', 1, 1, 35, 45),
  ('dl-main', 'dl', 'Main Cabin', 1, 1, 35, 45),
  ('ua-basic', 'ua', 'Basic Economy', 1, 0, 40, 50),
  ('ua-main', 'ua', 'Main Cabin', 1, 1, 40, 50),
  ('nk-standard', 'nk', 'Standard', 1, 0, 59, 79), 
  ('f9-standard', 'f9', 'Standard', 1, 0, 65, 85),
  ('wn-wanna', 'wn', 'Wanna Get Away', 1, 1, 0, 0), -- Southwest 2 free bags
  ('as-saver', 'as', 'Saver', 1, 1, 35, 45),
  ('as-main', 'as', 'Main', 1, 1, 35, 45),
  ('b6-bluebasic', 'b6', 'Blue Basic', 1, 0, 35, 50),
  ('b6-blue', 'b6', 'Blue', 1, 1, 35, 50);

REPLACE INTO benefits (id, name, airline_id, type, waives_first_checked, waives_second_checked, waives_carry_on, companion_limit)
VALUES
  ('aa-citi', 'Citi® / AAdvantage® Platinum Select®', 'aa', 'CREDIT_CARD', 1, 0, 0, 4),
  ('dl-gold', 'Delta SkyMiles® Gold Amex', 'dl', 'CREDIT_CARD', 1, 0, 0, 8),
  ('ua-explorer', 'United℠ Explorer Card', 'ua', 'CREDIT_CARD', 1, 0, 1, 1),
  ('as-visa', 'Alaska Airlines Visa Signature®', 'as', 'CREDIT_CARD', 1, 0, 0, 6),
  ('b6-plus', 'JetBlue Plus Card', 'b6', 'CREDIT_CARD', 1, 0, 0, 3);

REPLACE INTO tsa_rules (id, item_name, category, allowed_carry_on, allowed_checked, notes)
VALUES
  ('liquids', 'Liquids (over 3.4 oz)', 'Liquids', 0, 1, 'Must be 3.4oz (100ml) or less in carry-on'),
  ('lithium', 'Spare Lithium Batteries', 'Electronics', 1, 0, 'Must be protected from short circuit. Max 100Wh.'),
  ('firearms', 'Firearms', 'Weapons', 0, 1, 'Must be unloaded, locked in hard-sided container, and declared.'),
  ('knives', 'Knives', 'Sharp Objects', 0, 1, 'Except plastic or round-bladed butter knives.');
