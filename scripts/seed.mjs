/**
 * Seeds a demo restaurant. Safe to re-run: it wipes and rebuilds the demo
 * restaurant only, so you can reset between sales demos with `npm run seed`.
 */
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'qrmenu.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('foreign_keys = ON');

// Reuse the same schema the app creates on boot.
const { SCHEMA_SQL } = await import('../lib/schema.mjs');
db.exec(SCHEMA_SQL);

const SLUG = 'nodirbek';

const MENU = [
  {
    category: 'Milliy taomlar',
    items: [
      ['Osh (palov)', "Devzira guruch, mol go'shti, sabzi va no'xat bilan", 42000],
      ['Lagmon', "Qo'lda tortilgan ugra, qovurilgan go'sht va sabzavot", 38000],
      ['Manti (6 dona)', "Qiyma go'sht va piyoz, bug'da pishirilgan", 40000],
      ['Chuchvara', "Mayda chuchvara, qaymoq yoki suyuq holda", 32000],
      ['Norin', "Qo'lda kesilgan xamir va qazi bilan", 45000],
    ],
  },
  {
    category: 'Kaboblar',
    items: [
      ["Mol go'sht kabob", "Cho'g'da pishirilgan, piyoz va sumac bilan", 48000],
      ['Qiyma kabob', "Ziravorli qiyma, yangi non bilan", 38000],
      ['Tovuq kabob', "Marinadlangan tovuq filesi", 36000],
      ["Qo'y qovurg'a", "Sekin pishirilgan qo'y qovurg'asi", 65000],
    ],
  },
  {
    category: 'Salatlar va nonushta',
    items: [
      ['Achichuk', "Pomidor, piyoz va achchiq qalampir", 18000],
      ['Sezar salat', "Tovuq, parmezan, krutonlar", 34000],
      ['Yangi sabzavotlar', "Mavsumiy sabzavotlar bargi bilan", 22000],
      ['Tandir non', "Issiq tandir noni", 8000],
    ],
  },
  {
    category: 'Ichimliklar',
    items: [
      ["Ko'k choy", "Choynak, 4 kishiga", 12000],
      ['Qora choy', "Choynak, limon bilan", 12000],
      ['Ayron', "Uy sharoitida tayyorlangan", 14000],
      ['Kompot', "Mavsumiy mevalardan", 15000],
      ['Cola / Fanta / Sprite', "0.5 l", 15000],
      ['Suv (gazsiz)', "0.5 l", 8000],
    ],
  },
  {
    category: 'Shirinliklar',
    items: [
      ['Chak-chak', "Asal bilan", 20000],
      ['Napoleon', "Uy tortining bir bo'lagi", 26000],
      ['Muzqaymoq', "Vanil yoki shokolad", 18000],
    ],
  },
];

const TABLES = [
  ['1', 'Stol 1', 4],
  ['2', 'Stol 2', 4],
  ['3', 'Stol 3', 2],
  ['4', 'Stol 4', 6],
  ['5', 'Stol 5', 4],
  ['6', 'Stol 6', 8],
  ['vip1', 'VIP xona 1', 12],
  ['terrace1', 'Terrassa 1', 4],
];

const reset = db.transaction(() => {
  const existing = db.prepare('SELECT id FROM restaurants WHERE slug = ?').get(SLUG);
  if (existing) db.prepare('DELETE FROM restaurants WHERE id = ?').run(existing.id);

  const { lastInsertRowid: restaurantId } = db
    .prepare(
      `INSERT INTO restaurants
         (slug, name, tagline, accent, currency_symbol, currency_decimals,
          symbol_position, service_charge_pct, staff_pin)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(SLUG, 'Nodirbek Milliy Taomlar', "Uy taomlari, tandir non va choy", '#c2410c',
         "so'm", 0, 'after', 10, '1234');

  const insertTable = db.prepare(
    'INSERT INTO tables (restaurant_id, code, label, seats, sort) VALUES (?, ?, ?, ?, ?)'
  );
  TABLES.forEach(([code, label, seats], i) => insertTable.run(restaurantId, code, label, seats, i));

  const insertCategory = db.prepare(
    'INSERT INTO categories (restaurant_id, name, sort) VALUES (?, ?, ?)'
  );
  const insertItem = db.prepare(
    `INSERT INTO items (restaurant_id, category_id, name, description, price, sort)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  MENU.forEach((group, ci) => {
    const { lastInsertRowid: categoryId } = insertCategory.run(restaurantId, group.category, ci);
    group.items.forEach(([name, description, price], ii) => {
      insertItem.run(restaurantId, categoryId, name, description, price, ii);
    });
  });

  return restaurantId;
});

const id = reset();
const itemCount = db.prepare('SELECT COUNT(*) AS n FROM items WHERE restaurant_id = ?').get(id).n;

console.log(`\n  Seeded "${SLUG}" — ${itemCount} menu items, ${TABLES.length} tables.`);
console.log(`  Database: ${DB_PATH}`);
console.log(`\n  Customer menu : http://localhost:3000/m/${SLUG}/1`);
console.log(`  Staff board   : http://localhost:3000/staff   (PIN 1234)`);
console.log(`  Owner admin   : http://localhost:3000/admin    (PIN 1234)\n`);
