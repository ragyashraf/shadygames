'use client';

import { useState } from 'react';

export function PortalButton() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function openPortal() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch('/api/portal', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Portal failed');
      window.location.href = body.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Portal failed');
      setBusy(false);
    }
  }

  return (
    <div>
      <button type="button" className="gold-btn" onClick={openPortal} disabled={busy}>
        {busy ? 'Opening…' : 'Manage billing'}
      </button>
      {error ? <p className="form-msg">{error}</p> : null}
    </div>
  );
}
