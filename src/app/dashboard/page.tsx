import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { PortalButton } from '@/components/PortalButton';
import { createClient } from '@/utils/supabase/server';
import { subscriptionGrantsAccess } from '@/lib/paddle/access';
import { getTiers } from '@/lib/tiers';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Dashboard — Shady' };

function tierNameForPrice(priceId: string): string {
  const tiers = getTiers();
  for (const t of tiers) {
    if (t.priceId.month === priceId || t.priceId.year === priceId) return t.name;
  }
  return 'Unlimited';
}

export default async function DashboardPage() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  await supabase.rpc('link_my_paddle_customer');

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, email, discord, is_staff')
    .eq('id', user.id)
    .maybeSingle();

  const { data: customer } = await supabase
    .from('customers')
    .select('customer_id, email')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: subscriptions } = customer
    ? await supabase
        .from('subscriptions')
        .select(
          'subscription_id, status, price_id, product_id, scheduled_change_action, current_period_end'
        )
        .eq('customer_id', customer.customer_id)
        .order('updated_at', { ascending: false })
    : { data: [] as never[] };

  const { data: keys } = customer
    ? await supabase
        .from('access_keys')
        .select('key_value, product_sku, status, transaction_id')
        .eq('customer_id', customer.customer_id)
        .order('updated_at', { ascending: false })
    : { data: [] as never[] };

  const active = (subscriptions ?? []).find((s) => subscriptionGrantsAccess(s.status));
  const hasAccess = Boolean(active);

  return (
    <>
      <SiteHeader />
      <main className="dash-page">
        <header className="dash-hero">
          <div>
            <p className={`status-pill ${hasAccess ? 'on' : 'off'}`}>
              {hasAccess ? 'Subscription active' : 'No active subscription'}
            </p>
            <h1>{active ? tierNameForPrice(active.price_id) : 'Your dashboard'}</h1>
            <p className="lede left">
              Welcome{profile?.display_name ? `, ${profile.display_name}` : ''}. Manage billing in
              the Paddle portal — cancel, invoices, and payment methods live there.
            </p>
            <div className="dash-actions">
              {customer ? <PortalButton /> : null}
              <Link href="/pricing" className="ghost-btn">
                {hasAccess ? 'Change rank' : 'Choose a plan'}
              </Link>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="dash-crest" src="/shady-logo.webp" alt="" />
        </header>

        <section className="dash-grid">
          <article>
            <h2>Account</h2>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Discord</dt>
                <dd>{profile?.discord ?? '— (sign in with Discord to link)'}</dd>
              </div>
              <div>
                <dt>Paddle customer</dt>
                <dd>{customer?.customer_id ?? 'Not linked yet — subscribe with this email'}</dd>
              </div>
            </dl>
          </article>

          <article>
            <h2>Subscriptions</h2>
            {(subscriptions ?? []).length === 0 ? (
              <p className="empty">No mirrored subscriptions yet. After checkout, webhooks fill this in.</p>
            ) : (
              <ul className="stack-list">
                {(subscriptions ?? []).map((s) => (
                  <li key={s.subscription_id}>
                    <strong>{tierNameForPrice(s.price_id)}</strong>
                    <span>{s.status}</span>
                    {s.scheduled_change_action ? (
                      <span className="muted">scheduled: {s.scheduled_change_action}</span>
                    ) : null}
                    {s.current_period_end ? (
                      <span className="muted">
                        period ends {new Date(s.current_period_end).toLocaleDateString()}
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article>
            <h2>Access keys</h2>
            {(keys ?? []).length === 0 ? (
              <p className="empty">Keys appear here after a completed transaction.</p>
            ) : (
              <ul className="stack-list">
                {(keys ?? []).map((k) => (
                  <li key={k.key_value}>
                    <code>{k.key_value}</code>
                    <span>
                      {k.product_sku} · {k.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </section>
      </main>
    </>
  );
}
