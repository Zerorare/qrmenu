import crypto from 'node:crypto';
import { cookies } from 'next/headers';
import { getRestaurantById, sessionSecret } from './db';

const COOKIE = 'qrmenu_staff';

/**
 * Lightweight staff gate: the owner shares one PIN with their team.
 * The cookie holds restaurantId + an HMAC of the PIN, so changing the PIN
 * in the admin logs everyone out. Good enough for a single venue; swap for
 * per-user accounts when a chain needs an audit trail.
 */
function sign(restaurantId, pin) {
  return crypto.createHmac('sha256', sessionSecret()).update(`${restaurantId}:${pin}`).digest('hex');
}

export function buildToken(restaurant) {
  return `${restaurant.id}.${sign(restaurant.id, restaurant.staff_pin)}`;
}

export async function currentStaffRestaurant() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;

  const [rawId, signature] = token.split('.');
  const restaurant = getRestaurantById(Number(rawId));
  if (!restaurant || !signature) return null;

  const expected = sign(restaurant.id, restaurant.staff_pin);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  return restaurant;
}

export const COOKIE_NAME = COOKIE;
