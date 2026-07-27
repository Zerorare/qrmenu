import { NextResponse } from 'next/server';
import {
  getRestaurantBySlug,
  getTable,
  createOrder,
  getOrder,
  listActiveOrders,
  listRecentOrders,
} from '@/lib/db';
import { currentStaffRestaurant } from '@/lib/auth';
import { allowOrder } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

/** Guest places an order. Public — the QR code is the only credential. */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 });
  }

  const { slug, tableCode, cart, note } = body ?? {};
  if (!Array.isArray(cart) || cart.length === 0) {
    return NextResponse.json({ error: 'Your order is empty' }, { status: 400 });
  }
  if (cart.length > 60) {
    return NextResponse.json({ error: 'That order is too large to send' }, { status: 400 });
  }

  const restaurant = getRestaurantBySlug(String(slug ?? ''));
  if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  const table = getTable(restaurant.id, String(tableCode ?? ''));
  if (!table) return NextResponse.json({ error: 'Table not found' }, { status: 404 });

  const limit = allowOrder(`${restaurant.id}:${table.id}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: 'That is a lot of orders at once — please wait a moment or ask a staff member.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } }
    );
  }

  try {
    const orderId = createOrder(restaurant, table.id, cart, note);
    const order = getOrder(orderId);
    return NextResponse.json({ orderId, total: order.total, status: order.status }, { status: 201 });
  } catch (err) {
    if (err.message === 'EMPTY_CART') {
      return NextResponse.json(
        { error: 'Those items are no longer available' },
        { status: 409 }
      );
    }
    console.error('createOrder failed', err);
    return NextResponse.json({ error: 'Could not send the order' }, { status: 500 });
  }
}

/** Staff board polls this for the live ticket list. */
export async function GET() {
  const restaurant = await currentStaffRestaurant();
  if (!restaurant) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  return NextResponse.json({
    active: listActiveOrders(restaurant.id),
    recent: listRecentOrders(restaurant.id, 15),
  });
}
