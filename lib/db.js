import Database from 'better-sqlite3';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { SCHEMA_SQL } from './schema.mjs';
import { seedDemo } from './seed.mjs';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'qrmenu.db');

/**
 * CREATE TABLE IF NOT EXISTS leaves existing databases untouched, so columns
 * added after a deployment is live need adding by hand. Each entry is checked
 * against the live table and applied only when missing, which makes this safe
 * to run on every boot.
 */
function migrate(db) {
  const columns = db.prepare('PRAGMA table_info(restaurants)').all().map((c) => c.name);

  const additions = [
    ['language', "ALTER TABLE restaurants ADD COLUMN language TEXT NOT NULL DEFAULT 'en'"],
  ];

  for (const [column, sql] of additions) {
    if (columns.includes(column)) continue;
    try {
      db.exec(sql);
      console.log(`[qrmenu] Added missing column restaurants.${column}`);
    } catch (err) {
      // Two processes can open the database at once — Next's build workers do,
      // and so would a second replica. Losing that race is fine: the column
      // exists either way. Anything else is a real failure.
      if (!/duplicate column name/i.test(err.message)) throw err;
    }
  }
}

function open() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  const db = new Database(DB_PATH);
  db.exec(SCHEMA_SQL);
  migrate(db);

  // A hosted deploy has no terminal to run `npm run seed` from, so an empty
  // database would leave the owner staring at a menu they cannot populate.
  // seedDemo only acts when there is no restaurant at all, so this never
  // touches real data. Set AUTO_SEED=false to opt out.
  if (process.env.AUTO_SEED !== 'false') {
    const id = seedDemo(db);
    if (id) console.log('[qrmenu] Empty database — seeded the demo restaurant.');
  }

  return db;
}

// Next.js hot-reloads modules in dev, so keep one connection on globalThis
// rather than opening a new file handle on every reload.
const globalRef = globalThis;
export const db = globalRef.__qrmenuDb ?? (globalRef.__qrmenuDb = open());

/* ------------------------------------------------------------------ */
/* Reads                                                              */
/* ------------------------------------------------------------------ */

/**
 * Secret used to sign staff session cookies.
 *
 * Prefers SESSION_SECRET when set. Otherwise generates a random one on first
 * use and stores it alongside the data, so a deployment where nobody set the
 * variable is still signed with something unguessable rather than a default
 * that is published in this repository. It lives on the same disk as the
 * database, so it survives restarts and redeploys.
 */
export function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;

  const existing = db.prepare("SELECT value FROM meta WHERE key = 'session_secret'").get();
  if (existing) return existing.value;

  const generated = crypto.randomBytes(32).toString('hex');
  db.prepare("INSERT OR IGNORE INTO meta (key, value) VALUES ('session_secret', ?)").run(generated);
  return db.prepare("SELECT value FROM meta WHERE key = 'session_secret'").get().value;
}

export function getRestaurantBySlug(slug) {
  return db.prepare('SELECT * FROM restaurants WHERE slug = ?').get(slug);
}

export function getRestaurantById(id) {
  return db.prepare('SELECT * FROM restaurants WHERE id = ?').get(id);
}

export function getDefaultRestaurant() {
  return db.prepare('SELECT * FROM restaurants ORDER BY id LIMIT 1').get();
}

export function getTable(restaurantId, code) {
  return db
    .prepare('SELECT * FROM tables WHERE restaurant_id = ? AND code = ?')
    .get(restaurantId, code);
}

export function listTables(restaurantId) {
  return db
    .prepare('SELECT * FROM tables WHERE restaurant_id = ? ORDER BY sort, id')
    .all(restaurantId);
}

/** Full menu grouped by category, ready to render. */
export function getMenu(restaurantId, { includeUnavailable = false } = {}) {
  const categories = db
    .prepare('SELECT * FROM categories WHERE restaurant_id = ? ORDER BY sort, id')
    .all(restaurantId);

  const items = db
    .prepare(
      `SELECT * FROM items
        WHERE restaurant_id = ?${includeUnavailable ? '' : ' AND available = 1'}
        ORDER BY sort, id`
    )
    .all(restaurantId);

  return categories.map((category) => ({
    ...category,
    items: items.filter((item) => item.category_id === category.id),
  }));
}

const ORDER_ITEMS_SQL = `
  SELECT order_id, name, unit_price, qty
    FROM order_items
   WHERE order_id IN (SELECT value FROM json_each(?))
   ORDER BY id`;

/** Attach line items to a list of order rows in one query (avoids N+1). */
function withLines(orders) {
  if (orders.length === 0) return [];
  const ids = JSON.stringify(orders.map((o) => o.id));
  const lines = db.prepare(ORDER_ITEMS_SQL).all(ids);
  return orders.map((order) => ({
    ...order,
    items: lines.filter((line) => line.order_id === order.id),
  }));
}

export const ACTIVE_STATUSES = ['new', 'preparing', 'ready'];

export function listActiveOrders(restaurantId) {
  const orders = db
    .prepare(
      `SELECT o.*, t.label AS table_label, t.code AS table_code
         FROM orders o
         JOIN tables t ON t.id = o.table_id
        WHERE o.restaurant_id = ? AND o.status IN ('new','preparing','ready')
        ORDER BY o.created_at ASC, o.id ASC`
    )
    .all(restaurantId);
  return withLines(orders);
}

export function listRecentOrders(restaurantId, limit = 25) {
  const orders = db
    .prepare(
      `SELECT o.*, t.label AS table_label, t.code AS table_code
         FROM orders o
         JOIN tables t ON t.id = o.table_id
        WHERE o.restaurant_id = ? AND o.status IN ('served','cancelled')
        ORDER BY o.updated_at DESC, o.id DESC
        LIMIT ?`
    )
    .all(restaurantId, limit);
  return withLines(orders);
}

export function getOrder(orderId) {
  const order = db
    .prepare(
      `SELECT o.*, t.label AS table_label, t.code AS table_code
         FROM orders o
         JOIN tables t ON t.id = o.table_id
        WHERE o.id = ?`
    )
    .get(orderId);
  if (!order) return null;
  return withLines([order])[0];
}

/** Today's takings and order count, for the admin header. */
export function getTodayStats(restaurantId) {
  return db
    .prepare(
      `SELECT COUNT(*) AS orders, COALESCE(SUM(total), 0) AS revenue
         FROM orders
        WHERE restaurant_id = ?
          AND status != 'cancelled'
          AND date(created_at) = date('now')`
    )
    .get(restaurantId);
}

/* ------------------------------------------------------------------ */
/* Writes                                                             */
/* ------------------------------------------------------------------ */

/**
 * Create an order from a cart of { itemId, qty }.
 * Prices are re-read from the database — never trusted from the client —
 * and copied onto the line so later menu edits don't rewrite history.
 */
export const createOrder = db.transaction((restaurant, tableId, cart, note) => {
  const lookup = db.prepare(
    'SELECT id, name, price FROM items WHERE id = ? AND restaurant_id = ? AND available = 1'
  );

  const lines = [];
  for (const entry of cart) {
    const qty = Math.max(1, Math.min(99, Number(entry.qty) || 0));
    const item = lookup.get(Number(entry.itemId), restaurant.id);
    if (!item) continue;
    lines.push({ item, qty });
  }
  if (lines.length === 0) throw new Error('EMPTY_CART');

  const subtotal = lines.reduce((sum, l) => sum + l.item.price * l.qty, 0);
  const serviceFee = Math.round((subtotal * restaurant.service_charge_pct) / 100);
  const total = subtotal + serviceFee;

  const { lastInsertRowid: orderId } = db
    .prepare(
      `INSERT INTO orders (restaurant_id, table_id, note, subtotal, service_fee, total)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(restaurant.id, tableId, String(note || '').slice(0, 400), subtotal, serviceFee, total);

  const insertLine = db.prepare(
    'INSERT INTO order_items (order_id, item_id, name, unit_price, qty) VALUES (?, ?, ?, ?, ?)'
  );
  for (const { item, qty } of lines) {
    insertLine.run(orderId, item.id, item.name, item.price, qty);
  }

  return orderId;
});

export const ALL_STATUSES = ['new', 'preparing', 'ready', 'served', 'cancelled'];

export function setOrderStatus(orderId, restaurantId, status) {
  if (!ALL_STATUSES.includes(status)) throw new Error('BAD_STATUS');
  const result = db
    .prepare(
      `UPDATE orders SET status = ?, updated_at = datetime('now')
        WHERE id = ? AND restaurant_id = ?`
    )
    .run(status, orderId, restaurantId);
  return result.changes > 0;
}
