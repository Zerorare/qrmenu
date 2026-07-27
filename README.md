# QR Menu

Every table gets its own QR code. A guest scans it, browses the menu on their phone,
and sends an order. The ticket appears on the staff screen within a couple of seconds,
with a chime and the table number in large type.

No app to install for the guest. No hardware for the restaurant beyond a screen they
already have.

## What's here

| Screen | Path | Who uses it |
| --- | --- | --- |
| Guest menu | `/m/<restaurant>/<table>` | Diners, via the QR code on the table |
| Staff order board | `/staff` | Waiters and kitchen, on a counter tablet or laptop |
| Owner dashboard | `/admin` | The owner — menu, tables, QR sheet, settings |

The staff board and the owner dashboard share one PIN per venue.

## Quick start

```bash
npm install
npm run seed      # creates the demo restaurant with a full menu and 8 tables
npm run dev
```

Then open <http://localhost:3000>. The default PIN is **1234**.

`npm run seed` is safe to re-run — it resets the demo restaurant to a clean state,
which is exactly what you want between two sales meetings.

## Demoing it on a real phone

`localhost` on a phone means *the phone itself*, so a QR code pointing there will not
work. Put your laptop and your phone on the same wifi, then:

```bash
npm run dev
npm run where     # prints something like http://192.168.1.20:3000
```

Open the dashboard at **that** address — `http://192.168.1.20:3000/admin/qr` — and the
QR codes will encode it too. Scan one with the phone's camera and you're in the guest
menu. Keep `/staff` open on the laptop while you do it; watching the ticket land is the
whole pitch.

Once you have a real domain, set `BASE_URL=https://yourdomain.com` and the QR codes
follow it.

## Configuration

| Variable | Default | What it does |
| --- | --- | --- |
| `BASE_URL` | inferred from the request | Address encoded into the printed QR codes |
| `DATABASE_PATH` | `./data/qrmenu.db` | Where the SQLite file lives |
| `SESSION_SECRET` | a dev placeholder | **Set this to a random string in production** — it signs the staff cookie |
| `PORT` | `3000` | Server port |

## How it works

- **Next.js App Router** with server components for reads and server actions for the
  admin forms. No client-side state library — the cart is the only real client state.
- **SQLite via better-sqlite3.** One file, no database server to run or pay for. A single
  restaurant will not outgrow it; it comfortably handles far more traffic than a busy
  venue produces.
- **Polling, not websockets.** The staff board asks for tickets every 3 seconds. That is
  unglamorous but it survives flaky café wifi and reconnects on its own, which websockets
  behind a proxy often do not.
- **Prices are never trusted from the browser.** The order endpoint re-reads every price
  from the database, clamps quantities, drops unknown or unavailable items, and copies the
  price onto the order line so later menu edits never rewrite an old bill.
- **Per-table rate limit.** Six orders per table per minute. A QR code is a public
  endpoint, and a bored child tapping *send* should not flood the kitchen screen.

### Money

Amounts are stored as integers in the currency's smallest unit, so there is no floating
point drift. `currency_decimals = 0` suits so'm (`45000` → `45 000 so'm`); set it to `2`
for currencies with cents.

## Deploying

The app needs a persistent filesystem for the SQLite file, so pick a host with a real
disk — a small VPS, Railway, Fly.io, or Render all work. Vercel's serverless functions do
**not** keep a writable disk between requests; on Vercel you would swap SQLite for Postgres
(Neon or Supabase). For a single restaurant, the cheapest VPS you can find is plenty.

```bash
npm run build
SESSION_SECRET=<random-string> BASE_URL=https://yourdomain.com npm start
```

Put it behind a reverse proxy with HTTPS. Phone cameras will refuse to open a plain
`http://` link from a QR code on some devices, so a certificate is not optional in
production.

## Known gaps

Things a restaurant will ask for that are deliberately not built yet:

- **No payment.** Guests still pay at the table as they always have. This is a feature for
  a first install — it removes the scariest objection — but a real POS integration or an
  online-payment step is the obvious next step.
- **No printer.** Tickets appear on screen, not on a thermal printer. Most kitchens want
  paper eventually.
- **One PIN for all staff**, so there is no record of *who* marked an order served. Fine for
  one venue, not enough for a chain.
- **No multi-language switch.** The seed data is in Uzbek and the interface chrome is in
  English. Adding a language toggle is straightforward and worth doing before a real install.
- **No photos on the seeded items.** The menu supports an image URL per dish; the demo data
  just doesn't fill it in. Real photos noticeably lift order values, so collect them on day one.

## A note on `npm audit`

`npm audit` reports advisories in `sharp`, a native image-optimizer that Next.js pulls in as
an optional dependency. This app sets `images.unoptimized` in `next.config.mjs`, so that code
path never runs on a request. Do not run `npm audit fix --force` — it "fixes" the warning by
downgrading Next.js to version 9, which would break the app entirely.
