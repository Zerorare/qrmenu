# Notes for the restaurant visits

Working notes for walking into a restaurant with this. The software is the easy part —
the hard part is the ten minutes you get with a busy owner.

## Before you leave the house

- [ ] `npm run seed` — reset to clean demo data
- [ ] `npm run dev`, then `npm run where` to get your laptop's wifi address
- [ ] Open `/admin/qr` at that address and **print one QR card**, or just have it on screen
- [ ] Scan it with your own phone once, and place a test order, to confirm the whole loop works
- [ ] Charge your laptop and phone. Bring the charger.
- [ ] Know your own wifi fallback: if their wifi is locked down, use your phone's hotspot
      and connect the laptop to it

If their wifi blocks device-to-device traffic, your demo dies on the spot. The hotspot
fallback is the single most important thing on this list.

## The demo, in ninety seconds

Do not open a slide deck. Do this:

1. Put your phone in the owner's hand and your laptop on the counter showing `/staff`.
2. Ask them to scan the QR card and order something.
3. Say nothing. Let them watch the ticket land on the laptop with the chime.
4. Then say: *"That's it. That's the whole product. Your guests never wait to catch a
   waiter's eye, and nothing gets written down wrong."*

The silence in step 3 does the selling. Resist filling it.

## What to say it does for them

Lead with their problems, not your features.

| Their problem | What to say |
| --- | --- |
| Reprinting menus when prices change | "You change the price here, and every table sees it instantly. No printing." |
| Running out of a dish mid-service | "One switch and it disappears from every menu in the room. No more disappointing people." |
| Waiters mishearing orders | "The guest types it. What the kitchen sees is exactly what they chose." |
| Not enough staff on a busy night | "Your waiters stop taking orders and start carrying food." |
| Slow tables at peak time | "Guests order the moment they've decided, not the moment someone's free." |

## Objections you will actually hear

**"My customers are older, they won't use it."**
True for some, and you should agree rather than argue. This replaces nothing — keep the
paper menus. It's for the table that's ready to order while the waiter is across the room.
Offer to look at the numbers together after two weeks.

**"How much?"**
Don't answer with a number on the first visit if you can avoid it. Say the first month is
free while you set it up together, and you'll agree a price once they've seen it work.
That gets you an install, and an install gets you a reference.

**"What if the internet goes down?"**
Honest answer: the QR menu stops working and they take orders the way they do today.
Nothing breaks, nothing is lost, no one is stuck. That answer builds more trust than
pretending it can't happen.

**"Does it connect to my cash register?"**
Not yet — be straight about this. Right now the staff screen *is* the order list, and
guests pay at the table exactly as they do now. Ask which POS they use and write it down.
After three or four restaurants you'll know which integration is worth building first,
and that becomes the thing competitors can't easily copy.

**"Someone will spam fake orders."**
Each table is capped at six orders a minute, and staff can cancel any ticket with one tap.
Worth mentioning — it shows you've thought past the happy path.

## Pricing

Charge monthly, not once. A one-time build is a job; a subscription is a business.

Rough shape:

- **Setup**: menu entry, printed QR cards, and an hour training the staff. Charge for this
  or give it away deliberately — but never do it accidentally for free.
- **Monthly**: a flat fee per venue. Simple beats clever; per-order pricing makes owners
  do arithmetic and feel punished for succeeding.

Set the number against what *they* already pay for: one month should cost less than
reprinting their menus once, and obviously less than an extra shift. Ask a couple of owners
what they'd expect to pay before you fix a price — you'll learn more from that question
than from any calculation.

The margin is in the fact that restaurant #2 costs you almost nothing to serve. Ten venues
on a modest monthly fee is a real income; the work is finding them, not running them.

## What to actually aim for tomorrow

Not a sale. **One restaurant that says yes to a free two-week trial.**

Pick the smallest, busiest place with the youngest owner. Avoid chains — they have head
offices and procurement, and you'll wait three months for a meeting. A single owner who
works in their own restaurant can decide while you're standing there.

When one says yes, sit down with their paper menu and enter it into `/admin/menu` on the
spot. Do not leave saying "I'll set it up and come back". Set it up in front of them, print
their QR codes, and put one on a table before you go.

## After the first install

Go back on day two and day seven. Watch a real service. You will learn more in one hour
behind that counter than in a month of writing code:

- Do staff actually look at the screen, or does it get buried?
- Is the chime loud enough over a busy room?
- What do they ask for that isn't there?

Whatever they ask for twice — build that next.
