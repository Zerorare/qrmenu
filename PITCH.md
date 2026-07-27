# Notes for the restaurant visits — Korea

Working notes for walking into a restaurant with this. The software is the easy part.

## Read this before you go

**Korea is one of the hardest markets on earth for this product, and you should know that
before you spend a day walking into restaurants.**

Table-side ordering is already normal here. A large share of Korean restaurants have a
tablet bolted to every table, from established vendors, and almost every table has a call
bell. So the pitch that works in a country with no table ordering — *"your guests can order
without waiting for a waiter"* — lands on an owner who already solved that two years ago.
If you lead with it you will get polite nods and no sale.

That does **not** mean there is no business here. It means the generic version of this
product is not the business. Two openings are real:

**1. Foreign customers.** Korean ordering tablets range from mediocre to useless in English,
and a printed Korean menu leaves a foreign table pointing at pictures while a staff member
translates. In Hongdae, Itaewon, Myeongdong, Gangnam, Jongno, or around Haeundae in Busan,
that happens at half the tables on a Friday night. An English menu that a guest reads on
their own phone, with an order the kitchen receives correctly, solves a problem the
incumbent tablets genuinely do not.

This is also *your* edge specifically. You are pitching in English, to owners who want
English-speaking customers. That is a much better fit than competing on features.

**2. Cost, for small places.** Tablet systems mean hardware plus a monthly fee per table.
A QR code costs nothing per table and needs no hardware. For a small owner-run place with
six or eight tables who looked at tablets and decided they were too expensive, this is a
different conversation. Find out what tablet vendors actually quote locally before you set
your own price — ask the first three owners you meet, they will tell you.

**The honest test:** if the restaurant already has tablets and gets no foreign customers,
walk away. You will not win that one and chasing it will burn your week.

## The language problem — yours

If your Korean is limited, cold-walking into restaurants is hard, and this is the thing most
likely to stop you. Realistic options, roughly in order:

- Target places whose owner or staff already work in English — which is exactly the
  foreigner-facing restaurants you want anyway. The targeting and the constraint agree.
- Bring a Korean-speaking friend for the first few visits. Offer them a cut if this works.
- Go mid-afternoon, roughly 3–5pm, between lunch and dinner service. Walking in at 7pm on a
  Friday will get you thrown out, and you will deserve it.

## Before you leave the house

- [ ] `npm run seed` — reset to clean demo data
- [ ] `npm run build`, then `npm run demo` — this prints a public HTTPS address
- [ ] Open the `/admin/qr` link it printed and **print one QR card** from there
- [ ] Scan that card with your own phone **over mobile data, wifi switched off**, and place
      a test order. If it works with wifi off, it will work in any restaurant.
- [ ] Charge your laptop and phone. Bring the charger.

Do not print QR codes from a `localhost` address. The phone scans them and then fails to
load, because `localhost` on a phone means the phone itself. The app warns you on the QR
page when this is about to happen — don't click past it.

If the venue has no usable internet at all, fall back to `npm start` + `npm run where` and
put the phone on your own hotspot. Rehearse that at home once so you're not learning it in
front of an owner.

## The demo, in ninety seconds

Do not open a slide deck. Do this:

1. Put your phone in the owner's hand and your laptop on the counter showing `/staff`.
2. Ask them to scan the QR card and order something.
3. Say nothing. Let them watch the ticket land with the chime.
4. Then: *"Your foreign customers order in English, by themselves, and what reaches your
   kitchen is exactly what they picked."*

The silence in step 3 does the selling. Resist filling it.

## What to say it does for them

Lead with their problems, not your features.

| Their problem | What to say |
| --- | --- |
| Foreign guests can't read the menu | "They read it in English on their own phone. Nobody has to translate." |
| Staff time lost explaining dishes | "The description is on the screen. Your staff carry food instead of interpreting." |
| Wrong orders from a language gap | "The guest picks it themselves. What the kitchen sees is what they chose." |
| Reprinting menus when prices change | "Change the price here and every table sees it instantly." |
| Running out of a dish mid-service | "One switch and it disappears from every menu in the room." |
| Tablets quoted too expensive | "No hardware. No tablet per table. It's a paper QR code." |

## Objections you will actually hear

**"We already have tablets."**
Ask one question: *"How do your foreign customers use them?"* If the answer is a shrug,
you have an opening — this sits alongside the tablets for exactly those tables. If the
tablets handle English well and they get no foreign guests, thank them and leave.

**"My customers are older, they won't use it."**
Agree, don't argue. This replaces nothing — keep the paper menus and the call bell. It's for
the table that can't read the Korean menu.

**"How much?"**
Don't answer with a number on the first visit if you can avoid it. Say the first month is
free while you set it up together, and you'll agree a price once they've seen it work.
An install gets you a reference; a reference gets you the next five.

**"What if the internet goes down?"**
Honest answer: the QR menu stops and they take orders the way they do today. Nothing breaks
and nothing is lost. That answer builds more trust than pretending it can't happen.

**"Does it connect to my POS / 포스?"**
Not yet, and say so plainly. The staff screen *is* the order list, and guests pay at the
counter exactly as they do now. Ask which POS they use and write it down. After four or five
restaurants you'll know which integration is worth building, and that's the thing a
competitor can't copy in a weekend.

**"Someone will spam fake orders."**
Each table is capped at six orders a minute and staff can cancel any ticket with one tap.
Worth mentioning — it shows you've thought past the happy path.

## Pricing

Charge monthly, not once. A one-time build is a job; a subscription is a business.

- **Setup**: menu entry, translation, printed QR cards, an hour training staff. Charge for
  this or give it away deliberately — never do it accidentally for free. Translating a
  200-item menu into good English is real work and is worth money on its own.
- **Monthly**: a flat fee per venue. Simple beats clever. Per-order pricing makes owners do
  arithmetic and feel punished for being busy.

Anchor against what they'd otherwise pay for tablets, and price clearly below it — that
comparison is your strongest argument, so find out the real local number before quoting.
The margin is that restaurant #2 costs you almost nothing to serve.

One practical note: once you charge money, you need a business registration (사업자등록) to
invoice properly, and your visa status determines whether you can run a business at all.
Check that before you take anyone's money — this is the kind of thing that is boring right
up until it is a serious problem.

## What to actually aim for tomorrow

Not a sale. **One restaurant that says yes to a free two-week trial.**

Pick a small, busy, owner-run place in a foreigner-heavy area that does *not* have tablets.
Avoid chains and franchises — they have head offices and you'll wait months.

When one says yes, sit down with their menu and enter it into `/admin/menu` on the spot.
Don't leave saying "I'll set it up and come back." Set it up in front of them, print their
QR codes, and put one on a table before you go.

## Build this next, not something else

**A Korean/English toggle.** Right now the app is English only. The moment you install in a
real Korean restaurant you'll want a second name per dish and a language switch in the
header — Korean guests and the kitchen staff reading tickets both want Korean, foreign
guests want English. It's a small change to the data model and it makes the product sellable
to the other 90% of restaurants rather than only foreigner-facing ones.

After that, whatever an owner asks for twice.

## After the first install

Go back on day two and day seven and watch a real service. You'll learn more in one hour
behind that counter than in a month of writing code:

- Do staff actually look at the screen, or does it get buried behind the POS?
- Is the chime audible over a room full of grills and extractor fans? (In a Korean BBQ
  place, genuinely test this — it is loud.)
- Which dishes do foreign guests hesitate over? Those descriptions need work.
