import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { getPaddleServer } from '@/lib/paddle/server';

export const dynamic = 'force-dynamic';

/**
 * Mint a Paddle customer portal session for the signed-in user.
 * Customer ID is resolved server-side — never trusted from the client.
 */
export async function POST() {
  const jar = await cookies();
  const supabase = createClient(jar);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Link paddle customer by email if not yet linked
  await supabase.rpc('link_my_paddle_customer');

  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (customerError) {
    return NextResponse.json({ error: customerError.message }, { status: 500 });
  }
  if (!customer?.customer_id) {
    return NextResponse.json(
      { error: 'No Paddle customer linked to this account yet. Subscribe first.' },
      { status: 404 }
    );
  }

  const { data: subs } = await supabase
    .from('subscriptions')
    .select('subscription_id')
    .eq('customer_id', customer.customer_id);

  const subscriptionIds = (subs ?? []).map((s) => s.subscription_id);

  try {
    const paddle = getPaddleServer();
    const session = await paddle.customerPortalSessions.create(
      customer.customer_id,
      subscriptionIds
    );
    const url = session.urls.general.overview;
    return NextResponse.json({ url });
  } catch (err) {
    console.error('[portal] failed', err);
    return NextResponse.json({ error: 'Could not open billing portal' }, { status: 502 });
  }
}
