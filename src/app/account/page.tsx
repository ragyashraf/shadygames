import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SiteHeader } from '@/components/SiteHeader';
import { AccountView } from '@/components/DashViews';
import { createClient } from '@/utils/supabase/server';
import { subscriptionGrantsAccess } from '@/lib/paddle/access';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Account — Shady' };

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
      <AccountView
        email={user.email ?? ''}
        paddleCustomerId={customer?.customer_id ?? null}
        hasAccess={hasAccess}
        subscriptions={subscriptions ?? []}
      />
    </>
  );
}
