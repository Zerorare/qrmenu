/**
 * Seeds a demo restaurant. Safe to re-run: it wipes and rebuilds the demo
 * restaurant only, so you can reset between sales demos with `npm run seed`.
 *
 * The demo is a Korean grill house with an English-language menu — the case
 * where QR ordering is an easy sell, because a printed Korean menu leaves
 * foreign guests guessing and the staff doing translation at every table.
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

const SLUG = 'mapo-grill';

const MENU = [
  {
    category: 'From the Grill',
    items: [
      ['Samgyeopsal', 'Thick-cut pork belly, grilled at your table. 200g', 17000],
      ['Marinated Galbi', 'Beef short rib in soy and pear marinade. 250g', 29000],
      ['Bulgogi', 'Thin sliced beef, sweet soy marinade, onion and mushroom', 18000],
      ['Dak-galbi', 'Spicy stir-fried chicken with cabbage and rice cake', 15000],
      ['Grilled Pork Neck', 'Unmarinated, served with salt and sesame oil. 200g', 18000],
    ],
  },
  {
    category: 'Stews & Soups',
    items: [
      ['Kimchi Jjigae', 'Aged kimchi stew with pork and tofu', 9000],
      ['Doenjang Jjigae', 'Soybean paste stew with vegetables and tofu', 9000],
      ['Sundubu Jjigae', 'Soft tofu stew, mild or spicy', 9500],
      ['Galbitang', 'Clear beef short rib soup with glass noodles', 13000],
    ],
  },
  {
    category: 'Rice & Noodles',
    items: [
      ['Bibimbap', 'Rice with seasoned vegetables, egg and gochujang', 11000],
      ['Dolsot Bibimbap', 'Same, in a hot stone bowl with crisp rice at the bottom', 12000],
      ['Kimchi Fried Rice', 'With egg and sesame', 9000],
      ['Japchae', 'Sweet potato noodles stir-fried with beef and vegetables', 14000],
      ['Mul-naengmyeon', 'Cold buckwheat noodles in chilled broth', 11000],
    ],
  },
  {
    category: 'Sides',
    items: [
      ['Haemul Pajeon', 'Seafood and scallion pancake', 16000],
      ['Gyeran-jjim', 'Steamed egg, soft and savoury', 6000],
      ['Tteokbokki', 'Rice cakes in sweet chilli sauce', 8000],
      ['Extra Kimchi', 'House-fermented cabbage kimchi', 3000],
      ['Steamed Rice', 'One bowl', 1000],
    ],
  },
  {
    category: 'Drinks',
    items: [
      ['Soju', 'Chilled, 360ml bottle', 5000],
      ['Makgeolli', 'Unfiltered rice wine, 750ml', 6000],
      ['Draft Beer', '500ml', 5000],
      ['Sikhye', 'Sweet cold rice punch', 4000],
      ['Cola / Sprite', '355ml can', 2500],
    ],
  },
  {
    category: 'Dessert',
    items: [
      ['Patbingsu', 'Shaved ice with red bean and condensed milk', 9000],
      ['Hotteok', 'Griddled pancake with brown sugar and nuts', 5000],
    ],
  },
];

const TABLES = [
  ['1', 'Table 1', 4],
  ['2', 'Table 2', 4],
  ['3', 'Table 3', 2],
  ['4', 'Table 4', 6],
  ['5', 'Table 5', 4],
  ['6', 'Table 6', 8],
  ['room1', 'Private Room 1', 12],
  ['terrace1', 'Terrace 1', 4],
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
    .run(
      SLUG,
      'Mapo Grill House',
      'Charcoal barbecue, stews and cold noodles',
      '#b91c1c',
      '₩',
      0,
      'before',
      // Korean restaurants do not add a service charge, so the guest total is
      // exactly the sum of the menu prices.
      0,
      '1234'
    );

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
console.log(`\n  Guest menu  : http://localhost:3000/m/${SLUG}/1`);
console.log(`  Staff board : http://localhost:3000/staff   (PIN 1234)`);
console.log(`  Owner admin : http://localhost:3000/admin    (PIN 1234)\n`);
