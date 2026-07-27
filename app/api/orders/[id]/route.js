import { NextResponse } from 'next/server';
import { getOrder, setOrderStatus } from '@/lib/db';
import { currentStaffRestaurant } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Guest polls their own ticket after ordering. Deliberately returns only the
 * status and total — never the note, the lines, or anything about other tables.
 */
export async function GET(_request, { params }) {
  const { id } = await params;
  const order = getOrder(Number(id));
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  return NextResponse.json({
    order: { id: order.id, status: order.status, total: order.total },
  });
}

/** Staff move a ticket along the board. */
export async function PATCH(request, { params }) {
  const restaurant = await currentStaffRestaurant();
  if (!restaurant) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 });
  }

  try {
    const updated = setOrderStatus(Number(id), restaurant.id, String(body?.status ?? ''));
    if (!updated) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err.message === 'BAD_STATUS') {
      return NextResponse.json({ error: 'Unknown status' }, { status: 400 });
    }
    throw err;
  }
}
