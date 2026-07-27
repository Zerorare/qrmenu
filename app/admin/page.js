import Link from 'next/link';
import { currentStaffRestaurant } from '@/lib/auth';
import { getTodayStats, listActiveOrders, listRecentOrders, listTables, getMenu } from '@/lib/db';
import { formatMoney } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const restaurant = await currentStaffRestaurant();
  const stats = getTodayStats(restaurant.id);
  const active = listActiveOrders(restaurant.id);
  const recent = listRecentOrders(restaurant.id, 10);
  const tables = listTables(restaurant.id);
  const menu = getMenu(restaurant.id, { includeUnavailable: true });

  const itemCount = menu.reduce((sum, category) => sum + category.items.length, 0);
  const soldOut = menu.reduce(
    (sum, category) => sum + category.items.filter((item) => !item.available).length,
    0
  );
  const money = (amount) => formatMoney(amount, restaurant);

  return (
    <main className="wrap" style={{ paddingBottom: 60 }}>
      <h1 style={{ fontSize: 24, marginBottom: 0 }}>Today</h1>
      <p className="muted tiny" style={{ marginTop: 4 }}>
        Everything resets at midnight. The staff screen is where orders are worked.
      </p>

      <div className="stat-row">
        <div className="card stat">
          <div className="k">Orders today</div>
          <div className="v">{stats.orders}</div>
        </div>
        <div className="card stat">
          <div className="k">Takings today</div>
          <div className="v">{money(stats.revenue)}</div>
        </div>
        <div className="card stat">
          <div className="k">Open right now</div>
          <div className="v">{active.length}</div>
        </div>
        <div className="card stat">
          <div className="k">Menu items</div>
          <div className="v">
            {itemCount}
            {soldOut > 0 && (
              <span className="tiny muted" style={{ fontWeight: 500 }}>
                {' '}
                · {soldOut} hidden
              </span>
            )}
          </div>
        </div>
      </div>

      {tables.length > 0 && itemCount > 0 && (
        <div className="card" style={{ padding: 18, marginBottom: 22 }}>
          <div className="spread" style={{ flexWrap: 'wrap' }}>
            <div>
              <strong>Ready to test?</strong>
              <div className="tiny muted">
                Open a table menu on your phone and the staff screen on this laptop.
              </div>
            </div>
            <div className="row">
              <Link className="btn sm" href={`/m/${restaurant.slug}/${tables[0].code}`}>
                Open {tables[0].label}
              </Link>
              <Link className="btn ghost sm" href="/admin/qr">
                Print QR codes
              </Link>
            </div>
          </div>
        </div>
      )}

      <h2 style={{ fontSize: 18 }}>Recent orders</h2>
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Table</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {active.length === 0 && recent.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No orders yet. Scan a table QR code to send the first one.
                </td>
              </tr>
            )}
            {[...active, ...recent].map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.table_label}</td>
                <td className="muted tiny">
                  {order.items.map((line) => `${line.qty}× ${line.name}`).join(', ')}
                </td>
                <td>{money(order.total)}</td>
                <td style={{ textTransform: 'capitalize' }}>{order.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
