import Link from 'next/link';
import { getDefaultRestaurant, listTables } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default function Home() {
  const restaurant = getDefaultRestaurant();
  const tables = restaurant ? listTables(restaurant.id) : [];

  if (!restaurant) {
    return (
      <main className="wrap hero">
        <h1>No restaurant yet</h1>
        <p className="lede">
          Run <code>npm run seed</code> to create the demo restaurant, then reload this page.
        </p>
      </main>
    );
  }

  return (
    <main>
      <section className="wrap hero">
        <span className="pill">Live demo</span>
        <h1>Guests order from the table. The kitchen sees it instantly.</h1>
        <p className="lede">
          Every table gets its own QR code. Guests scan, browse the menu, and send an order
          straight to the staff screen — no app to install, no waiting to catch a waiter&apos;s eye.
        </p>
        <div className="row" style={{ flexWrap: 'wrap' }}>
          <Link className="btn" href={`/m/${restaurant.slug}/${tables[0]?.code ?? '1'}`}>
            Open a table menu
          </Link>
          <Link className="btn ghost" href="/staff">
            Staff order screen
          </Link>
          <Link className="btn ghost" href="/admin">
            Owner dashboard
          </Link>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 56 }}>
        <div className="tiles">
          <div className="card tile">
            <div className="num">1</div>
            <h3>Guest scans the table code</h3>
            <p>
              The QR opens the menu with the table number already attached — nobody has to
              type or remember where they&apos;re sitting.
            </p>
          </div>
          <div className="card tile">
            <div className="num">2</div>
            <h3>They order from their phone</h3>
            <p>
              Photos, descriptions and live prices. Items you&apos;ve run out of are hidden with
              one tap from the owner dashboard.
            </p>
          </div>
          <div className="card tile">
            <div className="num">3</div>
            <h3>Staff screen sounds an alert</h3>
            <p>
              The ticket lands on the counter screen within a second or two, with the table
              number in large type. Staff move it through prep, ready, served.
            </p>
          </div>
        </div>
      </section>

      <section className="wrap" style={{ paddingBottom: 80 }}>
        <h2 style={{ fontSize: 21, marginBottom: 6 }}>Try it as a guest</h2>
        <p className="muted" style={{ marginTop: 0, marginBottom: 16 }}>
          Open a table on your phone and the staff screen on a laptop side by side — that
          side-by-side is the whole pitch.
        </p>
        <div className="row" style={{ flexWrap: 'wrap', gap: 8 }}>
          {tables.map((table) => (
            <Link key={table.id} className="btn ghost sm" href={`/m/${restaurant.slug}/${table.code}`}>
              {table.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
