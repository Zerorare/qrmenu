import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getDefaultRestaurant, getRestaurantBySlug } from '@/lib/db';
import { buildToken, COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/** Sign in with the venue's shared staff PIN. */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Malformed request' }, { status: 400 });
  }

  const restaurant = body?.slug ? getRestaurantBySlug(String(body.slug)) : getDefaultRestaurant();
  if (!restaurant) return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });

  if (String(body?.pin ?? '') !== restaurant.staff_pin) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 });
  }

  (await cookies()).set(COOKIE_NAME, buildToken(restaurant), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  (await cookies()).delete(COOKIE_NAME);
  return NextResponse.json({ ok: true });
}
