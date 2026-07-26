'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useLang } from '@/components/LangProvider';
import { STAFF_COPY } from '@/lib/i18n/staff-copy';
import { getTiers } from '@/lib/tiers';

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
  description?: string | null;
  image_urls?: string[] | null;
  video_urls?: string[] | null;
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

export type StaffMember = {
  id: string;
  display_name: string | null;
  email: string | null;
  is_staff: boolean;
};

export type StoreSettings = {
  store_open: boolean;
  accept_crypto: boolean;
  discounts_enabled: boolean;
  auto_whitelist: boolean;
  arabic_default: boolean;
  auto_deliver: boolean;
  rule_instant_delivery: boolean;
  rule_low_stock_alert: boolean;
  rule_fraud_hold: boolean;
  server_slots: number;
};

type Props = {
  ownerName: string;
  ownerEmail: string;
  products: StaffProduct[];
  codes: StaffCode[];
  keys: StaffKey[];
  transactions: StaffTx[];
  activeSubs: number;
  staffMembers: StaffMember[];
  settings: StoreSettings;
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
  const amount = (cents / 100).toFixed(cents % 100 === 0 ? 0 : 2);
  return `$${amount}${currency && currency !== 'USD' ? ` ${currency}` : ''}`;
}

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function labelForPrice(priceId: string | null, t: (typeof STAFF_COPY)['en']) {
  if (!priceId) return '—';
  try {
    const tiers = getTiers();
    const idx = tiers.findIndex(
      (tier) => tier.priceId.month === priceId || tier.priceId.year === priceId
    );
    if (idx >= 0) {
      const cycle =
        tiers[idx].priceId.year === priceId
          ? t.perYearLabel
          : t.perMonthLabel;
      return `${t.planShort[idx]} · ${cycle}`;
    }
  } catch {
    /* env missing in edge cases */
  }
  return priceId.slice(0, 18);
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_open: true,
  accept_crypto: true,
  discounts_enabled: true,
  auto_whitelist: true,
  arabic_default: false,
  auto_deliver: true,
  rule_instant_delivery: true,
  rule_low_stock_alert: true,
  rule_fraud_hold: false,
  server_slots: 220,
};

export function StaffDashboard({
  ownerName,
  ownerEmail,
  products: initialProducts,
  codes: initialCodes,
  keys: initialKeys,
  transactions: initialTx,
  activeSubs,
  staffMembers,
  settings: initialSettings,
}: Props) {
  const { lang, toggleLang, ar } = useLang();
  const t = STAFF_COPY[lang === 'ar' ? 'ar' : 'en'];
  const [section, setSection] = useState(0);
  const [products, setProducts] = useState(initialProducts);
  const [codes, setCodes] = useState(initialCodes);
  const [keys, setKeys] = useState(initialKeys);
  const [transactions, setTransactions] = useState(initialTx);
  const [settings, setSettings] = useState(initialSettings || DEFAULT_SETTINGS);
  const [txFilter, setTxFilter] = useState(0);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const [npName, setNpName] = useState('');
  const [npKind, setNpKind] = useState('sub');
  const [npPrice, setNpPrice] = useState('');
  const [npStock, setNpStock] = useState('');
  const [npDesc, setNpDesc] = useState('');
  const [npImages, setNpImages] = useState('');
  const [npVideos, setNpVideos] = useState('');
  const [npPaddlePrice, setNpPaddlePrice] = useState('');
  const [npEditId, setNpEditId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const [ncCode, setNcCode] = useState('');
  const [ncPercent, setNcPercent] = useState('');
  const [ncMax, setNcMax] = useState('');
  const [ncExpires, setNcExpires] = useState('');

  const [nkProduct, setNkProduct] = useState(initialProducts[0]?.sku || '');
  const [nkText, setNkText] = useState('');

  useEffect(() => {
    if (!nkProduct && products[0]?.sku) setNkProduct(products[0].sku);
  }, [products, nkProduct]);

  const availableKeys = keys.filter((k) => k.status === 'available').length;
  const pendingTx = transactions.filter((x) =>
    ['pending', 'ready', 'draft'].includes(x.status)
  ).length;

  const paidTx = transactions.filter((x) =>
    ['paid', 'completed', 'billed'].includes(x.status)
  );

  const todayKey = dayKey(new Date());
  const revenueTodayCents = paidTx
    .filter((x) => x.created_at && dayKey(new Date(x.created_at)) === todayKey)
    .reduce((sum, x) => sum + (x.total_cents || 0), 0);

  const paidCents = paidTx.reduce((sum, x) => sum + (x.total_cents || 0), 0);

  const kpiValues = [
    money(revenueTodayCents, 'USD'),
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
    return products
      .filter((p) => p.kind === 'key' || p.kind === 'sub')
      .map((p) => ({
      name: p.name,
      sku: p.sku,
      count: bySku.get(p.sku) || 0,
    }));
  }, [keys, products]);

  const maxKeyHealth = Math.max(1, ...keyHealth.map((h) => h.count), 1);

  const chart = useMemo(() => {
    const days: { key: string; label: string; cents: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push({
        key: dayKey(d),
        label: t.days[d.getDay() === 0 ? 6 : d.getDay() - 1],
        cents: 0,
      });
    }
    for (const x of paidTx) {
      if (!x.created_at) continue;
      const key = dayKey(new Date(x.created_at));
      const row = days.find((d) => d.key === key);
      if (row) row.cents += x.total_cents || 0;
    }
    const max = Math.max(1, ...days.map((d) => d.cents));
    return days.map((d) => ({
      day: d.label,
      cents: d.cents,
      height: d.cents === 0 ? 4 : Math.max(8, Math.round((d.cents / max) * 100)),
    }));
  }, [paidTx, t.days]);

  const activity = useMemo(() => {
    const items = [
      ...transactions.slice(0, 8).map((x) => ({
        id: `tx-${x.transaction_id}`,
        text: `${x.status} · ${labelForPrice(x.price_id, t)} · ${money(x.total_cents, x.currency)}`,
        time: x.created_at ? new Date(x.created_at).toLocaleString() : '—',
        tone: String(x.status).includes('refund')
          ? 'warn'
          : ['paid', 'completed', 'billed'].includes(x.status)
            ? 'ok'
            : 'muted',
      })),
      ...keys
        .filter((k) => k.status !== 'available')
        .slice(0, 5)
        .map((k) => ({
          id: `key-${k.id}`,
          text: `${k.status} · ${k.product_sku} · ${maskKey(k.key_value)}`,
          time: k.assigned_to || '—',
          tone: k.status === 'delivered' ? 'ok' : 'muted',
        })),
    ];
    return items.slice(0, 10);
  }, [transactions, keys, t]);

  const filteredTx = transactions.filter((x) => {
    if (txFilter === 1) return ['paid', 'completed', 'billed'].includes(x.status);
    if (txFilter === 2) return ['pending', 'ready', 'draft'].includes(x.status);
    if (txFilter === 3) return String(x.status).includes('refund');
    return true;
  });

  async function saveSettings(patch: Partial<StoreSettings>) {
    const next = { ...settings, ...patch, updated_at: new Date().toISOString() };
    setSettings((prev) => ({ ...prev, ...patch }));
    const supabase = createClient();
    const { error } = await supabase.from('store_settings').update(patch).eq('id', 1);
    if (error) {
      setMessage(error.message);
      setSettings(settings);
      return;
    }
    setMessage(t.saved);
  }

  function parseUrlLines(raw: string) {
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  function resetProductForm() {
    setNpName('');
    setNpKind('sub');
    setNpPrice('');
    setNpStock('');
    setNpDesc('');
    setNpImages('');
    setNpVideos('');
    setNpPaddlePrice('');
    setNpEditId(null);
  }

  function startEditProduct(p: StaffProduct) {
    setNpEditId(p.id);
    setNpName(p.name);
    setNpKind(p.kind);
    setNpPrice(String(p.price_usd));
    setNpStock(p.stock == null ? '' : String(p.stock));
    setNpDesc(p.description || '');
    setNpImages((p.image_urls || []).join('\n'));
    setNpVideos((p.video_urls || []).join('\n'));
    setNpPaddlePrice(p.paddle_price_id_month || '');
    setSection(1);
  }

  async function uploadProductMedia(files: FileList | null, kind: 'image' | 'video') {
    if (!files?.length) return;
    setUploading(true);
    setMessage('');
    try {
      const supabase = createClient();
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        const ext = file.name.split('.').pop() || (kind === 'image' ? 'jpg' : 'mp4');
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from('product-media').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });
        if (error) throw error;
        const { data } = supabase.storage.from('product-media').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
      if (kind === 'image') {
        setNpImages((prev) => [...parseUrlLines(prev), ...urls].join('\n'));
      } else {
        setNpVideos((prev) => [...parseUrlLines(prev), ...urls].join('\n'));
      }
      setMessage(t.mediaUploaded);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  }

  async function addProduct() {
    if (!npName || !npPrice || busy) return;
    setBusy(true);
    setMessage('');
    const supabase = createClient();
    const image_urls = npKind === 'game' ? parseUrlLines(npImages) : [];
    const video_urls = npKind === 'game' ? parseUrlLines(npVideos) : [];
    const description = npKind === 'game' ? npDesc.trim() || null : null;
    const paddle_price_id_month =
      npKind === 'game' ? npPaddlePrice.trim() || null : null;

    if (npEditId) {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: npName,
          kind: npKind,
          price_usd: Number(npPrice) || 0,
          stock: npStock ? parseInt(npStock, 10) : null,
          description,
          image_urls,
          video_urls,
          ...(npKind === 'game' ? { paddle_price_id_month } : {}),
        })
        .eq('id', npEditId)
        .select('*')
        .single();
      setBusy(false);
      if (error) {
        setMessage(error.message);
        return;
      }
      setProducts((prev) =>
        prev.map((p) => (p.id === npEditId ? (data as StaffProduct) : p))
      );
      resetProductForm();
      setMessage(t.saved);
      return;
    }

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
      description,
      image_urls,
      video_urls,
      paddle_price_id_month,
    };
    const { data, error } = await supabase.from('products').insert(row).select('*').single();
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setProducts((prev) => [...prev, data as StaffProduct]);
    resetProductForm();
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
    if (!nkProduct) {
      setMessage(t.noProductForKeys);
      return;
    }
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
    if (error) {
      setBusy(false);
      setMessage(error.message);
      return;
    }
    const nextKeys = [...keys, ...((data as StaffKey[]) || [])];
    setKeys(nextKeys);
    const available = nextKeys.filter(
      (k) => k.product_sku === nkProduct && k.status === 'available'
    ).length;
    await supabase.from('products').update({ stock: available }).eq('sku', nkProduct);
    setProducts((prev) =>
      prev.map((p) => (p.sku === nkProduct ? { ...p, stock: available } : p))
    );
    setBusy(false);
    setNkText('');
    setMessage(t.keyImported.replace('{n}', String(fresh.length)));
  }

  async function removeKey(id: string) {
    const supabase = createClient();
    const row = keys.find((k) => k.id === id);
    const { error } = await supabase.from('access_keys').delete().eq('id', id);
    if (error) {
      setMessage(error.message);
      return;
    }
    const nextKeys = keys.filter((k) => k.id !== id);
    setKeys(nextKeys);
    if (row) {
      const available = nextKeys.filter(
        (k) => k.product_sku === row.product_sku && k.status === 'available'
      ).length;
      await supabase.from('products').update({ stock: available }).eq('sku', row.product_sku);
      setProducts((prev) =>
        prev.map((p) => (p.sku === row.product_sku ? { ...p, stock: available } : p))
      );
    }
  }

  async function refundTx(transactionId: string) {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/staff/refund', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Refund failed');
      setTransactions((prev) =>
        prev.map((x) =>
          x.transaction_id === transactionId ? { ...x, status: 'refunded' } : x
        )
      );
      setMessage(t.refundedOk);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Refund failed');
    } finally {
      setBusy(false);
    }
  }

  async function resendKey(transactionId: string) {
    setBusy(true);
    setMessage('');
    try {
      const res = await fetch('/api/staff/resend-key', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ transactionId }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error || 'Resend failed');
      const supabase = createClient();
      const { data } = await supabase
        .from('access_keys')
        .select('id, key_value, product_sku, status, assigned_to, transaction_id')
        .order('created_at', { ascending: false })
        .limit(100);
      if (data) setKeys(data as StaffKey[]);
      setMessage(
        body.reused
          ? t.keyAlreadyAssigned.replace('{key}', body.key)
          : t.keyAssigned.replace('{key}', body.key)
      );
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Resend failed');
    } finally {
      setBusy(false);
    }
  }

  const ownerInitial = (ownerName || ownerEmail || 'S').charAt(0).toUpperCase();
  const settingToggles: { key: keyof StoreSettings; title: string; body: string }[] = [
    { key: 'store_open', title: t.toggles[0][0], body: t.toggles[0][1] },
    { key: 'accept_crypto', title: t.toggles[1][0], body: t.toggles[1][1] },
    { key: 'discounts_enabled', title: t.toggles[2][0], body: t.toggles[2][1] },
    { key: 'auto_whitelist', title: t.toggles[3][0], body: t.toggles[3][1] },
    { key: 'arabic_default', title: t.toggles[4][0], body: t.toggles[4][1] },
  ];
  const deliveryRules: { key: keyof StoreSettings; title: string; body: string }[] = [
    { key: 'rule_instant_delivery', title: t.rules[0][0], body: t.rules[0][1] },
    { key: 'rule_low_stock_alert', title: t.rules[1][0], body: t.rules[1][1] },
    { key: 'rule_fraud_hold', title: t.rules[2][0], body: t.rules[2][1] },
  ];

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
              <div className="staff-online-sub">
                {activeSubs} / {settings.server_slots} {t.activeSubsShort}
              </div>
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
              <div className="staff-owner-name">{ownerName || ownerEmail}</div>
              <div className="staff-owner-role">{t.owner}</div>
            </div>
          </div>
        </header>

        <div className="staff-body">
          {message ? <p className="staff-flash">{message}</p> : null}
          {!settings.store_open ? (
            <p className="staff-flash warn">{t.storeClosedBanner}</p>
          ) : null}

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
                    <span>{money(paidCents, 'USD')}</span>
                  </div>
                  <div className="staff-chart">
                    {chart.every((c) => c.cents === 0) ? (
                      <p className="staff-empty">{t.noRows}</p>
                    ) : (
                      chart.map((c) => (
                        <div key={`${c.day}-${c.cents}`} className="staff-chart-col" title={money(c.cents, 'USD')}>
                          <div
                            className={`staff-chart-bar${c.cents === 0 ? ' empty' : ''}`}
                            style={{ height: `${c.height}%` }}
                          />
                          <span>{c.day}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                <div className="staff-card">
                  <h2>{t.keyHealth}</h2>
                  <div className="staff-health">
                    {keyHealth.length === 0 ? (
                      <p className="staff-empty">{t.noRows}</p>
                    ) : (
                      keyHealth.map((h) => (
                        <div key={h.sku}>
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
                      <div key={a.id} className="staff-activity-row">
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
              <div
                className={`staff-form-card staff-product-form${npKind === 'game' ? ' is-game' : ''}`}
              >
                <label>
                  <span>{t.productName}</span>
                  <input value={npName} onChange={(e) => setNpName(e.target.value)} placeholder={t.productNamePh} />
                </label>
                <label>
                  <span>{t.type}</span>
                  <select
                    value={npKind}
                    onChange={(e) => setNpKind(e.target.value)}
                    disabled={Boolean(npEditId)}
                  >
                    <option value="sub">{t.typeSub}</option>
                    <option value="key">{t.typeKey}</option>
                    <option value="game">{t.typeGame}</option>
                  </select>
                </label>
                <label>
                  <span>{t.price}</span>
                  <input value={npPrice} onChange={(e) => setNpPrice(e.target.value)} placeholder="10" />
                </label>
                <label>
                  <span>{t.stock}</span>
                  <input value={npStock} onChange={(e) => setNpStock(e.target.value)} placeholder="∞" />
                </label>
                {npKind === 'game' ? (
                  <>
                    <label className="staff-span-2">
                      <span>{t.gameDesc}</span>
                      <textarea
                        value={npDesc}
                        onChange={(e) => setNpDesc(e.target.value)}
                        placeholder={t.gameDescPh}
                        rows={3}
                      />
                    </label>
                    <label className="staff-span-2">
                      <span>{t.gameImages}</span>
                      <textarea
                        value={npImages}
                        onChange={(e) => setNpImages(e.target.value)}
                        placeholder={t.gameUrlsPh}
                        rows={3}
                      />
                    </label>
                    <label>
                      <span>{t.uploadImages}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploading || busy}
                        onChange={(e) => {
                          void uploadProductMedia(e.target.files, 'image');
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <label>
                      <span>{t.uploadVideos}</span>
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        disabled={uploading || busy}
                        onChange={(e) => {
                          void uploadProductMedia(e.target.files, 'video');
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <label className="staff-span-2">
                      <span>{t.gameVideos}</span>
                      <textarea
                        value={npVideos}
                        onChange={(e) => setNpVideos(e.target.value)}
                        placeholder={t.gameVideoUrlsPh}
                        rows={2}
                      />
                    </label>
                    <label className="staff-span-2">
                      <span>{t.paddlePriceId}</span>
                      <input
                        value={npPaddlePrice}
                        onChange={(e) => setNpPaddlePrice(e.target.value)}
                        placeholder="pri_..."
                      />
                    </label>
                  </>
                ) : null}
                <div className="staff-form-actions">
                  <button
                    type="button"
                    className="staff-primary"
                    onClick={addProduct}
                    disabled={busy || uploading}
                  >
                    {npEditId ? t.saveProduct : t.addProduct}
                  </button>
                  {npEditId ? (
                    <button type="button" className="staff-aside-btn" onClick={resetProductForm}>
                      {t.cancelEdit}
                    </button>
                  ) : null}
                </div>
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
                      <div className="staff-product-cell">
                        {p.kind === 'game' && p.image_urls?.[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.image_urls[0]} alt="" className="staff-product-thumb" />
                        ) : null}
                        <div>
                          <div className="staff-row-title">{p.name}</div>
                          <div className="staff-row-sub">{p.sku}</div>
                          {p.kind === 'game' && p.description ? (
                            <div className="staff-row-sub clamp">{p.description}</div>
                          ) : null}
                        </div>
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
                      <div>{p.stock == null ? t.unlimitedStock : p.stock}</div>
                      <button
                        type="button"
                        className={`staff-chip ${p.live ? 'on' : ''}`}
                        onClick={() => toggleProductLive(p)}
                      >
                        {p.live ? t.live : t.hidden}
                      </button>
                      <div className="staff-row-actions">
                        <button type="button" className="staff-aside-btn" onClick={() => startEditProduct(p)}>
                          {t.edit}
                        </button>
                        <button type="button" className="staff-danger" onClick={() => removeProduct(p.id)}>
                          {t.remove}
                        </button>
                      </div>
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
                  <input value={ncCode} onChange={(e) => setNcCode(e.target.value)} placeholder="SHADY10" />
                </label>
                <label>
                  <span>{t.percentOff}</span>
                  <input value={ncPercent} onChange={(e) => setNcPercent(e.target.value)} placeholder="10" />
                </label>
                <label>
                  <span>{t.maxUses}</span>
                  <input value={ncMax} onChange={(e) => setNcMax(e.target.value)} placeholder="100" />
                </label>
                <label>
                  <span>{t.expires}</span>
                  <input value={ncExpires} onChange={(e) => setNcExpires(e.target.value)} placeholder="2026-12-31" />
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
                      <button type="button" className="staff-danger" onClick={() => removeCode(c.id)}>
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
                      {products.length === 0 ? <option value="">{t.noRows}</option> : null}
                      {products.map((p) => (
                        <option key={p.id} value={p.sku}>
                          {p.name} ({p.sku})
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
                        checked={settings.auto_deliver}
                        onChange={() => saveSettings({ auto_deliver: !settings.auto_deliver })}
                      />
                      <span>{t.autoDeliver}</span>
                    </label>
                    <button type="button" className="staff-primary" onClick={importKeys} disabled={busy}>
                      {t.importKeys}
                    </button>
                  </div>
                </div>

                <div className="staff-card">
                  <h2>{t.deliveryRules}</h2>
                  <div className="staff-toggle-list">
                    {deliveryRules.map((r) => (
                      <div key={r.key} className="staff-toggle-row">
                        <div>
                          <div className="staff-row-title">{r.title}</div>
                          <div className="staff-hint">{r.body}</div>
                        </div>
                        <button
                          type="button"
                          className={`staff-chip ${settings[r.key] ? 'on' : ''}`}
                          onClick={() =>
                            saveSettings({ [r.key]: !settings[r.key] } as Partial<StoreSettings>)
                          }
                        >
                          {settings[r.key] ? t.on : t.off}
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
                      <div className="staff-mono" title={k.key_value}>
                        {maskKey(k.key_value)}
                      </div>
                      <div>{k.product_sku}</div>
                      <div>{t.keyStatus[k.status as keyof typeof t.keyStatus] || k.status}</div>
                      <div>{k.assigned_to || '—'}</div>
                      <button type="button" className="staff-danger" onClick={() => removeKey(k.id)}>
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
                    .replace('{sum}', money(paidCents, 'USD'))}
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
                  filteredTx.map((x) => {
                    const refunded = String(x.status).includes('refund');
                    const paid = ['paid', 'completed', 'billed'].includes(x.status);
                    return (
                      <div key={x.transaction_id} className="staff-table-row staff-cols-tx">
                        <div className="staff-mono" title={x.transaction_id}>
                          {x.transaction_id}
                        </div>
                        <div className="staff-mono" title={x.customer_id || ''}>
                          {x.customer_id || '—'}
                        </div>
                        <div>{labelForPrice(x.price_id, t)}</div>
                        <div className="staff-amount">{money(x.total_cents, x.currency)}</div>
                        <div>{t.txStatus[x.status as keyof typeof t.txStatus] || x.status}</div>
                        <div>{x.created_at ? new Date(x.created_at).toLocaleString() : '—'}</div>
                        <div className="staff-tx-actions">
                          {refunded || !paid ? null : (
                            <button
                              type="button"
                              className="staff-danger"
                              disabled={busy}
                              onClick={() => refundTx(x.transaction_id)}
                            >
                              {t.refund}
                            </button>
                          )}
                          <button
                            type="button"
                            className="staff-chip"
                            disabled={busy || refunded}
                            onClick={() => resendKey(x.transaction_id)}
                          >
                            {t.resend}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : null}

          {section === 5 ? (
            <div className="staff-rise staff-settings-grid">
              <div className="staff-card">
                <h2>{t.storeSettings}</h2>
                <div className="staff-toggle-list">
                  {settingToggles.map((row) => (
                    <div key={row.key} className="staff-toggle-row">
                      <div>
                        <div className="staff-row-title">{row.title}</div>
                        <div className="staff-hint">{row.body}</div>
                      </div>
                      <button
                        type="button"
                        className={`staff-chip ${settings[row.key] ? 'on' : ''}`}
                        onClick={() =>
                          saveSettings({ [row.key]: !settings[row.key] } as Partial<StoreSettings>)
                        }
                      >
                        {settings[row.key] ? t.on : t.off}
                      </button>
                    </div>
                  ))}
                </div>
                <label className="staff-block-label">
                  <span>{t.serverSlots}</span>
                  <input
                    type="number"
                    min={1}
                    value={settings.server_slots}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        server_slots: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                    onBlur={() => saveSettings({ server_slots: settings.server_slots })}
                  />
                </label>
              </div>
              <div className="staff-card">
                <h2>{t.staffAccess}</h2>
                <div className="staff-members">
                  {staffMembers.length === 0 ? (
                    <p className="staff-empty">{t.noStaffYet}</p>
                  ) : (
                    staffMembers.map((m) => (
                      <div key={m.id} className="staff-member">
                        <div className="staff-member-av">
                          {(m.display_name || m.email || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="staff-member-meta">
                          <div className="staff-row-title">
                            {m.display_name || m.email || m.id.slice(0, 8)}
                          </div>
                          <div className="staff-hint">{m.email || m.id}</div>
                        </div>
                        <div className="staff-member-tag">{t.staffTag}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
