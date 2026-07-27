'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { db, getRestaurantById } from '@/lib/db';
import { parseMoney } from '@/lib/money';
import { currentStaffRestaurant, buildToken, COOKIE_NAME } from '@/lib/auth';

async function requireRestaurant() {
  const restaurant = await currentStaffRestaurant();
  if (!restaurant) throw new Error('Not signed in');
  return restaurant;
}

function refresh() {
  revalidatePath('/admin', 'layout');
  revalidatePath('/', 'layout');
}

/** Turn "VIP room 2" into a URL-safe table code. */
function slugify(input) {
  return String(input)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

/* ------------------------------- menu ------------------------------- */

export async function addCategory(formData) {
  const restaurant = await requireRestaurant();
  const name = String(formData.get('name') ?? '').trim();
  if (!name) return;

  const { max } = db
    .prepare('SELECT COALESCE(MAX(sort), -1) AS max FROM categories WHERE restaurant_id = ?')
    .get(restaurant.id);

  db.prepare('INSERT INTO categories (restaurant_id, name, sort) VALUES (?, ?, ?)')
    .run(restaurant.id, name.slice(0, 60), max + 1);
  refresh();
}

export async function deleteCategory(formData) {
  const restaurant = await requireRestaurant();
  db.prepare('DELETE FROM categories WHERE id = ? AND restaurant_id = ?')
    .run(Number(formData.get('id')), restaurant.id);
  refresh();
}

export async function addItem(formData) {
  const restaurant = await requireRestaurant();
  const categoryId = Number(formData.get('categoryId'));
  const name = String(formData.get('name') ?? '').trim();
  if (!name || !categoryId) return;

  const category = db
    .prepare('SELECT id FROM categories WHERE id = ? AND restaurant_id = ?')
    .get(categoryId, restaurant.id);
  if (!category) return;

  const { max } = db
    .prepare('SELECT COALESCE(MAX(sort), -1) AS max FROM items WHERE category_id = ?')
    .get(categoryId);

  db.prepare(
    `INSERT INTO items (restaurant_id, category_id, name, description, price, sort)
     VALUES (?, ?, ?, ?, ?, ?)`
  ).run(
    restaurant.id,
    categoryId,
    name.slice(0, 80),
    String(formData.get('description') ?? '').trim().slice(0, 200),
    parseMoney(formData.get('price'), restaurant),
    max + 1
  );
  refresh();
}

export async function updateItem(formData) {
  const restaurant = await requireRestaurant();
  const id = Number(formData.get('id'));

  db.prepare(
    `UPDATE items
        SET name = ?, description = ?, price = ?, image_url = ?
      WHERE id = ? AND restaurant_id = ?`
  ).run(
    String(formData.get('name') ?? '').trim().slice(0, 80),
    String(formData.get('description') ?? '').trim().slice(0, 200),
    parseMoney(formData.get('price'), restaurant),
    String(formData.get('imageUrl') ?? '').trim().slice(0, 500),
    id,
    restaurant.id
  );
  refresh();
}

/** The "we've run out" switch — the feature owners reach for daily. */
export async function toggleItem(itemId, available) {
  const restaurant = await requireRestaurant();
  db.prepare('UPDATE items SET available = ? WHERE id = ? AND restaurant_id = ?')
    .run(available ? 1 : 0, Number(itemId), restaurant.id);
  refresh();
}

export async function deleteItem(formData) {
  const restaurant = await requireRestaurant();
  db.prepare('DELETE FROM items WHERE id = ? AND restaurant_id = ?')
    .run(Number(formData.get('id')), restaurant.id);
  refresh();
}

/* ------------------------------ tables ------------------------------ */

export async function addTable(formData) {
  const restaurant = await requireRestaurant();
  const label = String(formData.get('label') ?? '').trim();
  if (!label) return { error: 'Give the table a name' };

  const code = slugify(formData.get('code') || label);
  if (!code) return { error: 'That name cannot be turned into a code' };

  const clash = db
    .prepare('SELECT id FROM tables WHERE restaurant_id = ? AND code = ?')
    .get(restaurant.id, code);
  if (clash) return { error: `Code "${code}" is already used by another table` };

  const { max } = db
    .prepare('SELECT COALESCE(MAX(sort), -1) AS max FROM tables WHERE restaurant_id = ?')
    .get(restaurant.id);

  db.prepare('INSERT INTO tables (restaurant_id, code, label, seats, sort) VALUES (?, ?, ?, ?, ?)')
    .run(restaurant.id, code, label.slice(0, 40), Number(formData.get('seats')) || 4, max + 1);
  refresh();
  return { ok: true };
}

export async function deleteTable(formData) {
  const restaurant = await requireRestaurant();
  db.prepare('DELETE FROM tables WHERE id = ? AND restaurant_id = ?')
    .run(Number(formData.get('id')), restaurant.id);
  refresh();
}

/* ----------------------------- settings ----------------------------- */

export async function updateSettings(formData) {
  const restaurant = await requireRestaurant();
  const pin = String(formData.get('staffPin') ?? '').trim();

  db.prepare(
    `UPDATE restaurants
        SET name = ?, tagline = ?, accent = ?, currency_symbol = ?,
            service_charge_pct = ?, staff_pin = ?
      WHERE id = ?`
  ).run(
    String(formData.get('name') ?? '').trim().slice(0, 80) || restaurant.name,
    String(formData.get('tagline') ?? '').trim().slice(0, 120),
    String(formData.get('accent') ?? '').trim().slice(0, 20) || restaurant.accent,
    String(formData.get('currencySymbol') ?? '').trim().slice(0, 10) || restaurant.currency_symbol,
    Math.max(0, Math.min(100, Number(formData.get('serviceCharge')) || 0)),
    /^\d{4,8}$/.test(pin) ? pin : restaurant.staff_pin,
    restaurant.id
  );

  // The session cookie is signed with the PIN, so changing it would sign the
  // owner out mid-edit. Re-issue the cookie against the new PIN instead.
  (await cookies()).set(COOKIE_NAME, buildToken(getRestaurantById(restaurant.id)), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  refresh();
}
