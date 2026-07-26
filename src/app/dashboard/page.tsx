import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { DashboardView } from '@/components/DashViews';
import { createClient } from '@/utils/supabase/server';
import { subscriptionGrantsAccess } from '@/lib/paddle/access';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Dashboard — Shady' };

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

  return (
    <>
      <SiteHeader />
      <DashboardView
        email={user.email ?? ''}
        displayName={profile?.display_name ?? null}
        discord={profile?.discord ?? null}
        paddleCustomerId={customer?.customer_id ?? null}
        hasAccess={Boolean(active)}
        activePriceId={active?.price_id ?? null}
        subscriptions={subscriptions ?? []}
        keys={keys ?? []}
      />
    </>
  );
}
