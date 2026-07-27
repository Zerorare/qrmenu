import Link from 'next/link';
import { currentStaffRestaurant } from '@/lib/auth';
import { listTables } from '@/lib/db';
import { addTable, deleteTable } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AdminTablesPage() {
  const restaurant = await currentStaffRestaurant();
  const tables = listTables(restaurant.id);

  return (
    <main className="wrap" style={{ paddingBottom: 60 }}>
      <h1 style={{ fontSize: 24, marginBottom: 0 }}>Tables</h1>
      <p className="muted tiny" style={{ marginTop: 4, marginBottom: 24 }}>
        Each table gets its own code and its own QR. The code is what appears in the link, so
        keep it short — <code>1</code>, <code>2</code>, <code>terrace1</code>.
      </p>

      <div className="card" style={{ overflowX: 'auto', marginBottom: 22 }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Seats</th>
              <th>Menu link</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {tables.length === 0 && (
              <tr>
                <td colSpan={5} className="muted">
                  No tables yet — add the first one below.
                </td>
              </tr>
            )}
            {tables.map((table) => (
              <tr key={table.id}>
                <td>
                  <strong>{table.label}</strong>
                </td>
                <td>
                  <code>{table.code}</code>
                </td>
                <td className="muted">{table.seats}</td>
                <td>
                  <Link
                    className="tiny"
                    href={`/m/${restaurant.slug}/${table.code}`}
                    style={{ color: 'var(--accent)' }}
                  >
                    /m/{restaurant.slug}/{table.code} ↗
                  </Link>
                </td>
                <td style={{ width: 44 }}>
                  <form action={deleteTable}>
                    <input type="hidden" name="id" value={table.id} />
                    <button className="btn ghost sm" type="submit" aria-label={`Delete ${table.label}`}>
                      ✕
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 18 }}>
        <h2 style={{ fontSize: 16, marginTop: 0 }}>Add a table</h2>
        <form action={addTable} className="row" style={{ flexWrap: 'wrap' }}>
          <input className="field" name="label" placeholder="Name — e.g. Table 7" required style={{ flex: '2 1 200px' }} />
          <input className="field" name="code" placeholder="Code (optional)" style={{ flex: '1 1 140px' }} />
          <input className="field" name="seats" type="number" min="1" max="40" defaultValue="4" style={{ flex: '0 0 90px' }} />
          <button className="btn" type="submit">
            Add table
          </button>
        </form>
        <p className="tiny muted" style={{ marginBottom: 0 }}>
          Leave the code empty and it will be generated from the name.
        </p>
      </div>
    </main>
  );
}
