import { headers } from 'next/headers';
import QRCode from 'qrcode';
import { currentStaffRestaurant } from '@/lib/auth';
import { listTables } from '@/lib/db';
import PrintButton from './PrintButton';

export const dynamic = 'force-dynamic';

/**
 * The QR has to encode a URL a guest's phone can actually reach, so it is built
 * from the host the owner is browsing on rather than a hardcoded localhost.
 * Set BASE_URL once you have a real domain and it wins.
 */
async function resolveBaseUrl() {
  if (process.env.BASE_URL) return process.env.BASE_URL.replace(/\/$/, '');

  const headerList = await headers();
  const host = headerList.get('x-forwarded-host') ?? headerList.get('host') ?? 'localhost:3000';
  const protocol = headerList.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${protocol}://${host}`;
}

export default async function QrSheetPage() {
  const restaurant = await currentStaffRestaurant();
  const tables = listTables(restaurant.id);
  const baseUrl = await resolveBaseUrl();

  const cards = await Promise.all(
    tables.map(async (table) => {
      const url = `${baseUrl}/m/${restaurant.slug}/${table.code}`;
      const svg = await QRCode.toString(url, {
        type: 'svg',
        errorCorrectionLevel: 'M',
        margin: 1,
        color: { dark: '#000000', light: '#ffffff' },
      });
      return { table, url, dataUri: `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}` };
    })
  );

  const localhost = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');

  return (
    <main className="wrap" style={{ paddingBottom: 60 }}>
      <div className="spread no-print" style={{ margin: '20px 0 6px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, margin: 0 }}>QR codes</h1>
          <p className="muted tiny" style={{ marginTop: 4, marginBottom: 0 }}>
            One card per table. Print, cut, and stand them on the tables.
          </p>
        </div>
        <PrintButton />
      </div>

      {localhost && (
        <div
          className="card no-print"
          style={{
            padding: 14,
            margin: '16px 0',
            borderLeft: '4px solid var(--warn)',
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          <strong>These codes point at {baseUrl}</strong>
          <div className="muted">
            A phone can&apos;t open <code>localhost</code> — that address means the phone itself. For a
            real test, run the server and open the dashboard from your computer&apos;s network address
            (like <code>http://192.168.1.20:3000/admin/qr</code>), or set <code>BASE_URL</code> to your
            deployed domain. The codes rebuild automatically from whatever address you use.
          </div>
        </div>
      )}

      {tables.length === 0 && <div className="empty">Add a table first and its QR code will appear here.</div>}

      <div className="qr-grid" style={{ marginTop: 18 }}>
        {cards.map(({ table, url, dataUri }) => (
          <div className="qr-card" key={table.id}>
            <div className="t-brand">{restaurant.name}</div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={dataUri} alt={`QR code for ${table.label}`} />
            <div className="t-label">{table.label}</div>
            <div className="t-hint">
              Scan to see the menu
              <br />
              and order from your phone
            </div>
            <div className="t-hint no-print" style={{ marginTop: 8, wordBreak: 'break-all', opacity: 0.6 }}>
              {url}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
