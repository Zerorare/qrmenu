'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney } from '@/lib/money';
import { t } from '@/lib/i18n.mjs';

const columnsFor = (L) => [
  { status: 'new', label: L.colNew, next: 'preparing', action: L.actStart },
  { status: 'preparing', label: L.colPreparing, next: 'ready', action: L.actReady },
  { status: 'ready', label: L.colReady, next: 'served', action: L.actServed },
];

const POLL_MS = 3000;

/** SQLite stores UTC as "YYYY-MM-DD HH:MM:SS"; make it a real Date. */
function toDate(sqlTimestamp) {
  return new Date(`${sqlTimestamp.replace(' ', 'T')}Z`);
}

function elapsed(sqlTimestamp, now, L) {
  const minutes = Math.max(0, Math.floor((now - toDate(sqlTimestamp)) / 60000));
  if (minutes < 1) return L.justNow;
  if (minutes < 60) return L.minsAgo(minutes);
  return L.hoursAgo(Math.floor(minutes / 60), minutes % 60);
}

export default function StaffBoard({ restaurant, initialActive, initialRecent }) {
  const router = useRouter();
  const L = t(restaurant.language);
  const COLUMNS = columnsFor(L);
  const [active, setActive] = useState(initialActive);
  const [recent, setRecent] = useState(initialRecent);
  const [now, setNow] = useState(() => Date.now());
  const [soundOn, setSoundOn] = useState(false);
  const [connected, setConnected] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  const audioRef = useRef(null);
  const knownIds = useRef(new Set(initialActive.map((order) => order.id)));

  const money = useCallback((amount) => formatMoney(amount, restaurant), [restaurant]);

  /* A short two-tone chime, synthesised so there's no audio file to ship. */
  const chime = useCallback(() => {
    const ctx = audioRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    [880, 1320].forEach((frequency, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + index * 0.18;

      osc.type = 'sine';
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.22);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.24);
    });
  }, []);

  /* Browsers only allow audio after a gesture, so sound is opt-in with a tap. */
  function enableSound() {
    if (!audioRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      audioRef.current = new Ctx();
    }
    audioRef.current.resume();
    setSoundOn(true);
    chime();
  }

  /* Keep a counter tablet awake while the board is open. */
  useEffect(() => {
    let sentinel = null;
    let cancelled = false;

    async function acquire() {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          sentinel = await navigator.wakeLock.request('screen');
          if (cancelled) sentinel.release();
        }
      } catch {
        /* not supported or denied — the board still works */
      }
    }

    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', acquire);
      sentinel?.release().catch(() => {});
    };
  }, []);

  /* Poll for tickets. Simple and robust — survives flaky café wifi. */
  useEffect(() => {
    let stopped = false;

    async function tick() {
      try {
        const res = await fetch('/api/orders', { cache: 'no-store' });
        if (res.status === 401) {
          router.refresh();
          return;
        }
        if (!res.ok) throw new Error('bad response');

        const data = await res.json();
        if (stopped) return;

        const arrived = data.active.filter((order) => !knownIds.current.has(order.id));
        if (arrived.length > 0 && soundOn) chime();
        knownIds.current = new Set(data.active.map((order) => order.id));

        setActive(data.active);
        setRecent(data.recent);
        setConnected(true);
      } catch {
        if (!stopped) setConnected(false);
      }
    }

    const timer = setInterval(tick, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [router, soundOn, chime]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 20000);
    return () => clearInterval(timer);
  }, []);

  async function move(orderId, status) {
    // Update immediately so a tap feels instant; the next poll reconciles.
    setActive((prev) =>
      status === 'served' || status === 'cancelled'
        ? prev.filter((order) => order.id !== orderId)
        : prev.map((order) => (order.id === orderId ? { ...order, status } : order))
    );

    try {
      await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      setConnected(false);
    }
  }

  async function signOut() {
    await fetch('/api/staff/session', { method: 'DELETE' });
    router.refresh();
  }

  return (
    <div className="staff" style={{ '--accent': restaurant.accent }}>
      <header className="staff-bar">
        <div className="wrap spread">
          <div className="row">
            <strong style={{ fontSize: 17 }}>{restaurant.name}</strong>
            <span className="pill">
              <span className="live-dot" />
              {connected ? L.live : L.reconnecting}
            </span>
          </div>

          <div className="row">
            {!soundOn && (
              <button type="button" className="btn sm" onClick={enableSound}>
                {L.turnOnSound}
              </button>
            )}
            <button type="button" className="btn ghost sm" onClick={() => setShowHistory((v) => !v)}>
              {showHistory ? L.hideServed : L.showServed}
            </button>
            <button type="button" className="btn ghost sm" onClick={signOut}>
              {L.signOut}
            </button>
          </div>
        </div>
      </header>

      <div className="wrap">
        {!soundOn && (
          <p className="tiny muted" style={{ marginTop: 14, marginBottom: 0 }}>
            {L.soundHint}
          </p>
        )}

        <div className="board">
          {COLUMNS.map((column) => {
            const tickets = active.filter((order) => order.status === column.status);
            return (
              <section key={column.status}>
                <div className="col-head">
                  {column.label}
                  <span className="col-count">{tickets.length}</span>
                </div>

                {tickets.length === 0 && <div className="empty">{L.emptyColumn}</div>}

                {tickets.map((order) => (
                  <article key={order.id} className={`card ticket is-${order.status}`}>
                    <div className="spread">
                      <span className="ticket-table">{order.table_label}</span>
                      <span className="tiny muted">#{order.id}</span>
                    </div>
                    <div className="tiny muted">{elapsed(order.created_at, now, L)}</div>

                    <div className="ticket-lines">
                      {order.items.map((line, index) => (
                        <div className="ticket-line" key={`${order.id}-${index}`}>
                          <span className="ticket-qty">{line.qty}×</span>
                          <span className="grow">{line.name}</span>
                        </div>
                      ))}
                    </div>

                    {order.note && <div className="ticket-note">📝 {order.note}</div>}

                    <div className="ticket-foot">
                      <strong className="grow">{money(order.total)}</strong>
                      <button
                        type="button"
                        className="btn ghost sm"
                        onClick={() => move(order.id, 'cancelled')}
                        aria-label={L.cancelOrder(order.id)}
                      >
                        ✕
                      </button>
                      <button type="button" className="btn sm" onClick={() => move(order.id, column.next)}>
                        {column.action}
                      </button>
                    </div>
                  </article>
                ))}
              </section>
            );
          })}
        </div>

        {showHistory && (
          <section style={{ paddingBottom: 60 }}>
            <div className="col-head">{L.servedToday}</div>
            <div className="card" style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>{L.thTable}</th>
                    <th>{L.thItems}</th>
                    <th>{L.thTotal}</th>
                    <th>{L.thStatus}</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.length === 0 && (
                    <tr>
                      <td colSpan={5} className="muted">
                        {L.noCompleted}
                      </td>
                    </tr>
                  )}
                  {recent.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.table_label}</td>
                      <td className="muted tiny">
                        {order.items.map((line) => `${line.qty}× ${line.name}`).join(', ')}
                      </td>
                      <td>{money(order.total)}</td>
                      <td>{order.status === 'cancelled' ? L.stCancelled : L.stServed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
