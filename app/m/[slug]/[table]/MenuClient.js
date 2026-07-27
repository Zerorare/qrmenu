'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatMoney } from '@/lib/money';

const STATUS_COPY = {
  new: { label: 'Sent to the kitchen', hint: 'The staff have your order.' },
  preparing: { label: 'Being prepared', hint: 'Your food is on the stove.' },
  ready: { label: 'Ready', hint: 'Coming to your table now.' },
  served: { label: 'Served', hint: 'Enjoy your meal!' },
  cancelled: { label: 'Cancelled', hint: 'Please speak to a staff member.' },
};

export default function MenuClient({ restaurant, table, menu }) {
  const storageKey = `qrmenu:cart:${restaurant.slug}:${table.code}`;

  const [cart, setCart] = useState({});
  const [sheet, setSheet] = useState(null); // null | 'review' | 'placed'
  const [note, setNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);
  const [activeCategory, setActiveCategory] = useState(menu[0]?.id ?? null);

  const sectionRefs = useRef({});
  const money = useCallback((amount) => formatMoney(amount, restaurant), [restaurant]);

  /* Restore an in-progress cart so a refresh mid-order isn't punishing. */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setCart(JSON.parse(saved));
    } catch {
      /* private mode or corrupt value — start empty */
    }
  }, [storageKey]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch {
      /* storage unavailable; cart still works in memory */
    }
  }, [cart, storageKey]);

  /* Highlight the category chip for whatever section is on screen. */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveCategory(Number(visible.target.dataset.categoryId));
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 }
    );
    Object.values(sectionRefs.current).forEach((node) => node && observer.observe(node));
    return () => observer.disconnect();
  }, [menu]);

  /* After ordering, follow the ticket so the guest sees it move along. */
  useEffect(() => {
    if (!placedOrder || ['served', 'cancelled'].includes(placedOrder.status)) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`/api/orders/${placedOrder.id}`, { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setPlacedOrder((prev) => (prev ? { ...prev, status: data.order.status } : prev));
        }
      } catch {
        /* offline for a moment — next tick retries */
      }
    }, 4000);
    return () => clearInterval(timer);
  }, [placedOrder]);

  const itemsById = useMemo(() => {
    const map = new Map();
    menu.forEach((category) => category.items.forEach((item) => map.set(item.id, item)));
    return map;
  }, [menu]);

  const lines = useMemo(
    () =>
      Object.entries(cart)
        .map(([id, qty]) => ({ item: itemsById.get(Number(id)), qty }))
        .filter((line) => line.item && line.qty > 0),
    [cart, itemsById]
  );

  const subtotal = lines.reduce((sum, line) => sum + line.item.price * line.qty, 0);
  const serviceFee = Math.round((subtotal * restaurant.service_charge_pct) / 100);
  const total = subtotal + serviceFee;
  const count = lines.reduce((sum, line) => sum + line.qty, 0);

  function setQty(itemId, qty) {
    setCart((prev) => {
      const next = { ...prev };
      if (qty <= 0) delete next[itemId];
      else next[itemId] = Math.min(99, qty);
      return next;
    });
  }

  function scrollToCategory(categoryId) {
    sectionRefs.current[categoryId]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function placeOrder() {
    setPlacing(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: restaurant.slug,
          tableCode: table.code,
          note,
          cart: lines.map((line) => ({ itemId: line.item.id, qty: line.qty })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not send the order');

      setPlacedOrder({ id: data.orderId, total: data.total, status: 'new' });
      setCart({});
      setNote('');
      setSheet('placed');
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className="menu-shell" style={{ '--accent': restaurant.accent }}>
      <header className="menu-head">
        <div className="wrap">
          <div className="spread" style={{ alignItems: 'flex-start' }}>
            <div>
              <h1>{restaurant.name}</h1>
              {restaurant.tagline && <div className="tagline">{restaurant.tagline}</div>}
            </div>
            <span className="table-badge">{table.label}</span>
          </div>
        </div>
      </header>

      <nav className="cat-nav" aria-label="Menu categories">
        <div className="cat-nav-inner">
          {menu.map((category) => (
            <button
              key={category.id}
              type="button"
              className="cat-chip"
              aria-current={activeCategory === category.id}
              onClick={() => scrollToCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </nav>

      <main className="wrap">
        {menu.map((category) => (
          <section
            key={category.id}
            ref={(node) => {
              sectionRefs.current[category.id] = node;
            }}
            data-category-id={category.id}
          >
            <h2 className="cat-title">{category.name}</h2>
            {category.items.map((item) => {
              const qty = cart[item.id] ?? 0;
              return (
                <article className="item" key={item.id}>
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt=""
                      width={76}
                      height={76}
                      style={{ width: 76, height: 76, borderRadius: 10, objectFit: 'cover', flex: 'none' }}
                    />
                  )}
                  <div className="grow">
                    <h4>{item.name}</h4>
                    {item.description && <p>{item.description}</p>}
                    <span className="price">{money(item.price)}</span>
                  </div>
                  <div style={{ flex: 'none' }}>
                    {qty > 0 ? (
                      <div className="qty">
                        <button type="button" onClick={() => setQty(item.id, qty - 1)} aria-label={`Remove one ${item.name}`}>
                          −
                        </button>
                        <span>{qty}</span>
                        <button type="button" onClick={() => setQty(item.id, qty + 1)} aria-label={`Add one ${item.name}`}>
                          +
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="add-btn"
                        onClick={() => setQty(item.id, 1)}
                        aria-label={`Add ${item.name}`}
                      >
                        +
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        ))}

        <p className="muted tiny center" style={{ margin: '40px 0 0' }}>
          {table.label} · {restaurant.name}
        </p>
      </main>

      {count > 0 && sheet === null && (
        <div className="cart-bar">
          <div className="inner">
            <div className="grow">
              <div style={{ fontWeight: 700 }}>{money(total)}</div>
              <div className="tiny muted">
                {count} {count === 1 ? 'item' : 'items'}
                {serviceFee > 0 && ` · incl. ${restaurant.service_charge_pct}% service`}
              </div>
            </div>
            <button type="button" className="btn" onClick={() => setSheet('review')}>
              Review order
            </button>
          </div>
        </div>
      )}

      {sheet === 'review' && (
        <div
          className="sheet-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Review order"
          onClick={(event) => event.target === event.currentTarget && setSheet(null)}
        >
          <div className="sheet">
            <div className="spread" style={{ marginBottom: 8 }}>
              <h2 style={{ margin: 0 }}>Your order</h2>
              <button type="button" className="btn ghost sm" onClick={() => setSheet(null)}>
                Close
              </button>
            </div>

            {lines.map((line) => (
              <div className="sheet-line" key={line.item.id}>
                <div className="row">
                  <div className="qty">
                    <button type="button" onClick={() => setQty(line.item.id, line.qty - 1)} aria-label={`Remove one ${line.item.name}`}>
                      −
                    </button>
                    <span>{line.qty}</span>
                    <button type="button" onClick={() => setQty(line.item.id, line.qty + 1)} aria-label={`Add one ${line.item.name}`}>
                      +
                    </button>
                  </div>
                  <span>{line.item.name}</span>
                </div>
                <strong>{money(line.item.price * line.qty)}</strong>
              </div>
            ))}

            {serviceFee > 0 && (
              <>
                <div className="sheet-line muted">
                  <span>Subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>
                <div className="sheet-line muted">
                  <span>Service ({restaurant.service_charge_pct}%)</span>
                  <span>{money(serviceFee)}</span>
                </div>
              </>
            )}

            <div className="sheet-line sheet-total">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>

            <div style={{ margin: '16px 0' }}>
              <label className="lbl" htmlFor="order-note">
                Anything the kitchen should know?
              </label>
              <textarea
                id="order-note"
                className="field"
                rows={2}
                maxLength={400}
                placeholder="No onions, extra bread…"
                value={note}
                onChange={(event) => setNote(event.target.value)}
              />
            </div>

            {error && <p className="err">{error}</p>}

            <button
              type="button"
              className="btn block"
              disabled={placing || lines.length === 0}
              onClick={placeOrder}
            >
              {placing ? 'Sending…' : `Send order · ${money(total)}`}
            </button>
            <p className="tiny muted center" style={{ marginBottom: 0 }}>
              You pay at the table as usual — this only sends the order to the staff.
            </p>
          </div>
        </div>
      )}

      {sheet === 'placed' && placedOrder && (
        <div className="sheet-backdrop" role="dialog" aria-modal="true" aria-label="Order sent">
          <div className="sheet center">
            <div className="success-mark">✓</div>
            <h2 style={{ marginBottom: 4 }}>Order #{placedOrder.id} sent</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              {table.label} · {money(placedOrder.total)}
            </p>

            <div className="card" style={{ padding: 16, margin: '18px 0', textAlign: 'left' }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>
                {STATUS_COPY[placedOrder.status]?.label ?? 'Sent'}
              </div>
              <div className="tiny muted">{STATUS_COPY[placedOrder.status]?.hint}</div>
            </div>

            <button type="button" className="btn block ghost" onClick={() => setSheet(null)}>
              Order something else
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
