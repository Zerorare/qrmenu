// Single source of truth for the database schema.
// Imported by lib/db.js (app boot) and scripts/seed.mjs so they cannot drift.
export const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

-- Small key/value store for instance-level values that aren't per-restaurant,
-- such as the generated session signing secret.
CREATE TABLE IF NOT EXISTS meta (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS restaurants (
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  slug               TEXT NOT NULL UNIQUE,
  name               TEXT NOT NULL,
  tagline            TEXT NOT NULL DEFAULT '',
  accent             TEXT NOT NULL DEFAULT '#e2653f',
  currency_symbol    TEXT NOT NULL DEFAULT '₩',
  currency_decimals  INTEGER NOT NULL DEFAULT 0,
  symbol_position    TEXT NOT NULL DEFAULT 'before',
  service_charge_pct REAL NOT NULL DEFAULT 0,
  staff_pin          TEXT NOT NULL DEFAULT '1234',
  created_at         TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tables (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  code          TEXT NOT NULL,
  label         TEXT NOT NULL,
  seats         INTEGER NOT NULL DEFAULT 4,
  sort          INTEGER NOT NULL DEFAULT 0,
  UNIQUE (restaurant_id, code)
);

CREATE TABLE IF NOT EXISTS categories (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  sort          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS items (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  category_id   INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  description   TEXT NOT NULL DEFAULT '',
  price         INTEGER NOT NULL DEFAULT 0,
  image_url     TEXT NOT NULL DEFAULT '',
  available     INTEGER NOT NULL DEFAULT 1,
  sort          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_id      INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
  status        TEXT NOT NULL DEFAULT 'new',
  note          TEXT NOT NULL DEFAULT '',
  subtotal      INTEGER NOT NULL DEFAULT 0,
  service_fee   INTEGER NOT NULL DEFAULT 0,
  total         INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id    INTEGER REFERENCES items(id) ON DELETE SET NULL,
  name       TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  qty        INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_orders_restaurant_status
  ON orders (restaurant_id, status, created_at);
CREATE INDEX IF NOT EXISTS idx_items_restaurant
  ON items (restaurant_id, category_id, sort);
CREATE INDEX IF NOT EXISTS idx_order_items_order
  ON order_items (order_id);
`;
