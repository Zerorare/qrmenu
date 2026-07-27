'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PinLogin({ title, subtitle, dark = false }) {
  const router = useRouter();
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/staff/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Could not sign in');
      }
      router.refresh();
    } catch (err) {
      setError(err.message);
      setPin('');
      setBusy(false);
    }
  }

  return (
    <div className={dark ? 'staff login-shell' : 'login-shell'}>
      <form className="card login-card" onSubmit={submit}>
        <h1 style={{ fontSize: 22, margin: '0 0 6px' }}>{title}</h1>
        <p className="muted tiny" style={{ marginTop: 0, marginBottom: 22 }}>
          {subtitle}
        </p>

        <label className="lbl" htmlFor="pin">
          Staff PIN
        </label>
        <input
          id="pin"
          className="field pin-input"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={8}
          value={pin}
          onChange={(event) => setPin(event.target.value.replace(/\D/g, ''))}
        />

        {error && <p className="err">{error}</p>}

        <button className="btn block" style={{ marginTop: 18 }} disabled={busy || pin.length < 4}>
          {busy ? 'Checking…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
