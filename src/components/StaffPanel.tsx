'use client';

type Product = {
  id: string;
  sku: string;
  name: string;
  kind: string;
  price_usd: number;
  paddle_price_id_month: string | null;
  paddle_price_id_year: string | null;
  live: boolean;
  stock: number | null;
};

type Code = {
  id: string;
  code: string;
  percent: number;
  max_uses: number | null;
  used_count: number;
  active: boolean;
  paddle_discount_id: string | null;
};

type KeyRow = {
  id: string;
  key_value: string;
  product_sku: string;
  status: string;
  assigned_to: string | null;
  transaction_id: string | null;
};

type Tx = {
  transaction_id: string;
  customer_id: string | null;
  status: string;
  total_cents: number | null;
  currency: string | null;
  price_id: string | null;
};

export function StaffPanel({
  products,
  codes,
  keys,
  transactions,
}: {
  products: Product[];
  codes: Code[];
  keys: KeyRow[];
  transactions: Tx[];
}) {
  return (
    <div className="staff-grid">
      <section>
        <h2>Products ({products.length})</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>USD</th>
                <th>Month price</th>
                <th>Year price</th>
                <th>Live</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>${Number(p.price_usd).toFixed(2)}</td>
                  <td>
                    <code>{p.paddle_price_id_month ?? '—'}</code>
                  </td>
                  <td>
                    <code>{p.paddle_price_id_year ?? '—'}</code>
                  </td>
                  <td>{p.live ? 'yes' : 'no'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Discounts ({codes.length})</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>%</th>
                <th>Uses</th>
                <th>Active</th>
                <th>Paddle ID</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.percent}</td>
                  <td>
                    {c.used_count}
                    {c.max_uses != null ? ` / ${c.max_uses}` : ''}
                  </td>
                  <td>{c.active ? 'yes' : 'no'}</td>
                  <td>
                    <code>{c.paddle_discount_id ?? '—'}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Access keys ({keys.length})</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Key</th>
                <th>SKU</th>
                <th>Status</th>
                <th>Assigned</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k.id}>
                  <td>
                    <code>{k.key_value}</code>
                  </td>
                  <td>{k.product_sku}</td>
                  <td>{k.status}</td>
                  <td>{k.assigned_to ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2>Recent transactions ({transactions.length})</h2>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Status</th>
                <th>Total</th>
                <th>Customer</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.transaction_id}>
                  <td>
                    <code>{t.transaction_id}</code>
                  </td>
                  <td>{t.status}</td>
                  <td>
                    {t.total_cents != null
                      ? `${(t.total_cents / 100).toFixed(2)} ${t.currency ?? ''}`
                      : '—'}
                  </td>
                  <td>
                    <code>{t.customer_id ?? '—'}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
