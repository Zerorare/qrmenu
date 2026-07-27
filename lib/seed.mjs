/**
 * Demo restaurant data, shared by two callers:
 *
 *  - `npm run seed` (scripts/seed.mjs), which resets it on demand
 *  - the app itself on first boot, when the database is empty
 *
 * The second one matters for hosted deployments: there is no terminal on the
 * server, so if the app came up with an empty database there would be no menu
 * and no way to create one. Booting into a working demo means a fresh deploy
 * is immediately usable, and the owner edits it into their real menu from
 * /admin rather than starting from nothing.
 */

export const DEMO_SLUG = 'mapo-grill';

export const DEMO_RESTAURANT = {
  slug: DEMO_SLUG,
  name: 'Mapo Grill House',
  tagline: 'Charcoal barbecue, stews and cold noodles',
  accent: '#b91c1c',
  currency_symbol: '₩',
  currency_decimals: 0,
  symbol_position: 'before',
  // Korean restaurants do not add a service charge, so the guest total is
  // exactly the sum of the menu prices.
  service_charge_pct: 0,
  staff_pin: '1234',
};

export const DEMO_MENU = [
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

export const DEMO_TABLES = [
  ['1', 'Table 1', 4],
  ['2', 'Table 2', 4],
  ['3', 'Table 3', 2],
  ['4', 'Table 4', 6],
  ['5', 'Table 5', 4],
  ['6', 'Table 6', 8],
  ['room1', 'Private Room 1', 12],
  ['terrace1', 'Terrace 1', 4],
];

/**
 * Insert the demo restaurant.
 *
 * With `reset: true` an existing demo restaurant is deleted first, which is
 * what `npm run seed` does between sales demos. Without it, the function
 * refuses to touch a database that already has a restaurant in it, so calling
 * this on every boot is safe.
 *
 * Returns the restaurant id, or null when it declined to do anything.
 */
export function seedDemo(db, { reset = false } = {}) {
  const run = db.transaction(() => {
    if (reset) {
      const existing = db.prepare('SELECT id FROM restaurants WHERE slug = ?').get(DEMO_SLUG);
      if (existing) db.prepare('DELETE FROM restaurants WHERE id = ?').run(existing.id);
    } else {
      const { n } = db.prepare('SELECT COUNT(*) AS n FROM restaurants').get();
      if (n > 0) return null;
    }

    const { lastInsertRowid: restaurantId } = db
      .prepare(
        `INSERT INTO restaurants
           (slug, name, tagline, accent, currency_symbol, currency_decimals,
            symbol_position, service_charge_pct, staff_pin)
         VALUES (@slug, @name, @tagline, @accent, @currency_symbol, @currency_decimals,
                 @symbol_position, @service_charge_pct, @staff_pin)`
      )
      .run(DEMO_RESTAURANT);

    const insertTable = db.prepare(
      'INSERT INTO tables (restaurant_id, code, label, seats, sort) VALUES (?, ?, ?, ?, ?)'
    );
    DEMO_TABLES.forEach(([code, label, seats], i) =>
      insertTable.run(restaurantId, code, label, seats, i)
    );

    const insertCategory = db.prepare(
      'INSERT INTO categories (restaurant_id, name, sort) VALUES (?, ?, ?)'
    );
    const insertItem = db.prepare(
      `INSERT INTO items (restaurant_id, category_id, name, description, price, sort)
       VALUES (?, ?, ?, ?, ?, ?)`
    );

    DEMO_MENU.forEach((group, ci) => {
      const { lastInsertRowid: categoryId } = insertCategory.run(restaurantId, group.category, ci);
      group.items.forEach(([name, description, price], ii) => {
        insertItem.run(restaurantId, categoryId, name, description, price, ii);
      });
    });

    return restaurantId;
  });

  return run();
}
