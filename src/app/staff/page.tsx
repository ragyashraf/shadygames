import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { StaffDashboard } from '@/components/StaffDashboard';
import './staff.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Staff — Shady' };

export default async function StaffPage() {
  const jar = await cookies();
  const supabase = createClient(jar);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_staff, display_name')
    .eq('id', user.id)
    .maybeSingle();

  if (!profile?.is_staff) redirect('/dashboard');

  const [
    { data: products },
    { data: codes },
    { data: keys },
    { data: transactions },
    { count: activeSubs },
  ] = await Promise.all([
    supabase.from('products').select('*').order('sort_order'),
    supabase.from('discount_codes').select('*').order('code'),
    supabase
      .from('access_keys')
      .select('id, key_value, product_sku, status, assigned_to, transaction_id')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('transactions')
      .select(
        'transaction_id, customer_id, status, total_cents, currency, price_id, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(50),
    supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'trialing', 'past_due']),
  ]);

  return (
    <StaffDashboard
      ownerName={profile.display_name || user.email || 'Shady'}
      products={products ?? []}
      codes={codes ?? []}
      keys={keys ?? []}
      transactions={transactions ?? []}
      activeSubs={activeSubs ?? 0}
    />
  );
}
