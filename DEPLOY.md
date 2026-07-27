# Putting it online (no Terminal needed)

This gets you a permanent web address like `qrmenu-production.up.railway.app`. QR codes
printed from it work forever, on any phone, without your laptop being involved.

Everything below happens in a web browser.

> **There is no merge step.** `claude/qr-restaurant-menu-idea-29ttcc` is the only branch in
> the repository and is already its default branch, so Railway will pick it up as-is. If you
> later create a `main`, remember to point Railway at whichever branch you want deployed.

---

## Step 1 — Create the project

1. Go to **railway.app** → **Login** → **Login with GitHub**
2. **New Project** → **Deploy from GitHub repo**
3. Grant Railway access to your repositories if it asks
4. Choose **Zerorare/qrmenu**

Railway starts building straight away. It will come up half-working until step 2 is done —
that's expected. Don't delete it and start over.

---

## Step 2 — Add a disk, and point the database at it

Everything lives in a single SQLite file. With no disk, that file is destroyed on every
redeploy and every restart, taking the menu with it. **This is the one step you cannot skip.**

1. Click your service (the box named after the repo)
2. Right-click the project canvas → **Add Volume** (or use the service's ⋮ menu)
3. Set the mount path to exactly:

```
/data
```

4. Go to the service's **Variables** tab and add one variable:

| Variable | Value |
| --- | --- |
| `DATABASE_PATH` | `/data/qrmenu.db` |

Railway redeploys itself after this.

*You don't need to set a session secret. If `SESSION_SECRET` is unset the app generates a
random one on first boot and keeps it on the volume, so logins survive redeploys. Set it
yourself only if you want to invalidate every staff session at once.*

---

## Step 3 — Get your web address

Service → **Settings** → **Networking** → **Generate Domain**.

You'll get something like `qrmenu-production-a1b2.up.railway.app`. Open it.

**You should see the demo restaurant, already working.** The app notices an empty database on
first boot and loads the demo menu itself — there's nothing to run by hand.

---

## Step 4 — Check it, then make it yours

| Address | What to do |
| --- | --- |
| `https://your-address/` | Landing page with table buttons |
| `https://your-address/admin` | Sign in, PIN **1234** |
| `https://your-address/admin/settings` | **Change the PIN now** — 1234 is written in this repo, so it's public |
| `https://your-address/admin/qr` | Your QR codes. **There should be no orange warning box.** |
| `https://your-address/staff` | The order screen |

Then the real test: **turn your phone's wifi off**, scan a code from `/admin/qr` on mobile
data, and order. Watch it appear on `/staff`.

If that works, you're ready to walk into a restaurant.

---

## Making it a real client's restaurant

All in `/admin`, no code:

- **Settings** — name, tagline, accent colour, currency, staff PIN
- **Menu** — categories, dishes, prices, and the sold-out switch
- **Tables** — their actual tables
- **QR codes** — print the sheet, cut out the cards

---

## Things that will bite you

**Cost.** Railway bills by usage. Something this small is cheap but not free forever — check
their current pricing. Avoid any free tier that sleeps or has no persistent disk; it will
lose a client's menu, which costs you far more than a few dollars.

**One restaurant per deployment.** The app serves a single venue. For a second client, create
a second Railway project from the same repo. Fine for the first few; if this becomes a real
business, proper multi-restaurant support is the thing to build.

**No backups.** The database is one file on the volume. There is no undo before you make big
changes to a paying client's menu.

**Redeploys keep your data.** Verified: renaming the restaurant and changing a price, then
restarting, leaves both intact, adds no duplicate demo data, and keeps staff logged in.

**`AUTO_SEED=false`** starts a deployment with a genuinely empty database, if you ever want
that instead of the demo menu.
