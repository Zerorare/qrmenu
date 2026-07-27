# How to check it works

Two walkthroughs. Do **A** first to confirm the app is healthy on your computer, then **B**
to rehearse the real demo on a phone. B is the one that matters before a restaurant visit.

---

## A. On your computer only (5 minutes, no phone)

### 1. Set up

```bash
git pull
npm install
npm run seed
npm run dev
```

`npm run seed` prints the three links and the PIN. Leave this terminal running — everything
below happens in the browser.

**Expect:** `Seeded "mapo-grill" — 26 menu items, 8 tables.`

### 2. Open two browser windows side by side

| Window | Address | Notes |
| --- | --- | --- |
| Left — the guest | <http://localhost:3000/m/mapo-grill/4> | Narrow it, or use device toolbar (F12 → phone icon) |
| Right — the staff | <http://localhost:3000/staff> | Sign in with PIN **1234** |

On the staff window, click **Turn on sound** once. Browsers block audio until you interact
with the page, so without this click there will be no chime.

### 3. Place an order as the guest

In the left window:

1. Tap **+** next to *Samgyeopsal*, then **+** again → quantity shows **2**
2. Tap **+** next to *Kimchi Jjigae*
3. A bar appears at the bottom showing **₩43,000 · 3 items** → tap **Review order**
4. Type something in *Anything the kitchen should know?*
5. Tap **Send order · ₩43,000**

**Expect:** a green tick, *Order #1 sent*, and a status card reading *Sent to the kitchen*.

### 4. Watch the staff window

Without touching it, within about 3 seconds:

**Expect:** a chime, and a ticket appears in the **NEW** column — `Table 4`, red left edge,
`2× Samgyeopsal`, `1× Kimchi Jjigae`, your note in a highlighted box, and `₩43,000`.

That is the entire product. If this works, everything else is detail.

### 5. Move the ticket through the board

On the staff window click **Start preparing** → the ticket moves to **PREPARING**.
Click **Mark ready** → moves to **READY**. Click **Served** → it leaves the board.

**Now look back at the guest window.** Within ~4 seconds the status card should follow along:
*Being prepared* → *Ready* → *Served*. The guest sees their order progress without doing
anything.

Click **Served today** on the staff bar to see completed orders.

### 6. Check the sold-out switch

Open <http://localhost:3000/admin/menu> (PIN 1234 if asked).

1. Find *Samgyeopsal* and click its green switch off — the row dims
2. Reload the guest window

**Expect:** Samgyeopsal is gone from the menu entirely. Switch it back on, reload, it returns.

This is the feature owners use most, so make sure you can demo it in a few seconds.

### 7. Check menu editing

Still on `/admin/menu`:

- Change a price, click **Save**, reload the guest menu → new price shows
- Type into the grey *New dish name* / *Price* row at the bottom of a category → click
  **Add** → the dish appears on the guest menu

Then try `/admin/tables` (add a table), `/admin/settings` (change the accent colour and
reload the guest menu — the whole menu re-themes), and `/admin` (today's order count and
takings).

---

## B. On a real phone — the demo rehearsal

**Do this at home the night before, not in front of an owner.**

### 1. Stop the dev server and build

```bash
# Ctrl-C the dev server first
npm run build
npm run demo
```

### 2. Read the banner

```
Ready to demo. Scan from any phone — no wifi needed.

  Guest menu   https://something-random.trycloudflare.com/m/mapo-grill/1
  QR codes     https://something-random.trycloudflare.com/admin/qr   <- print or show this
  Staff board  https://something-random.trycloudflare.com/staff      <- keep this open
```

If instead you get *"Could not open a public address"*, your network is blocking it — skip
to **Fallback** below.

### 3. Open the QR page at that address

Open the **QR codes** link from the banner in your browser. Sign in with **1234**.

**Expect:** eight cards, and **no orange warning box**. If you see a warning saying
*"Don't print these — a phone can't open them"*, you opened `localhost` instead of the
public address. Go back and use the link from the banner.

### 4. The actual test — turn your phone's wifi OFF

This is the important bit. On mobile data only:

1. Open the phone camera and point it at the *Table 1* QR code on your screen
2. Tap the notification that pops up

**Expect:** the Mapo Grill House menu loads, with **Table 1** in the top right.

If it loads with wifi off, it will work in any restaurant, on any guest's phone, regardless
of their network. If it does *not* load, stop and fix this before you go anywhere.

### 5. Order from the phone, watch your laptop

Keep the **Staff board** link open on your laptop (sign in, click **Turn on sound**). Order
something on the phone.

**Expect:** the chime and the ticket on the laptop within a few seconds.

That is your demo. Practise it twice so you can do it without narrating.

### 6. Print one card

On the QR page click **Print sheet**. The navigation and the warning box are hidden in print;
you get clean cards, three per row. Print one page, cut out a card, and bring it — handing an
owner a physical card is far better than asking them to scan your laptop screen.

### Fallback: no internet at the venue

```bash
npm start
npm run where      # prints e.g. http://192.168.1.20:3000
```

Open `/admin/qr` at **that** address. The phone must be on the same wifi as the laptop — use
your own phone hotspot rather than the restaurant's, which often blocks devices from
reaching each other.

---

## C. Worth breaking on purpose

Try these once so nothing surprises you in front of a client. Every row below has been
run against this build and behaves as described.

| Try this | What should happen |
| --- | --- |
| Open `/m/mapo-grill/99` | "That table doesn't exist" page, not a crash |
| Order, then close the guest tab and reopen the menu | The cart is remembered |
| Tap **Send order** twice fast | One order, not two |
| Send 7 orders from one table inside a minute | The 7th is refused — anti-spam, worth mentioning to owners |
| Sign out of the staff screen, then reload | Back to the PIN screen |
| Change the PIN in `/admin/settings` | You stay signed in; other devices are signed out |
| Turn off wifi on the laptop with the staff board open | Badge changes to *Reconnecting…*, then back to *Live* |

---

## Resetting between demos

```bash
npm run seed
```

Wipes orders and restores the demo menu, so the first restaurant sees *Order #1* and not
*Order #47* from the last meeting. Run it before every visit.
