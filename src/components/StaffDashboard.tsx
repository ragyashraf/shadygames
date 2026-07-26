'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLang } from '@/components/LangProvider';
import { STAFF_COPY } from '@/lib/i18n/staff-copy';

export type StaffProduct = {
  id: string;
  sku: string;
  name: string;
  kind: string;
  price_usd: number;
  paddle_price_id_month: string | null;
  paddle_price_id_year: string | null;
  live: boolean;
  stock: number | null;
  sort_order?: number | null;
};

export type StaffCode = {
  id: string;
  code: string;
  percent: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  paddle_discount_id: string | null;
  expires_at?: string | null;
};

export type StaffKey = {
  id: string;
  key_value: string;
  product_sku: string;
  status: string;
  assigned_to: string | null;
  transaction_id: string | null;
};

export type StaffTx = {
  transaction_id: string;
  customer_id: string | null;
  status: string;
  total_cents: number | null;
  currency: string | null;
  price_id: string | null;
  created_at?: string | null;
};

type Props = {
  ownerName: string;
  products: StaffProduct[];
  codes: StaffCode[];
  keys: StaffKey[];
  transactions: StaffTx[];
  activeSubs: number;
};

function maskKey(value: string) {
  if (value.length <= 10) return value;
  return `${value.slice(0, 7)}…${value.slice(-4)}`;
}

function kindLabel(kind: string, t: (typeof STAFF_COPY)['en']) {
  if (kind === 'key') return t.typeKey;
  if (kind === 'game') return t.typeGame;
  return t.typeSub;
}

function money(cents: number | null, currency: string | null) {
  if (cents == null) return '—';
  return `$${(cents / 100).toFixed(0)}${currency && currency !== 'USD' ? ` ${currency}` : ''}`;
}

export function StaffDashboard({
  ownerName,
  products: initialProducts,
  codes: initialCodes,
  keys: initialKeys,
  transactions: initialTx,
  activeSubs,
}: Props) {
  const { lang, toggleLang, ar } = useLang();
  const t = STAFF_COPY[lang === 'ar' ? 'ar' : 'en'];
  const [section, setSection] = useState(0);
  const [products, setProducts] = useState(initialProducts);
  const [codes, setCodes] = useState(initialCodes);
  const [keys, setKeys] = useState(initialKeys);
  const [transactions] = useState(initialTx);
  const [txFilter, setTxFilter] = useState(0);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const [npName, setNpName] = useState('');
  const [npKind, setNpKind] = useState('sub');
  const [npPrice, setNpPrice] = useState('');
  const [npStock, setNpStock] = useState('');

  const [ncCode, setNcCode] = useState('');
  const [ncPercent, setNcPercent] = useState('');
  const [ncMax, setNcMax] = useState('');
  const [ncExpires, setNcExpires] = useState('');

  const [nkProduct, setNkProduct] = useState(initialProducts[0]?.sku || 'GTA-ACCESS');
  const [nkText, setNkText] = useState('');
  const [autoDeliver, setAutoDeliver] = useState(true);
  const [rules, setRules] = useState([true, true, false]);
  const [toggles, setToggles] = useState([true, true, true, true, false]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('shady-staff-settings');
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        autoDeliver?: boolean;
        rules?: boolean[];
        toggles?: boolean[];
      };
      if (typeof parsed.autoDeliver === 'boolean') setAutoDeliver(parsed.autoDeliver);
      if (Array.isArray(parsed.rules) && parsed.rules.length === 3) setRules(parsed.rules);
      if (Array.isArray(parsed.toggles) && parsed.toggles.length === 5) setToggles(parsed.toggles);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        'shady-staff-settings',
        JSON.stringify({ autoDeliver, rules, toggles })
      );
    } catch {
      /* ignore */
    }
  }, [autoDeliver, rules, toggles]);

  const availableKeys = keys.filter((k) => k.status === 'available').length;
  const pendingTx = transactions.filter((x) =>
    ['pending', 'ready', 'draft'].includes(x.status)
  ).length;
  const paidCents = transactions
    .filter((x) => ['paid', 'completed', 'billed'].includes(x.status))
    .reduce((sum, x) => sum + (x.total_cents || 0), 0);

  const kpiValues = [
    `$${(paidCents / 100).toFixed(0)}`,
    String(activeSubs),
    String(availableKeys),
    String(pendingTx),
  ];

  const keyHealth = useMemo(() => {
    const bySku = new Map<string, number>();
    for (const k of keys) {
      if (k.status !== 'available') continue;
      bySku.set(k.product_sku, (bySku.get(k.product_sku) || 0) + 1);
    }
    const rows = products.slice(0, 3).map((p) => ({
      name: p.name,
      count: bySku.get(p.sku) || 0,
    }));
    if (rows.length === 0) {
      return [...bySku.entries()].slice(0, 3).map(([name, count]) => ({ name, count }));
    }
    return rows;
  }, [keys, products]);

  const maxKeyHealth = Math.max(1, ...keyHealth.map((h) => h.count));

  const chart = useMemo(() => {
    const heights = [42, 58, 51, 74, 66, 88, 70];
    return t.days.map((day, i) => ({ day, height: heights[i] }));
  }, [t.days]);

  const activity = useMemo(() => {
    const fromTx = transactions.slice(0, 5).map((x) => ({
      text: `${x.status} · ${x.transaction_id.slice(0, 12)}…`,
      time: x.created_at ? new Date(x.created_at).toLocaleString() : '—',
      tone: x.status.includes('refund') ? 'warn' : 'ok',
    }));
    if (fromTx.length) return fromTx;
    return keys.slice(0, 5).map((k) => ({
      text: `${k.status} · ${k.product_sku}`,
      time: maskKey(k.key_value),
      tone: k.status === 'available' ? 'ok' : 'muted',
    }));
  }, [transactions, keys]);

  const filteredTx = transactions.filter((x) => {
    if (txFilter === 1) return ['paid', 'completed', 'billed'].includes(x.status);
    if (txFilter === 2) return ['pending', 'ready', 'draft'].includes(x.status);
    if (txFilter === 3) return x.status.includes('refund');
    return true;
  });

  async function addProduct() {
    if (!npName || !npPrice || busy) return;
    setBusy(true);
    setMessage('');
    const supabase = createClient();
    const sku =
      npName
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 16) || `SKU-${Date.now()}`;
    const row = {
      sku,
      name: npName,
      kind: npKind,
      price_usd: Number(npPrice) || 0,
      stock: npStock ? parseInt(npStock, 10) : null,
      live: true,
      sort_order: products.length + 1,
    };
    const { data, error } = await supabase.from('products').insert(row).select('*').single();
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProducts((prev) => [...prev, data as StaffProduct]);
    setNpName('');
    setNpPrice('');
    setNpStock('');
    setMessage(t.saved);
  }

  async function toggleProductLive(p: StaffProduct) {
    const supabase = createClient();
    const next = !p.live;
    const { error } = await supabase.from('products').update({ live: next }).eq('id', p.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, live: next } : x)));
  }

  async function updateProductPrice(p: StaffProduct, price: string) {
    const value = Number(price);
    if (Number.isNaN(value)) return;
    setProducts((prev) =>
      prev.map((x) => (x.id === p.id ? { ...x, price_usd: value } : x))
    );
  }

  async function saveProductPrice(p: StaffProduct) {
    const supabase = createClient();
    const { error } = await supabase
      .from('products')
      .update({ price_usd: p.price_usd })
      .eq('id', p.id);
    if (error) setMessage(error.message);
  }

  async function removeProduct(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function addCode() {
    if (!ncCode || !ncPercent || busy) return;
    setBusy(true);
    const supabase = createClient();
    const row = {
      code: ncCode.toUpperCase(),
      percent: Number(ncPercent) || 0,
      max_uses: ncMax ? parseInt(ncMax, 10) : null,
      used_count: 0,
      active: true,
      expires_at: ncExpires || null,
    };
    const { data, error } = await supabase.from('discount_codes').insert(row).select('*').single();
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setCodes((prev) => [...prev, data as StaffCode]);
    setNcCode('');
    setNcPercent('');
    setNcMax('');
    setNcExpires('');
    setMessage(t.saved);
  }

  async function toggleCode(c: StaffCode) {
    const supabase = createClient();
    const next = !c.active;
    const { error } = await supabase
      .from('discount_codes')
      .update({ active: next })
      .eq('id', c.id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setCodes((prev) => prev.map((x) => (x.id === c.id ? { ...x, active: next } : x)));
  }

  async function removeCode(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('discount_codes').delete().eq('id', id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setCodes((prev) => prev.filter((c) => c.id !== id));
  }

  async function importKeys() {
    const lines = nkText
      .split('\n')
      .map((x) => x.trim())
      .filter(Boolean);
    const existing = new Set(keys.map((k) => k.key_value));
    const fresh = lines.filter((v, i) => !existing.has(v) && lines.indexOf(v) === i);
    if (!fresh.length) {
      setMessage(t.keyEmpty);
      return;
    }
    setBusy(true);
    const supabase = createClient();
    const rows = fresh.map((key_value) => ({
      key_value,
      product_sku: nkProduct,
      status: 'available',
    }));
    const { data, error } = await supabase.from('access_keys').insert(rows).select('*');
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setKeys((prev) => [...prev, ...((data as StaffKey[]) || [])]);
    setNkText('');
    setMessage(t.keyImported.replace('{n}', String(fresh.length)));
  }

  async function removeKey(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('access_keys').delete().eq('id', id);
    if (error) {
      setMessage(error.message);
      return;
    }
    setKeys((prev) => prev.filter((k) => k.id !== id));
  }

  const ownerInitial = (ownerName || 'S').charAt(0).toUpperCase();

  return (
    <div className={`staff-shell${ar ? ' rtl' : ''}`}>
      <aside className="staff-aside">
        <Link href="/" className="staff-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/shady-logo.webp" alt="Shady" width={40} height={40} />
          <div>
            <div className="staff-brand-name">SHADY</div>
            <div className="staff-brand-sub">{t.staffPanel}</div>
          </div>
        </Link>

        <nav className="staff-nav">
          {t.nav.map((label, i) => {
            const counts = [
              null,
              products.length,
              codes.length,
              availableKeys,
              transactions.length,
              null,
            ];
            return (
              <button
                key={label}
                type="button"
                className={section === i ? 'active' : ''}
                onClick={() => setSection(i)}
              >
                <span>{label}</span>
                {counts[i] != null ? <span className="staff-nav-count">{counts[i]}</span> : null}
              </button>
            );
          })}
        </nav>

        <div className="staff-aside-foot">
          <div className="staff-online">
            <span className="staff-online-dot" />
            <div>
              <div className="staff-online-title">{t.serverOnline}</div>
              <div className="staff-online-sub">186 / 220</div>
            </div>
          </div>
          <button type="button" className="staff-aside-btn" onClick={toggleLang}>
            {ar ? 'EN' : 'العربية'}
          </button>
          <Link href="/" className="staff-aside-link">
            {t.viewSite}
          </Link>
        </div>
      </aside>

      <main className="staff-main">
        <header className="staff-top">
          <div>
            <h1>{t.titles[section]}</h1>
            <p>{t.subs[section]}</p>
          </div>
          <div className="staff-owner">
            <div className="staff-owner-av">{ownerInitial}</div>
            <div>
              <div className="staff-owner-name">{ownerName || 'Shady'}</div>
              <div className="staff-owner-role">{t.owner}</div>
            </div>
          </div>
        </header>

        <div className="staff-body">
          {message ? <p className="staff-flash">{message}</p> : null}

          {section === 0 ? (
            <div className="staff-rise staff-stack">
              <div className="staff-kpi-grid">
                {t.kpis.map((label, i) => (
                  <div key={label} className="staff-card">
                    <div className="staff-kpi-label">{label}</div>
                    <div className="staff-kpi-value">{kpiValues[i]}</div>
                  </div>
                ))}
              </div>

              <div className="staff-overview-split">
                <div className="staff-card">
                  <div className="staff-card-head">
                    <h2>{t.revenue7}</h2>
                    <span>${(paidCents / 100).toFixed(0)}</span>
                  </div>
                  <div className="staff-chart">
                    {chart.map((c) => (
                      <div key={c.day} className="staff-chart-col">
                        <div className="staff-chart-bar" style={{ height: `${c.height}%` }} />
                        <span>{c.day}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="staff-card">
                  <h2>{t.keyHealth}</h2>
                  <div className="staff-health">
                    {keyHealth.length === 0 ? (
                      <p className="staff-empty">{t.noRows}</p>
                    ) : (
                      keyHealth.map((h) => (
                        <div key={h.name}>
                          <div className="staff-health-row">
                            <span>{h.name}</span>
                            <span>{h.count}</span>
                          </div>
                          <div className="staff-health-track">
                            <div
                              className="staff-health-fill"
                              style={{ width: `${(h.count / maxKeyHealth) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="staff-card">
                <h2>{t.activity}</h2>
                <div className="staff-activity">
                  {activity.length === 0 ? (
                    <p className="staff-empty">{t.noRows}</p>
                  ) : (
                    activity.map((a) => (
                      <div key={`${a.text}-${a.time}`} className="staff-activity-row">
                        <span className={`staff-dot ${a.tone}`} />
                        <span className="staff-activity-text">{a.text}</span>
                        <span className="staff-activity-time">{a.time}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {section === 1 ? (
            <div className="staff-rise staff-stack">
              <div className="staff-form-card staff-product-form">
                <label>
                  <span>{t.productName}</span>
                  <input
                    value={npName}
                    onChange={(e) => setNpName(e.target.value)}
                    placeholder={t.productNamePh}
                  />
                </label>
                <label>
                  <span>{t.type}</span>
                  <select value={npKind} onChange={(e) => setNpKind(e.target.value)}>
                    <option value="sub">{t.typeSub}</option>
                    <option value="key">{t.typeKey}</option>
                    <option value="game">{t.typeGame}</option>
                  </select>
                </label>
                <label>
                  <span>{t.price}</span>
                  <input
                    value={npPrice}
                    onChange={(e) => setNpPrice(e.target.value)}
                    placeholder="10"
                  />
                </label>
                <label>
                  <span>{t.stock}</span>
                  <input
                    value={npStock}
                    onChange={(e) => setNpStock(e.target.value)}
                    placeholder="∞"
                  />
                </label>
                <button type="button" className="staff-primary" onClick={addProduct} disabled={busy}>
                  {t.addProduct}
                </button>
              </div>

              <div className="staff-table-card">
                <div className="staff-table-head staff-cols-products">
                  {t.productCols.map((c) => (
                    <div key={c || 'actions'}>{c}</div>
                  ))}
                </div>
                {products.length === 0 ? (
                  <p className="staff-empty pad">{t.noRows}</p>
                ) : (
                  products.map((p) => (
                    <div key={p.id} className="staff-table-row staff-cols-products">
                      <div>
                        <div className="staff-row-title">{p.name}</div>
                        <div className="staff-row-sub">{p.sku}</div>
                      </div>
                      <div>{kindLabel(p.kind, t)}</div>
                      <div className="staff-price-edit">
                        <span>$</span>
                        <input
                          value={String(p.price_usd)}
                          onChange={(e) => updateProductPrice(p, e.target.value)}
                          onBlur={() => saveProductPrice(p)}
                        />
                      </div>
                      <div>
                        {p.stock == null ? t.unlimitedStock : p.stock}
                      </div>
                      <button
                        type="button"
                        className={`staff-chip ${p.live ? 'on' : ''}`}
                        onClick={() => toggleProductLive(p)}
                      >
                        {p.live ? t.live : t.hidden}
                      </button>
                      <button
                        type="button"
                        className="staff-danger"
                        onClick={() => removeProduct(p.id)}
                      >
                        {t.remove}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {section === 2 ? (
            <div className="staff-rise staff-stack">
              <div className="staff-form-card staff-code-form">
                <label>
                  <span>{t.code}</span>
                  <input
                    value={ncCode}
                    onChange={(e) => setNcCode(e.target.value)}
                    placeholder="SHADY10"
                  />
                </label>
                <label>
                  <span>{t.percentOff}</span>
                  <input
                    value={ncPercent}
                    onChange={(e) => setNcPercent(e.target.value)}
                    placeholder="10"
                  />
                </label>
                <label>
                  <span>{t.maxUses}</span>
                  <input
                    value={ncMax}
                    onChange={(e) => setNcMax(e.target.value)}
                    placeholder="100"
                  />
                </label>
                <label>
                  <span>{t.expires}</span>
                  <input
                    value={ncExpires}
                    onChange={(e) => setNcExpires(e.target.value)}
                    placeholder="2026-12-31"
                  />
                </label>
                <button type="button" className="staff-primary" onClick={addCode} disabled={busy}>
                  {t.addCode}
                </button>
              </div>

              <div className="staff-table-card">
                <div className="staff-table-head staff-cols-codes">
                  {t.codeCols.map((c) => (
                    <div key={c || 'actions'}>{c}</div>
                  ))}
                </div>
                {codes.length === 0 ? (
                  <p className="staff-empty pad">{t.noRows}</p>
                ) : (
                  codes.map((c) => (
                    <div key={c.id} className="staff-table-row staff-cols-codes">
                      <div className="staff-code">{c.code}</div>
                      <div>{c.percent}%</div>
                      <div>
                        {c.used_count}
                        {c.max_uses != null ? ` / ${c.max_uses}` : ''}
                      </div>
                      <div>{c.expires_at || '—'}</div>
                      <button
                        type="button"
                        className={`staff-chip ${c.active ? 'on' : ''}`}
                        onClick={() => toggleCode(c)}
                      >
                        {c.active ? t.active : t.paused}
                      </button>
                      <button
                        type="button"
                        className="staff-danger"
                        onClick={() => removeCode(c.id)}
                      >
                        {t.remove}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {section === 3 ? (
            <div className="staff-rise staff-stack">
              <div className="staff-keys-split">
                <div className="staff-card">
                  <h2>{t.addKeys}</h2>
                  <p className="staff-hint">{t.addKeysHint}</p>
                  <label className="staff-block-label">
                    <span>{t.forProduct}</span>
                    <select value={nkProduct} onChange={(e) => setNkProduct(e.target.value)}>
                      {products.map((p) => (
                        <option key={p.id} value={p.sku}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="staff-block-label">
                    <span>{t.pasteKeys}</span>
                    <textarea
                      rows={6}
                      value={nkText}
                      onChange={(e) => setNkText(e.target.value)}
                      placeholder={t.pasteKeysPh}
                    />
                  </label>
                  <div className="staff-keys-actions">
                    <label className="staff-check">
                      <input
                        type="checkbox"
                        checked={autoDeliver}
                        onChange={() => setAutoDeliver((v) => !v)}
                      />
                      <span>{t.autoDeliver}</span>
                    </label>
                    <button
                      type="button"
                      className="staff-primary"
                      onClick={importKeys}
                      disabled={busy}
                    >
                      {t.importKeys}
                    </button>
                  </div>
                </div>

                <div className="staff-card">
                  <h2>{t.deliveryRules}</h2>
                  <div className="staff-toggle-list">
                    {t.rules.map((r, i) => (
                      <div key={r[0]} className="staff-toggle-row">
                        <div>
                          <div className="staff-row-title">{r[0]}</div>
                          <div className="staff-hint">{r[1]}</div>
                        </div>
                        <button
                          type="button"
                          className={`staff-chip ${rules[i] ? 'on' : ''}`}
                          onClick={() =>
                            setRules((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                          }
                        >
                          {rules[i] ? t.on : t.off}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="staff-note">{t.deliveryNote}</div>
                </div>
              </div>

              <div className="staff-table-card">
                <div className="staff-table-head staff-cols-keys">
                  {t.keyCols.map((c) => (
                    <div key={c || 'actions'}>{c}</div>
                  ))}
                </div>
                {keys.length === 0 ? (
                  <p className="staff-empty pad">{t.noRows}</p>
                ) : (
                  keys.map((k) => (
                    <div key={k.id} className="staff-table-row staff-cols-keys">
                      <div className="staff-mono">{maskKey(k.key_value)}</div>
                      <div>{k.product_sku}</div>
                      <div>
                        {t.keyStatus[k.status as keyof typeof t.keyStatus] || k.status}
                      </div>
                      <div>{k.assigned_to || '—'}</div>
                      <button
                        type="button"
                        className="staff-danger"
                        onClick={() => removeKey(k.id)}
                      >
                        {t.remove}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {section === 4 ? (
            <div className="staff-rise staff-stack">
              <div className="staff-tx-bar">
                <div className="staff-tx-filters">
                  {t.txFilters.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      className={txFilter === i ? 'active' : ''}
                      onClick={() => setTxFilter(i)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <div className="staff-tx-summary">
                  {t.txSummary
                    .replace('{n}', String(filteredTx.length))
                    .replace('{sum}', `$${(paidCents / 100).toFixed(0)}`)}
                </div>
              </div>

              <div className="staff-table-card">
                <div className="staff-table-head staff-cols-tx">
                  {t.txCols.map((c) => (
                    <div key={c || 'actions'}>{c}</div>
                  ))}
                </div>
                {filteredTx.length === 0 ? (
                  <p className="staff-empty pad">{t.noRows}</p>
                ) : (
                  filteredTx.map((x) => (
                    <div key={x.transaction_id} className="staff-table-row staff-cols-tx">
                      <div className="staff-mono">{x.transaction_id.slice(0, 10)}…</div>
                      <div className="staff-mono">{x.customer_id?.slice(0, 12) || '—'}</div>
                      <div className="staff-mono">{x.price_id?.slice(0, 14) || '—'}</div>
                      <div className="staff-amount">{money(x.total_cents, x.currency)}</div>
                      <div>
                        {t.txStatus[x.status as keyof typeof t.txStatus] || x.status}
                      </div>
                      <div>
                        {x.created_at ? new Date(x.created_at).toLocaleString() : '—'}
                      </div>
                      <button type="button" className="staff-danger" disabled>
                        {x.status.includes('refund')
                          ? t.resend
                          : ['pending', 'ready'].includes(x.status)
                            ? t.approve
                            : t.refund}
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}

          {section === 5 ? (
            <div className="staff-rise staff-settings-grid">
              <div className="staff-card">
                <h2>{t.storeSettings}</h2>
                <div className="staff-toggle-list">
                  {t.toggles.map((row, i) => (
                    <div key={row[0]} className="staff-toggle-row">
                      <div>
                        <div className="staff-row-title">{row[0]}</div>
                        <div className="staff-hint">{row[1]}</div>
                      </div>
                      <button
                        type="button"
                        className={`staff-chip ${toggles[i] ? 'on' : ''}`}
                        onClick={() =>
                          setToggles((prev) => prev.map((v, idx) => (idx === i ? !v : v)))
                        }
                      >
                        {toggles[i] ? t.on : t.off}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="staff-card">
                <h2>{t.staffAccess}</h2>
                <div className="staff-members">
                  {t.staff.map((m) => (
                    <div key={m[0]} className="staff-member">
                      <div className="staff-member-av">{m[0].charAt(0)}</div>
                      <div className="staff-member-meta">
                        <div className="staff-row-title">{m[0]}</div>
                        <div className="staff-hint">{m[1]}</div>
                      </div>
                      <div className="staff-member-tag">{m[2]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
