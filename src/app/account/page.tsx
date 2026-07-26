import type { Metadata } from 'next';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { PortalButton } from '@/components/PortalButton';
import { createClient } from '@/utils/supabase/server';
import { subscriptionGrantsAccess } from '@/lib/paddle/access';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Account — Shady' };

/**
 * Account / billing self-service.
 * Portal session is minted server-side from the signed-in user's linked Paddle customer.
 */
export default async function AccountPage() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login?next=/account');

  await supabase.rpc('link_my_paddle_customer');

  const { data: customer } = await supabase
    .from('customers')
    .select('customer_id, email')
    .eq('user_id', user.id)
    .maybeSingle();

  const { data: subscriptions } = customer
    ? await supabase
        .from('subscriptions')
        .select('subscription_id, status, price_id, scheduled_change_action')
        .eq('customer_id', customer.customer_id)
        .order('updated_at', { ascending: false })
    : { data: [] as never[] };

  const hasAccess = (subscriptions ?? []).some((s) =>
    subscriptionGrantsAccess(s.status)
  );

  return (
    <>
      <SiteHeader />
      <main className="dash-page">
        <header className="dash-hero" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <p className="kicker">Billing</p>
            <h1>Account</h1>
            <p className="lede left">
              Update payment method, cancel, or download invoices in the Paddle-hosted customer
              portal. Your customer ID is resolved from your signed-in session — never from the
              browser.
            </p>
            <div className="dash-actions">
              {customer ? (
                <PortalButton />
              ) : (
                <Link href="/pricing" className="gold-btn">
                  Subscribe first
                </Link>
              )}
              <Link href="/dashboard" className="ghost-btn">
                Dashboard
              </Link>
            </div>
          </div>
        </header>

        <section className="dash-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <article>
            <h2>Signed in</h2>
            <dl>
              <div>
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div>
                <dt>Paddle customer</dt>
                <dd>{customer?.customer_id ?? 'Not linked yet'}</dd>
              </div>
              <div>
                <dt>Access</dt>
                <dd>{hasAccess ? 'Active' : 'No paid access'}</dd>
              </div>
            </dl>
          </article>
          <article>
            <h2>Subscriptions</h2>
            {(subscriptions ?? []).length === 0 ? (
              <p className="empty">None mirrored yet.</p>
            ) : (
              <ul className="stack-list">
                {(subscriptions ?? []).map((s) => (
                  <li key={s.subscription_id}>
                    <code>{s.subscription_id}</code>
                    <span>{s.status}</span>
                    {s.scheduled_change_action ? (
                      <span className="muted">
                        scheduled: {s.scheduled_change_action} (access unchanged until status
                        changes)
                      </span>
                    ) : null}
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
