# Putting it online (no Terminal needed)

This gets you a permanent web address like `qrmenu-production.up.railway.app`. QR codes
printed from it work forever, on any phone, without your laptop being involved at all.

Everything below happens in a web browser.

---

## Step 1 — Merge the code into your main branch

The work is currently on a branch called `claude/qr-restaurant-menu-idea-29ttcc`.

1. In the Claude app, click the **Create PR** button at the bottom of the chat
2. That opens a pull request on GitHub — click **Merge pull request**, then **Confirm merge**

Your `main` branch now has the app.

*(You can skip this and deploy the branch directly instead — Railway lets you pick which
branch to deploy in Settings. Merging is just tidier.)*

---

## Step 2 — Create the project on Railway

1. Go to **railway.app** and click **Login** → **Login with GitHub**
2. Click **New Project** → **Deploy from GitHub repo**
3. If asked, give Railway permission to see your repositories
4. Choose **Zerorare/qrmenu**

Railway starts building immediately. **It will fail or come up half-working until you finish
step 3** — that's expected, don't panic and don't delete it.

---

## Step 3 — Add a disk for the database

This app stores everything in a single SQLite file. Without a disk, that file is wiped on
every redeploy and every restart — menus, tables, orders, all of it. **Do not skip this.**

1. In your project, click on the service (the box with your repo name)
2. Go to the **Variables** tab and add these two:

| Variable | Value |
| --- | --- |
| `DATABASE_PATH` | `/data/qrmenu.db` |
| `SESSION_SECRET` | any long random string you make up — mash the keyboard, 30+ characters |

`SESSION_SECRET` signs the staff login cookie. If you leave it unset the app falls back to a
known placeholder value, which means anyone could forge a staff session.

3. Now right-click the canvas (or use the service menu) → **Add Volume**
4. Set the mount path to exactly:

```
/data
```

Railway redeploys automatically after this.

---

## Step 4 — Get your web address

1. Click the service → **Settings** tab → scroll to **Networking**
2. Click **Generate Domain**

You'll get something like `qrmenu-production-a1b2.up.railway.app`. Open it.

**You should see the demo restaurant, already working.** The app notices the database is
empty on first boot and loads the demo menu itself, so there's nothing to run by hand.

---

## Step 5 — Check it, then make it yours

Open these, in this order:

| Address | What to do |
| --- | --- |
| `https://your-address/` | Should show the landing page with table buttons |
| `https://your-address/admin` | Sign in with PIN **1234** |
| `https://your-address/admin/settings` | **Change the PIN immediately** — 1234 is public knowledge, it's written in this repo |
| `https://your-address/admin/qr` | Your QR codes. **There should be no orange warning box.** |
| `https://your-address/staff` | The order screen |

Then the real test: **turn your phone's wifi off**, scan a QR code from `/admin/qr` with your
phone camera on mobile data, and place an order. Watch it land on `/staff` on your laptop.

If that works, you're ready to walk into a restaurant.

---

## Turning it into a real client's restaurant

All in `/admin`, no code:

- **Settings** — name, tagline, accent colour, currency, staff PIN
- **Menu** — add categories and dishes, edit prices, hide sold-out items
- **Tables** — add or rename their actual tables
- **QR codes** — print the sheet, cut out the cards

---

## Things that will bite you

**Cost.** Railway bills by usage. Something this small is cheap, but it is not free forever —
check their current pricing before you rely on it. A free tier that sleeps or has no
persistent disk will lose your client's menu, which is much worse than paying a few dollars.

**One restaurant per deployment.** The app currently supports a single venue. For a second
client, create a second Railway project from the same repo. That's fine for the first few;
if this becomes a real business you'll want proper multi-restaurant support instead.

**Backups.** There aren't any. The database is one file on the volume. Before you make big
changes to a paying client's menu, be aware there is no undo.

**Redeploys keep your data**, because the database lives on the volume, not in the code. This
was tested: editing the restaurant name and a price, then restarting, leaves both intact and
does not re-add the demo data.

**`AUTO_SEED=false`** turns off the first-boot demo data, if you ever want a deployment that
starts genuinely empty.
